"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Undo } from "lucide-react"

export default function AreaCalculator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [points, setPoints] = useState<{ x: number; y: number }[]>([])
  const [area, setArea] = useState<number | null>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 })

  // Initialize canvas and handle resize
  useEffect(() => {
    const handleResize = () => {
      const width = Math.min(600, window.innerWidth - 40)
      setCanvasSize({
        width,
        height: Math.floor((width / 600) * 400),
      })
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Draw on canvas whenever points change
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height)

    // Draw the shape
    if (points.length > 0) {
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }

      if (points.length > 2) {
        ctx.lineTo(points[0].x, points[0].y)
      }

      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.stroke()

      // Fill with semi-transparent color
      ctx.fillStyle = "rgba(59, 130, 246, 0.2)"
      ctx.fill()

      // Draw points
      points.forEach((point, index) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = index === 0 ? "#10b981" : "#3b82f6"
        ctx.fill()
      })
    }

    // Calculate area if we have a closed shape (3+ points)
    if (points.length > 2) {
      const calculatedArea = calculatePolygonArea(points)
      setArea(calculatedArea)
    } else {
      setArea(null)
    }
  }, [points])

  // Draw grid helper function
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 0.5

    // Draw vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Draw horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }

  // Calculate polygon area using Shoelace formula
  const calculatePolygonArea = (vertices: { x: number; y: number }[]): number => {
    let area = 0
    const n = vertices.length

    // Need at least 3 points to form a polygon
    if (n < 3) return 0

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n
      area += vertices[i].x * vertices[j].y
      area -= vertices[j].x * vertices[i].y
    }

    area = Math.abs(area) / 2
    return Math.round(area)
  }

  // Handle mouse events
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // If we click near the first point and have at least 3 points, close the shape
    if (points.length > 2) {
      const firstPoint = points[0]
      const distance = Math.sqrt(Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2))

      if (distance < 20) {
        setIsDrawing(false)
        return
      }
    }

    setPoints([...points, { x, y }])
    setIsDrawing(true)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Draw a temporary line
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Redraw everything
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawGrid(ctx, canvas.width, canvas.height)

    // Draw the existing shape
    if (points.length > 0) {
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }

      // Draw the line to current mouse position
      ctx.lineTo(x, y)

      ctx.strokeStyle = "#3b82f6"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw points
      points.forEach((point, index) => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = index === 0 ? "#10b981" : "#3b82f6"
        ctx.fill()
      })
    }
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const handleClear = () => {
    setPoints([])
    setArea(null)
  }

  const handleUndo = () => {
    if (points.length > 0) {
      setPoints(points.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Card className="border shadow-md p-0">
        <CardContent className="p-0">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-crosshair"
          />
        </CardContent>
      </Card>

      <div className="flex gap-2 mt-2">
        <Button variant="outline" onClick={handleUndo} disabled={points.length === 0}>
          <Undo className="h-4 w-4 mr-2" />
          بازگشت
        </Button>
        <Button variant="outline" onClick={handleClear} disabled={points.length === 0}>
          <Trash2 className="h-4 w-4 mr-2" />
          پاک کردن
        </Button>
      </div>

      <div className="mt-4 text-center">
        {area !== null ? (
          <div className="flex flex-col items-center">
            <p className="text-lg font-medium">مساحت: {area} پیکسل مربع</p>
            <p className="text-sm text-muted-foreground">{points.length} نقطه رسم شده</p>
          </div>
        ) : (
          <p className="text-muted-foreground">
            {points.length === 0 ? "برای شروع، روی بوم کلیک کنید" : "برای تشکیل یک شکل، به رسم ادامه دهید"}
          </p>
        )}
      </div>

    </div>
  )
}

