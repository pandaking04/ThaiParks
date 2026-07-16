import { Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { CookieConsentBanner } from './components/CookieConsentBanner'
import { SavedParksProvider } from './context/SavedParksContext'
import { CookieConsentProvider } from './context/CookieConsentContext'
import { SearchPage } from './pages/SearchPage'
import { ParkDetailPage } from './pages/ParkDetailPage'

function App() {
  return (
    <CookieConsentProvider>
      <SavedParksProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<SearchPage />} />
          <Route path="/parks/:id" element={<ParkDetailPage />} />
        </Routes>
        <CookieConsentBanner />
      </SavedParksProvider>
    </CookieConsentProvider>
  )
}

export default App
