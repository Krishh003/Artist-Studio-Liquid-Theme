# Developer Handover — Pristine Forests Liquid Theme

**Date:** 2026-04-01
**Source repo:** `webDev-Shopify` (Next.js 16 headless)
**This repo:** `webDev-liquid` (Shopify OS2 Liquid theme)
**GitHub:** https://github.com/Krishh003/Artist-Studio-Liquid-Theme

---

## What This Is

A complete port of the Pristine Forests Artist Studio from a headless Next.js site to a native Shopify Online Store 2.0 Liquid theme. The visual design, animations, and content model are identical to the Next.js version. No React, no Framer Motion, no Next.js — everything runs as Liquid templates with vanilla CSS/JS.

---

## Current State

### Done

| Area | Status | Notes |
|---|---|---|
| Theme structure | Complete | All required Shopify directories present |
| `layout/theme.liquid` | Complete | Fonts, noise overlay, dark mode init script, conditional JS loading |
| `templates/*.json` | Complete | index, page.artists, metaobject.artist, product.artwork |
| `config/settings_schema.json` | Empty | Shopify cleared it — safe to leave empty or rebuild if customizer is needed |
| `locales/en.default.json` | Complete | All strings including accessibility keys |
| `sections/header.liquid` | Complete | Fixed nav, desktop + mobile, dark mode toggle, mobile menu via JS |
| `sections/footer.liquid` | Complete | Newsletter form, social links, site_settings tagline |
| `sections/home-hero.liquid` | Complete | site_settings-driven title/CTA, scatter images via snippet |
| `sections/home-featured-artist.liquid` | Complete | Featured artist profile + FeaturedCarousel snippet |
| `sections/home-collaboration.liquid` | Complete | collab_what_body / collab_why_body / collab_extra_body / artist_discount_code |
| `sections/artists-list.liquid` | Complete | Iterates `shop.metaobjects['artist']`, skips `pf-artist` |
| `sections/artist-hero.liquid` | Complete | 400vh sticky container, card peel stack, signature BG, audio element, modal shell |
| `sections/artist-bio.liquid` | Complete | Portrait, origin/focus metadata, bio text |
| `sections/artist-artworks-grid.liquid` | Complete | Masonry columns, modal trigger per card |
| `sections/artwork-detail.liquid` | Complete | Split layout, Year/Medium/Dimensions from metafields, inquiry mailto |
| `snippets/dark-mode-toggle.liquid` | Complete | Material Icons sun/moon, View Transition API via theme.js |
| `snippets/artist-card.liquid` | Complete | Full 500px card, grayscale hover, correct URL via system.url |
| `snippets/artwork-card.liquid` | Complete | data-* attributes for modal, image + title + price |
| `snippets/featured-carousel.liquid` | Complete | 3x duplication, CSS scroll animation, JS pause/play |
| `snippets/scatter-images.liquid` | Complete | 6 positions, gold borders, blur on background ones |
| `snippets/artwork-modal.liquid` | Complete | Hidden fullscreen viewer, dynamic accent classes |
| `assets/theme.css` | Complete | CSS tokens, all component styles, View Transition API rules |
| `assets/animations.css` | Complete | @keyframes: carousel, bounce, pulse, fade-in-up, scale-in |
| `assets/theme.js` | Complete | Dark mode + View Transition, header scroll, mobile menu, intersection observer |
| `assets/featured-carousel.js` | Complete | Pause/resume on mouse/touch |
| `assets/artists-list.js` | Complete | Staggered entrance via Intersection Observer |
| `assets/artist-content.js` | Complete | Sticky scroll card peel, signature reveal, ambient audio, modal, ColorThief, parallax |
| `assets/artwork-content.js` | Complete | Image zoom (cursor-guided), entrance animations, inquiry mailto |
| `assets/colorthief.min.js` | Complete | Minified ColorThief library |

---

### Known Limitations / Gaps

#### 1. `pankaj-sign.png` not in repo
The Pankaj Saroj signature image is a binary PNG. It must be **manually uploaded** to Shopify Admin > Themes > Edit code > Assets. Referenced in `artist-hero.liquid` as `{{ 'pankaj-sign.png' | asset_url }}`.

#### 2. Artist URL template must be configured in Shopify Admin
For `/artist/{handle}` URLs to work, go to:
Shopify Admin > Content > Metaobjects > Artist > Edit definition > URL template > set to `/artist/{handle}`

