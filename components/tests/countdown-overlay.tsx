'use client'

import { useEffect, useRef, useState } from 'react'

interface CountdownOverlayProps {
  onComplete: () => void
  message?: string
}

export function CountdownOverlay({ onComplete, message }: CountdownOverlayProps) {
  const [count, setCount] = useState(3)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (count <= 0) {
      const t = setTimeout(() => onCompleteRef.current(), 500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count])

  const displayValue = count > 0 ? count.toString() : 'GO!'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center pt-safe pb-safe"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="text-center px-6 max-w-md">
        {message && (
          <p className="text-lg md:text-2xl font-medium text-foreground mb-4 md:mb-6 max-w-lg mx-auto">
            {message}
          </p>
        )}

        <div className="relative inline-flex items-center justify-center">
          <div
            key={count}
            className="absolute inset-0 rounded-full bg-primary/20 animate-ping"
            style={{ animationDuration: '1s' }}
          />
          <div
            className="relative flex items-center justify-center rounded-full bg-primary text-white font-black tabular-nums w-[180px] h-[180px] md:w-[260px] md:h-[260px]"
            style={{
              fontSize: count > 0 ? 'clamp(96px, 32vw, 180px)' : 'clamp(48px, 16vw, 90px)',
              lineHeight: 1,
            }}
          >
            {displayValue}
          </div>
        </div>

        <p className="text-base md:text-lg text-muted-foreground mt-5 md:mt-6">
          {count > 0 ? 'Get ready...' : 'Go!'}
        </p>
      </div>
    </div>
  )
}
