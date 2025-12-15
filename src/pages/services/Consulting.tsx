
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/Button';
import { services } from '../../data/services';
import { LineChart, Palette, DollarSign, ClipboardList, Search, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Consulting: React.FC = () => {
    const { t } = useTranslation();
    const service = services.find(s => s.id === 'consulting');

    if (!service) return <div>Service not found</div>;

    const details = [
        { key: 'branding', icon: Palette },
        { key: 'pricing', icon: DollarSign },
        { key: 'actionPlan', icon: ClipboardList },
        { key: 'marketResearch', icon: Search },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#000',
            color: '#fff',
            overflow: 'hidden',
            position: 'relative',
            fontFamily: 'var(--font-body)'
        }}>
            {/* Background Gradient */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: service.theme.gradient,
                opacity: 0.1,
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            <div className="responsive-container" style={{ position: 'relative', zIndex: 1, padding: '8rem 2rem' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="text-center mb-10 md:mb-20"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, y: [0, -10, 0] }}
                        transition={{
                            scale: { type: "spring", stiffness: 260, damping: 20 },
                            y: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                        }}
                        className="inline-flex p-4 md:p-6 rounded-full bg-[rgba(255,215,0,0.05)] border mb-8 shadow-[0_0_30px_rgba(255,215,0,0.1)]"
                        style={{
                            borderColor: service.theme.primary,
                        }}
                    >
                        <LineChart size={50} className="w-10 h-10 md:w-14 md:h-14" color={service.theme.primary} />
                    </motion.div>

                    {/* Using t() for title if available, otherwise fallback to service.title */}
                    <h1 className="text-liquid-gold text-4xl md:text-5xl lg:text-7xl mb-6 font-heading leading-tight">
                        {t('services.consulting.title')}
                    </h1>

                    <p className="text-lg md:text-2xl text-center max-w-full md:max-w-2xl lg:max-w-4xl mx-auto text-text-muted leading-relaxed font-body px-4">
                        {t('services.consulting.description')}
                    </p>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                    gap: '2.5rem',
                    maxWidth: '1200px',
                    margin: '0 auto 6rem'
                }}>
                    {details.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.key}
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ delay: index * 0.15, duration: 0.6 }}
                                viewport={{ once: true }}
                                className="card-glass"
                                style={{
                                    padding: '2.5rem',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    marginBottom: '1.5rem'
                                }}>
                                    <div style={{
                                        padding: '0.8rem',
                                        backgroundColor: `${service.theme.primary}15`,
                                        borderRadius: '0.8rem',
                                        color: service.theme.primary
                                    }}>
                                        <Icon size={28} />
                                    </div>
                                    <h3 style={{
                                        fontFamily: 'var(--font-heading)',
                                        fontSize: '1.5rem',
                                        color: '#fff'
                                    }}>
                                        {t(`services.consulting.details.${item.key}.title`)}
                                    </h3>
                                </div>
                                <p style={{
                                    color: 'var(--color-text-muted)',
                                    fontSize: '1.1rem',
                                    lineHeight: 1.6
                                }}>
                                    {t(`services.consulting.details.${item.key}.description`)}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{ textAlign: 'center' }}
                >
                    <Button
                        onClick={() => window.open('https://api.whatsapp.com/send?phone=5511999999999', '_blank')}
                        className="btn-shine"
                        style={{
                            fontSize: '1.2rem',
                            padding: '1.2rem 3.5rem',
                            borderRadius: '50px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.8rem'
                        }}
                    >
                        {service.cta} <ArrowRight size={20} />
                    </Button>
                </motion.div>
            </div>
        </div>
    );
};

export default Consulting;
