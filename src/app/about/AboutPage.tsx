'use client';

import React, { useEffect, useState, useRef } from 'react';

// --- Utility Components for Scroll Interaction and Styling ---

// Custom hook to handle Intersection Observer logic
const useIntersectionObserver = (
    ref: React.RefObject<HTMLElement>,
    options: IntersectionObserverInit = { threshold: 0.1 }
) => {
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsIntersecting(true);
                // Optional: Stop observing once it has appeared
                observer.unobserve(entry.target);
            }
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [ref, options]);

    return isIntersecting;
};


// The Animated Section Component now uses scroll interaction for appearance
const AnimatedSection: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useIntersectionObserver(ref);

    return (
        <div
            ref={ref}
            // Transition for both opacity and transform (translate-y)
            className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
        >
            {children}
        </div>
    );
};

const TextPlaceholder: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    // Responsive max-width and adjusted font size for mobile/desktop
    <div className="text-lg md:text-xl max-w-4xl mx-auto my-4 text-center px-4">
        {children}
    </div>
);

// --- Main AboutPage Component ---

const AboutPage = () => {
    // Use consistent classes for padding and container width
    const sectionPadding = "py-16 md:py-28 lg:py-36 px-4";
    const contentContainer = "max-w-7xl mx-auto";

    return (
        <main className="min-h-screen pt-16 pb-12 bg-[var(--background)] text-[var(--foreground)] font-sans">

            {/* 1. Hero Section (No observer on Hero, it appears immediately) */}
            <div className="transition-opacity duration-1000 ease-out">
                <section id="hero" className={`${sectionPadding} text-center`}>
                    <div className={contentContainer}>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight">
                            The Future of Premium Digital Commerce
                        </h1>
                        <p className="text-md sm:text-xl md:text-2xl opacity-70 mb-16 max-w-4xl mx-auto">
                            Redefining premium auction experiences with unwavering trust, transparency, and next-generation technology.
                        </p>
                        {/* Main Hero Image Placeholder (Responsive) */}
                        <div className="mx-auto w-full max-w-7xl aspect-[16/7] bg-gray-200/5 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center border border-gray-100/10">
                            <p className="text-gray-700/50 text-xl font-medium p-4">
                                [Placeholder for Responsive Hero Image]
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            {/* 2. Mission Statement (Scroll Interaction) */}
            <AnimatedSection>
                <section id="mission" className={`${sectionPadding} bg-gray-50/5`}>
                    <div className={contentContainer}>
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Our Mission</h2>
                        <TextPlaceholder>
                            Our mission is to build the most trustworthy and seamless digital auction platform, empowering both sellers and buyers with cutting-edge technology and managed logistics.
                        </TextPlaceholder>
                    </div>
                </section>
            </AnimatedSection>

            {/* 3. Vision Section (Scroll Interaction) */}
            <AnimatedSection>
                <section id="vision" className={`${sectionPadding}`}>
                    <div className={contentContainer}>
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">Our Vision</h2>
                        <TextPlaceholder>
                            To be the global benchmark for premium online auctions, recognized for our commitment to transparent processes, real-time engagement, and reliable managed delivery (Ahmad Delivery).
                        </TextPlaceholder>
                    </div>
                </section>
            </AnimatedSection>

            {/* 4. Platform Value / What We Do (Scroll Interaction, Responsive Grid and Hover Effects) */}
            <AnimatedSection>
                <section id="value" className={`${sectionPadding} bg-gray-50/5`}>
                    <div className={contentContainer}>
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Platform Value & Key Features</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 text-center">

                            {/* Cards retain their independent hover effects */}
                            {['Live Bidding', 'Managed Logistics', 'Trust & Security'].map((title, index) => (
                                // Applying slight delay to cards for staggered effect if they all appear at once
                                <div key={index} className="p-8 border rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] bg-white/5 backdrop-blur-sm">
                                    <h3 className="text-2xl font-semibold mb-3">{title}</h3>
                                    <p className="opacity-70 text-base">
                                        {
                                            title === 'Live Bidding' ?
                                                'Instant, transparent bidding powered by real-time technology (Socket.IO) for immediate updates on the product detail page.' :
                                                title === 'Managed Logistics' ?
                                                    'Secure, integrated delivery and payment collection facilitated through our trusted partner, Ahmad Delivery.' :
                                                    'A streamlined, secure process leveraging modern stack components (JWT, TypeScript, Next.js) for high reliability.'
                                        }
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </AnimatedSection>

            {/* Placeholder Team Section (Scroll Interaction, Responsive Flex and Hover Effects) */}
            <AnimatedSection>
                <section id="team" className={`${sectionPadding}`}>
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Meet Our Dedicated Team</h2>
                    <div className="flex justify-center flex-wrap gap-x-8 gap-y-12 max-w-6xl mx-auto">
                        {['Sarah', 'Omar', 'Lena', 'Karim'].map((name) => (
                            <div key={name} className="text-center group w-40 sm:w-48 transition-transform duration-300 hover:scale-105">
                                {/* Placeholder for team member image (Hover Effect) */}
                                <div className="w-32 h-32 sm:w-36 sm:h-36 mx-auto bg-gray-300 rounded-full mb-4 overflow-hidden border-4 border-transparent transition-all duration-300 group-hover:border-white/50 group-hover:shadow-xl">
                                    <p className="text-sm pt-12 text-gray-700">[Image]</p>
                                </div>
                                <h3 className="text-xl font-medium">{name}</h3>
                                <p className="text-sm opacity-70">Role Placeholder</p>
                            </div>
                        ))}
                    </div>
                </section>
            </AnimatedSection>

        </main>
    );
};

export default AboutPage;