import NovoHome from '../novo/pages/Home'
import { AuthProvider } from '../novo/contexts/AuthContext'
import { usePageHead } from '../hooks/usePageHead'
import { useT } from '../i18n'

export function StudiosPage() {
  const t = useT()
  usePageHead({ title: t.meta.studios.title, description: t.meta.studios.description })
  return <AuthProvider><NovoHome /></AuthProvider>
}
