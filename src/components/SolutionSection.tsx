import React from 'react';
import { motion } from 'framer-motion';
import { Trans, useTranslation } from 'react-i18next';

interface Step { num: string; title: string; description: string; }

const SolutionSection: React.FC = () => {
    const { t } = useTranslation();
    const steps = t('solution.steps', { returnObjects: true }) as Step[];

    return (
        <section className="section-padding" style={{ backgroundColor: 'var(--color-bg)' }}>
            <div className="responsive-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: '3rem' }}
                >
                    <div style={{
                        fontSize: '0.65rem',
                        letterSpacing: '0.2em',
                        color: '#D4AF37',
                        textTransform: 'uppercase',
                        marginBottom: '0.75rem',
                    }}>
                        {t('solution.tag')}
                    </div>
                    <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '0.75rem' }}>
                        <Trans i18nKey="solution.title" components={{ 1: <span className="text-liquid-gold" /> }} />
                    </h2>
                    <p style={{
                        color: 'var(--color-text-muted)',
                        maxWidth: '560px',
                        margin: '0 auto',
                        fontSize: '1rem',
                        lineHeight: 1.6,
                    }}>
                        {t('solution.subtitle')}
                    </p>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: '1.25rem',
                    maxWidth: '1000px',
                    margin: '0 auto',
                }}>
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            style={{
                                background: 'rgba(212,175,55,0.04)',
                                border: '1px solid rgba(212,175,55,0.1)',
                                borderRadius: '12px',
                                padding: '1.75rem',
                            }}
                        >
                            <div style={{
                                fontSize: '2.5rem',
                                fontWeight: 800,
                                color: 'rgba(212,175,55,0.18)',
                                lineHeight: 1,
                                marginBottom: '0.75rem',
                                fontFamily: 'var(--font-heading)',
                            }}>
                                {step.num}
                            </div>
                            <h4 style={{
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                color: '#D4AF37',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                marginBottom: '0.5rem',
                            }}>
                                {step.title}
                            </h4>
                            <p style={{
                                fontSize: '0.875rem',
                                color: 'rgba(255,255,255,0.45)',
                                lineHeight: 1.6,
                            }}>
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SolutionSection;
