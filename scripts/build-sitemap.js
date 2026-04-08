import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const SITE_URL = 'https://www.builtbypolaris.com'
const PUBLIC_DIR = join(import.meta.dirname, '..', 'public')
const BLOG_DIR = join(PUBLIC_DIR, 'blog')

// Static pages with their priority and change frequency
const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/services', priority: '0.9', changefreq: 'monthly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/insights', priority: '0.8', changefreq: 'weekly' },
  { path: '/contact', priority: '0.6', changefreq: 'monthly' },
]

function toXmlEntry(loc, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${loc}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

async function getBlogPosts() {
  const posts = []
  let langs
  try {
    langs = (await readdir(BLOG_DIR, { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  } catch {
    return posts
  }

  for (const lang of langs) {
    const dir = join(BLOG_DIR, lang)
    let files
    try {
      files = (await readdir(dir)).filter((f) => f.endsWith('.md'))
    } catch {
      continue
    }

    for (const file of files) {
      const raw = await readFile(join(dir, file), 'utf-8')
      const match = raw.match(/^---\s*\n([\s\S]*?)\n---/)
      if (!match) continue

      try {
        const meta = JSON.parse(match[1])
        posts.push({
          slug: meta.slug || file.replace('.md', ''),
          date: meta.updated || meta.date || new Date().toISOString().slice(0, 10),
          lang,
        })
      } catch {
        // skip invalid frontmatter
      }
    }
  }

  return posts
}

// Build sitemap
const today = new Date().toISOString().slice(0, 10)
const posts = await getBlogPosts()

const entries = [
  // Static pages
  ...STATIC_PAGES.map((p) =>
    toXmlEntry(`${SITE_URL}${p.path}`, today, p.changefreq, p.priority)
  ),
  // Blog posts
  ...posts.map((p) =>
    toXmlEntry(`${SITE_URL}/insights/${p.slug}`, p.date, 'monthly', '0.6')
  ),
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`

await writeFile(join(PUBLIC_DIR, 'sitemap.xml'), sitemap)
console.log(`sitemap.xml → ${STATIC_PAGES.length} pages + ${posts.length} post(s)`)
