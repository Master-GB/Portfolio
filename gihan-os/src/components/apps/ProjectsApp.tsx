"use client";



import { useEffect, useRef, useState, useCallback } from "react";

import { motion, AnimatePresence } from "framer-motion";

import {

  LayoutGrid,

  List,

  Search,

  Star,

  Eye,

  GitBranch,

  ExternalLink,

  Code2,

  Layers,

  Cpu,

  Trophy,

  Clock,

  Settings,

  ChevronDown,

  ArrowRight,

  Sparkles,

  Zap,

  Globe,

  Smartphone,

  BarChart3,

  FolderKanban,

  X,

} from "lucide-react";



/* ─── Particle Canvas ───────────────────────────────────────────────────── */



function ParticleCanvas() {

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const parentRef = useRef<HTMLElement | null>(null);



  useEffect(() => {

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;



    parentRef.current = canvas.parentElement;



    let animId: number;

    let time = 0;



    interface Particle {

      x: number; y: number; vx: number; vy: number;

      r: number; alpha: number; color: string;

      baseR: number; phase: number;

    }



    const COLORS = ["rgba(139,92,246,", "rgba(99,102,241,", "rgba(59,130,246,", "rgba(168,85,247,"];

    const particles: Particle[] = [];



    const resize = () => {

      canvas.width = canvas.offsetWidth;

      canvas.height = canvas.offsetHeight;

    };

    resize();

    const ro = new ResizeObserver(resize);

    ro.observe(canvas);



    for (let i = 0; i < 65; i++) {

      const baseR = Math.random() * 2 + 0.8;

      particles.push({

        x: Math.random() * canvas.width,

        y: Math.random() * canvas.height,

        vx: (Math.random() - 0.5) * 0.6,

        vy: (Math.random() - 0.5) * 0.6,

        r: baseR,

        baseR: baseR,

        alpha: Math.random() * 0.6 + 0.5,

        color: COLORS[Math.floor(Math.random() * COLORS.length)],

        phase: Math.random() * Math.PI * 2,

      });

    }



    // Mouse tracking - use parent container for better event capture

    let mouseX = -1000;

    let mouseY = -1000;



    const handleMouseMove = (e: MouseEvent) => {

      const parent = parentRef.current;

      if (parent) {

        const parentRect = parent.getBoundingClientRect();

        mouseX = e.clientX - parentRect.left;

        mouseY = e.clientY - parentRect.top;

      }

    };



    const handleMouseLeave = () => {

      mouseX = -1000;

      mouseY = -1000;

    };



    // Use parent container for mouse events to capture events even over other elements

    const parent = parentRef.current;

    if (parent) {

      parent.addEventListener('mousemove', handleMouseMove);

      parent.addEventListener('mouseleave', handleMouseLeave);

    }



    const draw = () => {

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      time += 0.02;



      particles.forEach((p) => {

        // Mouse interaction - attraction within 150px

        if (mouseX > -500) {

          const dx = mouseX - p.x;

          const dy = mouseY - p.y;

          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150 && dist > 0) {

            const force = (150 - dist) / 150 * 0.02;

            p.vx += (dx / dist) * force;

            p.vy += (dy / dist) * force;

          }

        }



        // Apply velocity with minimal damping

        p.x += p.vx;

        p.y += p.vy;

        p.vx *= 0.9995;

        p.vy *= 0.9995;



        // Boundary wrap

        if (p.x < 0) p.x = canvas.width;

        if (p.x > canvas.width) p.x = 0;

        if (p.y < 0) p.y = canvas.height;

        if (p.y > canvas.height) p.y = 0;



        // Pulsing effect using sine wave

        p.r = p.baseR + Math.sin(time + p.phase) * 0.5;



        // Glow effect

        ctx.shadowBlur = 15;

        ctx.shadowColor = `${p.color}0.8)`;



        ctx.beginPath();

        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

        ctx.fillStyle = `${p.color}${p.alpha})`;

        ctx.fill();



        // Reset shadow for performance

        ctx.shadowBlur = 0;

      });



      // Draw connections with pulsing opacity

      particles.forEach((a, i) => {

        particles.slice(i + 1).forEach((b) => {

          const dx = a.x - b.x;

          const dy = a.y - b.y;

          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 80) {

            const pulseOpacity = 0.1 * (1 - dist / 80) * (0.5 + 0.5 * Math.sin(time * 2));

            ctx.beginPath();

            ctx.moveTo(a.x, a.y);

            ctx.lineTo(b.x, b.y);

            ctx.strokeStyle = `rgba(139,92,246,${pulseOpacity})`;

            ctx.lineWidth = 0.7;

            ctx.stroke();

          }

        });

      });



      animId = requestAnimationFrame(draw);

    };



    draw();

    return () => {

      cancelAnimationFrame(animId);

      ro.disconnect();

      if (parent) {

        parent.removeEventListener('mousemove', handleMouseMove);

        parent.removeEventListener('mouseleave', handleMouseLeave);

      }

    };

  }, []);



  return (

    <canvas

      ref={canvasRef}

      style={{

        position: "absolute", inset: 0, width: "100%", height: "100%",

        pointerEvents: "none", display: "block",

      }}

    />

  );

}



/* ─── Animated Counter ──────────────────────────────────────────────────── */



function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {

  const [count, setCount] = useState(0);

  const [started, setStarted] = useState(false);

  const ref = useRef<HTMLSpanElement>(null);



  useEffect(() => {

    const observer = new IntersectionObserver(([entry]) => {

      if (entry.isIntersecting && !started) setStarted(true);

    });

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();

  }, [started]);



  useEffect(() => {

    if (!started) return;

    let current = 0;

    const step = target / 40;

    const timer = setInterval(() => {

      current += step;

      if (current >= target) { setCount(target); clearInterval(timer); }

      else setCount(Math.floor(current));

    }, 30);

    return () => clearInterval(timer);

  }, [started, target]);



  return <span ref={ref}>{count}{suffix}</span>;

}



/* ─── Data ──────────────────────────────────────────────────────────────── */



const SIDEBAR_ITEMS = [

  { id: "all", label: "All Projects", icon: FolderKanban },

  { id: "Full Stack", label: "Full Stack", icon: Layers },

  { id: "Mobile App", label: "Mobile App", icon: Smartphone },

   { id: "Featured", label: "Featured", icon: Star },

  { id: "Frontend", label: "Frontend", icon: Code2 },

  { id: "AI Powered", label: "AI Powered", icon: Cpu },

  { id: "UN's SDGs", label: "UN's SDGs", icon: Globe },

  { id: "Ongoing", label: "Ongoing", icon: Clock },

  

];



const STAT_CARDS = [

  {

    label: "Total Projects", value: 8, suffix: "", sub: "+1 this month",

    icon: FolderKanban, color: "#8b5cf6", glow: "rgba(139,92,246,0.3)",

    gradient: "linear-gradient(135deg,rgba(139,92,246,0.2),rgba(99,102,241,0.1))",

  },

  {

    label: "Completed", value: 7, suffix: "", sub: "87% success",

    icon: Zap, color: "#10b981", glow: "rgba(16,185,129,0.3)",

    gradient: "linear-gradient(135deg,rgba(16,185,129,0.2),rgba(5,150,105,0.1))",

  },

  {

    label: "Featured", value: 6, suffix: "", sub: "Best quality",

    icon: Star, color: "#f59e0b", glow: "rgba(245,158,11,0.3)",

    gradient: "linear-gradient(135deg,rgba(245,158,11,0.2),rgba(217,119,6,0.1))",

  },

  {

    label: "Technologies", value: 30, suffix: "+", sub: "Used overall",

    icon: Code2, color: "#3b82f6", glow: "rgba(59,130,246,0.3)",

    gradient: "linear-gradient(135deg,rgba(59,130,246,0.2),rgba(37,99,235,0.1))",

  },

];



const CATEGORIES = ["All Categories", "Full Stack", "AI Powered", "Mobile App", "UN's SDGs", "Featured", "Ongoing", "Frontend", "Android"];



