import {
  User,
  FolderKanban,
  Code,
  FileText,
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
    { label: "LinkedIn", url: "https://linkedin.com/in/yourprofile", handle: "yourprofile" },
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
    title: "E-Commerce Platform",
    description:
      "Full-stack online store with cart, payments, and admin dashboard. Built with modern architecture and responsive design.",
    tech: ["React", "Node.js", "MongoDB", "Stripe"],
    github: "https://github.com",
    demo: "https://demo.com",
    featured: true,
  },
  {
    id: "p2",
    title: "Task Management App",
    description:
      "Collaborative project management tool with real-time updates, drag-and-drop boards, and team workspaces.",
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Socket.io"],
    github: "https://github.com",
    demo: "https://demo.com",
    featured: true,
  },
  {
    id: "p3",
    title: "AI Chat Assistant",
    description:
      "Intelligent chatbot integrating LLM APIs with context memory and a sleek conversational UI.",
    tech: ["Python", "FastAPI", "React", "OpenAI"],
    github: "https://github.com",
    featured: false,
  },
  {
    id: "p4",
    title: "Mobile Fitness Tracker",
    description:
      "Cross-platform fitness app with workout logging, progress charts, and health goal tracking.",
    tech: ["React Native", "Firebase", "Chart.js"],
    github: "https://github.com",
    featured: false,
  },
];

export const skills = [
  {
    category: "Languages",
    items: [
      { name: "JavaScript / TypeScript", level: 90 },
      { name: "Python", level: 85 },
      { name: "Java", level: 80 },
      { name: "C#", level: 75 },
    ],
  },
  {
    category: "Frontend",
    items: [
      { name: "React / Next.js", level: 92 },
      { name: "Tailwind CSS", level: 90 },
      { name: "HTML / CSS", level: 95 },
    ],
  },
  {
    category: "Backend & Database",
    items: [
      { name: "Node.js / Express", level: 88 },
      { name: "REST APIs", level: 90 },
      { name: "MongoDB / SQL", level: 82 },
    ],
  },
  {
    category: "Tools & Other",
    items: [
      { name: "Git / GitHub", level: 92 },
      { name: "Docker", level: 70 },
      { name: "Figma", level: 75 },
      { name: "Agile / Scrum", level: 85 },
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
          { name: "JavaScript", level: 92, logo: "javascript.png" },
          { name: "TypeScript", level: 90, logo: "typescript.png" },
          { name: "Python", level: 85, logo: "python.png" },
          { name: "Java", level: 80, logo: "java.png" },
          { name: "C#", level: 75, logo: "csharp.png" },
        ],
      },
      {
        category: "Frontend Frameworks & Libraries",
        items: [
          { name: "React", level: 94, logo: "react.png" },
          { name: "Next.js", level: 92, logo: "nextjs.png" },
          { name: "Tailwind CSS", level: 90, logo: "tailwind.png" },
          { name: "Redux", level: 80, logo: "redux.png" },
        ],
      },
      {
        category: "Backend Frameworks & APIs",
        items: [
          { name: "Node.js", level: 88, logo: "nodejs.png" },
          { name: "Express", level: 86, logo: "express.png" },
          { name: "Django", level: 72, logo: "django.png" },
          { name: "Spring", level: 70, logo: "spring.png" },
          { name: "REST / GraphQL APIs", level: 88, logo: "api.png" },
        ],
      },
      {
        category: "Mobile Development",
        items: [
          { name: "React Native", level: 78, logo: "react-native.png" },
          { name: "Flutter", level: 68, logo: "flutter.png" },
        ],
      },
      {
        category: "Database",
        items: [
          { name: "PostgreSQL", level: 82, logo: "postgresql.png" },
          { name: "MySQL", level: 80, logo: "mysql.png" },
          { name: "MongoDB", level: 82, logo: "mongodb.png" },
        ],
      },
      {
        category: "Tools & Platforms",
        items: [
          { name: "Git / GitHub", level: 92, logo: "github.png" },
          { name: "Docker", level: 74, logo: "docker.png" },
          { name: "AWS", level: 70, logo: "aws.png" },
          { name: "Figma", level: 75, logo: "figma.png" },
        ],
      },
      {
        category: "Testing",
        items: [
          { name: "Jest", level: 72, logo: "jest.png" },
          { name: "Cypress", level: 68, logo: "cypress.png" },
        ],
      },
    ],
  },
  {
    category: "Soft Skills",
    subcategories: [
      {
        category: "Interpersonal",
        items: [
          { name: "Communication", level: 92 },
          { name: "Teamwork", level: 90 },
          { name: "Leadership", level: 80 },
        ],
      },
      {
        category: "Professional",
        items: [
          { name: "Problem Solving", level: 94 },
          { name: "Adaptability", level: 88 },
          { name: "Time Management", level: 86 },
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
    period: "2022 – 2026 (Expected)",
    details: "GPA: 3.X/4.0 · Relevant coursework: Data Structures, OOP, Software Architecture, DBMS, Web Development",
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
    "  whoami    - Display user info",
    "  sudo hire-me - Try it 😉",
  ],
  about: `${profile.fullName} — ${profile.title}\n${profile.bio.trim()}`,
  skills: skills
    .map((s) => `${s.category}: ${s.items.map((i) => i.name).join(", ")}`)
    .join("\n"),
  projects: projects.map((p) => `• ${p.title} [${p.tech.join(", ")}]`).join("\n"),
  contact: `Email: ${profile.email}\nGitHub: ${profile.socials[0].url}\nLinkedIn: ${profile.socials[1].url}`,
  education: `${profile.degree} @ ${profile.university} (${profile.year})`,
  whoami: profile.fullName,
  "sudo hire-me": "Permission granted. Let's connect! → Open Contact app 📬",
  clear: "__CLEAR__",
  matrix: "Initiating matrix protocol... (Easter egg unlocked!)",
  joke: "Fetching a joke...",
  weather: "Fetching weather...",
  robo: "Launching AI Assistant... (Use 'open robot_assistant' or click the desktop robot!)",
  ai: "Opening Byte OS Assistant... 🤖",
  avatar: "To change my avatar, open the AI Byte App or go to Settings! 🦾",
};

export const apps = [
  { id: "about", title: "About Me", icon: Monitor, defaultSize: { w: 980, h: 660 } },
  { id: "projects", title: "Projects", icon: FolderKanban, defaultSize: { w: 1000, h: 650 } },
  { id: "skills", title: "Skills", icon: Code, defaultSize: { w: 840, h: 600 } },
  { id: "resume", title: "Resume", icon: FileText, defaultSize: { w: 760, h: 700 } },
  { id: "education", title: "Education", icon: GraduationCap, defaultSize: { w: 920, h: 620 } },
  { id: "contact", title: "Contact", icon: Mail, defaultSize: { w: 840, h: 700 } },
  { id: "terminal", title: "Terminal", icon: Terminal, defaultSize: { w: 800, h: 500 } },
  { id: "settings", title: "Settings", icon: Settings, defaultSize: { w: 500, h: 440 } },
  { id: "explorer", title: "Explorer", icon: Folder, defaultSize: { w: 800, h: 600 } },
  { id: "notepad", title: "Notepad", icon: Edit3, defaultSize: { w: 640, h: 500 } },
  { id: "robot_assistant", title: "AI Byte", icon: Bot, defaultSize: { w: 840, h: 620 } },
] as const;

export type AppId = (typeof apps)[number]["id"];
