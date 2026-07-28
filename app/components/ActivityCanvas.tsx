'use client'
import { useEffect, useRef } from 'react'

type ActivityEvent = { type: 'add' | 'update' | 'delete'; time: number }

export default function ActivityCanvas({ events }: { events: ActivityEvent[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const barWidth = 30
    const gap = 10
    const maxBars = Math.floor(canvas.width / (barWidth + gap))
    const visible = events.slice(-maxBars)

    visible.forEach(function(event, i) {
      const x = i * (barWidth + gap) + gap
      const height = 60 + Math.random() * 40
      const y = canvas.height - height - 10

      if (event.type === 'add') ctx.fillStyle = '#22c55e'
      else if (event.type === 'update') ctx.fillStyle = '#3b82f6'
      else ctx.fillStyle = '#ef4444'

      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, height, 4)
      ctx.fill()

      ctx.fillStyle = '#6b7280'
      ctx.font = '9px sans-serif'
      ctx.textAlign = 'center'
      const label = event.type === 'add' ? '+' : event.type === 'update' ? '~' : '-'
      ctx.fillText(label, x + barWidth / 2, canvas.height - 2)
    })

    if (visible.length === 0) {
      ctx.fillStyle = '#9ca3af'
      ctx.font = '13px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('No activity yet. Add a note to see live chart!', canvas.width / 2, canvas.height / 2)
    }
  }, [events])

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={120}
      className='w-full rounded-xl bg-gray-50 border border-gray-200'
    />
  )
}