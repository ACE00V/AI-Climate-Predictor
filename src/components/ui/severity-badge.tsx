import * as React from "react"
import { cn } from "@/lib/utils"

interface SeverityBadgeProps {
  severity: "LOW" | "MODERATE" | "HIGH" | "EXTREME"
  confidence?: number
  className?: string
}

const severityConfig = {
  LOW: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-400/30",
    text: "text-emerald-300",
    glow: "shadow-emerald-500/25",
    ring: "ring-emerald-400/20"
  },
  MODERATE: {
    bg: "bg-amber-500/10",
    border: "border-amber-400/30",
    text: "text-amber-300",
    glow: "shadow-amber-500/25",
    ring: "ring-amber-400/20"
  },
  HIGH: {
    bg: "bg-orange-500/10",
    border: "border-orange-400/30",
    text: "text-orange-300",
    glow: "shadow-orange-500/25",
    ring: "ring-orange-400/20"
  },
  EXTREME: {
    bg: "bg-red-500/10",
    border: "border-red-400/30",
    text: "text-red-300",
    glow: "shadow-red-500/25",
    ring: "ring-red-400/20"
  }
}

export function SeverityBadge({ severity, confidence, className }: SeverityBadgeProps) {
  const config = severityConfig[severity]

  return (
    <div className={cn(
      "inline-flex items-center justify-center",
      "px-3 py-1.5 text-xs font-medium",
      "rounded-full border backdrop-blur-md",
      "transition-all duration-300 ease-out",
      "hover:scale-105 hover:shadow-lg",
      "relative overflow-hidden",
      config.bg,
      config.border,
      config.text,
      `shadow-lg ${config.glow}`,
      `hover:ring-2 ${config.ring}`,
      className
    )}>
      {/* Liquid glass effect background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />

      {/* Glowing border effect */}
      <div className={cn(
        "absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300",
        `ring-1 ${config.ring} ring-offset-0 ring-offset-background`
      )} />

      {/* Content */}
      <span className="relative z-10 font-semibold tracking-wide">
        {severity}
      </span>

      {confidence !== undefined && (
        <span className="relative z-10 ml-2 text-[10px] opacity-75">
          {(confidence * 100).toFixed(0)}%
        </span>
      )}

      {/* Subtle shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
    </div>
  )
}