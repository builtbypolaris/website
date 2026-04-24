---
{
  "title": "How to optimize images for web without losing quality",
  "slug": "how-to-optimize-images-for-web",
  "date": "2026-04-10",
  "updated": "2026-04-10",
  "template": "default",
  "excerpt": "Images make up over half of most page weight. Here's how to optimize images for web so your site loads fast without sacrificing visual quality.",
  "coverImage": "https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/how-to-optimize-images-for-web/illustration-cover.svg",
  "coverImageAlt": "Image files being compressed and converted into lighter web-optimized formats",
  "coverImageWidth": 1785,
  "coverImageHeight": 949,
  "categories": ["Websites"],
  "readTime": 8,
  "author": {
    "name": "Polaris Team",
    "title": "Digital Consultancy",
    "avatar": "",
    "bio": ""
  },
  "reviewer": null,
  "seo": {
    "title": "How to optimize images for web without losing quality",
    "description": "Learn how to optimize images for web with modern formats, compression, lazy loading, and responsive sizing. Practical steps that cut load times without hurting quality.",
    "image": "https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/how-to-optimize-images-for-web/illustration-cover.svg"
  },
  "faqs": {
    "heading": "Frequently asked questions",
    "type": "default",
    "answerType": "markdown",
    "faqs": [
      {
        "question": "What's the best image format to optimize images for web?",
        "answer": "WebP is the safest modern choice with over 97% browser support. It produces files 25-34% smaller than JPEG at similar quality. AVIF is even better at compression (50% smaller than JPEG) but encodes slower and has slightly less browser coverage at 93.8%."
      },
      {
        "question": "How do I optimize images for web without losing quality?",
        "answer": "Use lossy compression at quality 75-85, which removes data the human eye can't detect. Pair that with proper sizing (never serve a 4000px image in a 800px container) and a modern format like WebP. The result looks identical to the original at a fraction of the file size."
      },
      {
        "question": "Does optimizing images for web help SEO?",
        "answer": "Yes. Images directly affect Largest Contentful Paint (LCP), one of Google's Core Web Vitals ranking signals. Pages with optimized images score better on LCP, and sites with good Core Web Vitals have a measurable advantage in search results."
      },
      {
        "question": "Should I lazy load all images to optimize images for web?",
        "answer": "No. Lazy load images below the fold, but never lazy load the largest image in your initial viewport (your LCP element). Lazy loading your LCP image can delay it significantly, dropping your LCP 'good' score from 79% to just 52%."
      },
      {
        "question": "What tools can I use to optimize images for web?",
        "answer": "Squoosh (browser-based, free) is great for one-off compressions. ShortPixel and TinyPNG handle bulk optimization. For automated pipelines, sharp (Node.js) or imagemin can process images at build time. CDNs like Cloudinary or Imgix optimize and serve images on the fly."
      }
    ],
    "supportLink": null
  }
}
---

Images account for more than half of total page weight on most websites. That single fact explains why unoptimized images remain the number one performance killer on the web. If your site feels sluggish, your images are almost certainly part of the problem.

The frustrating part is that most of these images are far larger than they need to be. A hero photo served as a 3MB PNG when a 150KB WebP would look identical. Product images at 4000px wide displayed in an 800px container. Decorative backgrounds that load before the visitor even scrolls to them.

Here's how to optimize images for web properly, so your pages load fast without sacrificing the visual quality your visitors expect.

## Why image optimization matters for performance and SEO

Before getting into the how, it's worth understanding the stakes. A 1-second delay in page load time costs roughly 7% in conversions, 11% fewer page views, and a 16% decrease in customer satisfaction. When load time increases from 1 to 5 seconds, bounce rates jump by 90%.

Images play a central role in those numbers because they're often the heaviest resource on any given page. They also directly affect <a href="https://web.dev/articles/lcp" target="_blank" rel="noopener noreferrer">Largest Contentful Paint (LCP)</a>, one of Google's three <a href="https://web.dev/articles/vitals" target="_blank" rel="noopener noreferrer">Core Web Vitals</a>. LCP measures how quickly the largest visible element loads, and that element is frequently an image. Only 67% of websites currently achieve a "good" LCP score, and unoptimized images are a major reason for the rest.

When you optimize images for web, you're not just trimming file sizes. You're improving your search rankings, keeping visitors engaged, and protecting your conversion rate. (For broader speed wins, see our <a href="/insights/how-to-improve-website-loading-speed">guide to improving website loading speed</a>.)

<img src="https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/how-to-optimize-images-for-web/illustration-0.svg" alt="Chart showing how image file size affects page load time and bounce rates" />

## Choose the right image format

Format selection is the single highest-impact decision you can make when optimizing images. The difference between formats isn't marginal; it's dramatic.

### JPEG: The reliable baseline

JPEG has been the web's workhorse for decades. It handles photographs well and supports lossy compression, which means you can trade small amounts of visual quality for significant file size reductions. For a JPEG, quality settings between 75 and 85 hit the sweet spot where files shrink substantially but still look sharp to the human eye. Above 85, file sizes grow quickly with minimal visible improvement.