const CATEGORY_INFO: Record<string, { title: string; description: string; icon: any }> = {

  "all": { title: "My Projects", description: "Explore my creative work and the solutions I've built.", icon: Sparkles },

  "Full Stack": { title: "Full Stack Projects", description: "End-to-end applications with frontend, backend, and database integration.", icon: Layers },

  "AI Powered": { title: "AI Powered Projects", description: "Projects leveraging artificial intelligence and machine learning technologies.", icon: Cpu },

  "Mobile App": { title: "Mobile Applications", description: "Native and cross-platform mobile applications for iOS and Android.", icon: Smartphone },

  "UN's SDGs": { title: "UN SDG Projects", description: "Projects contributing to the United Nations Sustainable Development Goals.", icon: Globe },

  "Featured": { title: "Featured Projects", description: "Highlighted projects showcasing my best work and achievements.", icon: Star },

  "Ongoing": { title: "Ongoing Projects", description: "Currently active projects under development and improvement.", icon: Clock },

  "Frontend": { title: "Frontend Projects", description: "User-facing applications with modern UI/UX and responsive design.", icon: Code2 },

  "Android": { title: "Android Projects", description: "Native Android applications built with Kotlin and modern Android development practices.", icon: Smartphone },

};



const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {

  "Featured": { bg: "rgba(139,92,246,0.25)", text: "#c4b5fd", border: "rgba(139,92,246,0.5)" },

  "Full Stack": { bg: "rgba(59,130,246,0.25)", text: "#93c5fd", border: "rgba(59,130,246,0.5)" },

  "AI Powered": { bg: "rgba(16,185,129,0.25)", text: "#6ee7b7", border: "rgba(16,185,129,0.5)" },

  "Ongoing": { bg: "rgba(245,158,11,0.25)", text: "#fcd34d", border: "rgba(245,158,11,0.5)" },

  "Mobile App": { bg: "rgba(236,72,153,0.25)", text: "#f9a8d4", border: "rgba(236,72,153,0.5)" },

  "Web App": { bg: "rgba(6,182,212,0.25)", text: "#67e8f9", border: "rgba(6,182,212,0.5)" },

  "UN's SDGs" : { bg: "rgba(105, 41, 9, 0.25)", text: "#db8282ff", border: "rgba(33, 210, 92, 0.25)" },

  "Frontend": { bg: "rgba(99,102,241,0.25)", text: "#a5b4fc", border: "rgba(99,102,241,0.5)" },

  "Android": { bg: "rgba(239,68,68,0.25)", text: "#fca5a5", border: "rgba(239,68,68,0.5)" },

};



const TECH_BADGES: Record<string, { color: string; bg: string }> = {

  "Next.js": { color: "#fff", bg: "rgba(0,0,0,0.6)" },

  "TypeScript": { color: "#60a5fa", bg: "rgba(59,130,246,0.2)" },

  "Tailwind CSS": { color: "#38bdf8", bg: "rgba(14,165,233,0.2)" },

  "React": { color: "#67e8f9", bg: "rgba(6,182,212,0.2)" },

  "Node.js": { color: "#91e7b1ff", bg: "rgba(125, 228, 6, 0.2)" },

  "MongoDB": { color: "#bbf7d0", bg: "rgba(21,128,61,0.2)" },

  "OpenAI": { color: "#c4b5fd", bg: "rgba(139,92,246,0.2)" },

  "Python": { color: "#fde047", bg: "rgba(202,138,4,0.2)" },

  "HTML": { color: "#6ee7b7", bg: "rgba(5,150,105,0.2)" },

  "Firebase": { color: "#fdba74", bg: "rgba(234,88,12,0.2)" },

  "React Native": { color: "#93c5fd", bg: "rgba(59,130,246,0.2)" },

  "Chart.js": { color: "#f9a8d4", bg: "rgba(219,39,119,0.2)" },

  "PostgreSQL": { color: "#93c5fd", bg: "rgba(37,99,235,0.2)" },

  "Socket.io": { color: "#d1d5db", bg: "rgba(107,114,128,0.2)" },

  "Docker": { color: "#60a5fa", bg: "rgba(59,130,246,0.2)" },

  "Kubernetes": { color: "#f472b6", bg: "rgba(236,72,153,0.2)" },

  "Kafka": { color: "#eed173ff", bg: "rgba(120, 233, 60, 0.2)" },

  "Twilio": { color: "#59d2bcff", bg: "rgba(11, 129, 29, 0.2)" },

  "Jitsi":  { color: "#37cf6aff", bg: "rgba(222, 80, 80, 0.2)2)" },

  "PayHere" : { color: "#eaa1a1ff", bg: "rgba(101, 117, 11, 0.2)" },

  "Spring Boot": { color: "#a5b4fc", bg: "rgba(99,102,241,0.2)" },

  "Express": {color:"#e59d8cff", bg: "rgba(236,72,153,0.2)"},

  "Leaflet": {color:"#5c94edff", bg: "rgba(59,130,246,0.2)"},

  "Notify.lk": {color:"#bbcc87ff", bg: "rgba(32, 8, 142, 0.2)"},

  "Cloudinary" : {color:"#00bfff", bg: "rgba(0, 191, 255, 0.2)"},

  "Open-Meteo" : {color:"#6ccc7aff", bg: "rgba(10, 102, 207, 0.2)"},

  "Google Translate" : {color:"#fbbf24", bg: "rgba(245, 158, 11, 0.2)"},

  "Hugging" : {color:"#cb4f4fff", bg: "rgba(3, 114, 63, 0.2)"},

  "Agile" : {color:"#e0f735ff", bg: "rgba(3, 67, 112, 0.2)"},

  "OCR" : {color:"#9897e8ff", bg: "rgba(4, 142, 36, 0.2)"},

  "CSS" : {color:"#89d882ff", bg: "rgba(121, 60, 6, 0.2)"},

  "JavaScript":{color:"#73e8deff", bg: "rgba(4, 142, 36, 0.2)"},

  "Google Map" :{color:"#f5fa9fff", bg: "rgba(6, 112, 110, 0.2)"},

  "Kotlin" :{color:"#ca98b2ff", bg: "rgba(16, 29, 104, 0.2)"}, 

  "Room Persistence Library" :{color:"#9bf9ddff", bg: "rgba(106, 83, 5, 0.2)"},

  "Flow":{color:"#99be91ff", bg: "rgba(122, 4, 4, 0.2)"},

  "Coroutines" :{color:"#d1a589ff", bg: "rgba(76, 7, 129, 0.2)"},

  "Material Design 3" :{color:"#e8a4e1ff", bg: "rgba(6, 112, 110, 0.2)"},

  "Vite" : {color:"#7aeda6ff", bg: "rgba(112, 71, 6, 0.2)"}

  };



interface Project {

  id: string;

  title: string;

  titleMain?:string;

  description: string;

  longDescription?: string;

  features?: string[];

  tech: string[];

  tags: string[];

  accentColor: string;

  github: string;

  demo?: string;

  gradient: string;

  challenges?: string[];

  outcomes?: string[];

  image?: string;

}





