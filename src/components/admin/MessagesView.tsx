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
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contact_requests' }, (payload: any) => {
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
            setRequests(prev => prev.map((r: any) => r.id === request.id ? { ...r, read: true } : r));
        }
    };

    const handleDeleteRequest = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta mensagem?')) return;

        const { error } = await supabase.from('contact_requests').delete().eq('id', id);

        if (error) {
            alert('Erro ao excluir mensagem.');
            console.error(error);
        } else {
            setRequests(prev => prev.filter((req: any) => req.id !== id));
            if (selectedRequest?.id === id) {
                setSelectedRequest(null);
            }
        }
    };

    return (
        <div className="p-6 anim-fade-in">
            <div className="flex h-[calc(100vh-14rem)] gap-6">
                {loading ? (
                    <div className="w-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
                    </div>
                ) : (
                    <>
                        {/* Requests List */}
                        <div className="card w-1/3 relative overflow-hidden flex flex-col">
                            <div className="anim-shimmer" />
                            <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 className="text-white font-bold flex items-center gap-2">
                                    <Mail size={18} className="text-[var(--color-primary)]" />
                                    Solicitações de Contato
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                {requests.length === 0 ? (
                                    <p className="text-[var(--color-text-muted)] text-center p-4">Nenhuma mensagem.</p>
                                ) : (
                                    requests.map((req: any) => (
                                        <div
                                            key={req.id}
                                            className="flex gap-4 p-4 rounded-xl transition-all duration-200 cursor-pointer"
                                            style={{
                                                background: req.read ? 'transparent' : 'rgba(212,175,55,0.04)',
                                                border: `1px solid ${req.read ? 'rgba(255,255,255,0.04)' : 'rgba(212,175,55,0.12)'}`,
                                                marginBottom: 8,
                                                ...(selectedRequest?.id === req.id ? { borderColor: 'rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.06)' } : {}),
                                            }}
                                            onClick={() => handleSelectRequest(req)}
                                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.06)'; }}
                                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = selectedRequest?.id === req.id ? 'rgba(212,175,55,0.06)' : req.read ? 'transparent' : 'rgba(212,175,55,0.04)'; }}
                                        >
                                            <div className="flex flex-col gap-1 w-full">
                                                <div className="flex justify-between items-center w-full">
                                                    <span className={`font-medium text-sm ${!req.read ? 'text-white' : 'text-[var(--color-text-muted)]'}`}>{req.name}</span>
                                                    <span className="text-[10px] text-[var(--color-text-muted)]">{new Date(req.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-[var(--color-text-muted)] line-clamp-1">{req.message}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Details Area */}
                        <div className="card flex-1 relative overflow-hidden flex flex-col">
                            <div className="anim-shimmer" />
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

                                    <div className="card rounded-xl p-6">
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
        </div>
    );
};

export default MessagesView;
