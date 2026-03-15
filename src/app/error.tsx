"use client"

import { useEffect } from "react"
import { ErrorState } from "@/components/ErrorState"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <ErrorState 
        message="We encountered an unexpected error while visioning your sketch. Don't worry, your creativity isn't lost."
        onRetry={reset}
        onHome={() => window.location.href = "/"}
        errorId={error.digest}
      />
    </div>
  )
}
