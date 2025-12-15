import React from 'react';
import { LayoutDashboard, Users, UserPlus, Settings, LogOut, DollarSign } from 'lucide-react';
import Logo from '../Logo';

interface SidebarProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
    handleLogout: () => void;
}

const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'associates', label: 'Associados', icon: Users },
    { id: 'create-associate', label: 'Criar Associado', icon: UserPlus },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'settings', label: 'Configurações', icon: Settings },
];

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, handleLogout }) => {
    return (
        <aside className="w-72 bg-gradient-to-b from-black via-[#0a0a0a] to-black border-r border-[rgba(212,175,55,0.2)] flex flex-col z-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)] h-screen sticky top-0">
            <div className="p-8 border-b border-[rgba(255,255,255,0.05)] flex flex-col items-center gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50"></div>
                <div className="scale-90 origin-center hover:scale-100 transition-transform duration-500">
                    <Logo />
                </div>
                <div className="text-center">
                    <h2 className="text-xs font-bold text-[var(--color-primary)] tracking-[0.2em] uppercase opacity-80">Admin Console</h2>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${activeSection === item.id
                            ? 'bg-[rgba(212,175,55,0.1)] text-white shadow-[0_0_20px_rgba(212,175,55,0.1)] translate-x-1'
                            : 'text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.03)] hover:pl-7'
                            }`}
                    >
                        {activeSection === item.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]"></div>
                        )}
                        <item.icon size={22} className={`transition-colors duration-300 ${activeSection === item.id ? 'text-[var(--color-primary)] drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]' : 'group-hover:text-[var(--color-primary-light)]'}`} />
                        <span className={`font-medium tracking-wide ${activeSection === item.id ? 'text-white' : ''}`}>{item.label}</span>

                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[rgba(212,175,55,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </button>
                ))}
            </nav>

            <div className="p-6 border-t border-[rgba(255,255,255,0.05)] bg-black/20">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-6 py-4 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 group border border-transparent hover:border-red-500/20"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Sair do Sistema</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
