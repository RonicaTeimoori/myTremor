"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type HandSelection } from "@/components/tremor-tests"
import { CountdownOverlay } from "@/components/tests/countdown-overlay"
import { HelpCircle } from "lucide-react"

interface DrawTestProps {
  hand: HandSelection
  onComplete: (result: { score: number; movements: { x: number; y: number; time: number }[] }) => void
}

type Shape = "spiral" | "line" | "circle"

const shapes: { type: Shape; label: string; instructions: string }[] = [
  { type: "spiral", label: "Spiral", instructions: "Trace from the center, spiraling outward." },
  { type: "line", label: "Straight Line", instructions: "Trace the line from left to right." },
  { type: "circle", label: "Circle", instructions: "Trace around the circle." },
]

const CANVAS_W = 600
const CANVAS_H = 400

export function DrawTest({ onComplete }: DrawTestProps) {
  const [phase, setPhase] = useState<"ready" | "countdown" | "drawing" | "complete">("ready")
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0)
  const [allMovements, setAllMovements] = useState<{ x: number; y: number; time: number }[]>([])
  const [shapeScores, setShapeScores] = useState<number[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [pulse, setPulse] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const movementsRef = useRef<{ x: number; y: number; time: number }[]>([])
  const startTimeRef = useRef<number>(0)

  const currentShape = shapes[currentShapeIndex]

  // Pulse animation for start dot
  useEffect(() => {
    if (phase === "complete") return
    const interval = setInterval(() => setPulse((p) => (p + 1) % 100), 50)
    return () => clearInterval(interval)
  }, [phase])

  // --- Tremor scoring (unchanged) ---
  const calculateShapeScore = useCallback(
    (movements: { x: number; y: number; time: number }[], shape: Shape) => {
      if (movements.length < 10) return 50
      let smoothnessScore = 100
      for (let i = 2; i < movements.length; i++) {
        const p1 = movements[i - 2]
        const p2 = movements[i - 1]
        const p3 = movements[i]
        const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x)
        const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x)
        const angleDiff = Math.abs(angle2 - angle1)
        if (angleDiff > 0.3) smoothnessScore -= angleDiff * 2
      }
      if (shape === "line") {
        const firstPoint = movements[0]
        const lastPoint = movements[movements.length - 1]
        const lineLength = Math.sqrt(
          Math.pow(lastPoint.x - firstPoint.x, 2) + Math.pow(lastPoint.y - firstPoint.y, 2)
        )
        let totalDeviation = 0
        movements.forEach((m) => {
          const dist =
            Math.abs(
              (lastPoint.y - firstPoint.y) * m.x -
                (lastPoint.x - firstPoint.x) * m.y +
                lastPoint.x * firstPoint.y -
                lastPoint.y * firstPoint.x
            ) / lineLength
          totalDeviation += dist
        })
        const avgDeviation = totalDeviation / movements.length
        smoothnessScore = Math.max(0, 100 - avgDeviation * 2)
      }
      return Math.max(0, Math.min(100, Math.round(smoothnessScore)))
    },
    []
  )

  // Draw the guide shape — BIG and OBVIOUS
  const drawShapeGuide = useCallback((shape: Shape) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = CANVAS_W
    const height = CANVAS_H
    ctx.clearRect(0, 0, width, height)

    // Light background grid for visual reference
    ctx.strokeStyle = "rgba(8, 145, 178, 0.05)"
    ctx.lineWidth = 1
    for (let i = 0; i < width; i += 30) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, height)
      ctx.stroke()
    }
    for (let j = 0; j < height; j += 30) {
      ctx.beginPath()
      ctx.moveTo(0, j)
      ctx.lineTo(width, j)
      ctx.stroke()
    }

    // Now draw the actual shape outline — THICK and DARK
    ctx.strokeStyle = "#0891b2"
    ctx.lineWidth = 6
    ctx.setLineDash([14, 10])

    const centerX = width / 2
    const centerY = height / 2
    let startPoint: { x: number; y: number } = { x: centerX, y: centerY }

    if (shape === "spiral") {
      ctx.beginPath()
      for (let angle = 0; angle < 6 * Math.PI; angle += 0.1) {
        const radius = 10 + angle * 8
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        if (angle === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      startPoint = { x: centerX, y: centerY }
    } else if (shape === "line") {
      ctx.beginPath()
      ctx.moveTo(80, centerY)
      ctx.lineTo(width - 80, centerY)
      ctx.stroke()
      startPoint = { x: 80, y: centerY }

      // Big arrow at the end
      ctx.setLineDash([])
      ctx.fillStyle = "rgba(8, 145, 178, 0.5)"
      ctx.beginPath()
      ctx.moveTo(width - 80, centerY - 15)
      ctx.lineTo(width - 60, centerY)
      ctx.lineTo(width - 80, centerY + 15)
      ctx.closePath()
      ctx.fill()
    } else if (shape === "circle") {
      ctx.beginPath()
      ctx.arc(centerX, centerY, 120, 0, Math.PI * 2)
      ctx.stroke()
      startPoint = { x: centerX, y: centerY - 120 }
    }

    ctx.setLineDash([])

    // Pulsing "START HERE" marker — bright green, animated
    if (phase !== "drawing" || movementsRef.current.length === 0) {
      const pulseSize = 22 + Math.sin(pulse * 0.2) * 6
      ctx.beginPath()
      ctx.arc(startPoint.x, startPoint.y, pulseSize, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(34, 197, 94, 0.3)"
      ctx.fill()

      ctx.beginPath()
      ctx.arc(startPoint.x, startPoint.y, 14, 0, Math.PI * 2)
      ctx.fillStyle = "#22c55e"
      ctx.fill()
      ctx.strokeStyle = "#fff"
      ctx.lineWidth = 3
      ctx.stroke()

      ctx.fillStyle = "#16a34a"
      ctx.font = "bold 18px system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("⬇ START HERE ⬇", startPoint.x, startPoint.y - 30)
    }
  }, [phase, pulse])

  useEffect(() => {
    drawShapeGuide(currentShape.type)
  }, [drawShapeGuide, currentShape.type])

  const handleClickStart = () => {
    setPhase("countdown")
  }

  const handleCountdownDone = () => {
    movementsRef.current = []
    startTimeRef.current = Date.now()
    setPhase("drawing")
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (phase !== "drawing") return
    setIsDrawing(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)
    movementsRef.current = [{ x, y, time: Date.now() - startTimeRef.current }]
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (phase !== "drawing" || !isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)
    const time = Date.now() - startTimeRef.current

    const prevPoint = movementsRef.current[movementsRef.current.length - 1]
    movementsRef.current.push({ x, y, time })

    ctx.beginPath()
    ctx.moveTo(prevPoint.x, prevPoint.y)
    ctx.lineTo(x, y)
    ctx.strokeStyle = "#dc2626" // bright red so user can see their tracing
    ctx.lineWidth = 5
    ctx.lineCap = "round"
    ctx.stroke()
  }

  const handleMouseUp = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    const score = calculateShapeScore(movementsRef.current, currentShape.type)
    const newScores = [...shapeScores, score]
    const newMovements = [...allMovements, ...movementsRef.current]
    setShapeScores(newScores)
    setAllMovements(newMovements)

    if (currentShapeIndex < shapes.length - 1) {
      setCurrentShapeIndex((prev) => prev + 1)
    } else {
      setPhase("complete")
      const avgScore = Math.round(newScores.reduce((a, b) => a + b, 0) / shapes.length)
      onComplete({ score: avgScore, movements: newMovements })
    }
  }

  if (phase === "ready") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Draw Test</h2>
              <p className="text-muted-foreground mt-3 text-lg">Trace 3 shapes as smoothly as you can.</p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5 text-left space-y-3">
              <p className="font-bold text-foreground text-lg">How to do this test:</p>
              <ol className="space-y-2 text-base text-foreground list-decimal list-inside">
                <li>Click <span className="font-bold text-primary">START TEST</span></li>
                <li>Wait for the <span className="font-bold">3, 2, 1, GO!</span> countdown</li>
                <li>You&apos;ll see a <span className="font-bold text-primary">blue dashed shape</span> and a <span className="font-bold text-green-600">pulsing green dot</span></li>
                <li>Press and HOLD the mouse button starting on the green dot</li>
                <li>Drag along the dashed line — your trace shows up in <span className="font-bold text-red-600">red</span></li>
                <li>Let go of the mouse when you finish each shape</li>
                <li>Repeat for 3 different shapes</li>
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
                  <li>Go slow — speed isn&apos;t important, smoothness is</li>
                  <li>Keep the mouse button pressed the WHOLE time you&apos;re tracing</li>
                  <li>Try to stay on top of the dashed line</li>
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
        <h2 className="text-2xl font-bold text-foreground">
          Shape {currentShapeIndex + 1} of {shapes.length}: {currentShape.label}
        </h2>
        <p className="text-muted-foreground mt-2 text-base">{currentShape.instructions}</p>
        <p className="text-base text-green-600 font-bold mt-1">⬇ Press and hold on the GREEN dot ⬇</p>
      </div>

      <Card>
        <CardContent className="p-2">
          <div className="flex gap-2 mb-2">
            {shapes.map((shape, index) => (
              <div
                key={shape.type}
                className={`flex-1 h-3 rounded-full ${
                  index < currentShapeIndex
                    ? "bg-primary"
                    : index === currentShapeIndex
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-2 border-primary/20">
        <CardContent className="p-0 relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-[400px] bg-white cursor-crosshair touch-none block"
          />
        </CardContent>
      </Card>

      <p className="text-center text-base text-foreground font-medium">
        Press and hold on the green dot, then drag along the blue dashed line.
      </p>

      {phase === "countdown" && (
        <CountdownOverlay
          message="Move your cursor to the GREEN dot, then press and hold to start tracing."
          onComplete={handleCountdownDone}
        />
      )}
    </div>
  )
}
