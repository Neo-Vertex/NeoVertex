import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const WhyUs: React.FC = () => {
    const { t } = useTranslation();

    const pillars = t('about.pillars', { returnObjects: true }) as Record<string, { title: string; description: string }>;
    const differentials = t('differentials.items', { returnObjects: true }) as Record<string, { title: string; description: string }>;

    return (
        <React.Fragment>
            {/* About Section */}
            <section className="section-padding" style={{ backgroundColor: 'var(--color-bg)' }}>
                <div className="responsive-container">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto 4rem' }}
                    >
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>
                            <Trans i18nKey="about.title" components={{ 1: <span className="text-liquid-gold" /> }} />
                        </h2>
                        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                            {t('about.description')}
                        </p>
                    </motion.div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                        {Object.entries(pillars).map(([key, pillar], index) => (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="card-glass"
                                style={{ padding: '2.5rem', borderLeft: '4px solid var(--color-primary)' }}
                            >
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--color-text)' }}>{pillar.title}</h3>
                                <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{pillar.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="section-padding" style={{ backgroundColor: 'var(--color-surface)', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'radial-gradient(circle at center, rgba(212, 175, 55, 0.05) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }} />

                <div className="responsive-container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        style={{ maxWidth: '900px', margin: '0 auto' }}
                    >
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                            fontStyle: 'italic',
                            lineHeight: 1.6,
                            marginBottom: '2rem',
                            fontFamily: 'var(--font-heading)',
                            color: 'var(--color-text)'
                        }}>
                            "{t('philosophy.quote')}"
                        </h2>
                        <p className="text-liquid-gold" style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '0.1em' }}>
                            {t('philosophy.author')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Differentials Section */}
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
                            <Trans i18nKey="differentials.title" components={{ 1: <span className="text-liquid-gold" /> }} />
                        </h2>
                    </motion.div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                        gap: '2rem',
                        maxWidth: '1200px',
                        margin: '0 auto'
                    }}>
                        {Object.entries(differentials).map(([key, item], index) => (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="card-glass"
                                style={{ display: 'flex', gap: '1.5rem', padding: '2rem' }}
                            >
                                <div style={{ flexShrink: 0, marginTop: '5px' }}>
                                    <CheckCircle2 size={24} style={{ color: 'var(--color-primary)' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.75rem', color: 'var(--color-text)' }}>
                                        {item.title}
                                    </h3>
                                    <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                                        {item.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </React.Fragment>
    );
};

export default WhyUs;
