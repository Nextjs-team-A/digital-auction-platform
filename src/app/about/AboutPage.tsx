// src/app/about/AboutPage.tsx
"use client";

import { useEffect, useState, useRef, RefObject, FC, ReactNode } from "react";
import styles from "./AboutStyle.module.css";
import Image from "next/image";
import {
  FaGavel,
  FaTruck,
  FaShieldAlt,
  FaChartLine,
  FaUsers,
  FaAward,
  FaRocket,
  FaGem,
  FaBolt,
} from "react-icons/fa";
import Link from "next/link";

// Team Members Data
const teamMembers = [
  {
    name: "Roya",
    role: "Full-Stack Developer",
    imagePath: "/images/team/royakais_v2.png",
  },
  {
    name: "Ali",
    role: "Full-Stack Developer",
    imagePath: "/images/team/alichoker.jpeg",
  },
  {
    name: "Yara",
    role: "Front-End Developer",
    imagePath: "/images/team/yaraelkassem.jpeg",
  },
  {
    name: "Ahmad",
    role: "Front-End Developer",
    imagePath: "/images/team/ahmadkaraki.jpeg",
  },
  {
    name: "Mohammad",
    role: "Front-End Developer",
    imagePath: "/images/team/ahmadkaraki.jpeg",
  },
];

// Stats Data
const stats = [
  { icon: FaChartLine, value: "99.9%", label: "Uptime Guarantee" },
  { icon: FaUsers, value: "50K+", label: "Active Users" },
  { icon: FaAward, value: "10K+", label: "Successful Auctions" },
  { icon: FaGem, value: "$10M+", label: "Transaction Volume" },
];

// Enhanced Value Cards Data
const valueCards = [
  {
    icon: FaGavel,
    title: "Live Bidding",
    description:
      "Instant, transparent bidding powered by real-time technology (Socket.IO) for immediate updates on the product detail page.",
    color: "rgba(255, 204, 0, 0.1)",
  },
  {
    icon: FaTruck,
    title: "Managed Logistics",
    description:
      "Secure, integrated delivery and payment collection facilitated through our trusted partner, Ahmad Delivery.",
    color: "rgba(59, 130, 246, 0.1)",
  },
  {
    icon: FaShieldAlt,
    title: "Trust & Security",
    description:
      "A streamlined, secure process leveraging modern stack components (JWT, TypeScript, Next.js) for high reliability.",
    color: "rgba(16, 185, 129, 0.1)",
  },
];

// Custom Hook: Intersection Observer
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

