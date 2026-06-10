"use client"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type HandSelection } from "@/components/tremor-tests"

interface DrawTestProps {
  hand: HandSelection
  onComplete: (result: { score: number; movements: { x: number; y: number; time: number }[] }) => void
}

type Shape = "spiral" | "line" | "circle"

const shapes: { type: Shape; label: string; instructions: string }[] = [
  { type: "spiral", label: "Spiral", instructions: "Draw a spiral from the center outward" },
  { type: "line", label: "Straight Line", instructions: "Draw a straight line between the two points" },
  { type: "circle", label: "Circle", instructions: "Trace around the circle as smoothly as possible" },
]

export function DrawTest({ onComplete }: DrawTestProps) {
  const [phase, setPhase] = useState<"ready" | "drawing" | "complete">("ready")
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0)
  const [allMovements, setAllMovements] = useState<{ x: number; y: number; time: number }[]>([])
  const [shapeScores, setShapeScores] = useState<number[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const movementsRef = useRef<{ x: number; y: number; time: number }[]>([])
  const startTimeRef = useRef<number>(0)

  const currentShape = shapes[currentShapeIndex]

  const calculateShapeScore = useCallback((movements: { x: number; y: number; time: number }[], shape: Shape) => {
    if (movements.length < 10) return 50

    let smoothnessScore = 100
    
    // Calculate smoothness based on angle changes
    for (let i = 2; i < movements.length; i++) {
      const p1 = movements[i - 2]
      const p2 = movements[i - 1]
      const p3 = movements[i]
      
      const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x)
      const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x)
      const angleDiff = Math.abs(angle2 - angle1)
      
      // Penalize sharp angle changes
      if (angleDiff > 0.3) {
        smoothnessScore -= angleDiff * 2
      }
    }

    // Adjust expectations based on shape
    if (shape === "line") {
      // For lines, check straightness
      const firstPoint = movements[0]
      const lastPoint = movements[movements.length - 1]
      const lineLength = Math.sqrt(Math.pow(lastPoint.x - firstPoint.x, 2) + Math.pow(lastPoint.y - firstPoint.y, 2))
      
      let totalDeviation = 0
      movements.forEach((m) => {
        const dist = Math.abs((lastPoint.y - firstPoint.y) * m.x - (lastPoint.x - firstPoint.x) * m.y + lastPoint.x * firstPoint.y - lastPoint.y * firstPoint.x) / lineLength
        totalDeviation += dist
      })
      
      const avgDeviation = totalDeviation / movements.length
      smoothnessScore = Math.max(0, 100 - avgDeviation * 2)
    }

    return Math.max(0, Math.min(100, Math.round(smoothnessScore)))
  }, [])

  const drawShapeGuide = useCallback((ctx: CanvasRenderingContext2D, shape: Shape, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height)
    ctx.strokeStyle = "rgba(115, 115, 115, 0.3)"
    ctx.lineWidth = 3
    ctx.setLineDash([10, 10])

    const centerX = width / 2
    const centerY = height / 2

    if (shape === "spiral") {
      ctx.beginPath()
      for (let angle = 0; angle < 6 * Math.PI; angle += 0.1) {
        const radius = 10 + angle * 8
        const x = centerX + radius * Math.cos(angle)
        const y = centerY + radius * Math.sin(angle)
        if (angle === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
    } else if (shape === "line") {
      ctx.beginPath()
      ctx.moveTo(100, centerY)
      ctx.lineTo(width - 100, centerY)
      ctx.stroke()
      
      // Draw endpoints
      ctx.setLineDash([])
      ctx.fillStyle = "#0891b2"
      ctx.beginPath()
      ctx.arc(100, centerY, 10, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(width - 100, centerY, 10, 0, Math.PI * 2)
      ctx.fill()
    } else if (shape === "circle") {
      ctx.beginPath()
      ctx.arc(centerX, centerY, 100, 0, Math.PI * 2)
      ctx.stroke()
    }

    ctx.setLineDash([])
  }, [])

  const startDrawing = () => {
    setPhase("drawing")
    movementsRef.current = []
    startTimeRef.current = Date.now()

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        drawShapeGuide(ctx, currentShape.type, canvas.width, canvas.height)
      }
    }
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

    // Draw user's line
    ctx.beginPath()
    ctx.moveTo(prevPoint.x, prevPoint.y)
    ctx.lineTo(x, y)
    ctx.strokeStyle = "#0891b2"
    ctx.lineWidth = 3
    ctx.lineCap = "round"
    ctx.stroke()
  }

  const handleMouseUp = () => {
    if (!isDrawing) return
    setIsDrawing(false)

    const score = calculateShapeScore(movementsRef.current, currentShape.type)
    setShapeScores((prev) => [...prev, score])
    setAllMovements((prev) => [...prev, ...movementsRef.current])

    if (currentShapeIndex < shapes.length - 1) {
      setCurrentShapeIndex((prev) => prev + 1)
      setTimeout(() => {
        const canvas = canvasRef.current
        if (canvas) {
          const ctx = canvas.getContext("2d")
          if (ctx) {
            drawShapeGuide(ctx, shapes[currentShapeIndex + 1].type, canvas.width, canvas.height)
          }
        }
      }, 100)
    } else {
      setPhase("complete")
      const avgScore = Math.round([...shapeScores, score].reduce((a, b) => a + b, 0) / shapes.length)
      onComplete({ score: avgScore, movements: allMovements })
    }
  }

  if (phase === "ready") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                <path d="M2 2l7.586 7.586" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Draw Test Instructions</h2>
              <p className="text-muted-foreground mt-2">
                You will be asked to draw 3 shapes. Click and drag to draw each shape as smoothly
                as possible, following the dotted guidelines.
              </p>
            </div>
            <Button size="lg" onClick={startDrawing}>
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
        <h2 className="text-2xl font-bold text-foreground">
          Shape {currentShapeIndex + 1} of {shapes.length}: {currentShape.label}
        </h2>
        <p className="text-muted-foreground mt-2">
          {currentShape.instructions}
        </p>
      </div>

      <Card>
        <CardContent className="p-2">
          <div className="flex gap-2 mb-4">
            {shapes.map((shape, index) => (
              <div
                key={shape.type}
                className={`flex-1 h-2 rounded-full ${
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

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <canvas
            ref={canvasRef}
            width={600}
            height={400}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-[400px] bg-secondary/30 cursor-crosshair touch-none"
          />
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Click and drag to draw. Release when finished.
      </p>
    </div>
  )
}
