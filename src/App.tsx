import { Route, Routes } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { SavedParksProvider } from './context/SavedParksContext'
import { SearchPage } from './pages/SearchPage'
import { ParkDetailPage } from './pages/ParkDetailPage'

function App() {
  return (
    <SavedParksProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/parks/:id" element={<ParkDetailPage />} />
      </Routes>
    </SavedParksProvider>
  )
}

export default App
