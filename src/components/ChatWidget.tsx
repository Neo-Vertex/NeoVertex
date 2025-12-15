import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { services } from '../data/services';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Olá! Sou a IA da NeoVertex. Como posso ajudar você a escalar seu negócio hoje?',
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
    // Default to gold/primary if not on a specific service page
    const themeColor = currentService ? currentService.theme.primary : '#FFD700';

    // Check if the current theme is Gold to apply the "Liquid Gold" effect
    const isGold = themeColor === '#FFD700';
    const liquidGoldGradient = 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        // ... (keep handleSendMessage logic same as before, no changes needed here but including for context if needed, wait, I can just replace the top part)
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
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: inputValue })
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            const botText = data.output || data.text || data.message || JSON.stringify(data);

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
                text: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente mais tarde.',
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
                    background: isGold ? liquidGoldGradient : themeColor, // Use gradient if gold
                    color: '#000', // Ensure contrast is always high (black on neon)
                    border: 'none',
                    boxShadow: `0 4px 20px ${themeColor}66`, // 40% opacity
                    cursor: 'pointer',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
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
                            height: '500px',
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
                            background: isGold ? liquidGoldGradient : `${themeColor}1A`, // User gradient or 10% opacity
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: isGold ? 'rgba(0,0,0,0.5)' : themeColor, // Dark bg for icon if gold header
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

                        {/* Messages Area */}
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
                                        boxShadow: msg.sender === 'user' ? `0 2px 10px ${themeColor}33` : 'none'
                                    }}
                                >
                                    {msg.text}
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
                                        Digitando...
                                    </motion.div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
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
                                placeholder="Digite sua mensagem..."
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
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default ChatWidget;
