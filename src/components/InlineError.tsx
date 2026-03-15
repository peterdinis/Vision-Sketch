"use client"

import * as React from "react"
import { Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface InlineErrorProps {
  message?: string
  className?: string
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div 
          initial={{ opacity: 0, height: 0, scale: 0.95 }}
          animate={{ opacity: 1, height: "auto", scale: 1 }}
          exit={{ opacity: 0, height: 0, scale: 0.95 }}
          className={cn(
            "p-4 bg-destructive/5 border border-destructive/20 rounded-2xl flex gap-3 text-destructive text-sm overflow-hidden",
            className
          )}
        >
          <Info className="w-5 h-5 shrink-0" />
          <p className="font-medium">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
