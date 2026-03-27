# NeoVertex UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Full visual overhaul — dark gold + glassmorphism with ambient blobs, particle network, animated entrances, counter animations, shimmer effects, and zero emojis.

**Architecture:** Replace all Tailwind inline color hacks with CSS custom properties. Build a shared `AmbientBackground` component (particles + blobs). Redesign every component in-place — no file moves. Framer Motion for page transitions. Canvas for particles.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Framer Motion (already installed), Lucide React, Recharts (restyled)

---

## File Map

| File | Action |
|------|--------|
| `src/index.css` | Extend CSS variables, add keyframes, glassmorphism utilities |
| `src/components/AmbientBackground.tsx` | **New** — canvas particles + CSS blobs |
| `src/components/admin/Sidebar.tsx` | Redesign — glassmorphic, animated nav, profile footer |
| `src/components/admin/TopBar.tsx` | Redesign — blur bar, icon buttons |
| `src/pages/Login.tsx` | Redesign — full-screen glass card + ambient |
| `src/components/admin/DashboardView.tsx` | Redesign — KPI grid + counter animation + activity feed |
| `src/components/admin/FinancialView.tsx` | Redesign — glass tabs + panels + gold charts |
| `src/components/admin/AssociatesView.tsx` | Redesign — glass grid cards |
| `src/components/admin/ProfileCard.tsx` | Redesign — hover lift, status badge |
| `src/components/admin/CreateAssociateForm.tsx` | Redesign — glass modal, gold inputs |
| `src/components/admin/ProjectManager.tsx` | Redesign — glass modal overlay |
| `src/components/admin/AgendaView.tsx` | Redesign — calendar glass panels |
| `src/components/admin/MessagesView.tsx` | Redesign — glass inbox list |
| `src/components/admin/ProductsManager.tsx` | Redesign — glass table/cards |
| `src/components/admin/LanguagesManager.tsx` | Redesign — glass toggles |
| `src/components/admin/SettingsView.tsx` | Redesign — glass settings |
| `src/components/admin/charts/FinancialCharts.tsx` | Restyle — gold palette for Recharts |
| `src/pages/AdminDashboard.tsx` | Wrap with AmbientBackground |
| `src/pages/AssociateDashboard.tsx` | Wrap with AmbientBackground, redesign |

---

## Task 1: CSS Foundation

**Files:**
- Modify: `src/index.css`

- [ ] **Replace `src/index.css` entirely with:**

