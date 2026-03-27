# Component System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all ad-hoc inline button/card/badge/input styles across NeoVertex with a unified CSS utility-class system (`btn`, `card-kpi`, `badge`, `form-input`, `panel`).

**Architecture:** All utility classes are defined once in `src/index.css`. Components replace inline `style={}` objects and scattered Tailwind overrides with semantic class names. No new files, no new dependencies.

**Tech Stack:** React 19, TypeScript 5, Tailwind CSS 4 (v4), Vite 7. Verification: `npm run build` must exit 0 after every task.

---

## File Map

| File | Change |
|------|--------|
| `src/index.css` | Add `/* === COMPONENT SYSTEM ===*/` block with all new classes |
| `src/components/admin/DashboardView.tsx` | KPI cards → `.card-kpi.bar-*`; panels → `.panel` |
| `src/components/admin/AssociatesView.tsx` | Button → `.btn.btn-primary` |
| `src/components/admin/ProfileCard.tsx` | Outer → `.card`; status badges → `.badge-active/.badge-inactive` |
| `src/components/admin/CreateAssociateForm.tsx` | Section labels → `.section-label`; submit → `.btn.btn-primary`; cancel → `.btn.btn-ghost` |
| `src/components/admin/ProjectManager.tsx` | Primary buttons → `.btn.btn-primary`; section labels → `.section-label` |
| `src/components/admin/FinancialView.tsx` | Tab bar → `.panel`; panels → `.panel` |
| `src/components/admin/AgendaView.tsx` | Buttons → `.btn.btn-primary`; event cards → `.card` |
| `src/components/admin/MessagesView.tsx` | Panels → `.card` |
| `src/components/admin/ProductsManager.tsx` | Buttons → `.btn.btn-primary`; form areas → `.panel` |
| `src/components/admin/SettingsView.tsx` | `goldBtn` const removed; buttons → `.btn.btn-primary`; outer panel → `.panel` |
| `src/pages/AssociateDashboard.tsx` | Project cards → `.card`; status spans → `.badge-*` |

---

## Task 1: CSS Component System Foundation

**Files:**
- Modify: `src/index.css` (append after line 185 — end of file)

- [ ] **Step 1: Verify current end of file**

Run: `tail -5 src/index.css`
Expected: last lines contain `.btn-shine:hover { ... }` — confirms append position.

- [ ] **Step 2: Append the component system block**

Add the following at the end of `src/index.css`:

