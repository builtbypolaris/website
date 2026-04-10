import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { LocaleProvider, LocaleAutoDetect } from './i18n'
import { HomePage } from './pages/HomePage'
import { ServicesPage } from './pages/ServicesPage'
import { AboutPage } from './pages/AboutPage'
import { InsightsPage } from './pages/InsightsPage'
import { BlogPostPage } from './pages/BlogPostPage'
import { ContactPage } from './pages/ContactPage'

export default function App() {
  return (
    <BrowserRouter>
      <LocaleProvider>
        <LocaleAutoDetect />
        <Routes>
          <Route element={<Layout />}>
            {/* English (default — lives at the root, no prefix) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/insights/:slug" element={<BlogPostPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Indonesian (lives under the /id prefix) */}
            <Route path="/id" element={<HomePage />} />
            <Route path="/id/services" element={<ServicesPage />} />
            <Route path="/id/about" element={<AboutPage />} />
            <Route path="/id/insights" element={<InsightsPage />} />
            <Route path="/id/insights/:slug" element={<BlogPostPage />} />
            <Route path="/id/contact" element={<ContactPage />} />
          </Route>
        </Routes>
      </LocaleProvider>
    </BrowserRouter>
  )
}
