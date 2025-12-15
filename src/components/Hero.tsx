import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { useTranslation, Trans } from 'react-i18next';

const Hero: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            paddingTop: '80px' // Header height
        }}>
            {/* Background Effects */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60vw',
                height: '60vw',
                background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, rgba(0,0,0,0) 70%)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: -1,
                opacity: 0.4
            }} />

            <div className="responsive-container" style={{
                padding: '0 2rem',
                position: 'relative',
                zIndex: 1,
                textAlign: 'center'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >

                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                        marginBottom: '1.5rem',
                        lineHeight: 1.1
                    }}>
                        <Trans i18nKey="hero.title">
                            Alcance o <span className="text-liquid-gold">seu Topo</span>
                        </Trans>
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                        color: 'var(--color-text-muted)',
                        maxWidth: '800px',
                        margin: '0 auto 3rem',
                        lineHeight: 1.6
                    }}>
                        {t('hero.subtitle')}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        <Button icon onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>
                            {t('hero.cta')}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
