import type { AppId } from "@/data/portfolio";
import AboutApp from "./AboutApp";
import ProjectsApp from "./ProjectsApp";
import SkillsApp from "./SkillsApp";
import ResumeApp from "./ResumeApp";
import EducationApp from "./EducationApp";
import ContactApp from "./ContactApp";
import TerminalApp from "./TerminalApp";
import SettingsApp from "./SettingsApp";
import FileExplorerApp from "./FileExplorerApp";
import NotepadApp from "./NotepadApp";
import RobotAssistantApp from "./RobotAssistantApp";

const APP_MAP: Record<AppId, React.ComponentType> = {
  about: AboutApp,
  projects: ProjectsApp,
  skills: SkillsApp,
  resume: ResumeApp,
  education: EducationApp,
  contact: ContactApp,
  terminal: TerminalApp,
  settings: SettingsApp,
  explorer: FileExplorerApp,
  notepad: NotepadApp,
  robot_assistant: RobotAssistantApp,
};

export default function AppRenderer({ appId }: { appId: AppId }) {
  const App = APP_MAP[appId];
  return <App />;
}