// Animated Section Component
const AnimatedSection: FC<{
  children: ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = "", delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref);

  return (
    <div
      ref={ref}
      className={`${styles.animatedSection} ${
        isVisible ? styles.isVisible : ""
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// Text Placeholder Component
const TextPlaceholder: FC<{ children: ReactNode }> = ({ children }) => (
  <div className={styles.textPlaceholder}>{children}</div>
);

// Main AboutPage Component
const AboutPage: FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <main className={styles.mainContainer}>
      {/* Animated Background Elements */}
      <div className={styles.backgroundGradient} />
      <div
        className={styles.cursorGlow}
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
        }}
      />

      {/* Hero Section */}
      <div className={`${styles.animatedSection} ${styles.isVisible}`}>
        <section
          id="hero"
          className={`${styles.sectionContainer} ${styles.heroSection}`}
        >
          <div className={styles.contentContainer}>
            <div className={styles.heroContent}>
              <div className={styles.heroBadge}>
                <FaRocket className={styles.badgeIcon} />
                <span>Pioneering Digital Auctions</span>
              </div>

              <h1 className={styles.heroTitle}>
                The Future of
                <span className={styles.gradientText}>
                  {" "}
                  Premium Digital Commerce
                </span>
              </h1>

              <p className={styles.heroSubtitle}>
                Redefining premium auction experiences with unwavering trust,
                transparency, and next-generation technology that empowers every
                transaction.
              </p>

              <div className={styles.heroButtons}>
                <button className={styles.primaryButton}>
                  Explore The digital world
                  <FaBolt className={styles.buttonIcon} />
                </button>
                <button className={styles.secondaryButton}>
                  Unlimited Auctions
                </button>
              </div>
            </div>

            <div className={styles.heroImageWrapper}>
              <div className={styles.heroImageGlow} />
              <div className={styles.heroImagePlaceholder}>
                <Image
                  src="/images/hero/hero.png"
                  alt="Gainvestor Platform"
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
              <div
                className={styles.floatingCard}
                style={{ top: "10%", left: "5%" }}
              >
                <FaGavel />
                <span>Live Auction</span>
              </div>
              <div
                className={styles.floatingCard}
                style={{ bottom: "15%", right: "8%" }}
              >
                <FaShieldAlt />
                <span>Secure</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Stats Section */}
      <AnimatedSection className={styles.statsSection} delay={100}>
        <div className={styles.statsContainer}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <stat.icon className={styles.statIcon} />
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </AnimatedSection>

      {/* Mission Section */}
      <AnimatedSection className={styles.secondarySection}>
        <section id="mission" className={styles.sectionContainer}>
          <div className={styles.contentContainer}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Our Mission</span>
              <h2 className={styles.sectionTitle}>
                Empowering Trust in Every Transaction
              </h2>
            </div>
            <TextPlaceholder>
              Our mission is to build the most trustworthy and seamless digital
              auction platform, empowering both sellers and buyers with
              cutting-edge technology and managed logistics that set new
              industry standards.
            </TextPlaceholder>
          </div>
        </section>
      </AnimatedSection>

      {/* Vision Section */}
      <AnimatedSection>
        <section id="vision" className={styles.sectionContainer}>
          <div className={styles.contentContainer}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Our Vision</span>
              <h2 className={styles.sectionTitle}>
                Global Benchmark for Excellence
              </h2>
            </div>
            <TextPlaceholder>
              To be the global benchmark for premium online auctions, recognized
              for our commitment to transparent processes, real-time engagement,
              and reliable managed delivery through Ahmad Delivery partnerships.
            </TextPlaceholder>
          </div>
        </section>
      </AnimatedSection>

      {/* Platform Value Section */}
      <AnimatedSection className={styles.secondarySection}>
        <section id="value" className={styles.sectionContainer}>
          <div className={styles.contentContainer}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Platform Excellence</span>
              <h2 className={styles.sectionTitle}>
                Revolutionizing Digital Auctions
              </h2>
            </div>

            <div className={styles.valueGrid}>
              {valueCards.map((card, index) => (
                <div
                  key={index}
                  className={styles.valueCard}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={styles.cardIconWrapper}
                    style={{ backgroundColor: card.color }}
                  >
                    <card.icon className={styles.valueIcon} />
                  </div>
                  <h3 className={styles.cardTitle}>{card.title}</h3>
                  <p className={styles.cardBody}>{card.description}</p>
                  <div className={styles.cardGlow} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Team Section */}
      <AnimatedSection>
        <section id="team" className={styles.sectionContainer}>
          <div className={styles.contentContainer}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionBadge}>Our Team</span>
              <h2 className={styles.sectionTitle}>Meet the Visionaries</h2>
              <p className={styles.sectionSubtitle}>
                Passionate experts driving innovation in digital commerce
              </p>
            </div>

            <div className={styles.teamList} id="team-section">
              {teamMembers.map((member, index) => (
                <div
                  key={member.name}
                  className={styles.teamMember}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={styles.teamImageContainer}>
                    <Image
                      src={member.imagePath}
                      alt={member.name}
                      width={150}
                      height={150}
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                      }}
                    />
                    <div className={styles.teamImageOverlay}>
                      <FaUsers className={styles.teamIcon} />
                    </div>
                  </div>
                  <h3 className={styles.teamName}>{member.name}</h3>
                  <p className={styles.teamRole}>{member.role}</p>
                  <div className={styles.teamSocial}>
                    <div className={styles.socialDot} />
                    <div className={styles.socialDot} />
                    <div className={styles.socialDot} />
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.teamButtonWrapper}>
              <Link href="/team" className={styles.teamButton}>
                <span>Meet the Team</span>
                <FaRocket className={styles.buttonIcon} />
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* CTA Section */}
      <AnimatedSection className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to Experience the Future?</h2>
            <p className={styles.ctaDescription}>
              Join thousands of satisfied users and discover a new era of
              digital auctions
            </p>
            <Link href="/register" className={styles.ctaButton}>
              Get Started Today
              <FaBolt className={styles.buttonIcon} />
            </Link>
          </div>
          <div className={styles.ctaGlow} />
        </div>
      </AnimatedSection>
    </main>
  );
};

export default AboutPage;
