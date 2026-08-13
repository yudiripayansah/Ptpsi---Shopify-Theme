# Project conventions — ptpsi Shopify theme

This is a Shopify theme (Horizon-based: web-component architecture, `{% stylesheet %}`/`{% javascript %}` per file, section rendering/hydration, view transitions). Follow these rules on every task in this repo.

## 1. Always use the `/shopify-liquid` skill

Any time you create or edit a section, block, snippet, or template, invoke the `shopify-liquid` skill first. It knows this theme's architecture (directory layout, `{% schema %}` rules, LiquidDoc headers, translation keys) and validates generated Liquid before it's returned.

## 2. Styling: Tailwind utility classes first

- Every new section, snippet, or template must be styled with Tailwind CSS utility classes in the markup — don't hand-write CSS for things Tailwind already covers (spacing, flex/grid, color, typography, etc.).
- When something needs styling Tailwind can't express (complex animations, pseudo-elements, keyframes, custom curves), add a scoped `{% stylesheet %}` block in that same file. Don't create separate global CSS files per component.
- Tailwind is already installed — see [Tailwind & Swiper setup](#5-tailwind--swiper-setup) below. Don't re-install or add a build step.

## 3. Design quality: use the `/impeccable` skill

Before finalizing a section/snippet/template's visual design, run it through the `impeccable` skill so the result has clear visual hierarchy, a unique/intentional look (not generic Bootstrap-y defaults), and smooth, purposeful micro-animations (hover states, transitions, scroll reveals) that feel intuitive rather than gratuitous.

## 4. Sliders: always use Swiper

Any carousel/slider (hero banners, product recommendations, testimonials, brand logos, etc.) must be built with Swiper — don't hand-roll a scroll-snap or custom drag slider. Swiper is already installed (see below).

## 5. Tailwind & Swiper setup

Both are self-hosted static files in `assets/` (no npm/build step in this repo):

| Library | Files | Loaded |
|---|---|---|
| Tailwind CSS | `assets/tailwind.js` (Play CDN runtime — JIT-compiles classes it finds in the DOM) | Globally, in `layout/theme.liquid` `<head>` via `{{ 'tailwind.js' \| asset_url }}` with `defer` |
| Swiper 11 | `assets/swiper-bundle.min.css`, `assets/swiper-bundle.min.js` | **Not global** — include only in sections/snippets that render a slider |

To use Swiper in a section, add inside that file (not in `theme.liquid`):

```liquid
{{ 'swiper-bundle.min.css' | asset_url | stylesheet_tag }}
<script src="{{ 'swiper-bundle.min.js' | asset_url }}" defer></script>
```

then initialize it in that section's own `{% javascript %}` block (or a small inline `<script type="module">`), scoped to that section's markup — don't add a site-wide Swiper init.

**Ceiling:** the Tailwind Play CDN compiles classes in the browser on every page load instead of shipping a pre-purged stylesheet. This is the zero-build tradeoff for a theme with no npm pipeline. If build size/performance ever becomes a problem, swap it for a proper Tailwind CLI build (`tailwindcss -i input.css -o assets/tailwind.css --minify`) run as a one-off and committed as a static file.

## 6. Never use Theme Blocks — classic section blocks + snippets instead

Never use Shopify's **Theme Blocks** feature: no `blocks/` directory, no `{% content_for 'blocks' %}` / `{% content_for 'block', ... %}`, no `"blocks": [{"type": "@theme"}]` in a section's schema.

**Classic section blocks ARE allowed** — a `"blocks"` array defined inline in a section's own `{% schema %}` (not a separate file), looped with `{% for block in section.blocks %}`. This is a different, older Shopify feature from Theme Blocks and is the right tool for merchant-editable repeating content (testimonials, stats, team members, logos, etc.). Delegate each block's markup to a **snippet** (`{% render 'snippet-name', ... %}`) rather than inlining it.

- **Why:** explicit user decision for this project. Initially stated as a blanket "no blocks at all, use flat numbered settings instead" — the user later clarified that only the newer Theme Blocks (separate `blocks/` files) are off-limits; classic inline `section.blocks` are fine and preferred for repeating content over numbered settings.
- **How to apply:** for a fixed, small set of repeating items, prefer a classic `"blocks"` array in the section's schema + a snippet per block type over `item_1_x`/`item_2_x`-style flat settings. Still no `blocks/` directory, ever.

## 7. Design direction

Company-profile pages and shop/ecommerce pages follow two different reference sites with a documented improvement plan — see [docs/DESIGN_REFERENCES.md](docs/DESIGN_REFERENCES.md) before designing either.

## 8. Company-profile brand palette + per-section color settings

Derived from the live reference (paniaga.com), sampled with computed-style inspection, not guessed from screenshots. Every company-profile section takes its own `background_color`/`text_color` (and sometimes `accent_color`) settings — apply via inline `style="background-color: {{ section.settings.background_color }}; color: {{ section.settings.text_color }};"` on the section's root element, not Tailwind color utility classes, so merchants can actually change them per section instance.

| Token | Value | Used for |
|---|---|---|
| Deep maroon | `#6b0001` | Large surface fills: value band, testimonials, footer-style bands, CTA band |
| Button maroon | `#880001` | Solid buttons/accent text on light backgrounds |
| Bright red accent | `#d00507` | Stat figures, small icon accent dots — never used as a large fill |
| Cream | `#ffeeee` | Alternate light band (distribution, team) |
| Body text on white | `#1a1a1a` | Default text color on white/cream sections |
| White | `#ffffff` | Text on dark sections; button fills on dark sections |

Typography: **Montserrat** (self-hosted variable font, `assets/montserrat.css` + `assets/montserrat-var.woff2`, loaded globally in `layout/theme.liquid`), bold/extrabold for headings and buttons — apply with the arbitrary-value class `font-[Montserrat,sans-serif]` since there's no Tailwind config to register it as `font-sans`.

Buttons are **sharp-cornered** (no `rounded-*`), bold, uppercase, letter-spaced — use the shared `{% render 'company-button', label:, url:, bg:, color: %}` snippet rather than hand-rolling `<a>` styles; pass a section's own colors *inverted* (its text_color as the button's bg, its background_color as the button's text) to get the reference's alternating solid/outline button look for free.

## 9. Never push, never run `theme watch` — the user owns sync

The user always runs `shopify theme watch` themselves in their own terminal to sync local files to the store. Never run `shopify theme push`, `shopify theme watch`, `shopify theme dev`, or any other command that uploads/syncs files to Shopify — just edit local files and let the user's own watcher pick up the change.

- **Why:** explicit user instruction. Running a second watcher alongside the user's caused two `theme watch --allow-live` processes to race uploads to the same theme, which made newly-added assets (`tailwind.js`, `swiper-bundle.min.css`) intermittently 504 in the browser — that's what broke the company-profile preview the first time it was checked live.
- **How to apply:** to verify a change live, ask the user for a preview URL (or check whether their watcher already pushed it) rather than pushing/watching yourself. Browser-based verification (chrome-devtools) is fine — running Shopify CLI sync commands is not.
