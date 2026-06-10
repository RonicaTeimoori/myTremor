"use client"

import { useState, useEffect } from "react"
import { getCurrentUser, saveTest, type LocalUser } from "@/lib/local-auth"
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
    description: "Hold your cursor or finger steady on the screen for 30 seconds to measure tremor at rest.",
    icon: Hand,
    duration: 30,
  },
  draw: {
    title: "Draw Test",
    description: "Draw shapes on the screen to measure drawing stability and precision.",
    icon: Pencil,
    duration: 60,
  },
  "steady-water": {
    title: "Steady Water Test",
    description: "Keep your cursor inside a small circle for 30 seconds without leaving the boundary.",
    icon: Droplets,
    duration: 30,
  },
}

export function TremorTests() {
  const [selectedTest, setSelectedTest] = useState<TestType | null>(null)
  const [selectedHand, setSelectedHand] = useState<HandSelection | null>(null)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [user, setUser] = useState<LocalUser | null>(null)

  useEffect(() => {
    setUser(getCurrentUser())
  }, [])

  const handleTestComplete = (result: Omit<TestResult, "type" | "hand" | "timestamp">) => {
    if (selectedTest && selectedHand) {
      const fullResult: TestResult = {
        ...result,
        type: selectedTest,
        hand: selectedHand,
        timestamp: new Date(),
      }
      setTestResult(fullResult)

      // Save to localStorage if user is logged in
      if (user) {
        saveTest({
          user_id: user.id,
          test_type: selectedTest,
          hand: selectedHand,
          score: result.score,
          duration_seconds: testInfo[selectedTest].duration,
        })
      }
    }
  }

  const resetTest = () => {
    setSelectedTest(null)
    setSelectedHand(null)
    setTestResult(null)
  }

  // Show results screen
  if (testResult) {
    return <TestResults result={testResult} onBack={resetTest} />
  }

  // Show hand selection
  if (selectedTest && !selectedHand) {
    const info = testInfo[selectedTest]
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedTest(null)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Tests
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
            <CardTitle>Which hand are you using?</CardTitle>
            <CardDescription>Select the hand you will use for this test</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4 justify-center">
            <Button
              size="lg"
              variant="outline"
              onClick={() => setSelectedHand("left")}
              className="flex-1 h-24 flex-col gap-2"
            >
              <Hand className="w-8 h-8 -scale-x-100" />
              <span>Left Hand</span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setSelectedHand("right")}
              className="flex-1 h-24 flex-col gap-2"
            >
              <Hand className="w-8 h-8" />
              <span>Right Hand</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show active test
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

  // Show test selection
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground">Tremor Tests</h1>
        <p className="text-muted-foreground mt-2">
          Select a test to measure your tremor severity
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
                <p className="text-sm text-muted-foreground">
                  Duration: ~{info.duration} seconds
                </p>
                <Button className="mt-4 w-full">Start Test</Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
