# Pristine Forests Artist Studio — Shopify Liquid Theme

A native Shopify Online Store 2.0 theme for the Pristine Forests Artist Studio. Translated from the headless Next.js storefront (`webDev-Shopify`). All animations are implemented in vanilla CSS and JavaScript — no React, no Framer Motion.

## Theme Structure

```
webDev-liquid/
├── assets/
│   ├── theme.css              Design tokens, all component CSS
│   ├── animations.css         @keyframes and reveal utility classes
│   ├── colorthief.min.js      ColorThief library (dynamic accent color extraction)
│   ├── theme.js               Dark mode (View Transition API), header, mobile menu, scroll observer
│   ├── featured-carousel.js   Horizontal carousel pause/play on hover/touch
│   ├── artists-list.js        Intersection Observer staggered entrance for artist grid
│   ├── artist-content.js      Sticky scroll card peel, ambient audio, artwork modal, ColorThief
│   └── artwork-content.js     Image zoom, entrance animations, inquiry mailto
├── config/
│   ├── settings_schema.json   Theme customizer schema
│   └── settings_data.json     Default setting values
├── layout/
│   └── theme.liquid           Root layout: fonts, CSS vars, noise overlay, scripts
├── locales/
│   └── en.default.json        All translatable strings
├── sections/
│   ├── header.liquid          Fixed nav, dark mode toggle, mobile menu
│   ├── footer.liquid          3-column footer with newsletter form
│   ├── home-hero.liquid       Hero: site_settings title/CTA + scatter artwork images
│   ├── home-featured-artist.liquid  Featured artist + vertical carousel
│   ├── home-collaboration.liquid    What/Why/Extra text blocks + discount code
│   ├── artists-list.liquid    Iterates all artist metaobjects, 2-col grid
│   ├── artist-hero.liquid     Sticky 400vh scroll, card peel stack, signature, audio
│   ├── artist-bio.liquid      Portrait (sticky), origin/focus metadata, bio HTML
│   ├── artist-artworks-grid.liquid  Masonry columns grid with modal trigger
│   └── artwork-detail.liquid  Split layout: image zoom left, details right
├── snippets/
│   ├── dark-mode-toggle.liquid  Sun/moon icon with View Transition API
│   ├── artist-card.liquid       Artist card for listing page
│   ├── artwork-card.liquid      Artwork card for artworks grid
│   ├── featured-carousel.liquid Vertical infinite scroll carousel (3x duplication)
│   ├── scatter-images.liquid    6 absolutely-positioned rotated hero images
│   ├── artwork-modal.liquid     Fullscreen artwork viewer shell
│   └── meta-tags.liquid         OpenGraph and Twitter card meta tags
└── templates/
    ├── index.json               Home page
    ├── page.artists.json        Artists listing at /pages/artists
    ├── metaobject.artist.json   Artist detail at /artist/{handle}
    └── product.artwork.json     Artwork detail — product page variant
```

## Shopify Data Model

This theme reads all content from Shopify. No external CMS or database.

### Metaobject: `artist`

| Field | Type | Used in |
|---|---|---|
| `name` | single_line_text | All artist views |
| `bio` | multi_line_text | Bio section, artist card |
| `category` | single_line_text | Cards, hero tagline |
| `origin` | single_line_text | Bio section metadata |
| `focus` | single_line_text | Bio section metadata |
| `profile_image` | file | Featured artist, bio section |
| `hero_title` | single_line_text | Signature background text |
| `hero_tagline` | single_line_text | Bio section pull quote |
| `hero_background_image` | file | (reserved) |
| `audio_track` | file | Ambient audio on artist page |
| `sticky_scroll` | list.metaobject (→ products) | Hero card stack |

Artist pages resolve at `/artist/{handle}` via the `metaobject.artist.json` template. The URL template must be set to `/artist/{handle}` in Shopify Admin under Content > Metaobjects > Artist > Edit definition.

### Metaobject: `site_settings` (handle: `artist-studio-by-pristine-forests`)

| Field | Used in |
|---|---|
| `hero_title` | Home hero heading |
| `hero_description` | Home hero subtext |
| `hero_primary_button_text` | Home hero CTA label |
| `hero_primary_button_link` | Home hero CTA href |
| `featured_artist_heading` | Featured section label |
| `featured_artist_intro` | Featured artist bio override |
| `featured_artist` | Reference to artist metaobject |
| `collab_what_body` | Collaboration "What" block |
| `collab_why_body` | Collaboration "Why" block |
| `collab_extra_body` | Collaboration "Extra" block |
| `artist_discount_code` | Discount code display |
| `footer_tagline` | Footer brand tagline |

### Products (Artworks)

Products are tagged `artist:{handle}` to associate them with an artist. Artworks use the `product.artwork.json` template.

| Metafield | Namespace | Used in |
|---|---|---|
| `medium` | `custom` | Artwork detail metadata |
| `dimensions` | `custom` | Artwork detail metadata |
| `date_created` | `custom` | Artwork detail year |
| `artist_handle` | `custom` | Back-link to artist page |

The artwork detail back-link uses `product.metafields.custom.artist_handle.value` to construct `/artist/{handle}`. Ensure this metafield is set on each product.

For the artworks grid on artist pages, create an **automated collection per artist** with condition `Product tag equals artist:{handle}`. The section looks for `collections[metaobject.handle]` first, then falls back to `all_products` filtered by tag.

## Deploying to Shopify

**First deploy:**

1. Zip the `webDev-liquid/` folder (excluding `.git/`):
   ```
   # From inside webDev-liquid/
   zip -r pristine-forests-theme.zip . -x ".git/*" -x "*.md"
   ```
2. In Shopify Admin go to **Online Store > Themes > Add theme > Upload zip file**
3. Upload `pristine-forests-theme.zip`
4. Click **Customize** to verify the theme renders, then **Publish**

**Subsequent deploys via Shopify CLI:**

```bash
npm install -g @shopify/cli @shopify/theme
shopify theme push --store=your-store.myshopify.com
```

Or push only changed files:
```bash
shopify theme push --only assets/ sections/ snippets/
```

## Assets Upload

The file `assets/pankaj-sign.png` (Pankaj Saroj's handwritten signature image) must be uploaded to Shopify manually via **Online Store > Themes > Edit code > Assets > Upload file**, since binary assets are not tracked in this repo. The `artist-hero.liquid` section references it via `{{ 'pankaj-sign.png' | asset_url }}`.

## Contact / Inquiry Email

All "Inquire About Artwork" and "Inquire Details" actions generate a `mailto:` link to `pankaj.saroj@hotmail.com`. This is hardcoded in:

- `sections/artwork-detail.liquid`
- `assets/artist-content.js` (modal inquire button)
- `assets/artwork-content.js` (artwork detail page inquire button)

Update all three if the contact email changes.
