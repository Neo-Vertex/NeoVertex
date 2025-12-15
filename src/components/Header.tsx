import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import Button from './Button';
import { Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { services } from '../data/services';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [themeColor, setThemeColor] = useState('var(--color-primary)'); // Default Gold

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Determine theme color based on route
        const path = location.pathname;
        if (path.includes('/services/')) {
            const slug = path.split('/').pop();
            const service = services.find(s => s.slug === slug);
            if (service) {
                setThemeColor(service.theme.primary);
                return;
            }
        }
        setThemeColor('var(--color-primary)');
    }, [location]);

    const navLinks = [
        { name: t('header.home') || 'Início', href: '/' },
        { name: t('header.solutions'), href: '#services' },
        { name: t('header.differentials'), href: '#why-us' },
        { name: t('header.contact'), href: '#contact' },
    ];

    return (
        <header
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                transition: 'all 0.3s ease',
                backgroundColor: isScrolled ? 'rgba(0,0,0,0.8)' : 'transparent',
                backdropFilter: isScrolled ? 'blur(10px)' : 'none',
                borderBottom: isScrolled ? `1px solid ${themeColor}40` : 'none',
                padding: isScrolled ? '1rem 0' : '2rem 0'
            }}
        >
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '0 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '100%'
            }}>
                <div style={{ zIndex: 20, flexShrink: 0, cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <Logo />
                </div>

                {/* Desktop Nav - Flexbox Centered */}
                <nav className="hidden lg:flex flex-1 justify-center items-center gap-20">
                    {navLinks.map((link) => {
                        if (link.href === '#services') {
                            return (
                                <div key={link.name} className="relative group/dropdown">
                                    <button
                                        className="nav-link group"
                                        style={{
                                            color: 'var(--color-text)',
                                            fontSize: '1rem',
                                            fontWeight: 500,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.1em',
                                            padding: '0.5rem 0',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        <span className="transition-colors duration-300 group-hover:text-primary">
                                            {link.name}
                                        </span>
                                    </button>

                                    {/* Dropdown Menu */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all duration-300 transform group-hover/dropdown:translate-y-0 translate-y-2">
                                        <div style={{
                                            backgroundColor: 'rgba(10, 10, 10, 0.95)',
                                            backdropFilter: 'blur(20px)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '1rem',
                                            padding: '1rem',
                                            minWidth: '260px',
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.5rem'
                                        }}>
                                            {services.map((service) => (
                                                <div
                                                    key={service.id}
                                                    onClick={() => navigate(`/services/${service.slug}`)}
                                                    className="group/item"
                                                    style={{
                                                        padding: '1rem',
                                                        borderRadius: '0.5rem',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '1rem',
                                                        border: '1px solid transparent'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = `${service.theme.primary}10`;
                                                        e.currentTarget.style.borderColor = `${service.theme.primary}30`;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                        e.currentTarget.style.borderColor = 'transparent';
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        backgroundColor: service.theme.primary,
                                                        boxShadow: `0 0 10px ${service.theme.primary}`
                                                    }} />
                                                    <span style={{
                                                        color: '#fff',
                                                        fontSize: '0.9rem',
                                                        fontWeight: 500,
                                                        letterSpacing: '0.05em'
                                                    }}>
                                                        {service.title}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={(e) => {
                                    if (location.pathname !== '/') {
                                        e.preventDefault();
                                        navigate('/');
                                        setTimeout(() => {
                                            const el = document.querySelector(link.href);
                                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                                        }, 100);
                                    }
                                }}
                                className="nav-link group"
                                style={{
                                    color: 'var(--color-text)',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    transition: 'all 0.3s ease',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    position: 'relative',
                                    padding: '0.5rem 0'
                                }}
                            >
                                <span
                                    className="relative z-10 transition-colors duration-300"
                                    onMouseEnter={(e) => e.currentTarget.style.color = themeColor}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text)'}
                                >
                                    {link.name}
                                </span>
                                <span
                                    className="absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                                    style={{ backgroundColor: themeColor, boxShadow: `0 0 10px ${themeColor}` }}
                                ></span>
                            </a>
                        );
                    })}
                </nav>

                <div className="hidden lg:flex items-center gap-6 flex-shrink-0" style={{ zIndex: 20 }}>
                    <LanguageSwitcher />
                    <Button
                        variant="outline"
                        onClick={() => navigate('/login')}
                        style={{
                            minWidth: '140px',
                            justifyContent: 'center',
                            fontSize: '1rem',
                            padding: '0.75rem 2rem',
                            borderColor: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(5px)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = themeColor;
                            e.currentTarget.style.boxShadow = `0 0 15px ${themeColor}40`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {t('header.login')}
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="lg:hidden flex items-center gap-4" style={{ zIndex: 20 }}>
                    <LanguageSwitcher />
                    <button
                        className="text-white p-2 hover:bg-white/10 rounded-full transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        style={{ color: isMobileMenuOpen ? themeColor : 'white' }}
                    >
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'var(--color-bg)',
                        padding: '2rem',
                        borderBottom: `1px solid ${themeColor}40`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        alignItems: 'center',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                if (location.pathname !== '/') navigate('/');
                            }}
                            style={{ color: 'var(--color-text)', fontSize: '1.1rem' }}
                        >
                            {link.name}
                        </a>
                    ))}
                    <Button onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate('/login');
                    }} style={{ backgroundColor: themeColor, color: '#000' }}>
                        {t('header.login')}
                    </Button>
                </div>
            )}
        </header>
    );
};

export default Header;
