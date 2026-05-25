import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { User } from '@/types'
import { api, getToken, setToken, ApiError } from '@/lib/api'

interface AuthValue {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  /** Called by auth pages after successful OTP verification. */
  loginWithToken: (token: string, user: User) => void
  logout: () => void
  update: (patch: Partial<User>) => Promise<void>
}

const Ctx = createContext<AuthValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Boot: if a token is present, fetch the current user. If 401, clear it.
  useEffect(() => {
    const token = getToken()
    if (!token) {
      setLoading(false)
      return
    }
    ;(async () => {
      try {
        const data = await api<{ user: User }>('/api/me')
        setUser(data.user)
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          setToken(null)
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const loginWithToken = useCallback((token: string, u: User) => {
    setToken(token)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const update = useCallback(async (patch: Partial<User>) => {
    const data = await api<{ user: User }>('/api/me', { method: 'PATCH', body: patch })
    setUser(data.user)
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      loginWithToken,
      logout,
      update,
    }),
    [user, loading, loginWithToken, logout, update],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth must be used inside <AuthProvider>')
  return v
}