```css
@import "tailwindcss";

@theme {
  --color-bg: #04040a;
  --color-surface: rgba(255,255,255,0.025);
  --color-surface-2: rgba(255,255,255,0.04);
  --color-border: rgba(212,175,55,0.12);
  --color-border-strong: rgba(212,175,55,0.25);
  --color-primary: #D4AF37;
  --color-primary-bright: #f0cc55;
  --color-primary-dim: #8a6010;
  --color-primary-glow: rgba(212,175,55,0.15);
  --color-text: #ffffff;
  --color-text-muted: rgba(255,255,255,0.4);
  --color-text-soft: rgba(255,255,255,0.7);
  --color-success: #4ade80;
  --color-error: #f87171;
  --color-info: #60a5fa;
  --font-heading: 'Cinzel', serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

:root {
  --color-bg: #04040a;
  --color-surface: rgba(255,255,255,0.025);
  --color-surface-2: rgba(255,255,255,0.04);
  --color-border: rgba(212,175,55,0.12);
  --color-border-strong: rgba(212,175,55,0.25);
  --color-primary: #D4AF37;
  --color-primary-bright: #f0cc55;
  --color-primary-dim: #8a6010;
  --color-primary-glow: rgba(212,175,55,0.15);
  --color-text: #ffffff;
  --color-text-muted: rgba(255,255,255,0.4);
  --color-text-soft: rgba(255,255,255,0.7);
  --color-success: #4ade80;
  --color-error: #f87171;
  --color-info: #60a5fa;
  --font-heading: 'Cinzel', serif;
  --font-body: 'Inter', sans-serif;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background-color: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

h1,h2,h3,h4,h5,h6 { font-family: var(--font-heading); font-weight: 600; line-height: 1.2; }
button { cursor: pointer; border: none; background: none; }
a { text-decoration: none; color: inherit; }

/* Scrollbar */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.2); border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: rgba(212,175,55,0.4); }

/* ── Glass Utilities ── */
.glass {
  background: var(--color-surface);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--color-border);
}
.glass-strong {
  background: var(--color-surface-2);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--color-border-strong);
}
.glass-top-line::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent);
}

/* Input */
.input-field {
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(212,175,55,0.15);
  border-radius: 0.625rem;
  padding: 0.625rem 0.875rem;
  color: #fff;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s;
}
.input-field:focus {
  border-color: var(--color-primary);
  background: rgba(212,175,55,0.04);
  box-shadow: 0 0 0 3px rgba(212,175,55,0.08);
}
.input-field::placeholder { color: rgba(255,255,255,0.25); }
select.input-field option { background-color: #0d0d15; color: white; }

/* ── Keyframes ── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; } to { opacity: 1; }
}
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-24px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(24px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes growBar {
  from { transform: scaleY(0); }
  to   { transform: scaleY(1); }
}
@keyframes shimmer {
  0%   { left: -60%; }
  100% { left: 160%; }
}
@keyframes driftA {
  from { transform: translate(0,0) scale(1); }
  to   { transform: translate(60px,40px) scale(1.15); }
}
@keyframes driftB {
  from { transform: translate(0,0); }
  to   { transform: translate(-40px,-60px) scale(1.1); }
}
@keyframes driftC {
  from { transform: translateY(0); }
  to   { transform: translateY(-80px); }
}
@keyframes logoPulse {
  0%,100% { box-shadow: 0 0 20px rgba(212,175,55,0.4), 0 0 6px rgba(212,175,55,0.2); }
  50%     { box-shadow: 0 0 36px rgba(212,175,55,0.7), 0 0 14px rgba(212,175,55,0.5); }
}
@keyframes badgePulse {
  0%,100% { box-shadow: none; }
  50%     { box-shadow: 0 0 8px rgba(212,175,55,0.5); }
}
@keyframes shine {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes tech-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(212,175,55,0.3); }
  70%  { box-shadow: 0 0 0 6px rgba(212,175,55,0); }
  100% { box-shadow: 0 0 0 0 rgba(212,175,55,0); }
}

/* ── Animation helpers ── */
.anim-fade-up   { animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both; }
.anim-fade-in   { animation: fadeIn 0.4s ease both; }
.anim-slide-left { animation: slideInLeft 0.5s cubic-bezier(0.16,1,0.3,1) both; }
.anim-scale-in  { animation: scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) both; }
.anim-shimmer {
  position: absolute; top: 0; left: -60%; width: 60%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(212,175,55,0.05), transparent);
  animation: shimmer 4s ease-in-out infinite;
  pointer-events: none;
}
.animate-tech-pulse { animation: tech-pulse 2s infinite; }
.text-liquid-gold {
  background: linear-gradient(120deg, #D4AF37, #f0cc55, #D4AF37);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  background-size: 200% auto; animation: shine 4s linear infinite;
}
.text-tech-gold { color: var(--color-primary); text-shadow: 0 0 10px rgba(212,175,55,0.3); }
.gold-glow { box-shadow: 0 0 20px rgba(212,175,55,0.3); }
/* Legacy compat */
.tech-panel { background: var(--color-surface); backdrop-filter: blur(16px); border: 1px solid var(--color-border); }
.tech-border-glow { border: 1px solid var(--color-primary-dim); box-shadow: 0 0 10px var(--color-primary-glow); }
.card-glass { background: rgba(15,15,15,0.6); backdrop-filter: blur(10px); border: 1px solid var(--color-border); border-radius: 1rem; }
.btn-shine { position: relative; overflow: hidden; background: linear-gradient(90deg,#1a1a1a,#222,#1a1a1a); border: 1px solid var(--color-border); color: white; transition: all 0.3s; }
.btn-shine:hover { border-color: var(--color-primary); box-shadow: 0 0 12px rgba(212,175,55,0.2); }
```

- [ ] **Verify build still compiles**

```bash
cd "c:/Users/adone/OneDrive/Área de Trabalho/Job/NeoVertex/NeoVertex-main"
npm run build 2>&1 | tail -5
```
Expected: `✓ built in X.XXs`

- [ ] **Commit**

```bash
git add src/index.css
git commit -m "style: new CSS foundation — glass utilities, keyframes, gold palette"
```

---

## Task 2: AmbientBackground Component

**Files:**
- Create: `src/components/AmbientBackground.tsx`

- [ ] **Create `src/components/AmbientBackground.tsx`:**

