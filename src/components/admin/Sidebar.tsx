import React, { useState } from 'react';
import {
  LayoutGrid, Users, CreditCard, Settings2, MessageSquare,
  CalendarDays, ChevronDown, Power, X,
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
          <button onClick={onClose} aria-label="Fechar menu" className="absolute top-4 right-4 md:hidden text-white/40 hover:text-white">
            <X size={18} aria-hidden={true} />
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
          {itemsWithSectionFlag.map(item => {
            const active = isActive(item);
            const expanded = expandedMenu === item.id;

            return (
              <div key={item.id}>
                {item.showSection && (
                  <div style={{
                    fontSize: 9, letterSpacing: '0.18em', fontWeight: 700,
                    color: 'rgba(212,175,55,0.4)', padding: '14px 8px 5px',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <div style={{ flex: 1, height: 1, background: 'rgba(212,175,55,0.08)' }} />
                    {item.section}
                    <div style={{ flex: 1, height: 1, background: 'rgba(212,175,55,0.08)' }} />
                  </div>
                )}

                <button
                  onClick={() => handleItemClick(item)}
                  aria-expanded={item.subItems ? expanded : undefined}
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
                    size={16}
                    strokeWidth={active ? 2.5 : 1.8}
                    aria-hidden={true}
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
                      aria-hidden={true}
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
            className="btn btn-danger w-full"
            style={{ fontSize: 10, letterSpacing: '0.1em', padding: '8px 12px' }}
          >
            <Power size={13} aria-hidden={true} />
            ENCERRAR
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
