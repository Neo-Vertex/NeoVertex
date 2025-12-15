import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../services/supabase';
import { Send, User } from 'lucide-react';
import Button from '../Button';

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    read: boolean;
    created_at: string;
}

const AssociateMessagesView: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadMessages();

        // Subscribe to new messages
        const subscription = supabase
            .channel('associate_messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
                loadMessages();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadMessages = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch messages where user is sender or receiver
        // We assume the other party is always the Admin for now
        const { data } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('created_at', { ascending: true });

        if (data) {
            setMessages(data);
        }
        setLoading(false);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Find Admin ID. For now, we might need a way to know who the admin is.
        // Option 1: Hardcode or Config.
        // Option 2: Fetch a user with role 'admin'.
        const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin').limit(1);

        if (!admins || admins.length === 0) {
            alert('Administrador não encontrado.');
            return;
        }

        const adminId = admins[0].id;

        const { error } = await supabase.from('messages').insert([{
            sender_id: user.id,
            receiver_id: adminId,
            content: newMessage
        }]);

        if (!error) {
            setNewMessage('');
            loadMessages();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[rgba(255,255,255,0.05)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center">
                    <User size={20} />
                </div>
                <div>
                    <h3 className="font-bold text-white">Suporte NeoVertex</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">Fale com o administrador</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-[var(--color-text-muted)] py-8">
                        <p>Nenhuma mensagem ainda.</p>
                        <p className="text-sm">Envie uma mensagem para iniciar o atendimento.</p>
                    </div>
                ) : (
                    messages.map(msg => {
                        const { data: { user } } = supabase.auth.getUser() as any; // Hacky sync check, better to use state
                        // Actually we need to check against current user id stored in state or context
                        // For simplicity, let's assume we know who is who based on sender_id
                        // But we don't have user id here easily without async.
                        // Let's rely on the fact that if I sent it, it's me.
                        // Wait, I need the current user ID to know if "isMe".
                        return (
                            <MessageBubble key={msg.id} message={msg} />
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[rgba(255,255,255,0.05)]">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 bg-black/20 border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)]"
                    />
                    <Button onClick={handleSendMessage} className="px-6">
                        <Send size={18} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

const MessageBubble = ({ message }: { message: Message }) => {
    const [isMe, setIsMe] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setIsMe(message.sender_id === user.id);
        });
    }, [message.sender_id]);

    return (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${isMe ? 'bg-[var(--color-primary)] text-black rounded-tr-none' : 'bg-[rgba(255,255,255,0.1)] text-white rounded-tl-none'}`}>
                <p className="text-sm">{message.content}</p>
                <span className="text-[10px] opacity-70 block text-right mt-1">
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
};

export default AssociateMessagesView;
