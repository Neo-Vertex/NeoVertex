import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { CRMLead, CRMStage, CRMPipeline } from '../../types/crm';
import { Mail, Phone, Calendar, Search, Filter, MoreHorizontal, UserPlus } from 'lucide-react';

interface LeadsListProps {
    onConvertLead?: (lead: CRMLead) => void;
}

const LeadsList: React.FC<LeadsListProps> = ({ onConvertLead }) => {
    const [leads, setLeads] = useState<CRMLead[]>([]);
    const [stages, setStages] = useState<CRMStage[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        // Load Leads
        const { data: leadsData } = await supabase
            .from('crm_leads')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (leadsData) setLeads(leadsData);

        // Load Stages for mapping
        const { data: stagesData } = await supabase.from('crm_stages').select('*');
        if (stagesData) setStages(stagesData);

        setLoading(false);
    };

    const getStageName = (stageId: string) => {
        const stage = stages.find(s => s.id === stageId);
        return stage ? stage.name : stageId;
    };

    const getStageColor = (stageId: string) => {
        const stage = stages.find(s => s.id === stageId);
        return stage ? stage.color : '#666';
    };

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(filter.toLowerCase()) ||
        lead.email?.toLowerCase().includes(filter.toLowerCase()) ||
        lead.company?.toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando lista...</div>;

    return (
        <div className="bg-[#111] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/5 flex gap-4 bg-gradient-to-r from-zinc-900 to-zinc-800">
                <div className="relative flex-1 max-w-md">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Filtrar por nome, email ou empresa..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-sm pl-9 pr-4 py-2.5 text-xs font-medium text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all placeholder:text-zinc-600 uppercase tracking-wide"
                    />
                </div>
            </div>

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-[#1a1a1a] text-gray-500 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold border-b border-white/5">Nome / Empresa</th>
                        <th className="p-4 font-bold border-b border-white/5">Contato</th>
                        <th className="p-4 font-bold border-b border-white/5">Etapa</th>
                        <th className="p-4 font-bold border-b border-white/5">Valor</th>
                        <th className="p-4 font-bold border-b border-white/5 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredLeads.map(lead => (
                        <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4">
                                <div className="font-bold text-white">{lead.name}</div>
                                <div className="text-xs text-gray-500">{lead.company}</div>
                            </td>
                            <td className="p-4">
                                <div className="flex flex-col gap-1 text-xs text-gray-400">
                                    {lead.email && <span className="flex items-center gap-1"><Mail size={10} /> {lead.email}</span>}
                                    {lead.phone && <span className="flex items-center gap-1"><Phone size={10} /> {lead.phone}</span>}
                                </div>
                            </td>
                            <td className="p-4">
                                <span
                                    className="px-2 py-1 rounded-sm text-[10px] font-bold border uppercase tracking-wider"
                                    style={{
                                        borderColor: `${getStageColor(lead.stage_id)}40`,
                                        backgroundColor: `${getStageColor(lead.stage_id)}10`,
                                        color: getStageColor(lead.stage_id)
                                    }}
                                >
                                    {getStageName(lead.stage_id)}
                                </span>
                            </td>
                            <td className="p-4 font-mono text-sm text-gray-300">
                                {lead.value > 0 ? `R$ ${lead.value.toLocaleString('pt-BR')}` : '-'}
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2">
                                    {onConvertLead && (
                                        <button
                                            onClick={() => onConvertLead(lead)}
                                            className="p-2 hover:bg-[#D4AF37]/20 rounded-sm text-gray-500 hover:text-[#D4AF37] transition-colors"
                                            title="Converter em Associado"
                                        >
                                            <UserPlus size={16} />
                                        </button>
                                    )}
                                    <button className="p-2 hover:bg-white/10 rounded-sm text-gray-500 hover:text-white transition-colors">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredLeads.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-gray-500">Nenhum lead encontrado.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default LeadsList;
