# Context

Translating the Pristine Forests Next.js headless storefront (`webDev-Shopify`) into a native Shopify Online Store 2.0 Liquid theme hosted at `C:/Users/Krishh/Pristine Forests/webDev-liquid/`. The goal is a fully deployable Shopify theme that replicates every page, animation, and design element without React/Next.js. All Framer Motion animations are replaced with vanilla CSS and JS.

---

# Key Shopify Liquid Decisions

- **Artists listing** — `store.metaobjects['artist']` iterates all artist entries in Liquid (added 2023+)
- **Site settings** — `shop.metaobjects['site_settings']['artist-studio-by-pristine-forests']` in layout
- **Artist detail pages** — `templates/metaobject.artist.json` — Shopify auto-injects `metaobject` drop at `/artist/{handle}`
- **Artwork detail pages** — `templates/product.artwork.json` — standard product template variant
- **Dark mode** — localStorage + `class="dark"` on `<html>`, same CSS variable tokens
- **Fonts** — Load via `<link>` in `theme.liquid` (Google Fonts: Inter, Della Respira, Mr De Haviland)
- **ColorThief** — bundled as `assets/colorthief.min.js`, loaded on artist/artwork pages only

---

# Complete File Structure

```
webDev-liquid/
├── assets/
│   ├── theme.css              ← globals.css tokens + base styles + View Transition API + scrollbar
│   ├── animations.css         ← @keyframes: carousel-scroll-vertical, card-entrance, fade-in
│   ├── colorthief.min.js      ← ColorThief library (copy from node_modules or CDN download)
│   ├── theme.js               ← Dark mode toggle, header hover, mobile menu, noise overlay
│   ├── featured-carousel.js   ← Pause/play on hover/touch for vertical carousel
│   ├── artists-list.js        ← Intersection Observer staggered entrance + grayscale hover
│   ├── artist-content.js      ← Sticky scroll card peel, audio control, color extraction, modal
│   └── artwork-content.js     ← Image zoom, entrance animations, inquiry mailto
├── config/
│   ├── settings_schema.json   ← Theme customizer schema (colors, fonts, toggles)
│   └── settings_data.json     ← Default setting values
├── layout/
│   └── theme.liquid           ← Root layout: fonts, CSS vars, noise overlay, header/footer, theme init
├── locales/
│   └── en.default.json        ← Translatable strings (nav labels, button text, aria labels)
├── sections/
│   ├── header.liquid          ← Fixed nav, logo, artists link, dark mode toggle, mobile menu
│   ├── footer.liquid          ← 3-col footer: brand | links | newsletter, social icons, copyright
│   ├── home-hero.liquid       ← Hero text (site_settings), scatter artwork images, CTA button
│   ├── home-featured-artist.liquid  ← Artist profile image, bio, FeaturedCarousel snippet
│   ├── home-collaboration.liquid    ← What/Why/Extra text from site_settings, discount code
│   ├── artists-list.liquid    ← Iterates store.metaobjects['artist'], 2-col grid cards
│   ├── artist-hero.liquid     ← Sticky 400vh container, card stack, signature text, scroll indicator
│   ├── artist-bio.liquid      ← Sticky portrait, origin/focus metadata, bio HTML, hero tagline
│   ├── artist-artworks-grid.liquid  ← CSS columns masonry grid, hover overlay, modal trigger
│   └── artwork-detail.liquid  ← Split layout, image zoom, metadata grid, inquiry button
├── snippets/
│   ├── artist-card.liquid     ← Reusable artist card (image, name, category, bio excerpt, link)
│   ├── artwork-card.liquid    ← Reusable artwork card (image, title, price, hover overlay)
│   ├── featured-carousel.liquid  ← Vertical infinite scroll strip (3x duplication, CSS animation)
│   ├── scatter-images.liquid  ← 6 absolutely positioned rotated images with gold borders
│   ├── artwork-modal.liquid   ← Fullscreen immersive viewer (image + details + audio player)
│   └── dark-mode-toggle.liquid  ← Sun/moon icon button with View Transition API handler
└── templates/
    ├── index.json             ← Home: home-hero + home-featured-artist + home-collaboration
    ├── page.artists.json      ← Artists listing: artists-list section
    ├── metaobject.artist.json ← Artist detail: artist-hero + artist-bio + artist-artworks-grid
    └── product.artwork.json   ← Artwork detail: artwork-detail section
```

**Total: ~36 files**

---

# Section-by-Section Specification

## layout/theme.liquid

Translates: `app/layout.tsx`

- `<link>` Google Fonts (Inter 300,400,600; Della Respira 400; Mr De Haviland 400)
- CSS variables in `<style>` (`:root` + `.dark` override block — from globals.css)
- Noise texture SVG filter inline `<svg>` + `<div class="noise-overlay">`
- `{{ 'theme.css' | asset_url | stylesheet_tag }}`
- `{{ 'animations.css' | asset_url | stylesheet_tag }}`
- `{% render 'header' %}` ... `{{ content_for_layout }}` ... `{% render 'footer' %}`
- `{{ 'theme.js' | asset_url | script_tag }}` (defer)
- `{% assign site_settings = shop.metaobjects['site_settings']['artist-studio-by-pristine-forests'] %}`

