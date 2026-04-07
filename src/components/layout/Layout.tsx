import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar } from './Navbar'
import { Footer } from './Footer'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function Layout() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="w-full pb-24">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
