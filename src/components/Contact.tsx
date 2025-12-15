import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { useTranslation } from 'react-i18next';
import ReCAPTCHA from 'react-google-recaptcha';
import { AlertCircle, CheckCircle, Send } from 'lucide-react';
import { supabase } from '../services/supabase';

const Contact: React.FC = () => {
    const { t } = useTranslation();
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const [formData, setFormData] = useState({
        name: '',
        country: '',
        countryCode: '',
        phone: '',
        message: ''
    });

    const [status, setStatus] = useState<{
        type: 'idle' | 'loading' | 'success' | 'error';
        message: string;
    }>({ type: 'idle', message: '' });

    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

    // Security Constants
    const MAX_MESSAGE_LENGTH = 1000;
    const MIN_MESSAGE_LENGTH = 10;
    const SPAM_WORDS = ['casino', 'viagra', 'lottery', 'prize', 'crypto', 'investment'];
    const RATE_LIMIT_KEY = 'neovertex_contact_last_submit';
    const RATE_LIMIT_TIME = 10 * 60 * 1000; // 10 minutes

    const validateForm = (): boolean => {

        // 2. Name Validation
        if (formData.name.length < 2 || formData.name.length > 100 || !/^[a-zA-Z\s]*$/.test(formData.name)) {
            setStatus({ type: 'error', message: t('contact.errors.nameInvalid') });
            return false;
        }

        // 3. Country Validation
        if (!formData.country || formData.country.length < 2) {
            setStatus({ type: 'error', message: t('contact.errors.countryInvalid') });
            return false;
        }

        // 4. Phone Validation (Code + Number)
        if (!formData.countryCode || formData.countryCode.length < 1) {
            setStatus({ type: 'error', message: t('contact.errors.countryCodeInvalid') });
            return false;
        }
        if (!formData.phone || formData.phone.length < 8) {
            setStatus({ type: 'error', message: t('contact.errors.phoneInvalid') });
            return false;
        }

        // 5. Message Validation
        if (formData.message.length < MIN_MESSAGE_LENGTH || formData.message.length > MAX_MESSAGE_LENGTH) {
            setStatus({ type: 'error', message: t('contact.errors.messageLength', { min: MIN_MESSAGE_LENGTH, max: MAX_MESSAGE_LENGTH }) });
            return false;
        }

        // 6. Spam Words Check
        const lowerMessage = formData.message.toLowerCase();
        if (SPAM_WORDS.some(word => lowerMessage.includes(word))) {
            setStatus({ type: 'error', message: t('contact.errors.spamDetected') });
            return false;
        }

        // 7. reCAPTCHA Check
        if (!recaptchaToken) {
            setStatus({ type: 'error', message: t('contact.errors.recaptcha') });
            return false;
        }

        return true;
    };

    const checkRateLimit = (): boolean => {
        const lastSubmit = localStorage.getItem(RATE_LIMIT_KEY);
        if (lastSubmit) {
            const timeDiff = Date.now() - parseInt(lastSubmit);
            if (timeDiff < RATE_LIMIT_TIME) {
                const minutesLeft = Math.ceil((RATE_LIMIT_TIME - timeDiff) / 60000);
                setStatus({ type: 'error', message: t('contact.errors.rateLimit', { minutes: minutesLeft }) });
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!checkRateLimit()) return;
        if (!validateForm()) return;

        setStatus({ type: 'loading', message: t('contact.sending') });

        try {
            // Insert into Supabase
            const { error } = await supabase.from('contact_requests').insert([{
                name: formData.name,
                country: formData.country,
                country_code: formData.countryCode,
                phone: formData.phone,
                message: formData.message
            }]);

            if (error) throw error;

            // Success
            console.log('Form submitted securely:', { ...formData, recaptchaToken });
            localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());

            setStatus({ type: 'success', message: t('contact.success') });
            setFormData({ name: '', country: '', countryCode: '', phone: '', message: '' });
            setRecaptchaToken(null);
            recaptchaRef.current?.reset();

            // Explicit alert for user confirmation
            alert(t('contact.success'));

        } catch (error: any) {
            console.error('Error submitting form:', error);
            const errorMsg = error.message || error.error_description || t('contact.errors.generic');
            setStatus({ type: 'error', message: errorMsg });

            // Explicit alert for error debugging
            alert(`${t('contact.errors.generic')}: ${errorMsg}`);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (status.type === 'error') setStatus({ type: 'idle', message: '' });
    };

    const inputStyle = {
        width: '100%',
        padding: '1rem',
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '0.5rem',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.3s'
    };

    return (
        <section id="contact" className="section-padding" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{t('contact.title')}</h2>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '3rem' }}>
                        {t('contact.subtitle')}
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>



                        <div>
                            <label htmlFor="name" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('contact.name')}</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                disabled={status.type === 'loading'}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div className="md:col-span-5">
                                <label htmlFor="country" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('contact.country')}</label>
                                <input
                                    type="text"
                                    id="country"
                                    name="country"
                                    required
                                    value={formData.country}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    placeholder={t('contact.placeholders.country') || "Ex: Brasil"}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    disabled={status.type === 'loading'}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="countryCode" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('contact.countryCode')}</label>
                                <input
                                    type="text"
                                    id="countryCode"
                                    name="countryCode"
                                    required
                                    value={formData.countryCode}
                                    onChange={handleChange}
                                    style={{ ...inputStyle, textAlign: 'center' }}
                                    placeholder="+55"
                                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    disabled={status.type === 'loading'}
                                />
                            </div>
                            <div className="md:col-span-5">
                                <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('contact.phone')}</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    style={inputStyle}
                                    placeholder={t('contact.placeholders.phone') || "Ex: (11) 99999-9999"}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                    disabled={status.type === 'loading'}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="message" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{t('contact.message')}</label>
                            <textarea
                                id="message"
                                name="message"
                                rows={4}
                                required
                                value={formData.message}
                                onChange={handleChange}
                                style={{ ...inputStyle, resize: 'vertical' }}
                                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                disabled={status.type === 'loading'}
                            />
                            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                {formData.message.length} / {MAX_MESSAGE_LENGTH}
                            </div>
                        </div>

                        {/* reCAPTCHA */}
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
                            <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Placeholder Test Key
                                onChange={(token) => setRecaptchaToken(token)}
                                theme="dark"
                            />
                        </div>

                        {/* Status Message */}
                        {status.message && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-lg flex items-center gap-2 ${status.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                    status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                        'bg-blue-500/10 text-blue-400'
                                    }`}
                            >
                                {status.type === 'error' && <AlertCircle size={18} />}
                                {status.type === 'success' && <CheckCircle size={18} />}
                                <span>{status.message}</span>
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            disabled={status.type === 'loading' || status.type === 'success'}
                            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', opacity: status.type === 'loading' ? 0.7 : 1 }}
                        >
                            {status.type === 'loading' ? 'Enviando...' : <><Send size={18} /> {t('contact.submit')}</>}
                        </Button>
                    </form>
                </motion.div>
            </div>
        </section>
    );
};

export default Contact;
