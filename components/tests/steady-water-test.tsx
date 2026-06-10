'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { type HandSelection } from '@/components/tremor-tests'
import { CountdownOverlay } from '@/components/tests/countdown-overlay'
import { usePointerHandlers } from '@/lib/use-pointer-handlers'
import { HelpCircle } from 'lucide-react'

interface SteadyWaterTestProps {
  hand: HandSelection
  onComplete: (result: { score: number; movements: { x: number; y: number; time: number }[] }) => void
}

const TEST_DURATION = 30
const CANVAS_W = 600
const CANVAS_H = 400
const CUP_WIDTH = 100
const CUP_HEIGHT = 140
const PICKUP_RADIUS = 90 // generous hit zone for finger tap

const SPILL_VELOCITY_THRESHOLD = 3
const SPILL_RATE_PER_FRAME = 0.5
const CUP_INERTIA = 0.18

interface Droplet {
  x: number
  y: number
  vx: number
  vy: number
  life: number
}

export function SteadyWaterTest({ onComplete }: SteadyWaterTestProps) {
  // Phases: ready → countdown → pickup → testing → complete
  // Note: "paused" isn't a phase — it's just that during "testing", lifting the finger
  // sets `paused` to true. The timer and spill physics check this and skip while paused.
  const [phase, setPhase] = useState<'ready' | 'countdown' | 'pickup' | 'testing' | 'complete'>('ready')
  const [timeRemaining, setTimeRemaining] = useState(TEST_DURATION)
  const [waterLevel, setWaterLevel] = useState(100)
  const [paused, setPaused] = useState(false)
  const [holding, setHolding] = useState(false) // mirrors holdingRef so React effects can react
  const [showHelp, setShowHelp] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const startTimeRef = useRef<number>(0)
  const movementsRef = useRef<{ x: number; y: number; time: number }[]>([])

  // Cup + pointer state
  const cupRef = useRef<{ x: number; y: number }>({ x: CANVAS_W / 2, y: CANVAS_H / 2 })
  const cupVelocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const pointerRef = useRef<{ x: number; y: number } | null>(null)
  const holdingRef = useRef<boolean>(false)
  const grabAnimRef = useRef<number>(0)
  const pausedRef = useRef<boolean>(false)

  // Water animation
  const waterLevelRef = useRef<number>(100)
  const waveOffsetRef = useRef<number>(0)
  const dropletsRef = useRef<Droplet[]>([])

  // --- Scoring (unchanged math) ---
  const calculateScore = useCallback(
    (finalWaterLevel: number, movementData: { x: number; y: number; time: number }[]) => {
      const waterScore = Math.max(0, Math.min(100, finalWaterLevel))
      if (movementData.length < 2) return Math.round(waterScore)
      const mx = movementData.reduce((s, m) => s + m.x, 0) / movementData.length
      const my = movementData.reduce((s, m) => s + m.y, 0) / movementData.length
      let total = 0
      movementData.forEach((m) => {
        total += Math.sqrt(Math.pow(m.x - mx, 2) + Math.pow(m.y - my, 2))
      })
      const avg = total / movementData.length
      const stability = Math.max(0, 100 - avg * 1.5)
      return Math.round(waterScore * 0.7 + stability * 0.3)
    },
    []
  )

  // Render scene
  const drawScene = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Table line
    ctx.fillStyle = 'rgba(115, 115, 115, 0.08)'
    ctx.fillRect(0, canvas.height - 30, canvas.width, 30)

    const cup = cupRef.current
    const w = CUP_WIDTH
    const h = CUP_HEIGHT
    const scale = 1 + grabAnimRef.current * 0.15
    const wScaled = w * scale
    const hScaled = h * scale
    const left = cup.x - wScaled / 2
    const top = cup.y - hScaled / 2
    const rimY = top + 10 * scale
    const baseY = top + hScaled
    const water = waterLevelRef.current

    // Pickup zone (only when not yet holding, in pickup phase)
    if (!holdingRef.current && phase === 'pickup') {
      const pulse = Math.sin(Date.now() / 200) * 8
      ctx.beginPath()
      ctx.arc(cup.x, cup.y, PICKUP_RADIUS + pulse, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.65)'
      ctx.lineWidth = 5
      ctx.setLineDash([12, 8])
      ctx.stroke()
      ctx.setLineDash([])

      ctx.fillStyle = '#16a34a'
      ctx.font = 'bold 20px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('⬇ TAP & HOLD CUP ⬇', cup.x, cup.y - 115)
    }

    // Cup paths
    const taper = 6 * scale
    const rimLeft = left + taper / 2
    const rimRight = left + wScaled - taper / 2
    const baseLeft = left
    const baseRight = left + wScaled

    // Cup body fill
    ctx.beginPath()
    ctx.moveTo(rimLeft, rimY)
    ctx.lineTo(rimRight, rimY)
    ctx.lineTo(baseRight, baseY)
    ctx.lineTo(baseLeft, baseY)
    ctx.closePath()
    ctx.fillStyle = holdingRef.current
      ? 'rgba(220, 240, 250, 0.6)'
      : 'rgba(220, 220, 220, 0.4)'
    ctx.fill()

    // Water
    if (water > 0) {
      const waterH = ((hScaled - 18 * scale) * water) / 100
      const waterTop = baseY - waterH
      const t = (baseY - waterTop) / (baseY - rimY)
      const innerL = baseLeft + (rimLeft - baseLeft) * t
      const innerR = baseRight + (rimRight - baseRight) * t

      ctx.beginPath()
      ctx.moveTo(baseLeft, baseY)
      ctx.lineTo(innerL, waterTop)
      const amp = 3, len = 30
      const steps = Math.ceil((innerR - innerL) / 4)
      for (let i = 0; i <= steps; i++) {
        const tt = i / steps
        const x = innerL + (innerR - innerL) * tt
        const y = waterTop + Math.sin((x + waveOffsetRef.current) / len) * amp
        ctx.lineTo(x, y)
      }
      ctx.lineTo(innerR, waterTop)
      ctx.lineTo(baseRight, baseY)
      ctx.closePath()

      const grad = ctx.createLinearGradient(0, waterTop, 0, baseY)
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.85)')
      grad.addColorStop(1, 'rgba(8, 145, 178, 0.95)')
      ctx.fillStyle = grad
      ctx.fill()
    }

    // Outline
    ctx.beginPath()
    ctx.moveTo(rimLeft, rimY)
    ctx.lineTo(rimRight, rimY)
    ctx.lineTo(baseRight, baseY)
    ctx.lineTo(baseLeft, baseY)
    ctx.closePath()
    ctx.strokeStyle = holdingRef.current ? '#0891b2' : '#475569'
    ctx.lineWidth = 5
    ctx.stroke()

    // Rim ellipse
    ctx.beginPath()
    ctx.ellipse(cup.x, rimY, (rimRight - rimLeft) / 2, 4 * scale, 0, 0, Math.PI * 2)
    ctx.strokeStyle = holdingRef.current ? '#0891b2' : '#475569'
    ctx.lineWidth = 5
    ctx.stroke()

    // Droplets
    dropletsRef.current.forEach((d) => {
      ctx.beginPath()
      ctx.arc(d.x, d.y, 4.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(8, 145, 178, ${Math.max(0, d.life)})`
      ctx.fill()
    })

    // Grab feedback ring
    if (holdingRef.current && grabAnimRef.current < 1) {
      ctx.beginPath()
      ctx.arc(cup.x, cup.y, 90 * (1 - grabAnimRef.current), 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(34, 197, 94, ${1 - grabAnimRef.current})`
      ctx.lineWidth = 5
      ctx.stroke()
    }

    // Pause overlay during testing
    if (phase === 'testing' && pausedRef.current) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 28px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('⏸ PAUSED', canvas.width / 2, canvas.height / 2 - 16)
      ctx.font = 'bold 16px system-ui, sans-serif'
      ctx.fillText('Tap and hold the cup to continue', canvas.width / 2, canvas.height / 2 + 20)
    }
  }, [phase])

  // Animation loop (runs during pickup + testing)
  useEffect(() => {
    if (phase !== 'pickup' && phase !== 'testing') return

    let rafId: number
    const animate = () => {
      const ptr = pointerRef.current

      // Pickup check
      if (!holdingRef.current && ptr && phase === 'pickup') {
        const dx = ptr.x - cupRef.current.x
        const dy = ptr.y - cupRef.current.y
        if (Math.sqrt(dx * dx + dy * dy) < PICKUP_RADIUS) {
          holdingRef.current = true
          setHolding(true) // notify React so the pickup→testing transition can fire
        }
      }

      // Cup follows pointer with inertia (only while holding AND not paused)
      if (holdingRef.current && ptr && !pausedRef.current) {
        const cup = cupRef.current
        const newX = cup.x + (ptr.x - cup.x) * (1 - CUP_INERTIA)
        const newY = cup.y + (ptr.y - cup.y) * (1 - CUP_INERTIA)
        cupVelocityRef.current = { x: newX - cup.x, y: newY - cup.y }
        cupRef.current = { x: newX, y: newY }
      } else {
        cupVelocityRef.current = { x: 0, y: 0 }
      }

      // Spill detection (only during active testing, not paused)
      if (phase === 'testing' && holdingRef.current && !pausedRef.current) {
        const v = Math.sqrt(
          cupVelocityRef.current.x ** 2 + cupVelocityRef.current.y ** 2
        )
        if (v > SPILL_VELOCITY_THRESHOLD && waterLevelRef.current > 0) {
          const spill = (v - SPILL_VELOCITY_THRESHOLD) * SPILL_RATE_PER_FRAME
          waterLevelRef.current = Math.max(0, waterLevelRef.current - spill)

          if (Math.random() < Math.min(0.8, v / 8)) {
            const side = cupVelocityRef.current.x >= 0 ? 1 : -1
            const rimY = cupRef.current.y - CUP_HEIGHT / 2 + 10
            dropletsRef.current.push({
              x: cupRef.current.x + (side * CUP_WIDTH) / 2,
              y: rimY,
              vx: side * (1 + Math.random() * 2.5),
              vy: -1.5 - Math.random() * 2.5,
              life: 1,
            })
          }
        }
        // Record cup position for scoring
        movementsRef.current.push({
          x: cupRef.current.x,
          y: cupRef.current.y,
          time: Date.now() - startTimeRef.current,
        })
      }

      // Grab anim
      if (holdingRef.current && grabAnimRef.current < 1) {
        grabAnimRef.current = Math.min(1, grabAnimRef.current + 0.04)
      }

      // Droplet physics
      const next: Droplet[] = []
      for (const d of dropletsRef.current) {
        d.vy += 0.3
        d.x += d.vx
        d.y += d.vy
        d.life -= 0.012
        if (d.life > 0 && d.y < CANVAS_H + 20) next.push(d)
      }
      dropletsRef.current = next

      waveOffsetRef.current += 1.5
      setWaterLevel(Math.round(waterLevelRef.current))
      drawScene()
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [phase, drawScene])

  // Initial draws for ready/countdown
  useEffect(() => {
    if (phase === 'ready' || phase === 'countdown') drawScene()
  }, [phase, drawScene])

  // Test timer (skipped while paused)
  useEffect(() => {
    if (phase !== 'testing') return
    const interval = setInterval(() => {
      if (pausedRef.current) return
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setPhase('complete')
          const score = calculateScore(waterLevelRef.current, movementsRef.current)
          onComplete({ score, movements: movementsRef.current })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, onComplete, calculateScore])

  // Detect pickup completion → transition to testing
  useEffect(() => {
    if (phase === 'pickup' && holding) {
      const t = setTimeout(() => {
        setTimeRemaining(TEST_DURATION)
        waterLevelRef.current = 100
        dropletsRef.current = []
        movementsRef.current = []
        startTimeRef.current = Date.now()
        setPhase('testing')
      }, 600)
      return () => clearTimeout(t)
    }
  }, [phase, holding])

  // === Pointer handlers ===
  const pointerHandlers = usePointerHandlers(canvasRef, {
    onPointerDown: (p) => {
      pointerRef.current = p
      // During testing, tapping the cup resumes if paused
      if (phase === 'testing' && pausedRef.current) {
        const dx = p.x - cupRef.current.x
        const dy = p.y - cupRef.current.y
        if (Math.sqrt(dx * dx + dy * dy) < PICKUP_RADIUS) {
          holdingRef.current = true
          setHolding(true)
          pausedRef.current = false
          setPaused(false)
        }
      }
    },
    onPointerMove: (p) => {
      pointerRef.current = p
    },
    onPointerUp: () => {
      pointerRef.current = null
      // If we were holding during testing, lifting pauses
      if (phase === 'testing' && holdingRef.current) {
        holdingRef.current = false
        setHolding(false)
        pausedRef.current = true
        setPaused(true)
      } else if (phase === 'pickup' && !holdingRef.current) {
        // Lifted during pickup phase before grabbing — no penalty, just reset pointer
      }
    },
    onPointerCancel: () => {
      pointerRef.current = null
      if (phase === 'testing' && holdingRef.current) {
        holdingRef.current = false
        setHolding(false)
        pausedRef.current = true
        setPaused(true)
      }
    },
  })

  const handleClickStart = () => setPhase('countdown')

  const handleCountdownDone = () => {
    holdingRef.current = false
    setHolding(false)
    grabAnimRef.current = 0
    pausedRef.current = false
    setPaused(false)
    cupRef.current = { x: CANVAS_W / 2, y: CANVAS_H / 2 }
    setPhase('pickup')
  }

  if (phase === 'ready') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6 md:p-8 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none">
                <path d="M7 4h10l-1.5 16h-7z" stroke="#0891b2" strokeWidth="2" strokeLinejoin="round" />
                <path d="M8 10h8" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Steady Cup Test</h2>
              <p className="text-muted-foreground mt-2 md:mt-3 text-base md:text-lg">
                Carry a cup of water without spilling — using your finger.
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 md:p-5 text-left space-y-3">
              <p className="font-bold text-foreground text-base md:text-lg">How to do this test:</p>
              <ol className="space-y-2 text-sm md:text-base text-foreground list-decimal list-inside">
                <li>Tap <span className="font-bold text-primary">START TEST</span></li>
                <li>Wait for the <span className="font-bold">3-2-1-GO</span> countdown</li>
                <li>Tap and hold on the cup to pick it up</li>
                <li>Drag the cup with your finger as steadily as you can for 30 seconds</li>
                <li>If you move too fast, <span className="font-bold text-blue-600">water spills</span></li>
                <li>If you lift your finger, the test <span className="font-bold">pauses</span> — tap the cup again to continue</li>
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
                  <li>The cup has weight — it lags slightly behind your finger</li>
                  <li>Move slowly. Quick movements spill water</li>
                  <li>You can pause at any time by lifting your finger</li>
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
          {phase === 'pickup' ? 'Pick Up the Cup' : paused ? 'Paused' : 'Carry the Cup Steadily'}
        </h2>
        <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
          {phase === 'pickup'
            ? 'Tap and hold on the cup'
            : paused
            ? 'Tap the cup to keep going'
            : waterLevel > 80
            ? "Great! Don't spill!"
            : waterLevel > 50
            ? 'Slow down — water is spilling.'
            : waterLevel > 20
            ? 'Be careful! Lots of water is gone.'
            : 'Save what is left!'}
        </p>
      </div>

      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs md:text-sm font-medium text-muted-foreground">Time</span>
                <span className="text-2xl md:text-3xl font-bold text-foreground tabular-nums">{timeRemaining}s</span>
              </div>
              <Progress value={((TEST_DURATION - timeRemaining) / TEST_DURATION) * 100} className="h-2.5" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs md:text-sm font-medium text-muted-foreground">Water</span>
                <span className="text-2xl md:text-3xl font-bold text-primary tabular-nums">{waterLevel}%</span>
              </div>
              <Progress value={waterLevel} className="h-2.5" />
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
            {...pointerHandlers}
            className="w-full aspect-[3/2] bg-gradient-to-b from-sky-50 to-blue-100 block"
            style={{ maxHeight: '60vh' }}
          />
        </CardContent>
      </Card>

      <p className="text-center text-sm md:text-base text-foreground font-medium">
        Move slowly! Fast movements spill water.
      </p>

      {phase === 'countdown' && (
        <CountdownOverlay
          message="When GO appears, tap and hold on the cup to grab it."
          onComplete={handleCountdownDone}
        />
      )}
    </div>
  )
}
