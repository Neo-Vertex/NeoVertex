import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import type { CRMStage, CRMLead, CRMPipeline } from '../../types/crm';
import { MoreHorizontal, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LeadDetailsModal from './LeadDetailsModal';

interface KanbanBoardProps {
    onConvertLead?: (lead: CRMLead) => void;
}

interface KanbanBoardProps {
    onConvertLead?: (lead: CRMLead) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ onConvertLead }) => {
    const [pipelines, setPipelines] = useState<CRMPipeline[]>([]);
    const [stages, setStages] = useState<CRMStage[]>([]);
    const [leads, setLeads] = useState<CRMLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPipeline, setSelectedPipeline] = useState<string | null>(null);
    const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);
    const [draggedLead, setDraggedLead] = useState<CRMLead | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Fetch Pipelines
            const { data: pipelinesData, error: pError } = await supabase
                .from('crm_pipelines')
                .select('*')
                .order('created_at', { ascending: true });

            if (pError) throw pError;
            setPipelines(pipelinesData || []);

            if (pipelinesData && pipelinesData.length > 0) {
                const firstPipelineId = pipelinesData[0].id;
                setSelectedPipeline(firstPipelineId);

                // Fetch Stages for first pipeline
                const { data: stagesData, error: sError } = await supabase
                    .from('crm_stages')
                    .select('*')
                    .eq('pipeline_id', firstPipelineId)
                    .order('order', { ascending: true });

                if (sError) throw sError;
                setStages(stagesData || []);

                // Fetch Leads
                const { data: leadsData, error: lError } = await supabase
                    .from('crm_leads')
                    .select('*')
                    .eq('pipeline_id', firstPipelineId)
                    .eq('status', 'active'); // Only active leads

                if (lError) throw lError;
                setLeads(leadsData || []);
            }
        } catch (error) {
            console.error('Error loading CRM data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLeadsByStage = (stageId: string) => {
        return leads.filter(lead => lead.stage_id === stageId);
    };

    const handleDragStart = (lead: CRMLead) => {
        setDraggedLead(lead);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (e: React.DragEvent, targetStageId: string) => {
        e.preventDefault();
        if (!draggedLead || draggedLead.stage_id === targetStageId) return;

        // Optimistic Update
        const updatedLeads = leads.map(l =>
            l.id === draggedLead.id ? { ...l, stage_id: targetStageId } : l
        );
        setLeads(updatedLeads);
        setDraggedLead(null);

        // API Update
        const { error } = await supabase
            .from('crm_leads')
            .update({ stage_id: targetStageId })
            .eq('id', draggedLead.id);

        if (error) {
            console.error('Error updating stage:', error);
            loadData(); // Revert on error
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Carregando CRM...</div>;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header / Pipeline Selector */}
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-bold text-white tracking-wide">Pipeline de Vendas</h2>
            </div>

            {/* Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <div className="flex h-full gap-4 pb-4 min-w-[max-content]">
                    {stages.map(stage => (
                        <div
                            key={stage.id}
                            className="w-[300px] flex flex-col h-full bg-[#111111] rounded-lg border border-white/5 transition-colors hover:border-white/10"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, stage.id)}
                        >
                            {/* Column Header */}
                            <div className="p-3 border-b border-white/5 flex justify-between items-center" style={{ borderTop: `3px solid ${stage.color}` }}>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-gray-200">{stage.name}</span>
                                    <span className="bg-white/5 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                                        {getLeadsByStage(stage.id).length}
                                    </span>
                                </div>
                                <button className="text-gray-600 hover:text-white transition-colors">
                                    <MoreHorizontal size={14} />
                                </button>
                            </div>

                            {/* Column Content */}
                            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                                {getLeadsByStage(stage.id).map(lead => (
                                    <motion.div
                                        key={lead.id}
                                        layoutId={lead.id}
                                        draggable
                                        onDragStart={() => handleDragStart(lead)}
                                        onClick={() => setSelectedLead(lead)}
                                        className="bg-[#1a1a1a] p-3 rounded-sm border border-zinc-900 hover:border-[#D4AF37]/50 group cursor-pointer transition-all hover:shadow-[0_4px_20px_-1px_rgba(0,0,0,0.3)] active:cursor-grabbing"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-200 text-sm">{lead.name}</h4>
                                            {lead.value > 0 && (
                                                <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">
                                                    R$ {lead.value.toLocaleString('pt-BR')}
                                                </span>
                                            )}
                                        </div>
                                        {lead.company && (
                                            <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                                                {lead.company}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-gray-600">
                                            <div className="flex gap-2">
                                                {lead.email && <Mail size={12} className="hover:text-white" />}
                                                {lead.phone && <Phone size={12} className="hover:text-white" />}
                                            </div>
                                            <span className="text-[10px]">
                                                {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals */}


            {selectedLead && (
                <LeadDetailsModal
                    lead={selectedLead}
                    isOpen={!!selectedLead}
                    onClose={() => setSelectedLead(null)}
                    onUpdate={loadData}
                    onConvertLead={onConvertLead}
                />
            )}
        </div>
    );
};

export default KanbanBoard;
