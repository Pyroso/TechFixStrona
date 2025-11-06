"use client"

import { useEffect } from "react"

export function useAutoRefresh(callback, interval = 5000) {
  useEffect(() => {
    callback()
    const timer = setInterval(callback, interval)
    return () => clearInterval(timer)
  }, [callback, interval])
}
