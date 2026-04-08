import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const BLOG_DIR = join(import.meta.dirname, '..', 'public', 'blog')

function parseFrontmatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---/)
  if (!match) return null
  try {
    return JSON.parse(match[1])
  } catch {
    return null
  }
}

async function buildIndex(lang) {
  const dir = join(BLOG_DIR, lang)
  let files
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith('.md'))
  } catch {
    return
  }

  const posts = []
  for (const file of files) {
    const raw = await readFile(join(dir, file), 'utf-8')
    const meta = parseFrontmatter(raw)
    if (meta) posts.push(meta)
  }

  // Sort newest first
  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  await writeFile(join(dir, 'index.json'), JSON.stringify(posts, null, 2))
  console.log(`blog/${lang}/index.json → ${posts.length} post(s)`)
}

// Build for all language folders
const langs = (await readdir(BLOG_DIR, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name)

for (const lang of langs) {
  await buildIndex(lang)
}
