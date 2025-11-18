import { useEffect, useState } from 'react'

type ColorScheme = 'light' | 'dark'

const getDocumentColorScheme = (): ColorScheme => {
  if (typeof document === 'undefined') {
    return 'light'
  }
  const mode = document.documentElement.dataset.themeMode
  return mode === 'dark' ? 'dark' : 'light'
}

export const useDocumentColorScheme = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => getDocumentColorScheme())

  useEffect(() => {
    if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') {
      return
    }
    const observer = new MutationObserver(() => {
      const next = getDocumentColorScheme()
      setColorScheme((prev: ColorScheme) => (prev === next ? prev : next))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme-mode'] })
    return () => observer.disconnect()
  }, [])

  return colorScheme
}
