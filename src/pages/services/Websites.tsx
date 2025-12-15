
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/Button';
import { services } from '../../data/services';
import { Globe, Layout, Rocket, ShoppingBag, Smartphone, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import MatrixEffect from '../../components/MatrixEffect';

// Página de Desenvolvimento de Sites (Tema: Roxo)
const Websites: React.FC = () => {
    // Hook de tradução para textos multilíngues
    const { t } = useTranslation();

    // Busca os dados do serviço "websites" (conteúdo estático)
    const service = services.find(s => s.id === 'websites');

    if (!service) return <div>Service not found</div>;

    const details = [
        { key: 'uiux', icon: Layout },
        { key: 'seo', icon: Rocket },
        { key: 'ecommerce', icon: ShoppingBag },
        { key: 'responsive', icon: Smartphone },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#000',
            color: '#fff',
            overflow: 'hidden',
            position: 'relative',
            fontFamily: 'var(--font-heading)'
        }}>
            {/* Efeito visual "Matrix" com a cor Roxa (#9D00FF) para combinar com o tema */}
            <MatrixEffect color="#9D00FF" />



            <div className="responsive-container" style={{ position: 'relative', zIndex: 1, padding: '6rem 2rem' }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-10 md:mb-20"
                >
                    <div className="inline-flex p-4 md:p-6 rounded-full mb-8 bg-[rgba(157,0,255,0.1)] border-2 shadow-[0_0_30px_rgb(157,0,255)]" style={{ borderColor: service.theme.primary }}>
                        <Globe size={64} className="w-10 h-10 md:w-16 md:h-16" color={service.theme.primary} />
                    </div>

                    <h1 className="text-liquid-purple text-4xl md:text-5xl lg:text-7xl mb-6 leading-tight drop-shadow-[0_0_10px_rgba(157,0,255,0.5)]">
                        {t('services.websites.title')}
                    </h1>

                    <p className="text-lg md:text-2xl text-center max-w-full md:max-w-2xl lg:max-w-4xl mx-auto text-text-muted leading-relaxed font-body px-4">
                        {t('services.websites.description')}
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
                                    overflow: 'hidden',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    borderRadius: '1rem',
                                    border: `1px solid ${service.theme.primary}30`
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
                                        {t(`services.websites.details.${item.key}.title`)}
                                    </h3>
                                </div>
                                <p style={{
                                    color: 'var(--color-text-muted)',
                                    fontSize: '1.1rem',
                                    lineHeight: 1.6,
                                    fontFamily: 'var(--font-body)'
                                }}>
                                    {t(`services.websites.details.${item.key}.description`)}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                <div style={{ textAlign: 'center' }}>
                    <Button
                        onClick={() => window.open('https://api.whatsapp.com/send?phone=5511999999999', '_blank')}
                        style={{
                            fontSize: '1.5rem',
                            padding: '1.5rem 4rem',
                            backgroundColor: service.theme.primary,
                            color: '#fff',
                            fontWeight: 'bold',
                            boxShadow: `0 0 50px ${service.theme.primary}60`,
                            border: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.8rem'
                        }}
                    >
                        {service.cta} <ArrowRight size={24} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Websites;
