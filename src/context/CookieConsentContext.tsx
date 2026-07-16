import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useCookieConsent } from '../hooks/useCookieConsent'
import { initGoogleAnalytics, trackPageView } from '../lib/analytics'

type CookieConsentValue = ReturnType<typeof useCookieConsent>

const CookieConsentContext = createContext<CookieConsentValue | null>(null)

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const value = useCookieConsent()
  const location = useLocation()
  const { status } = value

  useEffect(() => {
    if (status === 'accepted') initGoogleAnalytics()
  }, [status])

  useEffect(() => {
    if (status === 'accepted') trackPageView(location.pathname)
  }, [status, location.pathname])

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
}

export function useCookieConsentContext() {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) throw new Error('useCookieConsentContext must be used within CookieConsentProvider')
  return ctx
}
