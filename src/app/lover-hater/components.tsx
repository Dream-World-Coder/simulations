"use client";

import { useState, useEffect, useRef } from "react";
import { Process } from "./operating-system";

export type LayoutType = { [key: number]: { x: number; y: number } };

export function TreeNode({
  proc,
  layout,
}: {
  proc: Process;
  layout: LayoutType;
}) {
  return (
    <g>
      <circle
        cx={layout[proc.pid]?.x || 0}
        cy={layout[proc.pid]?.y || 0}
        r="20"
        fill={proc.type === "lover" ? "#22c55e" : "#f97316"}
        className="transition-all duration-500"
      />
      {proc.type === "lover" ? (
        <text
          x={layout[proc.pid]?.x || 0}
          y={(layout[proc.pid]?.y || 0) + 5}
          textAnchor="middle"
          fill="black"
          fontSize="20"
        >
          ❤
        </text>
      ) : (
        <text
          x={layout[proc.pid]?.x || 0}
          y={(layout[proc.pid]?.y || 0) + 5}
          textAnchor="middle"
          fill="black"
          fontSize="20"
        >
          :(
        </text>
      )}
      <text
        x={layout[proc.pid]?.x || 0}
        y={(layout[proc.pid]?.y || 0) + 40}
        textAnchor="middle"
        fill="black"
        fontSize="12"
        fontWeight="bold"
      >
        pid: {proc.pid}
      </text>
    </g>
  );
}

export type SimulationType = {
  steps: string[];
  processes: Map<number, Process>[];
  maxGeneration: number;
};

export const EventLogScroll = ({
  simulation,
  currentStep,
}: {
  simulation: SimulationType;
  currentStep: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      // Add a small threshold (1px) to account for rounding errors
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 1;
      setAutoScroll(atBottom);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (el && autoScroll) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [currentStep, autoScroll]);

  return (
    <div className="bg-neutral-300/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <h2 className="text-xl font-bold mb-4">Event Log</h2>
      <div
        ref={containerRef}
        className="space-y-2 h-[500px] overflow-y-auto scroll-smooth"
      >
        {simulation.steps.slice(0, currentStep + 1).map((step, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg text-sm ${
              idx === currentStep
                ? "bg-blue-400/80"
                : "bg-blue-300/20 text-black dark:text-white"
            } transition-all duration-300`}
          >
            <span className="font-mono text-xs opacity-60">#{idx + 1}</span>{" "}
            {step}
          </div>
        ))}
      </div>
    </div>
  );
};
export const EventLog = ({
  simulation,
  currentStep,
}: {
  simulation: SimulationType;
  currentStep: number;
}) => {
  return (
    <div className="bg-neutral-300/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <h2 className="text-xl font-bold mb-4">Event Log</h2>
      <div className="space-y-2 h-[500px] overflow-y-auto scroll-smooth">
        {simulation.steps.slice(0, currentStep + 1).map((step, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg text-sm ${
              idx === currentStep
                ? "bg-blue-400/80"
                : "bg-blue-300/20 text-black dark:text-white"
            } transition-all duration-300`}
          >
            <span className="font-mono text-xs opacity-60">#{idx + 1}</span>{" "}
            {step}
          </div>
        ))}
      </div>
    </div>
  );
};