```css
/* ═══════════════════════════════════════════
   COMPONENT SYSTEM — Glass Gold / Sólido & Bold
   ═══════════════════════════════════════════ */

:root {
  --bg-card: #0a0a14;
  --bg-elevated: #0d0d18;
  --border-gold-strong: rgba(212,175,55,0.35);
  --gold-gradient: linear-gradient(135deg, #D4AF37, #8a6010);
}

/* ── Buttons ── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-primary { background: var(--gold-gradient); color: #000; }
.btn-primary:hover { filter: brightness(1.12); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(212,175,55,0.3); }
.btn-secondary { background: transparent; color: var(--color-primary); border: 1px solid rgba(212,175,55,0.3); }
.btn-secondary:hover { border-color: var(--color-primary); background: rgba(212,175,55,0.06); }
.btn-ghost { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.08); }
.btn-ghost:hover { background: rgba(255,255,255,0.1); color: #fff; }
.btn-danger { background: rgba(248,113,113,0.08); color: #f87171; border: 1px solid rgba(248,113,113,0.2); }
.btn-danger:hover { background: rgba(248,113,113,0.14); border-color: rgba(248,113,113,0.4); }
.btn-sm { padding: 6px 14px; font-size: 11px; }
.btn-lg { padding: 13px 28px; font-size: 13px; }
.btn:disabled, .btn[disabled] { opacity: 0.5; cursor: not-allowed; pointer-events: none; }

/* ── Cards ── */
.card {
  background: var(--bg-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
}
.card-kpi {
  background: var(--bg-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px 20px 20px 24px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
}
.card-kpi::before {
  content: '';
  position: absolute;
  left: 0; top: 0;
  width: 3px; height: 100%;
  background: var(--color-primary);
}
.card-kpi.bar-green::before  { background: #4ade80; }
.card-kpi.bar-red::before    { background: #f87171; }
.card-kpi.bar-blue::before   { background: #60a5fa; }
.card-kpi.bar-purple::before { background: #a78bfa; }
.card-kpi:hover { transform: translateY(-2px); border-color: rgba(212,175,55,0.25); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
.panel {
  background: var(--bg-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 20px;
}

/* ── Forms ── */
/* Update existing .input-field to match new spec; add .form-input as alias */
.input-field,
.form-input {
  width: 100%;
  background: var(--bg-elevated);
  border: 1px solid rgba(255,255,255,0.08);
  border-left: 2px solid var(--border-gold-strong);
  border-radius: 8px;
  padding: 10px 14px;
  color: #fff;
  font-size: 13px;
  outline: none;
  transition: all 0.2s;
}
.input-field:focus,
.form-input:focus {
  border-color: var(--color-primary);
  border-left-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(212,175,55,0.12);
  background: rgba(212,175,55,0.03);
}
.input-field::placeholder,
.form-input::placeholder { color: rgba(255,255,255,0.25); }
select.input-field option,
select.form-input option { background-color: #0d0d15; color: white; }
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23D4AF37' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}
.form-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.55);
  margin-bottom: 6px;
}
.form-group { display: flex; flex-direction: column; gap: 6px; }

/* ── Badges ── */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
  border-radius: 3px;
  border: 1px solid;
}
.badge-active   { background: rgba(74,222,128,0.12);  color: #4ade80; border-color: rgba(74,222,128,0.2);  }
.badge-inactive { background: rgba(248,113,113,0.12); color: #f87171; border-color: rgba(248,113,113,0.2); }
.badge-pending  { background: rgba(212,175,55,0.12);  color: #D4AF37; border-color: rgba(212,175,55,0.2);  }
.badge-info     { background: rgba(96,165,250,0.12);  color: #60a5fa; border-color: rgba(96,165,250,0.2);  }

/* ── Page structure ── */
.page-title    { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 4px; }
.page-subtitle { font-size: 13px; color: rgba(255,255,255,0.45); margin-bottom: 28px; }
.section-label {
  display: block;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: rgba(212,175,55,0.55);
  text-transform: uppercase;
  margin-bottom: 6px;
}
.kpi-grid     { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
.page-wrapper { padding: 24px 28px; }
```

- [ ] **Step 3: Build to verify no CSS syntax errors**

Run: `npm run build`
Expected: exits 0, output ends with `✓ built in` (no errors).

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat: add CSS component system (btn, card-kpi, badge, form-input, panel)"
```

---

## Task 2: DashboardView — KPI Cards and Panels

**Files:**
- Modify: `src/components/admin/DashboardView.tsx`

Context: The KPI array currently has a `color` string per item. We replace inline styles with `.card-kpi.bar-*` classes. The bottom row panels switch from `.glass.glass-top-line` to `.panel`.

- [ ] **Step 1: Replace KPI array — add `barClass` field, remove `color`**

Find the KPI array (around line 54) and replace it:

```tsx
// BEFORE
{ label: 'TOTAL ASSOCIADOS', value: animAssociates, suffix: '', sub: 'ativos na plataforma', color: 'var(--color-primary)' },
{ label: 'PROJETOS ATIVOS',  value: animProjects,   suffix: '', sub: 'em andamento',         color: 'var(--color-info)' },
{ label: 'RECEITA DO MÊS',   value: animRevenue,    suffix: 'R$', sub: 'faturamento mensal', color: 'var(--color-success)' },
{ label: 'SERVIÇOS ATIVOS',  value: animServices,   suffix: '', sub: 'tipos de serviço',     color: 'rgba(212,175,55,0.8)' },

