"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { type HandSelection } from "@/components/tremor-tests"
import { CountdownOverlay } from "@/components/tests/countdown-overlay"
import { HelpCircle } from "lucide-react"

interface RestTestProps {
  hand: HandSelection
  onComplete: (result: { score: number; movements: { x: number; y: number; time: number }[] }) => void
}

const TEST_DURATION = 30
const CANVAS_W = 600
const CANVAS_H = 400

export function RestTest({ onComplete }: RestTestProps) {
  const [phase, setPhase] = useState<"ready" | "countdown" | "testing" | "complete">("ready")
  const [timeRemaining, setTimeRemaining] = useState(TEST_DURATION)
  const [showHelp, setShowHelp] = useState(false)
  const [pulse, setPulse] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const startTimeRef = useRef<number>(0)
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null)
  const movementsRef = useRef<{ x: number; y: number; time: number }[]>([])

  // --- Tremor scoring (unchanged) ---
  const calculateScore = useCallback((movementData: { x: number; y: number; time: number }[]) => {
    if (movementData.length < 2) return 100
    let totalDeviation = 0
    const centerX = movementData.reduce((sum, m) => sum + m.x, 0) / movementData.length
    const centerY = movementData.reduce((sum, m) => sum + m.y, 0) / movementData.length
    movementData.forEach((m) => {
      const distance = Math.sqrt(Math.pow(m.x - centerX, 2) + Math.pow(m.y - centerY, 2))
      totalDeviation += distance
    })
    const averageDeviation = totalDeviation / movementData.length
    const score = Math.max(0, Math.min(100, 100 - (averageDeviation - 5) * 2))
    return Math.round(score)
  }, [])

  // Pulse animation for the target
  useEffect(() => {
    if (phase === "complete") return
    const interval = setInterval(() => setPulse((p) => (p + 1) % 100), 50)
    return () => clearInterval(interval)
  }, [phase])

  // Draw the target — BIG and OBVIOUS
  const drawTarget = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const cx = canvas.width / 2
    const cy = canvas.height / 2

    // Animated pulse ring (only during ready/countdown)
    if (phase === "ready" || phase === "countdown") {
      const pulseSize = 70 + Math.sin(pulse * 0.15) * 12
      ctx.beginPath()
      ctx.arc(cx, cy, pulseSize, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(34, 197, 94, 0.5)"
      ctx.lineWidth = 4
      ctx.setLineDash([8, 8])
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Outer ring
    ctx.beginPath()
    ctx.arc(cx, cy, 55, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(8, 145, 178, 0.1)"
    ctx.fill()
    ctx.strokeStyle = "#0891b2"
    ctx.lineWidth = 4
    ctx.stroke()

    // Mid ring
    ctx.beginPath()
    ctx.arc(cx, cy, 32, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(8, 145, 178, 0.25)"
    ctx.fill()

    // Inner bullseye dot
    ctx.beginPath()
    ctx.arc(cx, cy, 12, 0, Math.PI * 2)
    ctx.fillStyle = "#0891b2"
    ctx.fill()
    ctx.strokeStyle = "#fff"
    ctx.lineWidth = 3
    ctx.stroke()

    // Big "PUT CURSOR HERE" arrow + label
    if (phase === "ready" || phase === "countdown") {
      ctx.fillStyle = "#16a34a"
      ctx.font = "bold 20px system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("⬇ PUT YOUR CURSOR ON THE DOT ⬇", cx, cy - 90)
    }
  }, [phase, pulse])

  useEffect(() => {
    drawTarget()
  }, [drawTarget])

  // Continuous cursor sampling (every 50ms) so the graph ALWAYS has data
  useEffect(() => {
    if (phase !== "testing") return

    const samplingInterval = setInterval(() => {
      if (lastPositionRef.current) {
        movementsRef.current.push({
          x: lastPositionRef.current.x,
          y: lastPositionRef.current.y,
          time: Date.now() - startTimeRef.current,
        })
      }
    }, 50)

    return () => clearInterval(samplingInterval)
  }, [phase])

  // Countdown timer
  useEffect(() => {
    if (phase !== "testing") return
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setPhase("complete")
          const score = calculateScore(movementsRef.current)
          onComplete({ score, movements: movementsRef.current })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, onComplete, calculateScore])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    lastPositionRef.current = { x, y }

    if (phase !== "testing") return

    // Draw trail
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(8, 145, 178, 0.6)"
      ctx.fill()
    }
  }, [phase])

  const handleClickStart = () => {
    setPhase("countdown")
  }

  const handleCountdownDone = () => {
    setTimeRemaining(TEST_DURATION)
    movementsRef.current = []
    startTimeRef.current = Date.now()
    drawTarget()
    setPhase("testing")
  }

  if (phase === "ready") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <div className="w-6 h-6 rounded-full bg-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Rest Test</h2>
              <p className="text-muted-foreground mt-3 text-lg">
                Hold your cursor still on the dot.
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5 text-left space-y-3">
              <p className="font-bold text-foreground text-lg">How to do this test:</p>
              <ol className="space-y-2 text-base text-foreground list-decimal list-inside">
                <li>Click the big <span className="font-bold text-primary">START TEST</span> button</li>
                <li>Wait for the <span className="font-bold">3, 2, 1, GO!</span> countdown</li>
                <li>Move your cursor onto the <span className="font-bold text-primary">blue dot</span> in the middle</li>
                <li>Try to keep it perfectly still for 30 seconds</li>
              </ol>
            </div>

            <Button size="lg" onClick={handleClickStart} className="w-full h-16 text-xl font-bold">
              START TEST
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowHelp(!showHelp)} className="gap-2">
              <HelpCircle className="w-4 h-4" />
              {showHelp ? "Hide tips" : "Show tips"}
            </Button>
            {showHelp && (
              <div className="bg-secondary/50 rounded-lg p-4 text-sm text-muted-foreground text-left">
                <p className="font-medium text-foreground mb-2">Tips:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Rest your elbow on the table for better stability</li>
                  <li>It&apos;s normal for the cursor to move a tiny bit — don&apos;t stress</li>
                  <li>Lower scores don&apos;t mean anything is wrong; this is just a measurement</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Hold Steady on the Dot</h2>
        <p className="text-muted-foreground mt-2 text-base">
          Don&apos;t move your cursor away from the center
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-base font-medium text-muted-foreground">Time Remaining</span>
            <span className="text-4xl font-bold text-primary tabular-nums">{timeRemaining}s</span>
          </div>
          <Progress value={((TEST_DURATION - timeRemaining) / TEST_DURATION) * 100} className="h-3" />
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-2 border-primary/20">
        <CardContent className="p-0 relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onMouseMove={handleMouseMove}
            className="w-full h-[400px] bg-gradient-to-br from-blue-50 to-cyan-50 cursor-crosshair touch-none block"
          />
        </CardContent>
      </Card>

      {phase === "countdown" && (
        <CountdownOverlay
          message="Move your cursor to the blue dot in the middle when GO appears!"
          onComplete={handleCountdownDone}
        />
      )}
    </div>
  )
}
