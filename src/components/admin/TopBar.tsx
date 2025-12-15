import React from 'react';

interface TopBarProps {
    activeSection: string;
    adminEmail: string;
}

const TopBar: React.FC<TopBarProps> = ({ activeSection, adminEmail }) => {
    return (
        <header className="h-20 bg-[rgba(0,0,0,0.2)] backdrop-blur-sm border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center px-8 shrink-0">
            <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-white text-liquid-gold">
                    {activeSection === 'dashboard' && 'Visão Geral'}
                    {activeSection === 'associates' && 'Controle de Associados'}
                    {activeSection === 'create-associate' && 'Criar Novo Associado'}
                    {activeSection === 'financial' && 'Controle Financeiro'}
                    {activeSection === 'settings' && 'Configurações do Sistema'}
                </h2>
                <p className="text-xs text-[var(--color-text-muted)]">
                    {activeSection === 'dashboard' && 'Bem-vindo ao painel administrativo.'}
                    {activeSection === 'associates' && 'Gerencie projetos e permissões.'}
                    {activeSection === 'create-associate' && 'Cadastre novos membros e parceiros.'}
                    {activeSection === 'financial' && 'Acompanhe receitas e despesas.'}
                    {activeSection === 'settings' && 'Ajuste parâmetros globais e colaborações.'}
                </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-white">Administrador</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{adminEmail}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                    {adminEmail.charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    );
};

export default TopBar;
