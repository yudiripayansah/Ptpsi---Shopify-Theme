# Design references

Two reference sites define the direction for this theme's two page types. Both were analyzed for structure and content; the gaps found in each become requirements here, not things to copy as-is.

- **Company profile pages** → reference: [paniaga.com](https://paniaga.com/)
- **Shop / ecommerce pages** → reference: [minuman.com](https://minuman.com/)

Build sections/snippets/templates per [CLAUDE.md](../CLAUDE.md) conventions: Tailwind utility classes, Swiper for sliders, `/shopify-liquid` for markup, `/impeccable` for polish.

---

## 1. Company profile — reference: paniaga.com

### Structure observed

Nav: Home · About · Distribution (Distributor List, Red and White) · Portfolio (Brand List, Brand Book) · News · Contact Us.

Homepage, in order: hero tagline → value proposition → "Why us" pillars (Passion, Service Excellence, Loyalty, Reliability, Market Leader) → key stats block (accounts, provinces, SKUs, growth %, volume) → rotating partner-testimonial carousel → distribution network summary + "Find Distributor" CTA → portfolio teaser + "Explore" CTA → client-logo grid → newsletter signup → footer.

### Keep

- Stats block as instant credibility (numbers, not adjectives).
- Testimonial carousel from real partners/brands, with photo + name + title.
- Client-logo wall for social proof.
- Clear top-level IA: About / What we do (Distribution) / Who we carry (Portfolio) / News / Contact.

### Gaps to fix here

1. Weak CTA copy ("Discover PAN", "See More") — every CTA in this theme must name the destination and value ("View distributor list", "Talk to sales").
2. No team/leadership section despite claiming relationship-driven business — add a team/leadership block with photos and roles.
3. JS-driven nav links (`javascript:void(0)`) hurt accessibility/SEO — use real `<a href>`s everywhere.
4. Newsletter form repeated three times in the footer — one instance, one place.
5. No visible mobile nav pattern — design mobile nav explicitly (don't assume desktop nav degrades gracefully).
6. No case studies/success stories beyond top-line stats — add a "results" or "case study" section with specifics (e.g., a named account's growth story).

### Apply in this theme

Build a **company-profile section set**: hero, value-prop, stats-band, testimonials (Swiper), team-grid, logo-wall, case-study/results block, distribution/network map or list, CTA-band, footer newsletter (single instance). Every CTA button gets explicit label copy passed via schema settings, not hardcoded "Learn more". Team and case-study sections are new additions absent from the reference — include them as standard blocks so merchants can choose to use them.

---

## 2. Shop / ecommerce — reference: minuman.com

### Structure observed

Nav: category mega-menu (Wine, Champagne & Sparkling, Spirits, Beer, Mixers, Glassware, Accessories) · Collections · Deals · Brands · Guides · Store Locator · language switcher · account · search · mobile bottom-nav (Home, Collections, Deals, Contact, Account).

Homepage, in order: age-gate modal → app-download banner → category tiles → brand-spotlight carousel → "Hot Deals" carousel → "Selling Fast" product grid → "Our Top Picks" grid → "Explore by Country" tiles → "New Items" carousel → "New Low Prices" grid with savings badges → footer (payment icons, contact, social, newsletter).

### Keep

- Category tiles as visual entry points instead of text-only nav.
- Multiple curated product rails (bestsellers, deals, new, picks) instead of one long grid.
- Savings/urgency badges ("Save 27%", "Low Stock") on product cards.
- Payment-method icon row in footer (trust signal for a market used to bank transfer/e-wallets).

### Gaps to fix here

1. **No filters/sort on collection grids** — collection/search templates in this theme must ship filters (price, category, availability) and sort, not just curated rails.
2. **No quick-add, no ratings, no mini-cart preview** — product cards need quick-add-to-cart, star rating (if reviews exist), and the cart drawer must show line items + price, not just a count.
3. **No trust content**: no reviews, no FAQ, no visible return policy, thin About presence — add a reviews block on PDP, a footer FAQ/policy link block, and a real About/Contact page, not just a footer link.
4. **Emoji-as-heading and inconsistent card layout** (some cards image-only, some text-only) — one consistent product-card component used everywhere, no emoji-in-heading as a substitute for actual iconography.
5. **No shipping/delivery estimate, no related/recommended products** — add delivery estimate text and a "Recently viewed" / "You may also like" section (`recently-viewed-products.js` and `product-recommendations.js` already exist in this theme's assets — wire them in).
6. **Newsletter has no incentive** — pair signup with a stated benefit (e.g., discount code) via block settings copy.

### Apply in this theme

Build the **shop template set** on top of what already exists in `sections/`/`snippets/` (facets, product-card, cart-drawer, quick-add, product-recommendations, recently-viewed-products are already present in this theme — extend, don't rebuild): category-tile grid, brand/deal carousels (Swiper), curated product rails, collection page with working facets + sort, product card with quick-add + rating + stock badge, PDP with reviews block, cart drawer with line-item preview, footer trust row (payment icons + policy links), newsletter block with an incentive setting.

---

## 3. Cross-cutting rules for both page types

- Every interactive element must be keyboard-reachable — no `javascript:void(0)` links, no click-only age gates or menus.
- One CTA copy convention: label states the destination/action, never generic "Learn more" / "See more".
- One product-card / one testimonial-card component reused everywhere, not a different layout per section.
- Mobile is a first-class layout, not a squeeze of desktop — design nav and grids mobile-first with Tailwind's responsive prefixes.
