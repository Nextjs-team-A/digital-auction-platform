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
import { useAuth } from "@/hooks/useAuth";

// Animation state for stars
const animationState = {
  w: 0,
  h: 0,
  dpr: 1,
  reducedMotion: false,
  pointer: {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    active: false,
    down: false,
    lastX: 0,
    lastY: 0,
  },
};

class Star {
  private c: CanvasRenderingContext2D;
  layer: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;

  constructor(ctx: CanvasRenderingContext2D, layer: number) {
    this.c = ctx;
    this.layer = layer;
    this.x = Math.random() * animationState.w;
    this.y = Math.random() * animationState.h;

    const baseSpeed = layer === 0 ? 0.05 : layer === 1 ? 0.09 : 0.13;
    this.vx = (Math.random() - 0.5) * baseSpeed;
    this.vy = (Math.random() - 0.5) * baseSpeed;

    const baseR = layer === 0 ? 0.7 : layer === 1 ? 1.0 : 1.4;
    this.r = baseR + Math.random() * 0.9;

    this.a =
      (layer === 0 ? 0.12 : layer === 1 ? 0.16 : 0.22) + Math.random() * 0.12;
  }

  step() {
    if (animationState.reducedMotion) return;

    this.x += this.vx;
    this.y += this.vy;

    if (animationState.pointer.active) {
      const dx = animationState.pointer.x - this.x;
      const dy = animationState.pointer.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const pullRadius = 260;

      if (dist < pullRadius) {
        const closeness = 1 - dist / pullRadius;
        const pull = (animationState.pointer.down ? 0.18 : 0.08) * closeness;
        const layerBoost =
          this.layer === 2 ? 1.25 : this.layer === 1 ? 1.0 : 0.75;

        this.vx += (dx / dist) * pull * layerBoost;
        this.vy += (dy / dist) * pull * layerBoost;

        this.vx += animationState.pointer.vx * 0.012 * layerBoost;
        this.vy += animationState.pointer.vy * 0.012 * layerBoost;
      }
    }

    this.vx *= 0.985;
    this.vy *= 0.985;

    if (this.x < -30) this.x = animationState.w + 30;
    if (this.x > animationState.w + 30) this.x = -30;
    if (this.y < -30) this.y = animationState.h + 30;
    if (this.y > animationState.h + 30) this.y = -30;
  }

  draw() {
    this.c.save();
    this.c.globalAlpha = this.a;
    this.c.fillStyle = "rgba(15, 23, 42, 0.90)";
    this.c.beginPath();
    this.c.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    this.c.fill();
    this.c.restore();
  }
}

class ShootingStar {
  private c: CanvasRenderingContext2D;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  len: number;

  constructor(ctx: CanvasRenderingContext2D) {
    this.c = ctx;
    const fromLeft = Math.random() < 0.5;
    this.x = fromLeft ? -80 : Math.random() * animationState.w;
    this.y = fromLeft ? Math.random() * (animationState.h * 0.55) : -80;

    const speed = 9 + Math.random() * 6;
    const angle = (Math.PI * (35 + Math.random() * 20)) / 180;

    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    this.maxLife = 55 + Math.random() * 35;
    this.life = this.maxLife;
    this.len = 120 + Math.random() * 140;
  }

  step() {
    if (animationState.reducedMotion) return;
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 1;
  }

  draw() {
    const t = this.life / this.maxLife;
    if (t <= 0) return;

    const x2 = this.x - (this.vx / 12) * this.len;
    const y2 = this.y - (this.vy / 12) * this.len;

    this.c.save();
    this.c.globalAlpha = 0.55 * t;

    const grad = this.c.createLinearGradient(this.x, this.y, x2, y2);
    grad.addColorStop(0, "rgba(16,185,129,0.0)");
    grad.addColorStop(0.45, "rgba(16,185,129,0.35)");
    grad.addColorStop(1, "rgba(15,23,42,0.55)");

    this.c.strokeStyle = grad;
    this.c.lineWidth = 2;
    this.c.beginPath();
    this.c.moveTo(this.x, this.y);
    this.c.lineTo(x2, y2);
    this.c.stroke();

    this.c.globalAlpha = 0.7 * t;
    this.c.fillStyle = "rgba(15,23,42,1)";
    this.c.beginPath();
    this.c.arc(this.x, this.y, 1.7, 0, Math.PI * 2);
    this.c.fill();

    this.c.restore();
  }
}

