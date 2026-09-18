import { useState, useEffect } from "react"

interface UseCountdownOptions {
  durationSeconds: number
  onComplete?: () => void
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":")
}

export function useCountdown({
  durationSeconds,
  onComplete,
}: UseCountdownOptions) {
  const [remaining, setRemaining] = useState(durationSeconds)

  useEffect(() => {
    setRemaining(durationSeconds)
    const interval = setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          clearInterval(interval)
          onComplete?.()
          return 0
        }
        return current - 1
      })
    }, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationSeconds])

  return {
    remaining,
    formatted: formatTime(remaining),
    isFinished: remaining === 0,
  }
}
