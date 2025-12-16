"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Contact.module.css";
import {
  FaPaperPlane,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

// Reuse Star and ShootingStar classes from home page
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

export default function ContactClient() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => setMounted(true), []);

  // Scroll animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.isVisible);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(`.${styles.animatedSection}`).forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ subject, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send message");
        return;
      }

      setSuccess("Your message has been sent successfully!");
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.mainContainer}>
      {/* Background gradient animation */}
      <div className={styles.bgGradient} aria-hidden="true" />

      {/* Animated stars canvas */}
      {mounted && (
        <canvas ref={canvasRef} className={styles.starsBg} aria-hidden="true" />
      )}

      {/* Content wrapper */}
      <div className={styles.content}>
        {/* Hero Section */}
        <section className={`${styles.heroSection} ${styles.sectionContainer}`}>
          <div className={styles.contentContainer}>
            <div className={`${styles.heroContent} ${styles.animatedSection}`}>
              <div className={styles.heroBadge}>
                <FaEnvelope className={styles.badgeIcon} />
                <span>Get In Touch</span>
              </div>
              <h1 className={styles.heroTitle}>
                Let us Start a{" "}
                <span className={styles.gradientText}>Conversation</span>
              </h1>
              <p className={styles.heroSubtitle}>
                Have questions about our digital auction platform? We are here
                to help you succeed. Reach out and let us discuss how BidZone
                can transform your auction experience.
              </p>
            </div>
          </div>
        </section>

        {/* Main Contact Section */}
        <section
          className={`${styles.contactSection} ${styles.sectionContainer}`}
        >
          <div className={styles.contentContainer}>
            <div className={styles.contactGrid}>
              {/* Contact Form */}
              <div
                className={`${styles.formContainer} ${styles.animatedSection}`}
              >
                <div className={styles.formCard}>
                  <h2 className={styles.formTitle}>Send us a Message</h2>
                  <p className={styles.formSubtitle}>
                    Fill out the form below and we will get back to you within
                    24 hours.
                  </p>

                  {/* Status Messages */}
                  {error && (
                    <div className={styles.alertError}>
                      <FaExclamationCircle className={styles.alertIcon} />
                      <span>{error}</span>
                    </div>
                  )}
                  {success && (
                    <div className={styles.alertSuccess}>
                      <FaCheckCircle className={styles.alertIcon} />
                      <span>{success}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                      <label htmlFor="subject" className={styles.formLabel}>
                        Subject
                      </label>
                      <input
                        id="subject"
                        type="text"
                        className={styles.formInput}
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="What's this about?"
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="message" className={styles.formLabel}>
                        Message
                      </label>
                      <textarea
                        id="message"
                        className={styles.formTextarea}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        placeholder="Tell us more about your inquiry..."
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className={styles.spinner} />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane className={styles.buttonIcon} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Contact Information */}
              <div className={styles.infoContainer}>
                <div className={`${styles.infoCard} ${styles.animatedSection}`}>
                  <h3 className={styles.infoTitle}>Contact Information</h3>
                  <p className={styles.infoSubtitle}>
                    Reach us through any of these channels
                  </p>

                  <div className={styles.infoList}>
                    <div className={styles.infoItem}>
                      <div className={styles.infoIconWrapper}>
                        <FaEnvelope className={styles.infoIcon} />
                      </div>
                      <div>
                        <div className={styles.infoLabel}>Email</div>
                        <div className={styles.infoValue}>
                          support@bidzone.com
                        </div>
                      </div>
                    </div>

                    <div className={styles.infoItem}>
                      <div className={styles.infoIconWrapper}>
                        <FaPhone className={styles.infoIcon} />
                      </div>
                      <div>
                        <div className={styles.infoLabel}>Phone</div>
                        <div className={styles.infoValue}>
                          +1 (555) 123-4567
                        </div>
                      </div>
                    </div>

                    <div className={styles.infoItem}>
                      <div className={styles.infoIconWrapper}>
                        <FaMapMarkerAlt className={styles.infoIcon} />
                      </div>
                      <div>
                        <div className={styles.infoLabel}>Location</div>
                        <div className={styles.infoValue}>
                          123 Auction Street
                          <br />
                          Beirut, Lebanon
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.socialSection}>
                    <div className={styles.socialTitle}>Follow Us</div>
                    <div className={styles.socialLinks}>
                      <a href="#" className={styles.socialLink}>
                        <FaFacebook />
                      </a>
                      <a href="#" className={styles.socialLink}>
                        <FaTwitter />
                      </a>
                      <a href="#" className={styles.socialLink}>
                        <FaLinkedin />
                      </a>
                      <a href="#" className={styles.socialLink}>
                        <FaInstagram />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={`${styles.faqSection} ${styles.sectionContainer}`}>
          <div className={styles.contentContainer}>
            <div
              className={`${styles.sectionHeader} ${styles.animatedSection}`}
            >
              <div className={styles.sectionBadge}>FAQ</div>
              <h2 className={styles.sectionTitle}>
                Frequently Asked Questions
              </h2>
              <p className={styles.sectionSubtitle}>
                Quick answers to common questions
              </p>
            </div>

            <div className={styles.faqGrid}>
              {[
                {
                  q: "How do I create an auction?",
                  a: "Simply sign up, navigate to the 'Create Auction' section, and follow the step-by-step guide.",
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, PayPal, and bank transfers for verified accounts.",
                },
                {
                  q: "Is my data secure?",
                  a: "Yes, we use industry-standard encryption and security measures to protect your information.",
                },
                {
                  q: "How do I place a bid?",
                  a: "Browse available auctions, select an item, and click the 'Place Bid' button to submit your offer.",
                },
              ].map((faq, idx) => (
                <div
                  key={idx}
                  className={`${styles.faqCard} ${styles.animatedSection}`}
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <h4 className={styles.faqQuestion}>{faq.q}</h4>
                  <p className={styles.faqAnswer}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
