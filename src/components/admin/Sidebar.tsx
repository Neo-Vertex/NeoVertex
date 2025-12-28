import React, { useState } from 'react';
import { LayoutGrid, Users, DollarSign, Settings, MessageSquare, Briefcase, ChevronDown, LogOut, Power, CreditCard, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../Logo';

interface SidebarProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
    handleLogout: () => void;
    unreadCount?: number;
    isOpen?: boolean; // Mobile state
    onClose?: () => void;
}

interface MenuItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
    subItems?: { id: string; label: string }[];
}

const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'VISÃO GERAL', icon: LayoutGrid },
    {
        id: 'financial',
        label: 'FINANCEIRO',
        icon: CreditCard,
        subItems: [
            { id: 'financial-dashboard', label: 'DASHBOARD' },
            { id: 'financial-records', label: 'REGISTROS' }
        ]
    },
    {
        id: 'settings',
        label: 'CONFIGURAÇÃO',
        icon: Settings2,
        subItems: [
            { id: 'settings-associates', label: 'ASSOCIADOS' },
            { id: 'settings-products', label: 'PRODUTOS' },
            { id: 'settings-languages', label: 'IDIOMAS' }
        ]
    },
    { id: 'messages', label: 'SOLICITAÇÕES', icon: MessageSquare }
];

const Sidebar: React.FC<SidebarProps> = ({ activeSection, setActiveSection, handleLogout, unreadCount = 0, isOpen = true, onClose }) => {
    const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

    const toggleMenu = (menuId: string) => {
        setExpandedMenu(expandedMenu === menuId ? null : menuId);
    };

    const handleItemClick = (item: MenuItem) => {
        if (item.subItems) {
            toggleMenu(item.id);
        } else {
            setActiveSection(item.id);
            if (onClose) onClose();
        }
    };

    // Update menu items with dynamic badges
    const items = menuItems.map(item => item.id === 'messages' ? { ...item, badge: unreadCount } : item);

    return (
        <aside className={`fixed md:sticky top-0 h-screen w-80 bg-[#050505] tech-panel border-r border-[#222] flex flex-col z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            {/* Header */}
            <div className="p-8 border-b border-[#222] flex flex-col items-center gap-4 relative">
                <div className="scale-90 transition-transform duration-500 hover:scale-100 filter drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]">
                    <Logo />
                </div>
                <div className="text-center">
                    <h2 className="text-[10px] font-mono font-bold text-[var(--color-primary)] tracking-[0.3em] uppercase">
                        System Control
                    </h2>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                {items.map(item => {
                    const isActive = activeSection === item.id || (item.subItems && item.subItems.some(sub => sub.id === activeSection));
                    const isExpanded = expandedMenu === item.id;

                    return (
                        <div key={item.id} className="overflow-hidden">
                            <button
                                onClick={() => handleItemClick(item)}
                                className={`w-full flex items-center justify-between px-6 py-4 rounded-sm transition-all duration-200 group relative border-l-2
                                    ${isActive
                                        ? 'bg-[#111] border-[var(--color-primary)] text-white'
                                        : 'border-transparent text-gray-500 hover:text-white hover:bg-[#0a0a0a] hover:border-[#333]'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon
                                        size={20}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={`transition-colors duration-300 ${isActive ? 'text-[var(--color-primary)]' : 'group-hover:text-white'}`}
                                    />
                                    <span className="text-xs font-bold tracking-widest font-mono uppercase">
                                        {item.label}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_5px_rgba(220,38,38,0.5)]">
                                            {item.badge}
                                        </span>
                                    )}
                                    {item.subItems && (
                                        <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[var(--color-primary)]' : ''}`} />
                                    )}
                                </div>

                                {/* Active Indicator for non-nested */}
                                {isActive && !item.subItems && (
                                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shadow-[0_0_8px_var(--color-primary)] animate-pulse"></div>
                                )}
                            </button>

                            {/* Submenu */}
                            <AnimatePresence>
                                {item.subItems && isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-[#080808] border-l border-[#222] ml-6 my-1"
                                    >
                                        {item.subItems.map(subItem => {
                                            const isSubActive = activeSection === subItem.id;
                                            return (
                                                <button
                                                    key={subItem.id}
                                                    onClick={() => {
                                                        setActiveSection(subItem.id);
                                                        if (onClose) onClose();
                                                    }}
                                                    className={`w-full text-left pl-6 pr-4 py-3 text-[11px] font-mono tracking-wider transition-colors border-l-2
                                                        ${isSubActive
                                                            ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[rgba(212,175,55,0.05)]'
                                                            : 'border-transparent text-gray-500 hover:text-white hover:border-[#444]'
                                                        }`}
                                                >
                                                    {subItem.label}
                                                </button>
                                            );
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-[#222] bg-black/40">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-sm border border-[#333] hover:border-red-900/50 hover:bg-red-950/10 text-gray-500 hover:text-red-400 transition-all duration-300 group"
                >
                    <Power size={18} className="group-hover:text-red-500 transition-colors" />
                    <span className="text-xs font-bold tracking-widest font-mono group-hover:text-red-400">ENCERRAR</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
