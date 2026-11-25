import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import AuthProvider from './context/AuthProvider.jsx'
import ToastProvider from './context/ToastProvider.jsx'
import TripProvider from './context/TripProvider.jsx'
import BookingsPage from './pages/BookingsPage.jsx'
import BudgetPage from './pages/BudgetPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import FlightsPage from './pages/FlightsPage.jsx'
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

// Pagina cu harta încarcă Leaflet, deci o încărcăm doar când e nevoie
const PoiPage = lazy(() => import('./pages/PoiPage.jsx'))

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <TripProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="puncte-interes" element={<PoiPage />} />
              <Route path="zboruri" element={<FlightsPage />} />
              <Route path="buget" element={<BudgetPage />} />
              <Route path="plata" element={<CheckoutPage />} />
              <Route path="rezervari" element={<BookingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </TripProvider>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
