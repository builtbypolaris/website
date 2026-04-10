import { CtaSection } from '../components/sections/CtaSection'
import { useT } from '../i18n'
import { usePageHead } from '../hooks/usePageHead'

export function ContactPage() {
  const t = useT()
  usePageHead({
    title: t.meta.contact.title,
    description: t.meta.contact.description,
  })
  return (
    <div className="pt-[88px]">
      <CtaSection />
    </div>
  )
}
