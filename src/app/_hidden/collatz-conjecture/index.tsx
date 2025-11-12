"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, Play, RotateCcw, CheckCircle2 } from "lucide-react";

export default function Simulation() {
  const [sequence, setSequence] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [startNumber, setStartNumber] = useState(19);
  const [evenDivisor, setEvenDivisor] = useState(2);
  const [oddMultiplier, setOddMultiplier] = useState(3);
  const [oddAddend, setOddAddend] = useState(1);
  const [maxSteps, setMaxSteps] = useState(1000);
  const [showSettings, setShowSettings] = useState(false);

  const generateColadiv = (
    n: number,
    evenDiv: number,
    oddMult: number,
    oddAdd: number,
    maxIter: number,
  ): number[] => {
    const seq: number[] = [n];
    let current = n;
    let iterations = 0;

    while (current !== 1 && iterations < maxIter) {
      if (current % 2 === 0) {
        current = current / evenDiv;
      } else {
        current = oddMult * current + oddAdd;
      }
      seq.push(current);
      iterations++;
      if (current <= 0 || !isFinite(current)) break;
    }
    return seq;
  };

  useEffect(() => {
    const seq = generateColadiv(
      startNumber,
      evenDivisor,
      oddMultiplier,
      oddAddend,
      maxSteps,
    );
    setSequence(seq);
    setCurrentIndex(seq.length - 1);
  }, [startNumber, evenDivisor, oddMultiplier, oddAddend, maxSteps]);

  useEffect(() => {
    if (isAnimating && currentIndex < sequence.length - 1) {
      const timer = setTimeout(() => setCurrentIndex(currentIndex + 1), 250);
      return () => clearTimeout(timer);
    } else if (currentIndex >= sequence.length - 1) {
      setIsAnimating(false);
    }
  }, [isAnimating, currentIndex, sequence.length]);

  const handleAnimate = () => {
    setCurrentIndex(0);
    setIsAnimating(true);
  };

  const handleReset = () => {
    setCurrentIndex(sequence.length - 1);
    setIsAnimating(false);
  };

  const handleApplySettings = () => {
    const seq = generateColadiv(
      startNumber,
      evenDivisor,
      oddMultiplier,
      oddAddend,
      maxSteps,
    );
    setSequence(seq);
    setCurrentIndex(seq.length - 1);
    setIsAnimating(false);
    setShowSettings(false);
  };

  const chartData = sequence.slice(0, currentIndex + 1).map((value, index) => ({
    step: index,
    value,
  }));

  const getCurrentOperation = (index: number): string => {
    if (index <= 0 || index >= sequence.length) return "";
    const prev = sequence[index - 1];
    const curr = sequence[index];
    return prev % 2 === 0
      ? `${prev} ÷ ${evenDivisor} = ${curr}`
      : `${prev} × ${oddMultiplier} + ${oddAddend} = ${curr}`;
  };

  const currentValue = sequence[currentIndex] ?? startNumber;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold text-blue-900">
            Collatz Conjecture
          </h1>
          <p className="text-lg text-gray-600">
            Interactive visualization of the 3n+1 problem
          </p>
        </div>

        {/* Main Controls Card */}
        <Card className="border-2 shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl text-blue-900">
                  Sequence Explorer
                </CardTitle>
                <CardDescription>
                  Starting from{" "}
                  <Badge variant="secondary" className="text-lg font-bold">
                    {startNumber}
                  </Badge>
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="gap-2"
              >
                <Settings className="w-4 h-4" />
                {showSettings ? "Hide" : "Customize"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Rules */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-blue-900">Current Rules</h3>
              <div className="text-sm space-y-1 text-gray-700">
                <p>
                  • Even → divide by{" "}
                  <Badge variant="outline">{evenDivisor}</Badge>
                </p>
                <p>
                  • Odd → multiply by{" "}
                  <Badge variant="outline">{oddMultiplier}</Badge> and add{" "}
                  <Badge variant="outline">{oddAddend}</Badge>
                </p>
                <p>• Stop at 1 or after {maxSteps} steps</p>
              </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
              <div className="bg-muted/50 border rounded-xl p-6 space-y-5">
                <h3 className="font-semibold text-blue-900">Customize Rules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label>Starting Number</Label>
                    <Input
                      type="number"
                      value={startNumber}
                      onChange={(e) =>
                        setStartNumber(
                          Math.max(1, parseInt(e.target.value) || 1),
                        )
                      }
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Steps (Safety)</Label>
                    <Input
                      type="number"
                      value={maxSteps}
                      onChange={(e) =>
                        setMaxSteps(
                          Math.max(
                            10,
                            Math.min(10000, parseInt(e.target.value) || 1000),
                          ),
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Even Rule: ÷</Label>
                    <Input
                      type="number"
                      value={evenDivisor}
                      onChange={(e) =>
                        setEvenDivisor(
                          Math.max(1, parseInt(e.target.value) || 2),
                        )
                      }
                      min="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Odd Rule: × +</Label>
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        value={oddMultiplier}
                        onChange={(e) =>
                          setOddMultiplier(
                            Math.max(1, parseInt(e.target.value) || 3),
                          )
                        }
                        placeholder="×"
                      />
                      <Input
                        type="number"
                        value={oddAddend}
                        onChange={(e) =>
                          setOddAddend(
                            Math.max(0, parseInt(e.target.value) || 1),
                          )
                        }
                        placeholder="+"
                      />
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleApplySettings}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Apply New Rules
                </Button>
              </div>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleAnimate}
                disabled={isAnimating}
                size="lg"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-5 h-5 mr-2" />
                {isAnimating ? "Animating..." : "Animate Sequence"}
              </Button>
              <Button
                onClick={handleReset}
                size="lg"
                variant="outline"
                className="flex-1"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Show Full
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="pt-6">
                  <p className="text-blue-100 text-sm">Current Value</p>
                  <p className="text-4xl font-bold mt-2">{currentValue}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0">
                <CardContent className="pt-6">
                  <p className="text-indigo-100 text-sm">Progress</p>
                  <p className="text-4xl font-bold mt-2">
                    {currentIndex + 1}{" "}
                    <span className="text-xl opacity-80">
                      / {sequence.length}
                    </span>
                  </p>
                  <p className="text-sm mt-1 opacity-90">steps</p>
                </CardContent>
              </Card>
            </div>

            {/* Current Operation */}
            {currentIndex > 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-900 font-medium text-lg">
                  {getCurrentOperation(currentIndex)}
                </AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {currentIndex === sequence.length - 1 && currentValue === 1 && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 font-semibold">
                  Reached 1 in {sequence.length - 1} steps!
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900">
              Visualization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="4 4" stroke="#e0e0e0" />
                <XAxis
                  dataKey="step"
                  label={{
                    value: "Step",
                    position: "insideBottom",
                    offset: -10,
                  }}
                />
                <YAxis
                  label={{ value: "Value", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "none",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ fill: "#2563eb", r: 5 }}
                  activeDot={{ r: 7 }}
                  animationDuration={0}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sequence List */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-900">
              Full Sequence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sequence.map((num, idx) => (
                <div
                  key={idx}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                    idx < currentIndex
                      ? "bg-blue-100 text-blue-900 border border-blue-300"
                      : idx === currentIndex
                        ? "bg-blue-600 text-white scale-110 shadow-lg"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {num}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
