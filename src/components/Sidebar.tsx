import React from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';

interface MenuItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
}

interface SidebarProps {
    title?: string;
    logo?: string;
    menuItems: MenuItem[];
    activeSection: string;
    onNavigate: (id: string) => void;
    onLogout: () => void;
    userEmail?: string;
}

/**
 * Sidebar Component
 * 
 * A reusable sidebar navigation component.
 * Supports configurable menu items, active state highlighting, badges, and user info display.
 * Designed with a glassmorphism aesthetic.
 */
const Sidebar: React.FC<SidebarProps> = ({ title, logo, menuItems, activeSection, onNavigate, onLogout, userEmail }) => {
    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="h-[95vh] my-auto ml-6 w-72 bg-[#050505] rounded-[2.5rem] flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-[rgba(255,255,255,0.03)] relative z-20 overflow-hidden"
        >
            {/* Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[rgba(212,175,55,0.03)] to-transparent pointer-events-none" />

            {/* Header / Logo */}
            <div className="p-8 pb-4 flex flex-col items-center text-center">
                {logo && <img src={logo} alt="Logo" className="h-12 mb-4 object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.3)]" />}
                {title && <h2 className="text-xl font-bold text-white tracking-wider">{title}</h2>}
                {userEmail && <p className="text-xs text-[var(--color-text-muted)] mt-2">{userEmail}</p>}
            </div>

            {/* Menu Items */}
            <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
                {menuItems.map((item) => {
                    const isActive = activeSection === item.id;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isActive
                                ? 'text-[var(--color-primary)]'
                                : 'text-[var(--color-text-muted)] hover:text-white'
                                }`}
                        >
                            {/* Active Background Indicator */}
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-[rgba(212,175,55,0.08)]"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}

                            {/* Icon */}
                            <div className={`relative z-10 p-2 rounded-xl transition-all duration-300 ${isActive
                                ? 'bg-[rgba(212,175,55,0.1)] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                                : 'bg-transparent group-hover:bg-white/5'
                                }`}>
                                <Icon size={20} />
                            </div>

                            {/* Label */}
                            <span className={`relative z-10 font-medium text-base tracking-wide ${isActive ? 'font-bold' : ''}`}>
                                {item.label}
                            </span>

                            {/* Badge */}
                            {item.badge && item.badge > 0 && (
                                <span className="absolute right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                                    {item.badge}
                                </span>
                            )}

                            {/* Active Dot Indicator (Right side) - Only show if no badge */}
                            {isActive && (!item.badge || item.badge === 0) && (
                                <motion.div
                                    layoutId="activeDot"
                                    className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shadow-[0_0_10px_var(--color-primary)]"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Footer / Logout */}
            <div className="p-6 mt-auto">
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 group"
                >
                    <div className="p-2 rounded-xl bg-red-500/5 group-hover:bg-red-500/20 transition-colors">
                        <LogOut size={20} />
                    </div>
                    <span className="font-medium">Sair</span>
                </button>
            </div>
        </motion.div>
    );
};

export default Sidebar;
