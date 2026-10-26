import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Minus, Square } from 'lucide-react'
import { WindowState } from './Desktop'
import { cn } from '@/lib/utils'

interface Props {
  window: WindowState
  isActive: boolean
  onFocus: () => void
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onUpdate: (updates: Partial<WindowState>) => void
  children: React.ReactNode
}

export default function Window({
  window,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onUpdate,
  children,
}: Props) {
  const [dragging, setDragging] = useState(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const nodeRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    onFocus()
    setDragging(true)
    dragOffset.current = {
      x: e.clientX - window.x,
      y: e.clientY - window.y,
    }
  }

  useEffect(() => {
    if (!dragging) return

    const onMove = (e: MouseEvent) => {
      onUpdate({
        x: Math.max(0, e.clientX - dragOffset.current.x),
        y: Math.max(0, e.clientY - dragOffset.current.y),
      })
    }
    const onUp = () => setDragging(false)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [dragging, onUpdate])

  const style = window.maximized
    ? { top: 0, left: 0, width: '100%', height: 'calc(100% - 48px)' }
    : {
        top: window.y,
        left: window.x,
        width: window.width,
        height: window.height,
      }

  return (
    <motion.div
      ref={nodeRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        ...style,
        zIndex: window.zIndex,
        position: 'absolute',
      }}
      className={cn(
        'flex flex-col rounded-xl overflow-hidden shadow-window border',
        isActive
          ? 'border-purple-500/40 bg-[#0f0a1a]/95'
          : 'border-white/10 bg-[#0c0814]/90'
      )}
      onMouseDown={onFocus}
    >
      {/* Title bar */}
      <div
        className={cn(
          'h-10 flex items-center justify-between px-3 cursor-move shrink-0',
          isActive ? 'bg-gradient-to-r from-purple-900/40 to-indigo-900/30' : 'bg-white/5'
        )}
        onMouseDown={handleMouseDown}
        onDoubleClick={onMaximize}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-white/90">
          <span className="text-purple-300 text-xs">{window.title}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onMinimize() }}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <Minus size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onMaximize() }}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <Square size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onClose() }}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/80 text-white/60 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative bg-[#0a0712]/80">
        {children}
      </div>
    </motion.div>
  )
}