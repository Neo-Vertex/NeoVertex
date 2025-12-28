import React, { useState } from 'react';
import KanbanBoard from './KanbanBoard';
import LeadsList from './LeadsList';
import CreateLeadModal from './CreateLeadModal';
import { Layout, Table2, Search, Filter, Plus } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import type { CRMLead } from '../../types/crm';

interface CRMViewProps {
    onConvertLead?: (lead: CRMLead) => void;
}

const CRMView: React.FC<CRMViewProps> = ({ onConvertLead }) => {
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleSuccess = () => {
        setIsModalOpen(false);
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="h-full flex flex-col">
            {/* Toolbar */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-white/5">
                    <button
                        onClick={() => setViewMode('kanban')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'kanban' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Layout size={14} /> Kanban
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Table2 size={14} /> Lista
                    </button>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar leads..."
                            className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                        />
                    </div>
                    <button className="p-2 bg-[#1a1a1a] border border-white/5 rounded-lg text-gray-400 hover:text-white transition-colors">
                        <Filter size={16} />
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{ backgroundColor: '#D4AF37', color: '#556B2F' }}
                        className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg hover:brightness-110"
                    >
                        <Plus size={16} color="#556B2F" /> NOVO LEAD
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0">
                {viewMode === 'kanban' ? (
                    <KanbanBoard key={refreshTrigger} onConvertLead={onConvertLead} />
                ) : (
                    <LeadsList key={refreshTrigger} onConvertLead={onConvertLead} />
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <CreateLeadModal
                        onClose={() => setIsModalOpen(false)}
                        onSuccess={handleSuccess}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default CRMView;
