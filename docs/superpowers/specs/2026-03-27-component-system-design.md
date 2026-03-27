# Component System Design — NeoVertex UI Overhaul

**Date:** 2026-03-27
**Status:** Approved
**Author:** Claude (brainstorming session)

---

## Overview

Replace all ad-hoc inline styles across the NeoVertex admin and associate dashboards with a unified CSS utility-class system. The design language is **Glass Gold / Sólido & Bold**: near-black backgrounds, gold (#D4AF37) accent, cards with a 3px colored left bar, rectangular buttons, sharp badges.

---

## Design Language

### Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `#04040a` | Page background |
| `--bg-card` | `#0a0a14` | Card / panel background |
| `--bg-elevated` | `#0d0d18` | Inputs, modals, dropdowns |
| `--border-gold` | `rgba(212,175,55,0.12)` | Default card border |
| `--border-gold-strong` | `rgba(212,175,55,0.35)` | Active/focus border |
| `--gold` | `#D4AF37` | Primary accent |
| `--gold-dim` | `rgba(212,175,55,0.5)` | Dimmed accent (labels) |
| `--gold-gradient` | `linear-gradient(135deg,#D4AF37,#8a6010)` | Primary button fill |
| `--text-primary` | `#ffffff` | Headings, values |
| `--text-secondary` | `rgba(255,255,255,0.55)` | Body / labels |
| `--text-muted` | `rgba(255,255,255,0.3)` | Placeholders |
| `--green` | `#4ade80` | Active/success |
| `--red` | `#f87171` | Inactive/danger |

### Typography

- Font: `Inter` (existing)
- Page titles: `font-size:20px; font-weight:700; color:#fff`
- Section labels: `font-size:9px; font-weight:700; letter-spacing:0.15em; color:var(--gold-dim); text-transform:uppercase`
- KPI values: `font-size:28px; font-weight:800; color:#fff`

---

## CSS Utility Classes

All classes live in `src/index.css` under a `/* === COMPONENT SYSTEM === */` section. No Tailwind overrides needed — these are standalone CSS classes.

### Buttons

| Class | Appearance |
|-------|-----------|
| `.btn` | Base: `display:inline-flex; align-items:center; gap:8px; padding:10px 20px; border-radius:8px; font-size:12px; font-weight:700; letter-spacing:0.08em; border:none; cursor:pointer; transition:all 0.2s` |
| `.btn-primary` | Gold gradient fill, black text. Hover: `brightness(1.1)` + slight lift |
| `.btn-secondary` | Transparent bg, gold border `rgba(212,175,55,0.3)`, gold text. Hover: border fully gold |
| `.btn-ghost` | No border, subtle `rgba(255,255,255,0.08)` bg. Hover: `rgba(255,255,255,0.12)` |
| `.btn-danger` | Red-tinted bg `rgba(248,113,113,0.08)`, red border, red text |
| `.btn-sm` | Modifier: `padding:6px 14px; font-size:11px` |
| `.btn-lg` | Modifier: `padding:13px 28px; font-size:13px` |

### Cards

| Class | Appearance |
|-------|-----------|
| `.card` | `background:var(--bg-card); border:1px solid var(--border-gold); border-radius:12px; padding:20px` |
| `.card-kpi` | Includes all `.card` styles plus: `position:relative; padding-left:20px; overflow:hidden`. `::before` = `position:absolute; left:0; top:0; width:3px; height:100%; background:#D4AF37; content:''` (gold bar by default). KPI value inside uses `font-size:28px; font-weight:800` |
| `.card-kpi.bar-green` | `::before` bar is `#4ade80` |
| `.card-kpi.bar-red` | `::before` bar is `#f87171` |
| `.card-kpi.bar-blue` | `::before` bar is `#60a5fa` |
| `.card-kpi.bar-purple` | `::before` bar is `#a78bfa` |
| `.panel` | Like `.card` but `border-radius:16px`. Used for full-page sections |

### Forms

| Class | Appearance |
|-------|-----------|
| `.form-input` | `background:var(--bg-elevated); border:1px solid rgba(255,255,255,0.08); border-left:2px solid var(--border-gold-strong); border-radius:8px; padding:10px 14px; color:#fff; font-size:13px; outline:none; width:100%`. Focus: `border-color:var(--gold); box-shadow:0 0 0 3px rgba(212,175,55,0.12)` |
| `.form-label` | `font-size:11px; font-weight:600; letter-spacing:0.06em; color:rgba(255,255,255,0.55); margin-bottom:6px; display:block` |
| `.form-group` | `display:flex; flex-direction:column; gap:6px` |
| `.form-select` | Same as `.form-input` plus `appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23D4AF37' stroke-width='1.5' fill='none'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; padding-right:36px` |

### Badges

Badges use `border-radius:3px` (sharp corners, not pill).

| Class | Color |
|-------|-------|
| `.badge` | Base: `display:inline-flex; align-items:center; padding:2px 8px; font-size:9px; font-weight:700; letter-spacing:0.08em; border-radius:3px` |
| `.badge-active` | Green fill + border |
| `.badge-inactive` | Red fill + border |
| `.badge-pending` | Gold fill + border |
| `.badge-info` | Blue fill + border |

### Page Structure

| Class | Usage |
|-------|-------|
| `.page-title` | `font-size:20px; font-weight:700; color:#fff; margin-bottom:4px` |
| `.page-subtitle` | `font-size:13px; color:rgba(255,255,255,0.45); margin-bottom:28px` |
| `.section-label` | 9px uppercase gold label for grouping |
| `.kpi-grid` | `display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px` |
| `.page-wrapper` | `padding:24px 28px` (main content area padding) |

### Animations (already exist, keep as-is)

- `anim-fade-up`, `anim-fade-in`, `anim-shimmer` — keep existing keyframes
- Add `.anim-scale-in` for modal entrances: `scale(0.96)→scale(1)` over 200ms

---

## Components to Update

The following 15+ components will have inline styles replaced with the CSS classes above:

**Admin:**
1. `DashboardView.tsx` — KPI cards → `.card-kpi.bar-*`, buttons → `.btn-primary`
2. `AssociatesView.tsx` — search input → `.form-input`, button → `.btn-primary`, profile cards → `.card`
3. `ProfileCard.tsx` — outer → `.card`, badges → `.badge-active/.badge-inactive`
4. `CreateAssociateForm.tsx` — inputs → `.form-input`, labels → `.form-label`, submit → `.btn-primary`, cancel → `.btn-ghost`
5. `ProjectManager.tsx` — same pattern as CreateAssociateForm modals
6. `FinancialView.tsx` — tab container → `.panel`, panels → `.card`
7. `AgendaView.tsx` — outer → `.panel`, buttons → `.btn-primary/.btn-secondary`
8. `MessagesView.tsx` — outer → `.panel`, input → `.form-input`, send → `.btn-primary`
9. `ProductsManager.tsx` — cards → `.card`, forms → `.form-input/.form-label`
10. `LanguagesManager.tsx` — panels → `.card`, buttons → `.btn-ghost/.btn-primary`
11. `SettingsView.tsx` — sections → `.panel`, inputs → `.form-input`, save → `.btn-primary`
12. `TopBar.tsx` — notification badge → `.badge-pending` or custom gold badge
13. `Sidebar.tsx` (admin) — no change needed (already redesigned)

**Associate:**
14. `AssociateDashboard.tsx` — project cards → `.card`, status badges → `.badge-*`
15. `Sidebar.tsx` (associate) — no change needed

---

## File Changes

| File | Action |
|------|--------|
| `src/index.css` | **Modify** — add `/* === COMPONENT SYSTEM === */` block after existing variables |
| All 13 components above | **Modify** — replace inline styles with CSS classes |

No new files created. No dependencies added.

---

## Non-Goals

- No changes to routing, business logic, or API calls
- No Tailwind config changes
- No new animation libraries
- No structural changes to `Sidebar.tsx` (admin or associate) — already redesigned
- `TopBar.tsx` receives only `.badge` class on the notification counter; no structural changes
- No dark/light mode toggle
- No mobile-first refactor (existing responsive behavior preserved)

---

## Success Criteria

1. Every button in the app uses `.btn-primary`, `.btn-secondary`, `.btn-ghost`, or `.btn-danger`
2. Every data card uses `.card` or `.card-kpi`
3. Every text input uses `.form-input`
4. Every status indicator uses `.badge-*`
5. No component file contains a `background: 'linear-gradient(135deg,#D4AF37` inline style (those live in `.btn-primary` in index.css)
6. Visual result matches the approved dashboard mockup (Sólido & Bold, gold accent, left bars on KPI cards)
7. `npm run build` passes with zero TypeScript errors