## sections/header.liquid

Translates: `components/Header.tsx`

- Fixed `z-100`, `backdrop-blur`, dark border
- 3-column grid: Logo | "Artists" nav link | Actions (dark mode toggle + login icon)
- `data-variant="hover-only"` — desktop: opacity-0, `translateY(-10px)`, reveals on `.hover` class set by JS
- Mobile: hamburger toggles `.mobile-menu-open` class
- Schema: `{% schema %}` with `name: "Header"`, `presets`

## sections/artists-list.liquid

Translates: `app/(site)/artists/ArtistsList.tsx`

- `{% for artist in store.metaobjects['artist'] limit: 50 %}` — skip if handle == 'pf-artist'
- 2-col grid, 500px height cards, each links to `/artist/{{ artist.handle }}`
- Each card: `data-index="{{ forloop.index0 }}"` for staggered JS entrance
- `artists-list.js` handles Intersection Observer + grayscale transitions

## sections/artist-hero.liquid

Translates: `app/artist/[slug]/ArtistContent.tsx` (hero + sticky scroll part)

- `<div class="sticky-scroll-container" style="height: 400vh">`
- Inner sticky panel with card stack from `metaobject.sticky_scroll` references
- Cards rendered: `{% for ref in metaobject.sticky_scroll.value %}`
- Each card gets `data-card-index="{{ forloop.index0 }}"` and `data-card-total="{{ forloop.length }}"`
- Artist signature: `<div class="artist-signature" data-handle="{{ metaobject.handle }}">`
- Scroll indicator with CSS bounce animation
- `artist-content.js` reads `data-` attributes and drives transforms

## sections/artist-artworks-grid.liquid

Translates: artworks section of `ArtistContent.tsx`

- `{% assign artworks = metaobject.handle | prepend: 'artist:' | ... %}` — Note: products tagged with artist handle must be fetched. In Liquid, filter by collection or use `all_products` with tag. Best approach: create a collection per artist OR use a section that renders products from a metafield list.
- Each artwork card: `data-artwork-id`, `data-image`, `data-title` etc. for modal
- `{% render 'artwork-modal' %}` — the modal shell, JS populates it

## artwork-modal.liquid snippet

- `<div id="artwork-modal" class="fixed inset-0 z-200 hidden">`
- Image side (60% width) + details side (40% width)
- Audio player with play/pause button, dynamic color applied via JS
- "Inquire Details" button with `mailto:` href
- `<img id="modal-image" data-colorthief-target>` — ColorThief hooks here

---

# Animation Translation Table

| Original (Framer Motion) | Liquid/Vanilla Equivalent |
|---|---|
| `whileInView {{ opacity: 0, y: 20 }}` → `{opacity:1, y:0}` | Intersection Observer adds `.visible` class; CSS: `opacity: 0; transform: translateY(20px)` → `transition: all 0.6s ease` |
| `staggerChildren 0.1s` | `animation-delay: calc(var(--index) * 0.1s)` set via `style="--index: {{ forloop.index0 }}"` |
| Sticky scroll `useScroll` + `useTransform` for card peel | `scroll` event listener, manual progress = `scrollY / containerHeight`, CSS `transform: translateX/Y/rotate` set inline |
| `@keyframes carousel-scroll-vertical` | Kept exactly — already pure CSS in globals.css |
| Grayscale hover on artists | `filter: grayscale(1)` → `filter: grayscale(0)` with `transition: filter 0.6s, transform 0.7s` |
| `useTransform` for title fade | `scrollY` listener → `opacity = 1 - (progress / 0.6)` |
| Modal `initial={{ scale: 0.9, opacity: 0 }}` spring | CSS `transform: scale(0.9); opacity: 0` with class toggle → `scale(1); opacity: 1; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)` (spring approx) |
| View Transition API dark mode | Identical — already native browser API, no library |
| Artwork zoom on hover in artwork detail | CSS `transform: scale(1.2)` with `transition: transform 0.8s cubic-bezier(...)` |

---

# Sticky Scroll Card Peel — Vanilla JS Implementation