// AFTER
{ label: 'TOTAL ASSOCIADOS', value: animAssociates, suffix: '',   sub: 'ativos na plataforma', barClass: '' },
{ label: 'PROJETOS ATIVOS',  value: animProjects,   suffix: '',   sub: 'em andamento',         barClass: 'bar-blue' },
{ label: 'RECEITA DO MÊS',   value: animRevenue,    suffix: 'R$', sub: 'faturamento mensal',   barClass: 'bar-green' },
{ label: 'SERVIÇOS ATIVOS',  value: animServices,   suffix: '',   sub: 'tipos de serviço',     barClass: '' },
```

- [ ] **Step 2: Replace KPI card JSX — use `.card-kpi` classes**

Find the `.map((kpi, i) =>` block that renders each KPI card and replace the entire `<div>` with:

```tsx
.map((kpi, i) => (
    <div
        key={kpi.label}
        className={`card-kpi ${kpi.barClass} anim-fade-up`}
        style={{ animationDelay: `${i * 0.08}s` }}
    >
        <div className="anim-shimmer" />
        <div className="section-label">{kpi.label}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            {kpi.suffix && <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginRight: 2 }}>{kpi.suffix}</span>}
            {kpi.value.toLocaleString('pt-BR')}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>{kpi.sub}</div>
    </div>
))
```

Note: `onMouseEnter` / `onMouseLeave` handlers are removed — hover is handled by `.card-kpi:hover` CSS rule.

- [ ] **Step 3: Replace bottom-row panel divs — use `.panel`**

Find the two bottom-row panels (chart panel and activity panel), each currently:

```tsx
// BEFORE
<div className="glass glass-top-line relative rounded-2xl p-5 overflow-hidden anim-fade-up" style={{ animationDelay: '0.35s' }}>
```

Replace both with:

```tsx
// AFTER
<div className="panel relative overflow-hidden anim-fade-up" style={{ animationDelay: '0.35s' }}>
```

The `relative overflow-hidden anim-fade-up` Tailwind classes stay; only `glass glass-top-line rounded-2xl p-5` are replaced by `panel`.

- [ ] **Step 4: Build to verify no TypeScript errors**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/DashboardView.tsx
git commit -m "feat: apply card-kpi and panel classes to DashboardView"
```

---

## Task 3: AssociatesView — Button; ProfileCard — Card and Badges

**Files:**
- Modify: `src/components/admin/AssociatesView.tsx`
- Modify: `src/components/admin/ProfileCard.tsx`

### AssociatesView

- [ ] **Step 1: Replace "NOVO ASSOCIADO" button**

Find (around line 43):

```tsx
// BEFORE
<button
    onClick={() => onNewAssociate()}
    className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all duration-200"
    style={{ background: 'linear-gradient(135deg, #D4AF37, #8a6010)', color: '#000', letterSpacing: '0.08em', boxShadow: '0 4px 16px rgba(212,175,55,0.25)' }}
>
    <Plus size={14} aria-hidden={true} /> NOVO ASSOCIADO
</button>
```

Replace with:

```tsx
// AFTER
<button onClick={() => onNewAssociate()} className="btn btn-primary">
    <Plus size={14} aria-hidden={true} /> NOVO ASSOCIADO
</button>
```

### ProfileCard

- [ ] **Step 2: Replace outer card wrapper**

Find (around line 44):

```tsx
// BEFORE
<div
    className="glass glass-top-line relative rounded-2xl p-5 overflow-hidden cursor-pointer transition-all duration-300"
```

Replace with:

```tsx
// AFTER
<div
    className="card relative overflow-hidden cursor-pointer transition-all duration-300"
```

- [ ] **Step 3: Replace status badges**

Find the status badge block (around line 99):

