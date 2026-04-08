export interface BlogAuthor {
  name: string
  title: string
  avatar: string
  bio: string
}

export interface BlogReviewer {
  name: string
  title: string
  avatar: string
}

export interface BlogSeo {
  title: string
  description: string
  image: string
}

export interface BlogFaqItem {
  question: string
  answer: string
}

export interface BlogFaqs {
  heading: string
  type: string
  answerType: string
  faqs: BlogFaqItem[]
  supportLink: string | null
}

export interface BlogPostMeta {
  title: string
  slug: string
  date: string
  updated: string
  template: string
  excerpt: string
  coverImage: string
  coverImageAlt: string
  coverImageWidth: number
  coverImageHeight: number
  categories: string[]
  readTime: number
  author: BlogAuthor
  reviewer: BlogReviewer | null
  seo: BlogSeo
  faqs: BlogFaqs | null
}

export interface BlogPost extends BlogPostMeta {
  content: string
}

/** Parse JSON frontmatter between --- delimiters */
function parseFrontmatter(raw: string): { meta: BlogPostMeta | null; content: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) return { meta: null, content: raw }

  try {
    const meta = JSON.parse(match[1]) as BlogPostMeta
    return { meta, content: match[2].trim() }
  } catch {
    return { meta: null, content: raw }
  }
}

export async function fetchBlogIndex(lang: string = 'en'): Promise<BlogPostMeta[]> {
  const res = await fetch(`/blog/${lang}/index.json`)
  if (!res.ok) return []
  return res.json()
}

export async function fetchBlogPost(slug: string, lang: string = 'en'): Promise<BlogPost | null> {
  const res = await fetch(`/blog/${lang}/${slug}.md`)
  if (!res.ok) return null

  const raw = await res.text()
  const { meta, content } = parseFrontmatter(raw)

  if (!meta) return null

  return { ...meta, content }
}
