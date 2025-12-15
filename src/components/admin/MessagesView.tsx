import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Mail, Phone, Globe, Calendar, Trash2 } from 'lucide-react';
import type { ContactRequest } from '../../types';

const MessagesView: React.FC = () => {
    const [requests, setRequests] = useState<ContactRequest[]>([]);
    const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();

        const subscription = supabase
            .channel('contact_requests')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_requests' }, payload => {
                setRequests(prev => [payload.new as ContactRequest, ...prev]);
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const loadRequests = async () => {
        const { data } = await supabase
            .from('contact_requests')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setRequests(data);
        setLoading(false);
    };

    const handleSelectRequest = async (request: ContactRequest) => {
        setSelectedRequest(request);
        if (!request.read) {
            await supabase.from('contact_requests').update({ read: true }).eq('id', request.id);
            setRequests(prev => prev.map(r => r.id === request.id ? { ...r, read: true } : r));
        }
    };

    const handleDeleteRequest = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta mensagem?')) return;

        const { error } = await supabase.from('contact_requests').delete().eq('id', id);

        if (error) {
            alert('Erro ao excluir mensagem.');
            console.error(error);
        } else {
            setRequests(prev => prev.filter(req => req.id !== id));
            if (selectedRequest?.id === id) {
                setSelectedRequest(null);
            }
        }
    };

    return (
        <div className="flex h-[calc(100vh-12rem)] gap-6">
            {loading ? (
                <div className="w-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
                </div>
            ) : (
                <>
                    {/* Requests List */}
                    <div className="w-1/3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-[rgba(255,255,255,0.05)]">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <Mail size={18} className="text-[var(--color-primary)]" />
                                Solicitações de Contato
                            </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {requests.length === 0 ? (
                                <p className="text-[var(--color-text-muted)] text-center p-4">Nenhuma mensagem.</p>
                            ) : (
                                requests.map(req => (
                                    <button
                                        key={req.id}
                                        onClick={() => handleSelectRequest(req)}
                                        className={`w-full p-4 flex flex-col gap-1 hover:bg-[rgba(255,255,255,0.05)] transition-colors border-b border-[rgba(255,255,255,0.02)] text-left ${selectedRequest?.id === req.id ? 'bg-[rgba(255,255,255,0.05)] border-l-2 border-l-[var(--color-primary)]' : ''} ${!req.read ? 'bg-[var(--color-primary)]/5' : ''}`}
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            <span className={`font-medium ${!req.read ? 'text-white' : 'text-[var(--color-text-muted)]'}`}>{req.name}</span>
                                            <span className="text-[10px] text-[var(--color-text-muted)]">{new Date(req.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">{req.message}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Details Area */}
                    <div className="flex-1 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden flex flex-col">
                        {selectedRequest ? (
                            <div className="p-8 overflow-y-auto">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-1">{selectedRequest.name}</h2>
                                        <div className="flex items-center gap-4 text-[var(--color-text-muted)] text-sm">
                                            <span className="flex items-center gap-1"><Globe size={14} /> {selectedRequest.country} ({selectedRequest.country_code})</span>
                                            <span className="flex items-center gap-1"><Phone size={14} /> {selectedRequest.phone}</span>
                                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(selectedRequest.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteRequest(selectedRequest.id)}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Excluir mensagem"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className="bg-[rgba(255,255,255,0.03)] p-6 rounded-xl border border-[rgba(255,255,255,0.05)]">
                                    <p className="text-white whitespace-pre-wrap leading-relaxed">{selectedRequest.message}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-[var(--color-text-muted)] flex-col gap-4">
                                <Mail size={48} className="opacity-20" />
                                <p>Selecione uma mensagem para visualizar os detalhes</p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default MessagesView;