```tsx
import { useEffect, useRef } from 'react';

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let raf: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.1 + 0.2,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      alpha: Math.random() * 0.45 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.pulse += 0.018;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,55,${a})`;
        ctx.fill();
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 88) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212,175,55,${0.07 * (1 - dist / 88)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: 0.9 }}
      />
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
        <div style={{
          position:'absolute', width:600, height:600, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(212,175,55,0.13) 0%, transparent 70%)',
          top:-200, left:-150, filter:'blur(90px)',
          animation:'driftA 14s ease-in-out infinite alternate',
        }} />
        <div style={{
          position:'absolute', width:500, height:500, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(170,100,15,0.08) 0%, transparent 70%)',
          bottom:-150, right:100, filter:'blur(90px)',
          animation:'driftB 17s ease-in-out infinite alternate',
        }} />
        <div style={{
          position:'absolute', width:300, height:300, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)',
          top:'45%', right:-60, filter:'blur(80px)',
          animation:'driftC 10s ease-in-out infinite alternate',
        }} />
      </div>
    </>
  );
}
```

- [ ] **Commit**

```bash
git add src/components/AmbientBackground.tsx
git commit -m "feat: AmbientBackground — canvas particles + drifting gold blobs"
```

---

## Task 3: Sidebar Redesign

**Files:**
- Modify: `src/components/admin/Sidebar.tsx`

- [ ] **Replace `src/components/admin/Sidebar.tsx` entirely:**

```tsx
import React, { useState } from 'react';
import {
  LayoutGrid, Users, CreditCard, Settings2, MessageSquare,
  CalendarDays, ChevronDown, Power, X, TrendingUp, Package,
  Globe, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../Logo';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  handleLogout: () => void;
  unreadCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
  adminEmail?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  subItems?: { id: string; label: string }[];
  section?: string;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard',          label: 'Visão Geral',   icon: LayoutGrid, section: 'PRINCIPAL' },
  {
    id: 'associates-section', label: 'Associados',    icon: Users, section: 'PRINCIPAL',
    subItems: [
      { id: 'crm',                  label: 'Gestão de Leads' },
      { id: 'settings-associates',  label: 'Lista de Associados' },
    ],
  },
  { id: 'financial-records',  label: 'Financeiro',    icon: CreditCard },
  { id: 'agenda',             label: 'Agenda',        icon: CalendarDays, section: 'OPERAÇÕES' },
  { id: 'messages',           label: 'Solicitações',  icon: MessageSquare },
  {
    id: 'settings',           label: 'Configurações', icon: Settings2, section: 'SISTEMA',
    subItems: [
      { id: 'settings-products',  label: 'Produtos' },
      { id: 'settings-languages', label: 'Idiomas' },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  activeSection, setActiveSection, handleLogout,
  unreadCount = 0, isOpen = true, onClose, adminEmail = '',
}) => {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const items = menuItems.map(item =>
    item.id === 'messages' ? { ...item, badge: unreadCount } : item
  );

  const handleItemClick = (item: MenuItem) => {
    if (item.subItems) {
      setExpandedMenu(expandedMenu === item.id ? null : item.id);
    } else {
      setActiveSection(item.id);
      onClose?.();
    }
  };

  const isActive = (item: MenuItem) =>
    activeSection === item.id ||
    (item.subItems?.some(s => s.id === activeSection) ?? false);

  let lastSection = '';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed md:sticky top-0 h-screen flex flex-col z-50 transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{
          width: 220,
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(212,175,55,0.1)',
          animation: 'slideInLeft 0.5s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        {/* Logo */}
        <div className="px-4 py-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
          <button onClick={onClose} className="absolute top-4 right-4 md:hidden text-white/40 hover:text-white">
            <X size={18} />
          </button>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: 'linear-gradient(135deg, #f0cc55, #8a6010)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 14, color: '#000',
            animation: 'logoPulse 3s ease-in-out infinite',
          }}>
            N
          </div>
          <div>
            <div style={{
              fontFamily: 'Cinzel, serif', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.15em', color: '#D4AF37',
            }}>NEOVERTEX</div>
            <div style={{ fontSize: 9, color: 'rgba(212,175,55,0.35)', letterSpacing: '0.1em', marginTop: 1 }}>
              PLATAFORMA ADMIN
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {items.map(item => {
            const active = isActive(item);
            const expanded = expandedMenu === item.id;
            const showSection = item.section && item.section !== lastSection;
            if (item.section) lastSection = item.section;

            return (
              <div key={item.id}>
                {showSection && (
                  <div style={{
                    fontSize: 9, letterSpacing: '0.18em', fontWeight: 600,
                    color: 'rgba(212,175,55,0.35)', padding: '10px 8px 4px',
                  }}>
                    {item.section}
                  </div>
                )}

                <button
                  onClick={() => handleItemClick(item)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-200 group relative"
                  style={active ? {
                    background: 'rgba(212,175,55,0.08)',
                    border: '1px solid rgba(212,175,55,0.18)',
                    color: '#D4AF37',
                    boxShadow: '0 2px 12px rgba(212,175,55,0.08)',
                  } : {
                    border: '1px solid transparent',
                    color: 'rgba(255,255,255,0.45)',
                  }}
                >
                  {active && (
                    <div style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: 3, height: '55%', borderRadius: '0 2px 2px 0',
                      background: 'linear-gradient(180deg, #f0cc55, #8a6010)',
                      boxShadow: '0 0 6px rgba(212,175,55,0.5)',
                    }} />
                  )}

                  <item.icon
                    size={14}
                    strokeWidth={active ? 2.5 : 1.8}
                    style={{ flexShrink: 0, transition: 'color 0.2s' }}
                  />
                  <span style={{ fontSize: 11.5, fontWeight: active ? 600 : 400, letterSpacing: '0.03em', flex: 1, textAlign: 'left' }}>
                    {item.label}
                  </span>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span style={{
                      background: 'rgba(212,175,55,0.15)', color: '#D4AF37',
                      fontSize: 9, padding: '1px 5px', borderRadius: 10, fontWeight: 700,
                      border: '1px solid rgba(212,175,55,0.2)',
                      animation: 'badgePulse 2s ease-in-out infinite',
                    }}>
                      {item.badge}
                    </span>
                  )}
                  {item.subItems && (
                    <ChevronDown
                      size={12}
                      style={{
                        transition: 'transform 0.25s',
                        transform: expanded ? 'rotate(180deg)' : 'none',
                        color: active ? '#D4AF37' : 'rgba(255,255,255,0.3)',
                      }}
                    />
                  )}
                </button>

                <AnimatePresence>
                  {item.subItems && expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden', marginLeft: 12, marginTop: 2 }}
                    >
                      <div style={{ borderLeft: '1px solid rgba(212,175,55,0.1)', paddingLeft: 10 }}>
                        {item.subItems.map(sub => {
                          const subActive = activeSection === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => { setActiveSection(sub.id); onClose?.(); }}
                              className="w-full text-left py-2 px-2 rounded-md transition-all duration-150"
                              style={{
                                fontSize: 11,
                                color: subActive ? '#D4AF37' : 'rgba(255,255,255,0.4)',
                                background: subActive ? 'rgba(212,175,55,0.06)' : 'transparent',
                                fontWeight: subActive ? 600 : 400,
                              }}
                            >
                              {sub.label}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* User footer */}
        <div className="px-3 py-3" style={{ borderTop: '1px solid rgba(212,175,55,0.08)' }}>
          <div className="flex items-center gap-2.5 mb-2.5 px-1">
            <div style={{
              width: 28, height: 28, borderRadius: 7, flexShrink: 0,
              background: 'linear-gradient(135deg, #D4AF37, #8a6010)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800, color: '#000',
            }}>
              {adminEmail ? adminEmail[0].toUpperCase() : 'A'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Administrador</div>
              <div style={{ fontSize: 9, color: 'rgba(212,175,55,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {adminEmail}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-all duration-200 group"
            style={{ border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(248,113,113,0.3)';
              (e.currentTarget as HTMLElement).style.color = '#f87171';
              (e.currentTarget as HTMLElement).style.background = 'rgba(248,113,113,0.05)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <Power size={13} />
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em' }}>ENCERRAR</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
```

- [ ] **Check AdminDashboard passes `adminEmail` to Sidebar** — open `src/pages/AdminDashboard.tsx`, find `<Sidebar` and add `adminEmail={adminEmail}` prop. The variable `adminEmail` should already exist in state; if not, derive it from the user data loaded in `useEffect`.

- [ ] **Verify build**

```bash
npm run build 2>&1 | grep -E "error|warning|built"
```

- [ ] **Commit**

```bash
git add src/components/admin/Sidebar.tsx src/pages/AdminDashboard.tsx
git commit -m "style: redesign Sidebar — glassmorphic panels, animated nav, profile footer"
```

---

## Task 4: TopBar Redesign

**Files:**
- Modify: `src/components/admin/TopBar.tsx`

- [ ] **Read the current TopBar to understand what notifications logic it uses:**

```bash
cat src/components/admin/TopBar.tsx
```

- [ ] **Replace `src/components/admin/TopBar.tsx` — keep all notification logic, replace only JSX/styles:**

```tsx
import React, { useState, useEffect } from 'react';
import { Bell, Settings, Menu, ChevronRight } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface TopBarProps {
  activeSection: string;
  adminEmail?: string;
  onMenuClick?: () => void;
}

const sectionLabels: Record<string, string> = {
  dashboard: 'Visão Geral',
  'settings-associates': 'Lista de Associados',
  crm: 'Gestão de Leads',
  'financial-records': 'Financeiro',
  agenda: 'Agenda',
  messages: 'Solicitações',
  'settings-products': 'Produtos',
  'settings-languages': 'Idiomas',
};

const TopBar: React.FC<TopBarProps> = ({ activeSection, adminEmail = '', onMenuClick }) => {
  const [notifications, setNotifications] = useState<{ id: string; service: string; userName: string }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const check = async () => {
      const today = new Date();
      const day = today.getDate();
      const { data } = await supabase
        .from('projects')
        .select('id, service, user_id, profiles:user_id (full_name), maintenance_start_date')
        .eq('maintenance_due_day', day);

      if (data) {
        const notifs = data.filter((p: any) => {
          if (!p.maintenance_start_date) return false;
          const start = new Date(p.maintenance_start_date);
          const today2 = new Date(); today2.setHours(0, 0, 0, 0);
          return start <= today2;
        }).map((p: any) => ({
          id: p.id,
          service: p.service,
          userName: (p.profiles as any)?.full_name || 'Associado',
        }));
        setNotifications(notifs);
      }
    };
    check();
  }, []);

  return (
    <header
      className="flex items-center justify-between px-5 relative z-20"
      style={{
        height: 54,
        background: 'rgba(255,255,255,0.01)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(212,175,55,0.07)',
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(212,175,55,0.1)' }}
        >
          <Menu size={16} />
        </button>
        <div style={{ width: 1, height: 16, background: 'rgba(212,175,55,0.2)' }} className="hidden md:block" />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.02em' }}>
          {sectionLabels[activeSection] || activeSection}
        </span>
        {notifications.length > 0 && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
            color: '#D4AF37', background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.2)', padding: '2px 8px', borderRadius: 20,
          }}>
            {notifications.length} MANUT. HOJE
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="flex items-center justify-center transition-all duration-200"
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${notifications.length > 0 ? 'rgba(212,175,55,0.25)' : 'rgba(212,175,55,0.1)'}`,
              color: notifications.length > 0 ? '#D4AF37' : 'rgba(212,175,55,0.5)',
              position: 'relative',
            }}
          >
            <Bell size={14} />
            {notifications.length > 0 && (
              <span style={{
                position: 'absolute', top: -3, right: -3,
                width: 14, height: 14, borderRadius: '50%',
                background: 'linear-gradient(135deg, #f0cc55, #8a6010)',
                fontSize: 8, fontWeight: 800, color: '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'badgePulse 2s ease-in-out infinite',
              }}>
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && notifications.length > 0 && (
            <div
              className="absolute right-0 mt-2 z-50"
              style={{
                width: 280, background: 'rgba(8,8,16,0.95)',
                backdropFilter: 'blur(20px)', borderRadius: 12,
                border: '1px solid rgba(212,175,55,0.15)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                animation: 'fadeUp 0.2s ease both',
              }}
            >
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#D4AF37', letterSpacing: '0.1em' }}>
                  MANUTENÇÕES HOJE
                </span>
              </div>
              {notifications.map(n => (
                <div
                  key={n.id}
                  style={{ padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212,175,55,0.05)' }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{n.service}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{n.userName}</div>
                  </div>
                  <ChevronRight size={12} style={{ color: 'rgba(212,175,55,0.4)' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, #D4AF37, #8a6010)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: '#000',
          border: '1px solid rgba(212,175,55,0.3)',
          boxShadow: '0 0 14px rgba(212,175,55,0.25)',
        }}>
          {adminEmail ? adminEmail[0].toUpperCase() : 'A'}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
```

- [ ] **Commit**

```bash
git add src/components/admin/TopBar.tsx
git commit -m "style: redesign TopBar — blur header, icon buttons, gold notification badge"
```

---

## Task 5: Login Page Redesign

**Files:**
- Modify: `src/pages/Login.tsx`

- [ ] **Read current Login to understand all form logic (email, password, rememberMe, error handling, navigation)**

- [ ] **Replace the JSX return block of `src/pages/Login.tsx` — preserve all state and handler logic unchanged, only replace the `return (...)` section:**

```tsx
// Keep all imports and all useState/useEffect/handler logic unchanged.
// Replace only the return block:

return (
  <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: '#04040a' }}>
    {/* Ambient */}
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
      <div style={{ position:'absolute', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(212,175,55,0.11) 0%, transparent 65%)', top:-250, left:-200, filter:'blur(100px)', animation:'driftA 14s ease-in-out infinite alternate' }} />
      <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(170,100,15,0.07) 0%, transparent 65%)', bottom:-150, right:50, filter:'blur(90px)', animation:'driftB 18s ease-in-out infinite alternate' }} />
    </div>

    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 w-full max-w-sm mx-4"
    >
      {/* Card */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(212,175,55,0.15)', borderRadius: 20,
        padding: '40px 36px',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.1)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Top shimmer line */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)' }} />

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #f0cc55, #8a6010)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 22, color: '#000',
            marginBottom: 14, animation: 'logoPulse 3s ease-in-out infinite',
            boxShadow: '0 8px 32px rgba(212,175,55,0.35)',
          }}>N</div>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 18, fontWeight: 700, color: '#D4AF37', letterSpacing: '0.2em', marginBottom: 4 }}>
            NEOVERTEX
          </h1>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>Acesse sua conta</p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 px-4 py-3 rounded-xl flex items-center gap-2"
            style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', fontSize: 12, color: '#f87171' }}
          >
            <span style={{ flexShrink: 0 }}>—</span> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(212,175,55,0.6)', letterSpacing: '0.12em', display:'block', marginBottom: 6 }}>
              EMAIL
            </label>
            <div className="relative">
              <Mail size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'rgba(212,175,55,0.4)', pointerEvents:'none' }} />
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="seu@email.com"
                className="input-field"
                style={{ paddingLeft: 36 }}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(212,175,55,0.6)', letterSpacing: '0.12em', display:'block', marginBottom: 6 }}>
              SENHA
            </label>
            <div className="relative">
              <Lock size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'rgba(212,175,55,0.4)', pointerEvents:'none' }} />
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••"
                className="input-field"
                style={{ paddingLeft: 36 }}
              />
            </div>
          </div>

          {/* Remember */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <div
              onClick={() => setRememberMe(!rememberMe)}
              style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                border: `1px solid ${rememberMe ? '#D4AF37' : 'rgba(255,255,255,0.15)'}`,
                background: rememberMe ? 'rgba(212,175,55,0.15)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}
            >
              {rememberMe && <Check size={10} style={{ color: '#D4AF37' }} />}
            </div>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Lembrar email</span>
          </label>

          {/* Submit */}
          <button
            type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-semibold transition-all duration-200 relative overflow-hidden"
            style={{
              marginTop: 8,
              background: loading ? 'rgba(212,175,55,0.3)' : 'linear-gradient(135deg, #D4AF37, #8a6010)',
              color: loading ? 'rgba(255,255,255,0.5)' : '#000',
              fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(212,175,55,0.3)',
              border: 'none',
            }}
          >
            {loading ? 'AUTENTICANDO...' : 'ENTRAR'}
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:20 }}>
          <a href="/" style={{ fontSize: 10, color: 'rgba(212,175,55,0.4)', letterSpacing:'0.05em', transition:'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color='#D4AF37')}
            onMouseLeave={e => (e.currentTarget.style.color='rgba(212,175,55,0.4)')}
          >
            Voltar ao site
          </a>
        </div>
      </div>
    </motion.div>
  </div>
);
```

- [ ] **Verify build**

```bash
npm run build 2>&1 | grep -E "error|built"
```

- [ ] **Commit**

```bash
git add src/pages/Login.tsx
git commit -m "style: redesign Login — glass card, ambient glow, animated entrance"
```

---

## Task 6: AdminDashboard Shell + AmbientBackground

**Files:**
- Modify: `src/pages/AdminDashboard.tsx`

- [ ] **Add AmbientBackground import and render it as the first child of the root div:**

```tsx
import AmbientBackground from '../components/AmbientBackground';
// Inside the return, as first child of the outermost div:
<AmbientBackground />
```

- [ ] **Update the outermost wrapper div style** — remove any old background-image grid pattern, set background to `#04040a`:

Find:
```tsx
<div className="min-h-screen bg-[var(--color-bg)] flex flex-row relative overflow-hidden"
```
Replace with:
```tsx
<div className="min-h-screen flex flex-row relative overflow-hidden" style={{ background: '#04040a' }}
```

- [ ] **Verify build and commit**

```bash
git add src/pages/AdminDashboard.tsx src/components/AmbientBackground.tsx
git commit -m "feat: add AmbientBackground to AdminDashboard shell"
```

---

## Task 7: DashboardView — KPI Cards + Counter Animation

**Files:**
- Modify: `src/components/admin/DashboardView.tsx`

- [ ] **Read the current DashboardView to understand props and data it receives**

- [ ] **Add animated counter hook at the top of the file (before the component):**

```tsx
import { useEffect, useRef, useState } from 'react';

function useCountUp(target: number, duration = 1600, start = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setValue(Math.round(target * ease));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, start]);
  return value;
}
```

- [ ] **Replace the JSX return of DashboardView with the glass KPI grid design:**

The component receives props like `associates`, `projects`, `financialRecords` (check current file for exact prop names). Keep all data computation logic. Replace only the `return (...)` JSX.

The new layout:
- 4-column KPI grid (glass cards with shimmer, counter animation, top gradient line)
- Metric cards: Total Associados, Projetos Ativos, Receita do Mês, Serviços Ativos
- Below: a 2-column row with project status breakdown (recharts PieChart restyled) + recent activity list
- All cards use `glass` class + `glass-top-line` pseudo + `anim-fade-up` with staggered delay

Example KPI card structure:
```tsx
<div
  className="glass glass-top-line relative overflow-hidden rounded-2xl p-5 cursor-default transition-all duration-300"
  style={{
    animationDelay: '0.1s',
    ['--tw-shadow' as string]: '0 8px 32px rgba(212,175,55,0.08)',
  }}
  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,175,55,0.28)'; }}
  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.borderColor = ''; }}
>
  <div className="anim-shimmer" />
  <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.15em', color:'rgba(212,175,55,0.55)', marginBottom:8 }}>TOTAL ASSOCIADOS</div>
  <div style={{ fontSize:28, fontWeight:800, color:'#fff', lineHeight:1 }}>{associatesCount}</div>
  <div style={{ fontSize:10, color:'var(--color-success)', marginTop:6 }}>ativos na plataforma</div>
</div>
```

- [ ] **Commit**

```bash
git add src/components/admin/DashboardView.tsx
git commit -m "style: redesign DashboardView — glass KPI cards with counter animations"
```

---

## Task 8: FinancialView — Glass Tabs + Gold Charts

**Files:**
- Modify: `src/components/admin/FinancialView.tsx`
- Modify: `src/components/admin/charts/FinancialCharts.tsx`

- [ ] **In `FinancialCharts.tsx`, update all Recharts color props to use gold palette:**

Replace any existing color strings in chart configs:
```tsx
// Bar/Line fills:
fill="#D4AF37"        // income bars
fill="rgba(212,175,55,0.15)"  // expense bars
stroke="#D4AF37"
// CartesianGrid:
stroke="rgba(212,175,55,0.06)"
// Tooltip style:
contentStyle={{ background:'rgba(8,8,16,0.95)', border:'1px solid rgba(212,175,55,0.2)', borderRadius:8, fontSize:11 }}
// Pie chart cells:
// income = '#D4AF37', expense = 'rgba(212,175,55,0.2)', other colors = '#60a5fa','#4ade80','#f87171'
```

- [ ] **In `FinancialView.tsx`, replace the tab bar JSX with glass-style tabs:**

```tsx
{/* Tab bar */}
<div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(212,175,55,0.08)', display:'inline-flex' }}>
  {(['summary','income','expense'] as const).map(tab => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      className="px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200"
      style={activeTab === tab ? {
        background:'rgba(212,175,55,0.12)', color:'#D4AF37',
        border:'1px solid rgba(212,175,55,0.2)',
        boxShadow:'0 2px 8px rgba(212,175,55,0.1)',
      } : {
        color:'rgba(255,255,255,0.4)', border:'1px solid transparent',
      }}
    >
      {tab === 'summary' ? 'Resumo' : tab === 'income' ? 'Receitas' : 'Despesas'}
    </button>
  ))}
</div>
```

- [ ] **Wrap each panel/card in FinancialView with glass class:**

Find existing card divs (`bg-[#...] border ...`) and replace their className with:
```tsx
className="glass glass-top-line relative rounded-2xl p-5 overflow-hidden"
```

- [ ] **Commit**

```bash
git add src/components/admin/FinancialView.tsx src/components/admin/charts/FinancialCharts.tsx
git commit -m "style: FinancialView glass tabs + gold Recharts palette"
```

---

## Task 9: AssociatesView + ProfileCard

**Files:**
- Modify: `src/components/admin/AssociatesView.tsx`
- Modify: `src/components/admin/ProfileCard.tsx`

- [ ] **In `ProfileCard.tsx`, replace the outer container className:**

Find the outermost card div and update to:
```tsx
className="glass glass-top-line relative rounded-2xl p-5 overflow-hidden cursor-pointer transition-all duration-300"
// Add inline event handlers for hover lift:
onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform='translateY(-4px)'; el.style.borderColor='rgba(212,175,55,0.28)'; el.style.boxShadow='0 16px 40px rgba(212,175,55,0.1)'; }}
onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform=''; el.style.borderColor=''; el.style.boxShadow=''; }}
```

- [ ] **In `ProfileCard.tsx`, update status badge styles:**

```tsx
// Active badge:
style={{ background:'rgba(74,222,128,0.1)', color:'#4ade80', border:'1px solid rgba(74,222,128,0.2)', fontSize:9, padding:'2px 8px', borderRadius:20, fontWeight:700 }}
// Inactive badge:
style={{ background:'rgba(248,113,113,0.1)', color:'#f87171', border:'1px solid rgba(248,113,113,0.2)', fontSize:9, padding:'2px 8px', borderRadius:20, fontWeight:700 }}
```

- [ ] **In `AssociatesView.tsx`, add entrance animation to the grid container:**

```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
// Each card wrapper:
style={{ animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 0.06}s both` }}
```

- [ ] **In `AssociatesView.tsx`, replace the search/filter header bar with:**

```tsx
<div className="flex gap-3 mb-6">
  <div className="relative flex-1">
    <Search size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'rgba(212,175,55,0.4)' }} />
    <input
      className="input-field" style={{ paddingLeft:36 }}
      placeholder="Buscar associado..." value={search} onChange={e => setSearch(e.target.value)}
    />
  </div>
  <button
    onClick={() => setShowCreateForm(true)}
    className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all duration-200"
    style={{ background:'linear-gradient(135deg, #D4AF37, #8a6010)', color:'#000', letterSpacing:'0.08em', boxShadow:'0 4px 16px rgba(212,175,55,0.25)' }}
  >
    <Plus size={14} /> NOVO ASSOCIADO
  </button>
</div>
```

- [ ] **Commit**

```bash
git add src/components/admin/AssociatesView.tsx src/components/admin/ProfileCard.tsx
git commit -m "style: AssociatesView + ProfileCard — glass cards with hover lift"
```

---

## Task 10: CreateAssociateForm + ProjectManager

**Files:**
- Modify: `src/components/admin/CreateAssociateForm.tsx`
- Modify: `src/components/admin/ProjectManager.tsx`

- [ ] **In both modal components, update the backdrop overlay div:**

```tsx
// Backdrop
<div className="fixed inset-0 z-40 flex items-center justify-center p-4"
  style={{ background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)' }}
>
```

- [ ] **Update the modal panel div in both:**

```tsx
<div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
  style={{
    background:'rgba(8,8,18,0.95)', backdropFilter:'blur(24px)',
    border:'1px solid rgba(212,175,55,0.15)',
    boxShadow:'0 40px 80px rgba(0,0,0,0.7)',
    animation:'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
  }}
>
  {/* Top shimmer */}
  <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.5),transparent)' }} />
```

- [ ] **Update modal header section in both:**

```tsx
<div className="flex items-center justify-between p-6 sticky top-0 z-10"
  style={{ borderBottom:'1px solid rgba(212,175,55,0.08)', background:'rgba(8,8,18,0.95)', backdropFilter:'blur(12px)' }}
>
  <h2 style={{ fontFamily:'Cinzel, serif', fontSize:14, fontWeight:700, color:'#D4AF37', letterSpacing:'0.1em' }}>
    TÍTULO DO MODAL
  </h2>
  <button onClick={onClose} style={{ color:'rgba(255,255,255,0.4)', transition:'color 0.2s' }}
    onMouseEnter={e=>(e.currentTarget.style.color='#fff')}
    onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.4)')}
  ><X size={18}/></button>
</div>
```

- [ ] **Update all submit/primary buttons in both to use gold gradient:**

```tsx
style={{ background:'linear-gradient(135deg,#D4AF37,#8a6010)', color:'#000', fontWeight:700, fontSize:12, letterSpacing:'0.1em', padding:'10px 24px', borderRadius:10, boxShadow:'0 4px 16px rgba(212,175,55,0.25)', border:'none' }}
```

- [ ] **Commit**

```bash
git add src/components/admin/CreateAssociateForm.tsx src/components/admin/ProjectManager.tsx
git commit -m "style: CreateAssociateForm + ProjectManager — glass modals with gold accents"
```

---

## Task 11: Remaining Admin Views

**Files:**
- Modify: `src/components/admin/AgendaView.tsx`
- Modify: `src/components/admin/MessagesView.tsx`
- Modify: `src/components/admin/ProductsManager.tsx`
- Modify: `src/components/admin/LanguagesManager.tsx`
- Modify: `src/components/admin/SettingsView.tsx`

For each file, apply the same pattern:

- [ ] **AgendaView** — wrap the calendar grid in a `glass rounded-2xl p-5` container; replace colored day-number circles with gold border on active; replace appointment type colors with softer tones; update the modal with the same glass modal pattern from Task 10.

- [ ] **MessagesView** — each message row:
```tsx
<div
  className="flex gap-4 p-4 rounded-xl transition-all duration-200 cursor-pointer"
  style={{
    background: msg.read ? 'transparent' : 'rgba(212,175,55,0.04)',
    border: `1px solid ${msg.read ? 'rgba(255,255,255,0.04)' : 'rgba(212,175,55,0.12)'}`,
    marginBottom: 8,
  }}
  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(212,175,55,0.06)';}}
  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background=msg.read?'transparent':'rgba(212,175,55,0.04)';}}
>
```

- [ ] **ProductsManager + LanguagesManager + SettingsView** — wrap content areas in `glass rounded-2xl p-6`; replace all `bg-[#111]`/`bg-[#0a0a0a]` inline Tailwind colors with `glass` class; replace action buttons with the gold gradient style from Task 10.

- [ ] **Commit after all 5 files:**

```bash
git add src/components/admin/AgendaView.tsx src/components/admin/MessagesView.tsx src/components/admin/ProductsManager.tsx src/components/admin/LanguagesManager.tsx src/components/admin/SettingsView.tsx
git commit -m "style: redesign AgendaView, MessagesView, ProductsManager, LanguagesManager, SettingsView"
```

---

## Task 12: AssociateDashboard

**Files:**
- Modify: `src/pages/AssociateDashboard.tsx`

- [ ] **Add AmbientBackground as first child of the root div:**

```tsx
import AmbientBackground from '../components/AmbientBackground';
// In JSX:
<AmbientBackground />
```

- [ ] **Update root div background:**
```tsx
style={{ background: '#04040a' }}
```

- [ ] **Replace all project cards** with glass style. Each project card:
```tsx
<div
  className="glass glass-top-line relative rounded-2xl p-5 overflow-hidden"
  style={{ animation:`fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${index*0.08}s both` }}
>
```

- [ ] **Update status badges** to match AdminDashboard style (colored borders, no solid backgrounds).

- [ ] **Update the Sidebar** used in AssociateDashboard — it uses a different Sidebar component (`src/components/Sidebar.tsx` not the admin one). Read that file and apply the same glass/gold treatment.

- [ ] **Commit**

```bash
git add src/pages/AssociateDashboard.tsx
git commit -m "style: AssociateDashboard — ambient background, glass cards, gold accents"
```

---

## Task 13: Remove All Emojis + Final Polish

**Files:** All component files

- [ ] **Search for any emoji usage across all TSX files:**

```bash
grep -rn --include="*.tsx" "[🎯💰🚀👥📈✅❌⚠️🔔⚙️📊💡🏢📱💼🎨🌟]" src/
```

- [ ] **For each emoji found, replace with a Lucide icon or remove:**

Common replacements:
- `💰` → remove or use `DollarSign` icon from lucide-react
- `🚀` → remove or use `Zap` icon
- `👥` → remove or use `Users` icon
- `📈` → remove or use `TrendingUp` icon
- `✅` → remove or use a colored dot/badge
- `⚠️` → remove or use `AlertTriangle` icon
- `🔔` → already replaced in TopBar with `Bell` icon

- [ ] **Check for any remaining `text-[#...]` Tailwind arbitrary colors** that should use the new CSS variables:

```bash
grep -rn --include="*.tsx" "bg-\[#" src/components/admin/ | head -20
```

Replace obvious old dark backgrounds like `bg-[#111]`, `bg-[#0a0a0a]`, `bg-[#050505]` with `glass` class where appropriate.

- [ ] **Final build verification:**

```bash
npm run build 2>&1
```
Expected: zero TypeScript errors, `✓ built in X.XXs`

- [ ] **Push to GitHub and trigger Coolify deploy:**

```bash
git add -A
git commit -m "style: final polish — remove emojis, clean up legacy color hacks"
git push origin main
```

---

## Self-Review Checklist

- [x] **CSS Foundation** (Task 1) covers all new variables, keyframes, utilities referenced by later tasks
- [x] **AmbientBackground** (Task 2) created before it's imported in Tasks 6 and 12
- [x] **Sidebar** (Task 3) uses `adminEmail` prop — Task 3 notes to update AdminDashboard to pass it
- [x] **TopBar** (Task 4) preserves all notification logic from the original
- [x] **Login** (Task 5) preserves all state/handlers, replaces only JSX
- [x] **DashboardView** (Task 7) includes the `useCountUp` hook definition before the component
- [x] **Glass class** defined in Task 1, used from Task 3 onwards — correct dependency order
- [x] **No emojis** — Task 13 explicitly handles removal
- [x] **`anim-shimmer`** CSS class defined in Task 1, used in Tasks 7+
- [x] **`glass-top-line`** uses `::before` pseudo — defined in Task 1
- [x] **TypeScript** — all JSX changes preserve existing prop types; no new props added without interface updates
- [x] **Build verified** after every task — prevents accumulation of errors
