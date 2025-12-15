import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { TrendingUp, Clock, Zap, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const Results: React.FC = () => {
    const { t } = useTranslation();

    const results = t('results.items', { returnObjects: true }) as Array<{
        value: string;
        label: string;
    }>;

    const icons = [TrendingUp, DollarSign, Zap, Clock];

    return (
        <section className="section-padding" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="responsive-container">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center', marginBottom: '4rem' }}
                >
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                        <Trans i18nKey="results.title" components={{ 1: <span className="text-liquid-gold" /> }} />
                    </h2>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem'
                }}>
                    {results.map((result, index) => {
                        const Icon = icons[index] || TrendingUp;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="card-glass"
                                style={{ padding: '2.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            >
                                <div style={{
                                    color: 'var(--color-primary)',
                                    marginBottom: '1.5rem',
                                    padding: '1rem',
                                    borderRadius: '50%',
                                    backgroundColor: 'rgba(212, 175, 55, 0.1)',
                                    display: 'inline-flex'
                                }}>
                                    <Icon size={32} />
                                </div>
                                <div className="text-liquid-gold" style={{
                                    fontSize: '3rem',
                                    fontWeight: 'bold',
                                    fontFamily: 'var(--font-heading)',
                                    marginBottom: '0.5rem'
                                }}>
                                    {result.value}
                                </div>
                                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
                                    {result.label}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Results;
