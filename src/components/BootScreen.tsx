import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Props {
  onComplete: () => void
}

export default function BootScreen({ onComplete }: Props) {
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Initializing neural core...')

  useEffect(() => {
    const messages = [
      'Initializing neural core...',
      'Loading aura modules...',
      'Calibrating quantum display...',
      'Establishing secure link...',
      'Welcome to Aura OS',
    ]

    let i = 0
    const interval = setInterval(() => {
      i++
      setProgress(Math.min(100, i * 22))
      if (i < messages.length) setStatus(messages[i])
      if (i >= 5) {
        clearInterval(interval)
        setTimeout(onComplete, 600)
      }
    }, 700)

    return () => clearInterval(interval)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05030a]"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6 }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px]" />
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        {/* Logo */}
        <div className="relative">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 flex items-center justify-center shadow-glow">
            <span className="text-4xl font-bold tracking-tighter">A</span>
          </div>
          <div className="absolute -inset-4 rounded-[2rem] border border-purple-500/20 animate-pulse" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            Aura OS
          </h1>
          <p className="text-sm text-purple-300/70 font-mono">{status}</p>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <button
          onClick={onComplete}
          className="mt-4 text-xs text-purple-400/50 hover:text-purple-300 transition-colors"
        >
          skip boot →
        </button>
      </motion.div>
    </motion.div>
  )
}