```tsx
// BEFORE
{isActive ? (
    <span style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)', fontSize: 9, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
        {subStatus ? `${subStatus.days} dias restantes` : 'Ativo'}
    </span>
) : (
    <span style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', fontSize: 9, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
        Inativo
    </span>
)}
```

Replace with:

```tsx
// AFTER
{isActive ? (
    <span className="badge badge-active">
        {subStatus ? `${subStatus.days} dias restantes` : 'Ativo'}
    </span>
) : (
    <span className="badge badge-inactive">Inativo</span>
)}
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/AssociatesView.tsx src/components/admin/ProfileCard.tsx
git commit -m "feat: apply btn-primary, card, badge classes to AssociatesView and ProfileCard"
```

---

## Task 4: CreateAssociateForm — Section Labels, Submit Button, Cancel Button

**Files:**
- Modify: `src/components/admin/CreateAssociateForm.tsx`

Context: Inputs already use `className="input-field w-full"` — no change needed (`.input-field` is updated in Task 1). Only the section `<h4>` labels and action buttons need updating.

- [ ] **Step 1: Replace all four section `<h4>` labels**

There are 4 occurrences of the pattern below. Replace all four:

```tsx
// BEFORE (repeated 4×, different label text each time)
<h4 className="mb-6 flex items-center gap-2" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.15em', color:'rgba(212,175,55,0.55)', marginBottom:12 }}>

// AFTER (repeated 4×)
<h4 className="section-label flex items-center gap-2">
```

The label text inside each `<h4>` stays unchanged.

- [ ] **Step 2: Replace submit button**

Find (around line 448):

```tsx
// BEFORE
<button
    type="submit"
    disabled={loading}
    style={{ background:'linear-gradient(135deg,#D4AF37,#8a6010)', color:'#000', fontWeight:700, fontSize:12, letterSpacing:'0.1em', padding:'10px 24px', borderRadius:10, boxShadow:'0 4px 16px rgba(212,175,55,0.25)', border:'none', cursor:'pointer', flex:2, display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity: loading ? 0.5 : 1 }}
>
```

Replace with:

```tsx
// AFTER
<button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>
```

- [ ] **Step 3: Replace cancel button**

Find the cancel button near the submit button:

```tsx
// BEFORE (exact text may vary — it's the secondary action button next to submit)
<button
    type="button"
    onClick={onCancel}
    style={{ ...some inline styles with white/gray colors... }}
>
    Cancelar
</button>
```

Replace with:

```tsx
// AFTER
<button type="button" onClick={onCancel} className="btn btn-ghost">
    Cancelar
</button>
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/CreateAssociateForm.tsx
git commit -m "feat: apply section-label, btn-primary, btn-ghost to CreateAssociateForm"
```

---

## Task 5: ProjectManager — Primary Buttons

**Files:**
- Modify: `src/components/admin/ProjectManager.tsx`

Context: ProjectManager is a large file (~2200 lines). There are 3 occurrences of inline gold gradient button styles. Find each with the grep pattern below and replace.

- [ ] **Step 1: Find all inline gold button occurrences**

Run: `grep -n "linear-gradient(135deg,#D4AF37" src/components/admin/ProjectManager.tsx`

Expected: at least 3 hits around lines 1750, 2168, and possibly others.

- [ ] **Step 2: Replace each occurrence**

For every button that matches the pattern:

```tsx
// BEFORE (pattern — exact padding/radius may vary slightly)
style={{ background:'linear-gradient(135deg,#D4AF37,#8a6010)', color:'#000', fontWeight:700, fontSize:12, letterSpacing:'0.1em', padding:'10px 24px', borderRadius:10, boxShadow:'0 4px 16px rgba(212,175,55,0.25)', border:'none', cursor:'pointer', ... }}
```

Replace with `className="btn btn-primary"` (keep only non-style props like `type`, `onClick`, `disabled`). If the button had `width:'100%'` or `display:'flex'` in the style, keep those as inline style only.

Example replacement for the save button at ~line 1750:

