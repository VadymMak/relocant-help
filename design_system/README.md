# relocant.help — Design System

A trust-first platform connecting Ukrainian and Russian-speaking relocants in Europe with verified lawyers and accountants.

## Brand

- **Name:** relocant.help
- **Mission:** Verified specialist matching for relocants — legal, tax, immigration help in your language
- **Tone:** Clear, calm, trustworthy. Never alarmist. Empathetic to relocation stress.
- **Audience:** UA/RU-speaking relocants navigating European bureaucracy

## Visual foundations

### Colors

| Token | Hex | Use |
|---|---|---|
| `--rh-navy` | `#042C53` | Header & hero backgrounds, headlines on light |
| `--rh-blue` | `#185FA5` | Primary CTAs, links, focus states |
| `--rh-teal` | `#1D9E75` | Success, verified badges, completed states |
| `--rh-bg` | `#F7F9FC` | Page background |
| `--rh-fg` | `#0F1B2D` | Primary text |
| `--rh-border` | `#E2E8F0` | 1px card and input borders |

Navy dominates header/hero areas creating trust. White cards on a soft blue-grey bg. Teal is reserved for verification — never decorative. Blue carries action.

### Typography

**Inter** (Google Fonts), weights 400/500/600/700/800. Tight letter-spacing on display sizes.

- Display 56px / 1.05 / 800
- H1 40px / 1.1 / 700
- H2 28px / 1.2 / 700
- H3 20px / 1.3 / 600
- Body 15px / 1.55 / 400
- Caption 12px uppercase tracking

### Spacing & shape

- 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px scale
- Radii: 6 / 10 / 16 / 24 px + pill (999px) for badges and rounded buttons
- Shadows: subtle, navy-tinted (`rgba(4, 44, 83, 0.04–0.12)`)
- Cards: white, 1px `--rh-border`, 16px radius, `shadow-xs` resting

### Motion

- Hover transitions 150ms ease (color/border only)
- Buttons depress 0.5px on `:active`
- No bounces, no springs — keep it calm

### Layout

- 1200px max-width content container
- 12-col implicit grid via flex/gap
- Mobile-first, generous whitespace
- Sticky top nav with multilingual switcher (UA / RU / EN)

## Content fundamentals

- **Voice:** "We" for the platform, "you" for the user. Direct and helpful.
- **Casing:** Sentence case for headlines. Title Case for proper nouns and section labels only.
- **No emoji.** Verified badges and icons carry visual weight.
- **Numbers:** Always show concrete proof — "47 verified specialists", "94% success rate", "6M+ users".
- **Multilingual:** UA / RU / EN side-by-side throughout. Default RU for now; UA primary.

## Iconography

Lucide icon set via CDN — clean 1.5px stroke, neutral, matches Inter's geometric character. Used for: search, filters, languages, verification checkmark, ratings, location pins. **No emoji** in product UI; the verified-checkmark glyph is the brand's most distinctive icon.

## Index

- `colors_and_type.css` — design tokens + base components (buttons, cards, inputs, badges)
- `preview/` — design system cards rendered in the Design System tab
- `pages/Landing.html` — full landing page
- `pages/Catalog.html` — specialist catalog with filters
- `pages/Profile.html` — specialist profile with reviews + booking
- `pages/Admin.html` — admin dashboard with AI-classified requests
- `SKILL.md` — agent skill manifest

## Pages

- `pages/Landing.html` — hero with country/service search, 6M+/47/94% stats, top specialists, three-step flow, four-pillar trust block, CTA, footer
- `pages/Catalog.html` — sticky filters sidebar (service type, country, languages, price, verification), 6 verified specialist rows, applied filter pills, pagination
- `pages/Profile.html` — full bio, specializations, four verification cards (license, status, languages, references), 4.9★ summary with rating distribution, three reviews, sticky booking sidebar with date strip + time slots
- `pages/Admin.html` — sidebar nav, 4 metric cards, requests table with Claude AI classification column (primary tag, secondary tag, confidence score, urgency level), match buttons, weekly summary rail

## Caveats

This is built from the brief alone — no codebase or live site was attached, so visual choices are derived from the color palette + Relocate.world reference + typical trust-focused EU legal/finance product conventions. Logo is a wordmark placeholder. Specialist photos use neutral avatar placeholders.