const PROJECTS: Project[] = [

  {

    id: "p1",

    title: "GihanOS Portfolio",

    description: "A unique OS-inspired portfolio built with Next.js, TypeScript and Tailwind CSS.",

    longDescription: "GihanOS is an innovative portfolio website that mimics a desktop operating system interface. It features a fully functional window management system, taskbar, start menu, and interactive 3D robot assistant. The project demonstrates advanced React state management, 3D graphics integration, and modern UI design patterns.",

    features: ["Desktop-like interface with draggable windows", "Interactive 3D robot assistant with animations", "Multiple apps: About, Projects, Skills, Resume, etc.", "Responsive design with smooth animations", "Dark theme with glassmorphism effects"],

    tech: ["Next.js", "TypeScript", "Tailwind CSS"],

    tags: ["Frontend"],

    accentColor: "#8b5cf6",

    github: "https://github.com/Master-GB",

    demo: "https://github.com/Master-GB",

    gradient: "linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#1e1b4b 100%)",

    challenges: ["Implementing smooth window dragging without lag", "Managing complex state for window system", "Integrating 3D graphics with React components"],

    outcomes: ["Created a unique and memorable portfolio experience", "Demonstrated advanced React and Three.js skills", "Received positive feedback on the innovative design"],

  },

  {

    id: "p2",

    title: "SmartHealth",

    titleMain:"SmartHealth-AI-Enabled Smart Healthcare Appointment & Telemedicine Platform",

    description: "SmartHealth is a cloud-native AI-enabled healthcare appointment and telemedicine platform built using Microservices Architecture. The system allows patients to book doctor appointments, attend video consultations, upload medical reports, receive digital prescriptions, and access AI-powered symptom analysis. Built with Spring Boot, Next.js, Tailwind CSS, Docker, and Kubernetes.",

    longDescription: "SmartHealth is a modern cloud-native healthcare platform inspired by real-world telemedicine systems such as Channeling.lk and oDoc. The platform was developed using Microservices Architecture to provide scalable, secure, and high-performance healthcare services for patients, doctors, and administrators.The system enables users to schedule medical appointments, attend online video consultations, upload medical records, receive digital prescriptions, and obtain AI-powered preliminary health suggestions.",

    features: ["User registration and profile management", "Online appointment booking and management", "Real-time telemedicine video consultations", "Digital prescription generation and management", "Medical report and document upload system","AI-powered symptom checker with health suggestions","Email and SMS notification integration","Online payment gateway integration","Admin dashboard for user and platform management"],

    tech: ["Next.js", "Spring Boot", "PostgreSQL", "Tailwind CSS", "OpenAI","Docker","Kubernetes","PayHere", "Jitsi", "Twilio", "Kafka"],

    tags: ["Full Stack","Featured", "AI Powered"],

    accentColor: "#3b82f6",

    github: "https://github.com/jeyixel/Smart-Healthcare-Platform.git",

    gradient: "linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)",

    challenges: ["Designing and managing a scalable microservices architecture", "Managing communication between multiple services", "Integrating real-time video consultation APIs","Configuring Docker containers and Kubernetes deployments","Integrating third-party payment and notification services","Managing API gateway routing and service discovery","Implementing AI-based symptom analysis functionality"],

    outcomes: ["Successfully developed a scalable cloud-native healthcare platform", "Enhanced knowledge of DevOps practices and container orchestration", "Improved teamwork, project planning, and collaboration skills","Strengthened practical experience in full-stack software engineering","Gained hands-on experience with Spring Boot and Next.js development","Implemented secure JWT-based authentication and authorization","Improved understanding of Microservices Architecture and distributed systems"],

  },

  {

    id: "p3",

    title: "RescueNet",

    titleMain :"RescueNet-Disaster Response & Emergency Coordination Platform",

    description: "RescueNet is a MERN-based disaster response and emergency coordination platform developed under UN SDG 11 - Sustainable Cities and Communities. It integrates real-time disaster intelligence, shelter management, SOS help requests, NGO coordination, routing, and missing person reporting into a unified system designed to improve disaster resilience and response efficiency.",

    longDescription: "RescueNet is a MERN-based disaster response and emergency coordination platform developed under UN SDG 11 - Sustainable Cities and Communities. It integrates real-time disaster intelligence, shelter management, SOS help requests, NGO coordination, routing, and missing person reporting into a unified system designed to improve disaster resilience and response efficiency. The platform leverages global APIs (USGS, NASA FIRMS, GDACS, ReliefWeb), geospatial indexing, AI-powered triaging, and real-time communication technologies to deliver situational awareness, resource coordination, and structured emergency workflows. Its modular backend architecture ensures scalability, security, and maintainability, making it suitable for real-world deployment in disaster-prone regions.",

    features: ["Real-time disaster intelligence from global APIs (USGS, NASA FIRMS, GDACS, ReliefWeb)", "Interactive map with geospatial indexing and disaster zones", "SOS help request system with location tracking", "Shelter management with capacity and availability tracking", "NGO coordination and resource allocation platform", "Missing person reporting and matching system",  "Real-time notifications via SMS and email","Relief Campaigns support", "Task Management module","Developed comprehensive testing strategies including performance,unit and integration testing"],

    tech: ["React", "Node.js", "MongoDB", "Express","Socket.io","Notify.lk","Cloudinary","Leaflet","Google Translate","Open-Meteo","Hugging"],

    tags: ["Full Stack","Featured","UN's SDGs"],

    accentColor: "#10b981",

    github: "https://github.com/Master-GB/RescueNet.git",

    demo: "https://rescue-net-8jet.vercel.app/",

    image:"/images/rescunet.png",

    gradient: "linear-gradient(135deg,#052e16 0%,#14532d 50%,#052e16 100%)",

    challenges: ["Integrating multiple global disaster APIs with different data formats", "Implementing real-time geospatial indexing and mapping", "Managing high-concurrency SOS requests during emergencies", "Ensuring data privacy and security for sensitive information"],

    outcomes: ["Successfully developed a fully functional full stack MERN-based Web application","Successfully integrated 5+ global disaster APIs for real-time intelligence", "Achieved sub-second response times for SOS requests",  "Deployed in pilot regions with positive feedback from emergency responders"],

  },

  {

    id: "p4",

    title: "UniVerse",

    titleMain :"UniVerse-Academic & Career Support Management System (ACSMS)",

    description: "UniVerse is a comprehensive Academic & Career Support Management System designed to bridge the gap between students, mentors, and academic resources. This full-stack application provides a unified platform for mentorship, course management, resource sharing, and career development.",

    longDescription: "Many students struggle to find structured guidance for both academics and career preparation. This project aims to bridge that gap by combines academic support tools (exam preparation, resource hub) with career development features (mentorship, internship portal, skill assessments) to give students a one-stop solution for personal and professional growth.So the ACSMS is designed to help university students improve academic performance, prepare for exams, and enhance career readiness by providing an integrated platform for learning resources, mentorship, and internship opportunities.",

    features: ["Course Management: Enroll in courses, track progress, and access learning materials", "Mentorship Program: Connect with experienced mentors and schedule sessions", "Resource Hub: Access a vast library of academic resources and past papers", "Career Development: Build resumes, prepare for interviews, and gets tips", "Access AI agent and get help", "Guidance & Support: Get academic and career guidance from mentors", "Mentor Dashboard: Manage mentorship sessions and track student progress","Resource Management: Share resources, articles, and study materials","Quiz System: Practice with subject-specific quizzes"],

    tech: ["React", "Node.js", "MongoDB", "Express","OpenAI", "Agile","JavaScript"],

    tags: ["Full Stack","Featured", "AI Powered"],

    accentColor: "#ec4899",

    github: "https://github.com/Master-GB/UniVerse.git",

    gradient: "linear-gradient(135deg,#4a044e 0%,#701a75 50%,#4a044e 100%)",

    challenges: ["Managing file uploads for resources and documents with proper storage optimization", "Implementing efficient search and filtering for large resource libraries", "Adapting to Agile methodology as first-time practitioners with 2-week sprint cycles", "Effectively conducting daily stand-ups and sprint retrospectives for continuous improvement", "Managing changing requirements through Agile backlog refinement and user story mapping", "Coordinating team tasks using Kanban boards and sprint planning sessions"],

    outcomes: ["Successfully implemented Agile methodology with 2-week sprints, daily stand-ups, and sprint retrospectives", "Applied Scrum practices including user story mapping, sprint planning, and backlog grooming", "Developed a fully functional MERN stack application with modular architecture", "Implemented secure authentication with role-based access control", "Integrated OpenAI API(Gemini) to provide personalized academic and career recommendations", "Improved collaboration and communication skills through Agile team practices", "Gained proficiency in using project management tools (Jira) for sprint tracking", "Learned to embrace iterative development and continuous feedback loops", "Enhanced ability to estimate task complexity and manage sprint velocity effectively"],

  },

  {

    id: "p5",

    title: "GreenPulse",

    titleMain:"GreenPulse-Community-Driven Clean Energy Platform",

    description: "GreenPulse is a community-driven mobile application designed to promote affordable and clean energy access. It enables households to donate renewable energy as credits, track community energy usage, support low-income families, and encourage sustainable energy practices through transparency, gamification, and smart allocation.",

    longDescription: "GreenPulse is a mobile application developed under UN SDG 7 - Affordable and Clean Energy. The platform connects households with surplus renewable energy to communities in need, creating a sustainable energy sharing ecosystem. Users can donate energy credits, track their environmental impact, discover environmental projects, and participate in community-driven sustainability initiatives. The app features interactive maps, real-time updates, gamification elements, and comprehensive impact tracking to make clean energy accessible and engaging for everyone.",

    features: ["Donate energy through credits/coins","Pay electricity bill using donated credit/coins","Project Discovery and Donation: Browse and filter environmental projects and donate", "Energy tracking module using OCR technology.", "User authentication and profile management","Earn digital badges and certificates for participation","OCR for bill scanning and AI-based credit allocation assistant"],

    tech: ["React Native", "TypeScript", "Tailwind CSS", "Firebase", "OCR", "Google Map"],

    tags: ["Mobile App","Featured","UN's SDGs"],

    accentColor: "#06b6d4",

    github: "https://github.com/Master-GB/GreenPulse.git",

    demo: "https://mysliit-my.sharepoint.com/personal/it23143104_my_sliit_lk/_layouts/15/onedrive.aspx?id=%2Fpersonal%2Fit23143104%5Fmy%5Fsliit%5Flk%2FDocuments%2FY3S1%2FY3S1%2DWD%2D03&ga=1",

    gradient: "linear-gradient(135deg,#082f49 0%,#0c4a6e 50%,#082f49 100%)",

    image:"/images/promo.jpg",

    challenges: ["Designing an intuitive energy credit system that accurately tracks and allocates renewable energy donations", "Implementing real-time energy donation monitoring and visualization for community impact tracking", "Creating an interactive map system that efficiently displays and filters environmental projects by location", "Learning and implementing Firebase for the first time including real-time database and authentication", "Adapting to React Native framework for the first time while building a cross-platform mobile application", "Managing project continuity after a team member left mid-project, redistributing tasks and maintaining development momentum", "Delivering a fully functional application within tight time constraints while ensuring quality and meeting all requirements"],

    outcomes: ["Successfully developed a cross-platform mobile application using React Native with TypeScript", "Implemented a comprehensive energy credit tracking system with real-time updates",  "Integrated Firebase for real-time database and authentication", "Built an interactive map system with filtering capabilities for project discovery", "Contributed to UN SDG 7 by creating a platform that promotes affordable and clean energy access", "Gained expertise in mobile app development with focus on sustainability and social impact"],

  },

  {

    id: "p6",

    title: "HodaHitha.lk",

    titleMain :"HodaHitha.lk-Surplus Food Reduction and Redistribution System",

    description: "HodaHitha.lk is designed to connect restaurants, grocery stores, households, NGOs, and volunteers to efficiently donate and distribute excess food to people in need. The system uses real-time tracking, volunteer coordination, route optimization, and smart food management to reduce food waste and fight hunger in Sri Lanka",

    longDescription: "HodaHitha.lk is a full-stack web-based food redistribution platform developed to address the growing issue of food waste and hunger in Sri Lanka. The system bridges the gap between food donors and underprivileged communities by enabling restaurants, supermarkets, hotels, households, NGOs, and volunteers to collaborate through a centralized digital platform.The system focuses on reducing food waste, improving food safety, enhancing volunteer coordination, and creating a sustainable social impact through technology-driven food redistribution.The platform includes multiple interconnected modules such as donor management, volunteer coordination, food request management, inventory tracking, partnership management, real-time notifications, and delivery route optimization. Donors can post surplus food with expiry details, while volunteers can accept delivery tasks and navigate optimized routes using GPS and Google Maps integration. NGOs and charities can request food in real time, ensuring efficient redistribution to those in need",

    features: ["Donor Management: Restaurants, supermarkets, hotels, and households can register and post surplus food donations", "Food Listing with Expiry Tracking: Donors can list food items with quantity, expiry dates, and pickup/delivery details", "Volunteer Coordination: Volunteers can browse available donations, accept delivery tasks, and manage their schedules", "Route Optimization: GPS and Google Maps integration for optimized delivery routes and real-time navigation", "NGO/Charity Requests: NGOs and charities can request specific food items based on community needs", "Real-time Notifications: SMS and push notifications via Twilio for donation alerts, task assignments, and delivery updates", "Inventory Tracking: Real-time inventory management for operating manager to track food availability and distribution", "Partnership Management: Platform for connecting food businesses with NGOs and volunteer networks", "Impact Dashboard: Analytics showing food saved, meals provided, and environmental impact metrics"],

    tech: ["React", "Node.js", "Chart.js", "MongoDB", "HTML","CSS","JavaScript","Google Map","Leaflet","Twilio"],

    tags: ["Full stack", "UN's SDGs", "Featured"],

    accentColor: "#f59e0b",

    github: "https://github.com/Master-GB/HodaHitha.lk.git",

    gradient: "linear-gradient(135deg,#451a03 0%,#78350f 50%,#451a03 100%)",

    challenges: ["Implementing real-time route optimization using Google Maps API to minimize delivery time and fuel consumption", "Managing food safety and expiry tracking to ensure only safe-to-consume food is redistributed", "Coordinating multiple stakeholders (donors, volunteers, NGOs) with different schedules and availability","Building a scalable inventory system to handle large volumes of food donations and distribution data"],

    outcomes: ["Successfully developed a full-stack web platform connecting food donors, volunteers, and NGOs", "Implemented real-time route optimization", "Created a comprehensive food safety tracking system with automated expiry monitoring", "Built an interactive dashboard showing impact metrics: 5000+ meals saved, 200+ active donors, 150+ volunteers", "Contributed to UN SDG 2 (Zero Hunger) and SDG 12 (Responsible Consumption) by reducing food waste", "Gained expertise in full-stack development with focus on social impact and sustainability", "Implemented secure authentication and role-based access control for different user types"],

  },

  {

    id: "p7",

    title: "FinWise",

    titleMain:"FinWise - Personal Finance Manager",

    description: "FinWise is a comprehensive personal finance management application designed to android users.it help users track their expenses, manage budgets, and gain valuable insights into their spending habits. The app features intuitive dashboards, smart notifications, and detailed analytics to help users make informed financial decisions and achieve their savings goals.",

    longDescription: "FinWise is a native Android application built with Kotlin that provides users with powerful tools to manage their personal finances effectively. The app enables users to track income and expenses, categorize transactions, set and monitor budgets, and gain insights through detailed analytics and reports. Built using MVVM architecture with Room Persistence Library for local data storage, the app ensures data privacy and offline functionality. The application features a modern Material Design 3 interface, secure user authentication with email verification, smart notifications for bill reminders and budget alerts, and comprehensive financial analytics with visual spending overviews and category-wise breakdowns.",

    features: ["Financial Management: Track income and expenses with categorization", "Set and monitor budgets with multi-currency support", "User Authentication: Secure sign up and login", "Dashboard & Analytics: Visual spending overview with charts", "Category-wise expense breakdown and budget progress tracking", "Monthly/Weekly/Daily transaction views for detailed analysis", "Smart Notifications: Transaction reminders,daily summary and budget limit alerts","Backup and Restore Data"],

    tech: ["Kotlin","Room Persistence Library","Material Design 3","Coroutines","Flow"],

    tags: ["Mobile App","Android"],

    accentColor: "#ef4444",

    github: "https://github.com/Master-GB/FinWise.git",

    demo: "",

    gradient: "linear-gradient(135deg,#450a0a 0%,#7f1d1d 50%,#450a0a 100%)",

    challenges: ["Learning Kotlin and Android development for the first time while building a production-ready application","Designing an efficient database schema using Room Persistence Library for complex financial data relationships","Building real-time budget tracking and alert system using Kotlin Coroutines and Flow", "Creating interactive charts and visualizations for financial analytics using Android native libraries", "Handling offline data synchronization and ensuring data consistency across app sessions"],

    outcomes: ["Successfully developed a native Android application using Kotlin with MVVM architecture", "Implemented Room Persistence Library for efficient local data storage,backup and retrieval", "Created a secure authentication system", "Built comprehensive financial analytics with interactive charts and visualizations", "Implemented smart notification system for reminders and budget alerts", "Gained expertise in Android development with modern Kotlin features and coroutines"],

  },

  {

    id: "p8",

    title: "MediFlow",

    titleMain:"MediFlow-Smart Clinic & Patient Management System ",

    description: "Project description goes here",

    longDescription: "",

    features: [""],

    tech: ["Vite","Tailwind CSS","MongoDB","Node.js","Express"],

    tags: ["Full Stack","Featured","AI Powered","Ongoing"],

    accentColor: "#a855f7",

    github: "https://github.com/Master-GB/MediFlow.git",

    demo: "",

    gradient: "linear-gradient(135deg,#3b0764 0%,#581c87 50%,#3b0764 100%)",

    challenges: [""],

    outcomes: [""],

  },

];



