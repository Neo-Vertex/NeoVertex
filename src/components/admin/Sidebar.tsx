import React, { useState } from 'react';
import {
  LayoutGrid, Users, CreditCard, Settings2, MessageSquare,
  CalendarDays, ChevronRight, Power, X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  { id: 'dashboard',          label: 'Visão Geral',   icon: LayoutGrid,   section: 'PRINCIPAL' },
  {
    id: 'associates-section', label: 'Associados',    icon: Users,        section: 'PRINCIPAL',
    subItems: [
      { id: 'crm',                  label: 'Gestão de Leads' },
      { id: 'settings-associates',  label: 'Lista de Associados' },
    ],
  },
  { id: 'financial-records',  label: 'Financeiro',    icon: CreditCard,   section: 'OPERAÇÕES' },
  { id: 'agenda',             label: 'Agenda',        icon: CalendarDays },
  { id: 'messages',           label: 'Solicitações',  icon: MessageSquare },
  {
    id: 'settings',           label: 'Configurações', icon: Settings2,    section: 'SISTEMA',
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

  const itemsWithSectionFlag = items.map((item, i) => ({
    ...item,
    showSection: !!item.section && items.slice(0, i).every(prev => prev.section !== item.section),
  }));

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
        className={`fixed md:sticky top-0 h-screen flex flex-col z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        style={{
          width: 240,
          background: '#07070f',
          borderRight: '1px solid rgba(212,175,55,0.08)',
        }}
      >
        {/* ── Logo ── */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <button onClick={onClose} aria-label="Fechar menu" className="absolute top-4 right-4 md:hidden" style={{ color: 'rgba(255,255,255,0.3)' }}>
            <X size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #f0cc55, #8a6010)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 15, color: '#000',
              boxShadow: '0 4px 16px rgba(212,175,55,0.25)',
            }}>N</div>
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: '#D4AF37', lineHeight: 1 }}>
                NEOVERTEX
              </div>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', marginTop: 4 }}>
                PLATAFORMA ADMIN
              </div>
            </div>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {itemsWithSectionFlag.map(item => {
            const active = isActive(item);
            const expanded = expandedMenu === item.id;

            return (
              <div key={item.id}>
                {/* Section label */}
                {item.showSection && (
                  <div style={{
                    padding: '16px 8px 6px',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <div style={{ width: 3, height: 10, borderRadius: 2, background: 'rgba(212,175,55,0.4)', flexShrink: 0 }} />
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.2em',
                      color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
                    }}>{item.section}</span>
                  </div>
                )}

                {/* Menu item */}
                <button
                  onClick={() => handleItemClick(item)}
                  aria-expanded={item.subItems ? expanded : undefined}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 10px', borderRadius: 10, marginBottom: 2,
                    transition: 'all 0.18s',
                    background: active ? 'rgba(212,175,55,0.1)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(212,175,55,0.2)' : 'transparent'}`,
                    color: active ? '#D4AF37' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer', position: 'relative',
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                      (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)';
                    }
                  }}
                >
                  {/* Active indicator */}
                  {active && (
                    <div style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: 3, height: '60%', borderRadius: '0 3px 3px 0',
                      background: 'linear-gradient(180deg, #f0cc55, #8a6010)',
                    }} />
                  )}

                  {/* Icon container */}
                  <div style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: active ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.05)'}`,
                    transition: 'all 0.18s',
                  }}>
                    <item.icon
                      size={15}
                      strokeWidth={active ? 2.2 : 1.8}
                      aria-hidden
                      style={{ color: active ? '#D4AF37' : 'rgba(255,255,255,0.4)' }}
                    />
                  </div>

                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, flex: 1, textAlign: 'left', letterSpacing: '0.01em' }}>
                    {item.label}
                  </span>

                  {/* Badge */}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span style={{
                      background: '#D4AF37', color: '#000',
                      fontSize: 9, padding: '2px 6px', borderRadius: 20, fontWeight: 800,
                      lineHeight: 1.4,
                    }}>
                      {item.badge}
                    </span>
                  )}

                  {/* Chevron */}
                  {item.subItems && (
                    <ChevronRight
                      size={13}
                      aria-hidden
                      style={{
                        transition: 'transform 0.2s',
                        transform: expanded ? 'rotate(90deg)' : 'none',
                        color: active ? '#D4AF37' : 'rgba(255,255,255,0.2)',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>

                {/* Sub-items */}
                <AnimatePresence>
                  {item.subItems && expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      style={{ overflow: 'hidden', paddingLeft: 40, marginBottom: 4 }}
                    >
                      <div style={{ borderLeft: '1px solid rgba(212,175,55,0.12)', paddingLeft: 12, paddingTop: 2, paddingBottom: 2 }}>
                        {item.subItems.map(sub => {
                          const subActive = activeSection === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => { setActiveSection(sub.id); onClose?.(); }}
                              style={{
                                width: '100%', textAlign: 'left',
                                padding: '7px 8px', borderRadius: 7, marginBottom: 1,
                                fontSize: 12,
                                color: subActive ? '#D4AF37' : 'rgba(255,255,255,0.4)',
                                background: subActive ? 'rgba(212,175,55,0.08)' : 'transparent',
                                fontWeight: subActive ? 600 : 400,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                transition: 'all 0.15s',
                              }}
                            >
                              <div style={{
                                width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                                background: subActive ? '#D4AF37' : 'rgba(255,255,255,0.2)',
                              }} />
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

        {/* ── User footer ── */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 10, marginBottom: 8,
            background: 'rgba(255,255,255,0.03)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9, flexShrink: 0,
              background: 'linear-gradient(135deg, #D4AF37, #8a6010)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 800, color: '#000',
            }}>
              {adminEmail ? adminEmail[0].toUpperCase() : 'A'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.2 }}>Administrador</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                {adminEmail}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-danger w-full"
            style={{ fontSize: 11, letterSpacing: '0.08em', gap: 6 }}
          >
            <Power size={14} aria-hidden />
            Encerrar Sessão
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
