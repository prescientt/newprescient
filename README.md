# Prescient+ — prescientrades.com

Static marketing site for the Prescient+ trading community. No build step, no framework — just fast, SEO-friendly HTML/CSS/JS.

## Files

- `index.html` — the entire site (content, meta tags, structured data)
- `styles.css` — design system and layout
- `main.js` — nav, scroll animations, counters, FAQ accordion
- `og-image.png` — social share card (Open Graph / Twitter)
- `favicon.svg` — browser icon
- `robots.txt` / `sitemap.xml` — search engine files

## Checkout links

Both plans link directly to hosted checkouts (edit in `index.html` if they change):

- **Legacy Tier — $125/mo (Whop):** `https://whop.com/checkout/2qAdq5HfPRqsM71eut-h1IK-fl2T-V1lI-vc7xCAyaMrWP/`
- **1-on-1 Mentorship — $3,500 (Stripe):** `https://buy.stripe.com/dRmdR8awraxw7XsfFi4c80e`

## Preview locally

```sh
python3 -m http.server 4173
# open http://localhost:4173
```

## Deploy

Upload the folder contents to any static host and point the `prescientrades.com` domain at it:

- **Netlify:** drag-and-drop the folder at app.netlify.com/drop
- **Vercel:** `npx vercel --prod`
- **Cloudflare Pages / GitHub Pages:** push these files and connect the repo

After deploying, submit `https://prescientrades.com/sitemap.xml` in Google Search Console to get indexed quickly.

## Updating content

- **Prices / plan features:** search for `price-card` in `index.html`. Also update the matching JSON-LD (`application/ld+json`) blocks and the FAQ answers so search results stay accurate.
- **Social links:** Discord and Instagram URLs appear in the nav, steps, CTA band, and footer.
- **Contact email:** `mailto:` links in the mentorship section and footer.
