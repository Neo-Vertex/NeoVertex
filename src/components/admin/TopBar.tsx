import React, { useState, useEffect } from 'react';
import { Bell, Menu } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface TopBarProps {
    activeSection: string;
    adminEmail?: string;
    onMenuClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ activeSection, adminEmail = '', onMenuClick }) => {
    const [notifications, setNotifications] = useState<{ id: string, service: string, userName: string }[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const checkNotifications = async () => {
            const today = new Date();
            const day = today.getDate();
            const { data } = await supabase
                .from('projects')
                .select(`
                    id,
                    service,
                    user_id,
                    profiles:user_id (full_name),
                    maintenance_start_date
                `)
                .eq('maintenance_due_day', day);

            if (data) {
                const activeNotifs = data.filter(p => {
                    if (!p.maintenance_start_date) return false;
                    const startDate = new Date(p.maintenance_start_date);
                    // Check if maintenance has started (start date is today or in the past)
                    const todayDate = new Date();
                    todayDate.setHours(0, 0, 0, 0);
                    return startDate <= todayDate;
                }).map((p: any) => ({
                    id: p.id,
                    service: p.service,
                    userName: p.profiles?.full_name || 'Associado'
                }));
                setNotifications(activeNotifs);
            }
        };

        checkNotifications();
        // Set up interval to check daily or just on component mount is fine for now
    }, []);

    return (
        <header className="relative z-30 h-20 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center px-4 md:px-8 shrink-0">
            <div className="flex flex-col">
                <div className="flex items-center gap-3">
                    {onMenuClick && (
                        <button onClick={onMenuClick} className="md:hidden text-white">
                            <Menu size={24} />
                        </button>
                    )}
                    <h2 className="text-xl md:text-2xl font-bold text-white text-liquid-gold truncate">
                        {activeSection === 'dashboard' && 'Visão Geral'}
                        {activeSection === 'associates' && 'Controle de Associados'}
                        {activeSection === 'create-associate' && 'Criar Novo Associado'}
                        {activeSection === 'financial' && 'Controle Financeiro'}
                        {activeSection === 'settings' && 'Configurações do Sistema'}
                        {activeSection === 'messages' && 'Solicitações'}
                    </h2>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] hidden md:block">
                    {activeSection === 'dashboard' && 'Bem-vindo ao painel administrativo.'}
                    {activeSection === 'associates' && 'Gerencie projetos e permissões.'}
                    {activeSection === 'create-associate' && 'Cadastre novos membros e parceiros.'}
                    {activeSection === 'financial' && 'Acompanhe receitas e despesas.'}
                    {activeSection === 'settings' && 'Ajuste parâmetros globais e colaborações.'}
                    {activeSection === 'messages' && 'Gerencie solicitações de contato.'}
                </p>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2 text-[var(--color-text-muted)] hover:text-white transition-colors relative"
                    >
                        <Bell size={20} />
                        {notifications.length > 0 && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-80 bg-[#1a1a1a] border border-[var(--color-primary)] rounded-lg shadow-xl z-50 overflow-hidden">
                            <div className="p-3 border-b border-white/10">
                                <h4 className="text-sm font-bold text-white">Notificações</h4>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(notif => (
                                        <div key={notif.id} className="p-3 hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors">
                                            <p className="text-xs text-[var(--color-primary)] font-bold mb-1">Vencimento Hoje</p>
                                            <p className="text-sm text-white mb-0.5">Mensalidade: {notif.service}</p>
                                            <p className="text-xs text-[var(--color-text-muted)]">{notif.userName}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-xs text-[var(--color-text-muted)]">
                                        Nenhuma notificação hoje.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-white">Administrador</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{adminEmail || 'Carregando...'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                    {(adminEmail && adminEmail.length > 0) ? adminEmail.charAt(0).toUpperCase() : 'A'}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
