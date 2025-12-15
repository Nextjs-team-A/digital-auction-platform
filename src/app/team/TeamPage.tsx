// src/app/team/TeamPage.tsx
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { teamMembers } from "@/utils/data";
import styles from "./TeamPage.module.css";
import { FaLinkedin } from "react-icons/fa";

const TeamPage: React.FC = () => {
    const [visible, setVisible] = useState<number[]>([]);

    useEffect(() => {
        const handleScroll = () => {
            const cards = document.querySelectorAll(`.${styles.card}`);
            const newVisible: number[] = [];
            cards.forEach((card, idx) => {
                const rect = card.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.85) newVisible.push(idx);
            });
            setVisible(newVisible);
        };
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className={styles.container}>
            <header className={styles.hero}>
                <div className={styles.titleWrapper}>
                    <Image
                        src="/images/logos/logo2.png"
                        alt="Logo Left"
                        width={70}
                        height={70}
                        className={styles.flankingLogo}
                    />

                    <h1 className={styles.title}>
                        Meet Our <span>Team</span>
                    </h1>

                    <Image
                        src="/images/logos/logo2.png"
                        alt="Logo Right"
                        width={70}
                        height={70}
                        className={styles.flankingLogo}
                    />
                </div>

                <p className={styles.subtitle}>
                    The talented minds behind <span>BidZone</span>  Platform.
                </p>
            </header>

            <div className={styles.grid}>
                {teamMembers.map((member, idx) => {
                    const isExpanded = visible.includes(idx + 1000);
                    const shouldTruncate = member.desc && member.desc.length > 150;

                    return (
                        <div
                            key={idx}
                            className={`${styles.card} ${visible.includes(idx) ? styles.visible : ""
                                }`}
                        >
                            <div className={styles.avatar}>
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    width={400}
                                    height={240}
                                    className={styles.image}
                                />
                            </div>
                            <div className={styles.cardContent}>
                                <h2 className={styles.name}>{member.name}</h2>
                                <h3 className={styles.role}>{member.role}</h3>
                                <div className={styles.descriptionWrapper}>
                                    <p
                                        className={`${styles.desc} ${!isExpanded ? styles.descTruncated : styles.descExpanded}`}
                                        onClick={() => !isExpanded && setVisible([...visible, idx + 1000])}
                                    >
                                        {member.desc}
                                    </p>
                                    {isExpanded && (
                                        <button
                                            className={styles.showMore}
                                            onClick={() => setVisible(visible.filter(i => i !== idx + 1000))}
                                        >
                                            Show less
                                        </button>
                                    )}
                                </div>
                                <a
                                    href={member.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.linkedin}
                                >
                                    <FaLinkedin size={16} />
                                    View Profile
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TeamPage;
