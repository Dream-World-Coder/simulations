"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  Home,
  Moon,
  Sun,
} from "lucide-react";

import { Process, LoverProcess, HaterProcess } from "./os";
import { EventLog, SimulationType, TreeNode, LayoutType } from "./components";
import { useTheme } from "@/contexts/theme-context";

function cloneProcessMap(map: Map<number, Process>): Map<number, Process> {
  const newMap = new Map<number, Process>();
  map.forEach((proc, pid) => {
    newMap.set(pid, proc.clone());
  });
  // fixing parent pipe references
  newMap.forEach((proc) => {
    if (proc.ppid !== 0) {
      const parent = newMap.get(proc.ppid);
      if (parent) {
        const pipe = parent.pipes.get(proc.pid);
        if (pipe) {
          proc.parentPipe = pipe;
        }
      }
    }
  });
  return newMap;
}

function runSimulation(
  probability: number,
  maxGen: number,
): {
  steps: string[];
  processes: Map<number, Process>[];
  maxGeneration: number;
} {
  Process.probability = probability;
  const allSteps: string[] = [];
  const snapshots: Map<number, Process>[] = [];
  const allProcesses = new Map<number, Process>();

  const root = new Process(1, 0, 0);
  allProcesses.set(1, root);
  allSteps.push(`Root process 1 created as ${root.type}, generation 0`);
  snapshots.push(cloneProcessMap(allProcesses));

  const activeProcesses: number[] = [1];
  let maxGeneration = 0;
  let stepCount = 0;

  while (activeProcesses.length > 0 && stepCount < 10000) {
    const currentPid = activeProcesses[0];
    const proc = allProcesses.get(currentPid);
    if (!proc) break;

    maxGeneration = Math.max(maxGeneration, proc.generation);

    if (maxGen > 0 && maxGeneration >= maxGen) {
      allSteps.push(
        `Maximum generation ${maxGen} reached. Stopping simulation.`,
      );
      snapshots.push(cloneProcessMap(allProcesses));
      break;
    }

    const stepsBefore = allSteps.length;
    let changed = false;
    let shouldContinue = true;

    if (proc.type === "hater") {
      const haterProc = new HaterProcess(proc.pid, proc.ppid, proc.generation);
      haterProc.childrens = [...proc.childrens];
      haterProc.pipes = new Map(proc.pipes);
      haterProc.parentPipe = proc.parentPipe;
      haterProc.type = proc.type;

      [changed, shouldContinue] = haterProc.execute(allProcesses, allSteps);

      proc.type = haterProc.type;
      proc.childrens = haterProc.childrens;
      proc.pipes = haterProc.pipes;
    } else {
      const loverProc = new LoverProcess(proc.pid, proc.ppid, proc.generation);
      loverProc.parentPipe = proc.parentPipe;
      [changed, shouldContinue] = loverProc.execute(allProcesses, allSteps);
    }

    // Take a snapshot for EACH log entry generated in this execution
    const stepsAdded = allSteps.length - stepsBefore;
    for (let i = 0; i < stepsAdded; i++) {
      snapshots.push(cloneProcessMap(allProcesses));
    }

    if (!shouldContinue) {
      activeProcesses.shift();
    } else {
      activeProcesses.push(activeProcesses.shift()!);
    }

    for (const childPid of proc.childrens) {
      if (!activeProcesses.includes(childPid) && allProcesses.has(childPid)) {
        activeProcesses.push(childPid);
      }
    }

    stepCount++;
  }

  const loverCount = Array.from(allProcesses.values()).filter(
    (p) => p.type === "lover",
  ).length;
  allSteps.push(`Simulation complete. All ${loverCount} processes are lovers.`);
  allSteps.push(`Maximum generation reached: ${maxGeneration}`);
  snapshots.push(cloneProcessMap(allProcesses));

  return { steps: allSteps, processes: snapshots, maxGeneration };
}

