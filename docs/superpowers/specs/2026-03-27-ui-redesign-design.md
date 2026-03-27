# NeoVertex UI Redesign — Design Spec
**Date:** 2026-03-27
**Status:** Approved

---

## Vision

Full UI/UX overhaul of the NeoVertex admin platform. The approved direction combines **Luxury Dark Gold (A)** with the **visual impact of Premium Fintech Glass (C)**: ultra-dark backgrounds, gold accent system, deep glassmorphism panels, ambient light blobs, particle network, and rich entrance/interaction animations. No emojis — serious, premium product aesthetic.

---

## Design Language

### Color System
- **Background:** `#04040a` (deeper than current `#050505`)
- **Surface:** `rgba(255,255,255,0.025)` with `backdrop-filter: blur(16-24px)`
- **Border:** `rgba(212,175,55,0.10-0.25)` — gold at various opacities
- **Primary accent:** `#D4AF37` (gold), gradient `#f0cc55 → #8a6010`
- **Text primary:** `#ffffff` / `rgba(255,255,255,0.8)`
- **Text muted:** `rgba(255,255,255,0.4)`
- **Success:** `#4ade80` | **Error:** `#f87171` | **Info:** `#60a5fa` | **Warning:** `#D4AF37`

### Typography
- **Headings / Logo:** Cinzel (serif) — existing, kept
- **Body / UI:** Inter — existing, kept
- **No changes to font imports required**

### Motion Principles
- Cards enter with `translateY(20px) → 0` + `opacity 0 → 1`, staggered delays
- Bars grow from bottom with `scaleY` transform-origin bottom
- Number counters animate from 0 to final value (easeOutQuart, 1.8s)
- Shimmer sweep across cards (4s loop)
- Ambient blobs drift slowly (9-15s alternating keyframes)
- Particle network: 55 gold particles with connecting lines, constant drift
- Logo pulses with gold glow (3s loop)
- Nav items slide right on hover (translateX 3px)
- Notification badges pulse with glow
- KPI cards lift on hover (translateY -3px + box-shadow)

---

## Layout Structure (unchanged)

```
App
├── Sidebar (220px, glassmorphic, gold border-right)
│   ├── Logo (Cinzel + gold mark with pulse glow)
│   ├── Nav sections with labels
│   ├── Nav items (active state: gold left bar + background)
│   └── User profile footer
├── Main
│   ├── TopBar (54px, blur backdrop, gold accents)
│   └── Content (scrollable, 24px padding)
│       ├── KPI Grid (4 cards)
│       └── Bottom Grid (chart + activity panel)
```

---

## Components to Redesign

### Global
- `src/index.css` — update CSS variables, add animation keyframes, particle/blob utility classes
- Remove all inline emoji usage across all components

### Pages
- `Login.tsx` — glassmorphic card, gold glow inputs, animated entrance, no emoji
- `AdminDashboard.tsx` — wiring for new layout shell

### Admin Components
- `Sidebar.tsx` — glassmorphic panel, animated nav items, profile footer
- `TopBar.tsx` — refined blur bar, icon buttons instead of text
- `DashboardView.tsx` — 4-column KPI grid with counters + chart + activity feed
- `FinancialView.tsx` — redesigned tabs, glassmorphic panels, animated charts
- `AssociatesView.tsx` — card grid with hover lift, status badges
- `ProjectManager.tsx` — modal redesign with glassmorphic overlay
- `AgendaView.tsx` — calendar redesign, priority color system
- `MessagesView.tsx` — inbox list with read/unread states
- `CreateAssociateForm.tsx` — form redesign with gold inputs
- `CRMView.tsx` — kanban board redesign

### Associate Dashboard
- `AssociateDashboard.tsx` — same design language applied to associate-facing UI

---

## Libraries

**No new component libraries** — keep full Tailwind + custom CSS control to maintain the custom aesthetic. Adding shadcn/ui or Mantine would conflict with the bespoke glassmorphism style.

**Add:** `canvas` particle system (vanilla JS, no dependency) — inline in a React `useEffect`.

**Keep:** Framer Motion (already installed) — use for page transitions and modal animations where appropriate. Recharts — keep for financial charts, restyle with gold color palette.

---

## Constraints

- No emojis anywhere in the UI
- TypeScript must compile cleanly (`tsc -b`)
- Mobile responsive (existing breakpoints preserved)
- No new npm dependencies unless strictly necessary
- Existing functionality must not break — this is a visual-only overhaul
