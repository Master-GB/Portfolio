import {
  User,
  FolderKanban,
  Code,
  File,
  Mail,
  Terminal,
  Settings,
  GraduationCap,
  Monitor,
  Folder,
  Music,
  Globe,
  Edit3,
  Bot,
} from "lucide-react";

export const profile = {
  name: "Gihan",
  fullName: "Gihan Bandara",
  title: "4th Year Software Engineering Undergraduate",
  tagline: "Building elegant solutions · Seeking internship opportunities",
  email: "gihanbandara365@gmail.com",
  location: "Sri Lanka",
  university: "SLIIT",
  degree: "BSc (Hons) in Software Engineering",
  year: "4th Year",
  bio: `I'm a passionate software engineering student with hands-on experience in full-stack development, 
mobile apps, and AI/ML technologies. I love turning complex problems into clean, user-friendly software 
and I'm actively seeking internship opportunities to grow with innovative teams.`,
  socials: [
    { label: "GitHub", url: "https://github.com/Master-GB", handle: "@Master-GB" },
    { label: "LinkedIn", url: "https://www.linkedin.com/in/gihan-bandara", handle: "gihan-bandara" },
    { label: "Email", url: "mailto:gihanbandara365@gmail.com", handle: "gihanbandara365@gmail.com" },
  ],
  highlights: [
    "Full-stack web development",
    "Agile & team collaboration",
    "Problem-solving mindset",
    "Fast learner & curious",
  ],
};

export const projects = [
  {
    id: "p1",
    title: "GihanOS Portfolio",
    description: "A unique OS-inspired portfolio built with Next.js, TypeScript and Tailwind CSS.",
    tech: ["Next.js", "TypeScript", "Tailwind CSS"],
    github: "https://github.com/Master-GB",
    demo: "https://github.com/Master-GB",
    featured: true,
    tags: ["Frontend"],
  },
  {
    id: "p2",
    title: "SmartHelth",
    description: "AI-enabled smart healthcare appointment and telemedicine platform built using Microservices Architecture with Spring Boot, Next.js, Docker, and Kubernetes.",
    tech: ["Next.js", "Spring Boot", "PostgreSQL", "Tailwind CSS", "OpenAI", "Docker", "Kubernetes", "PayHere", "Jitsi", "Twilio", "Kafka"],
    github: "https://github.com/jeyixel/Smart-Healthcare-Platform.git",
    featured: true,
    tags: ["Full Stack", "AI Powered"],
  },
  {
    id: "p3",
    title: "RescueNet",
    description: "MERN-based disaster response and emergency coordination platform developed under UN SDG 11 with real-time disaster intelligence, shelter management, SOS help requests, and NGO coordination.",
    tech: ["React", "Node.js", "MongoDB", "Express", "Socket.io", "Notify.lk", "Cloudinary", "Leaflet", "Google Translate", "Open-Meteo", "Hugging"],
    github: "https://github.com/Master-GB/RescueNet.git",
    demo: "https://rescue-net-8jet.vercel.app/",
    featured: true,
    tags: ["Full Stack", "UN's SDGs"],
  },
  {
    id: "p4",
    title: "UniVerse",
    description: "Academic & Career Support Management System bridging students, mentors, and academic resources with mentorship, course management, resource sharing, and career development features.",
    tech: ["React", "Node.js", "MongoDB", "Express", "OpenAI", "Agile", "JavaScript"],
    github: "https://github.com/Master-GB/UniVerse.git",
    featured: true,
    tags: ["Full Stack", "AI Powered"],
  },
  {
    id: "p5",
    title: "GreenPulse",
    description: "Community-driven mobile application promoting affordable and clean energy access under UN SDG 7, enabling households to donate renewable energy credits and track community energy usage.",
    tech: ["React Native", "TypeScript", "Tailwind CSS", "Firebase", "OCR", "Google Map"],
    github: "https://github.com/Master-GB/GreenPulse.git",
    featured: true,
    tags: ["Mobile App", "UN's SDGs"],
  },
  {
    id: "p6",
    title: "HodaHitha.lk",
    description: "Surplus food reduction and redistribution system connecting restaurants, grocery stores, households, NGOs, and volunteers to efficiently donate and distribute excess food to people in need.",
    tech: ["React", "Node.js", "Chart.js", "MongoDB", "HTML", "CSS", "JavaScript", "Google Map", "Leaflet", "Twilio"],
    github: "https://github.com/Master-GB/HodaHitha.lk.git",
    featured: true,
    tags: ["Full Stack", "UN's SDGs"],
  },
  {
    id: "p7",
    title: "FinWise",
    description: "Personal finance management application for Android users to track expenses, manage budgets, and gain insights into spending habits with intuitive dashboards and smart notifications.",
    tech: ["Kotlin", "Room Persistence Library", "Material Design 3", "Coroutines", "Flow"],
    github: "https://github.com/Master-GB/FinWise.git",
    featured: false,
    tags: ["Mobile App", "Android"],
  },
  {
    id: "p8",
    title: "MediFlow",
    description: "Smart Clinic & Patient Management System for healthcare facilities with comprehensive patient management, appointment scheduling, and medical record tracking.",
    tech: ["Vite", "Tailwind CSS", "MongoDB", "Node.js", "Express"],
    github: "https://github.com/Master-GB/MediFlow.git",
    featured: true,
    tags: ["Full Stack", "AI Powered", "Ongoing"],
  },
];