/* ─── Project Detail Modal ─────────────────────────────────────────────────── */



function ProjectDetailModal({ project, onClose }: { project: Project; onClose: () => void }) {

  return (

    <motion.div

      initial={{ opacity: 0 }}

      animate={{ opacity: 1 }}

      exit={{ opacity: 0 }}

      onClick={onClose}

      style={{

        position: "fixed",

        inset: 0,

        background: "rgba(0,0,0,0.8)",

        backdropFilter: "blur(8px)",

        zIndex: 1000,

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        padding: "2rem",

      }}

    >

      <motion.div

        initial={{ scale: 0.9, opacity: 0 }}

        animate={{ scale: 1, opacity: 1 }}

        exit={{ scale: 0.9, opacity: 0 }}

        transition={{ duration: 0.2 }}

        onClick={(e) => e.stopPropagation()}

        style={{

          maxWidth: "800px",

          width: "100%",

          maxHeight: "80vh",

          background: "rgba(15,15,30,0.95)",

          borderRadius: 20,

          border: `1px solid ${project.accentColor}40`,

          boxShadow: `0 0 60px ${project.accentColor}30`,

          overflow: "hidden",

          display: "flex",

          flexDirection: "column",

        }}

      >

        {/* Header */}

        <div style={{

          padding: "1.5rem",

          background: project.gradient,

          borderBottom: `1px solid ${project.accentColor}30`,

          position: "relative",

        }}>

          <button

            onClick={onClose}

            style={{

              position: "absolute",

              top: "1rem",

              right: "1rem",

              width: "32px",

              height: "32px",

              borderRadius: "50%",

              background: "rgba(255,255,255,0.1)",

              border: "1px solid rgba(255,255,255,0.2)",

              color: "#fff",

              cursor: "pointer",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              transition: "all 0.2s",

            }}

            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}

            onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}

          >

            <X size={16} />

          </button>

          <h2 style={{

            margin: 0,

            fontSize: "1.5rem",

            fontWeight: 800,

            color: "#fff",

            textShadow: `0 0 20px ${project.accentColor}`,

          }}>

            {project.titleMain}

          </h2>

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>

            {project.tags.map((tag) => {

              const tagStyle = TAG_COLORS[tag] ?? TAG_COLORS["Web App"];

              return (

                <span

                  key={tag}

                  style={{

                    padding: "0.25rem 0.7rem",

                    borderRadius: 8,

                    fontSize: "0.7rem",

                    fontWeight: 700,

                    background: tagStyle.bg,

                    color: tagStyle.text,

                    border: `1px solid ${tagStyle.border}`,

                  }}

                >

                  {tag}

                </span>

              );

            })}

          </div>

        </div>



        {/* Content */}

        <div style={{ padding: "1.5rem", overflowY: "auto", flex: 1 }}>

          {/* Description */}

          <div style={{ marginBottom: "1.5rem" }}>

            <h3 style={{

              margin: "0 0 0.75rem",

              fontSize: "0.9rem",

              fontWeight: 700,

              color: project.accentColor,

              textTransform: "uppercase",

              letterSpacing: "0.05em",

            }}>

              About

            </h3>

            <p style={{

              margin: 0,

              fontSize: "0.9rem",

              lineHeight: 1.7,

              color: "#cbd5e1",

            }}>

              {project.longDescription || project.description}

            </p>

          </div>



          {/* Features */}

          {project.features && project.features.length > 0 && (

            <div style={{ marginBottom: "1.5rem" }}>

              <h3 style={{

                margin: "0 0 0.75rem",

                fontSize: "0.9rem",

                fontWeight: 700,

                color: project.accentColor,

                textTransform: "uppercase",

                letterSpacing: "0.05em",

              }}>

                Key Features

              </h3>

              <ul style={{

                margin: 0,

                paddingLeft: "1.25rem",

                display: "flex",

                flexDirection: "column",

                gap: "0.5rem",

              }}>

                {project.features.map((feature, i) => (

                  <li key={i} style={{

                    fontSize: "0.85rem",

                    color: "#94a3b8",

                    lineHeight: 1.6,

                  }}>

                    {feature}

                  </li>

                ))}

              </ul>

            </div>

          )}



          {/* Tech Stack */}

          <div style={{ marginBottom: "1.5rem" }}>

            <h3 style={{

              margin: "0 0 0.75rem",

              fontSize: "0.9rem",

              fontWeight: 700,

              color: project.accentColor,

              textTransform: "uppercase",

              letterSpacing: "0.05em",

            }}>

              Technologies Used

            </h3>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>

              {project.tech.map((tech) => {

                const tb = TECH_BADGES[tech] ?? { color: "#94a3b8", bg: "rgba(255,255,255,0.08)" };

                return (

                  <span key={tech} style={{

                    padding: "0.35rem 0.75rem",

                    borderRadius: 8,

                    fontSize: "0.75rem",

                    fontWeight: 600,

                    background: tb.bg,

                    color: tb.color,

                    border: "1px solid rgba(255,255,255,0.1)",

                  }}>

                    {tech}

                  </span>

                );

              })}

            </div>

          </div>



          {/* Challenges */}

          {project.challenges && project.challenges.length > 0 && (

            <div style={{ marginBottom: "1.5rem" }}>

              <h3 style={{

                margin: "0 0 0.75rem",

                fontSize: "0.9rem",

                fontWeight: 700,

                color: project.accentColor,

                textTransform: "uppercase",

                letterSpacing: "0.05em",

              }}>

                Challenges

              </h3>

              <ul style={{

                margin: 0,

                paddingLeft: "1.25rem",

                display: "flex",

                flexDirection: "column",

                gap: "0.5rem",

              }}>

                {project.challenges.map((challenge, i) => (

                  <li key={i} style={{

                    fontSize: "0.85rem",

                    color: "#94a3b8",

                    lineHeight: 1.6,

                  }}>

                    {challenge}

                  </li>

                ))}

              </ul>

            </div>

          )}



          {/* Outcomes */}

          {project.outcomes && project.outcomes.length > 0 && (

            <div style={{ marginBottom: "1.5rem" }}>

              <h3 style={{

                margin: "0 0 0.75rem",

                fontSize: "0.9rem",

                fontWeight: 700,

                color: project.accentColor,

                textTransform: "uppercase",

                letterSpacing: "0.05em",

              }}>

                Outcomes

              </h3>

              <ul style={{

                margin: 0,

                paddingLeft: "1.25rem",

                display: "flex",

                flexDirection: "column",

                gap: "0.5rem",

              }}>

                {project.outcomes.map((outcome, i) => (

                  <li key={i} style={{

                    fontSize: "0.85rem",

                    color: "#94a3b8",

                    lineHeight: 1.6,

                  }}>

                    {outcome}

                  </li>

                ))}

              </ul>

            </div>

          )}

        </div>



        {/* Footer */}

        <div style={{

          padding: "1rem 1.5rem",

          borderTop: "1px solid rgba(255,255,255,0.1)",

          display: "flex",

          gap: "0.75rem",

          justifyContent: "flex-end",

        }}>

          <a

            href={project.github}

            target="_blank"

            rel="noopener noreferrer"

            style={{

              display: "flex",

              alignItems: "center",

              gap: "0.5rem",

              padding: "0.6rem 1.2rem",

              borderRadius: 10,

              background: "rgba(255,255,255,0.1)",

              border: "1px solid rgba(255,255,255,0.2)",

              color: "#fff",

              fontSize: "0.85rem",

              fontWeight: 600,

              textDecoration: "none",

              transition: "all 0.2s",

            }}

            onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {

              e.currentTarget.style.background = "rgba(255,255,255,0.15)";

            }}

            onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {

              e.currentTarget.style.background = "rgba(255,255,255,0.1)";

            }}

          >

            <GitBranch size={16} />

            GitHub

          </a>

          {project.demo && (

            <a

              href={project.demo}

              target="_blank"

              rel="noopener noreferrer"

              style={{

                display: "flex",

                alignItems: "center",

                gap: "0.5rem",

                padding: "0.6rem 1.2rem",

                borderRadius: 10,

                background: `linear-gradient(135deg, ${project.accentColor}, ${project.accentColor}dd)`,

                border: `1px solid ${project.accentColor}60`,

                color: "#fff",

                fontSize: "0.85rem",

                fontWeight: 600,

                textDecoration: "none",

                transition: "all 0.2s",

                boxShadow: `0 0 20px ${project.accentColor}40`,

              }}

              onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {

                e.currentTarget.style.transform = "translateY(-2px)";

              }}

              onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {

                e.currentTarget.style.transform = "translateY(0)";

              }}

            >

              <ExternalLink size={16} />

              {project.id === "p5" ? "Get App" : "Live Demo"}

            </a>

          )}

        </div>

      </motion.div>

    </motion.div>

  );

}



