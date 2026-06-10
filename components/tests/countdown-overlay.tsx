"use client"

import { useEffect, useRef, useState } from "react"

interface CountdownOverlayProps {
  onComplete: () => void
  message?: string
}

// FULL-SCREEN countdown — uses ref for onComplete so parent re-renders don't reset the timer
export function CountdownOverlay({ onComplete, message }: CountdownOverlayProps) {
  const [count, setCount] = useState(3)
  const onCompleteRef = useRef(onComplete)

  // Keep onComplete ref up-to-date without re-triggering the timer effect
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  // Timer — only re-runs when count changes
  useEffect(() => {
    if (count <= 0) {
      const t = setTimeout(() => onCompleteRef.current(), 500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count])

  const displayValue = count > 0 ? count.toString() : "GO!"

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="text-center px-6">
        {message && (
          <p className="text-xl md:text-2xl font-medium text-foreground mb-6 max-w-lg mx-auto">
            {message}
          </p>
        )}

        <div className="relative inline-flex items-center justify-center">
          <div
            key={count}
            className="absolute inset-0 rounded-full bg-primary/20 animate-ping"
            style={{ animationDuration: "1s" }}
          />
          <div
            className="relative flex items-center justify-center rounded-full bg-primary text-white font-black"
            style={{
              width: "260px",
              height: "260px",
              fontSize: count > 0 ? "180px" : "90px",
              lineHeight: 1,
            }}
          >
            {displayValue}
          </div>
        </div>

        <p className="text-lg text-muted-foreground mt-6">
          {count > 0 ? "Get ready..." : "Go!"}
        </p>
      </div>
    </div>
  )
}
