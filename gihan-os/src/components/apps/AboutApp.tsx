"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Mail, Code, Link2, Cpu, BarChart2, Star, GitBranch, GitCommit, Layers } from "lucide-react";
import { profile } from "@/data/portfolio";
import { useOS } from "@/contexts/OSContext";

const GITHUB_USERNAME = "Master-GB";

/* ─── Canvas Galaxy ─────────────────────────────────────────────────────── */

function GalaxyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    interface Star {
      x: number; y: number; baseX: number; baseY: number; r: number; alpha: number; dAlpha: number;
    }
    const STAR_COUNT = 270;
    const stars: Star[] = [];

    const initStars = () => {
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        stars.push({
          x, y, baseX: x, baseY: y,
          r: Math.random() * 1.6 + 0.2,
          alpha: Math.random(),
          dAlpha: (Math.random() * 0.005 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
        });
      }
    };

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initStars();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => { mouse.x = -1000; mouse.y = -1000; };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseout", handleMouseLeave);

    interface Meteor {
      x: number; y: number; len: number; speed: number; alpha: number; active: boolean; timer: number;
    }
    const METEOR_COUNT = 17;
    const meteors: Meteor[] = [];

    const spawnMeteor = (): Meteor => ({
      x: Math.random() * canvas.width * 1.5,
      y: Math.random() * canvas.height * 0.5 - canvas.height * 0.25,
      len: Math.random() * 120 + 60,
      speed: Math.random() * 6 + 4,
      alpha: 1,
      active: true,
      timer: Math.random() * 180,
    });

    for (let i = 0; i < METEOR_COUNT; i++) {
      const m = spawnMeteor();
      m.timer = Math.random() * 300;
      meteors.push(m);
    }

    const drawNebula = () => {
      const blobs = [
        { x: canvas.width * 0.2, y: canvas.height * 0.3, r: canvas.width * 0.35, c: "rgba(99,102,241,0.07)" },
        { x: canvas.width * 0.75, y: canvas.height * 0.6, r: canvas.width * 0.3, c: "rgba(34,211,238,0.05)" },
        { x: canvas.width * 0.5, y: canvas.height * 0.8, r: canvas.width * 0.25, c: "rgba(244,114,182,0.04)" },
      ];
      blobs.forEach(({ x, y, r, c }) => {
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, c);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
    };

    const draw = () => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawNebula();

      stars.forEach((s) => {
        s.alpha += s.dAlpha;
        if (s.alpha <= 0 || s.alpha >= 1) s.dAlpha *= -1;

        const dx = mouse.x - s.baseX;
        const dy = mouse.y - s.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 120;

        let targetX = s.baseX;
        let targetY = s.baseY;
        let extraRadius = 0;
        let extraAlpha = 0;

        if (dist < maxDist) {
          const force = (maxDist - dist) / maxDist;
          targetX -= (dx / dist) * force * 40;
          targetY -= (dy / dist) * force * 40;
          extraRadius = force * 1.5;
          extraAlpha = force * 0.5;
        }

        s.x += (targetX - s.x) * 0.1;
        s.y += (targetY - s.y) * 0.1;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r + extraRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, s.alpha + extraAlpha))})`;
        ctx.fill();
      });

      meteors.forEach((m) => {
        if (!m.active) return;
        if (m.timer > 0) { m.timer--; return; }

        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.len, m.y - m.len * 0.55);
        grad.addColorStop(0, `rgba(255,255,255,${m.alpha})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.len, m.y - m.len * 0.55);
        ctx.stroke();

        const glow = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 4);
        glow.addColorStop(0, `rgba(255,255,255,${m.alpha})`);
        glow.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 4, 0, Math.PI * 2);
        ctx.fill();

        m.x += m.speed;
        m.y += m.speed * 0.55;
        m.alpha -= 0.008;

        if (m.x > canvas.width + 100 || m.y > canvas.height + 100 || m.alpha <= 0) {
          Object.assign(m, spawnMeteor());
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseout", handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
        background: "#000",
      }}
    />
  );
}

/* ─── Animated Counter ─────────────────────────────────────────────────── */

