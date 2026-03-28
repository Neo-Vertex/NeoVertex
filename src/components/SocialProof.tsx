import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface Stat { value: string; label: string; }

const SocialProof: React.FC = () => {
    const { t } = useTranslation();
    const stats = t('socialProof.stats', { returnObjects: true }) as Stat[];

    return (
        <section className="section-padding" style={{ backgroundColor: 'var(--color-surface)', position: 'relative', overflow: 'hidden' }}>
            {/* Ambient glow */}
            <div style={{
                position: 'absolute',
                top: '-30%',
                right: '-10%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div className="responsive-container" style={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    style={{
                        display: 'flex',
                        gap: '3rem',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                    }}
                >
                    {/* Photo */}
                    <div style={{
                        width: '120px',
                        height: '155px',
                        borderRadius: '12px',
                        flexShrink: 0,
                        backgroundImage: 'url(/nelson-araujo.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center top',
                        border: '1px solid rgba(212,175,55,0.2)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    }} />

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: '260px' }}>
                        {/* Stats */}
                        <div style={{
                            display: 'flex',
                            gap: '2rem',
                            marginBottom: '2rem',
                            flexWrap: 'wrap',
                        }}>
                            {stats.map((s, i) => (
                                <div key={i}>
                                    <div style={{
                                        fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                                        fontWeight: 800,
                                        color: '#D4AF37',
                                        fontFamily: 'var(--font-heading)',
                                        lineHeight: 1,
                                    }}>
                                        {s.value}
                                    </div>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'rgba(255,255,255,0.3)',
                                        marginTop: '4px',
                                        lineHeight: 1.4,
                                    }}>
                                        {s.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Divider */}
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '1.5rem' }} />

                        {/* Quote */}
                        <blockquote style={{ borderLeft: '2px solid rgba(212,175,55,0.25)', paddingLeft: '1.25rem' }}>
                            <p style={{
                                fontSize: '1rem',
                                color: 'rgba(255,255,255,0.5)',
                                lineHeight: 1.8,
                                fontStyle: 'italic',
                                marginBottom: '1rem',
                            }}>
                                "{t('socialProof.quote')}"
                            </p>
                            <footer>
                                <strong style={{ fontSize: '0.9rem', color: '#D4AF37', display: 'block' }}>
                                    {t('socialProof.name')}
                                </strong>
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: 'rgba(255,255,255,0.25)',
                                    letterSpacing: '0.08em',
                                    textTransform: 'uppercase',
                                }}>
                                    {t('socialProof.role')}
                                </span>
                            </footer>
                        </blockquote>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default SocialProof;
