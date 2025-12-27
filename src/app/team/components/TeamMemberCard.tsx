import React from "react";
import Image from "next/image";
import { FaLinkedin } from "react-icons/fa";
import type { TeamMember } from "@/utils/data";
import styles from "../TeamPage.module.css";

interface TeamMemberCardProps {
  member: TeamMember;
  isVisible: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export default function TeamMemberCard({
  member,
  isVisible,
  isExpanded,
  onToggleExpand,
}: TeamMemberCardProps) {
  return (
    <div className={`${styles.card} ${isVisible ? styles.visible : ""}`}>
      {/* Avatar */}
      <div className={styles.avatar}>
        <Image
          src={member.image}
          alt={member.name}
          width={400}
          height={240}
          className={styles.image}
        />
      </div>

      {/* Card Content */}
      <div className={styles.cardContent}>
        <h2 className={styles.name}>{member.name}</h2>
        <h3 className={styles.role}>{member.role}</h3>

        {/* Description with expand/collapse */}
        <div className={styles.descriptionWrapper}>
          <p
            className={`${styles.desc} ${
              !isExpanded ? styles.descTruncated : styles.descExpanded
            }`}
            onClick={() => !isExpanded && onToggleExpand()}
          >
            {member.desc}
          </p>

          {isExpanded && (
            <button
              className={styles.showMore}
              onClick={onToggleExpand}
              type="button"
            >
              Show less
            </button>
          )}
        </div>

        {/* Skills */}
        {member.skills && (
          <div className={styles.skillsWrapper}>
            {member.skills.map((skill, i) => (
              <span key={i} className={styles.skillTag}>
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* LinkedIn Link */}
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
}
