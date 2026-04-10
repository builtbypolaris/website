import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const SITE_URL = 'https://www.builtbypolaris.com'
const PUBLIC_DIR = join(import.meta.dirname, '..', 'public')
const BLOG_DIR = join(PUBLIC_DIR, 'blog')

// Locales the site supports. The default locale (en) lives at the root,
// other locales live under their code as a path prefix (e.g. /id).
const LOCALES = ['en', 'id']
const DEFAULT_LOCALE = 'en'

// Static pages with their priority and change frequency. Each entry is
// emitted once per locale (e.g. /services AND /id/services).
const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/services', priority: '0.9', changefreq: 'monthly' },
  { path: '/about', priority: '0.7', changefreq: 'monthly' },
  { path: '/insights', priority: '0.8', changefreq: 'daily' },
  { path: '/contact', priority: '0.6', changefreq: 'monthly' },
]

/**
 * Build a localized URL from a canonical English path.
 *   ('/services', 'en') → 'https://.../services'
 *   ('/services', 'id') → 'https://.../id/services'
 *   ('/',         'id') → 'https://.../id'
 */
function localizedUrl(canonicalPath, lang) {
  if (lang === DEFAULT_LOCALE) return `${SITE_URL}${canonicalPath}`
  if (canonicalPath === '/') return `${SITE_URL}/${lang}`
  return `${SITE_URL}/${lang}${canonicalPath}`
}

/**
 * Emit a single <url> entry with hreflang alternates pointing at every
 * locale that has this canonical path. The entry's <loc> is the URL in
 * `currentLang`. Alternates always include x-default → English.
 */
function toXmlEntry(canonicalPath, currentLang, availableLangs, lastmod, changefreq, priority) {
  const loc = localizedUrl(canonicalPath, currentLang)

  // One <xhtml:link> per available language, plus x-default → English.
  const alternates = availableLangs
    .map(
      (lang) =>
        `    <xhtml:link rel="alternate" hreflang="${lang}" href="${localizedUrl(canonicalPath, lang)}"/>`,
    )
    .join('\n')

  const xDefault = availableLangs.includes(DEFAULT_LOCALE)
    ? `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${localizedUrl(canonicalPath, DEFAULT_LOCALE)}"/>`
    : ''

  return `  <url>
    <loc>${loc}</loc>
${alternates}${xDefault}
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

/**
 * Read the frontmatter of every blog post in every language folder. Returns
 * a map of `slug → { langs: Set<string>, dates: { [lang]: 'YYYY-MM-DD' } }`.
 *
 * This lets us emit one <url> per (slug, lang) pair AND give each one the
 * right hreflang alternates pointing only at languages that actually have
 * the post.
 */
async function getBlogPostMap() {
  const map = new Map()

  let langs
  try {
    langs = (await readdir(BLOG_DIR, { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  } catch {
    return map
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
        const slug = meta.slug || file.replace('.md', '')
        const date = meta.updated || meta.date || new Date().toISOString().slice(0, 10)

        if (!map.has(slug)) {
          map.set(slug, { langs: new Set(), dates: {} })
        }
        const entry = map.get(slug)
        entry.langs.add(lang)
        entry.dates[lang] = date
      } catch {
        // skip invalid frontmatter
      }
    }
  }

  return map
}

// ── Build sitemap ────────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10)
const blogMap = await getBlogPostMap()

const entries = []

// Static pages: emit one entry per (page, locale) combination. All locales
// always exist for static pages because the React Router routes are
// universal — there's no per-locale page enablement.
for (const page of STATIC_PAGES) {
  for (const lang of LOCALES) {
    entries.push(toXmlEntry(page.path, lang, LOCALES, today, page.changefreq, page.priority))
  }
}

// Blog posts: emit one entry per (slug, lang-that-has-it). Hreflang
// alternates only reference languages that actually have the post on disk.
for (const [slug, info] of blogMap.entries()) {
  const availableLangs = Array.from(info.langs)
  for (const lang of availableLangs) {
    entries.push(
      toXmlEntry(`/insights/${slug}`, lang, availableLangs, info.dates[lang], 'daily', '0.6'),
    )
  }
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`

await writeFile(join(PUBLIC_DIR, 'sitemap.xml'), sitemap)

const totalStaticEntries = STATIC_PAGES.length * LOCALES.length
const totalBlogEntries = Array.from(blogMap.values()).reduce(
  (sum, info) => sum + info.langs.size,
  0,
)
console.log(
  `sitemap.xml → ${totalStaticEntries} static + ${totalBlogEntries} blog entries (${blogMap.size} unique posts across ${LOCALES.length} locales)`,
)
