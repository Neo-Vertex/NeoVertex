import React from 'react';
import { motion } from 'framer-motion';
import { Bot, LineChart, Globe, LayoutDashboard, BarChart3, Users } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { services } from '../data/services';

const Services: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const getIcon = (iconName: string, size: number) => {
        switch (iconName) {
            case 'LineChart': return <LineChart size={size} />;
            case 'Globe': return <Globe size={size} />;
            case 'LayoutDashboard': return <LayoutDashboard size={size} />;
            case 'Bot': return <Bot size={size} />;
            case 'BarChart3': return <BarChart3 size={size} />;
            case 'Users': return <Users size={size} />;
            default: return <LineChart size={size} />;
        }
    };

    return (
        <section id="services" className="section-padding" style={{ backgroundColor: 'var(--color-bg)' }}>
            <div className="responsive-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: '3rem' }}
                >
                    <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '0.75rem' }}>
                        <Trans i18nKey="services.title" components={{ 1: <span className="text-liquid-gold" /> }} />
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto', fontSize: '1rem' }}>
                        {t('services.subtitle')}
                    </p>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1.25rem',
                }}>
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -6 }}
                            onClick={() => navigate(`/services/${service.slug}`)}
                            style={{
                                backgroundColor: 'var(--color-surface)',
                                padding: '1.75rem',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                cursor: 'pointer',
                                transition: 'all 0.25s',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = `${service.theme.primary}40`;
                                e.currentTarget.style.boxShadow = `0 8px 24px -8px ${service.theme.primary}30`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {/* Icon container */}
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '10px',
                                backgroundColor: `${service.theme.primary}18`,
                                border: `1px solid ${service.theme.primary}28`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.25rem',
                                flexShrink: 0,
                                color: service.theme.primary,
                            }}>
                                {getIcon(service.icon, 20)}
                            </div>

                            <h3 style={{ fontSize: '1.05rem', marginBottom: '0.6rem', fontWeight: 700 }}>
                                {t(`services.${service.id}.title`)}
                            </h3>

                            <p style={{
                                color: 'var(--color-text-muted)',
                                lineHeight: 1.6,
                                marginBottom: '1.25rem',
                                fontSize: '0.9rem',
                                flex: 1,
                            }}>
                                {t(`services.${service.id}.description`)}
                            </p>

                            <div style={{
                                color: service.theme.primary,
                                fontWeight: 600,
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                marginTop: 'auto',
                            }}>
                                {t('services.viewDetails')}
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                                    <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
