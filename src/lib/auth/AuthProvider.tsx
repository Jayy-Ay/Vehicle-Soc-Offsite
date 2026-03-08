import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { demoUsers, type DemoUser } from './demo-users'
import { hasRequiredRole, type Role } from './roles'

type AuthUser = {
  id: string
  email: string
  name: string
  role: Role
  title?: string
  source: 'supabase' | 'demo'
}

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

type AuthContextValue = {
  user: AuthUser | null
  status: AuthStatus
  isDemo: boolean
  supabaseReady: boolean
  signInWithEmail: (params: { email: string; password: string }) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInAsDemo: (userId: string) => Promise<void>
  signOut: () => Promise<void>
  allowed: (roles?: Role[]) => boolean
  demoDirectory: DemoUser[]
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const DEMO_STORAGE_KEY = 'vehicle-soc-demo-user'

const mapSupabaseUser = (session: Session | null): AuthUser | null => {
  if (!session?.user) return null
  const user = session.user
  const role = (user.user_metadata?.role as Role | undefined) ?? 'viewer'

  return {
    id: user.id,
    email: user.email ?? '',
    name:
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      user.email ||
      'Authenticated User',
    role,
    title: (user.user_metadata?.title as string | undefined) || 'Authenticated',
    source: 'supabase',
  }
}

const mapDemoUser = (user: DemoUser): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  title: user.title,
  source: 'demo',
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  const restoreDemoSession = useCallback(() => {
    const cached = localStorage.getItem(DEMO_STORAGE_KEY)
    if (!cached) return null
    try {
      const parsed = JSON.parse(cached) as AuthUser
      setUser(parsed)
      setStatus('authenticated')
      return parsed
    } catch (error) {
      console.warn('Failed to restore demo auth session', error)
      localStorage.removeItem(DEMO_STORAGE_KEY)
      setStatus('unauthenticated')
      return null
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    let unsubscribe: (() => void) | undefined

    const bootstrap = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data } = await supabase.auth.getSession()
          const mapped = mapSupabaseUser(data.session)
          if (!isMounted) return

          if (mapped) {
            setUser(mapped)
            setStatus('authenticated')
          } else {
            const demo = restoreDemoSession()
            if (!demo) {
              setUser(null)
              setStatus('unauthenticated')
            }
          }
        } catch (error) {
          if (!isMounted) return
          const demo = restoreDemoSession()
          if (!demo) {
            setUser(null)
            setStatus('unauthenticated')
          }
        }

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (!isMounted) return
          const mapped = mapSupabaseUser(session)
          if (mapped) {
            setUser(mapped)
            setStatus('authenticated')
          } else {
            const demo = restoreDemoSession()
            if (!demo) {
              setUser(null)
              setStatus('unauthenticated')
            }
          }
        })

        unsubscribe = () => listener?.subscription.unsubscribe()
        return
      }

      const demo = restoreDemoSession()
      if (!demo) {
        setStatus((current) => (current === 'loading' ? 'unauthenticated' : current))
      }
    }

    void bootstrap()

    return () => {
      isMounted = false
      unsubscribe?.()
    }
  }, [restoreDemoSession])

  const signInWithEmail = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        const mapped = mapSupabaseUser(data.session)
        setUser(mapped)
        setStatus(mapped ? 'authenticated' : 'unauthenticated')
        return
      }

      const demoMatch = demoUsers.find(
        (demoUser) => demoUser.email.toLowerCase() === email.toLowerCase()
      )

      if (!demoMatch || demoMatch.password !== password) {
        throw new Error('Invalid demo credentials')
      }

      const mapped = mapDemoUser(demoMatch)
      setUser(mapped)
      setStatus('authenticated')
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(mapped))
    },
    []
  )

  const signInAsDemo = useCallback(async (userId: string) => {
    const demoMatch = demoUsers.find((demoUser) => demoUser.id === userId)
    if (!demoMatch) throw new Error('Demo user not found')
    const mapped = mapDemoUser(demoMatch)
    setUser(mapped)
    setStatus('authenticated')
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(mapped))
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Google login requires Supabase credentials. Using demo accounts instead.')
    }
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      })
      if (error) {
        if (error.message?.toLowerCase().includes('provider is not enabled')) {
          throw new Error('Google provider is disabled in Supabase. Enable it under Authentication > Providers or continue with demo accounts.')
        }
        throw error
      }
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      throw error
    }
  }, [])

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut()
    }
    localStorage.removeItem(DEMO_STORAGE_KEY)
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const value = useMemo(
    () => ({
      user,
      status,
      isDemo: user?.source === 'demo',
      supabaseReady: isSupabaseConfigured,
      signInWithEmail,
      signInWithGoogle,
      signInAsDemo,
      signOut,
      allowed: (roles?: Role[]) => hasRequiredRole(user?.role, roles),
      demoDirectory: demoUsers,
    }),
    [signInAsDemo, signInWithEmail, signInWithGoogle, signOut, status, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
