const SESSION_KEY = "factory_session"

const mockUsers = {
  // Technicians - can claim/resolve/delete
  john: { password: "tech123", name: "John Smith", role: "technician" },
  sarah: { password: "tech456", name: "Sarah Johnson", role: "technician" },
  // Workers - can create reports and claim/resolve them
  mike: { password: "worker123", name: "Mike Wilson", role: "worker" },
  lisa: { password: "worker456", name: "Lisa Brown", role: "worker" },
}

export const auth = {
  login: async (username, password) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const user = mockUsers[username.toLowerCase()]

    if (user && user.password === password) {
      const userData = {
        id: username,
        name: user.name,
        role: user.role,
      }
      if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify(userData))
      }
      return userData
    }
    return null
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(SESSION_KEY)
    }
  },

  getCurrentUser: () => {
    if (typeof window === "undefined") return null
    const session = localStorage.getItem(SESSION_KEY)
    return session ? JSON.parse(session) : null
  },

  isAuthenticated: () => {
    if (typeof window === "undefined") return false
    return !!localStorage.getItem(SESSION_KEY)
  },

  hasRole: (role) => {
    const user = auth.getCurrentUser()
    return user?.role === role
  },

  getMockUsers: () => Object.entries(mockUsers).map(([username, data]) => ({ username, ...data })),
}
