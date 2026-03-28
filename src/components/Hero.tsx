import React from 'react';
import { motion } from 'framer-motion';
import { Trans, useTranslation } from 'react-i18next';

const Hero: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            background: '#07070f',
        }}>
            {/* Photo — right half, fades to left */}
            <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '48%',
                backgroundImage: 'url(/neooo.jpeg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                zIndex: 0,
            }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to right, #07070f 0%, rgba(7,7,15,0.6) 45%, rgba(7,7,15,0.05) 100%)',
                }} />
            </div>

            {/* Mobile overlay — darkens photo so text is readable */}
            <div
                className="md:hidden"
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(7,7,15,0.78)',
                    zIndex: 1,
                }}
            />

            {/* Content */}
            <div
                className="responsive-container"
                style={{
                    position: 'relative',
                    zIndex: 2,
                    padding: '0 2rem',
                    paddingTop: '90px',
                    paddingBottom: '60px',
                    width: '100%',
                }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ maxWidth: '580px' }}
                    className="mx-auto md:mx-0 text-center md:text-left"
                >
                    {/* Tag */}
                    <div style={{
                        display: 'inline-block',
                        fontSize: '0.65rem',
                        letterSpacing: '0.2em',
                        color: '#D4AF37',
                        textTransform: 'uppercase',
                        border: '1px solid rgba(212,175,55,0.3)',
                        borderRadius: '20px',
                        padding: '4px 14px',
                        marginBottom: '1.5rem',
                    }}>
                        {t('hero.tag')}
                    </div>

                    {/* Headline */}
                    <h1 style={{
                        fontSize: 'clamp(1.9rem, 4.5vw, 3rem)',
                        fontWeight: 800,
                        lineHeight: 1.15,
                        marginBottom: '1.25rem',
                        color: '#fff',
                    }}>
                        <Trans i18nKey="hero.title">
                            Cansado de trabalhar muito e crescer <span style={{ color: '#D4AF37' }}>pouco?</span>
                        </Trans>
                    </h1>

                    {/* Subtitle */}
                    <p
                        className="mx-auto md:mx-0"
                        style={{
                            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                            color: 'rgba(255,255,255,0.55)',
                            lineHeight: 1.7,
                            marginBottom: '2rem',
                            maxWidth: '500px',
                        }}
                    >
                        <Trans i18nKey="hero.subtitle">
                            Sua empresa pode{' '}
                            <strong style={{ color: 'rgba(212,175,55,0.85)', fontWeight: 600 }}>
                                faturar mais com menos esforço.
                            </strong>{' '}
                            A NeoVertex combina estratégia e tecnologia para transformar esforço em resultado real.
                        </Trans>
                    </p>

                    {/* CTA */}
                    <a
                        href="#contact"
                        className="block md:inline-block w-full md:w-auto text-center"
                        style={{
                            background: '#D4AF37',
                            color: '#000',
                            padding: '14px 32px',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            boxShadow: '0 4px 24px rgba(212,175,55,0.3)',
                            textDecoration: 'none',
                            transition: 'transform 0.15s, box-shadow 0.15s',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(212,175,55,0.4)';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.transform = 'none';
                            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(212,175,55,0.3)';
                        }}
                    >
                        {t('hero.cta')}
                    </a>

                    {/* Social proof */}
                    <p style={{
                        marginTop: '1.25rem',
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.28)',
                        letterSpacing: '0.04em',
                    }}>
                        <Trans i18nKey="hero.proof">
                            Sessão gratuita · Sem compromisso ·{' '}
                            <strong style={{ color: 'rgba(212,175,55,0.45)' }}>Vagas limitadas</strong>
                        </Trans>
                    </p>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;