```tsx
// BEFORE
<button
    type="button"
    onClick={handleSave}
    disabled={isSaving}
    style={{ background:'linear-gradient(135deg,#D4AF37,#8a6010)', color:'#000', fontWeight:700, fontSize:12, letterSpacing:'0.1em', padding:'10px 24px', borderRadius:10, boxShadow:'0 4px 16px rgba(212,175,55,0.25)', border:'none', cursor:'pointer', width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
>
// AFTER
<button type="button" onClick={handleSave} disabled={isSaving} className="btn btn-primary" style={{ width: '100%' }}>
```

For the profile save button at ~line 2168, same pattern — add `style={{ opacity: isSavingProfile ? 0.5 : 1 }}` if that logic was previously in the style object (though `.btn:disabled` already handles opacity).

- [ ] **Step 3: Replace the close/cancel `<button>` style near modal header (around line 909)**

```tsx
// BEFORE
style={{ color:'rgba(255,255,255,0.4)', transition:'color 0.2s', background:'none', border:'none', cursor:'pointer', padding:8 }}

// AFTER
className="btn btn-ghost btn-sm"
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/ProjectManager.tsx
git commit -m "feat: apply btn-primary and btn-ghost to ProjectManager"
```

---

## Task 6: FinancialView — Tab Bar and Panels

**Files:**
- Modify: `src/components/admin/FinancialView.tsx`

- [ ] **Step 1: Replace tab container**

Find (around line 405):

```tsx
// BEFORE
<div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.08)', display: 'inline-flex' }}>
```

Replace with:

```tsx
// AFTER
<div className="flex gap-1 p-1 rounded-xl mb-6 inline-flex" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.08)' }}>
```

Note: Tailwind `inline-flex` is added as a class; `display: 'inline-flex'` removed from inline style. The subtle background/border here is intentional (tab bar, not a full card).

- [ ] **Step 2: Find all `.glass.glass-top-line` panel wrappers in this file**

Run: `grep -n "glass glass-top-line" src/components/admin/FinancialView.tsx`

For each hit that wraps a content section (not a small inline element), replace:

```tsx
// BEFORE
className="glass glass-top-line relative rounded-2xl p-5 overflow-hidden ..."

// AFTER
className="panel relative overflow-hidden ..."
```

