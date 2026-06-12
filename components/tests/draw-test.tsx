'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { type HandSelection } from '@/components/tremor-tests'
import { CountdownOverlay } from '@/components/tests/countdown-overlay'
import { usePointerHandlers } from '@/lib/use-pointer-handlers'
import { HelpCircle } from 'lucide-react'

interface DrawTestProps {
  hand: HandSelection
  onComplete: (result: { score: number; movements: { x: number; y: number; time: number }[] }) => void
}

type Shape = 'spiral' | 'line' | 'circle'

const shapes: { type: Shape; label: string; instructions: string }[] = [
  { type: 'spiral', label: 'Spiral', instructions: 'Trace from the center, spiraling outward.' },
  { type: 'line', label: 'Straight Line', instructions: 'Trace the line from left to right.' },
  { type: 'circle', label: 'Circle', instructions: 'Trace around the circle.' },
]

const CANVAS_W = 600
const CANVAS_H = 400

export function DrawTest({ onComplete }: DrawTestProps) {
  const [phase, setPhase] = useState<'ready' | 'countdown' | 'drawing' | 'complete'>('ready')
  const [currentShapeIndex, setCurrentShapeIndex] = useState(0)
  const [allMovements, setAllMovements] = useState<{ x: number; y: number; time: number }[]>([])
  const [shapeScores, setShapeScores] = useState<number[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [pulse, setPulse] = useState(0)
  const [showHelp, setShowHelp] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const movementsRef = useRef<{ x: number; y: number; time: number }[]>([])
  const startTimeRef = useRef<number>(0)
  const isDrawingRef = useRef<boolean>(false)

  const currentShape = shapes[currentShapeIndex]

  useEffect(() => {
    if (phase === 'complete') return
    const interval = setInterval(() => setPulse((p) => (p + 1) % 1000), 50)
    return () => clearInterval(interval)
  }, [phase])

  // --- Scoring (slightly more lenient than v4 — forgives small wobbles) ---
  const calculateShapeScore = useCallback(
    (movements: { x: number; y: number; time: number }[], shape: Shape) => {
      if (movements.length < 10) return 50
      let smoothness = 100
      for (let i = 2; i < movements.length; i++) {
        const p1 = movements[i - 2], p2 = movements[i - 1], p3 = movements[i]
        const a1 = Math.atan2(p2.y - p1.y, p2.x - p1.x)
        const a2 = Math.atan2(p3.y - p2.y, p3.x - p2.x)
        const d = Math.abs(a2 - a1)
        // Forgive bumps up to ~23° (0.4 rad), and penalize less per radian
        if (d > 0.4) smoothness -= d * 1.2
      }
      if (shape === 'line') {
        const first = movements[0], last = movements[movements.length - 1]
        const len = Math.sqrt(Math.pow(last.x - first.x, 2) + Math.pow(last.y - first.y, 2))
        if (len < 50) return 30 // trace was too short to count as a real line attempt
        let total = 0
        movements.forEach((m) => {
          const dist =
            Math.abs(
              (last.y - first.y) * m.x -
                (last.x - first.x) * m.y +
                last.x * first.y -
                last.y * first.x
            ) / len
          total += dist
        })
        const avg = total / movements.length
        // Was avg * 2; now avg * 1.2 — about 40% more forgiving
        smoothness = Math.max(0, 100 - avg * 1.2)
      }
      return Math.max(0, Math.min(100, Math.round(smoothness)))
    },
    []
  )

  // Draw the shape guide
  const drawShapeGuide = useCallback(
    (shape: Shape) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const width = CANVAS_W, height = CANVAS_H
      ctx.clearRect(0, 0, width, height)

      // Light grid
      ctx.strokeStyle = 'rgba(8, 145, 178, 0.06)'
      ctx.lineWidth = 1
      for (let i = 0; i < width; i += 30) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke()
      }
      for (let j = 0; j < height; j += 30) {
        ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(width, j); ctx.stroke()
      }

      // Shape — THICK dashed line, clearly visible under a fingertip
      ctx.strokeStyle = '#0891b2'
      ctx.lineWidth = 8
      ctx.setLineDash([16, 12])

      const cx = width / 2, cy = height / 2
      let startPoint: { x: number; y: number } = { x: cx, y: cy }

      if (shape === 'spiral') {
        ctx.beginPath()
        for (let a = 0; a < 6 * Math.PI; a += 0.1) {
          const r = 10 + a * 8
          const x = cx + r * Math.cos(a)
          const y = cy + r * Math.sin(a)
          if (a === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        startPoint = { x: cx, y: cy }
      } else if (shape === 'line') {
        ctx.beginPath()
        ctx.moveTo(80, cy)
        ctx.lineTo(width - 80, cy)
        ctx.stroke()
        startPoint = { x: 80, y: cy }
        // End arrow
        ctx.setLineDash([])
        ctx.fillStyle = 'rgba(8, 145, 178, 0.55)'
        ctx.beginPath()
        ctx.moveTo(width - 80, cy - 18)
        ctx.lineTo(width - 55, cy)
        ctx.lineTo(width - 80, cy + 18)
        ctx.closePath()
        ctx.fill()
      } else if (shape === 'circle') {
        ctx.beginPath()
        ctx.arc(cx, cy, 120, 0, Math.PI * 2)
        ctx.stroke()
        startPoint = { x: cx, y: cy - 120 }
      }

      ctx.setLineDash([])

      // Big pulsing START HERE marker — sized for a fingertip
      if (!isDrawingRef.current) {
        const pulseSize = 28 + Math.sin(pulse * 0.2) * 8
        ctx.beginPath()
        ctx.arc(startPoint.x, startPoint.y, pulseSize, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(34, 197, 94, 0.3)'
        ctx.fill()

        ctx.beginPath()
        ctx.arc(startPoint.x, startPoint.y, 18, 0, Math.PI * 2)
        ctx.fillStyle = '#22c55e'
        ctx.fill()
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 4
        ctx.stroke()

        ctx.fillStyle = '#16a34a'
        ctx.font = 'bold 18px system-ui, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('⬇ TAP HERE TO START ⬇', startPoint.x, startPoint.y - 36)
      }
    },
    [pulse]
  )

  useEffect(() => {
    drawShapeGuide(currentShape.type)
  }, [drawShapeGuide, currentShape.type])

  const pointerHandlers = usePointerHandlers(canvasRef, {
    onPointerDown: (p) => {
      if (phase !== 'drawing') return
      setIsDrawing(true)
      isDrawingRef.current = true
      movementsRef.current = [{ x: p.x, y: p.y, time: Date.now() - startTimeRef.current }]
    },
    onPointerMove: (p) => {
      if (phase !== 'drawing' || !isDrawingRef.current) return
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx) return
      const prev = movementsRef.current[movementsRef.current.length - 1]
      movementsRef.current.push({ x: p.x, y: p.y, time: Date.now() - startTimeRef.current })
      // Thick red trace so it stands out against the cyan dashed guide
      ctx.beginPath()
      ctx.moveTo(prev.x, prev.y)
      ctx.lineTo(p.x, p.y)
      ctx.strokeStyle = '#dc2626'
      ctx.lineWidth = 7
      ctx.lineCap = 'round'
      ctx.stroke()
    },
    onPointerUp: () => {
      if (!isDrawingRef.current) return
      isDrawingRef.current = false
      setIsDrawing(false)
      const score = calculateShapeScore(movementsRef.current, currentShape.type)
      const newScores = [...shapeScores, score]
      const newMovements = [...allMovements, ...movementsRef.current]
      setShapeScores(newScores)
      setAllMovements(newMovements)
      if (currentShapeIndex < shapes.length - 1) {
        setCurrentShapeIndex((i) => i + 1)
      } else {
        setPhase('complete')
        const avg = Math.round(newScores.reduce((a, b) => a + b, 0) / shapes.length)
        onComplete({ score: avg, movements: newMovements })
      }
    },
    onPointerCancel: () => {
      isDrawingRef.current = false
      setIsDrawing(false)
    },
  })

  const handleClickStart = () => setPhase('countdown')
  const handleCountdownDone = () => {
    movementsRef.current = []
    startTimeRef.current = Date.now()
    setPhase('drawing')
  }

  if (phase === 'ready') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6 md:p-8 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z" />
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Draw Test</h2>
              <p className="text-muted-foreground mt-2 md:mt-3 text-base md:text-lg">
                Trace 3 shapes with your finger as smoothly as you can.
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 md:p-5 text-left space-y-3">
              <p className="font-bold text-foreground text-base md:text-lg">How to do this test:</p>
              <ol className="space-y-2 text-sm md:text-base text-foreground list-decimal list-inside">
                <li>Tap <span className="font-bold text-primary">START TEST</span></li>
                <li>Wait for the <span className="font-bold">3-2-1-GO</span> countdown</li>
                <li>Place your finger on the <span className="font-bold text-green-600">green dot</span></li>
                <li>Slide your finger along the <span className="font-bold text-primary">blue dashed line</span> — your trace appears in <span className="font-bold text-red-600">red</span></li>
                <li>Lift your finger when you finish each shape</li>
                <li>Repeat for 3 different shapes</li>
              </ol>
            </div>

            <Button size="lg" onClick={handleClickStart} className="w-full h-14 md:h-16 text-lg md:text-xl font-bold">
              START TEST
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowHelp(!showHelp)} className="gap-2">
              <HelpCircle className="w-4 h-4" />
              {showHelp ? 'Hide tips' : 'Show tips'}
            </Button>
            {showHelp && (
              <div className="bg-secondary/50 rounded-lg p-4 text-sm text-muted-foreground text-left">
                <p className="font-medium text-foreground mb-2">Tips:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Go slow — smoothness matters more than speed</li>
                  <li>Try to stay on the dashed line</li>
                  <li>You can finish a shape any time by lifting your finger</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 md:space-y-6">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">
          Shape {currentShapeIndex + 1} of {shapes.length}: {currentShape.label}
        </h2>
        <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">{currentShape.instructions}</p>
        <p className="text-sm md:text-base text-green-600 font-bold mt-1">⬇ Tap and hold on the GREEN dot ⬇</p>
      </div>

      <Card>
        <CardContent className="p-2">
          <div className="flex gap-2 mb-1">
            {shapes.map((shape, index) => (
              <div
                key={shape.type}
                className={`flex-1 h-3 rounded-full ${
                  index < currentShapeIndex
                    ? 'bg-primary'
                    : index === currentShapeIndex
                    ? 'bg-primary/50'
                    : 'bg-muted'
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
            {...pointerHandlers}
            className="w-full aspect-[3/2] bg-white block"
            style={{ maxHeight: '60vh' }}
          />
        </CardContent>
      </Card>

      <p className="text-center text-sm md:text-base text-foreground font-medium">
        Press the green dot, then drag along the dashed line.
      </p>

      {phase === 'countdown' && (
        <CountdownOverlay
          message="Tap on the GREEN dot when GO appears, then drag along the blue dashed line."
          onComplete={handleCountdownDone}
        />
      )}
    </div>
  )
}
