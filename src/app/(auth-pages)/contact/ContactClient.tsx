"use client";

import { useState, useEffect } from "react";
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

export default function ContactClient() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Cursor glow effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
      {/* Background Effects */}
      <div className={styles.backgroundGradient} />
      <div
        className={styles.cursorGlow}
        style={{
          left: `${cursorPos.x}px`,
          top: `${cursorPos.y}px`,
        }}
      />

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
              Have questions about our digital auction platform? We are here to
              help you succeed. Reach out and let us discuss how BidZone can
              transform your auction experience.
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
                <div className={styles.cardGlow} />

                <h2 className={styles.formTitle}>Send us a Message</h2>
                <p className={styles.formSubtitle}>
                  Fill out the form below and we will get back to you within 24
                  hours.
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
                      <div className={styles.infoValue}>+1 (555) 123-4567</div>
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
          <div className={`${styles.sectionHeader} ${styles.animatedSection}`}>
            <div className={styles.sectionBadge}>FAQ</div>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
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
  );
}
