import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { services } from '../data/services';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const ChatWidget: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: '', // initialized in effect
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    // Determine current theme color based on route
    const currentSlug = location.pathname.split('/services/')[1];
    const currentService = services.find(s => s.slug === currentSlug);

    // Default to gold/primary if not on a specific service page
    const themeColor = currentService ? currentService.theme.primary : '#FFD700';

    // Check if the current theme is Gold to apply the "Liquid Gold" effect
    const isGold = themeColor === '#FFD700';
    const liquidGoldGradient = 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)';

    // Update greeting when language changes
    useEffect(() => {
        setMessages(prev => prev.map(msg =>
            msg.id === '1' ? { ...msg, text: t('chat.greeting') } : msg
        ));
    }, [t, i18n.language]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Listen for custom event to open chat
    useEffect(() => {
        const handleOpenChat = () => setIsOpen(true);
        window.addEventListener('open-chat', handleOpenChat);
        return () => window.removeEventListener('open-chat', handleOpenChat);
    }, []);

    const sessionId = useRef(`session-${Date.now()}`);

    // Form state
    const [hasJoined, setHasJoined] = useState(false);
    const [userData, setUserData] = useState({
        name: '',
        phone: '',
        email: '',
        country: ''
    });

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userData.name || !userData.phone || !userData.email || !userData.country) return;

        setHasJoined(true);
        const uiText = t('chat.userStartMessage', { name: userData.name });
        const webhookText = `[SISTEMA - DADOS DO LEAD]\nNome: ${userData.name}\nTelefone: ${userData.phone}\nEmail: ${userData.email}\nNacionalidade: ${userData.country}\n-------------------\nMensagem do usuário: ${uiText}`;

        // Add user message to UI immediately (Clean version)
        const userMessage: Message = {
            id: Date.now().toString(),
            text: uiText,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        // Send to n8n (Rich version)
        try {
            const response = await fetch('https://n8n.iacorp.pro/webhook/chat-webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatInput: webhookText,
                    sessionId: sessionId.current,
                    metadata: {
                        name: userData.name,
                        phone: userData.phone,
                        email: userData.email,
                        nacionalidade: userData.country
                    }
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const botText = data.output || data.text || data.message || (typeof data === 'string' ? data : JSON.stringify(data));

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botText,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: t('chat.error'),
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await fetch('https://n8n.iacorp.pro/webhook/chat-webhook', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatInput: inputValue,
                    sessionId: sessionId.current,
                    metadata: {
                        name: userData.name,
                        phone: userData.phone,
                        email: userData.email,
                        nacionalidade: userData.country
                    }
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const botText = data.output || data.text || data.message || (typeof data === 'string' ? data : JSON.stringify(data));

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botText,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: t('chat.errorMessage'),
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: isGold ? undefined : themeColor,
                    color: '#000',
                    border: 'none',
                    boxShadow: `0 4px 20px ${themeColor}66`,
                    cursor: 'pointer',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                className={isGold ? "bg-liquid-gold" : ""}
            >
                {isOpen ? <X size={24} color="#fff" /> : <MessageCircle size={28} color="#fff" />}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            bottom: '7rem',
                            right: '2rem',
                            width: '350px',
                            height: hasJoined ? '500px' : 'auto',
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: '1rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            zIndex: 9999,
                            overflow: 'hidden'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1rem',
                            background: isGold ? liquidGoldGradient : `${themeColor}1A`,
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: isGold ? 'rgba(0,0,0,0.5)' : themeColor,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isGold ? '#FFD700' : '#fff'
                            }}>
                                <Bot size={18} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text)' }}>NeoVertex AI</h3>
                                <span style={{ fontSize: '0.75rem', color: themeColor }}>Online</span>
                            </div>
                        </div>

                        {!hasJoined ? (
                            /* Pre-Chat Form */
                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <h4 style={{ color: 'var(--color-text)', marginBottom: '0.5rem' }}>{t('chat.welcome')}</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                        {t('chat.description')}
                                    </p>
                                </div>
                                <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder={t('chat.namePlaceholder')}
                                            required
                                            value={userData.name}
                                            onChange={e => setUserData({ ...userData, name: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '0.5rem',
                                                color: 'var(--color-text)',
                                                outline: 'none',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="tel"
                                            placeholder={t('chat.phonePlaceholder')}
                                            required
                                            value={userData.phone}
                                            onChange={e => setUserData({ ...userData, phone: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '0.5rem',
                                                color: 'var(--color-text)',
                                                outline: 'none',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="email"
                                            placeholder={t('chat.emailPlaceholder')}
                                            required
                                            value={userData.email}
                                            onChange={e => setUserData({ ...userData, email: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '0.5rem',
                                                color: 'var(--color-text)',
                                                outline: 'none',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            placeholder={t('chat.countryPlaceholder')}
                                            required
                                            value={userData.country}
                                            onChange={e => setUserData({ ...userData, country: e.target.value })}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem',
                                                backgroundColor: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '0.5rem',
                                                color: 'var(--color-text)',
                                                outline: 'none',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        style={{
                                            marginTop: '0.5rem',
                                            padding: '0.75rem',
                                            borderRadius: '0.5rem',
                                            border: 'none',
                                            background: isGold ? liquidGoldGradient : themeColor,
                                            color: '#000',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        {t('chat.startChat')} <Send size={16} />
                                    </button>
                                </form>
                            </div>
                        ) : (
                            /* Chat Interface */
                            <>
                                <div style={{
                                    flex: 1,
                                    padding: '1rem',
                                    overflowY: 'auto',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem'
                                }}>
                                    {messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            style={{
                                                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                                maxWidth: '80%',
                                                padding: '0.75rem 1rem',
                                                borderRadius: '1rem',
                                                borderBottomRightRadius: msg.sender === 'user' ? '0.25rem' : '1rem',
                                                borderBottomLeftRadius: msg.sender === 'bot' ? '0.25rem' : '1rem',
                                                background: msg.sender === 'user' ? (isGold ? liquidGoldGradient : themeColor) : 'rgba(255,255,255,0.05)',
                                                color: msg.sender === 'user' ? (isGold ? '#000' : '#fff') : 'var(--color-text)',
                                                fontSize: '0.9rem',
                                                lineHeight: 1.4,
                                                boxShadow: msg.sender === 'user' ? `0 2px 10px ${themeColor}33` : 'none',
                                                whiteSpace: 'pre-wrap' // Preserve line breaks
                                            }}
                                        >
                                            {msg.text.split('**').map((part, index) => {
                                                if (index % 2 === 1) return <strong key={index}>{part}</strong>;

                                                // Split by URL regex
                                                const urlRegex = /(https?:\/\/[^\s]+)/g;
                                                const subParts = part.split(urlRegex);

                                                return subParts.map((subPart, subIndex) => {
                                                    if (subPart.match(urlRegex)) {
                                                        return (
                                                            <a
                                                                key={`${index}-${subIndex}`}
                                                                href={subPart}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    color: '#FFD700',
                                                                    textDecoration: 'underline',
                                                                    fontWeight: 500,
                                                                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                                                                }}
                                                            >
                                                                {subPart}
                                                            </a>
                                                        );
                                                    }
                                                    return subPart;
                                                });
                                            })}
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div style={{
                                            alignSelf: 'flex-start',
                                            padding: '0.75rem 1rem',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            borderRadius: '1rem',
                                            borderBottomLeftRadius: '0.25rem'
                                        }}>
                                            <motion.div
                                                animate={{ opacity: [0.4, 1, 0.4] }}
                                                transition={{ repeat: Infinity, duration: 1.5 }}
                                                style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}
                                            >
                                                {t('chat.typing')}
                                            </motion.div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <form onSubmit={handleSendMessage} style={{
                                    padding: '1rem',
                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex',
                                    gap: '0.5rem'
                                }}>
                                    <input
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={t('chat.inputPlaceholder')}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            color: 'var(--color-text)',
                                            outline: 'none',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!inputValue.trim()}
                                        style={{
                                            padding: '0.75rem',
                                            background: inputValue.trim() ? (isGold ? liquidGoldGradient : themeColor) : 'rgba(255,255,255,0.1)',
                                            color: inputValue.trim() ? (isGold ? '#000' : '#fff') : 'rgba(255,255,255,0.3)',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatWidget;