Without this, `artist.system.url` returns blank and card links break.

#### 3. Per-artist collections must be created
The artworks grid in `artist-artworks-grid.liquid` looks for a collection with the same handle as the artist (e.g. `collections['pankaj-saroj']`). You need to create an **automated collection** in Shopify Admin for each artist with condition: `Product tag equals artist:pankaj-saroj`. Without this, the grid falls back to `collections.all` filtered by tag, which may be slow on large catalogues.

#### 4. `settings_schema.json` is empty
Shopify reset it to `[]` during a push. The theme customizer has no settings panels. This is non-critical — all content is driven by metaobjects, not theme settings. Rebuild it from `README.md` if you need colour/font pickers in the customizer.

#### 5. Audio files not in assets
`elena-piano.mp3` and `neon-flow.mp3` are referenced in `artist-hero.liquid` and `artist-content.js` for the `elena` and `Neon Flow` special cases. Upload these to Shopify Assets or update the references to Shopify CDN URLs.

#### 6. Login / signup pages not implemented
The source Next.js site had placeholder `/login` and `/signup` pages. These are not ported — Shopify's native customer accounts handle this at `/account`.

#### 7. Privacy and Terms pages are empty
Create standard Shopify pages with handles `privacy` and `terms`. The footer links go to `/pages/privacy` and `/pages/terms`.

---

## Shopify Admin Setup Checklist

Before the theme goes live, complete these steps in Shopify Admin:

- [ ] Create metaobject definition `artist` with all fields listed in README
- [ ] Create metaobject definition `site_settings` with all fields listed in README
- [ ] Create site_settings entry with handle `artist-studio-by-pristine-forests` and fill all fields
- [ ] Set artist metaobject URL template to `/artist/{handle}`
- [ ] Upload `pankaj-sign.png` to theme assets
- [ ] Upload `elena-piano.mp3` and `neon-flow.mp3` to theme assets (or update audio URLs)
- [ ] Create per-artist automated collections (tag-based)
- [ ] Set product metafield definitions: `custom.medium`, `custom.dimensions`, `custom.date_created`, `custom.artist_handle`
- [ ] Create `privacy` and `terms` pages
- [ ] Publish the theme

---

## Animation Implementation Reference

All Framer Motion animations from the Next.js source are replaced as follows:

| Original | Replacement |
|---|---|
| `useScroll` + `useTransform` (card peel) | `scroll` event listener in `artist-content.js`, manual progress mapping |
| `whileInView` entrance animations | `IntersectionObserver` + `.is-visible` CSS class toggle |
| `staggerChildren` | `animation-delay: calc(var(--index) * 0.1s)` or `transitionDelay` set by JS |
| `@keyframes carousel-scroll-vertical` | Kept as-is — already pure CSS in source |
| Grayscale hover on artists | `filter: grayscale(1)` → `filter: grayscale(0)` CSS transition |
| View Transition API dark mode | Kept identical — native browser API, no library needed |
| Modal spring animation | `cubic-bezier(0.34, 1.56, 0.64, 1)` CSS transition |
| Image zoom hover | `transform: scale(1.2)` with cursor-guided `transformOrigin` in `artwork-content.js` |
| Meet section parallax `useTransform` | `scroll` listener maps `getBoundingClientRect` progress to Y translate |
| Signature reveal `clipPath` + `opacity` | CSS `transition` on `clip-path` and `opacity`, triggered by `initSignatureReveal()` |
| ColorThief + `ensureVibrant` | Ported directly to `artist-content.js::applyDynamicColor()` |

---

## Relationship to Next.js Repo

The Next.js repo (`webDev-Shopify`) remains the source of truth for:
- GraphQL queries and field names (`lib/shopify.ts`)
- Business logic and content requirements
- Contact email address (`pankaj.saroj@hotmail.com`)

When Shopify metaobject field names change in the Next.js GraphQL queries, the corresponding Liquid field accessors (`artist.bio.value`, `site_settings.collab_what_body.value` etc.) must be updated in this theme.

---

## Deployment

The theme is connected to GitHub at https://github.com/Krishh003/Artist-Studio-Liquid-Theme.

Push to `main` and then either:
- Use `shopify theme push` via Shopify CLI, or
- Upload a zip via Shopify Admin

There is no CI/CD pipeline set up for the Liquid theme yet (unlike the Next.js site which deploys via GitHub Actions + Docker to the self-hosted server).
