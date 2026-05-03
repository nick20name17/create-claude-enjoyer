import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren
} from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderProps = PropsWithChildren<{
  defaultTheme?: Theme
  storageKey?: string
}>

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export const ThemeProvider = ({
  children,
  defaultTheme = 'system',
  storageKey = 'theme'
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme | null) ?? defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    const applied =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme

    root.classList.add(applied)
  }, [theme])

  const value: ThemeProviderState = {
    theme,
    setTheme: (next) => {
      localStorage.setItem(storageKey, next)
      setTheme(next)
    }
  }

  return (
    <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeProviderContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
