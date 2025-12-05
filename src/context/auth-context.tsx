// src/context/auth-context.tsx
"use client";

/**
 * GLOBAL AUTH CONTEXT
 * ------------------------------------------------------------
 * PURPOSE:
 * The global authentication state for the entire website.
 *
 * It automatically:
 *  - Loads the authenticated user on initial page load
 *  - Stores user, loading, isAuthenticated
 *  - Fetches user from:
 *        /api/auth/me      → basic user { id, email, role }
 *        /api/profile/me   → profile details
 *  - Handles expired / missing sessions
 *  - Provides methods:
 *        setUser(), refreshSession(), logout()
 *
 * WHAT THIS GIVES TO YOUR WEBSITE:
 *  - Every component can instantly know if the user is logged in
 *  - Prevents "flash of unauthenticated" UI
 *  - Syncs login/logout across pages
 *  - Easy to access: const { user, isAuthenticated } = useAuthContext();
 */

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import type { ProfileDTO } from "@/utils/dto";

// Role for clarity
type Role = "USER" | "ADMIN";

// Main auth user model stored in context
export type AuthUser = {
    id: string;
    email: string;
    role: Role;
    profile?: ProfileDTO | null;
};

// Values available inside the context for all components
type AuthContextValue = {
    user: AuthUser | null;
    loading: boolean;
    isAuthenticated: boolean;
    setUser: (user: AuthUser | null) => void;
    refreshSession: () => Promise<void>; // Reload session from backend
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // True until first session check completes

    /**
     * refreshSession()
     * --------------------------------------------------
     * Called:
     *  - On initial page load
     *  - After login
     *  - After profile update
     *
     * Fetches:
     * 1) /api/auth/me       → basic user (must exist)
     * 2) /api/profile/me    → profile details (optional)
     */
    const refreshSession = useCallback(async () => {
        try {
            setLoading(true);

            // --- 1) Load the basic authenticated user ---
            const meRes = await fetch("/api/auth/me", {
                credentials: "include",
            });

            if (!meRes.ok) {
                // No session or invalid token
                setUser(null);
                return;
            }

            const meData = await meRes.json(); // { id, email, role }

            // --- 2) Load profile details ---
            let profile: ProfileDTO | null = null;

            const profileRes = await fetch("/api/profile/me", {
                credentials: "include",
            });

            // If user has a profile, attach it
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                profile = profileData.profile ?? null;
            }
            // If no profile exists → leave as null (valid scenario)

            // --- 3) Merge both responses ---
            setUser({
                id: meData.id,
                email: meData.email,
                role: meData.role,
                profile,
            });
        } catch (err) {
            console.error("refreshSession error:", err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * INITIAL LOAD:
     * --------------------------------------------------
     * When the website loads, immediately try to restore
     * user session from cookies.
     */
    useEffect(() => {
        void refreshSession();
    }, [refreshSession]);

    /**
     * logout()
     * --------------------------------------------------
     * Calls /api/auth/logout to clear the auth cookie
     * Then removes local user state.
     */
    const logout = useCallback(async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch (err) {
            console.error("logout error:", err);
        } finally {
            setUser(null); // Clear front-end state
        }
    }, []);

    // Values exposed to the entire app
    const value: AuthContextValue = {
        user,
        loading,
        isAuthenticated: !!user,
        setUser,
        refreshSession,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuthContext()
 * --------------------------------------------------
 * Hook for accessing authentication state anywhere:
 *
 * const { user, isAuthenticated, loading, logout } = useAuthContext();
 *
 */
export function useAuthContext(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return ctx;
}
