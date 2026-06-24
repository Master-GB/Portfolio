import React from "react";

const systemInfo = {
  osName: "GihanOS",
  developer: "Gihan Bandara",
  role: "Software Engineer",
  specialization: "Frontend Engineering",
  university: "SLIIT",
  status: "Available for Internship",
  experience: "Full Stack Projects",
};

export default function SystemInfoPanel() {
  return (
    <div className="os-panel p-4 rounded-lg mb-4 text-sm">
      <h2 className="text-lg font-medium mb-2 text-gradient">System Information</h2>
      <ul className="space-y-1">
        <li><strong>OS Name:</strong> {systemInfo.osName}</li>
        <li><strong>Developer:</strong> {systemInfo.developer}</li>
        <li><strong>Role:</strong> {systemInfo.role}</li>
        <li><strong>Specialization:</strong> {systemInfo.specialization}</li>
        <li><strong>University:</strong> {systemInfo.university}</li>
        <li><strong>Status:</strong> {systemInfo.status}</li>
        <li><strong>Experience:</strong> {systemInfo.experience}</li>
      </ul>
    </div>
  );
}