### WebP: The modern standard

<a href="https://developers.google.com/speed/webp" target="_blank" rel="noopener noreferrer">WebP</a> produces files 25-34% smaller than JPEG at equivalent visual quality. Lossless WebP images are 26% smaller than PNGs. With <a href="https://caniuse.com/webp" target="_blank" rel="noopener noreferrer">over 97% browser support</a>, there's almost no reason not to use it. WebP handles both photographs and graphics with transparency, making it a versatile replacement for both JPEG and PNG in most situations.

### AVIF: The next generation

<a href="https://aomediacodec.github.io/av1-avif/" target="_blank" rel="noopener noreferrer">AVIF</a> takes compression further, producing files roughly 50% smaller than JPEG and 20-25% smaller than WebP at similar quality. The trade-off is that AVIF encodes 5-10x slower than WebP and decodes about 2x slower. <a href="https://caniuse.com/avif" target="_blank" rel="noopener noreferrer">Browser support sits at 93.8%</a>, which is excellent but not quite universal. For static assets that you compress once and serve many times, AVIF's slower encoding is a non-issue.

### PNG: When you need it

PNG is lossless and supports transparency, which makes it the right choice for logos, icons, and graphics with sharp edges or text. But for photographs, PNG files are enormous compared to the alternatives. If you're using PNG for photos, that's your first optimization win.

### What to use when

Use AVIF with a WebP fallback for photographs and complex images. Use SVG for icons, logos, and simple illustrations. Use PNG only when you need lossless quality with transparency and can't use WebP lossless. Skip GIF entirely for animations and use MP4 or WebM video instead, as a 10-second GIF can easily be 10x larger than the equivalent video.

## Compress your images properly

Choosing the right format is step one. Compression is step two, and getting it right means understanding the difference between lossy and lossless compression.

**Lossy compression** removes image data that the human eye can't easily detect. At quality 80, most photographs look identical to the original while being 60-80% smaller. The key is finding the threshold where quality loss becomes noticeable for your specific images.

**Lossless compression** reduces file size without removing any data. It's less aggressive (typically 10-30% reduction) but preserves every pixel exactly. Use it for graphics, screenshots, and images where precision matters.

Here are the tools that do this well:

- **<a href="https://squoosh.app/" target="_blank" rel="noopener noreferrer">Squoosh</a>**: Browser-based, free, and lets you compare before and after side by side. Great for one-off images.
- **<a href="https://shortpixel.com/" target="_blank" rel="noopener noreferrer">ShortPixel</a>**: Bulk optimization with a generous free tier. Handles WebP and AVIF conversion automatically.
- **<a href="https://sharp.pixelplumbing.com/" target="_blank" rel="noopener noreferrer">Sharp</a>**: A Node.js library for build-time processing. If you're working with a developer or a build pipeline, this is the standard.
- **<a href="https://tinypng.com/" target="_blank" rel="noopener noreferrer">TinyPNG</a>**: Simple drag-and-drop compression that also handles WebP. The name is misleading; it compresses JPEGs too.

A practical workflow: export your images at full quality from your design tool, then run them through Squoosh or ShortPixel at quality 75-80 in WebP format. Compare the result against the original. If you can't see the difference at the size it'll be displayed, you're done.

<img src="https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/how-to-optimize-images-for-web/illustration-1.svg" alt="Comparison of image formats showing file size differences between JPEG, WebP, and AVIF" />

## Size and serve responsive images

Compression handles file weight, but dimension handling is just as important. Serving a 3000px-wide image to a phone with a 400px screen wastes bandwidth on pixels that will never be seen.

### Resize before uploading

Determine the maximum display size for each image on your site and resize accordingly. A full-width hero image on a 1440px layout doesn't need to be wider than about 2880px (to account for 2x retina displays). A blog thumbnail displayed at 400px wide needs to be no more than 800px.

### Use responsive image markup

HTML gives you <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#responsive_images" target="_blank" rel="noopener noreferrer">built-in tools for serving different image sizes</a> to different screens:

```html
<img
  srcset="image-400.webp 400w,
          image-800.webp 800w,
          image-1200.webp 1200w"
  sizes="(max-width: 600px) 100vw,
         (max-width: 1200px) 50vw,
         33vw"
  src="image-800.webp"
  alt="Descriptive alt text"
  width="800"
  height="600"
/>
```

The `srcset` attribute tells the browser what sizes are available. The `sizes` attribute tells it how wide the image will be displayed at different viewport widths. The browser then picks the smallest file that covers its needs. This alone can cut image transfer sizes by 40-70% on mobile devices.

### Always specify width and height

Including `width` and `height` attributes lets the browser reserve the right amount of space before the image loads. Without them, your layout shifts as images pop in, which hurts your <a href="https://web.dev/articles/cls" target="_blank" rel="noopener noreferrer">Cumulative Layout Shift (CLS)</a> score. This is an easy fix that costs nothing.

