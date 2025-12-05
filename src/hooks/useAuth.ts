// src/hooks/useAuth.ts
import { useAuthContext } from "@/context/auth-context";

export function useAuth() {
    return useAuthContext();
}
