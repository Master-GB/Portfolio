import React from "react";
import CountUp from "react-countup";
import { motion } from "framer-motion";

const stats = {
  projects: 15,
  technologies: 20,
  repositories: 30,
  yearsCoding: 4,
};

export default function DeveloperStats() {
  return (
    <div className="os-panel p-4 rounded-lg mb-4 text-sm">
      <h2 className="text-lg font-medium mb-2 text-gradient">Developer Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <motion.div
            key={key}
            className="flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
          >
            <CountUp end={value} duration={2} enableScrollSpy />
            <span className="capitalize mt-1 text-muted">{key.replace(/([A-Z])/g, " $1")}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
