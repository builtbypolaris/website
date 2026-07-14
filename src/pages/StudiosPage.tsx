import NovoHome from '../novo/pages/Home'
import { AuthProvider } from '../novo/contexts/AuthContext'
import { usePageHead } from '../hooks/usePageHead'
import { en } from '../i18n/locales/en'

export function StudiosPage() {
  // Novo is English-only — meta tags stay English in both site locales
  usePageHead({ title: en.meta.studios.title, description: en.meta.studios.description })
  return <AuthProvider><NovoHome /></AuthProvider>
}
