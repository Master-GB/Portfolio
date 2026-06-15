"use client";

import DesktopIcon from "./DesktopIcon";
import { apps } from "@/data/apps";

export default function Desktop() {
  const handleOpen = (id: string) => {
    console.log("open", id);
  };

  return (
    <div className="h-screen w-screen p-6">
      <div className="flex flex-col gap-5">
        {apps.map((app) => (
          <DesktopIcon
            key={app.id}
            title={app.title}
            icon={app.icon}
            onClick={() => handleOpen(app.id)}
          />
        ))}
      </div>
    </div>
  );
}