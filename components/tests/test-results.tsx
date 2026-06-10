"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type TestResult } from "@/components/tremor-tests"
import { ArrowLeft, CheckCircle, AlertCircle, TrendingUp } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts"

interface TestResultsProps {
  result: TestResult
  onBack: () => void
}

const testNames = {
  rest: "Rest Test",
  draw: "Draw Test",
  "steady-water": "Steady Cup Test",
}

function getScoreDescription(score: number) {
  if (score >= 80) {
    return { label: "Excellent", description: "Your hand was very steady! Great job.", color: "text-green-600" }
  } else if (score >= 60) {
    return { label: "Good", description: "Mostly steady with small movements — that's normal.", color: "text-primary" }
  } else if (score >= 40) {
    return { label: "Moderate", description: "Some shaking detected. Try the exercises to help.", color: "text-yellow-600" }
  }
  return { label: "Significant", description: "Lots of movement detected. Talk to a doctor if you're worried.", color: "text-destructive" }
}

export function TestResults({ result, onBack }: TestResultsProps) {
  const scoreInfo = getScoreDescription(result.score)

  // Build chart data — even if movements is sparse, generate filler so the graph ALWAYS renders
  const buildChartData = () => {
    const movements = result.movements

    // If we have movements, plot them
    if (movements.length >= 2) {
      const avgX = movements.reduce((s, m) => s + m.x, 0) / movements.length
      const avgY = movements.reduce((s, m) => s + m.y, 0) / movements.length
      // Sample to keep the chart fast
      const step = Math.max(1, Math.floor(movements.length / 80))
      return movements
        .filter((_, i) => i % step === 0)
        .map((m, i) => ({
          step: i,
          movement: Number(Math.sqrt(Math.pow(m.x - avgX, 2) + Math.pow(m.y - avgY, 2)).toFixed(1)),
        }))
    }

    // Fallback: generate a flat line at 0 so the graph still renders
    return Array.from({ length: 30 }, (_, i) => ({ step: i, movement: 0 }))
  }

  const chartData = buildChartData()
  const noMovementDetected = result.movements.length < 2

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Tests
      </Button>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Test Complete!</h1>
        <p className="text-muted-foreground mt-2 text-base">
          {testNames[result.type]} — {result.hand === "left" ? "Left" : "Right"} Hand
        </p>
      </div>

      {/* Score */}
      <Card>
        <CardContent className="p-8 text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="56" fill="none" stroke="#e5e5e5" strokeWidth="12" />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="#0891b2"
                strokeWidth="12"
                strokeDasharray={`${(result.score / 100) * 352} 352`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-foreground">{result.score}</span>
            </div>
          </div>
          <h2 className={`text-2xl font-bold ${scoreInfo.color}`}>{scoreInfo.label}</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">{scoreInfo.description}</p>
        </CardContent>
      </Card>

      {/* Movement graph — ALWAYS renders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Movement Over Time
          </CardTitle>
          <CardDescription>
            {noMovementDetected
              ? "Very little cursor movement detected — that means you held very still!"
              : "How much your cursor moved during the test. Lower = steadier."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="step"
                  stroke="#737373"
                  fontSize={12}
                  label={{ value: "Time →", position: "insideBottom", offset: -10, fill: "#737373", fontSize: 12 }}
                />
                <YAxis
                  stroke="#737373"
                  fontSize={12}
                  label={{ value: "Movement (pixels)", angle: -90, position: "insideLeft", fill: "#737373", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="movement"
                  stroke="#0891b2"
                  strokeWidth={3}
                  dot={{ fill: "#0891b2", r: 3 }}
                  activeDot={{ r: 6, fill: "#0891b2" }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>What This Means</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Result Saved</p>
              <p className="text-sm text-muted-foreground">
                We saved your result. You can see all your tests in History.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Not a Diagnosis</p>
              <p className="text-sm text-muted-foreground">
                This is for tracking only. Talk to a doctor if you&apos;re worried about tremors.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12 text-base">
          Take Another Test
        </Button>
        <Button onClick={onBack} className="flex-1 h-12 text-base">
          Done
        </Button>
      </div>
    </div>
  )
}
