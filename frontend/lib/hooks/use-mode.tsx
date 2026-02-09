'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'

type Mode = 'learner' | 'mentor'

interface ModeContextType {
  mode: Mode
  setMode: (mode: Mode) => void
}

const ModeContext = createContext<ModeContextType | undefined>(undefined)

export function ModeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mode, setModeState] = useState<Mode>('learner')

  useEffect(() => {
    // Check URL params on mount and route changes
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const urlMode = params.get('mode')
      if (urlMode === 'mentor' || urlMode === 'learner') {
        setModeState(urlMode)
      } else {
        setModeState('learner')
      }
    }
  }, [pathname])

  const setMode = (newMode: Mode) => {
    setModeState(newMode)
    // Update URL without page reload
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('mode', newMode)
      router.push(url.pathname + url.search, { scroll: false })
    }
  }

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  const context = useContext(ModeContext)
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider')
  }
  return context
}
