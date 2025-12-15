import React from 'react';
import { motion } from 'framer-motion';
import { Bot, LineChart, Globe, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { services } from '../data/services';

const Services: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Helper to get icon component
    const getIcon = (iconName: string, size: number) => {
        switch (iconName) {
            case 'LineChart': return <LineChart size={size} />;
            case 'Globe': return <Globe size={size} />;
            case 'LayoutDashboard': return <LayoutDashboard size={size} />;
            case 'Bot': return <Bot size={size} />;
            default: return <LineChart size={size} />;
        }
    };

    return (
        <section id="services" className="section-padding" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="responsive-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: '4rem' }}
                >
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{t('services.title')}</h2>
                    <p style={{ color: 'var(--color-text-muted)', maxWidth: '800px', margin: '0 auto' }}>
                        {t('services.subtitle')}
                    </p>
                    <p style={{
                        color: 'var(--color-primary)',
                        marginTop: '1.5rem',
                        fontSize: '1.2rem',
                        fontWeight: 600,
                        fontStyle: 'italic'
                    }}>
                        {t('services.slogan_text')}
                    </p>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {services.map((service, index) => (
                        <motion.div
                            key={service.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            onClick={() => navigate(`/services/${service.slug}`)}
                            style={{
                                backgroundColor: 'var(--color-bg)',
                                padding: '2.5rem',
                                borderRadius: '1rem',
                                border: '1px solid rgba(255,255,255,0.05)',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = service.theme.primary;
                                e.currentTarget.style.boxShadow = `0 10px 30px -10px ${service.theme.primary}40`;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{
                                color: service.theme.primary,
                                marginBottom: '1.5rem',
                                backgroundColor: `${service.theme.primary}20`,
                                width: 'fit-content',
                                padding: '1rem',
                                borderRadius: '50%',
                                border: `1px solid ${service.theme.primary}40`
                            }}>
                                {getIcon(service.icon, 40)}
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{service.title}</h3>
                            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                {service.description}
                            </p>
                            <div style={{ color: service.theme.primary, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                Ver Detalhes →
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
