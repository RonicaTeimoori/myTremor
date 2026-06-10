'use client'

import { useCallback, useRef } from 'react'

/**
 * Convert a pointer event's clientX/Y into canvas-internal coordinates.
 * Uses getBoundingClientRect and the canvas's own width/height so the result
 * is in the same coordinate system as the canvas's drawing buffer.
 */
export function getCanvasPoint(
  canvas: HTMLCanvasElement,
  e: { clientX: number; clientY: number }
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect()
  const x = (e.clientX - rect.left) * (canvas.width / rect.width)
  const y = (e.clientY - rect.top) * (canvas.height / rect.height)
  return { x, y }
}

interface PointerHandlers {
  onPointerDown?: (p: { x: number; y: number }, raw: React.PointerEvent<HTMLCanvasElement>) => void
  onPointerMove?: (p: { x: number; y: number }, raw: React.PointerEvent<HTMLCanvasElement>) => void
  onPointerUp?: (p: { x: number; y: number } | null, raw: React.PointerEvent<HTMLCanvasElement>) => void
  /** Pointer left the canvas without coming back yet — usually treat the same as up */
  onPointerCancel?: (raw: React.PointerEvent<HTMLCanvasElement>) => void
}

/**
 * Returns onPointerDown/Move/Up/Cancel handlers that work for mouse, touch, and stylus.
 * Automatically captures the pointer so drags don't get interrupted when the finger
 * briefly leaves the canvas bounds.
 */
export function usePointerHandlers(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  handlers: PointerHandlers
) {
  const activePointerId = useRef<number | null>(null)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      // Capture the pointer so we keep getting move/up events even if the finger drifts
      // off the canvas. Critical for the cup test (cup can chase finger off-bounds).
      try {
        canvas.setPointerCapture(e.pointerId)
      } catch {}
      activePointerId.current = e.pointerId
      const p = getCanvasPoint(canvas, e)
      handlersRef.current.onPointerDown?.(p, e)
    },
    [canvasRef]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      // If we're tracking a specific pointer (after pointerdown), ignore others
      if (activePointerId.current !== null && e.pointerId !== activePointerId.current) return
      const p = getCanvasPoint(canvas, e)
      handlersRef.current.onPointerMove?.(p, e)
    },
    [canvasRef]
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      if (activePointerId.current !== null && e.pointerId !== activePointerId.current) return
      const p = canvas ? getCanvasPoint(canvas, e) : null
      try {
        canvas.releasePointerCapture(e.pointerId)
      } catch {}
      activePointerId.current = null
      handlersRef.current.onPointerUp?.(p, e)
    },
    [canvasRef]
  )

  const onPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      activePointerId.current = null
      handlersRef.current.onPointerCancel?.(e)
    },
    []
  )

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel }
}
