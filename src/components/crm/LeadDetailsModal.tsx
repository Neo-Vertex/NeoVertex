import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { X, Send, Phone, Mail, Calendar, MessageSquare, Clock, FileText, UserPlus } from 'lucide-react';
import type { CRMLead, CRMInteraction } from '../../types/crm';

interface LeadDetailsModalProps {
    lead: CRMLead;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    onConvertLead?: (lead: CRMLead) => void;
}

const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({ lead, isOpen, onClose, onConvertLead }) => {
    const [interactions, setInteractions] = useState<CRMInteraction[]>([]);
    const [newNote, setNewNote] = useState('');
    const [interactionType, setInteractionType] = useState<'note' | 'call' | 'email' | 'meeting' | 'whatsapp'>('note');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'timeline' | 'info'>('timeline');

    useEffect(() => {
        if (isOpen && lead) {
            loadInteractions();
        }
    }, [isOpen, lead]);

    const loadInteractions = async () => {
        const { data } = await supabase
            .from('crm_interactions')
            .select('*')
            .eq('lead_id', lead.id)
            .order('created_at', { ascending: false });

        if (data) setInteractions(data);
    };

    const handleAddInteraction = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim()) return;

        setLoading(true);
        try {
            const { error } = await supabase.from('crm_interactions').insert([{
                lead_id: lead.id,
                type: interactionType,
                content: newNote,
                created_at: new Date().toISOString()
            }]);

            if (error) throw error;
            setNewNote('');
            loadInteractions();
        } catch (error) {
            console.error('Error adding interaction:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConvert = () => {
        if (window.confirm('Tem certeza que deseja converter este Lead em Associado? Essa ação não pode ser desfeita.')) {
            onConvertLead?.(lead);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-[#111] border-l border-white/10 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-gradient-to-r from-zinc-900 to-zinc-800 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1 tracking-tight">{lead.name}</h2>
                        <div className="flex flex-col gap-1">
                            <p className="text-sm text-gray-400 font-medium">{lead.company || 'Sem empresa'}</p>
                            {lead.position && <p className="text-xs text-[#D4AF37] uppercase tracking-wider font-bold">{lead.position}</p>}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <span className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-sm text-gray-300 uppercase tracking-wider font-bold">
                                {lead.status === 'active' ? 'Ativo' : lead.status}
                            </span>
                            {lead.value > 0 && (
                                <span className="text-[10px] bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-2.5 py-1 rounded-sm text-[#D4AF37] font-mono font-bold">
                                    R$ {lead.value.toLocaleString('pt-BR')}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 bg-[#0a0a0a] px-6 gap-6">
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`py-4 px-2 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'timeline' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-gray-500 hover:text-white'}`}
                    >
                        Histórico
                    </button>
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`py-4 px-2 text-[11px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'info' ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-gray-500 hover:text-white'}`}
                    >
                        Informações
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto bg-[#111] p-6 custom-scrollbar">
                    {activeTab === 'timeline' ? (
                        <div className="space-y-6">
                            {/* Input Area */}
                            <div className="bg-[#0a0a0a] rounded-sm border border-zinc-800 p-4 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar flex-1">
                                        {[
                                            { id: 'note', label: 'Nota', icon: FileText },
                                            { id: 'call', label: 'Ligação', icon: Phone },
                                            { id: 'email', label: 'Email', icon: Mail },
                                            { id: 'meeting', label: 'Reunião', icon: Calendar },
                                            { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
                                        ].map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setInteractionType(type.id as any)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${interactionType === type.id ? 'bg-[#D4AF37] text-[#556B2F]' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-gray-300'}`}
                                            >
                                                <type.icon size={12} /> {type.label}
                                            </button>
                                        ))}
                                    </div>

                                    {onConvertLead && (
                                        <button
                                            onClick={handleConvert}
                                            className="ml-4 flex items-center gap-2 px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all bg-gradient-to-r from-[#D4AF37] via-[#FFE5B4] to-[#D4AF37] bg-[length:200%_auto] hover:bg-[position:right_center] text-[#556B2F] shadow-[0_0_15px_-3px_rgba(212,175,55,0.6)] hover:shadow-[0_0_20px_-3px_rgba(212,175,55,0.8)] hover:scale-105 border border-[#D4AF37]"
                                            title="Converter Lead em Associado"
                                        >
                                            <UserPlus size={14} /> CONVERTER
                                        </button>
                                    )}
                                </div>
                                <form onSubmit={handleAddInteraction}>
                                    <textarea
                                        value={newNote}
                                        onChange={(e) => setNewNote(e.target.value)}
                                        placeholder="Digite os detalhes da interação..."
                                        className="w-full bg-[#111] border border-zinc-800 rounded-sm p-3 text-sm text-gray-300 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none min-h-[80px] mb-3 resize-none transition-all placeholder:text-zinc-700"
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading || !newNote.trim()}
                                            className="bg-white/5 hover:bg-[#D4AF37] text-gray-400 hover:text-[#556B2F] px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
                                        >
                                            <Send size={12} /> Registrar
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Timeline Items */}
                            <div className="space-y-6 relative before:absolute before:left-4 before:top-4 before:bottom-0 before:w-px before:bg-white/5">
                                {interactions.map(interaction => (
                                    <div key={interaction.id} className="relative pl-0 group">
                                        <div className="bg-[#0a0a0a] p-4 rounded-sm border border-zinc-900 group-hover:border-[#D4AF37]/30 transition-all shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">
                                                        {interaction.type === 'note' ? 'Nota' : interaction.type}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-700">•</span>
                                                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {new Date(interaction.created_at).toLocaleString('pt-BR')}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">
                                                {interaction.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {interactions.length === 0 && (
                                    <p className="text-center text-gray-600 text-xs uppercase tracking-widest py-8 pl-4">Nenhuma interação registrada.</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1.5">Email</label>
                                    <p className="text-gray-300 bg-[#0a0a0a] p-3 rounded-sm border border-zinc-800 text-sm">{lead.email || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1.5">Telefone</label>
                                    <p className="text-gray-300 bg-[#0a0a0a] p-3 rounded-sm border border-zinc-800 text-sm">{lead.phone || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1.5">Cargo</label>
                                    <p className="text-gray-300 bg-[#0a0a0a] p-3 rounded-sm border border-zinc-800 text-sm">{lead.position || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1.5">Endereço</label>
                                    <p className="text-gray-300 bg-[#0a0a0a] p-3 rounded-sm border border-zinc-800 text-sm">{lead.address || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1.5">País</label>
                                    <p className="text-gray-300 bg-[#0a0a0a] p-3 rounded-sm border border-zinc-800 text-sm">{lead.country || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1.5">Origem</label>
                                    <p className="text-gray-300 bg-[#0a0a0a] p-3 rounded-sm border border-zinc-800 text-sm">{lead.source || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1.5">Criado em</label>
                                    <p className="text-gray-300 bg-[#0a0a0a] p-3 rounded-sm border border-zinc-800 text-sm">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>

                            {lead.observation && (
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block mb-1.5">Observações</label>
                                    <p className="text-gray-300 bg-[#0a0a0a] p-3 rounded-sm border border-zinc-800 min-h-[60px] whitespace-pre-wrap text-sm">{lead.observation}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LeadDetailsModal;
