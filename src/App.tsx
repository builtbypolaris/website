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
import NovoFinancial from './novo/pages/Financial'
import NovoTodo from './novo/pages/Todo'
import NovoHabit from './novo/pages/Habit'
import { NovoLayout } from './novo/components/NovoLayout'
import { AuthProvider } from './novo/contexts/AuthContext'

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
            <Route path="/studios/app/financial" element={<PaywallGuard trackerId="financial"><NovoFinancial /></PaywallGuard>} />
            <Route path="/studios/app/todo" element={<PaywallGuard trackerId="todo"><NovoTodo /></PaywallGuard>} />
            <Route path="/studios/app/habit" element={<PaywallGuard trackerId="habit"><NovoHabit /></PaywallGuard>} />
          </Route>
        </Routes>
      </LocaleProvider>
    </BrowserRouter>
  )
}
