# CLAUDE.md — Pristine Forests Liquid Theme

This file provides guidance to Claude Code when working in `webDev-liquid`.

## Project Overview

A Shopify Online Store 2.0 Liquid theme for Pristine Forests Artist Studio. Translated from the Next.js headless storefront at `../webDev-Shopify`. No React, no Framer Motion — vanilla CSS and JS only.

## Key Constraints

- This is a **Shopify theme**, not a Node.js project. There is no `npm`, no build step, no bundler.
- All files are served directly by Shopify. Do not introduce build tools or compiled assets.
- CSS lives in `assets/theme.css` and `assets/animations.css` — no CSS preprocessors.
- JavaScript is vanilla ES6+, split into per-page files loaded conditionally in `layout/theme.liquid`.
- Liquid is Shopify's templating language — it is not Ruby Liquid. Use Shopify Liquid docs as reference.

## File Roles

| File/Dir | Purpose |
|---|---|
| `layout/theme.liquid` | Root HTML shell. Loads all CSS, conditional JS, and noise overlay. |
| `templates/*.json` | Page type → section mappings. Edit to add/remove sections per template. |
| `sections/*.liquid` | Stateful content blocks with `{% schema %}`. Each section is self-contained. |
| `snippets/*.liquid` | Stateless partials rendered via `{% render 'name', param: value %}`. No schema. |
| `assets/theme.css` | All design tokens (CSS variables) and component styles. |
| `assets/theme.js` | Dark mode, View Transition API, mobile menu, Intersection Observer. |
| `assets/artist-content.js` | Sticky scroll card peel, ambient audio, artwork modal, ColorThief. |
| `assets/artwork-content.js` | Artwork detail: image zoom, entrance animations, inquiry button. |

## Shopify Data Access Patterns

When writing Liquid that accesses Shopify data:

```liquid
# Site settings metaobject (used in layout and most sections)
{%- assign site_settings = shop.metaobjects['site_settings']['artist-studio-by-pristine-forests'] -%}
{{ site_settings.hero_title.value }}

# Artist metaobject (on metaobject template pages — metaobject drop is auto-provided)
{{ metaobject.name.value }}
{{ metaobject.bio.value }}
{{ metaobject.audio_track.value }}

# Iterate all artists
{% for artist in shop.metaobjects['artist'] %}
  {{ artist.name.value }}
{% endfor %}

# Product metafields
{{ product.metafields.custom.medium.value }}
{{ product.metafields.custom.dimensions.value }}
{{ product.metafields.custom.date_created.value }}

# Artist page URL from a metaobject reference
{{ artist.system.url | default: '/artist/' | append: artist.handle }}
```

## JavaScript Conventions

- JS files are plain scripts, not modules. Functions are declared at file scope and called in a `DOMContentLoaded` listener.
- DOM selectors use `data-*` attributes for JS hooks, not class names. Class names are for styling only.
  - Exception: `.artwork-card`, `.sticky-card`, `.artist-card-reveal` — these are also JS hooks; do not rename them.
- The artwork modal is triggered by a click delegation on `.artwork-card` in `artist-content.js`. Any element that should open the modal must have class `artwork-card` and the `data-image`, `data-title`, `data-price`, `data-description` attributes.
- ColorThief requires `crossOrigin="anonymous"` on images (Shopify CDN supports CORS). The `applyDynamicColor` function in `artist-content.js` handles brightness correction.

## CSS Conventions

- Design tokens are CSS custom properties on `:root` in `assets/theme.css`. Dark mode overrides are on `.dark`.
- Dark mode is class-based: `<html class="dark">`. Never use `prefers-color-scheme` media queries in this theme — use `.dark` selectors.
- Do not add Tailwind or any utility framework. Write semantic class names.
- Animation entry states: elements start with `opacity: 0; transform: translateY(20px)` and gain `is-visible` class from the Intersection Observer in `theme.js`.

## Animation Authoring

When adding new scroll-triggered animations:
1. Add `class="reveal"` to the element in the Liquid file.
2. `theme.js::initIntersectionObserver()` will automatically apply `.visible` to `.reveal` elements.
3. `.reveal` and `.reveal.visible` styles are in `assets/animations.css`.
4. For staggered sequences add `class="reveal reveal-stagger-N"` (1–5 available).

When adding new keyframe animations:
- Add `@keyframes` to `assets/animations.css`, not inline.
- Add the utility class `.animate-*` alongside it.

## Contact Email

All inquiry links must go to `pankaj.saroj@hotmail.com`. This address appears in:
- `sections/footer.liquid` (social email link)
- `sections/artwork-detail.liquid` (inquire button href)
- `assets/artist-content.js` (modal inquire button onclick)
- `assets/artwork-content.js` (inquiry button click handler)

## Audio

Ambient audio is loaded in `sections/artist-hero.liquid` as `<audio id="artist-audio">`. The mute button has `id="audio-play-toggle"`. Both IDs are expected by `assets/artist-content.js`. Do not change them.

For the artist `elena` with no `audio_track` metafield, the section falls back to `assets/elena-piano.mp3`. This file must be uploaded to Shopify assets manually.

## What NOT to Do

- Do not add `npm install` or any `node_modules`.
- Do not use Tailwind utility classes — the CSS in `theme.css` contains the full set of utilities this theme needs.
- Do not use `{% include %}` — Shopify deprecated it. Use `{% render %}`.
- Do not put JavaScript logic inside `{% schema %}` blocks.
- Do not use `collections.all.products` for the artworks grid — it is slow at scale. Use per-artist automated collections instead.
- Do not add `console.log` statements to production JS files.
