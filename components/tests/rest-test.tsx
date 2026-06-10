"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { type HandSelection } from "@/components/tremor-tests"

interface RestTestProps {
  hand: HandSelection
  onComplete: (result: { score: number; movements: { x: number; y: number; time: number }[] }) => void
}

const TEST_DURATION = 30 // seconds

export function RestTest({ onComplete }: RestTestProps) {
  const [phase, setPhase] = useState<"ready" | "testing" | "complete">("ready")
  const [timeRemaining, setTimeRemaining] = useState(TEST_DURATION)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const startTimeRef = useRef<number>(0)
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null)

  const movementsRef = useRef<{ x: number; y: number; time: number }[]>([])

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
    // Scale: 0-5px deviation = 100 score, 50+px = 0 score
    const score = Math.max(0, Math.min(100, 100 - (averageDeviation - 5) * 2))
    return Math.round(score)
  }, [])

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
    if (phase !== "testing") return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const time = Date.now() - startTimeRef.current

    movementsRef.current.push({ x, y, time })

    // Draw movement trail
    const ctx = canvas.getContext("2d")
    if (ctx && lastPositionRef.current) {
      ctx.beginPath()
      ctx.moveTo(lastPositionRef.current.x, lastPositionRef.current.y)
      ctx.lineTo(x, y)
      ctx.strokeStyle = "#0891b2"
      ctx.lineWidth = 2
      ctx.stroke()
    }
    lastPositionRef.current = { x, y }
  }, [phase])

  const startTest = () => {
    setPhase("testing")
    setTimeRemaining(TEST_DURATION)
    movementsRef.current = []
    startTimeRef.current = Date.now()
    lastPositionRef.current = null

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        // Draw center target
        ctx.beginPath()
        ctx.arc(canvas.width / 2, canvas.height / 2, 20, 0, Math.PI * 2)
        ctx.fillStyle = "rgba(8, 145, 178, 0.2)"
        ctx.fill()
        ctx.strokeStyle = "#0891b2"
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }
  }

  if (phase === "ready") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <div className="w-4 h-4 rounded-full bg-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Rest Test Instructions</h2>
              <p className="text-muted-foreground mt-2">
                Place your cursor on the center dot and hold it as steady as possible for 30 seconds.
                Try to minimize any movement.
              </p>
            </div>
            <Button size="lg" onClick={startTest}>
              Start Test
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Hold Steady</h2>
        <p className="text-muted-foreground mt-2">
          Keep your cursor on the center point
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-muted-foreground">Time Remaining</span>
            <span className="text-2xl font-bold text-foreground">{timeRemaining}s</span>
          </div>
          <Progress value={((TEST_DURATION - timeRemaining) / TEST_DURATION) * 100} />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            onMouseMove={handleMouseMove}
            className="w-full h-[400px] bg-secondary/30 cursor-crosshair"
          />
        </CardContent>
      </Card>
    </div>
  )
}
