"use client";

import { useEffect, useRef, useState } from "react";

import emailjs from "@emailjs/browser";

import { motion, AnimatePresence } from "framer-motion";

import toast from "react-hot-toast";

import dynamic from "next/dynamic";

import {
  Send,
  Phone,
  Mail,
  CircleCheck,
  Loader2,
  Terminal,
  Wifi,
  User,
  MessageSquare,
  AlertTriangle,
  ArrowUpRight,
} from "lucide-react";

import { profile } from "@/data/portfolio";

import type { SceneState } from "../contact/Scene3d";
import GalaxyBackground from "../contact/Galaxybackground";

const Scene3D = dynamic(() => import("../contact/Scene3d"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-24 w-24 animate-pulse rounded-full bg-indigo-500/10 blur-2xl" />
    </div>
  ),
});

const terminalLogs = [
  "SMTP Connected",
  "Secure Channel Active",
  "Awaiting User Input",
];

const STATE_HUD: Record<SceneState, { label: string; color: string }> = {
  idle: { label: "Listening", color: "text-indigo-400" },
  typing: { label: "Receiving data", color: "text-cyan-400" },
  deleting: { label: "Purging data", color: "text-orange-400" },
  sending: { label: "Transmitting", color: "text-sky-300" },
  success: { label: "Delivered", color: "text-emerald-400" },
  error: { label: "Link failed", color: "text-red-400" },
};

type FormValues = {
  user_name: string;
  user_email: string;
  message: string;
};

const MESSAGE_LIMIT = 500;

// TODO: replace with your real mobile number
const PHONE_NUMBER = "+94 77 212 9310";
const PHONE_HREF = `tel:${PHONE_NUMBER.replace(/[^\d+]/g, "")}`;

