// src/app/about/AboutPage.tsx
'use client';

// Imports remain the same: using explicit named imports and types
import { useEffect, useState, useRef, RefObject, FC, ReactNode } from 'react';
import styles from './AboutStyle.module.css';

// NEW IMPORTS: Next.js Image component and React Icons
import Image from 'next/image';
import { FaGavel, FaTruck, FaLock } from 'react-icons/fa';

// --- NEW TEAM DATA ---
const teamMembers = [
    { name: "Yara", role: "Full-Stack Developer", imagePath: "/pics/yara.png" },
    { name: "Ali", role: "Full-Stack Developer", imagePath: "/pics/ali.jpg" },
    { name: "Roya", role: "Front-End Developer", imagePath: "/pics/roya.jpg" },
    { name: "Ahmad", role: "Front-End Developer", imagePath: "/pics/ahmad.jpg" },
    { name: "Mohammad", role: "Front-End Developer", imagePath: "/pics/mohammad.jpg" },
];
// ---------------------


// --- Utility Components for Scroll Interaction ---

/**
 * Custom hook to handle Intersection Observer logic.
 */
const useIntersectionObserver = (
    ref: RefObject<HTMLDivElement | null>,
    options: IntersectionObserverInit = { threshold: 0.1 }
) => {
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsIntersecting(true);
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


// The Animated Section Component
const AnimatedSection: FC<{ children: ReactNode, className?: string }> = ({ children, className = "" }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useIntersectionObserver(ref);

    const visibilityClass = isVisible ? styles.isVisible : '';

    return (
        <div
            ref={ref}
            className={`${styles.animatedSection} ${visibilityClass} ${className}`}
        >
            {children}
        </div>
    );
};

// TextPlaceholder component refactored to use CSS Module
const TextPlaceholder: FC<{ children: ReactNode }> = ({ children }) => (
    <div className={styles.textPlaceholder}>
        {children}
    </div>
);

// Helper function to get the correct icon for the value card
const getValueCardIcon = (title: string) => {
    switch (title) {
        case 'Live Bidding':
            return <FaGavel className={styles.valueIcon} />;
        case 'Managed Logistics':
            return <FaTruck className={styles.valueIcon} />;
        case 'Trust & Security':
            return <FaLock className={styles.valueIcon} />;
        default:
            return null;
    }
}

// --- Main AboutPage Component ---

const AboutPage: FC = () => {

    return (
        <main className={styles.mainContainer}>

            {/* 1. Hero Section (Appears immediately) */}
            <div className={styles.animatedSection + ' ' + styles.isVisible}>
                <section id="hero" className={`${styles.sectionContainer} ${styles.heroSection}`}>
                    <div className={styles.contentContainer}>
                        <h1 className={styles.heroTitle}>
                            The Future of Premium Digital Commerce
                        </h1>
                        <p className={styles.heroSubtitle}>
                            Redefining premium auction experiences with unwavering trust, transparency, and next-generation technology.
                        </p>

                        {/* HERO IMAGE IMPLEMENTATION */}
                        <div className={styles.heroImagePlaceholder}>
                            <Image
                                src="/pics/hero.png"
                                alt="Image representing Gainvestor's core business"
                                layout="fill"
                                objectFit="cover"
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* 2. Mission Statement (Scroll Interaction) */}
            <AnimatedSection className={styles.secondarySection}>
                <section id="mission" className={styles.sectionContainer}>
                    <div className={styles.contentContainer}>
                        <h2 className={styles.sectionTitle}>Our Mission</h2>
                        <TextPlaceholder>
                            Our mission is to build the most trustworthy and seamless digital auction platform, empowering both sellers and buyers with cutting-edge technology and managed logistics.
                        </TextPlaceholder>
                    </div>
                </section>
            </AnimatedSection>

            {/* 3. Vision Section (Scroll Interaction) */}
            <AnimatedSection>
                <section id="vision" className={styles.sectionContainer}>
                    <div className={styles.contentContainer}>
                        <h2 className={styles.sectionTitle}>Our Vision</h2>
                        <TextPlaceholder>
                            To be the global benchmark for premium online auctions, recognized for our commitment to transparent processes, real-time engagement, and reliable managed delivery (Ahmad Delivery).
                        </TextPlaceholder>
                    </div>
                </section>
            </AnimatedSection>

            {/* 4. Platform Value / What We Do (Scroll Interaction) */}
            <AnimatedSection className={styles.secondarySection}>
                <section id="value" className={styles.sectionContainer}>
                    <div className={styles.contentContainer}>
                        <h2 className={styles.sectionTitle} style={{ marginBottom: '4rem' }}>
                            Platform Value & Key Features
                        </h2>
                        <div className={styles.valueGrid}>

                            {/* Cards use module classes for styling and hover effects */}
                            {['Live Bidding', 'Managed Logistics', 'Trust & Security'].map((title, index) => (
                                <div key={index} className={styles.valueCard}>
                                    {/* ICON IMPLEMENTATION */}
                                    {getValueCardIcon(title)}

                                    <h3 className={styles.cardTitle}>{title}</h3>
                                    <p className={styles.cardBody}>
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

            {/* 5. Team Section (Scroll Interaction) */}
            <AnimatedSection>
                <section id="team" className={styles.sectionContainer}>
                    <h2 className={styles.sectionTitle} style={{ marginBottom: '4rem' }}>
                        Meet Our Dedicated Team
                    </h2>
                    {/* ID added for the Meet The Team button to link to */}
                    <div className={styles.teamList} id="team-section">
                        {/* DYNAMIC TEAM MEMBER RENDERING */}
                        {teamMembers.map((member) => (
                            // Team member wrapper uses module class
                            <div key={member.name} className={styles.teamMember}>
                                {/* Team Image Container uses module class */}
                                <div className={styles.teamImageContainer}>
                                    {/* IMAGE IMPLEMENTATION */}
                                    <Image
                                        src={member.imagePath}
                                        alt={`Picture of ${member.name}`}
                                        width={150}
                                        height={150}
                                        style={{ objectFit: "cover", width: '100%', height: '100%' }}
                                    />
                                </div>
                                <h3 className={styles.teamName}>{member.name}</h3>
                                <p className={styles.teamRole}>{member.role}</p>
                            </div>
                        ))}
                    </div>

                    {/* --- MOVED BUTTON: Now wrapped for centering via CSS Module --- */}
                    <div className={styles.teamButtonWrapper}>
                        <a href="#team-section" className={styles.teamButton}>
                            Meet The Team
                        </a>
                    </div>
                </section>
            </AnimatedSection>

        </main>
    );
};

export default AboutPage;