export const skills = [
  {
    category: "Programming Languages",
    items: [
      { name: "JavaScript", level: 95 },
      { name: "TypeScript", level: 90 },
      { name: "Python", level: 80 },
      { name: "Java", level: 90 },
      { name: "C++", level: 75 },
      { name: "C#", level: 80 },
      { name: "PHP", level: 75 },
      { name: "SQL", level: 95 },
      { name: "HTML", level: 95 },
      { name: "CSS", level: 90 },
      { name: "Kotlin", level: 70 },
    ],
  },
  {
    category: "Frontend Frameworks & Libraries",
    items: [
      { name: "React", level: 95 },
      { name: "Next.js", level: 90 },
      { name: "Tailwind CSS", level: 90 },
      { name: "Framer Motion", level: 85 },
      { name: "Three.js", level: 75 },
      { name: "Vite", level: 88 },
      { name: "Angular", level: 60 },
    ],
  },
  {
    category: "Backend Frameworks & APIs",
    items: [
      { name: "Node.js", level: 95 },
      { name: "Express", level: 95 },
      { name: "Spring Boot", level: 75 },
      { name: "REST API", level: 95 },
      { name: "Socket.io", level: 70 },
    ],
  },
  {
    category: "Database",
    items: [
      { name: "MongoDB", level: 95 },
      { name: "SuperBase", level: 85 },
      { name: "MySQL", level: 78 },
      { name: "Firebase", level: 82 },
    ],
  },
  {
    category: "Mobile Development",
    items: [
      { name: "React Native", level: 80 },
      { name: "Expo", level: 78 },
    ],
  },
  {
    category: "DevOps",
    items: [
      { name: "CI/CD", level: 70 },
      { name: "Docker", level: 85 },
      { name: "Kubernetes", level: 80 },
    ],
  },
  {
    category: "Testing",
    items: [
      { name: "Jest", level: 80 },
      { name: "Postman", level: 90 },
      { name: "Playwright", level: 65 },
    ],
  },
  {
    category: "AI / ML",
    items: [
      { name: "Hugging Face", level: 72 },
      { name: "Gemini API", level: 80 },
    ],
  },
  {
    category: "Tools & Platforms",
    items: [
      { name: "Git", level: 92 },
      { name: "GitHub", level: 95 },
      { name: "Vercel", level: 88 },
      { name: "Railway", level: 80 },
      { name: "Render", level: 70 },
      { name: "Jira", level: 85 },
      { name: "Figma", level: 80 },
      { name: "Android Studio", level: 70 },
      { name: "VS Code", level: 95 },
      { name: "IntelliJ IDEA", level: 80 },
      { name: "Unity Hub", level: 75 },
    ],
  },
];

