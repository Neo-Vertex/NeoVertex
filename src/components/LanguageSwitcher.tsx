import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

/**
 * LanguageSwitcher Component
 * 
 * A dropdown component to switch the application's language using 'react-i18next'.
 * supports: PT-BR, PT-PT, FR-CH, EN, ES.
 */
const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const languages = [
        { code: 'pt-BR', label: 'PT-BR' },
        { code: 'pt-PT', label: 'PT-PT' },
        { code: 'fr-CH', label: 'FR-CH' },
        { code: 'en', label: 'EN' },
        { code: 'es', label: 'ES' }
    ];

    const currentLang = languages.find(l => l.code === i18n.language) || languages.find(l => l.code === 'pt-BR');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLanguageChange = (code: string) => {
        i18n.changeLanguage(code);
        setIsOpen(false);
    };

    return (
        <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block', marginLeft: '1rem' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem',
                    fontSize: '0.9rem',
                    borderRadius: '4px',
                    backgroundColor: isOpen ? 'var(--color-surface-hover)' : 'transparent'
                }}
            >
                <Globe size={18} />
                <span style={{ textTransform: 'uppercase' }}>{currentLang?.code || i18n.language}</span>
                <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '120%',
                        right: 0,
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.5rem',
                        padding: '0.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: '120px',
                        zIndex: 100,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                    }}
                >
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleLanguageChange(lang.code)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: i18n.language === lang.code ? 'var(--color-primary)' : 'var(--color-text)',
                                padding: '0.75rem',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                transition: 'all 0.2s',
                                borderRadius: '4px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            {lang.label}
                            {i18n.language === lang.code && (
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-primary)' }} />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
