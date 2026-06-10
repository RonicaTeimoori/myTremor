"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { type HandSelection } from "@/components/tremor-tests"
import { CountdownOverlay } from "@/components/tests/countdown-overlay"
import { HelpCircle } from "lucide-react"

interface SteadyWaterTestProps {
  hand: HandSelection
  onComplete: (result: { score: number; movements: { x: number; y: number; time: number }[] }) => void
}

const TEST_DURATION = 30
const CANVAS_W = 600
const CANVAS_H = 400
const CUP_WIDTH = 90
const CUP_HEIGHT = 130
const PICKUP_RADIUS = 70 // how close the cursor needs to be to grab the cup

// Spill tuning
const SPILL_VELOCITY_THRESHOLD = 3
const SPILL_RATE_PER_FRAME = 0.5
const CUP_INERTIA = 0.18 // 0 = cup snaps to cursor, 1 = cup never moves

interface Droplet {
  x: number
  y: number
  vx: number
  vy: number
  life: number
}

export function SteadyWaterTest({ onComplete }: SteadyWaterTestProps) {
  // Phases: ready → countdown → pickup (waiting for cursor to enter cup) → testing → complete
  const [phase, setPhase] = useState<"ready" | "countdown" | "pickup" | "testing" | "complete">("ready")
  const [timeRemaining, setTimeRemaining] = useState(TEST_DURATION)
  const [waterLevel, setWaterLevel] = useState(100)
  const [grabbed, setGrabbed] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const startTimeRef = useRef<number>(0)
  const movementsRef = useRef<{ x: number; y: number; time: number }[]>([])

  // Cup state — starts at center, only follows cursor AFTER grab
  const cupRef = useRef<{ x: number; y: number }>({ x: CANVAS_W / 2, y: CANVAS_H / 2 })
  const cupVelocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const cursorRef = useRef<{ x: number; y: number } | null>(null)
  const grabbedRef = useRef<boolean>(false)
  const grabAnimRef = useRef<number>(0) // 0-1 for pickup animation

  // Water / animation state
  const waterLevelRef = useRef<number>(100)
  const waveOffsetRef = useRef<number>(0)
  const dropletsRef = useRef<Droplet[]>([])

  // --- Tremor scoring (unchanged from spirit of original) ---
  const calculateScore = useCallback(
    (finalWaterLevel: number, movementData: { x: number; y: number; time: number }[]) => {
      const waterScore = Math.max(0, Math.min(100, finalWaterLevel))
      if (movementData.length < 2) return Math.round(waterScore)

      const meanX = movementData.reduce((sum, m) => sum + m.x, 0) / movementData.length
      const meanY = movementData.reduce((sum, m) => sum + m.y, 0) / movementData.length
      let totalDeviation = 0
      movementData.forEach((m) => {
        totalDeviation += Math.sqrt(Math.pow(m.x - meanX, 2) + Math.pow(m.y - meanY, 2))
      })
      const avgDeviation = totalDeviation / movementData.length
      const stabilityScore = Math.max(0, 100 - avgDeviation * 1.5)
      return Math.round(waterScore * 0.7 + stabilityScore * 0.3)
    },
    []
  )

  // Draw the whole scene
  const drawScene = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Table line
    ctx.fillStyle = "rgba(115, 115, 115, 0.08)"
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30)

    const cup = cupRef.current
    const w = CUP_WIDTH
    const h = CUP_HEIGHT
    const scale = 1 + grabAnimRef.current * 0.15 // grow when grabbed
    const wScaled = w * scale
    const hScaled = h * scale
    const left = cup.x - wScaled / 2
    const top = cup.y - hScaled / 2
    const rimY = top + 10 * scale
    const baseY = top + hScaled
    const water = waterLevelRef.current

    // Pickup zone (only if not yet grabbed)
    if (!grabbedRef.current && phase === "pickup") {
      // Pulsing green ring around the cup
      const pulse = Math.sin(Date.now() / 200) * 8
      ctx.beginPath()
      ctx.arc(cup.x, cup.y, PICKUP_RADIUS + pulse, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(34, 197, 94, 0.6)"
      ctx.lineWidth = 4
      ctx.setLineDash([10, 6])
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = "#16a34a"
      ctx.font = "bold 22px system-ui, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("⬇ MOVE CURSOR HERE TO GRAB CUP ⬇", cup.x, cup.y - 110)
    }

    // Cup outline path (tapered)
    const taper = 6 * scale
    const rimLeft = left + taper / 2
    const rimRight = left + wScaled - taper / 2
    const baseLeft = left
    const baseRight = left + wScaled

    // Cup body fill (background)
    ctx.beginPath()
    ctx.moveTo(rimLeft, rimY)
    ctx.lineTo(rimRight, rimY)
    ctx.lineTo(baseRight, baseY)
    ctx.lineTo(baseLeft, baseY)
    ctx.closePath()
    ctx.fillStyle = grabbedRef.current ? "rgba(220, 240, 250, 0.6)" : "rgba(220, 220, 220, 0.4)"
    ctx.fill()

    // Water inside
    if (water > 0) {
      const waterHeightPx = ((hScaled - 18 * scale) * water) / 100
      const waterTopY = baseY - waterHeightPx
      const ratioAtTop = (baseY - waterTopY) / (baseY - rimY)
      const innerLeftAtTop = baseLeft + (rimLeft - baseLeft) * ratioAtTop
      const innerRightAtTop = baseRight + (rimRight - baseRight) * ratioAtTop

      ctx.beginPath()
      ctx.moveTo(baseLeft, baseY)
      ctx.lineTo(innerLeftAtTop, waterTopY)
      const waveAmp = 3
      const waveLen = 30
      const steps = Math.ceil((innerRightAtTop - innerLeftAtTop) / 4)
      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const x = innerLeftAtTop + (innerRightAtTop - innerLeftAtTop) * t
        const y = waterTopY + Math.sin((x + waveOffsetRef.current) / waveLen) * waveAmp
        ctx.lineTo(x, y)
      }
      ctx.lineTo(innerRightAtTop, waterTopY)
      ctx.lineTo(baseRight, baseY)
      ctx.closePath()

      const gradient = ctx.createLinearGradient(0, waterTopY, 0, baseY)
      gradient.addColorStop(0, "rgba(56, 189, 248, 0.85)")
      gradient.addColorStop(1, "rgba(8, 145, 178, 0.95)")
      ctx.fillStyle = gradient
      ctx.fill()
    }

    // Cup outline
    ctx.beginPath()
    ctx.moveTo(rimLeft, rimY)
    ctx.lineTo(rimRight, rimY)
    ctx.lineTo(baseRight, baseY)
    ctx.lineTo(baseLeft, baseY)
    ctx.closePath()
    ctx.strokeStyle = grabbedRef.current ? "#0891b2" : "#475569"
    ctx.lineWidth = 4
    ctx.stroke()

    // Rim ellipse
    ctx.beginPath()
    ctx.ellipse(cup.x, rimY, (rimRight - rimLeft) / 2, 4 * scale, 0, 0, Math.PI * 2)
    ctx.strokeStyle = grabbedRef.current ? "#0891b2" : "#475569"
    ctx.lineWidth = 4
    ctx.stroke()

    // Droplets
    dropletsRef.current.forEach((d) => {
      ctx.beginPath()
      ctx.arc(d.x, d.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(8, 145, 178, ${Math.max(0, d.life)})`
      ctx.fill()
    })

    // Grabbed feedback overlay
    if (grabbedRef.current && grabAnimRef.current < 1) {
      ctx.beginPath()
      ctx.arc(cup.x, cup.y, 80 * (1 - grabAnimRef.current), 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(34, 197, 94, ${1 - grabAnimRef.current})`
      ctx.lineWidth = 4
      ctx.stroke()
    }
  }, [phase])

  // Animation loop (runs during pickup AND testing)
  useEffect(() => {
    if (phase !== "pickup" && phase !== "testing") return

    let rafId: number

    const animate = () => {
      const cursor = cursorRef.current

      // === PICKUP CHECK ===
      // If not grabbed yet, check if cursor is in pickup zone
      if (!grabbedRef.current && cursor) {
        const dx = cursor.x - cupRef.current.x
        const dy = cursor.y - cupRef.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < PICKUP_RADIUS) {
          grabbedRef.current = true
          setGrabbed(true)
        }
      }

      // === CUP PHYSICS ===
      // When grabbed, cup follows cursor with inertia
      if (grabbedRef.current && cursor) {
        const cup = cupRef.current
        // Lerp cup toward cursor (this creates the inertia / lag effect)
        const targetX = cursor.x
        const targetY = cursor.y
        const newX = cup.x + (targetX - cup.x) * (1 - CUP_INERTIA)
        const newY = cup.y + (targetY - cup.y) * (1 - CUP_INERTIA)

        // Velocity from this frame's movement
        const vx = newX - cup.x
        const vy = newY - cup.y
        cupVelocityRef.current = { x: vx, y: vy }

        cupRef.current = { x: newX, y: newY }
      }

      // === SPILL DETECTION ===
      if (phase === "testing" && grabbedRef.current) {
        const vel = Math.sqrt(
          cupVelocityRef.current.x * cupVelocityRef.current.x +
            cupVelocityRef.current.y * cupVelocityRef.current.y
        )

        if (vel > SPILL_VELOCITY_THRESHOLD && waterLevelRef.current > 0) {
          const spillAmount = (vel - SPILL_VELOCITY_THRESHOLD) * SPILL_RATE_PER_FRAME
          waterLevelRef.current = Math.max(0, waterLevelRef.current - spillAmount)

          // Spawn droplets
          if (Math.random() < Math.min(0.8, vel / 8)) {
            const spillSide = cupVelocityRef.current.x >= 0 ? 1 : -1
            const rimY = cupRef.current.y - CUP_HEIGHT / 2 + 10
            dropletsRef.current.push({
              x: cupRef.current.x + (spillSide * CUP_WIDTH) / 2,
              y: rimY,
              vx: spillSide * (1 + Math.random() * 2.5),
              vy: -1.5 - Math.random() * 2.5,
              life: 1,
            })
          }
        }

        // Record cursor position every frame for scoring
        movementsRef.current.push({
          x: cupRef.current.x,
          y: cupRef.current.y,
          time: Date.now() - startTimeRef.current,
        })
      }

      // === GRAB ANIMATION ===
      if (grabbedRef.current && grabAnimRef.current < 1) {
        grabAnimRef.current = Math.min(1, grabAnimRef.current + 0.04)
      }

      // === DROPLET PHYSICS ===
      const nextDrops: Droplet[] = []
      for (const d of dropletsRef.current) {
        d.vy += 0.3
        d.x += d.vx
        d.y += d.vy
        d.life -= 0.012
        if (d.life > 0 && d.y < CANVAS_H + 20) nextDrops.push(d)
      }
      dropletsRef.current = nextDrops

      waveOffsetRef.current += 1.5
      setWaterLevel(Math.round(waterLevelRef.current))

      drawScene()
      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [phase, drawScene])

  // Draw initial scene for "ready" (cup just sits there) and "countdown"
  useEffect(() => {
    if (phase === "ready" || phase === "countdown") drawScene()
  }, [phase, drawScene])

  // Test timer — only runs during "testing"
  useEffect(() => {
    if (phase !== "testing") return
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setPhase("complete")
          const score = calculateScore(waterLevelRef.current, movementsRef.current)
          onComplete({ score, movements: movementsRef.current })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, onComplete, calculateScore])

  // When pickup is achieved during pickup phase, transition to testing
  useEffect(() => {
    if (phase === "pickup" && grabbed) {
      // brief delay so player sees the "grab" animation
      const t = setTimeout(() => {
        setTimeRemaining(TEST_DURATION)
        waterLevelRef.current = 100
        dropletsRef.current = []
        movementsRef.current = []
        startTimeRef.current = Date.now()
        setPhase("testing")
      }, 600)
      return () => clearTimeout(t)
    }
  }, [phase, grabbed])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    const halfW = CUP_WIDTH / 2
    const halfH = CUP_HEIGHT / 2
    cursorRef.current = {
      x: Math.max(halfW, Math.min(CANVAS_W - halfW, x)),
      y: Math.max(halfH, Math.min(CANVAS_H - halfH, y)),
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    cursorRef.current = null
  }, [])

  const handleClickStart = () => {
    setPhase("countdown")
  }

  const handleCountdownDone = () => {
    // Don't start the timer yet — wait for pickup
    grabbedRef.current = false
    setGrabbed(false)
    grabAnimRef.current = 0
    cupRef.current = { x: CANVAS_W / 2, y: CANVAS_H / 2 }
    setPhase("pickup")
  }

  if (phase === "ready") {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" className="w-12 h-12" fill="none">
                <path d="M7 4h10l-1.5 16h-7z" stroke="#0891b2" strokeWidth="2" strokeLinejoin="round" />
                <path d="M8 10h8" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Steady Cup Test</h2>
              <p className="text-muted-foreground mt-3 text-lg">
                Pick up a cup of water and hold it steady — don&apos;t spill!
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5 text-left space-y-3">
              <p className="font-bold text-foreground text-lg">How to do this test:</p>
              <ol className="space-y-2 text-base text-foreground list-decimal list-inside">
                <li>Click <span className="font-bold text-primary">START TEST</span></li>
                <li>Wait for the <span className="font-bold">3, 2, 1, GO!</span> countdown</li>
                <li>Move your cursor onto the cup — it will <span className="font-bold text-green-600">turn blue when grabbed</span></li>
                <li>Hold the cup as still as you can for 30 seconds</li>
                <li>If you shake, water will <span className="font-bold text-blue-600">spill out of the cup</span></li>
                <li>Keep as much water as possible to get a high score!</li>
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
                  <li>The cup has a little weight — if you move quickly, it lags behind, which can spill water</li>
                  <li>Move SLOWLY if you need to reposition</li>
                  <li>Rest your wrist on the desk for better control</li>
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
          {phase === "pickup" ? "Pick Up the Cup" : "Hold the Cup Steady"}
        </h2>
        <p className="text-muted-foreground mt-2 text-base">
          {phase === "pickup"
            ? "Move your cursor onto the cup to grab it"
            : phase === "testing"
            ? waterLevel > 80
              ? "Great! Don't spill!"
              : waterLevel > 50
              ? "You're spilling some — slow down!"
              : waterLevel > 20
              ? "Be careful! Lots of water is gone."
              : "Try to save what's left!"
            : "Get ready..."}
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Time Left</span>
                <span className="text-3xl font-bold text-foreground tabular-nums">{timeRemaining}s</span>
              </div>
              <Progress
                value={((TEST_DURATION - timeRemaining) / TEST_DURATION) * 100}
                className="h-3"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Water Left</span>
                <span className="text-3xl font-bold text-primary tabular-nums">{waterLevel}%</span>
              </div>
              <Progress value={waterLevel} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-2 border-primary/20">
        <CardContent className="p-0 relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full h-[400px] bg-gradient-to-b from-sky-50 to-blue-100 cursor-none touch-none block"
          />
        </CardContent>
      </Card>

      <p className="text-center text-base text-foreground font-medium">
        Move slowly! The cup has weight — fast movements spill water.
      </p>

      {phase === "countdown" && (
        <CountdownOverlay
          message="Get ready! When GO appears, move your cursor onto the cup to grab it."
          onComplete={handleCountdownDone}
        />
      )}
    </div>
  )
}
