import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Trans, useTranslation } from 'react-i18next';
import ReCAPTCHA from 'react-google-recaptcha';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

const RATE_LIMIT_KEY = 'neovertex_contact_last_submit';
const RATE_LIMIT_TIME = 10 * 60 * 1000;

const Contact: React.FC = () => {
    const { t } = useTranslation();
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const [formData, setFormData] = useState({ name: '', phone: '', challenge: '' });
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const [status, setStatus] = useState<{
        type: 'idle' | 'loading' | 'success' | 'error';
        message: string;
    }>({ type: 'idle', message: '' });

    const validate = (): boolean => {
        if (formData.name.length < 2 || !/^[a-zA-ZÀ-ÿ\s]{2,100}$/.test(formData.name)) {
            setStatus({ type: 'error', message: t('contact.errors.nameInvalid') });
            return false;
        }
        if (formData.phone.length < 8) {
            setStatus({ type: 'error', message: t('contact.errors.phoneInvalid') });
            return false;
        }
        if (formData.challenge.trim().length < 5) {
            setStatus({ type: 'error', message: t('contact.errors.challengeRequired') });
            return false;
        }
        if (!recaptchaToken) {
            setStatus({ type: 'error', message: t('contact.errors.recaptcha') });
            return false;
        }
        return true;
    };

    const checkRateLimit = (): boolean => {
        const last = localStorage.getItem(RATE_LIMIT_KEY);
        if (last && Date.now() - parseInt(last) < RATE_LIMIT_TIME) {
            const minutes = Math.ceil((RATE_LIMIT_TIME - (Date.now() - parseInt(last))) / 60000);
            setStatus({ type: 'error', message: t('contact.errors.rateLimit', { minutes }) });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkRateLimit() || !validate()) return;
        setStatus({ type: 'loading', message: t('contact.sending') });

        try {
            const { error } = await supabase.from('contact_requests').insert([{
                name: formData.name,
                phone: formData.phone,
                message: formData.challenge,
                country: '',
                country_code: '',
            }]);
            if (error) throw error;

            localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
            setStatus({ type: 'success', message: t('contact.success') });
            setFormData({ name: '', phone: '', challenge: '' });
            setRecaptchaToken(null);
            recaptchaRef.current?.reset();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : t('contact.errors.generic');
            setStatus({ type: 'error', message: msg });
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.875rem 1rem',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        color: 'var(--color-text)',
        fontSize: '0.95rem',
        fontFamily: 'var(--font-body)',
        outline: 'none',
        transition: 'border-color 0.2s',
    };

    return (
        <section id="contact" className="section-padding" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div style={{ maxWidth: '520px', margin: '0 auto', padding: '0 1rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    style={{ textAlign: 'center' }}
                >
                    <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', marginBottom: '0.75rem' }}>
                        <Trans i18nKey="contact.title" components={{ 1: <span className="text-liquid-gold" /> }} />
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '2.5rem', lineHeight: 1.6, fontSize: '0.95rem' }}>
                        {t('contact.subtitle')}
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                        <div>
                            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                                {t('contact.name')}
                            </label>
                            <input
                                id="name" name="name" type="text" required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                style={inputStyle}
                                onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.5)')}
                                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                                disabled={status.type === 'loading' || status.type === 'success'}
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                                {t('contact.phone')}
                            </label>
                            <input
                                id="phone" name="phone" type="tel" required
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                style={inputStyle}
                                placeholder="(11) 99999-9999"
                                onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.5)')}
                                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                                disabled={status.type === 'loading' || status.type === 'success'}
                            />
                        </div>

                        <div>
                            <label htmlFor="challenge" style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                                {t('contact.challenge')}
                            </label>
                            <textarea
                                id="challenge" name="challenge" required rows={4}
                                value={formData.challenge}
                                onChange={e => setFormData({ ...formData, challenge: e.target.value })}
                                style={{ ...inputStyle, resize: 'vertical' }}
                                onFocus={e => (e.target.style.borderColor = 'rgba(212,175,55,0.5)')}
                                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                                disabled={status.type === 'loading' || status.type === 'success'}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
                            <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                                onChange={token => setRecaptchaToken(token)}
                                theme="dark"
                            />
                        </div>

                        {status.message && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                                    status.type === 'error'
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        : 'bg-green-500/10 text-green-400 border border-green-500/20'
                                }`}
                            >
                                {status.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                                <span>{status.message}</span>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={status.type === 'loading' || status.type === 'success'}
                            style={{
                                width: '100%',
                                padding: '0.9rem',
                                background: '#D4AF37',
                                color: '#000',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                fontWeight: 800,
                                letterSpacing: '0.04em',
                                border: 'none',
                                cursor: status.type === 'loading' ? 'not-allowed' : 'pointer',
                                opacity: status.type === 'loading' ? 0.7 : 1,
                                boxShadow: '0 4px 20px rgba(212,175,55,0.25)',
                                transition: 'opacity 0.2s',
                                minHeight: '44px',
                            }}
                        >
                            {status.type === 'loading' ? t('contact.sending') : t('contact.submit')}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em' }}>
                            {t('contact.disclaimer')}
                        </p>
                    </form>
                </motion.div>
            </div>
        </section>
    );
};

export default Contact;
