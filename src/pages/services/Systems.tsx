
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/Button';
import { services } from '../../data/services';
import { LayoutDashboard, Settings, Users, Network, BarChart3, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import MatrixEffect from '../../components/MatrixEffect';

// Página de Desenvolvimento de Sistemas (Tema: Azul)
const Systems: React.FC = () => {
    // Hook de tradução para textos multilíngues
    const { t } = useTranslation();

    // Busca os dados do serviço "systems" (conteúdo estático)
    const service = services.find(s => s.id === 'systems');

    if (!service) return <div>Service not found</div>;

    const details = [
        { key: 'erp', icon: Settings },
        { key: 'crm', icon: Users },
        { key: 'api', icon: Network },
        { key: 'dashboards', icon: BarChart3 },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#050510',
            color: '#fff',
            overflow: 'hidden',
            position: 'relative',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Efeito visual "Matrix" com a cor Azul Ciano (#00EAFF) para combinar com o tema */}
            <MatrixEffect color="#00EAFF" />

            <div className="responsive-container" style={{ position: 'relative', zIndex: 1, padding: '6rem 2rem' }}>
                <div className="flex flex-col items-center mb-10 md:mb-20">
                    <motion.div
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="p-4 md:p-6 mb-8 rounded-2xl bg-[rgba(0,234,255,0.05)] border-2"
                        style={{
                            borderColor: service.theme.primary,
                            boxShadow: `0 0 20px ${service.theme.primary}40`,
                        }}
                    >
                        <LayoutDashboard size={48} className="w-10 h-10 md:w-16 md:h-16" color={service.theme.primary} />
                    </motion.div>

                    <h1 className="text-liquid-blue text-4xl md:text-5xl lg:text-7xl text-center mb-6 font-heading">
                        {t('services.systems.title')}
                    </h1>
                    <p className="text-base md:text-xl text-center max-w-full md:max-w-2xl lg:max-w-3xl text-white/70 font-body px-4">
                        {t('services.systems.description')}
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem',
                    marginBottom: '4rem'
                }}>
                    {details.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.key}
                                initial={{ y: 50, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ delay: index * 0.15 }}
                                style={{
                                    backgroundColor: 'rgba(10, 20, 40, 0.8)',
                                    border: `1px solid rgba(0, 234, 255, 0.2)`,
                                    borderRadius: '0.8rem',
                                    padding: '2rem',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '2px',
                                    background: `linear-gradient(90deg, transparent, ${service.theme.primary}, transparent)`
                                }} />

                                <div style={{ marginBottom: '1rem', color: service.theme.primary }}>
                                    <Icon size={32} />
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
                                    {t(`services.systems.details.${item.key}.title`)}
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                                    {t(`services.systems.details.${item.key}.description`)}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                        onClick={() => window.open('https://api.whatsapp.com/send?phone=5511999999999', '_blank')}
                        style={{
                            fontSize: '1.2rem',
                            padding: '1.2rem 3rem',
                            backgroundColor: 'transparent',
                            color: service.theme.primary,
                            border: `2px solid ${service.theme.primary}`,
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            boxShadow: `inset 0 0 20px ${service.theme.primary}20`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {service.cta} <ArrowRight size={20} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Systems;
