import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Process: React.FC = () => {
    const { t } = useTranslation();

    const phases = t('process.phases', { returnObjects: true }) as Array<{
        title: string;
        items: string[];
    }>;

    return (
        <section className="section-padding" style={{ backgroundColor: 'var(--color-bg)' }}>
            <div className="responsive-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: '4rem' }}
                >
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                        <Trans i18nKey="process.title" components={{ 1: <span className="text-liquid-gold" /> }} />
                    </h2>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {phases.map((phase, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="card-glass"
                            style={{ padding: '2rem', position: 'relative' }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '1.5rem'
                            }}>
                                <span className="text-liquid-gold" style={{
                                    fontSize: '4rem',
                                    fontWeight: 'bold',
                                    fontFamily: 'var(--font-heading)',
                                    lineHeight: 1
                                }}>
                                    0{index + 1}
                                </span>
                                {index < phases.length - 1 && (
                                    <div className="hidden lg:block">
                                        <ArrowRight size={24} style={{ color: 'var(--color-primary)', opacity: 0.5 }} />
                                    </div>
                                )}
                            </div>

                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-text)' }}>
                                {phase.title}
                            </h3>

                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {phase.items.map((item, idx) => (
                                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        <CheckCircle2 size={18} style={{ color: 'var(--color-primary)', marginTop: '0.2rem', minWidth: '18px' }} />
                                        <span style={{ fontSize: '0.95rem' }}>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Process;
