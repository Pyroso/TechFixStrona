"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { auth } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const user = await login(username, password)

    if (user) {
      router.push("/")
    } else {
      setError("Invalid username or password")
    }

    setIsLoading(false)
  }

  const mockUsers = auth.getMockUsers()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-2xl">Factory Error Reporting</CardTitle>
            <CardDescription>Sign in to access the dashboard</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="space-y-3 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center font-semibold">Demo Credentials</p>

              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Technicians (can claim, resolve, delete):</p>
                {mockUsers
                  .filter((u) => u.role === "technician")
                  .map((u) => (
                    <button
                      key={u.username}
                      type="button"
                      onClick={() => {
                        setUsername(u.username)
                        setPassword(u.password)
                      }}
                      className="block text-xs text-primary hover:underline text-left w-full"
                    >
                      {u.username} / {u.password}
                    </button>
                  ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Workers (can create, view only):</p>
                {mockUsers
                  .filter((u) => u.role === "worker")
                  .map((u) => (
                    <button
                      key={u.username}
                      type="button"
                      onClick={() => {
                        setUsername(u.username)
                        setPassword(u.password)
                      }}
                      className="block text-xs text-primary hover:underline text-left w-full"
                    >
                      {u.username} / {u.password}
                    </button>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
