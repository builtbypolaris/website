import { useEffect, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import { Container } from '../components/ui/Container'
import { MotionReveal } from '../components/ui/MotionReveal'
import { fetchBlogPost, type BlogPost } from '../data/blog'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
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
      elements.push(
        <h3
          key={i}
          className="font-serif font-light text-[22px] text-white mt-10 mb-4"
        >
          {line.slice(4)}
        </h3>,
      )
      i++
      continue
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2
          key={i}
          className="font-serif font-light text-[28px] text-white mt-12 mb-5"
        >
          {line.slice(3)}
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
                __html: item.replace(
                  /\*\*(.+?)\*\*/g,
                  '<strong class="text-white font-normal">$1</strong>',
                ),
              }}
            />
          ))}
        </ul>,
      )
      continue
    }

    const paraLines: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('- ')
    ) {
      paraLines.push(lines[i])
      i++
    }
    const text = paraLines.join(' ')
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
            .replace(/\*(.+?)\*/g, '<em>$1</em>'),
        }}
      />,
    )
  }

  return elements
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPost | null | undefined>(undefined)

  useEffect(() => {
    if (!slug) return
    fetchBlogPost(slug, 'en').then((p) => setPost(p))
  }, [slug])

  // Loading
  if (post === undefined) {
    return <div className="pt-[88px] min-h-screen bg-void" />
  }

  // Not found
  if (post === null) {
    return <Navigate to="/insights" replace />
  }

  return (
    <div className="pt-[88px]">
      {/* Header */}
      <section className="bg-void py-[80px]">
        <Container>
          <MotionReveal className="max-w-[760px] mx-auto">
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

      {/* Content */}
      <section className="bg-deep py-[60px]">
        <Container>
          <MotionReveal className="max-w-[760px] mx-auto">
            <div className="border-t border-white/[0.06] pt-10">
              {renderMarkdown(post.content)}
            </div>
          </MotionReveal>
        </Container>
      </section>

      {/* Back link */}
      <section className="bg-deep pb-[80px]">
        <Container>
          <div className="max-w-[760px] mx-auto border-t border-white/[0.06] pt-10">
            <Link
              to="/insights"
              className="inline-flex items-center gap-2 font-sans text-sm text-purple-bright hover:text-purple-glow transition-colors"
            >
              &larr; All articles
            </Link>
          </div>
        </Container>
      </section>
    </div>
  )
}
