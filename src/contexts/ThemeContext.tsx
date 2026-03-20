'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'ph-theme'

function persistAndApply(next: Theme) {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, next)
  } catch (_) {}
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', next === 'dark')
  }
}

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
}>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    const stored = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as Theme | null
    // Default to light mode unless the user explicitly chose a theme before.
    const next: Theme = stored === 'dark' || stored === 'light' ? stored : 'light'
    setThemeState(next)
    persistAndApply(next)
  }, [])

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t)
    persistAndApply(t)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      persistAndApply(next)
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
