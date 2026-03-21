"use client";

import { motion } from "framer-motion";
import { AlertCircle, Home, type LucideIcon, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message: string;
  icon?: LucideIcon;
  onRetry?: () => void;
  onHome?: () => void;
  className?: string;
  errorId?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  icon: Icon = AlertCircle,
  onRetry,
  onHome,
  className,
  errorId,
}: ErrorStateProps) {
  return (
    <div className={cn("flex items-center justify-center p-6 min-h-[400px]", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-8"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-destructive/20 blur-3xl rounded-full opacity-50" />
          <div className="relative w-24 h-24 bg-destructive/10 border border-destructive/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Icon className="w-12 h-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-black tracking-tight">{title}</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">{message}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onRetry && (
            <Button
              onClick={onRetry}
              size="lg"
              className="rounded-2xl gap-2 font-bold px-8 shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
            >
              <RefreshCcw className="w-5 h-5" />
              Try Again
            </Button>
          )}
          {onHome && (
            <Button
              variant="outline"
              size="lg"
              className="rounded-2xl gap-2 font-bold px-8 border-border/50 hover:bg-secondary/50 transition-all"
              onClick={onHome}
            >
              <Home className="w-5 h-5" />
              Back Home
            </Button>
          )}
        </div>

        {errorId && (
          <p className="text-[10px] uppercase font-mono tracking-widest text-muted-foreground/50 pt-8">
            Error ID: {errorId}
          </p>
        )}
      </motion.div>
    </div>
  );
}
