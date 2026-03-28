import React from 'react';
import { motion } from 'framer-motion';
import { Trans, useTranslation } from 'react-i18next';

const PainSection: React.FC = () => {
    const { t } = useTranslation();
    const items = t('pain.items', { returnObjects: true }) as string[];

    return (
        <section className="section-padding" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="responsive-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: '3rem' }}
                >
                    <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '0.75rem' }}>
                        <Trans i18nKey="pain.title" components={{ 1: <span className="text-liquid-gold" /> }} />
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem' }}>
                        {t('pain.subtitle')}
                    </p>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1.25rem',
                    maxWidth: '960px',
                    margin: '0 auto',
                }}>
                    {items.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            style={{
                                background: 'rgba(248,113,113,0.05)',
                                border: '1px solid rgba(248,113,113,0.12)',
                                borderRadius: '12px',
                                padding: '1.75rem',
                            }}
                        >
                            {/* X icon — SVG, no emoji */}
                            <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                background: 'rgba(248,113,113,0.1)',
                                border: '1px solid rgba(248,113,113,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem',
                                flexShrink: 0,
                            }}>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                                    <line x1="1" y1="1" x2="11" y2="11" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
                                    <line x1="11" y1="1" x2="1" y2="11" stroke="#f87171" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <p style={{
                                color: 'rgba(255,255,255,0.6)',
                                fontSize: '0.95rem',
                                lineHeight: 1.7,
                                fontStyle: 'italic',
                            }}>
                                "{item}"
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PainSection;
