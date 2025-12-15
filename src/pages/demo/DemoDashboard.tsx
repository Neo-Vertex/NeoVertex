import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    DollarSign,
    Settings,
    Menu,
    X,
    Bell,
    Search,
    Activity,
    LogOut
} from 'lucide-react';

const DemoDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const sidebarItems = [
        { icon: LayoutDashboard, label: t('demo.dashboard.sidebar.dashboard'), active: true },
        { icon: Users, label: t('demo.dashboard.sidebar.clients'), active: false },
        { icon: Briefcase, label: t('demo.dashboard.sidebar.projects'), active: false },
        { icon: DollarSign, label: t('demo.dashboard.sidebar.financial'), active: false },
        { icon: Settings, label: t('demo.dashboard.sidebar.settings'), active: false },
    ];

    const kpiCards = [
        { label: t('demo.dashboard.kpi.revenue'), value: t('demo.dashboard.kpi.revenue_value'), change: '+15%', color: '#00EAFF' },
        { label: t('demo.dashboard.kpi.clients'), value: '142', change: '+8%', color: '#00BFFF' },
        { label: t('demo.dashboard.kpi.projects'), value: '28', change: '+12%', color: '#9D00FF' },
        { label: t('demo.dashboard.kpi.satisfaction'), value: '98%', change: '+2%', color: '#FFD700' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#050505', color: '#fff', fontFamily: 'Inter, sans-serif' }}>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40
                    }}
                    className="lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside style={{
                width: '260px',
                backgroundColor: '#0a0a0a',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: isSidebarOpen ? 0 : '-260px',
                transition: 'left 0.3s ease',
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column'
            }} className="lg:static lg:block">

                {/* Logo Area */}
                <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontFamily: 'Cinzel, serif', fontWeight: 'bold', fontSize: '1.5rem', background: 'linear-gradient(90deg, #00EAFF, #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        NEOVERTEX
                    </h2>
                    <button onClick={toggleSidebar} className="lg:hidden" style={{ color: '#fff', background: 'none', border: 'none' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <nav style={{ padding: '2rem 1rem', flex: 1 }}>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {sidebarItems.map((item, index) => (
                            <li key={index}>
                                <a href="#" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem',
                                    borderRadius: '0.75rem',
                                    backgroundColor: item.active ? 'rgba(0, 234, 255, 0.1)' : 'transparent',
                                    color: item.active ? '#00EAFF' : '#888',
                                    textDecoration: 'none',
                                    fontWeight: item.active ? 600 : 400,
                                    transition: 'all 0.2s'
                                }}>
                                    <item.icon size={20} />
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => navigate('/demo/login')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '1rem',
                            width: '100%',
                            marginTop: '0.5rem',
                            borderRadius: '0.75rem',
                            backgroundColor: 'transparent',
                            color: '#ff4444',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 400,
                            transition: 'all 0.2s',
                            textAlign: 'left'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 68, 68, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <LogOut size={20} />
                        {t('demo.dashboard.sidebar.logout')}
                    </button>
                </nav>

                {/* User Profile */}
                <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #00EAFF, #0080FF)' }} />
                        <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t('demo.dashboard.profile.name')}</p>
                            <p style={{ fontSize: '0.75rem', color: '#666' }}>{t('demo.dashboard.profile.role')}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, marginLeft: '0' }} className="lg:ml-0">

                {/* Header */}
                <header style={{
                    height: '80px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 2rem',
                    backgroundColor: 'rgba(5, 5, 5, 0.8)',
                    backdropFilter: 'blur(10px)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 30
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={toggleSidebar} className="lg:hidden" style={{ color: '#fff', background: 'none', border: 'none' }}>
                            <Menu size={24} />
                        </button>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{t('demo.dashboard.header.title')}</h1>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ position: 'relative', display: 'none' }} className="md:block">
                            <Search size={18} style={{ position: 'absolute', top: '10px', left: '10px', color: '#666' }} />
                            <input
                                type="text"
                                placeholder={t('demo.dashboard.header.search')}
                                style={{
                                    background: '#111',
                                    border: '1px solid #222',
                                    borderRadius: '0.5rem',
                                    padding: '8px 8px 8px 36px',
                                    color: '#fff',
                                    width: '250px'
                                }}
                            />
                        </div>
                        <button style={{ background: 'none', border: 'none', color: '#fff', position: 'relative' }}>
                            <Bell size={20} />
                            <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', backgroundColor: '#00EAFF', borderRadius: '50%' }} />
                        </button>
                    </div>
                </header>

                {/* Content Body */}
                <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>

                    {/* KPI Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        {kpiCards.map((card, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                style={{
                                    background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    borderRadius: '1rem',
                                    padding: '1.5rem'
                                }}
                            >
                                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{card.label}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <h3 style={{ fontSize: '1.8rem', fontWeight: 600, color: '#fff' }}>{card.value}</h3>
                                    <span style={{
                                        color: card.color,
                                        backgroundColor: `${card.color}15`,
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.8rem',
                                        fontWeight: 600
                                    }}>
                                        {card.change}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Chart Area Simulation */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            background: '#0a0a0a',
                            border: '1px solid rgba(255,255,255,0.05)',
                            borderRadius: '1rem',
                            padding: '2rem',
                            minHeight: '400px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            gap: '1.5rem',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Matrix Rain Effect styled background specifically for this card */}
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'radial-gradient(circle at center, rgba(0, 234, 255, 0.03), transparent 60%)',
                            pointerEvents: 'none'
                        }} />

                        <Activity size={64} style={{ color: '#00EAFF', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '1.5rem', color: '#fff', textAlign: 'center' }}>
                            {t('demo.dashboard.chart.title')}
                        </h3>
                        <p style={{ color: '#666', maxWidth: '500px', textAlign: 'center' }}>
                            {t('demo.dashboard.chart.description')}
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: '1rem',
                            marginTop: '1rem',
                            alignItems: 'flex-end',
                            height: '100px'
                        }}>
                            {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                    style={{
                                        width: '30px',
                                        background: `linear-gradient(to top, #00EAFF, rgba(0, 234, 255, 0.2))`,
                                        borderRadius: '4px 4px 0 0',
                                        opacity: 0.8
                                    }}
                                />
                            ))}
                        </div>

                    </motion.div>

                </div>
            </main>
        </div>
    );
};

export default DemoDashboard;
