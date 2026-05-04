---
name: relocant-help-design
description: Use this skill to generate well-branded interfaces and assets for relocant.help — a platform connecting Ukrainian and Russian-speaking relocants in Europe with verified lawyers and accountants. Contains design tokens, type scale, components, page templates, and tone guidelines.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files (`colors_and_type.css`, `pages/`, `preview/`).

**Brand essence:** trust-first, calm, multilingual (UA / RU / EN). Navy + teal verified accent. No emoji in product UI. Verification proof always visible (license numbers, badges, dates).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. Use `colors_and_type.css` as the foundation — it contains all tokens (`--rh-navy`, `--rh-blue`, `--rh-teal`, type scale, spacing, radii, shadows) and base components (buttons, cards, inputs, badges).

If working on production code, copy the tokens and read README.md's Visual Foundations and Content Fundamentals sections to become an expert in designing for this brand.

If the user invokes this skill without other guidance, ask what they want to build, then act as an expert designer producing HTML artifacts or production code.