## Lazy load strategically

<a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#loading" target="_blank" rel="noopener noreferrer">Lazy loading</a> delays image downloads until they're about to enter the viewport. It's built into browsers with a single attribute:

```html
<img src="photo.webp" alt="Description" loading="lazy" />
```

When done right, lazy loading reduces initial page weight dramatically because you're only loading what's visible. But there's an important catch.

**Never lazy load your LCP image.** Your LCP element is the largest visible piece of content in the initial viewport, and it's often a hero image or banner. Lazy loading tells the browser to deprioritize that image, which delays your LCP metric. Data shows that pages without lazy-loaded LCP images score 79% "good" on LCP, compared to just 52% for pages that lazy load their LCP element. Preloaded LCP images achieve a 75th percentile of 364ms, while lazy-loaded ones sit at 720ms.

The rule is simple: eagerly load images in the initial viewport, and lazy load everything below the fold. For your most important above-the-fold image, consider preloading it:

```html
<link rel="preload" as="image" href="hero.webp" />
```

This tells the browser to start fetching the image immediately, before it even parses the HTML that references it.

## Use a CDN for image delivery

A content delivery network caches your images on servers distributed around the world. When a visitor requests an image, it's served from the nearest server rather than your origin. This reduces latency and speeds up delivery, especially for visitors far from your hosting location.

Modern image CDNs go further than simple caching. Services like <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer">Cloudinary</a>, <a href="https://imgix.com" target="_blank" rel="noopener noreferrer">Imgix</a>, and <a href="https://www.cloudflare.com/products/cloudflare-images/" target="_blank" rel="noopener noreferrer">Cloudflare Images</a> can automatically:

- Convert images to WebP or AVIF based on browser support
- Resize images on the fly based on request parameters
- Apply compression at the quality level you specify
- Strip unnecessary metadata
- Cache optimized versions at the edge

If you're running a site with hundreds or thousands of images, an image CDN can handle optimization automatically instead of requiring you to process each image manually. For smaller sites, even a standard CDN like Cloudflare's free tier improves delivery speed.

<img src="https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/how-to-optimize-images-for-web/illustration-2.svg" alt="How a CDN delivers optimized images from edge servers close to each visitor" />

## How Polaris handles image optimization

At <a href="https://www.builtbypolaris.com" target="_blank" rel="noopener noreferrer">Polaris</a>, image optimization isn't an afterthought. It's built into every site we deliver.

We build on <a href="https://vercel.com/docs/image-optimization" target="_blank" rel="noopener noreferrer">Vercel's image optimization platform</a>, which automatically serves images in WebP or AVIF format based on browser support, resizes them for each device, and caches them at the edge. That means every image on your site is optimized from day one without any manual work on your end.

Our process starts with a Business Health Check, where we evaluate your current site's performance, including image weight and Core Web Vitals scores. From there, we build your new site with proper responsive images, correct lazy loading strategy, and format optimization baked into the architecture. Image optimization is also a key step when you <a href="/insights/how-to-make-your-website-mobile-friendly">make your website mobile friendly</a>.

If your site is sluggish and you're not sure where to start, <a href="https://wa.me/6281946494333" target="_blank" rel="noopener noreferrer">reach out to us</a>. We'll diagnose the problem and show you exactly what's slowing things down.

<img src="https://hginwqcxibraaljphcej.supabase.co/storage/v1/object/public/blog-images/shared/polaris-homepage.png" alt="Polaris homepage showing diagnostic-first approach to website building" />

## Frequently asked questions

### What's the best image format to optimize images for web?

WebP is the safest modern choice with over 97% browser support. It produces files 25-34% smaller than JPEG at similar quality. AVIF is even better at compression (50% smaller than JPEG) but encodes slower and has slightly less browser coverage at 93.8%.

### How do I optimize images for web without losing quality?

Use lossy compression at quality 75-85, which removes data the human eye can't detect. Pair that with proper sizing (never serve a 4000px image in an 800px container) and a modern format like WebP. The result looks identical to the original at a fraction of the file size.

### Does optimizing images for web help SEO?

Yes. Images directly affect Largest Contentful Paint (LCP), one of Google's Core Web Vitals ranking signals. Pages with optimized images score better on LCP, and sites with good Core Web Vitals have a measurable advantage in search results.

### Should I lazy load all images to optimize images for web?

No. Lazy load images below the fold, but never lazy load the largest image in your initial viewport (your LCP element). Lazy loading your LCP image can delay it significantly, dropping your LCP "good" score from 79% to just 52%.

### What tools can I use to optimize images for web?

Squoosh (browser-based, free) is great for one-off compressions. ShortPixel and TinyPNG handle bulk optimization. For automated pipelines, sharp (Node.js) or imagemin can process images at build time. CDNs like Cloudinary or Imgix optimize and serve images on the fly.