function AnimatedCounter({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Radial Chart ─────────────────────────────────────────────────────── */

function RadialChart({ value, label, color }: { value: number; label: string; color: string }) {
  const ref = useRef<SVGCircleElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true });
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (inView && !animated) setAnimated(true);
  }, [inView, animated]);

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animated ? value / 100 : 0) * circumference;

  return (
    <div ref={containerRef} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
      <div style={{ position: "relative", width: 88, height: 88 }}>
        <svg width="88" height="88" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="44" cy="44" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
          <circle
            ref={ref}
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.5s ease", filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.85rem", fontWeight: 700, color: "#fff",
        }}>
          {animated ? value : 0}%
        </div>
      </div>
      <span style={{ fontSize: "0.65rem", color: "#94a3b8", textAlign: "center", maxWidth: 80 }}>{label}</span>
    </div>
  );
}

/* ─── Progress Bar Skill ───────────────────────────────────────────────── */

function SkillBar({ label, value, color }: { label: string; value: number; color: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (inView && !animated) {
      const t = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(t);
    }
  }, [inView, animated]);

  const blocks = Math.round(value / 100 * 10);

  return (
    <div ref={ref} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <span style={{ color: "#cbd5e1", fontSize: "0.78rem", minWidth: 180, fontFamily: "monospace" }}>{label}</span>
      <div style={{ display: "flex", gap: 3, flex: 1 }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: 12,
              flex: 1,
              borderRadius: 2,
              background: i < blocks && animated ? color : "rgba(255,255,255,0.08)",
              boxShadow: i < blocks && animated ? `0 0 4px ${color}80` : "none",
              transition: `background 0.3s ease ${i * 80}ms, box-shadow 0.3s ease ${i * 80}ms`,
            }}
          />
        ))}
      </div>
      <span style={{ color: "#64748b", fontSize: "0.7rem", fontFamily: "monospace", minWidth: 32 }}>{value}%</span>
    </div>
  );
}

/* ─── GitHub Widget ────────────────────────────────────────────────────── */

interface GitHubData {
  public_repos: number;
  followers: number;
  following: number;
  name: string;
  bio: string | null;
  avatar_url: string;
}

interface GitHubRepo {
  language: string | null;
  stargazers_count: number;
  fork: boolean;
}