/* ─── Project Card ──────────────────────────────────────────────────────── */



function ProjectCard({ project, index, onClick }: { project: Project; index: number; onClick: () => void }) {

  const [hovered, setHovered] = useState(false);

  // Determine tag colors for each tag

  const tagElements = (project.tags || []).map((t) => {

    const tag = TAG_COLORS[t] ?? TAG_COLORS["Web App"];

    return (

      <span

        key={t}

        style={{

          padding: "0.25rem 0.7rem",

          borderRadius: 8,

          fontSize: "0.65rem",

          fontWeight: 700,

          background: tag.bg,

          color: tag.text,

          border: `1px solid ${tag.border}`,

          backdropFilter: "blur(10px)",

          marginRight: "0.4rem",

        }}

      >

        {t}

      </span>

    );

  });



  return (

    <motion.div

      initial={{ opacity: 0, y: 20 }}

      animate={{ opacity: 1, y: 0 }}

      transition={{ delay: index * 0.08, duration: 0.45 }}

      onMouseEnter={() => setHovered(true)}

      onMouseLeave={() => setHovered(false)}

      onClick={onClick}

      style={{

        borderRadius: 18,

        border: `1px solid ${hovered ? project.accentColor + "60" : "rgba(255,255,255,0.08)"}`,

        background: "rgba(15,15,30,0.6)",

        backdropFilter: "blur(20px)",

        overflow: "hidden",

        cursor: "pointer",

        transition: "all 0.35s ease",

        boxShadow: hovered

          ? `0 8px 40px ${project.accentColor}30, 0 0 0 1px ${project.accentColor}30`

          : "0 4px 20px rgba(0,0,0,0.3)",

        transform: hovered ? "translateY(-4px)" : "translateY(0)",

      }}

    >

      {/* Preview Area */}

      <div style={{

        height: 200, position: "relative", overflow: "hidden",

        background: project.gradient,

      }}>

        {project.image ? (

          <img

            src={project.image}

            alt={project.title}

            style={{

              position: "absolute",

              width: "100%",

              height: "100%",

              transition: "transform 0.5s ease",

            }}

          />

        ) : (

          <>

            {/* Abstract grid lines */}

            <div style={{

              position: "absolute", inset: 0,

              backgroundImage: `

                linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),

                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)

              `,

              backgroundSize: "24px 24px",

            }} />

            {/* Glow orb */}

            <div style={{

              position: "absolute", bottom: -30, right: -30,

              width: 140, height: 140, borderRadius: "50%",

              background: `radial-gradient(circle, ${project.accentColor}50 0%, transparent 70%)`,

              filter: "blur(20px)",

            }} />

            {/* Floating icons */}

            <div style={{

              position: "absolute", inset: 0,

              display: "flex", alignItems: "center", justifyContent: "center",

              opacity: 0.15,

            }}>

              <Code2 size={64} color={project.accentColor} />

            </div>

          </>

        )}

        {/* Tag badges */}

        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexWrap: "wrap" }}>

          {tagElements}

        </div>

        {/* Hover overlay */}

        <motion.div

          animate={{ opacity: hovered ? 1 : 0 }}

          style={{

            position: "absolute", inset: 0,

            background: `linear-gradient(135deg, ${project.accentColor}15, transparent)`,

            transition: "opacity 0.3s",

          }}

        />

      </div>



      {/* Content */}

      <div style={{ padding: "1.1rem" }}>

        {/* Title */}

        <h3 style={{

          margin: 0, fontSize: "0.95rem", fontWeight: 700,

          color: hovered ? "#fff" : "#e2e8f0",

          transition: "color 0.3s",

        }}>

          {project.title}

        </h3>



        {/* Description */}

        <p style={{

          margin: "0.5rem 0 0.9rem", fontSize: "0.75rem", lineHeight: 1.55,

          color: "#64748b",

        }}>

          {project.description}

        </p>



        {/* Tech stack */}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.9rem" }}>

          {project.tech.map((t) => {

            const tb = TECH_BADGES[t] ?? { color: "#94a3b8", bg: "rgba(255,255,255,0.08)" };

            return (

              <span key={t} style={{

                padding: "0.2rem 0.55rem", borderRadius: 6, fontSize: "0.62rem", fontWeight: 500,

                background: tb.bg, color: tb.color, border: "1px solid rgba(255,255,255,0.08)",

              }}>{t}</span>

            );

          })}

        </div>



        {/* Footer */}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>



          {/* Action buttons */}

          <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>

            <a href={project.github} target="_blank" rel="noopener noreferrer"

              className="icon-link"

              onClick={(e) => e.stopPropagation()}

            >

              <GitBranch size={12} color="#94a3b8" />

            </a>

            {project.demo && (

              <a href={project.demo} target="_blank" rel="noopener noreferrer"

                className="icon-link"

                onClick={(e) => e.stopPropagation()}

              >

                <ExternalLink size={12} color="#94a3b8" />

              </a>

            )}

            <motion.div

              whileHover={{ scale: 1.1 }}

              onClick={(e) => {

                e.stopPropagation();

                onClick();

              }}

              style={{

                width: 32, height: 32, borderRadius: "50%",

                background: hovered

                  ? `linear-gradient(135deg, ${project.accentColor}, ${project.accentColor}bb)`

                  : "rgba(255,255,255,0.06)",

                display: "flex", alignItems: "center", justifyContent: "center",

                cursor: "pointer", transition: "background 0.3s",

                boxShadow: hovered ? `0 0 20px ${project.accentColor}60` : "none",

              }}

            >

              <ArrowRight size={14} color="#fff" />

            </motion.div>

          </div>

        </div>

      </div>

    </motion.div>

  );

}