// tree layout
function calculateTreeLayout(processes: Map<number, Process>) {
  const layout: LayoutType = {};
  const levels: number[][] = [];

  processes.forEach((proc) => {
    if (!levels[proc.generation]) levels[proc.generation] = [];
    levels[proc.generation].push(proc.pid);
  });

  levels.forEach((pids, level) => {
    pids.forEach((pid, index) => {
      layout[pid] = {
        x: (index + 1) * (800 / (pids.length + 1)),
        y: level * 120 + 50,
      };
    });
  });

  // console.log(layout);

  return layout;
}

// main
export default function Simulation({
  question,
  code,
}: {
  question: string;
  code: string;
}) {
  const [probability, setProbability] = useState<number>(0.37);
  const [maxGenerations, setMaxGenerations] = useState<number>(0);
  const [playSpeed, setPlaySpeed] = useState<number>(800);
  const [simulation, setSimulation] = useState<SimulationType | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const { theme, toggleTheme } = useTheme();

  /*
  // error needs to be studied
  useEffect(() => {
    if (isPlaying && simulation && currentStep < simulation.steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, playSpeed);
      return () => clearTimeout(timer);
    } else if (
      isPlaying &&
      simulation &&
      currentStep >= simulation.steps.length - 1
    ) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, simulation, playSpeed]);
  */
  useEffect(() => {
    if (isPlaying && simulation && currentStep < simulation.steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => {
          const next = prev + 1;
          // Stop if we've reached the end
          if (next >= simulation.steps.length - 1) {
            setIsPlaying(false);
          }
          return next;
        });
      }, playSpeed);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentStep, simulation, playSpeed]);

  const handleStart = () => {
    const result = runSimulation(probability, maxGenerations);
    setSimulation(result);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setSimulation(null);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const currentProcesses = simulation?.processes[currentStep] || new Map();
  const layout = calculateTreeLayout(currentProcesses);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 font-serif relative">
            {/* nav */}
            <Link
              href={"/"}
              className="absolute left-0 text-lg font-serif hover:border hover:border-lime-300 dark:hover:border-lime-700 cursor-pointer"
              aria-label="go to Homepage"
            >
              <Home size={20} />
            </Link>
            {/* dark mode */}
            <button
              aria-label="dark mode button"
              onClick={toggleTheme}
              className="absolute right-0 text-lg font-serif hover:border hover:border-lime-300 dark:hover:border-lime-700 cursor-pointer"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            Lover Hater Simulation
          </h1>
        </div>

        {/* Controls */}
        <div className="bg-neutral-300/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block  mb-2 font-medium">
                Lover Probability
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={probability}
                onChange={(e) => setProbability(parseFloat(e.target.value))}
                className={`w-full px-4 py-2 rounded-lg bg-neutral-300/20  border border-white/30
                  focus:outline-none focus:ring-2 focus:ring-blue-500 ${simulation !== null ? "cursor-not-allowed" : ""}`}
                disabled={simulation !== null}
              />
            </div>

            <div>
              <label className="block  mb-2 font-medium">
                Max Generations (0 = unlimited)
              </label>
              <input
                type="number"
                min="0"
                value={maxGenerations}
                onChange={(e) => setMaxGenerations(parseInt(e.target.value))}
                className={`w-full px-4 py-2 rounded-lg bg-neutral-300/20  border border-white/30
                  focus:outline-none focus:ring-2 focus:ring-blue-500 ${simulation !== null ? "cursor-not-allowed" : ""}`}
                disabled={simulation !== null}
              />
            </div>

            <div>
              <label className="block  mb-2 font-medium">
                Animation Speed (ms)
              </label>
              <input
                type="number"
                min="0"
                value={playSpeed || 0}
                onChange={(e) => setPlaySpeed(parseInt(e.target.value))}
                className={`w-full px-4 py-2 rounded-lg bg-neutral-300/20  border border-white/30
                  focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={simulation ? handleReset : handleStart}
                className="w-full px-6 py-2 text-white bg-blue-600 hover:bg-blue-700  rounded-lg font-medium transition-colors"
              >
                {simulation ? "New" : "Start"}
              </button>
            </div>
          </div>

          {simulation && (
            <div className="flex items-center gap-4">
              {/* back to step 0 */}
              <button
                onClick={() => setCurrentStep(0)}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-neutral-300/20 hover:bg-neutral-300/30 disabled:opacity-50 disabled:cursor-not-allowed  rounded-lg transition-colors"
              >
                <ChevronFirst className="w-5 h-5" />
              </button>

              {/* 1 step back */}
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="px-4 py-2 bg-neutral-300/20 hover:bg-neutral-300/30 disabled:opacity-50 disabled:cursor-not-allowed  rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* play pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={currentStep >= simulation.steps.length - 1}
                className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed  rounded-lg font-medium transition-colors"
              >
                {isPlaying ? "Pause" : "Play"}
              </button>

              {/* 1 step skip */}
              <button
                onClick={() =>
                  setCurrentStep(
                    Math.min(simulation.steps.length - 1, currentStep + 1),
                  )
                }
                disabled={currentStep >= simulation.steps.length - 1}
                className="px-4 py-2 bg-neutral-300/20 hover:bg-neutral-300/30 disabled:opacity-50 disabled:cursor-not-allowed  rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* go to final step - 1*/}
              <button
                onClick={() => setCurrentStep(simulation.steps.length - 2)}
                disabled={currentStep >= simulation.steps.length - 2}
                className="px-4 py-2 bg-neutral-300/20 hover:bg-neutral-300/30 disabled:opacity-50 disabled:cursor-not-allowed  rounded-lg transition-colors"
              >
                <ChevronLast className="w-5 h-5" />
              </button>

              {/* steps log */}
              <div className="flex-1  text-center">
                Step {currentStep + 1} / {simulation.steps.length}
              </div>
            </div>
          )}
        </div>

        {simulation && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tree Visualization */}
            <div className="lg:col-span-2 bg-neutral-300/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold  mb-4">Process Tree</h2>
              <div className="relative bg-neutral-300/5 rounded-xl p-4">
                <svg
                  width="100%"
                  height={Math.max(500, (simulation.maxGeneration + 1) * 120)}
                >
                  {/* connections */}
                  {Array.from(currentProcesses.values()).map((proc) => {
                    if (proc.ppid === 0) return null;
                    const parent = currentProcesses.get(proc.ppid);
                    if (!parent) return null;

                    // Check if love message is being sent on this connection
                    const currentLog = simulation.steps[currentStep] || "";
                    const isLoveTransfer =
                      (currentLog.includes(`Process ${proc.pid}`) &&
                        currentLog.includes("sent love") &&
                        currentLog.includes(`parent ${proc.ppid}`)) ||
                      (currentLog.includes(`Process ${proc.ppid}`) &&
                        currentLog.includes("sent love") &&
                        currentLog.includes(`child ${proc.pid}`));

                    return (
                      <line
                        key={`line-${proc.pid}`}
                        x1={layout[proc.ppid]?.x || 0}
                        y1={(layout[proc.ppid]?.y || 0) + 20}
                        x2={layout[proc.pid]?.x || 0}
                        y2={(layout[proc.pid]?.y || 0) - 20}
                        stroke={isLoveTransfer ? "#22c55e" : "rgba(0,0,0,0.3)"}
                        strokeWidth={isLoveTransfer ? "4" : "2"}
                        className="transition-all duration-300"
                      />
                    );
                  })}

                  {/* nodes */}
                  {Array.from(currentProcesses.values()).map((proc) => (
                    <TreeNode key={proc.pid} proc={proc} layout={layout} />
                  ))}
                </svg>
              </div>
              <div className="mt-4 flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-400"></div>
                  <span className="">Lover</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                  <span className="">Hater</span>
                </div>
              </div>
            </div>

            {/* Message Log */}
            <EventLog simulation={simulation} currentStep={currentStep} />
          </div>
        )}

        {!simulation && (
          <div className="bg-neutral-100/80 dark:bg-neutral-800 w-full h-[500px] rounded-2xl"></div>
        )}

        <div className="question font-serif py-16">
          <h3 className="underline text-2xl">Question</h3>
          <p className="max-w-[65ch]">{question}</p>
          <br />
          <br />
          <h3 className="underline text-2xl">Solution</h3>
          <pre className="whitespace-pre text-sm leading-tight max-w-[65ch] overflow-x-auto block">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
