'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { type HandSelection } from '@/components/tremor-tests'
import { CountdownOverlay } from '@/components/tests/countdown-overlay'
import { usePointerHandlers } from '@/lib/use-pointer-handlers'
import { HelpCircle } from 'lucide-react'

interface RestTestProps {
  hand: HandSelection
  onComplete: (result: { score: number; movements: { x: number; y: number; time: number }[] }) => void
}

const TEST_DURATION = 30
const CANVAS_W = 600
const CANVAS_H = 400
const LIFT_PENALTY = 5 // -5 score per finger lift, as agreed

export function RestTest({ onComplete }: RestTestProps) {
  const [phase, setPhase] = useState<'ready' | 'countdown' | 'testing' | 'complete'>('ready')
  const [timeRemaining, setTimeRemaining] = useState(TEST_DURATION)
  const [showHelp, setShowHelp] = useState(false)
  const [pulse, setPulse] = useState(0)
  const [liftCount, setLiftCount] = useState(0)
  const [touching, setTouching] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const startTimeRef = useRef<number>(0)
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null)
  const touchingRef = useRef<boolean>(false)
  const movementsRef = useRef<{ x: number; y: number; time: number }[]>([])
  const liftCountRef = useRef<number>(0)

  // --- Scoring (unchanged math, just adds lift penalty at the end) ---
  const calculateScore = useCallback(
    (movementData: { x: number; y: number; time: number }[], lifts: number) => {
      if (movementData.length < 2) return Math.max(0, 100 - lifts * LIFT_PENALTY)
      let totalDeviation = 0
      const cx = movementData.reduce((s, m) => s + m.x, 0) / movementData.length
      const cy = movementData.reduce((s, m) => s + m.y, 0) / movementData.length
      movementData.forEach((m) => {
        totalDeviation += Math.sqrt(Math.pow(m.x - cx, 2) + Math.pow(m.y - cy, 2))
      })
      const avg = totalDeviation / movementData.length
      const base = Math.max(0, Math.min(100, 100 - (avg - 5) * 2))
      return Math.round(Math.max(0, base - lifts * LIFT_PENALTY))
    },
    []
  )

  // Pulse animation for the target ring
  useEffect(() => {
    if (phase === 'complete') return
    const interval = setInterval(() => setPulse((p) => (p + 1) % 1000), 50)
    return () => clearInterval(interval)
  }, [phase])

  // Draw the target on canvas
  const drawTarget = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const cx = canvas.width / 2
    const cy = canvas.height / 2

    // Pulsing outer ring (only during ready/countdown/when not touching)
    if (phase !== 'testing' || !touchingRef.current) {
      const pulseSize = 80 + Math.sin(pulse * 0.15) * 14
      ctx.beginPath()
      ctx.arc(cx, cy, pulseSize, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(34, 197, 94, 0.55)'
      ctx.lineWidth = 5
      ctx.setLineDash([10, 8])
      ctx.stroke()
      ctx.setLineDash([])
    }

    // Outer ring
    ctx.beginPath()
    ctx.arc(cx, cy, 64, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(8, 145, 178, 0.12)'
    ctx.fill()
    ctx.strokeStyle = '#0891b2'
    ctx.lineWidth = 5
    ctx.stroke()

    // Mid ring
    ctx.beginPath()
    ctx.arc(cx, cy, 38, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(8, 145, 178, 0.28)'
    ctx.fill()

    // Inner bullseye dot
    ctx.beginPath()
    ctx.arc(cx, cy, 16, 0, Math.PI * 2)
    ctx.fillStyle = '#0891b2'
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 4
    ctx.stroke()

    // Labels (only when not touching)
    if (phase !== 'testing' || !touchingRef.current) {
      ctx.fillStyle = '#16a34a'
      ctx.font = 'bold 18px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('⬇ TAP & HOLD HERE ⬇', cx, cy - 105)
    }
  }, [phase, pulse])

  useEffect(() => {
    drawTarget()
  }, [drawTarget])

  // Sample finger position every 50ms while touching (so we have data even if user is perfectly still)
  useEffect(() => {
    if (phase !== 'testing') return
    const sampler = setInterval(() => {
      if (touchingRef.current && lastPositionRef.current) {
        movementsRef.current.push({
          x: lastPositionRef.current.x,
          y: lastPositionRef.current.y,
          time: Date.now() - startTimeRef.current,
        })
      }
    }, 50)
    return () => clearInterval(sampler)
  }, [phase])

  // Test countdown timer
  useEffect(() => {
    if (phase !== 'testing') return
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setPhase('complete')
          const score = calculateScore(movementsRef.current, liftCountRef.current)
          onComplete({ score, movements: movementsRef.current })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [phase, onComplete, calculateScore])

  // === Pointer handlers (mouse + touch + stylus) ===
  const pointerHandlers = usePointerHandlers(canvasRef, {
    onPointerDown: (p) => {
      lastPositionRef.current = p
      touchingRef.current = true
      setTouching(true)
    },
    onPointerMove: (p) => {
      lastPositionRef.current = p
      if (phase === 'testing' && touchingRef.current) {
        // Draw the trail
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        if (ctx) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(8, 145, 178, 0.55)'
          ctx.fill()
        }
      }
    },
    onPointerUp: () => {
      // Finger lifted — count it as a "lift" only if we're actively testing
      if (phase === 'testing' && touchingRef.current) {
        liftCountRef.current += 1
        setLiftCount(liftCountRef.current)
      }
      touchingRef.current = false
      setTouching(false)
    },
    onPointerCancel: () => {
      if (phase === 'testing' && touchingRef.current) {
        liftCountRef.current += 1
        setLiftCount(liftCountRef.current)
      }
      touchingRef.current = false
      setTouching(false)
    },
  })

  const handleClickStart = () => {
    setPhase('countdown')
  }

  const handleCountdownDone = () => {
    setTimeRemaining(TEST_DURATION)
    movementsRef.current = []
    liftCountRef.current = 0
    setLiftCount(0)
    startTimeRef.current = Date.now()
    drawTarget()
    setPhase('testing')
  }

  if (phase === 'ready') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-6 md:p-8 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <div className="w-5 h-5 rounded-full bg-primary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Rest Test</h2>
              <p className="text-muted-foreground mt-2 md:mt-3 text-base md:text-lg">
                Tap and hold on the dot to start. Try not to lift your finger.
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 md:p-5 text-left space-y-3">
              <p className="font-bold text-foreground text-base md:text-lg">How to do this test:</p>
              <ol className="space-y-2 text-sm md:text-base text-foreground list-decimal list-inside">
                <li>Tap <span className="font-bold text-primary">START TEST</span></li>
                <li>Wait for the <span className="font-bold">3-2-1-GO</span> countdown</li>
                <li>Press and HOLD your finger on the <span className="font-bold text-primary">blue dot</span></li>
                <li>Keep it as still as possible for 30 seconds</li>
                <li>If you lift your finger, you lose <span className="font-bold text-red-600">5 points each time</span></li>
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
                  <li>Rest your elbow on a table for better steadiness</li>
                  <li>Press lightly — no need to push hard</li>
                  <li>It&apos;s normal to drift a little</li>
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
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Hold Still on the Dot</h2>
        <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-base">
          {touching ? 'Stay there — don\'t lift your finger!' : 'Tap and HOLD on the dot'}
        </p>
      </div>

      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs md:text-sm font-medium text-muted-foreground">Time</span>
                <span className="text-2xl md:text-3xl font-bold text-primary tabular-nums">{timeRemaining}s</span>
              </div>
              <Progress value={((TEST_DURATION - timeRemaining) / TEST_DURATION) * 100} className="h-2.5" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs md:text-sm font-medium text-muted-foreground">Lifts</span>
                <span className={`text-2xl md:text-3xl font-bold tabular-nums ${liftCount > 0 ? 'text-red-600' : 'text-foreground'}`}>
                  {liftCount} <span className="text-sm font-normal text-muted-foreground">(-{liftCount * LIFT_PENALTY})</span>
                </span>
              </div>
              <div className={`text-xs md:text-sm ${touching ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}`}>
                {touching ? '● touching' : '○ not touching'}
              </div>
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
            className="w-full aspect-[3/2] bg-gradient-to-br from-blue-50 to-cyan-50 block"
            style={{ maxHeight: '60vh' }}
          />
        </CardContent>
      </Card>

      {phase === 'countdown' && (
        <CountdownOverlay
          message="Press and hold on the blue dot in the middle when GO appears!"
          onComplete={handleCountdownDone}
        />
      )}
    </div>
  )
}
