'use client'

import { motion } from "framer-motion"

interface ConfettiEffectProps {
  level: number
}

export function ConfettiEffect({ level }: ConfettiEffectProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          className="bg-yellow-500/20 text-yellow-400 rounded-full p-8"
        >
          <div className="text-center">
            <h2 className="text-2xl font-bold">Level Up!</h2>
            <p>You are now level {level}</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 