function GitHubWidget() {
  const [ghData, setGhData] = useState<GitHubData | null>(null);
  const [languages, setLanguages] = useState<Record<string, number>>({});
  const [totalStars, setTotalStars] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchGitHub() {
      try {
        const [userRes, reposRes] = await Promise.all([
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
          fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`),
        ]);
        if (!userRes.ok || !reposRes.ok) throw new Error("API error");
        const user: GitHubData = await userRes.json();
        const repos: GitHubRepo[] = await reposRes.json();

        const langCount: Record<string, number> = {};
        let stars = 0;
        repos.forEach((r) => {
          if (r.language && !r.fork) langCount[r.language] = (langCount[r.language] || 0) + 1;
          stars += r.stargazers_count;
        });

        setGhData(user);
        setTotalStars(stars);
        setLanguages(langCount);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchGitHub();
  }, []);

  const langColors: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f7df1e",
    Python: "#3572A5",
    Java: "#b07219",
    CSS: "#563d7c",
    HTML: "#e34c26",
    "C#": "#178600",
    Go: "#00ADD8",
    Rust: "#dea584",
    Vue: "#41b883",
    Dart: "#00B4AB",
    PHP: "#4F5D95",
    Shell: "#89e051",
    Other: "#6366f1",
  };

  const topLangs = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const totalLangRepos = topLangs.reduce((s, [, c]) => s + c, 0);

  return (
    <div className="gh-widget-container">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.25rem" }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #22d3ee)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <GitBranch size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>GitHub Activity</div>
          <div style={{ fontSize: "0.65rem", color: "#64748b", fontFamily: "monospace" }}>@{GITHUB_USERNAME}</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "0.65rem", color: "#6366f1", textDecoration: "none",
              border: "1px solid rgba(99,102,241,0.3)", borderRadius: 6,
              padding: "0.2rem 0.5rem", fontFamily: "monospace",
            }}
          >
            View Profile →
          </a>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", color: "#64748b", fontSize: "0.8rem", padding: "2rem", fontFamily: "monospace" }}>
          <div className="gh-loading-dots">Fetching GitHub data<span>.</span><span>.</span><span>.</span></div>
        </div>
      )}

      {error && (
        <div style={{ textAlign: "center", color: "#f87171", fontSize: "0.78rem", padding: "1rem", fontFamily: "monospace" }}>
          ⚠ Unable to fetch GitHub data (API rate limit or network issue).<br />
          <a href={`https://github.com/${GITHUB_USERNAME}`} target="_blank" rel="noopener noreferrer"
            style={{ color: "#6366f1" }}>View on GitHub →</a>
        </div>
      )}

      {!loading && !error && ghData && (
        <>
          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1.25rem" }}>
            {[
              { label: "Repositories", value: ghData.public_repos, icon: <Layers size={14} />, color: "#6366f1" },
              { label: "Stars Earned", value: totalStars, icon: <Star size={14} />, color: "#f59e0b" },
              { label: "Followers", value: ghData.followers, icon: <GitCommit size={14} />, color: "#22d3ee" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: "0.75rem",
                textAlign: "center",
              }}>
                <div style={{ color, marginBottom: "0.25rem", display: "flex", justifyContent: "center" }}>{icon}</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>{value}</div>
                <div style={{ fontSize: "0.6rem", color: "#64748b", fontFamily: "monospace" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Language Breakdown */}
          <div style={{ marginBottom: "0.75rem" }}>
            <div style={{ fontSize: "0.7rem", color: "#64748b", fontFamily: "monospace", marginBottom: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Top Languages
            </div>
            {/* Bar */}
            <div style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", marginBottom: "0.75rem", gap: 2 }}>
              {topLangs.map(([lang, count]) => (
                <div
                  key={lang}
                  style={{
                    flex: count,
                    background: langColors[lang] || langColors.Other,
                    transition: "flex 1s ease",
                  }}
                />
              ))}
            </div>
            {/* Legend */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {topLangs.map(([lang, count]) => (
                <div key={lang} style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: langColors[lang] || langColors.Other,
                  }} />
                  <span style={{ fontSize: "0.65rem", color: "#94a3b8", fontFamily: "monospace" }}>
                    {lang} {Math.round(count / totalLangRepos * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Contribution Heatmap (visual simulation) */}
          <div>
            <div style={{ fontSize: "0.7rem", color: "#64748b", fontFamily: "monospace", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Contribution Activity (Simulated)
            </div>
            <div style={{ display: "flex", gap: 3, flexWrap: "nowrap", overflowX: "auto" }}>
              {Array.from({ length: 52 }).map((_, week) => (
                <div key={week} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {Array.from({ length: 7 }).map((_, day) => {
                    const val = Math.random();
                    const alpha = val < 0.4 ? 0.05 : val < 0.65 ? 0.25 : val < 0.85 ? 0.55 : 1;
                    return (
                      <div
                        key={day}
                        style={{
                          width: 9, height: 9,
                          borderRadius: 2,
                          background: `rgba(99,102,241,${alpha})`,
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────────── */

export default function AboutApp() {
  const { openWindow } = useOS();
  const [visibleChars, setVisibleChars] = useState(0);

  useEffect(() => {
    const totalChars = profile.fullName.length;
    if (visibleChars < totalChars) {
      const timer = setTimeout(() => {
        setVisibleChars((prev) => prev + 1);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [visibleChars]);

  const skills = [
    { label: "Communication Skills", value: 70, color: "#f472b6" },
    { label: "Problem Solving", value: 95, color: "#f59e0b" },
    { label: "Team Collaboration", value: 90, color: "#34d399" },
    { label: "Leadership", value: 90, color: "#6366f1" },
    { label: "Time Management", value: 90, color: "#22d3ee" },
    { label: "Adaptability", value: 90, color: "#1bc120ff" },
    { label: "Continuous Learning", value: 98, color: "#ce6911ff" },
    { label: "Decision Making", value: 90, color: "#c92f2fff" },
  ];

  const radialSkills = [
    { value: 95, label: "Backend", color: "#6366f1" },
    { value: 85, label: "Frontend", color: "#22d3ee" },
    { value: 75, label: "UI/UX", color: "#f472b6" },
    { value: 70, label: "AI/ML", color: "#f59e0b" },
    { value: 75, label: "Mobile Apps", color: "#1bc120ff" },
  ];

  const sysInfo = [
    { key: "OS Name", value: "GihanOS" },
    { key: "Developer", value: "Gihan Bandara" },
    { key: "Role", value: "Software Engineer" },
    { key: "Specialization", value: "Full Stack Development" },
    { key: "University", value: "SLIIT" },
    { key: "Status", value: "Available for Internship" },
    { key: "Experience", value: "Full Stack Projects + AI/ML + Mobile Apps" },
  ];

  const stats = [
    { label: "Projects Built", value: 20, suffix: "+" },
    { label: "Technologies Learned", value: 30, suffix: "+" },
    { label: "GitHub Repositories", value: 10, suffix: "+" },
    { label: "Years Coding", value: 6, suffix: "+" },
  ];

  return (
    <div className="about-app-container">
      <style dangerouslySetInnerHTML={{
        __html: `
        .about-app-container {
          position: relative;
          margin: -0.8rem;
          width: calc(100% + 2rem);
          height: calc(100% + 2rem);
          background: #000;
          overflow: hidden;
          font-family: inherit;
          container-type: inline-size;
          container-name: about-app;
        }

        .about-app-content-wrapper {
          position: relative;
          z-index: 10;
          height: 100%;
          overflow-y: auto;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .about-app-content {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          gap: 7rem;
          align-items: center;
          width: 100%;
          max-width: 1200px;
          margin: 2rem auto;
        }

        .about-app-text-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          min-width: 0;
        }

        .about-app-name {
          font-size: 5.2rem;
          font-weight: 800;
          color: #fff;
          line-height: 1;
          margin: 0;
          text-shadow: 0 0 30px rgba(99,102,241,0.6);
        }

        .about-app-name-br { display: inline; }
        .about-app-name-space { display: none; }

        .about-app-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .about-app-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin-top: 0.25rem;
        }

        .about-app-avatar-container { flex-shrink: 0; }

        .about-app-avatar-wrapper {
          width: 380px;
          height: 380px;
          border-radius: 50%;
          padding: 3px;
          background: linear-gradient(135deg, #6366f1, #22d3ee, #f472b6);
          box-shadow: 0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(34,211,238,0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        /* ── Sections below hero ─────────────────────────────────────── */
        .about-sections {
          width: 100%;
          max-width: 1200px;
          margin: 3rem auto 0;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .about-section-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .about-section-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        }

        .about-section-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 16px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(99,102,241,0.3), transparent 60%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .about-section-title {
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #6366f1;
          margin: 0 0 1.1rem;
          font-family: monospace;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* System Info */
        .sys-info-row {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          padding: 0.3rem 0;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          font-family: monospace;
        }
        .sys-info-row:last-child { border-bottom: none; }
        .sys-key { color: #22d3ee; font-size: 0.72rem; min-width: 140px; }
        .sys-val { color: #e2e8f0; font-size: 0.72rem; }
        .sys-separator { color: #475569; font-size: 0.72rem; }

        /* Stats */
        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.75rem;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
        }

        /* Philosophy */
        .philosophy-card {
          grid-column: 1 / -1;
          background: rgba(99,102,241,0.06);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .philosophy-card::after {
          content: '"';
          position: absolute;
          top: -20px;
          left: 20px;
          font-size: 8rem;
          color: rgba(99,102,241,0.08);
          font-family: Georgia, serif;
          line-height: 1;
          pointer-events: none;
        }

        /* GitHub Widget */
        .gh-widget-container {
          padding: 0;
        }

        .gh-full-card {
          grid-column: 1 / -1;
        }

        @keyframes dots {
          0%, 20% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        .gh-loading-dots span:nth-child(1) { animation: dots 1.4s infinite 0s; }
        .gh-loading-dots span:nth-child(2) { animation: dots 1.4s infinite 0.2s; }
        .gh-loading-dots span:nth-child(3) { animation: dots 1.4s infinite 0.4s; }

        /* ── Tablet overrides ──────────────────────────────────────────── */
        @container about-app (max-width: 850px) {
          .about-app-content { gap: 3rem; }
          .about-app-name { font-size: 3.8rem; }
          .about-app-avatar-wrapper { width: 180px; height: 180px; }
          .about-section-grid { grid-template-columns: 1fr; }
          .philosophy-card { grid-column: 1; }
          .gh-full-card { grid-column: 1; }
        }

        /* ── Mobile overrides ────────────────────────────────────────── */
        @container about-app (max-width: 580px) {
          .about-app-content-wrapper { padding: 2rem 1.25rem; align-items: flex-start; }
          .about-app-content {
            flex-direction: column-reverse;
            gap: 2rem;
            text-align: center;
            align-items: center;
          }
          .about-app-text-info { align-items: center; }
          .about-app-name { font-size: 2.6rem; line-height: 1.2; }
          .about-app-name-br { display: none; }
          .about-app-name-space { display: inline; }
          .about-app-tags { justify-content: center; }
          .about-app-buttons { justify-content: center; }
          .about-app-avatar-wrapper { width: 140px; height: 140px; }
          .about-section-grid { grid-template-columns: 1fr; }
          .philosophy-card { grid-column: 1; }
          .gh-full-card { grid-column: 1; }
          .sys-key { min-width: 120px; }
        }
      ` }} />

      <GalaxyCanvas />

      <div className="about-app-content-wrapper">
        {/* ── Hero Section ────────────────────────────────────────────── */}
        <div className="about-app-content">
          <div className="about-app-text-info">
            <h1 className="about-app-name">
              {profile.fullName.substring(0, visibleChars).split("").map((char, index) => {
                if (char === " ") {
                  return (
                    <span key={index}>
                      <br className="about-app-name-br" />
                      <span className="about-app-name-space"> </span>
                    </span>
                  );
                }
                return <span key={index}>{char}</span>;
              })}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                style={{ color: "#ffffffff", fontWeight: 400, marginLeft: "2px" }}
              >
                |
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              style={{ fontSize: "1.1rem", color: "#818cf8", margin: 0, fontWeight: 500, letterSpacing: "0.02em" }}
            >
              {profile.title}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#94a3b8", fontSize: "0.85rem" }}>
                <MapPin size={13} /> {profile.location}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "#94a3b8", fontSize: "0.85rem" }}>
                <Mail size={13} /> {profile.email}
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              style={{ color: "#cbd5e1", fontSize: "0.9rem", lineHeight: 1.75, margin: 0, fontWeight: 500 }}
            >
              {profile.bio.trim()}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="about-app-tags"
            >
              {profile.highlights.map((h, i) => (
                <motion.span
                  key={h}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  style={{
                    background: "rgba(99,102,241,0.12)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    borderRadius: "999px",
                    padding: "0.25rem 0.85rem",
                    fontSize: "0.72rem",
                    color: "#a5b4fc",
                    cursor: "default",
                  }}
                >
                  {h}
                </motion.span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.4 }}
              className="about-app-buttons"
            >
              <button
                onClick={() => openWindow("contact")}
                style={{
                  background: "#6366f1", border: "none", borderRadius: "0.65rem",
                  padding: "0.5rem 1.1rem", fontSize: "0.82rem", fontWeight: 600,
                  color: "#fff", cursor: "pointer", transition: "background 0.2s, transform 0.15s",
                }}
                onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = "#818cf8"; }}
                onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "#6366f1"; }}
              >
                Let&apos;s Connect
              </button>
              <button
                onClick={() => openWindow("resume")}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "0.65rem",
                  padding: "0.5rem 1.1rem", fontSize: "0.82rem",
                  color: "#e2e8f0", cursor: "pointer", transition: "background 0.2s",
                }}
                onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)"; }}
                onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = "rgba(255,255,255,0.08)"; }}
              >
                View Resume
              </button>
              <a
                href={profile.socials[0].url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.65rem", padding: "0.5rem 1.1rem",
                  fontSize: "0.82rem", color: "#e2e8f0", textDecoration: "none", transition: "background 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)"; }}
              >
                <Code size={15} /> GitHub
              </a>
              <a
                href={profile.socials[1].url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "0.65rem", padding: "0.5rem 1.1rem",
                  fontSize: "0.82rem", color: "#e2e8f0", textDecoration: "none", transition: "background 0.2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)"; }}
              >
                <Link2 size={15} /> LinkedIn
              </a>
            </motion.div>
          </div>

          {/* ── Right: profile image ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 0 }}
            animate={{ opacity: 1, scale: [1, 1.02, 1], y: [0, -10, 0] }}
            transition={{
              delay: 0.2,
              type: "spring",
              y: { repeat: Infinity, repeatType: "mirror", duration: 6, ease: "easeInOut" },
              scale: { repeat: Infinity, repeatType: "mirror", duration: 4, ease: "easeInOut" }
            }}
            className="about-app-avatar-container"
          >
            <div
              className="about-app-avatar-wrapper"
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "scale(1.05)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 0 60px rgba(99,102,241,0.8), 0 0 100px rgba(34,211,238,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(34,211,238,0.2)";
              }}
            >
              <motion.img
                src="/profile.jpeg"
                alt={profile.fullName}
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block" }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: [0, -10, 0] }}
                whileHover={{ scale: 1.08, rotate: 5, filter: "brightness(1.1)" }}

              />
            </div>
          </motion.div>
        </div>

        {/* ── Additional Sections ──────────────────────────────────────── */}
        <div className="about-sections">

          {/* Row 1: System Info + Developer Stats */}
          <div className="about-section-grid">

            {/* System Information Panel */}
            <motion.div
              className="about-section-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="about-section-title">
                <Cpu size={13} /> System Information
              </div>
              {sysInfo.map(({ key, value }, i) => (
                <motion.div
                  key={key}
                  className="sys-info-row"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.4 }}
                >
                  <span className="sys-key">{key}</span>
                  <span className="sys-separator">:</span>
                  <span className="sys-val">{value}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Developer Statistics */}
            <motion.div
              className="about-section-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="about-section-title">
                <BarChart2 size={13} /> Developer Statistics
              </div>
              {/* Counters */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
                {stats.map(({ label, value, suffix }) => (
                  <div key={label} className="stat-item">
                    <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", fontFamily: "monospace", lineHeight: 1 }}>
                      <AnimatedCounter target={value} suffix={suffix} />
                    </div>
                    <div style={{ fontSize: "0.6rem", color: "#64748b", fontFamily: "monospace", textAlign: "center" }}>{label}</div>
                  </div>
                ))}
              </div>
              {/* Radial Charts */}
              <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "0.75rem" }}>
                {radialSkills.map((s) => (
                  <RadialChart key={s.label} value={s.value} label={s.label} color={s.color} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Row 2: Developer Specs */}
          <motion.div
            className="about-section-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="about-section-title">
              <Code size={13} /> Soft Skills
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {skills.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <SkillBar label={s.label} value={s.value} color={s.color} />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Row 3: Personal Philosophy */}
          <motion.div
            className="philosophy-card"
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div style={{
              fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase",
              letterSpacing: "0.1em", color: "#f472b6", marginBottom: "1rem",
              fontFamily: "monospace", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            }}>
              <Star size={13} /> Personal Philosophy
            </div>
            <p style={{
              fontSize: "1.15rem",
              lineHeight: 1.9,
              color: "#e2e8f0",
              margin: 0,
              fontStyle: "italic",
              fontWeight: 300,
              letterSpacing: "0.01em",
              position: "relative",
              zIndex: 1,
            }}>
              &ldquo;I enjoy building software experiences<br />
              that feel <span style={{ color: "#818cf8", fontWeight: 500 }}>immersive</span>,{" "}
              <span style={{ color: "#22d3ee", fontWeight: 500 }}>interactive</span>,<br />
              and <span style={{ color: "#f472b6", fontWeight: 500 }}>intuitive</span>.&rdquo;
            </p>
            <p style={{ margin: "0.75rem 0 0", fontSize: "0.72rem", color: "#475569", fontFamily: "monospace" }}>
              - Gihan Bandara, Software Engineer
            </p>
          </motion.div>

          {/* Row 4: GitHub Widget */}
          <motion.div
            className="about-section-card gh-full-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GitHubWidget />
          </motion.div>

        </div>
      </div>
    </div>
  );
}
