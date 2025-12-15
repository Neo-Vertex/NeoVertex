import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Target, Rocket, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const Audience: React.FC = () => {
    const { t } = useTranslation();

    const items = t('audience.items', { returnObjects: true }) as string[];
    const icons = [Rocket, Target, Lightbulb];

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
                        <Trans i18nKey="audience.title" components={{ 1: <span className="text-liquid-gold" /> }} />
                    </h2>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {items.map((item, index) => {
                        const Icon = icons[index] || Target;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="card-glass"
                                style={{ padding: '3rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            >
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                    color: 'var(--color-primary)',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1.5rem',
                                    border: '1px solid rgba(212, 175, 55, 0.3)'
                                }}>
                                    <Icon size={36} />
                                </div>
                                <p style={{
                                    fontSize: '1.25rem',
                                    color: 'var(--color-text)',
                                    lineHeight: '1.6',
                                    fontWeight: 500
                                }}>
                                    {item}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Audience;
