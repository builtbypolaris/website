import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { LocaleProvider } from './i18n'
import { HomePage } from './pages/HomePage'
import { ServicesPage } from './pages/ServicesPage'
import { StudiosPage } from './pages/StudiosPage'
import { InsightsPage } from './pages/InsightsPage'
import { BlogPostPage } from './pages/BlogPostPage'
import { ContactPage } from './pages/ContactPage'
import { PaywallGuard } from './novo/pages/Paywall'
import NovoLogin from './novo/pages/Login'
import NovoAuthCallback from './novo/pages/AuthCallback'
import NovoDashboard from './novo/pages/Dashboard'
import NovoImpact from './novo/pages/Impact'
import { NovoLayout } from './novo/components/NovoLayout'
import { AuthProvider } from './novo/contexts/AuthContext'
import { TEMPLATES } from './novo/data/templates'
import type { TemplateId } from './novo/types'

// Lazy per-tracker pages so 12 trackers × (page + 3 games) stay out of the main bundle.
const TRACKER_PAGES: Record<TemplateId, React.LazyExoticComponent<React.ComponentType>> = {
  financial: lazy(() => import('./novo/pages/Financial')),
  todo: lazy(() => import('./novo/pages/Todo')),
  habit: lazy(() => import('./novo/pages/Habit')),
  savings: lazy(() => import('./novo/pages/Savings')),
  study: lazy(() => import('./novo/pages/Study')),
  mood: lazy(() => import('./novo/pages/Mood')),
  freelance: lazy(() => import('./novo/pages/Freelance')),
  health: lazy(() => import('./novo/pages/Health')),
  cycle: lazy(() => import('./novo/pages/Cycle')),
  travel: lazy(() => import('./novo/pages/Travel')),
  baby: lazy(() => import('./novo/pages/Baby')),
  pet: lazy(() => import('./novo/pages/Pet')),
}

export default function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
        <Routes>
          {/* Main Polaris website (with navbar + footer) */}
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/studios" element={<StudiosPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/insights/:slug" element={<BlogPostPage />} />
            <Route path="/contact" element={<ContactPage />} />

            <Route path="/id" element={<HomePage />} />
            <Route path="/id/services" element={<ServicesPage />} />
            <Route path="/id/studios" element={<StudiosPage />} />
            <Route path="/id/insights" element={<InsightsPage />} />
            <Route path="/id/insights/:slug" element={<BlogPostPage />} />
            <Route path="/id/contact" element={<ContactPage />} />
          </Route>

          {/* Novo — standalone app shell (no Polaris navbar/footer) */}
          <Route path="/studios/login" element={<AuthProvider><NovoLogin /></AuthProvider>} />
          <Route path="/studios/auth/callback" element={<AuthProvider><NovoAuthCallback /></AuthProvider>} />
          <Route element={<AuthProvider><NovoLayout /></AuthProvider>}>
            <Route path="/studios/dashboard" element={<NovoDashboard />} />
            <Route path="/studios/impact" element={<NovoImpact />} />
            {TEMPLATES.map(t => {
              const Page = TRACKER_PAGES[t.id]
              return (
                <Route
                  key={t.id}
                  path={t.route}
                  element={
                    <PaywallGuard trackerId={t.id}>
                      <Suspense fallback={null}>
                        <Page />
                      </Suspense>
                    </PaywallGuard>
                  }
                />
              )
            })}
          </Route>
        </Routes>
      </LocaleProvider>
    </BrowserRouter>
  )
}
