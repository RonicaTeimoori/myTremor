"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { type HandSelection } from "@/components/tremor-tests"

interface SteadyWaterTestProps {
  hand: HandSelection
  onComplete: (result: { score: number; movements: { x: number; y: number; time: number }[] }) => void
}

const TEST_DURATION = 30 // seconds
const TARGET_RADIUS = 40
const BOUNDARY_RADIUS = 60

export function SteadyWaterTest({ onComplete }: SteadyWaterTestProps) {
  const [phase, setPhase] = useState<"ready" | "testing" | "complete">("ready")
  const [timeRemaining, setTimeRemaining] = useState(TEST_DURATION)
  const [movements, setMovements] = useState<{ x: number; y: number; time: number }[]>([])
  const [outOfBoundsTime, setOutOfBoundsTime] = useState(0)
  const [isInBounds, setIsInBounds] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const startTimeRef = useRef<number>(0)
  const centerRef = useRef<{ x: number; y: number }>({ x: 300, y: 200 })
  const movementsRef = useRef<{ x: number; y: number; time: number }[]>([])
  const outOfBoundsTimeRef = useRef<number>(0)

  const calculateScore = useCallback((oobTime: number, movementData: { x: number; y: number; time: number }[]) => {
    // Score based on time spent in bounds and stability
    const timeScore = Math.max(0, 100 - (oobTime / 1000) * 5) // Lose 5 points per second out of bounds
    
    if (movementData.length < 2) return Math.round(timeScore)

    // Calculate stability score
    let totalDeviation = 0
    movementData.forEach((m) => {
      const distance = Math.sqrt(
        Math.pow(m.x - centerRef.current.x, 2) + Math.pow(m.y - centerRef.current.y, 2)
      )
      totalDeviation += Math.max(0, distance - TARGET_RADIUS)
    })

    const avgDeviation = totalDeviation / movementData.length
    const stabilityScore = Math.max(0, 100 - avgDeviation * 2)

    return Math.round((timeScore + stabilityScore) / 2)
  }, [])

  useEffect(() => {
    if (phase !== "testing") return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setPhase("complete")
          const score = calculateScore(outOfBoundsTimeRef.current, movementsRef.current)
          onComplete({ score, movements: movementsRef.current })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [phase, onComplete, calculateScore])

  const drawTarget = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const centerX = width / 2
    const centerY = height / 2
    centerRef.current = { x: centerX, y: centerY }

    ctx.clearRect(0, 0, width, height)

    // Draw "water" boundary
    ctx.beginPath()
    ctx.arc(centerX, centerY, BOUNDARY_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(8, 145, 178, 0.1)"
    ctx.fill()
    ctx.strokeStyle = "rgba(239, 68, 68, 0.5)"
    ctx.lineWidth = 3
    ctx.setLineDash([5, 5])
    ctx.stroke()
    ctx.setLineDash([])

    // Draw target zone
    ctx.beginPath()
    ctx.arc(centerX, centerY, TARGET_RADIUS, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(8, 145, 178, 0.2)"
    ctx.fill()
    ctx.strokeStyle = "#0891b2"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw center dot
    ctx.beginPath()
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2)
    ctx.fillStyle = "#0891b2"
    ctx.fill()
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (phase !== "testing") return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)
    const time = Date.now() - startTimeRef.current

    setMovements((prev) => [...prev, { x, y, time }])
    movementsRef.current = [...movementsRef.current, { x, y, time }]

    // Check if cursor is within boundary
    const distance = Math.sqrt(
      Math.pow(x - centerRef.current.x, 2) + Math.pow(y - centerRef.current.y, 2)
    )
    
    const wasInBounds = isInBounds
    const nowInBounds = distance <= BOUNDARY_RADIUS
    setIsInBounds(nowInBounds)

    if (!nowInBounds && wasInBounds) {
      setOutOfBoundsTime((prev) => prev + 100)
      outOfBoundsTimeRef.current += 100
    } else if (!nowInBounds) {
      setOutOfBoundsTime((prev) => prev + 16) // Approximate for 60fps
      outOfBoundsTimeRef.current += 16
    }

    // Redraw with cursor position indicator
    const ctx = canvas.getContext("2d")
    if (ctx) {
      drawTarget(ctx, canvas.width, canvas.height)
      
      // Draw cursor position
      ctx.beginPath()
      ctx.arc(x, y, 8, 0, Math.PI * 2)
      ctx.fillStyle = nowInBounds ? "#0891b2" : "#ef4444"
      ctx.fill()
    }
  }, [phase, isInBounds, drawTarget])

  const startTest = () => {
    setPhase("testing")
    setMovements([])
    setOutOfBoundsTime(0)
    setIsInBounds(true)
    startTimeRef.current = Date.now()
    movementsRef.current = []
    outOfBoundsTimeRef.current = 0

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        drawTarget(ctx, canvas.width, canvas.height)
      }
    }
  }

  if (phase === "ready") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-4 border-primary/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-primary" />
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Steady Water Test Instructions</h2>
              <p className="text-muted-foreground mt-2">
                Keep your cursor inside the target circle for 30 seconds. Imagine you are 
                holding a glass of water steady. The outer dashed line is the spill boundary -
                try not to let your cursor leave it.
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
        <h2 className="text-2xl font-bold text-foreground">Keep Steady</h2>
        <p className={`mt-2 ${isInBounds ? "text-muted-foreground" : "text-destructive font-medium"}`}>
          {isInBounds ? "Stay inside the circle" : "You're outside the boundary!"}
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
            className="w-full h-[400px] bg-secondary/30 cursor-none"
          />
        </CardContent>
      </Card>
    </div>
  )
}