/* ─── Main Component ────────────────────────────────────────────────────── */



export default function ProjectsApp() {

  const [activeNav, setActiveNav] = useState("all");

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);



  // Update filter to handle multiple tags

  const filteredProjects = PROJECTS.filter((p) => {

    const matchesSearch =

      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||

      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||

      p.tech.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat =

      selectedCategory === "All Categories" || (p.tags && p.tags.includes(selectedCategory));

    return matchesSearch && matchesCat;

  });



  const handleClickOutside = useCallback((e: MouseEvent) => {

    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {

      setShowCategoryDropdown(false);

    }

  }, []);



  useEffect(() => {

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);

  }, [handleClickOutside]);



  return (

    <div className="projects-app-root">

      <style dangerouslySetInnerHTML={{

        __html: `

        .projects-app-root {

          position: relative;

          margin: -0.8rem;

          width: calc(100% + 1.6rem);

          height: calc(100% + 1.6rem);

          background: #050816;

          overflow: hidden;

          font-family: inherit;

          display: flex;

          flex-direction: column;

        }



        .projects-layout {

          display: flex;

          flex: 1;

          overflow: hidden;

          position: relative;

          z-index: 5;

        }



        .projects-sidebar {

          width: 230px;

          flex-shrink: 0;

          background: rgba(255,255,255,0.02);

          border-right: 1px solid rgba(255,255,255,0.06);

          display: flex;

          flex-direction: column;

          padding: 1rem 0;

          position: relative;

          z-index: 10;

          backdrop-filter: blur(20px);

        }



        @media (max-width: 1024px) {

          .projects-sidebar {

            display: none;

          }

        }



        .projects-main {

          flex: 1;

          overflow-y: auto;

          padding: 3rem 1.8rem 3rem 1rem;

          position: relative;

        }



        @media (max-width: 1024px) {

          .projects-main {

            padding: 2rem 3rem;

          }

        }



        @media (max-width: 640px) {

          .projects-main {

            padding: 1rem;

          }

        }



        .projects-main::-webkit-scrollbar {

          display: none;

        }

        .projects-main {

          -ms-overflow-style: none;

          scrollbar-width: none;

        }



        .nav-item {

          display: flex;

          align-items: center;

          gap: 0.65rem;

          padding: 0.55rem 1rem;

          margin: 0.1rem 0.5rem;

          border-radius: 10px;

          cursor: pointer;

          transition: all 0.25s ease;

          font-size: 0.8rem;

          font-weight: 500;

          color: #64748b;

          border: 1px solid transparent;

          text-decoration: none;

          user-select: none;

        }



        .nav-item:hover {

          color: #94a3b8;

          background: rgba(255,255,255,0.04);

        }



        .nav-item.active {

          color: #c4b5fd;

          background: rgba(139,92,246,0.15);

          border-color: rgba(139,92,246,0.25);

          box-shadow: 0 0 12px rgba(139,92,246,0.1);

        }



        .nav-item.active svg {

          filter: drop-shadow(0 0 6px rgba(139,92,246,0.8));

        }



        .stat-card {

          padding: 1rem;

          border-radius: 14px;

          border: 1px solid rgba(255,255,255,0.08);

          transition: all 0.3s ease;

          position: relative;

          overflow: hidden;

          backdrop-filter: blur(10px);

        }

        

        .icon-link {

          width: 28px;

          height: 28px;

          border-radius: 50%;

          background: rgba(255,255,255,0.06);

          border: 1px solid rgba(255,255,255,0.1);

          display: flex;

          align-items: center;

          justify-content: center;

          transition: all 0.2s;

          text-decoration: none;

        }

        .icon-link:hover {

          background: rgba(255, 255, 255, 0);

          transform: scale(1.2);

        }



        .stat-card:hover {

          transform: translateY(-2px);

        }



        .stat-card::before {

          content: "";

          position: absolute;

          inset: 0;

          border-radius: 14px;

          opacity: 0;

          transition: opacity 0.3s;

          background: linear-gradient(135deg, rgba(139,92,246,0.05), transparent);

        }



        .stat-card:hover::before {

          opacity: 1;

        }



        .search-input {

          background: transparent;

          border: none;

          outline: none;

          color: #e2e8f0;

          font-size: 0.82rem;

          width: 100%;

          font-family: inherit;

        }



        .search-input::placeholder {

          color: #475569;

        }



        .project-grid {

          display: grid;

          grid-template-columns: repeat(3, 1fr);

          gap: 1rem;

        }



        @media (max-width: 1024px) {

          .project-grid {

            grid-template-columns: repeat(2, 1fr);

            gap: 1.5rem;

          }

        }



        @media (max-width: 640px) {

          .project-grid {

            grid-template-columns: 1fr;

            gap: 1rem;

          }

        }



        .project-list {

          display: flex;

          flex-direction: column;

          gap: 0.6rem;

        }



        .category-dropdown {

          position: absolute;

          top: calc(100% + 6px);

          right: 0;

          background: rgba(10,10,30,0.96);

          border: 1px solid rgba(139,92,246,0.3);

          border-radius: 12px;

          padding: 0.4rem;

          z-index: 100;

          min-width: 180px;

          backdrop-filter: blur(20px);

          box-shadow: 0 10px 40px rgba(0,0,0,0.5);

        }



        .category-option {

          padding: 0.45rem 0.8rem;

          border-radius: 8px;

          cursor: pointer;

          font-size: 0.78rem;

          color: #94a3b8;

          transition: all 0.2s;

        }



        .category-option:hover {

          background: rgba(139,92,246,0.15);

          color: #c4b5fd;

        }



        .category-option.selected {

          background: rgba(139,92,246,0.2);

          color: #c4b5fd;

        }



        @keyframes projects-pulse-glow {

          0%, 100% { opacity: 0.5; }

          50% { opacity: 1; }

        }



        @keyframes projects-float {

          0%, 100% { transform: translateY(0px); }

          50% { transform: translateY(-6px); }

        }



        .profile-card {

          margin: 0.5rem;

          padding: 0.85rem;

          border-radius: 12px;

          background: rgba(255,255,255,0.03);

          border: 1px solid rgba(255,255,255,0.06);

          backdrop-filter: blur(10px);

        }

      ` }} />



      {/* Particle Background */}

      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>

        <ParticleCanvas />

        {/* Background glow orbs */}

        <div style={{

          position: "absolute", top: "20%", left: "10%",

          width: 300, height: 300, borderRadius: "50%",

          background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",

          filter: "blur(40px)", pointerEvents: "none",

        }} />

        <div style={{

          position: "absolute", bottom: "10%", right: "5%",

          width: 400, height: 400, borderRadius: "50%",

          background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)",

          filter: "blur(50px)", pointerEvents: "none",

        }} />

      </div>



      {/* Layout */}

      <div className="projects-layout">

        {/* ── Sidebar ── */}

        <div className="projects-sidebar hidden lg:flex">

          {/* Logo */}

          <div style={{

            display: "flex", alignItems: "center", gap: "0.6rem",

            padding: "0.25rem 1rem 1rem",

            borderBottom: "1px solid rgba(255,255,255,0.06)",

            marginBottom: "0.5rem",

          }}>

            <div style={{

              width: 28, height: 28, borderRadius: 8,

              background: "linear-gradient(135deg,#8b5cf6,#6366f1)",

              display: "flex", alignItems: "center", justifyContent: "center",

              boxShadow: "0 0 16px rgba(139,92,246,0.5)",

            }}>

              <FolderKanban size={14} color="#fff" />

            </div>

            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#e2e8f0" }}>Projects</span>

          </div>



          {/* Nav Items */}

          <div style={{ flex: 1 }}>

            {SIDEBAR_ITEMS.map((item) => {

              const Icon = item.icon;

              const isActive = activeNav === item.id;

              return (

                <div

                  key={item.id}

                  className={`nav-item ${isActive ? "active" : ""}`}

                  onClick={() => {

                    setActiveNav(item.id);

                    const newCategory = item.id === "all" ? "All Categories" : item.id;

                    setSelectedCategory(newCategory);

                    setShowCategoryDropdown(false);

                  }}

                >

                  <Icon size={15} />

                  <span>{item.label}</span>

                  {isActive && (

                    <motion.div

                      layoutId="activeNav"

                      style={{

                        position: "absolute", left: 0,

                        width: 3, height: 24, borderRadius: "0 3px 3px 0",

                        background: "linear-gradient(180deg,#8b5cf6,#6366f1)",

                      }}

                    />

                  )}

                </div>

              );

            })}

          </div>



          {/* Profile Card */}

          <div className="profile-card">

            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>

              {/* Avatar */}

              <img

                src="/profile.jpeg"

                alt="Gihan Bandara"

                style={{

                  width: 36, height: 36, borderRadius: "50%",

                  objectFit: "cover",

                  boxShadow: "0 0 12px rgba(139,92,246,0.4)",

                  flexShrink: 0,

                }}

              />

              <div style={{ minWidth: 0 }}>

                <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>

                  Gihan Bandara

                </div>

                <div style={{ fontSize: "0.65rem", color: "#64748b" }}>Software Engineer</div>

              </div>

              {/* Online dot */}

              <div style={{

                width: 8, height: 8, borderRadius: "50%",

                background: "#10b981", marginLeft: "auto", flexShrink: 0,

                boxShadow: "0 0 6px #10b981",

                animation: "projects-pulse-glow 2s infinite",

              }} />

            </div>

          </div>

        </div>



        {/* ── Main Content ── */}

        <div className="projects-main">

          {/* Header */}

          <motion.div

            initial={{ opacity: 0, y: -10 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ duration: 0.5 }}

            style={{ marginBottom: "1.25rem" }}

          >

            <h2 style={{

              margin: 0,

              fontSize: "1.5rem",

              fontWeight: 800,

              color: "#e2e8f0",

              display: "flex", alignItems: "center", gap: "0.4rem",

            }}>

              {CATEGORY_INFO[activeNav]?.title || "My Projects"}

              <motion.div

                animate={{ rotate: [0, 15, -10, 0] }}

                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}

                style={{ display: "inline-flex" }}

              >

                {(() => {

                  const Icon = CATEGORY_INFO[activeNav]?.icon || Sparkles;

                  return <Icon size={20} style={{ color: "#8b5cf6", filter: "drop-shadow(0 0 6px #8b5cf6)" }} />;

                })()}

              </motion.div>

            </h2>

            <p style={{ margin: "0.35rem 0 0", fontSize: "0.9rem", color: "#385379ff",fontWeight:"400" }}>

              {CATEGORY_INFO[activeNav]?.description || "Explore my creative work and the solutions I've built."}

            </p>

          </motion.div>



          {/* Stat Cards */}

          {activeNav === "all" && (

          <div style={{

            display: "grid", gridTemplateColumns: "repeat(4,1fr)",

            gap: "0.75rem", marginBottom: "1.25rem",

          }}

          className="grid grid-cols-4 gap-3 mb-5 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1"

          >

            {STAT_CARDS.map((card, i) => {

              const Icon = card.icon;

              return (

                <motion.div

                  key={card.label}

                  initial={{ opacity: 0, y: 16 }}

                  animate={{ opacity: 1, y: 0 }}

                  transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}

                  className="stat-card"

                  style={{ background: card.gradient }}

                >

                  {/* Glow */}

                  <div style={{

                    position: "absolute", top: 0, right: 0, width: 60, height: 60,

                    borderRadius: "50%",

                    background: `radial-gradient(circle, ${card.glow} 0%, transparent 70%)`,

                    filter: "blur(16px)",

                  }} />

                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.5rem" }}>

                    <div style={{

                      width: 32, height: 32, borderRadius: 9,

                      background: `rgba(${card.color.slice(1).match(/../g)!.map(x => parseInt(x, 16)).join(",")},0.2)`,

                      display: "flex", alignItems: "center", justifyContent: "center",

                      border: `1px solid ${card.color}40`,

                    }}>

                      <Icon size={16} style={{ color: card.color, filter: `drop-shadow(0 0 4px ${card.color})` }} />

                    </div>

                  </div>

                  <div style={{

                    fontSize: "1.6rem", fontWeight: 800, color: "#fff",

                    lineHeight: 1, marginBottom: "0.2rem",

                    textShadow: `0 0 20px ${card.glow}`,

                  }}>

                    <AnimatedCounter target={card.value} suffix={card.suffix} />

                  </div>

                  <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: "0.25rem", fontWeight: 500 }}>

                    {card.label}

                  </div>

                  <div style={{

                    fontSize: "0.65rem",

                    color: card.color,

                    filter: `drop-shadow(0 0 4px ${card.color})`,

                  }}>

                    {card.sub}

                  </div>

                </motion.div>

              );

            })}

          </div>

          )}



          {/* Search & Filter Bar */}

          <motion.div

            initial={{ opacity: 0, y: 10 }}

            animate={{ opacity: 1, y: 0 }}

            transition={{ delay: 0.5, duration: 0.4 }}

            className="flex items-center gap-4 lg:gap-16 mb-4 flex-wrap"

            style={{

              display: "flex", alignItems: "center", gap: "1rem",

              marginBottom: "1.1rem",

            }}

          >

            {/* Search */}

            <div style={{

              width: "550px", display: "flex", alignItems: "center", gap: "0.6rem",

              padding: "0.55rem 0.9rem",

              background: "rgba(255,255,255,0.03)",

              border: "1px solid rgba(255,255,255,0.08)",

              borderRadius: 12,

              transition: "border-color 0.2s",

            }}

            className="w-full lg:w-[800px] md:w-full"

            >

              <Search size={14} style={{ color: "#475569", flexShrink: 0 }} />

              <input

                className="search-input"

                placeholder="Search projects..."

                value={searchQuery}

                onChange={(e) => setSearchQuery(e.target.value)}

              />

            </div>



            {/* Category Dropdown */}

            <div style={{ position: "relative", marginLeft: "auto" }} ref={dropdownRef} className="ml-auto block xl:hidden">

              <button

                onClick={() => setShowCategoryDropdown((v) => !v)}

                style={{

                  display: "flex", alignItems: "center", gap: "0.5rem",

                  padding: "0.55rem 0.9rem",

                  background: "rgba(255,255,255,0.03)",

                  border: `1px solid ${showCategoryDropdown ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`,

                  borderRadius: 12, cursor: "pointer",

                  color: "#94a3b8", fontSize: "0.78rem",

                  whiteSpace: "nowrap", fontFamily: "inherit",

                  transition: "all 0.2s",

                }}

              >

                {selectedCategory}

                <ChevronDown size={13} style={{

                  transform: showCategoryDropdown ? "rotate(180deg)" : "none",

                  transition: "transform 0.2s",

                }} />

              </button>

              <AnimatePresence>

                {showCategoryDropdown && (

                  <motion.div

                    initial={{ opacity: 0, y: -8, scale: 0.96 }}

                    animate={{ opacity: 1, y: 0, scale: 1 }}

                    exit={{ opacity: 0, y: -8, scale: 0.96 }}

                    transition={{ duration: 0.18 }}

                    className="category-dropdown"

                  >

                    {CATEGORIES.map((cat) => (

                      <div

                        key={cat}

                        className={`category-option ${selectedCategory === cat ? "selected" : ""}`}

                        onClick={() => {

                          setSelectedCategory(cat);

                          setShowCategoryDropdown(false);

                          const navId = cat === "All Categories" ? "all" : cat;

                          setActiveNav(navId);

                        }}

                      >

                        {cat}

                      </div>

                    ))}

                  </motion.div>

                )}

              </AnimatePresence>

            </div>

          </motion.div>



          {/* Results count */}

          <motion.div

            initial={{ opacity: 0 }}

            animate={{ opacity: 1 }}

            transition={{ delay: 0.6 }}

            style={{

              fontSize: "0.72rem", color: "#475569", marginBottom: "0.9rem",

              display: "flex", alignItems: "center", gap: "0.5rem",

            }}

          >

            <span style={{

              width: 6, height: 6, borderRadius: "50%", background: "#8b5cf6",

              display: "inline-block", boxShadow: "0 0 6px #8b5cf6",

              animation: "projects-pulse-glow 2s infinite",

            }} />

            Showing {filteredProjects.length} of {PROJECTS.length} projects

          </motion.div>



          {/* Project Grid */}

          <AnimatePresence mode="wait">

            {filteredProjects.length > 0 ? (

              <motion.div

                key="grid"

                initial={{ opacity: 0 }}

                animate={{ opacity: 1 }}

                exit={{ opacity: 0 }}

                transition={{ duration: 0.25 }}

                className="project-grid grid grid-cols-3 gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1"

              >

                {filteredProjects.map((project, i) => (

                  <ProjectCard key={project.id} project={project} index={i} onClick={() => setSelectedProject(project)} />

                ))}

              </motion.div>

            ) : (

              <motion.div

                initial={{ opacity: 0, scale: 0.95 }}

                animate={{ opacity: 1, scale: 1 }}

                style={{

                  textAlign: "center", padding: "3rem",

                  color: "#475569", fontSize: "0.85rem",

                }}

              >

                <Search size={40} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />

                <div style={{ fontWeight: 600, color: "#64748b", marginBottom: "0.35rem" }}>No projects found</div>

                <div style={{ fontSize: "0.75rem" }}>Try a different search term or category</div>

              </motion.div>

            )}

          </AnimatePresence>



          {/* Bottom padding */}

          <div style={{ height: "1rem" }} />

        </div>

      </div>



      {/* Top glowing divider */}

      <div style={{

        position: "absolute", top: 0, left: 0, right: 0, height: 1,

        background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), rgba(99,102,241,0.4), transparent)",

        zIndex: 20,

      }} />



      {/* Project Detail Modal */}

      <AnimatePresence>

        {selectedProject && (

          <ProjectDetailModal

            project={selectedProject}

            onClose={() => setSelectedProject(null)}

          />

        )}

      </AnimatePresence>

    </div>

  );

}