```js
// In artist-content.js
const container = document.querySelector('.sticky-scroll-container')
const cards = [...document.querySelectorAll('.sticky-card')]
const totalCards = cards.length

window.addEventListener('scroll', () => {
  const { top, height } = container.getBoundingClientRect()
  const containerTop = window.scrollY + top
  const progress = Math.max(0, Math.min(1, 
    (window.scrollY - containerTop) / (height - window.innerHeight)
  ))
  
  const step = (1 / (totalCards - 1)) * 0.75
  cards.forEach((card, index) => {
    if (index === totalCards - 1) return // last card is static
    const start = index * step
    const end = (index + 1) * step
    const cardProgress = Math.max(0, Math.min(1, (progress - start) / (end - start)))
    
    const xDir = index % 2 === 0 ? -120 : 120
    const yDir = index % 3 === 2 ? -120 : index % 3 === 1 ? 120 : 0
    const rotDir = index % 2 === 0 ? -20 : 20
    const baseRot = index % 2 === 0 ? -2 : 2
    
    card.style.transform = `
      translateX(${cardProgress * xDir}%)
      translateY(${cardProgress * yDir}%)
      rotate(${baseRot + cardProgress * rotDir}deg)
    `
    card.style.opacity = cardProgress > 0.6 ? 1 - ((cardProgress - 0.6) / 0.4) : 1
    card.style.zIndex = 40 - index
  })
})
```

---

# CSS Asset Plan

## assets/theme.css

- All CSS variables from `globals.css` (`:root` + `.dark`)
- `.scatter-img` class (gold border, hover scale, shadow)
- View Transition API rules (`::view-transition-old`, `::view-transition-new`)
- Custom scrollbar
- Base body/selection/dark mode styles
- Tailwind-equivalent utility classes written as plain CSS for: flex, grid, gap, padding, margin, text sizes, colors, borders, rounded corners
- `.noise-overlay` positioning

## assets/animations.css

- `@keyframes carousel-scroll-vertical` (exact from globals.css)
- `@keyframes bounce` (scroll indicator)
- `@keyframes pulse` (audio button ring)
- `@keyframes fade-in-up` (entrance fallback)
- `.is-visible` transition rules for Intersection Observer targets

---

# Data Access Patterns in Liquid

| Next.js | Liquid |
|---|---|
| `getSiteSettings()` | `shop.metaobjects['site_settings']['artist-studio-by-pristine-forests']` |
| `getArtists()` | `{% for a in store.metaobjects['artist'] limit: 50 %}` |
| `getArtist(slug)` | `metaobject` drop auto-provided on metaobject template page |
| `getArtistArtworks(slug)` | Products with tag `artist:{{ metaobject.handle }}` — use `collections[handle]` if a collection exists per artist, or `all_products` filtered by tag |
| `getFeaturedArtworks()` | `metaobject.sticky_scroll.value` — list of product references on artist metaobject |
| `getArtwork(slug)` | `product` drop auto-provided on product template page |

**Artwork-by-tag approach:** Create a Shopify collection with `Automated: tag equals artist:{handle}` for each artist. In Liquid: `{% assign collection = collections[metaobject.handle] %}{% for product in collection.products %}`. This is the most reliable pattern.

---

# Files to Create (in order)

1. `config/settings_schema.json` — Color and font schema
2. `config/settings_data.json` — Defaults
3. `locales/en.default.json` — Nav, button, aria strings
4. `assets/theme.css` — All design tokens, base CSS
5. `assets/animations.css` — All keyframes
6. `assets/colorthief.min.js` — Copy from CDN (download separately)
7. `assets/theme.js` — Dark mode, header, mobile menu, noise
8. `assets/featured-carousel.js` — Carousel pause/play
9. `assets/artists-list.js` — Intersection Observer, hover effects
10. `assets/artist-content.js` — Sticky scroll, audio, color thief, modal
11. `assets/artwork-content.js` — Image zoom, entrance, mailto
12. `layout/theme.liquid` — Root layout
13. `snippets/dark-mode-toggle.liquid`
14. `snippets/artist-card.liquid`
15. `snippets/artwork-card.liquid`
16. `snippets/featured-carousel.liquid`
17. `snippets/scatter-images.liquid`
18. `snippets/artwork-modal.liquid`
19. `sections/header.liquid`
20. `sections/footer.liquid`
21. `sections/home-hero.liquid`
22. `sections/home-featured-artist.liquid`
23. `sections/home-collaboration.liquid`
24. `sections/artists-list.liquid`
25. `sections/artist-hero.liquid`
26. `sections/artist-bio.liquid`
27. `sections/artist-artworks-grid.liquid`
28. `sections/artwork-detail.liquid`
29. `templates/index.json`
30. `templates/page.artists.json`
31. `templates/metaobject.artist.json`
32. `templates/product.artwork.json`

---

# Verification

1. Zip the `webDev-liquid/` folder and upload via Shopify Admin → Themes → Add theme → Upload zip
2. Verify metaobject template routing: `/artist/pankaj-saroj` resolves to `metaobject.artist.json`
3. Verify artwork routing: `/products/artwork-handle` uses `product.artwork.json`
4. Check artists listing at `/pages/artists` uses `page.artists.json`
5. Test dark mode toggle: should produce circular reveal from click point
6. Test sticky scroll: load `/artist/pankaj-saroj`, scroll — cards should peel away
7. Test vertical carousel on home page: should pause on hover
8. Test ColorThief: open artwork modal — accent color should match dominant image color
9. Test audio: clicking volume button on artist page should play/mute `metaobject.audio_track.value`
10. Test scatter images on home: should render at correct positions, hidden on mobile
