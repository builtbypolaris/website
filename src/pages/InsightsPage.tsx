import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { MotionReveal } from '../components/ui/MotionReveal'
import { ConstellationCanvas } from '../components/canvas/ConstellationCanvas'
import { fetchBlogIndex, type BlogPostMeta } from '../data/blog'
import { useT, useLocale, buildLocalePath } from '../i18n'
import { usePageHead } from '../hooks/usePageHead'

// Category keys are stable (must match what's stored in blog frontmatter).
// Their display labels are pulled from the active locale via t.insights.categories.
const CATEGORIES = [
  'All',
  'Websites',
  'Apps',
  'SEO',
  'Content',
  'Automation',
  'AI',
  'Strategy',
] as const

type Category = (typeof CATEGORIES)[number]

export function InsightsPage() {
  const t = useT()
  const locale = useLocale()
  usePageHead({
    title: t.meta.insights.title,
    description: t.meta.insights.description,
  })
  const [posts, setPosts] = useState<BlogPostMeta[] | null>(null)
  const [active, setActive] = useState<Category>('All')

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  useEffect(() => {
    fetchBlogIndex(locale).then(setPosts)
  }, [locale])

  const loaded = posts ?? []
  const filtered =
    active === 'All'
      ? loaded
      : loaded.filter((p) =>
          p.categories.some((c) => c.toLowerCase() === active.toLowerCase()),
        )

  const [featured, ...rest] = filtered

  return (
    <div className="pt-[64px]">
      {/* Hero — dark */}
      <section className="bg-void py-[100px] relative overflow-hidden">
        <ConstellationCanvas />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-purple-core/[0.07] rounded-full blur-[140px]" />
        <Container className="relative z-[1]">
          <MotionReveal className="text-center max-w-[860px] mx-auto">
            <p className="font-sans font-light text-[13px] text-gold tracking-[4px] uppercase mb-8">
              {t.insights.eyebrow}
            </p>
            <h1 className="font-serif font-black text-[52px] sm:text-[68px] md:text-[84px] lg:text-[96px] text-white leading-[0.92] -tracking-[0.03em] mb-8">
              {t.insights.titleLine1}<br />
              <em style={{ color: '#7C3AED', fontStyle: 'italic', fontWeight: 700, fontFamily: "'Nunito', Arial, sans-serif" }}>
                {t.insights.titleLine2}
              </em>
            </h1>
            <p className="font-sans font-light text-[16px] text-grey-light leading-[1.75] max-w-[480px] mx-auto">
              {t.insights.subtitle}
            </p>
          </MotionReveal>
        </Container>
      </section>

      {/* Category tabs + posts — dark bg, white cards */}
      <section className="bg-deep py-[80px]">
        <Container>
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-12 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`cursor-pointer font-sans text-[13px] tracking-[2px] uppercase whitespace-nowrap px-5 py-2.5 rounded-full border transition-all duration-200 ${
                  active === cat
                    ? 'bg-purple-core/20 border-purple-core/40 text-purple-bright'
                    : 'bg-transparent border-white/[0.06] text-grey hover:border-white/[0.12] hover:text-grey-light'
                }`}
              >
                {t.insights.categories[cat]}
              </button>
            ))}
          </div>

          {/* Loading state */}
          {posts === null && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-white/[0.06] bg-white overflow-hidden animate-pulse">
                  <div className="aspect-[16/10] bg-[#E5E4E2]" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 w-20 bg-[#E5E4E2] rounded" />
                    <div className="h-5 w-3/4 bg-[#E5E4E2] rounded" />
                    <div className="h-4 w-full bg-[#E5E4E2] rounded" />
                    <div className="h-4 w-2/3 bg-[#E5E4E2] rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {posts !== null && filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="font-sans text-grey text-base">
                {t.insights.emptyState}
              </p>
            </div>
          )}

          {/* Featured post */}
          {featured && (
            <MotionReveal>
              <Link
                to={`${buildLocalePath('/insights', locale)}/${featured.slug}`}
                className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_60px_rgba(124,92,191,0.12)] hover:-translate-y-0.5"
              >
                <div className="grid md:grid-cols-2">
                  {/* Cover image */}
                  <div className="relative aspect-[16/10] md:aspect-auto bg-[#E5E4E2] overflow-hidden">
                    {featured.coverImage ? (
                      <img
                        src={featured.coverImage}
                        alt={featured.coverImageAlt || featured.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-core/10 via-[#E5E4E2] to-[#F5F4F2]" />
                        <div
                          className="absolute inset-0 opacity-[0.05]"
                          style={{
                            backgroundImage:
                              'linear-gradient(#09090F 1px, transparent 1px), linear-gradient(90deg, #09090F 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                          }}
                        />
                      </>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-8 md:p-10 flex flex-col justify-center bg-white">
                    <div className="flex items-center gap-3 mb-5 flex-wrap">
                      {featured.categories.map((cat) => (
                        <span key={cat} className="font-sans text-[11px] font-normal tracking-[3px] uppercase text-purple-core bg-purple-core/10 px-3 py-1 rounded-full">
                          {cat}
                        </span>
                      ))}
                      <span className="font-sans text-[13px] text-[#09090F]/50">
                        {formatDate(featured.date)}
                      </span>
                    </div>

                    <h2 className="font-serif font-light text-[28px] md:text-[36px] text-[#09090F] leading-[1.25] mb-5 group-hover:text-purple-core transition-colors duration-300">
                      {featured.title}
                    </h2>

                    <p className="font-sans font-light text-base text-[#09090F]/65 leading-[1.8] mb-8">
                      {featured.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {featured.author.avatar ? (
                          <img src={featured.author.avatar} alt={featured.author.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-core/10 flex items-center justify-center">
                            <span className="font-sans text-[11px] text-purple-core font-medium">
                              {featured.author.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <span className="font-sans text-[13px] text-[#09090F]/70">
                            {featured.author.name}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-[#09090F]/20" />
                          <span className="font-sans text-[13px] text-[#09090F]/50">
                            {featured.readTime} {t.insights.minRead}
                          </span>
                        </div>
                      </div>
                      <span className="font-sans text-sm text-purple-core group-hover:translate-x-1 transition-transform duration-300">
                        {t.insights.read}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </MotionReveal>
          )}

          {/* Post grid */}
          {rest.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {rest.map((post, i) => (
                <MotionReveal key={post.slug} delay={i * 0.08} className="h-full">
                  <Link
                    to={`${buildLocalePath('/insights', locale)}/${post.slug}`}
                    className="group flex flex-col h-full rounded-2xl overflow-hidden bg-white transition-all duration-300 hover:shadow-[0_0_40px_rgba(124,92,191,0.10)] hover:-translate-y-1"
                  >
                    <div className="relative aspect-[16/10] bg-[#E5E4E2] overflow-hidden">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.coverImageAlt || post.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-core/10 via-[#E5E4E2] to-[#F5F4F2]" />
                          <div
                            className="absolute inset-0 opacity-[0.05]"
                            style={{
                              backgroundImage:
                                'linear-gradient(#09090F 1px, transparent 1px), linear-gradient(90deg, #09090F 1px, transparent 1px)',
                              backgroundSize: '32px 32px',
                            }}
                          />
                        </>
                      )}
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        {post.categories.map((cat) => (
                          <span key={cat} className="font-sans text-[10px] font-normal tracking-[3px] uppercase text-purple-core bg-purple-core/10 px-2.5 py-0.5 rounded-full">
                            {cat}
                          </span>
                        ))}
                        <span className="font-sans text-[12px] text-[#09090F]/50">
                          {formatDate(post.date)}
                        </span>
                      </div>

                      <h3 className="font-serif font-light text-[20px] text-[#09090F] leading-[1.35] mb-3 group-hover:text-purple-core transition-colors duration-300">
                        {post.title}
                      </h3>

                      <p className="font-sans font-light text-[14px] text-[#09090F]/60 leading-[1.7] mb-5 line-clamp-2 flex-1">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center gap-3 pt-4 border-t border-[#E5E4E2]">
                        {post.author.avatar ? (
                          <img src={post.author.avatar} alt={post.author.name} className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-purple-core/10 flex items-center justify-center">
                            <span className="font-sans text-[9px] text-purple-core font-medium">
                              {post.author.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="font-sans text-[12px] text-[#09090F]/60">
                          {post.author.name}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-[#09090F]/20" />
                        <span className="font-sans text-[12px] text-[#09090F]/50">
                          {post.readTime} {t.insights.minRead}
                        </span>
                      </div>
                    </div>
                  </Link>
                </MotionReveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </div>
  )
}
