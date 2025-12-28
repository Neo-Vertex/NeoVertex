import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X, ChevronDown, ChevronRight } from 'lucide-react';
import React, { useState } from 'react';

export interface MenuItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
    children?: MenuItem[];
}

interface SidebarProps {
    title?: string;
    logo?: string;
    menuItems: MenuItem[];
    activeSection: string;
    onNavigate: (id: string) => void;
    onLogout: () => void;
    userEmail?: string;
    userProfile?: {
        name: string;
        role: string;
        avatar?: string;
    };
    isOpen?: boolean;
    onClose?: () => void;
}

/**
 * Sidebar Component
 * 
 * A reusable sidebar navigation component.
 * Supports configurable menu items, active state highlighting, badges, user info display, AND nested submenus.
 * Designed with a glassmorphism aesthetic.
 */
const Sidebar: React.FC<SidebarProps> = ({ title, logo, menuItems, activeSection, onNavigate, onLogout, userEmail, userProfile, isOpen, onClose }) => {
    // State to track expanded submenus
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleExpand = (id: string, event: React.MouseEvent) => {
        event.stopPropagation();
        // If sidebar is collapsed, expand it first
        if (isCollapsed) {
            setIsCollapsed(false);
            setExpandedItems([id]);
            return;
        }
        setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Auto-expand parents of active section
    React.useEffect(() => {
        const findParents = (items: MenuItem[], targetId: string): string[] => {
            for (const item of items) {
                if (item.children) {
                    if (item.children.some(child => child.id === targetId)) {
                        return [item.id];
                    }
                    const deepParents = findParents(item.children, targetId);
                    if (deepParents.length > 0) {
                        return [item.id, ...deepParents];
                    }
                }
            }
            return [];
        };

        const parents = findParents(menuItems, activeSection);
        if (parents.length > 0) {
            setExpandedItems(prev => {
                const missing = parents.filter(p => !prev.includes(p));
                return missing.length > 0 ? [...prev, ...missing] : prev;
            });
        }
    }, [activeSection, menuItems]);

    const renderMenuItem = (item: MenuItem, depth: number = 0) => {
        const isActive = activeSection === item.id;
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.id);
        const Icon = item.icon;

        return (
            <div key={item.id} className="w-full">
                <button
                    onClick={(e) => {
                        if (hasChildren) {
                            toggleExpand(item.id, e);
                        } else {
                            onNavigate(item.id);
                            if (onClose) onClose();
                        }
                    }}
                    className={`
                        w-full flex items-center 
                        ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'} 
                        py-3.5 rounded-xl transition-all duration-300 group relative mb-1
                        ${isActive
                            ? 'bg-gradient-to-r from-[rgba(212,175,55,0.15)] to-transparent text-[var(--color-primary)] font-semibold shadow-[inset_2px_0_0_0_#d4af37]'
                            : 'text-[#888] hover:bg-white/5 hover:text-white'}
                        ${depth > 0 && !isCollapsed ? 'pl-8' : ''}
                    `}
                    title={isCollapsed ? item.label : undefined}
                >
                    <div className={`flex items-center gap-4 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                        <Icon size={20} className={`min-w-[20px] transition-colors duration-300 ${isActive ? 'text-[var(--color-primary)] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' : 'text-current group-hover:text-white'}`} />

                        {!isCollapsed && (
                            <span className="text-base tracking-wide whitespace-nowrap overflow-hidden text-ellipsis opacity-100 transition-opacity duration-300">
                                {item.label}
                            </span>
                        )}
                    </div>

                    {!isCollapsed && (
                        <div className="flex items-center gap-2">
                            {item.badge && item.badge > 0 && (
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                                    {item.badge}
                                </span>
                            )}
                            {hasChildren && (
                                <span className="text-white/30 group-hover:text-white transition-colors">
                                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </span>
                            )}
                        </div>
                    )}
                </button>

                <AnimatePresence>
                    {!isCollapsed && hasChildren && isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-black/20 rounded-b-xl mb-1 mx-2"
                        >
                            <div className="py-1">
                                {item.children!.map(child => renderMenuItem(child, depth + 1))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    // Mobile detection
    const [isMobile, setIsMobile] = useState(false);

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <>
            {/* Mobile Overlay (Hidden on Desktop) */}
            <AnimatePresence>
                {isOpen && isMobile && (
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
                animate={{
                    width: isMobile ? 280 : (isOpen ? (isCollapsed ? 80 : 280) : 0),
                    x: isMobile ? (isOpen ? 0 : '-100%') : 0
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`
                    fixed md:relative z-50 
                    h-screen
                    bg-[#0a0a0a] 
                    border-r border-[rgba(255,255,255,0.05)]
                    flex flex-col
                    shadow-[5px_0_30px_rgba(0,0,0,0.5)]
                    overflow-hidden
                `}
            >
                {/* Close Button (All Screens) */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-white/50 hover:text-white z-50"
                >
                    <X size={24} />
                </button>

                {/* Header / Logo */}
                <div className={`p-6 border-b border-[rgba(255,255,255,0.05)] flex flex-col items-center transition-all duration-300 ${isCollapsed ? 'py-6' : ''}`}>
                    {/* User Profile Section (Priority) */}
                    {userProfile ? (
                        <div className="flex flex-col items-center mt-16">
                            <motion.div
                                layout
                                className={`relative rounded-full border-2 border-[var(--color-primary)] overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'w-24 h-24 mb-3'}`}
                            >
                                <img
                                    src={userProfile.avatar || 'https://via.placeholder.com/150'}
                                    alt={userProfile.name}
                                    className="w-full h-full object-cover object-top"
                                />
                            </motion.div>

                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-center"
                                >
                                    <h3 className="text-white font-bold text-lg">{userProfile.name}</h3>
                                    <p className="text-[var(--color-primary)] text-sm font-medium">{userProfile.role}</p>
                                    {userEmail && <p className="text-[var(--color-text-muted)] text-xs mt-1">{userEmail}</p>}
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        // Fallback to Logo/Title if no profile
                        <>
                            {logo ? (
                                <motion.img
                                    layout
                                    src={logo}
                                    alt="Logo"
                                    className={`object-contain transition-all duration-300 ${isCollapsed ? 'h-8' : 'h-10 mb-4'}`}
                                />
                            ) : (
                                <motion.h2
                                    layout
                                    className={`font-bold bg-gradient-to-r from-[var(--color-primary)] to-[#fff] bg-clip-text text-transparent font-heading transition-all duration-300 ${isCollapsed ? 'text-xl' : 'text-2xl'}`}
                                >
                                    {isCollapsed ? 'NV' : 'NEOVERTEX'}
                                </motion.h2>
                            )}

                            {!isCollapsed && title && !logo && (
                                <span className="text-xs tracking-[0.2em] text-[var(--color-text-muted)]">{title}</span>
                            )}
                        </>
                    )}
                </div>

                {/* Menu Items */}
                <div className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'} py-8 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent`}>
                    {menuItems.map(item => renderMenuItem(item))}
                </div>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-[rgba(255,255,255,0.05)]">
                    <button
                        onClick={onLogout}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-4 px-4'} py-3.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200`}
                        title="Sair"
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span className="font-medium">Sair</span>}
                    </button>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
