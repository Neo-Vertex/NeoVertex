import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertTriangle, ArrowLeft, Check } from 'lucide-react';
import Button from '../components/Button';
import { supabase } from '../services/supabase';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        const savedEmail = localStorage.getItem('neovertex_remember_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            if (user) {
                // Save or remove email from localStorage
                if (rememberMe) {
                    localStorage.setItem('neovertex_remember_email', email);
                } else {
                    localStorage.removeItem('neovertex_remember_email');
                }

                // Check role
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profileError) {
                    throw new Error('Erro ao verificar perfil de usuário.');
                }

                if (profile?.role === 'admin') {
                    navigate('/admin');
                } else if (profile?.role === 'associate') {
                    navigate('/associate');
                } else {
                    throw new Error('Perfil de usuário sem permissão válida.');
                }
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
            await supabase.auth.signOut();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-bg)',
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.1), transparent 50%)',
            position: 'relative'
        }}>
            <button
                onClick={() => navigate('/')}
                style={{
                    position: 'absolute',
                    top: '2rem',
                    left: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--color-text-muted)',
                    fontSize: '1rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.3s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'}
            >
                <ArrowLeft size={20} /> Voltar para Home
            </button>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glass"
                style={{
                    padding: '3rem',
                    width: '100%',
                    maxWidth: '450px',
                    borderRadius: '1.5rem',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 className="text-liquid-gold" style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>NeoVertex</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Acesse sua conta</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{
                            padding: '1rem',
                            backgroundColor: 'rgba(255, 68, 68, 0.1)',
                            border: '1px solid #ff4444',
                            borderRadius: '0.75rem',
                            color: '#ff4444',
                            marginBottom: '2rem',
                            fontSize: '0.9rem',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <AlertTriangle size={18} /> {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Email</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                style={{
                                    width: '100%',
                                    padding: '1rem 1rem 1rem 3rem',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.75rem',
                                    color: 'var(--color-text)',
                                    outline: 'none',
                                    transition: 'all 0.3s',
                                    fontSize: '1rem'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--color-primary)';
                                    e.target.style.boxShadow = '0 0 0 2px rgba(212, 175, 55, 0.1)';
                                    e.target.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.backgroundColor = 'rgba(255,255,255,0.03)';
                                }}
                                required
                            />
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }}>
                                <Mail size={18} />
                            </div>
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Senha</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '1rem 1rem 1rem 3rem',
                                    backgroundColor: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '0.75rem',
                                    color: 'var(--color-text)',
                                    outline: 'none',
                                    transition: 'all 0.3s',
                                    fontSize: '1rem'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--color-primary)';
                                    e.target.style.boxShadow = '0 0 0 2px rgba(212, 175, 55, 0.1)';
                                    e.target.style.backgroundColor = 'rgba(255,255,255,0.05)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.backgroundColor = 'rgba(255,255,255,0.03)';
                                }}
                                required
                            />
                            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }}>
                                <Lock size={18} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                style={{
                                    appearance: 'none',
                                    width: '18px',
                                    height: '18px',
                                    border: '1px solid rgba(255,255,255,0.3)',
                                    borderRadius: '4px',
                                    backgroundColor: rememberMe ? 'var(--color-primary)' : 'transparent',
                                    cursor: 'pointer',
                                    display: 'grid',
                                    placeContent: 'center'
                                }}
                            />
                            {rememberMe && <Check size={12} className="text-black absolute pointer-events-none" style={{ left: '3px' }} />}
                        </div>
                        <label htmlFor="rememberMe" style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', cursor: 'pointer', userSelect: 'none' }}>
                            Lembrar usuário e senha
                        </label>
                    </div>

                    <Button type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
