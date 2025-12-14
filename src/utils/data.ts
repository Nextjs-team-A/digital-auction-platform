// src/utils/data.ts

export interface TeamMember {
    image: string;
    name: string;
    role: string;
    desc: string;
    linkedin: string;
}

export const teamMembers: TeamMember[] = [
    {
        image: "/images/team/yaraelkassem.jpeg",
        name: "Yara El Kassem",
        role: "Full-Stack Developer",
        desc: `Computer Science graduate with skills in HTML,CSS, JavaScript, React, Next.js,and MySQL.          
    Currently learning Java Spring Boot to strengthen backend development.
    Motivated self-learner focused on growth and building impactful web solutions.`,
        linkedin: "https://www.linkedin.com/in/yara-el-kassem-b0005226b?"
    },
    {
        image: "/images/team/alichoker.jpeg",
        name: "Ali Choker",
        role: "Full-Stack Developer",
        desc: `Focused on building secure and scalable web applications.
Skilled in backend engineering, RESTful APIs, and database design with MySQL, PostgreSQL & MongoDB.
Experienced with modern tech including Laravel Nextjs
Graduated with honors from LIU – Khiara Campus and completed a Next.js internship at Noya AI.
 Always driven to create efficient, clean, and impactful digital solutions.`,
        linkedin: " https://www.linkedin.com/in/ali-choker-b18377245?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
    },
    {
        image: "/images/team/royakais_v2.png",
        name: "Roya Kais",
        role: "Front-End Developer",
        desc: `Web Developer with experience in building responsive websites and full-stack projects using HTML, CSS, JavaScript, React, Node.js, and SQL.
    I've worked on CRUD applications, database systems, JavaFX tools.`,
        linkedin: "https://www.linkedin.com/in/royakais",
    },
    {
        image: "/images/team/ahmadkaraki.jpeg",
        name: "Ahmad Karaki",
        role: "Front-End Developer",
        desc: `Computer Science student at USAL University, continuously improving my skills in modern web technologies and best practices.`,
        linkedin: "https://www.linkedin.com/in/ahmad-karaki-256155392?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
    },
    {
        image: "/images/team/Mohamad.jpeg",
        name: "Mohamad Abou Baker",
        role: "Front-End Developer",
        desc: `Web Developer skilled in HTML, CSS, JavaScript, React.js, and Tailwind CSS. 
        Passionate about creating responsive, user-friendly web applications and continuously improving my frontend development skills.`,
        linkedin: "https://www.linkedin.com/in/mhamad-aboubaker-430833375?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",

    }

];