// New structured skills object for enhanced UI (keeps the original `skills` for backward compatibility)
export const skillsStructured = [
  {
    category: "Technical Skills",
    subcategories: [
      {
        category: "Programming Languages",
        items: [
          { name: "JavaScript", level: 95, logo: "javascript.png" },
          { name: "TypeScript", level: 90, logo: "typescript.png" },
          { name: "Python", level: 80, logo: "python.png" },
          { name: "Java", level: 90, logo: "java.png" },
          { name: "C++", level: 75, logo: "cplusplus.png" },
          { name: "C#", level: 80, logo: "csharp.png" },
          { name: "PHP", level: 75, logo: "php.png" },
          { name: "SQL", level: 95, logo: "sql.png" },
          { name: "HTML", level: 95, logo: "html5.png" },
          { name: "CSS", level: 90, logo: "css3.png" },
          { name: "Kotlin", level: 70, logo: "kotlin.png" },
        ],
      },
      {
        category: "Frontend Frameworks & Libraries",
        items: [
          { name: "React", level: 95, logo: "react.png" },
          { name: "Next.js", level: 90, logo: "nextjs.png" },
          { name: "Tailwind CSS", level: 90, logo: "tailwind.png" },
          { name: "Framer Motion", level: 85, logo: "framer.png" },
          { name: "Three.js", level: 75, logo: "threejs.png" },
          { name: "Vite", level: 88, logo: "vite.png" },
          { name: "Angular", level: 60, logo: "angular.png" },
        ],
      },
      {
        category: "Backend Frameworks & APIs",
        items: [
          { name: "Node.js", level: 95, logo: "nodejs.png" },
          { name: "Express", level: 95, logo: "express.png" },
          { name: "Spring Boot", level: 75, logo: "springboot.png" },
          { name: "REST API", level: 95, logo: "api.png" },
          { name: "Socket.io", level: 70, logo: "socketio.png" },
        ],
      },
      {
        category: "Database",
        items: [
          { name: "MongoDB", level: 95, logo: "mongodb.png" },
          { name: "SuperBase", level: 85, logo: "supabase.png" },
          { name: "MySQL", level: 78, logo: "mysql.png" },
          { name: "Firebase", level: 82, logo: "firebase.png" },
        ],
      },
      {
        category: "Mobile Development",
        items: [
          { name: "React Native", level: 80, logo: "react-native.png" },
          { name: "Expo", level: 78, logo: "expo.png" },
        ],
      },
      {
        category: "DevOps",
        items: [
          { name: "CI/CD", level: 70, logo: "cicd.png" },
          { name: "Docker", level: 85, logo: "docker.png" },
          { name: "Kubernetes", level: 80, logo: "kubernetes.png" },
        ],
      },
      {
        category: "Testing",
        items: [
          { name: "Jest", level: 80, logo: "jest.png" },
          { name: "Postman", level: 90, logo: "postman.png" },
          { name: "Playwright", level: 65, logo: "playwright.png" },
        ],
      },
      {
        category: "AI / ML",
        items: [
          { name: "Hugging Face", level: 72, logo: "huggingface.png" },
          { name: "Gemini API", level: 80, logo: "gemini.png" },
        ],
      },
      {
        category: "Tools & Platforms",
        items: [
          { name: "Git", level: 92, logo: "git.png" },
          { name: "GitHub", level: 95, logo: "github.png" },
          { name: "Vercel", level: 88, logo: "vercel.png" },
          { name: "Railway", level: 80, logo: "railway.png" },
          { name: "Render", level: 70, logo: "render.png" },
          { name: "Jira", level: 85, logo: "jira.png" },
          { name: "Figma", level: 80, logo: "figma.png" },
          { name: "Android Studio", level: 70, logo: "androidstudio.png" },
          { name: "VS Code", level: 95, logo: "vscode.png" },
          { name: "IntelliJ IDEA", level: 80, logo: "intellij.png" },
          { name: "Unity Hub", level: 75, logo: "unity.png" },
        ],
      },
    ],
  },

];


export const experience = [
  {
    role: "Software Engineering Intern",
    company: "Tech Company Ltd.",
    period: "Jun 2025 – Aug 2025",
    description: "Developed features for internal tools using React and Node.js. Participated in code reviews and agile sprints.",
  },
  {
    role: "Freelance Web Developer",
    company: "Self-employed",
    period: "2024 – Present",
    description: "Built responsive websites and web apps for small businesses. Managed client communication and project delivery.",
  },
  {
    role: "University Group Projects",
    company: "SLIIT",
    period: "2022 – Present",
    description: "Led and contributed to multiple semester projects including mobile apps, web platforms, and research prototypes.",
  },
];

