"use client"

import { useState, useEffect } from "react"
import { auth } from "@/lib/auth"

export function useAuth() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentUser = auth.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const login = async (username, password) => {
    setIsLoading(true)
    const result = await auth.login(username, password)
    setUser(result)
    setIsLoading(false)
    return result
  }

  const logout = () => {
    auth.logout()
    setUser(null)
  }

  return {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isTechnician: user?.role === "technician",
    isWorker: user?.role === "worker",
  }
}