export default function ContactApp() {
  const formRef = useRef<HTMLFormElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // prevent double execution in dev mode
  const hasStarted = useRef(false);

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // terminal logs
  const [logs, setLogs] = useState<string[]>([]);

  // form + 3D scene state
  const [values, setValues] = useState<FormValues>({
    user_name: "",
    user_email: "",
    message: "",
  });
  const [sceneState, setSceneState] = useState<SceneState>("idle");
  const [pulse, setPulse] = useState(0);

  const lastLengths = useRef<Record<string, number>>({
    user_name: 0,
    user_email: 0,
    message: 0,
  });
  const activityTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // auto scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // smooth terminal typing
  const typeLog = async (message: string) => {
    setLogs((prev) => [...prev, ""]);

    for (let i = 0; i <= message.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 55));

      setLogs((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = message.slice(0, i);
        return updated;
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
  };

  // initial terminal sequence
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const startSequence = async () => {
      for (const log of terminalLogs) {
        await typeLog(log);
      }
    };

    startSequence();
  }, []);

  // cleanup pending timers on unmount
  useEffect(() => {
    return () => {
      if (activityTimeout.current) clearTimeout(activityTimeout.current);
      if (resolveTimeout.current) clearTimeout(resolveTimeout.current);
    };
  }, []);

  // every keystroke nudges the 3D core — additions pull it in, deletions push it out
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setValues((prev) => ({ ...prev, [name]: value }));

    const prevLength = lastLengths.current[name] ?? 0;
    const diff = value.length - prevLength;
    lastLengths.current[name] = value.length;

    if (diff !== 0) {
      setSceneState((current) =>
        current === "idle" || current === "typing" || current === "deleting"
          ? diff > 0
            ? "typing"
            : "deleting"
          : current
      );
      setPulse((p) => p + 1);
    }

    if (activityTimeout.current) clearTimeout(activityTimeout.current);
    activityTimeout.current = setTimeout(() => {
      setSceneState((current) =>
        current === "typing" || current === "deleting" ? "idle" : current
      );
    }, 700);
  };

  // send email
  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    setLoading(true);
    setSceneState("sending");

    try {
      await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        formRef.current,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      toast.success("Message sent successfully.");
      setSent(true);
      setSceneState("success");

      formRef.current.reset();
      setValues({ user_name: "", user_email: "", message: "" });
      lastLengths.current = { user_name: 0, user_email: 0, message: 0 };

      resolveTimeout.current = setTimeout(() => {
        setSent(false);
        setSceneState("idle");
      }, 3200);
    } catch (error) {
      console.error(error);
      toast.error("Failed to send message.");
      setSceneState("error");

      resolveTimeout.current = setTimeout(() => setSceneState("idle"), 2400);
    } finally {
      setLoading(false);
    }
  };

  const hud = STATE_HUD[sceneState];

  const emailSocial = profile.socials.find((s) => s.label === "Email");

  const contactMethods = [
    {
      icon: Mail,
      label: "Email",
      value: emailSocial?.handle ?? "gihanbandara365@gmail.com",
      href: emailSocial?.url ?? "mailto:gihanbandara365@gmail.com",
    },
    {
      icon: Phone,
      label: "Phone",
      value: PHONE_NUMBER,
      href: PHONE_HREF,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative h-full overflow-hidden border border-white/10 bg-gradient-to-br from-[#060816] via-[#0a0f1e] to-[#060816] shadow-2xl"
    >
      {/* galaxy backdrop — nebula swirl, orbit rings, pulsing uplink core */}
      <GalaxyBackground />

      {/* layout */}
      <div className="relative z-10 flex h-full w-full items-start overflow-y-auto os-scrollbar">
        {/* full-bleed 3D core: hidden on mobile, prominent on the right for laptop */}
        <div className="hidden xl:block absolute inset-0 z-0 opacity-100 xl:ml-[350px]">
          <Scene3D state={sceneState} pulse={pulse} />
        </div>

        {/* scrim so the form stays legible over the canvas, fading out toward the right on desktop, solid-ish on mobile */}
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[#060816]/70 xl:bg-transparent xl:bg-gradient-to-r xl:from-[#030816] xl:from-40% xl:via-[#060816]/80 xl:via-60% xl:to-transparent" />

        {/* CONTENT */}
        <div className="relative z-10 h-full w-full max-w-[720px] p-5 sm:p-8 xl:p-12 text-left mx-auto xl:mx-0 flex flex-col justify-center">
          {/* top */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex w-full items-start justify-between"
          >
            <div className="flex flex-col items-start">

              <motion.h2
                className="bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-3xl sm:text-4xl font-bold tracking-tight text-transparent"
                style={{ backgroundSize: "200% auto" }}
                animate={{ backgroundPosition: ["0% center", "200% center"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              >
                Contact Terminal
              </motion.h2>

              <p className="mt-3 max-w-lg text-base leading-relaxed text-slate-300">
                Available for internships, collaborations, and select freelance work.
              </p>
            </div>



          </motion.div>

          {/* terminal */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 w-full rounded-2xl border border-indigo-500/20 bg-black/60 p-4 font-mono text-xs text-emerald-400 backdrop-blur-sm shadow-lg shadow-indigo-500/10"
          >
            <div className="mb-3 flex items-center justify-between text-slate-500">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-indigo-400" />
                <span className="text-indigo-300">system.log</span>
              </div>

            </div>

            <div ref={terminalRef} className="h-[70px] overflow-y-auto pr-1">
              <div className="space-y-2">
                {logs.map((log, index) => {
                  const isLast = index === logs.length - 1;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center"
                    >
                      <span>&gt; {log}</span>

                      {isLast && (
                        <motion.span
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="ml-1"
                        >
                          |
                        </motion.span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* form */}
          <motion.form
            ref={formRef}
            onSubmit={sendEmail}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full"
          >
            <fieldset disabled={loading} className="w-full space-y-4 disabled:opacity-60">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="group relative">
                  <User
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-indigo-400"
                  />
                  <input
                    required
                    type="text"
                    name="user_name"
                    value={values.user_name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-indigo-500/40 focus:bg-white/10"
                  />
                </div>

                <div className="group relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-indigo-400"
                  />
                  <input
                    required
                    type="email"
                    name="user_email"
                    value={values.user_email}
                    onChange={handleChange}
                    placeholder="Your email"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-indigo-500/40 focus:bg-white/10"
                  />
                </div>
              </div>

              <div className="group relative">
                <MessageSquare
                  size={16}
                  className="pointer-events-none absolute left-4 top-3.5 text-slate-500 transition-colors duration-300 group-focus-within:text-indigo-400"
                />
                <textarea
                  required
                  rows={5}
                  name="message"
                  maxLength={MESSAGE_LIMIT}
                  value={values.message}
                  onChange={handleChange}
                  placeholder="Write your message..."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white outline-none transition-all duration-300 placeholder:text-slate-500 focus:border-indigo-500/40 focus:bg-white/10"
                />
                <span className="pointer-events-none absolute bottom-3 right-4 font-mono text-[10px] text-slate-600">
                  {values.message.length}/{MESSAGE_LIMIT}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                disabled={loading}
                type="submit"
                style={{ backgroundSize: "200% auto" }}
                animate={{ backgroundPosition: ["0% center", "100% center", "0% center"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-opacity duration-300 disabled:cursor-not-allowed  hover:cursor-pointer"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {loading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 size={18} className="animate-spin" />
                      Transmitting...
                    </motion.span>
                  ) : sent ? (
                    <motion.span
                      key="sent"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2"
                    >
                      <CircleCheck size={18} />
                      Message Delivered
                    </motion.span>
                  ) : sceneState === "error" ? (
                    <motion.span
                      key="error"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2"
                    >
                      <AlertTriangle size={18} />
                      Retry Transmission
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="flex items-center gap-2 hover:cursor-pointer"
                    >
                      <Send size={18} />
                      Send Message
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </fieldset>
          </motion.form>

          {/* direct contact */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 w-full"
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-white/10" />
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-500">
                Direct Line
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent via-white/10 to-white/10" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {contactMethods.map((method) => (
                <motion.a
                  key={method.label}
                  href={method.href}
                  whileHover={{ y: -3 }}
                  className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors duration-300 hover:border-indigo-500/30 hover:bg-white/[0.06]"
                >
                  {/* sheen sweep on hover */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 text-indigo-300 transition-colors duration-300 group-hover:text-cyan-300">
                    <method.icon size={17} />
                  </span>

                  <span className="flex min-w-0 flex-col">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      {method.label}
                    </span>
                    <span className="truncate text-sm font-medium text-slate-200 transition-colors duration-300 group-hover:text-white">
                      {method.value}
                    </span>
                  </span>

                  <ArrowUpRight
                    size={14}
                    className="ml-auto shrink-0 text-slate-600 opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-300 group-hover:opacity-100"
                  />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}