import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DemoLogin: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [email, setEmail] = useState('demo@neovertex.com');
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate network delay
        setTimeout(() => {
            setLoading(false);
            navigate('/demo/dashboard');
        }, 1500);
    };

    return (
        <section style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Back Button */}
            <button
                onClick={() => navigate('/services/sistemas')}
                style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    zIndex: 20
                }}
            >
                <ArrowLeft size={24} />
                <span>{t('demo.login.back')}</span>
            </button>

            {/* Background Animation similar to Matrix/Home */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 50% 50%, rgba(0, 234, 255, 0.1), transparent 70%)',
                zIndex: 0
            }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="card-glass"
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '3rem',
                    zIndex: 1,
                    border: '1px solid rgba(0, 234, 255, 0.2)',
                    boxShadow: '0 0 30px rgba(0, 234, 255, 0.1)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{
                        color: '#fff',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '2rem',
                        marginBottom: '0.5rem'
                    }}>
                        NeoVertex
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>{t('demo.login.title')}</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('demo.login.email')}</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--color-primary)' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 10px 10px 40px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('demo.login.password')}</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--color-primary)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 10px 10px 40px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            background: 'linear-gradient(90deg, #00EAFF 0%, #0080FF 100%)',
                            color: '#000',
                            fontWeight: 'bold',
                            padding: '12px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: 'pointer',
                            marginTop: '1rem',
                            transition: 'all 0.3s'
                        }}
                    >
                        {loading ? t('demo.login.loading') : t('demo.login.submit')}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginTop: '1rem' }}>
                        {t('demo.login.disclaimer')}
                    </p>
                </form>
            </motion.div>
        </section>
    );
};

export default DemoLogin;
