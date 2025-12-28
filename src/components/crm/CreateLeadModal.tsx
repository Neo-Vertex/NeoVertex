import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { X, Save } from 'lucide-react';
import type { CRMStage, CRMPipeline } from '../../types/crm';

interface CreateLeadModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateLeadModal: React.FC<CreateLeadModalProps> = ({ onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [pipelines, setPipelines] = useState<CRMPipeline[]>([]);
    const [stages, setStages] = useState<CRMStage[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        position: '',
        address: '',
        country: '',
        observation: '',
        value: '',
        pipeline_id: '',
        stage_id: '',
        source: ''
    });

    useEffect(() => {
        loadPipelines();
    }, []);

    const loadPipelines = async () => {
        const { data: pData } = await supabase.from('crm_pipelines').select('*');
        if (pData && pData.length > 0) {
            setPipelines(pData);
            setFormData(prev => ({ ...prev, pipeline_id: pData[0].id }));
            loadStages(pData[0].id);
        }
    };

    const loadStages = async (pipelineId: string) => {
        const { data: sData } = await supabase
            .from('crm_stages')
            .select('*')
            .eq('pipeline_id', pipelineId)
            .order('order');

        if (sData) {
            setStages(sData);
            if (sData.length > 0) {
                setFormData(prev => ({ ...prev, stage_id: sData[0].id }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.from('crm_leads').insert([{
                name: formData.name,
                company: formData.company,
                email: formData.email,
                phone: formData.phone,
                position: formData.position,
                address: formData.address,
                country: formData.country,
                observation: formData.observation,
                value: Number(formData.value) || 0,
                pipeline_id: formData.pipeline_id,
                stage_id: formData.stage_id,
                source: formData.source,
                status: 'active'
            }]);

            if (error) throw error;
            onSuccess();
        } catch (error) {
            console.error('Error creating lead:', error);
            alert('Erro ao criar lead');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#111111] w-full max-w-lg rounded-xl border border-white/10 shadow-2xl overflow-hidden relative">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-gradient-to-r from-zinc-900 to-zinc-800">
                    <h2 className="text-lg font-bold text-[#D4AF37] uppercase tracking-wider">Novo Lead</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nome do Contato</label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-sm p-3 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-all placeholder:text-zinc-700"
                            placeholder="Ex: João Silva"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Empresa</label>
                            <input
                                type="text"
                                value={formData.company}
                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-sm p-3 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-all placeholder:text-zinc-700"
                                placeholder="Empresa Ltda"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Cargo</label>
                            <input
                                type="text"
                                value={formData.position}
                                onChange={e => setFormData({ ...formData, position: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-sm p-3 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-all placeholder:text-zinc-700"
                                placeholder="CEO / Diretor"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Valor Potencial</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">R$</span>
                                <input
                                    type="number"
                                    value={formData.value}
                                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-sm p-3 pl-9 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-all placeholder:text-zinc-700"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Endereço</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-sm p-3 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-all placeholder:text-zinc-700"
                                placeholder="Rua..."
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">País</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={e => setFormData({ ...formData, country: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-sm p-3 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-all placeholder:text-zinc-700"
                                placeholder="Brasil"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-sm p-3 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-all placeholder:text-zinc-700"
                                placeholder="joao@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Telefone / WhatsApp</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-sm p-3 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-all placeholder:text-zinc-700"
                                placeholder="(11) 99999-9999"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Observações</label>
                        <textarea
                            value={formData.observation}
                            onChange={e => setFormData({ ...formData, observation: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-sm p-3 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-all placeholder:text-zinc-700 min-h-[80px]"
                            placeholder="Notas importantes sobre o lead..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Funil</label>
                            <select
                                value={formData.pipeline_id}
                                onChange={e => {
                                    setFormData({ ...formData, pipeline_id: e.target.value });
                                    loadStages(e.target.value);
                                }}
                                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-sm p-3 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-all appearance-none"
                            >
                                {pipelines.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Etapa Inicial</label>
                            <select
                                value={formData.stage_id}
                                onChange={e => setFormData({ ...formData, stage_id: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-sm p-3 text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:outline-none transition-all appearance-none"
                            >
                                {stages.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6 gap-3 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ backgroundColor: '#D4AF37', color: '#000000' }}
                            className="px-8 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider shadow-lg hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : <><Save size={16} /> Salvar Lead</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateLeadModal;
