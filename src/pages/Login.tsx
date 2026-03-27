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
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            const user = data?.user;

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
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ background: '#04040a' }}>
        {/* Ambient */}
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0 }}>
          <div style={{ position:'absolute', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(212,175,55,0.11) 0%, transparent 65%)', top:-250, left:-200, filter:'blur(100px)', animation:'driftA 14s ease-in-out infinite alternate' }} />
          <div style={{ position:'absolute', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(170,100,15,0.07) 0%, transparent 65%)', bottom:-150, right:50, filter:'blur(90px)', animation:'driftB 18s ease-in-out infinite alternate' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-sm mx-4"
        >
          {/* Card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(212,175,55,0.15)', borderRadius: 20,
            padding: '40px 36px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.1)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Top shimmer line */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)' }} />

            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'linear-gradient(135deg, #f0cc55, #8a6010)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: 22, color: '#000',
                marginBottom: 14, animation: 'logoPulse 3s ease-in-out infinite',
                boxShadow: '0 8px 32px rgba(212,175,55,0.35)',
              }}>N</div>
              <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 18, fontWeight: 700, color: '#D4AF37', letterSpacing: '0.2em', marginBottom: 4 }}>
                NEOVERTEX
              </h1>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>Acesse sua conta</p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-4 py-3 rounded-xl flex items-center gap-2"
                style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', fontSize: 12, color: '#f87171' }}
              >
                <span style={{ flexShrink: 0 }}>—</span> {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(212,175,55,0.6)', letterSpacing: '0.12em', display:'block', marginBottom: 6 }}>
                  EMAIL
                </label>
                <div className="relative">
                  <Mail size={14} aria-hidden={true} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'rgba(212,175,55,0.4)', pointerEvents:'none' }} />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    required placeholder="seu@email.com"
                    className="input-field"
                    style={{ paddingLeft: 36 }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: 'rgba(212,175,55,0.6)', letterSpacing: '0.12em', display:'block', marginBottom: 6 }}>
                  SENHA
                </label>
                <div className="relative">
                  <Lock size={14} aria-hidden={true} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'rgba(212,175,55,0.4)', pointerEvents:'none' }} />
                  <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                    required placeholder="••••••••"
                    className="input-field"
                    style={{ paddingLeft: 36 }}
                  />
                </div>
              </div>

              {/* Remember */}
              <label className="flex items-center gap-2.5 cursor-pointer">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: `1px solid ${rememberMe ? '#D4AF37' : 'rgba(255,255,255,0.15)'}`,
                    background: rememberMe ? 'rgba(212,175,55,0.15)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  {rememberMe && <Check size={10} aria-hidden={true} style={{ color: '#D4AF37' }} />}
                </div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Lembrar email</span>
              </label>

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-semibold transition-all duration-200 relative overflow-hidden"
                style={{
                  marginTop: 8,
                  background: loading ? 'rgba(212,175,55,0.3)' : 'linear-gradient(135deg, #D4AF37, #8a6010)',
                  color: loading ? 'rgba(255,255,255,0.5)' : '#000',
                  fontSize: 12, fontWeight: 700, letterSpacing: '0.12em',
                  boxShadow: loading ? 'none' : '0 8px 24px rgba(212,175,55,0.3)',
                  border: 'none',
                }}
              >
                {loading ? 'AUTENTICANDO...' : 'ENTRAR'}
              </button>
            </form>

            <div style={{ textAlign:'center', marginTop:20 }}>
              <a href="/" style={{ fontSize: 10, color: 'rgba(212,175,55,0.4)', letterSpacing:'0.05em', transition:'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color='#D4AF37')}
                onMouseLeave={e => (e.currentTarget.style.color='rgba(212,175,55,0.4)')}
              >
                Voltar ao site
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    );
};

export default Login;
