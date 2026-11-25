import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import AuthDialog from './AuthDialog.jsx'
import ScrollManager from './ScrollManager.jsx'

export default function Layout() {
  return (
    <>
      <ScrollManager />
      <Navbar />
      <main>
        <Suspense fallback={<div className="wrap section"><div className="skeleton" /></div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <AuthDialog />
    </>
  )
}
