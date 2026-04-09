import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { MotionReveal } from '../components/ui/MotionReveal'
import { fetchBlogPost, fetchBlogIndex, type BlogPost, type BlogPostMeta, type BlogFaqItem } from '../data/blog'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const GRADIENT_URLS = [
  'https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/gradients/gradient-1.svg',
  'https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/gradients/gradient-2.svg',
  'https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/gradients/gradient-3.svg',
  'https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/gradients/gradient-4.svg',
  'https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/gradients/gradient-5.svg',
]

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/** Extract H2/H3 headings for table of contents */
function extractHeadings(md: string) {
  const headings: { level: 2 | 3; text: string; id: string }[] = []
  for (const line of md.split('\n')) {
    if (line.startsWith('### ')) {
      const text = line.slice(4)
      headings.push({ level: 3, text, id: slugify(text) })
    } else if (line.startsWith('## ')) {
      const text = line.slice(3)
      headings.push({ level: 2, text, id: slugify(text) })
    }
  }
  return headings
}

/** Minimal Markdown-to-JSX renderer for blog content */
function renderMarkdown(md: string) {
  const lines = md.split('\n')
  const elements: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.trim() === '') {
      i++
      continue
    }

    if (line.startsWith('### ')) {
      const text = line.slice(4)
      elements.push(
        <h3
          key={i}
          id={slugify(text)}
          className="font-serif font-light text-[22px] text-white mt-10 mb-4 scroll-mt-24"
        >
          {text}
        </h3>,
      )
      i++
      continue
    }
    if (line.startsWith('## ')) {
      const text = line.slice(3)
      elements.push(
        <h2
          key={i}
          id={slugify(text)}
          className="font-serif font-light text-[28px] text-white mt-12 mb-5 scroll-mt-24"
        >
          {text}
        </h2>,
      )
      i++
      continue
    }

    if (line.startsWith('- ')) {
      const items: string[] = []
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2))
        i++
      }
      elements.push(
        <ul
          key={`ul-${i}`}
          className="list-disc list-outside pl-6 space-y-2 mb-6"
        >
          {items.map((item, idx) => (
            <li
              key={idx}
              className="font-sans font-light text-base text-grey-light leading-[1.8]"
              dangerouslySetInnerHTML={{
                __html: item
                  .replace(
                    /\*\*(.+?)\*\*/g,
                    '<strong class="text-white font-normal">$1</strong>',
                  )
                  .replace(/<a /g, '<a style="color:#9b7ee0;text-decoration:underline;text-underline-offset:2px" '),
              }}
            />
          ))}
        </ul>,
      )
      continue
    }

    // Standalone <img> tag
    if (line.trim().startsWith('<img ')) {
      const altMatch = line.match(/alt="([^"]*)"/)
      const caption = altMatch?.[1] || ''
      const gradientIndex = Math.floor(seededRandom(i + 7) * GRADIENT_URLS.length)
      const gradientUrl = GRADIENT_URLS[gradientIndex]
      const cleanImg = line.trim()
        .replace(/style="[^"]*"/g, '')
        .replace(/<img /, '<img style="width:100%;border-radius:8px;display:block" ')
      elements.push(
        <div key={`img-wrap-${i}`} className="my-8">
          <div
            className="p-6 rounded-xl"
            style={{ backgroundImage: `url(${gradientUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <div dangerouslySetInnerHTML={{ __html: cleanImg }} />
          </div>
          {caption && (
            <p className="text-center font-sans text-sm text-grey mt-3">{caption}</p>
          )}
        </div>,
      )
      i++
      continue
    }

    // Table
    if (line.trim().startsWith('|') && lines[i + 1]?.trim().startsWith('|')) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i])
        i++
      }
      const rows = tableLines
        .filter(l => !l.match(/^\|[\s-|]+\|$/))
        .map(l => l.split('|').filter(Boolean).map(c => c.trim()))
      const header = rows[0]
      const body = rows.slice(1)
      elements.push(
        <div key={`table-${i}`} className="overflow-x-auto mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {header?.map((cell, ci) => (
                  <th key={ci} className="text-left font-sans text-sm font-medium text-white py-3 px-4 border-b border-white/10" dangerouslySetInnerHTML={{ __html: cell.replace(/<a /g, '<a style="color:#9b7ee0;text-decoration:underline;text-underline-offset:2px" ') }} />
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="font-sans text-sm font-light text-grey-light py-3 px-4 border-b border-white/[0.06]" dangerouslySetInnerHTML={{ __html: cell.replace(/<a /g, '<a style="color:#9b7ee0;text-decoration:underline;text-underline-offset:2px" ') }} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      continue
    }

    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('- ') &&
      !lines[i].trim().startsWith('<img ') &&
      !lines[i].trim().startsWith('|')
    ) {
      paraLines.push(lines[i])
      i++
    }
    const text = paraLines.join(' ')
    if (!text.trim()) continue
    elements.push(
      <p
        key={`p-${i}`}
        className="font-sans font-light text-base text-grey-light leading-[1.8] mb-6"
        dangerouslySetInnerHTML={{
          __html: text
            .replace(
              /\*\*(.+?)\*\*/g,
              '<strong class="text-white font-normal">$1</strong>',
            )
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/<a /g, '<a style="color:#9b7ee0;text-decoration:underline;text-underline-offset:2px" '),
        }}
      />,
    )
  }

  return elements
}

/** Strip the FAQ section from markdown body (rendered separately) */
function stripFaqFromContent(md: string) {
  const faqIndex = md.search(/^## Frequently asked questions/mi)
  if (faqIndex === -1) return md
  return md.slice(0, faqIndex).trim()
}

/** Table of contents sidebar */
function TableOfContents({ headings }: { headings: { level: 2 | 3; text: string; id: string }[] }) {
  const [activeId, setActiveId] = useState('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    )

    for (const h of headings) {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  // Find which H2 is currently active (either directly or via one of its H3 children)
  let activeH2Id = ''
  for (let i = 0; i < headings.length; i++) {
    const h = headings[i]
    if (h.level === 2) activeH2Id = h.id
    if (h.id === activeId) break
  }

  return (
    <nav className="sticky top-[120px]">
      <p className="font-sans text-[11px] text-grey tracking-[2px] uppercase mb-5">On this page</p>
      <ul className="border-l border-white/[0.08]">
        {headings.map((h, i) => {
          let parentH2 = ''
          if (h.level === 3) {
            for (let j = i - 1; j >= 0; j--) {
              if (headings[j].level === 2) { parentH2 = headings[j].id; break }
            }
          }

          const isH3Hidden = h.level === 3 && parentH2 !== activeH2Id
          const isActive = activeId === h.id

          return (
            <li
              key={h.id}
              className="overflow-hidden transition-all duration-300"
              style={{
                maxHeight: isH3Hidden ? 0 : 48,
                opacity: isH3Hidden ? 0 : 1,
              }}
            >
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth' })
                }}
                className={`block py-2.5 font-sans leading-snug transition-colors duration-200 ${
                  h.level === 3 ? 'pl-6 text-[12px]' : 'pl-4 text-[13px]'
                } ${
                  isActive
                    ? 'text-purple-bright border-l-2 border-purple-bright -ml-[1px]'
                    : 'text-grey hover:text-white/80'
                }`}
              >
                {h.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** FAQ accordion */
function FaqSection({ faqs, heading }: { faqs: BlogFaqItem[]; heading: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="mt-16 border-t border-white/[0.06] pt-10">
      <h2 id={slugify(heading)} className="font-serif font-light text-[28px] text-white mb-8 scroll-mt-24">{heading}</h2>
      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i
          return (
            <div
              key={i}
              className="border border-white/[0.08] rounded-xl overflow-hidden transition-colors duration-200 hover:border-white/[0.15]"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
              >
                <span className="font-sans text-[15px] text-white font-normal leading-snug">{faq.question}</span>
                <svg
                  className={`w-4 h-4 text-grey flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div
                className="grid transition-all duration-300 ease-in-out"
                style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-5">
                    <p className="font-sans font-light text-sm text-grey-light leading-[1.8]">{faq.answer}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined)
  const [related, setRelated] = useState<BlogPostMeta[]>([])

  useEffect(() => {
    if (!slug) return
    fetchBlogPost(slug, 'en').then((p) => setPost(p))
  }, [slug])

  useEffect(() => {
    if (!post) return
    fetchBlogIndex('en').then((all) => {
      const sameCat = all.filter(
        (p) =>
          p.slug !== post.slug &&
          p.categories.some((c) => post.categories.includes(c)),
      )
      if (sameCat.length >= 3) {
        setRelated(sameCat.slice(0, 3))
      } else {
        const others = all.filter(
          (p) => p.slug !== post.slug && !sameCat.includes(p),
        )
        setRelated([...sameCat, ...others].slice(0, 3))
      }
    })
  }, [post])

  // Loading
  if (post === undefined) {
    return <div className="pt-[88px] min-h-screen bg-void" />
  }

  // Not found
  if (post === null) {
    return <Navigate to="/insights" replace />
  }

  const cleanContent = stripFaqFromContent(post.content)
  const headings = extractHeadings(cleanContent)

  // Add FAQ to TOC if present
  const allHeadings = post.faqs
    ? [...headings, { level: 2 as const, text: post.faqs.heading, id: slugify(post.faqs.heading) }]
    : headings

  return (
    <div className="pt-[88px]">
      {/* Header */}
      <section className="bg-void py-[80px]">
        <Container>
          <MotionReveal className="max-w-[760px] mx-auto xl:mx-0 xl:ml-[calc((100%-760px)/2+220px+40px)] xl:ml-auto xl:mr-auto">
            <Link
              to="/insights"
              className="inline-flex items-center gap-2 font-sans text-[13px] text-grey hover:text-purple-bright transition-colors mb-10"
            >
              &larr; Back to Insights
            </Link>

            <div className="flex items-center gap-3 mb-6 flex-wrap">
              {post.categories.map((cat) => (
                <span key={cat} className="font-sans text-[11px] font-normal tracking-[3px] uppercase text-purple-bright bg-purple-core/10 px-3 py-1 rounded-full">
                  {cat}
                </span>
              ))}
              <span className="font-sans text-[13px] text-grey">
                {formatDate(post.date)}
              </span>
              <span className="w-1 h-1 rounded-full bg-grey/40" />
              <span className="font-sans text-[13px] text-grey">
                {post.readTime} min read
              </span>
            </div>

            <h1 className="font-serif font-light text-[40px] md:text-[52px] text-white leading-[1.15] mb-6">
              {post.title}
            </h1>

            <div className="flex items-center gap-3">
              {post.author.avatar ? (
                <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-purple-core/20 flex items-center justify-center">
                  <span className="font-sans text-[13px] text-purple-bright font-medium">
                    {post.author.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="font-sans text-[14px] text-white">{post.author.name}</p>
                {post.author.title && (
                  <p className="font-sans text-[12px] text-grey">{post.author.title}</p>
                )}
              </div>
            </div>
          </MotionReveal>
        </Container>
      </section>

      {/* Cover image */}
      {post.coverImage && (
        <section className="bg-void">
          <Container>
            <div className="max-w-[760px] mx-auto">
              <img
                src={post.coverImage}
                alt={post.coverImageAlt || post.title}
                width={post.coverImageWidth || 1785}
                height={post.coverImageHeight || 949}
                className="w-full rounded-xl"
              />
            </div>
          </Container>
        </section>
      )}

      {/* Content */}
      <section className="bg-deep py-[60px]">
        <div className="mx-auto px-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_760px_1fr] max-w-[1200px]">
          {/* Left column — TOC, aligned with first paragraph */}
          <div className="hidden lg:block pt-10 border-t border-transparent">
            <TableOfContents headings={allHeadings} />
          </div>

          {/* Center column — article */}
          <MotionReveal>
            <div className="border-t border-white/[0.06] pt-10">
              {renderMarkdown(cleanContent)}

              {/* FAQ accordion */}
              {post.faqs && post.faqs.faqs.length > 0 && (
                <FaqSection faqs={post.faqs.faqs} heading={post.faqs.heading} />
              )}
            </div>
          </MotionReveal>

          {/* Right column — empty */}
          <div className="hidden lg:block" />
        </div>
      </section>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="bg-deep pb-[80px]">
          <Container>
            <div className="border-t border-white/[0.06] pt-12">
              <h2 className="font-serif font-light text-[28px] text-white mb-8">
                Related articles
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    to={`/insights/${r.slug}`}
                    className="group flex flex-col rounded-2xl border border-white/[0.04] overflow-hidden bg-card transition-all duration-300 hover:border-purple-core/30 hover:shadow-[0_0_40px_rgba(124,92,191,0.06)] hover:-translate-y-1"
                  >
                    <div className="relative aspect-[16/10] bg-surface overflow-hidden">
                      {r.coverImage ? (
                        <img
                          src={r.coverImage}
                          alt={r.coverImageAlt || r.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-core/15 via-surface to-card" />
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        {r.categories.map((cat) => (
                          <span
                            key={cat}
                            className="font-sans text-[10px] font-normal tracking-[3px] uppercase text-purple-bright bg-purple-core/10 px-2.5 py-0.5 rounded-full"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-serif font-light text-[20px] text-white leading-[1.35] mb-3 group-hover:text-purple-glow transition-colors duration-300">
                        {r.title}
                      </h3>
                      <p className="font-sans font-light text-[14px] text-grey-light leading-[1.7] line-clamp-2 flex-1">
                        {r.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-10">
                <Link
                  to="/insights"
                  className="inline-flex items-center gap-2 font-sans text-sm text-purple-bright hover:text-purple-glow transition-colors"
                >
                  &larr; All articles
                </Link>
              </div>
            </div>
          </Container>
        </section>
      )}
    </div>
  )
}