Keep any extra Tailwind utility classes (`overflow-hidden`, animation classes, etc.) after `panel`.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/FinancialView.tsx
git commit -m "feat: apply panel class to FinancialView sections"
```

---

## Task 7: AgendaView — Buttons and Event Cards

**Files:**
- Modify: `src/components/admin/AgendaView.tsx`

- [ ] **Step 1: Find all inline gold gradient buttons**

Run: `grep -n "linear-gradient(135deg,#D4AF37" src/components/admin/AgendaView.tsx`

Expected: hits around lines 317, 423.

- [ ] **Step 2: Replace primary buttons**

For each hit (save/submit buttons), replace inline style with `className="btn btn-primary"`:

```tsx
// BEFORE (line ~317)
<button
    type="submit"
    disabled={saving}
    style={{ background: 'linear-gradient(135deg,#D4AF37,#8a6010)', color: '#000', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', opacity: saving ? 0.5 : 1 }}
>

// AFTER
<button type="submit" disabled={saving} className="btn btn-primary">
```

Apply the same replacement to line ~423.

- [ ] **Step 3: Replace agenda event card outer wrapper**

Find event card items (around line 644) that currently use:

```tsx
// BEFORE
style={{ borderLeftColor: TYPE_COLORS[a.type], borderLeftWidth: 3, borderColor: '...', ... }}
```

This card has a dynamic color from `TYPE_COLORS`. Keep the left border color dynamic via inline style, but move the base card styling to `.card`:

```tsx
// BEFORE
<div className="..." style={{ borderLeftColor: TYPE_COLORS[a.type], borderLeftWidth: 3, borderColor: 'rgba(255,255,255,0.08)', borderTopColor: '...', ... }}>

// AFTER
<div className="card" style={{ borderLeftColor: TYPE_COLORS[a.type], borderLeftWidth: 3, borderColor: 'transparent', borderLeftStyle: 'solid' }}>
```

The left bar here uses `borderLeftColor` from `TYPE_COLORS` (appointment-type specific), not the card-kpi `::before` approach — both are acceptable since type colors change dynamically.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/AgendaView.tsx
git commit -m "feat: apply btn-primary and card to AgendaView"
```

---

## Task 8: MessagesView — Card Panels

**Files:**
- Modify: `src/components/admin/MessagesView.tsx`

- [ ] **Step 1: Find glass panels**

Run: `grep -n "glass\|glass-top-line" src/components/admin/MessagesView.tsx`

- [ ] **Step 2: Replace section wrappers**

For each `className="glass rounded-xl p-6"` or similar glass wrapper that encloses a content block:

```tsx
// BEFORE
<div className="glass rounded-xl p-6" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>

// AFTER
<div className="card">
```

For divs that use `glass` with extra layout classes (`flex`, `overflow-hidden`, etc.), preserve those classes:

```tsx
// BEFORE
<div className="glass rounded-2xl overflow-hidden flex flex-col" style={{ ... }}>

// AFTER
<div className="card overflow-hidden flex flex-col">
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/MessagesView.tsx
git commit -m "feat: apply card panel classes to MessagesView"
```

---

## Task 9: ProductsManager — Buttons and Form Areas

**Files:**
- Modify: `src/components/admin/ProductsManager.tsx`

- [ ] **Step 1: Find and replace gold gradient buttons**

Run: `grep -n "linear-gradient(135deg,#D4AF37" src/components/admin/ProductsManager.tsx`

Expected: hits around lines 109, 287.

Replace each with `className="btn btn-primary"`:

```tsx
// BEFORE (line ~109)
<button
    type="submit"
    style={{ background: 'linear-gradient(135deg,#D4AF37,#8a6010)', color: '#000', fontWeight: 700, fontSize: 12, letterSpacing: '0.1em', padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer' }}
>

// AFTER
<button type="submit" className="btn btn-primary">
```

Apply the same to line ~287.

- [ ] **Step 2: Replace main product detail panel**

Find (around line 117):

```tsx
// BEFORE
<div className="glass glass-top-line relative rounded-2xl p-5 overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.3)' }}>

// AFTER
<div className="panel relative overflow-hidden">
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/ProductsManager.tsx
git commit -m "feat: apply btn-primary and panel to ProductsManager"
```

---

## Task 10: SettingsView — Remove goldBtn Const, Apply Classes

**Files:**
- Modify: `src/components/admin/SettingsView.tsx`

- [ ] **Step 1: Delete the `goldBtn` const**

Find and remove these lines (around line 144):

```tsx
// DELETE THIS ENTIRE BLOCK
const goldBtn = {
    background: 'linear-gradient(135deg,#D4AF37,#8a6010)',
    color: '#000',
    fontWeight: 700,
    fontSize: 12,
    letterSpacing: '0.1em',
    padding: '8px 20px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
};
```

- [ ] **Step 2: Replace all `style={goldBtn}` usages**

Run: `grep -n "goldBtn" src/components/admin/SettingsView.tsx`

Expected: 4–6 hits. For each `<button ... style={goldBtn}>` or `style={{ ...goldBtn, ... }}`:

```tsx
// BEFORE (simple case)
<button type="submit" style={goldBtn} className="flex items-center gap-2">

// AFTER
<button type="submit" className="btn btn-primary flex items-center gap-2">
```

For the extended case `style={{ ...goldBtn, height: 50 }}`:

```tsx
// BEFORE
<button type="submit" style={{ ...goldBtn, height: 50 }} className="flex items-center gap-2 w-full md:w-auto">

// AFTER
<button type="submit" className="btn btn-primary flex items-center gap-2 w-full md:w-auto" style={{ height: 50 }}>
```

- [ ] **Step 3: Replace outer settings panel**

Find (around line 157):

```tsx
// BEFORE
<div className="glass glass-top-line relative rounded-2xl p-8 overflow-hidden">

// AFTER
<div className="panel relative overflow-hidden" style={{ padding: 32 }}>
```

Note: `.panel` has `padding: 20px`; the original had `p-8` (32px). Pass `style={{ padding: 32 }}` to preserve the larger padding.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/SettingsView.tsx
git commit -m "feat: remove goldBtn const, apply btn-primary and panel to SettingsView"
```

---

## Task 11: AssociateDashboard — Project Cards and Status Badges

**Files:**
- Modify: `src/pages/AssociateDashboard.tsx`

- [ ] **Step 1: Replace project card wrappers**

Find the project card div (around line 245) that uses `animation: fadeUp ...` inline style:

```tsx
// BEFORE
<div
    className="glass glass-top-line relative rounded-2xl p-5 overflow-hidden ..."
    style={{ animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 0.08}s both` }}
>
```

Replace with:

```tsx
// AFTER
<div
    className="card relative overflow-hidden anim-fade-up"
    style={{ animationDelay: `${index * 0.08}s` }}
>
```

- [ ] **Step 2: Replace status badge**

Find the long ternary that sets `style={}` on a `<span>` based on `project.status` (around line 260):

```tsx
// BEFORE
<span style={
    project.status === 'Ativo' || project.status?.toLowerCase() === 'ativo'
        ? { background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)', fontSize: 9, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }
        : project.status === 'Concluído' || ...
            ? { background: 'rgba(96,165,250,0.1)', color: '#60a5fa', ... }
            : project.status === 'Cancelado' || ...
                ? { background: 'rgba(248,113,113,0.1)', color: '#f87171', ... }
                : { background: 'rgba(212,175,55,0.1)', color: '#D4AF37', ... }
}>
    {project.status}
</span>
```

Replace with:

```tsx
// AFTER
<span className={`badge ${
    project.status?.toLowerCase().includes('ativo') ? 'badge-active' :
    project.status?.toLowerCase().includes('conclu') ? 'badge-info' :
    project.status?.toLowerCase().includes('cancel') ? 'badge-inactive' :
    'badge-pending'
}`}>
    {project.status}
</span>
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 4: Commit**

```bash
git add src/pages/AssociateDashboard.tsx
git commit -m "feat: apply card and badge classes to AssociateDashboard"
```

---

## Task 12: LanguagesManager — Panel Wrapper

**Files:**
- Modify: `src/components/admin/LanguagesManager.tsx`

Context: Language selection cards have dynamic `style` (gold vs gray based on `lang.active` state) — keep those. Only the outer section panel needs updating.

- [ ] **Step 1: Replace outer content panel**

Find (around line 77):

```tsx
// BEFORE
<div className="glass glass-top-line relative rounded-2xl p-5 overflow-hidden mt-8">
```

Replace with:

```tsx
// AFTER
<div className="panel relative overflow-hidden mt-8">
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/LanguagesManager.tsx
git commit -m "feat: apply panel class to LanguagesManager"
```

---

## Final Verification

- [ ] **Run full build once more**

```bash
npm run build
```

Expected: exits 0, zero TypeScript errors.

- [ ] **Smoke check in browser**

Start dev server: `npm run dev`

Verify in browser:
1. **Login page** — unaffected (no changes)
2. **Dashboard (`/admin`)** — KPI cards have solid dark background + 3px left bar (gold/blue/green)
3. **Associates** — "NOVO ASSOCIADO" button is gold gradient, inputs have gold left border accent
4. **Any form modal** — inputs have `border-left: 2px solid` gold accent, submit is gold gradient
5. **AssociateDashboard** — project cards are solid dark, status badges are sharp-cornered colored chips

- [ ] **Push**

```bash
git push
```
