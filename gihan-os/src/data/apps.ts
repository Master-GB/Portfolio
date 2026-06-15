import {
  Folder,
  User,
  FileText,
  Terminal,
  Mail,
  Settings,
} from "lucide-react";

export const apps = [
  {
    id: "about",
    title: "About",
    icon: User,
  },
  {
    id: "projects",
    title: "Projects",
    icon: Folder,
  },
  {
    id: "resume",
    title: "Resume",
    icon: FileText,
  },
  {
    id: "terminal",
    title: "Terminal",
    icon: Terminal,
  },
  {
    id: "contact",
    title: "Contact",
    icon: Mail,
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
  },
];