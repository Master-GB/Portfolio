import React from "react";

const specs = [
  { label: "Frontend Engineering", pct: 90 },
  { label: "Backend Development", pct: 80 },
  { label: "UI/UX Design", pct: 85 },
  { label: "Problem Solving", pct: 88 },
  { label: "Team Collaboration", pct: 82 },
];

export default function DeveloperSpecs() {
  return (
    <div className="os-panel p-4 rounded-lg mb-4 text-sm">
      <h2 className="text-lg font-medium mb-2 text-gradient">Developer Specs</h2>
      <div className="space-y-2">
        {specs.map((s) => (
          <div key={s.label} className="flex items-center text-muted">
            <span className="flex-1 text-sm">{s.label}</span>
            <div className="w-40 h-2 bg-gray-700 rounded overflow-hidden ml-2 mr-2">
              <div className="h-full bg-gradient-to-r from-cyan to-pink" style={{ width: `${s.pct}%` }} />
            </div>
            <span className="text-xs">{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
