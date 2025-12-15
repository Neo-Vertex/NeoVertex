
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/Button';
import { services } from '../../data/services';
import { Bot, Zap, LineChart, Sparkles, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import MatrixEffect from '../../components/MatrixEffect';

// Página de Inteligência Artificial (Tema: Verde Matrix)
const AI: React.FC = () => {
    // Hook de tradução para textos multilíngues
    const { t } = useTranslation();

    // Busca os dados do serviço "ai" (conteúdo estático)
    const service = services.find(s => s.id === 'ai');

    if (!service) return <div>Service not found</div>;

    const details = [
        { key: 'agents', icon: Bot },
        { key: 'automation', icon: Zap },
        { key: 'data', icon: LineChart },
        { key: 'generative', icon: Sparkles },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#000',
            color: '#fff',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Efeito visual "Matrix" clássico com a cor Verde (#0F0) */}
            <MatrixEffect color="#0F0" />

            <div className="responsive-container" style={{ position: 'relative', zIndex: 1, padding: '6rem 2rem' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="text-center mb-10 md:mb-20"
                >
                    <motion.div
                        animate={{
                            boxShadow: ['0 0 10px #0f0', '0 0 30px #0f0', '0 0 10px #0f0']
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="inline-flex p-4 md:p-6 rounded-full bg-black border border-[#0f0] mb-8"
                    >
                        <Bot size={64} className="w-10 h-10 md:w-16 md:h-16" color="#0f0" />
                    </motion.div>

                    <h1 className="text-liquid-green text-4xl md:text-5xl lg:text-7xl font-heading tracking-tighter mb-4">
                        {t('services.ai.title')}
                    </h1>

                    <p className="text-lg md:text-2xl mt-6 text-[#cfc] font-body max-w-full md:max-w-2xl lg:max-w-4xl mx-auto px-4">
                        {`> ${t('services.ai.description')}`}
                    </p>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
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
                                whileHover={{ scale: 1.02, border: '1px solid #0f0', boxShadow: '0 0 15px rgba(0,255,0,0.3)' }}
                                style={{
                                    padding: '2rem',
                                    border: '1px solid rgba(0, 255, 0, 0.3)',
                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                    borderRadius: '4px',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#0f0' }} />

                                <div style={{ marginBottom: '1rem', color: '#0f0' }}>
                                    <Icon size={32} />
                                </div>
                                <h3 style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: '#fff', marginBottom: '0.8rem' }}>
                                    {t(`services.ai.details.${item.key}.title`)}
                                </h3>
                                <p style={{
                                    fontFamily: 'monospace',
                                    color: '#cfc',
                                    opacity: 0.8,
                                    lineHeight: 1.6
                                }}>
                                    {`> ${t(`services.ai.details.${item.key}.description`)}`}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                <div style={{ textAlign: 'center', marginTop: '5rem' }}>
                    <Button
                        onClick={() => window.dispatchEvent(new Event('open-chat'))}
                        style={{
                            fontSize: '1.5rem',
                            padding: '1.5rem 4rem',
                            backgroundColor: '#0f0',
                            color: '#000',
                            fontWeight: 'bold',
                            fontFamily: 'monospace',
                            boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
                            border: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.8rem'
                        }}
                    >
                        {`> ${t('services.ai.chat_cta')} _`} <MessageCircle size={20} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AI;
