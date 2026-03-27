import React, { useState, useEffect } from 'react';
import { Bell, Menu, ChevronRight } from 'lucide-react';
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
          aria-label="Abrir menu"
          className="md:hidden p-1.5 rounded-lg transition-colors"
          style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(212,175,55,0.1)' }}
        >
          <Menu size={16} aria-hidden={true} />
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
            aria-label={`Notificações${notifications.length > 0 ? ` — ${notifications.length} manutenções hoje` : ''}`}
            aria-expanded={showNotifications}
            className="flex items-center justify-center transition-all duration-200"
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${notifications.length > 0 ? 'rgba(212,175,55,0.25)' : 'rgba(212,175,55,0.1)'}`,
              color: notifications.length > 0 ? '#D4AF37' : 'rgba(212,175,55,0.5)',
              position: 'relative',
            }}
          >
            <Bell size={14} aria-hidden={true} />
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
                  <ChevronRight size={12} aria-hidden={true} style={{ color: 'rgba(212,175,55,0.4)' }} />
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
