import React from 'react';
import { useTranslation } from 'react-i18next';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const CEOCommitment: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section className="section-padding" style={{ position: 'relative', overflow: 'hidden', backgroundColor: 'var(--color-surface)' }}>
            {/* Background Element */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '800px',
                height: '800px',
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.05) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <div className="responsive-container" style={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}
                >
                    <Quote size={64} style={{ color: 'var(--color-primary)', opacity: 0.3, margin: '0 auto 2rem' }} />

                    <h2 style={{
                        fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                        fontFamily: 'var(--font-heading)',
                        fontStyle: 'italic',
                        lineHeight: 1.6,
                        marginBottom: '3rem',
                        color: 'var(--color-text)'
                    }}>
                        "{t('ceo.quote')}"
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: '60px', height: '3px', backgroundColor: 'var(--color-primary)', marginBottom: '1.5rem', borderRadius: '2px' }}></div>
                        <p style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            color: 'var(--color-text)',
                            letterSpacing: '0.05em'
                        }}>
                            {t('ceo.author')}
                        </p>
                        <p style={{
                            fontSize: '0.9rem',
                            color: 'var(--color-primary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em',
                            marginTop: '0.5rem'
                        }}>
                            CEO & Founder
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CEOCommitment;