// Team Members Data
const teamMembers = [
  {
    name: "Roya",
    role: " Front-End Developer",
    imagePath: "/images/team/royakais_v2.png",
  },
  {
    name: "Ali",
    role: "Full-Stack Developer",
    imagePath: "/images/team/alichoker.jpeg",
  },
  {
    name: "Yara",
    role: "Full-Stack Developer",
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
    imagePath: "/images/team/Mohamad.jpeg",
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
    color: "rgba(16, 185, 129, 0.1)",
  },
  {
    icon: FaTruck,
    title: "Managed Logistics",
    description:
      "Secure, integrated delivery and payment collection facilitated through our trusted partner, Ahmad Delivery.",
    color: "rgba(16, 185, 129, 0.1)",
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
  const { isAuthenticated } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [mounted] = useState(true);

  // Canvas animation (same as home page)
  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    animationState.dpr = Math.min(window.devicePixelRatio || 1, 2);
    animationState.reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const resize = () => {
      animationState.w = window.innerWidth;
      animationState.h = window.innerHeight;

      if (!animationState.w || !animationState.h) return false;

      canvas.width = Math.floor(animationState.w * animationState.dpr);
      canvas.height = Math.floor(animationState.h * animationState.dpr);
      ctx.setTransform(animationState.dpr, 0, 0, animationState.dpr, 0, 0);

      ctx.clearRect(0, 0, animationState.w, animationState.h);
      return true;
    };

    const stars: Star[] = [];
    let shooters: ShootingStar[] = [];
    let shootCooldown = 0;
    let raf = 0;

    const buildStars = () => {
      stars.length = 0;
      const area = animationState.w * animationState.h;
      const base = Math.max(120, Math.min(280, Math.floor(area / 14000)));

      const far = Math.floor(base * 0.42);
      const mid = Math.floor(base * 0.36);
      const near = base - far - mid;

      for (let i = 0; i < far; i++) stars.push(new Star(ctx, 0));
      for (let i = 0; i < mid; i++) stars.push(new Star(ctx, 1));
      for (let i = 0; i < near; i++) stars.push(new Star(ctx, 2));
    };

    const drawConnections = () => {
      const connect = stars.filter((s) => s.layer >= 1);
      for (let i = 0; i < connect.length; i++) {
        for (let j = i + 1; j < connect.length; j++) {
          const a = connect[i];
          const b = connect[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);

          const max = 170;
          if (d < max) {
            const alpha = 0.1 * (1 - d / max);
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      const dx = x - animationState.pointer.lastX;
      const dy = y - animationState.pointer.lastY;

      animationState.pointer.vx = dx;
      animationState.pointer.vy = dy;
      animationState.pointer.lastX = x;
      animationState.pointer.lastY = y;

      animationState.pointer.x = x;
      animationState.pointer.y = y;
      animationState.pointer.active = true;
    };

    const onPointerDown = () => {
      animationState.pointer.down = true;
      animationState.pointer.active = true;

      if (!animationState.reducedMotion) {
        shooters.push(new ShootingStar(ctx));
        if (shooters.length > 7) shooters.shift();
      }
    };

    const onPointerUp = () => (animationState.pointer.down = false);

    const onPointerLeave = () => {
      animationState.pointer.active = false;
      animationState.pointer.down = false;
      animationState.pointer.vx = 0;
      animationState.pointer.vy = 0;
    };

    const loop = () => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
      ctx.fillRect(0, 0, animationState.w, animationState.h);

      for (const s of stars) {
        s.step();
        s.draw();
      }

      if (!animationState.reducedMotion) {
        shootCooldown -= 1;
        if (shootCooldown <= 0) {
          if (Math.random() < 0.45) {
            shooters.push(new ShootingStar(ctx));
            if (shooters.length > 7) shooters.shift();
          }
          shootCooldown = 50 + Math.floor(Math.random() * 70);
        }

        shooters.forEach((sh) => sh.step());
        shooters = shooters.filter((sh) => sh.life > 0);
        shooters.forEach((sh) => sh.draw());
      }

      drawConnections();

      animationState.pointer.vx *= 0.85;
      animationState.pointer.vy *= 0.85;

      raf = requestAnimationFrame(loop);
    };

    const onResize = () => {
      if (resize()) buildStars();
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });

    requestAnimationFrame(() => {
      if (resize()) {
        buildStars();
        loop();
      }
    });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      window.removeEventListener("pointerleave", onPointerLeave);
      cancelAnimationFrame(raf);
    };
  }, [mounted]);

  return (
    <main className={styles.mainContainer}>
      {/* Animated Background Gradient */}
      <div className={styles.bgGradient} aria-hidden="true" />

      {/* Animated Stars Canvas */}
      {mounted && (
        <canvas ref={canvasRef} className={styles.starsBg} aria-hidden="true" />
      )}

      {/* Content Wrapper */}
      <div className={styles.content}>
        {/* Hero Section */}
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
                  Unlimited tenders
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
                  src="/images/hero/hero6.jpeg"
                  alt="Digital Auction Platform"
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
                Our mission is to build the most trustworthy and seamless
                digital auction platform, empowering both sellers and buyers
                with cutting-edge technology and managed logistics that set new
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
                To be the global benchmark for premium online auctions,
                recognized for our commitment to transparent processes,
                real-time engagement, and reliable managed delivery through
                Ahmad Delivery partnerships.
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
        {!isAuthenticated && (
          <AnimatedSection className={styles.ctaSection}>
            <div className={styles.ctaContainer}>
              <div className={styles.ctaContent}>
                <h2 className={styles.ctaTitle}>
                  Ready to Experience the Future?
                </h2>
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
        )}
      </div>
    </main>
  );
};

export default AboutPage;
