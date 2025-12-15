import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X } from 'lucide-react';

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
    isOpen?: boolean;
    onClose?: () => void;
}

/**
 * Sidebar Component
 * 
 * A reusable sidebar navigation component.
 * Supports configurable menu items, active state highlighting, badges, and user info display.
 * Designed with a glassmorphism aesthetic.
 */
const Sidebar: React.FC<SidebarProps> = ({ title, logo, menuItems, activeSection, onNavigate, onLogout, userEmail, isOpen, onClose }) => {
    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            <motion.aside
                initial={false}
                className={`
                    fixed md:relative z-50 
                    h-screen
                    w-[280px]
                    bg-[#0a0a0a] 
                    border-r border-[rgba(255,255,255,0.05)]
                    flex flex-col
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                {/* Mobile Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-white/50 hover:text-white md:hidden z-50"
                >
                    <X size={24} />
                </button>

                {/* Header / Logo */}
                <div className="p-8 border-b border-[rgba(255,255,255,0.05)] flex flex-col items-center">
                    {logo ? (
                        <img src={logo} alt="Logo" className="h-10 mb-4 object-contain" />
                    ) : (
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-primary)] to-[#fff] bg-clip-text text-transparent font-heading">
                            NEOVERTEX
                        </h2>
                    )}
                    {title && !logo && <span className="text-xs tracking-[0.2em] text-[var(--color-text-muted)]">{title}</span>}
                    {userEmail && <p className="text-xs text-[var(--color-text-muted)] mt-2">{userEmail}</p>}
                </div>

                {/* Menu Items */}
                <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = activeSection === item.id;
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onNavigate(item.id);
                                    if (onClose) onClose();
                                }}
                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${isActive
                                    ? 'bg-[rgba(212,175,55,0.1)] text-[var(--color-primary)] font-semibold'
                                    : 'text-[#888] hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                {/* Icon */}
                                <Icon size={20} className={isActive ? 'text-[var(--color-primary)]' : 'text-current'} />

                                {/* Label */}
                                <span className="text-base tracking-wide">
                                    {item.label}
                                </span>

                                {/* Badge */}
                                {item.badge && item.badge > 0 && (
                                    <span className="absolute right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                                        {item.badge}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-[rgba(255,255,255,0.05)]">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Sair</span>
                    </button>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