export const education = [
  {
    degree: "BSc (Hons) in Software Engineering",
    school: "Sri Lanka Institute of Information Technology (SLIIT)",
    period: "2022- 2026 (Expected)",
    details: "GPA: 3.58/4.0 · Specializing in full-stack development, distributed systems, and software architecture",
    courses: [
      { name: "Data Structures & Algorithms", grade: "A", credits: 4 },
      { name: "Software Project Management", grade: "A-", credits: 3 },
      { name: "Software Process Modeling", grade: "A-", credits: 3 },
      { name: "Database Management Systems", grade: "A-", credits: 4 },
      { name: "Internet & Web Technologies", grade: "A", credits: 4 },
      { name: "Computer Networks", grade: "A", credits: 4 },
      { name: "Mobile Application Development", grade: "B+", credits: 4 },
      { name: "Information Systems & Data Modeling", grade: "A", credits: 4 },
      { name: "Software Engineering", grade: "A", credits: 4 },
      { name: "Object Oriented Programming", grade: "A", credits: 4 },
      { name: "Distributed Systems", grade: "A-", credits: 4 },
      { name: "Software Architecture", grade: "A-", credits: 4 },
    ],
    certificates: [
      {
        title: "Dean's List",
        issuer: "SLIIT",
        year: "2024",
        category: "Academic Excellence",
        verified: true,
      },
      {
        title: "MongoDB Associate Atlas Administrator",
        issuer: "MongoDB University",
        year: "2025",
        category: "Database",
        verified: true,
      },
      {
        title: "Postman Student Expert",
        issuer: "Postman",
        year: "2026",
        category: "API Testing",
        verified: true,
      },
    ],
  },
];

export const terminalCommands: Record<string, string | string[]> = {
  help: [
    "Available commands:",
    "  about     - Who am I?",
    "  skills    - Technical skills",
    "  projects  - View projects",
    "  contact   - Get in touch",
    "  education - Academic background",
    "  robo      - Open AI Byte Assistant",
    "  clear     - Clear terminal",
    "  whoami    - Display profile name",
    "  joke      - Get a random joke",
    "  matrix    - Matrix easter egg",
    "  sudo hire-me - Try it ",
  ],
  about: `${profile.fullName} — ${profile.title}\n${profile.bio.trim()}`,
  skills: skills
    .map((s) => `${s.category}: ${s.items.map((i) => i.name).join(", ")}`)
    .join("\n"),
  projects: projects.map((p) => `• ${p.title} [${p.tech.join(", ")}]`).join("\n"),
  contact: `Email: ${profile.email}\nGitHub: ${profile.socials[0].url}\nLinkedIn: ${profile.socials[1].url}`,
  education: (() => {
    const edu = education[0];
    let output = `${edu.degree}\n${edu.school}\n${edu.period}\n\n${edu.details}\n\n`;
    output += "Key Courses:\n";
    edu.courses.forEach((course, i) => {
      output += `  ${i + 1}. ${course.name} - ${course.grade} (${course.credits} credits)\n`;
    });
    output += "\nCertificates:\n";
    edu.certificates.forEach((cert, i) => {
      output += `  ${i + 1}. ${cert.title} - ${cert.issuer} (${cert.year}) [${cert.category}]\n`;
    });
    return output;
  })(),
  whoami: profile.fullName,
  clear: "__CLEAR__",
  matrix: "Initiating matrix protocol... (Easter egg unlocked!)",
  joke: "Fetching a joke...",
  robo: "Launching AI Assistant... (Use 'open robot_assistant' or click the desktop robot!)",
  ai: "Opening Byte OS Assistant... 🤖",
};

export const apps = [
  { id: "about", title: "About Me", icon: Monitor, defaultSize: { w: 980, h: 660 } },
  { id: "projects", title: "Projects", icon: FolderKanban, defaultSize: { w: 1000, h: 650 } },
  { id: "skills", title: "Skills", icon: Code, defaultSize: { w: 850, h: 620 } },
  { id: "education", title: "Education", icon: GraduationCap, defaultSize: { w: 920, h: 620 } },
  { id: "contact", title: "Contact", icon: Mail, defaultSize: { w: 1150, h: 700 } },
  { id: "terminal", title: "Terminal", icon: Terminal, defaultSize: { w: 800, h: 500 } },
  { id: "settings", title: "Settings", icon: Settings, defaultSize: { w: 850, h: 600 } },
  { id: "explorer", title: "Explorer", icon: Folder, defaultSize: { w: 800, h: 600 } },
  { id: "notepad", title: "Notepad", icon: Edit3, defaultSize: { w: 800, h: 600 } },
  { id: "robot_assistant", title: "AI Byte", icon: Bot, defaultSize: { w: 880, h: 620 } },
  { id: "resume", title: "Resume.pdf", icon: File, defaultSize: { w: 800, h: 700 } },
] as const;

export type AppId = (typeof apps)[number]["id"];
