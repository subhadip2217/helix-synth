import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BootScreen from './components/BootScreen'
import Desktop from './components/Desktop'

export default function App() {
  const [booted, setBooted] = useState(false)

  useEffect(() => {
    // Auto boot after a short delay if user doesn't click
    const timer = setTimeout(() => setBooted(true), 4200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="h-full w-full relative overflow-hidden bg-[#05030a]">
      <AnimatePresence mode="wait">
        {!booted ? (
          <BootScreen key="boot" onComplete={() => setBooted(true)} />
        ) : (
          <motion.div
            key="desktop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="h-full w-full"
          >
            <Desktop />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}