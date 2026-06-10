"use client"

import { useState } from "react"
import { getEffectiveUserId, saveTest } from "@/lib/local-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Hand, Pencil, Droplets } from "lucide-react"
import { RestTest } from "@/components/tests/rest-test"
import { DrawTest } from "@/components/tests/draw-test"
import { SteadyWaterTest } from "@/components/tests/steady-water-test"
import { TestResults } from "@/components/tests/test-results"

export type TestType = "rest" | "draw" | "steady-water"
export type HandSelection = "left" | "right"

export interface TestResult {
  type: TestType
  hand: HandSelection
  score: number
  movements: { x: number; y: number; time: number }[]
  timestamp: Date
}

const testInfo = {
  rest: {
    title: "Rest Test",
    description: "Hold your cursor still on a target for 30 seconds.",
    icon: Hand,
    duration: 30,
  },
  draw: {
    title: "Draw Test",
    description: "Trace 3 shapes as smoothly as you can.",
    icon: Pencil,
    duration: 60,
  },
  "steady-water": {
    title: "Steady Cup Test",
    description: "Hold a cup of water without spilling for 30 seconds.",
    icon: Droplets,
    duration: 30,
  },
}

export function TremorTests() {
  const [selectedTest, setSelectedTest] = useState<TestType | null>(null)
  const [selectedHand, setSelectedHand] = useState<HandSelection | null>(null)
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  const handleTestComplete = (result: Omit<TestResult, "type" | "hand" | "timestamp">) => {
    if (selectedTest && selectedHand) {
      const fullResult: TestResult = {
        ...result,
        type: selectedTest,
        hand: selectedHand,
        timestamp: new Date(),
      }
      setTestResult(fullResult)

      // Save under the logged-in user OR under "guest" if not signed in.
      saveTest({
        user_id: getEffectiveUserId(),
        test_type: selectedTest,
        hand: selectedHand,
        score: result.score,
        duration_seconds: testInfo[selectedTest].duration,
      })
    }
  }

  const resetTest = () => {
    setSelectedTest(null)
    setSelectedHand(null)
    setTestResult(null)
  }

  // Results screen
  if (testResult) {
    return <TestResults result={testResult} onBack={resetTest} />
  }

  // Hand selection
  if (selectedTest && !selectedHand) {
    const info = testInfo[selectedTest]
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedTest(null)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <info.icon className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">{info.title}</h2>
          <p className="text-muted-foreground mt-2">{info.description}</p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Which hand will you use?</CardTitle>
            <CardDescription>Pick the hand you&apos;ll move the mouse with.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setSelectedHand("left")}
              className="flex-1 h-28 flex-col gap-2"
            >
              <Hand className="w-8 h-8 -scale-x-100" />
              <span className="text-base">Left Hand</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setSelectedHand("right")}
              className="flex-1 h-28 flex-col gap-2"
            >
              <Hand className="w-8 h-8" />
              <span className="text-base">Right Hand</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Active test
  if (selectedTest && selectedHand) {
    const TestComponent = {
      rest: RestTest,
      draw: DrawTest,
      "steady-water": SteadyWaterTest,
    }[selectedTest]

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={resetTest} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Cancel Test
        </Button>
        <TestComponent hand={selectedHand} onComplete={handleTestComplete} />
      </div>
    )
  }

  // Test selection
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Tremor Tests</h1>
        <p className="text-muted-foreground mt-2 text-base">
          Pick a test to check how steady your hand is.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {(Object.entries(testInfo) as [TestType, typeof testInfo.rest][]).map(([type, info]) => {
          const Icon = info.icon
          return (
            <Card
              key={type}
              className="cursor-pointer hover:border-primary/30 transition-colors group"
              onClick={() => setSelectedTest(type)}
            >
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto group-hover:bg-primary/10 transition-colors">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="mt-4">{info.title}</CardTitle>
                <CardDescription>{info.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">Takes about {info.duration} seconds</p>
                <Button className="mt-4 w-full h-11 text-base">Start Test</Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
