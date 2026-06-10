"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type TestResult } from "@/components/tremor-tests"
import { ArrowLeft, CheckCircle, AlertCircle, TrendingUp } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

interface TestResultsProps {
  result: TestResult
  onBack: () => void
}

const testNames = {
  rest: "Rest Test",
  draw: "Draw Test",
  "steady-water": "Steady Water Test",
}

function getScoreDescription(score: number): { label: string; description: string; color: string } {
  if (score >= 80) {
    return {
      label: "Excellent",
      description: "Your hand stability is within the normal range. Continue monitoring regularly.",
      color: "text-green-600",
    }
  } else if (score >= 60) {
    return {
      label: "Good",
      description: "Your hand stability shows minor fluctuations. This is common and may improve with exercises.",
      color: "text-primary",
    }
  } else if (score >= 40) {
    return {
      label: "Moderate",
      description: "Your results show moderate tremor activity. Consider tracking regularly and trying the recommended exercises.",
      color: "text-yellow-600",
    }
  } else {
    return {
      label: "Significant",
      description: "Your results indicate significant tremor activity. Consider discussing these results with a healthcare provider.",
      color: "text-destructive",
    }
  }
}

export function TestResults({ result, onBack }: TestResultsProps) {
  const scoreInfo = getScoreDescription(result.score)

  // Prepare movement data for chart (sample every 10th point for performance)
  const chartData = result.movements
    .filter((_, i) => i % 10 === 0)
    .map((m, i) => ({
      time: i,
      movement: Math.sqrt(Math.pow(m.x - (result.movements[0]?.x || 0), 2) + Math.pow(m.y - (result.movements[0]?.y || 0), 2)),
    }))

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Tests
      </Button>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Test Complete</h1>
        <p className="text-muted-foreground mt-2">
          {testNames[result.type]} - {result.hand === "left" ? "Left" : "Right"} Hand
        </p>
      </div>

      {/* Score Card */}
      <Card>
        <CardContent className="p-8 text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="hsl(var(--primary))"
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
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            {scoreInfo.description}
          </p>
        </CardContent>
      </Card>

      {/* Movement Graph */}
      {chartData.length > 5 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Movement Over Time
            </CardTitle>
            <CardDescription>
              This graph shows your cursor movement deviation during the test
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="time" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="movement"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
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
                This result has been saved to your history. Track your progress over time.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Not a Diagnosis</p>
              <p className="text-sm text-muted-foreground">
                This test is for monitoring purposes only and should not be used to diagnose 
                any medical conditions. Consult a healthcare provider for medical advice.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Take Another Test
        </Button>
        <Button onClick={onBack} className="flex-1">
          Done
        </Button>
      </div>
    </div>
  )
}
