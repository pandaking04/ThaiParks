import { createContext, useContext, type ReactNode } from 'react'
import { useSavedParks } from '../hooks/useSavedParks'

type SavedParksValue = ReturnType<typeof useSavedParks>

const SavedParksContext = createContext<SavedParksValue | null>(null)

export function SavedParksProvider({ children }: { children: ReactNode }) {
  const value = useSavedParks()
  return <SavedParksContext.Provider value={value}>{children}</SavedParksContext.Provider>
}

export function useSavedParksContext() {
  const ctx = useContext(SavedParksContext)
  if (!ctx) throw new Error('useSavedParksContext must be used within SavedParksProvider')
  return ctx
}
