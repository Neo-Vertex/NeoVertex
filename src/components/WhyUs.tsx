import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { useTranslation, Trans } from 'react-i18next';

const WhyUs: React.FC = () => {
    const { t } = useTranslation();

    return (
        <section id="why-us" className="section-padding" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="responsive-container why-us-grid">

                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    style={{ flex: '1 1 500px' }}
                >
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>
                        <Trans i18nKey="whyUs.title">
                            SEU NEGÓCIO É <span className="text-liquid-gold">ÚNICO</span>. SUA <span className="text-liquid-gold">TECNOLOGIA</span> TAMBÉM DEVERIA SER.
                        </Trans>
                    </h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
                        <Trans i18nKey="whyUs.description">
                            Como CEO da NeoVertex, eu, <strong>Nelson Araujo</strong>, me comprometo: zero soluções genéricas. Criamos Agentes de IA e sistemas que falam a linguagem do seu negócio. É a diferença entre ter tecnologia e dominar o mercado com ela.
                        </Trans>
                    </p>

                    <Button onClick={() => window.open('https://wa.me/5511999999999', '_blank')}>
                        {t('whyUs.cta')}
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    style={{ flex: '1 1 400px', position: 'relative' }}
                >
                    <div style={{
                        position: 'relative',
                        borderRadius: '1rem',
                        overflow: 'hidden',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                    }}>
                        <img
                            src="/nelson-araujo.png"
                            alt="Nelson Araujo - CEO"
                            style={{ width: '100%', height: 'auto', display: 'block', opacity: 0.9 }}
                        />
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                        }} />
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default WhyUs;
