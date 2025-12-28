import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Calendar, CreditCard, User, UserPlus, Building2, Wallet, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Button from '../Button';
import { supabase } from '../../services/supabase';
import type { FinancialRecord, Associate, Project } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { CashFlowChart, ProjectStatusChart, ExpenseBreakdownChart } from './charts/FinancialCharts';

interface FinancialViewProps {
    records: FinancialRecord[]; // Received from parent (Should be filtered for Summary, or All for List?)
    associates?: Associate[];
    onUpdate?: () => void;
    initialTab?: 'summary' | 'income' | 'expense';
    contractSales?: number; // New Prop: Total Sales (Contracts)
    selectedDate?: Date; // New Prop: Context for display
    historyRecords?: FinancialRecord[]; // For Trend Charts
    allProjects?: Project[]; // For Project Status Chart
}

const FinancialView: React.FC<FinancialViewProps> = ({
    records,
    associates = [],
    onUpdate,
    initialTab = 'summary',
    contractSales = 0,
    selectedDate,
    historyRecords = [],
    allProjects = []
}) => {
    // No local records state anymore, use props
    const [activeTab, setActiveTab] = useState<'summary' | 'income' | 'expense'>(initialTab);
    const [showSalesDetails, setShowSalesDetails] = useState(false);
    const [showSummary, setShowSummary] = useState(true);
    const [exchangeRates, setExchangeRates] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        type: 'expense' as 'income' | 'expense',
        description: '',
        amount: '',
        currency: 'BRL',
        payer: '',
        paymentMethod: '',
        date: new Date().toISOString().split('T')[0],
        taxRate: '',
        associateId: ''
    });

    useEffect(() => {
        fetchRates();
        // Removed fetchAssociates because we expect them as props or fetch if missing
    }, []);

    const fetchRates = async () => {
        try {
            const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,CHF-BRL');
            const data = await res.json();
            setExchangeRates(data);
        } catch (error) {
            console.error('Error fetching rates:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.description || !formData.amount) return;

        let exchangeRate = 1;
        if (formData.currency !== 'BRL' && exchangeRates) {
            const key = `${formData.currency}BRL`;
            if (exchangeRates[key]) {
                exchangeRate = parseFloat(exchangeRates[key].bid);
            }
        }

        const originalAmount = parseFloat(formData.amount);
        let amountInBrl = originalAmount * exchangeRate;
        let taxAmount = 0;

        if (formData.taxRate) {
            const rate = parseFloat(formData.taxRate) / 100;
            taxAmount = amountInBrl * rate;
        }

        const { error } = await supabase.from('financial_records').insert([{
            type: formData.type,
            description: formData.description,
            amount: amountInBrl,
            original_amount: originalAmount,
            currency: formData.currency,
            exchange_rate: exchangeRate,
            payer: formData.payer,
            payment_method: formData.paymentMethod,
            tax_amount: taxAmount,
            date: formData.date,
            associate_id: formData.associateId || null,
            status: 'paid' // Default to paid for manual entries
        }]);

        if (!error) {
            setFormData({
                type: 'expense',
                description: '',
                amount: '',
                currency: 'BRL',
                payer: '',
                paymentMethod: '',
                date: new Date().toISOString().split('T')[0],
                taxRate: '',
                associateId: ''
            });
            if (onUpdate) onUpdate();
        } else {
            alert('Erro ao salvar registro.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este registro?')) return;
        const { error } = await supabase.from('financial_records').delete().eq('id', id);
        if (!error) {
            if (onUpdate) onUpdate();
        } else {
            alert('Erro ao excluir.');
        }
    };

    const handleDeleteProject = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja excluir o projeto "${name}"? Esta ação não pode ser desfeita.`)) return;

        try {
            const { error } = await supabase.from('projects').delete().eq('id', id);
            if (error) throw error;
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Erro ao excluir projeto.');
        }
    };

    const formatCurrency = (value: number, currency = 'BRL') => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency }).format(value);
    };

    // --- Advanced Metrics Calculation ---
    const metrics = useMemo(() => {
        const incomeRecords = records.filter(r => r.type === 'income');
        const expenseRecords = records.filter(r => r.type === 'expense');

        // Total Received: Income with status 'paid' (or null as legacy paid)
        const totalReceived = incomeRecords
            .filter(r => r.status === 'paid' || !r.status)
            .reduce((acc, r) => acc + r.amount, 0);

        // To Receive: Income with status 'pending'
        const totalToReceive = incomeRecords
            .filter(r => r.status === 'pending')
            .reduce((acc, r) => acc + r.amount, 0);

        const totalExpense = expenseRecords.reduce((acc, r) => acc + r.amount, 0);

        const netResult = totalReceived - totalExpense;

        // Top Spender Calculation
        const expenseByAssociate: Record<string, number> = {};
        expenseRecords.forEach(r => {
            if (r.associate_id) {
                expenseByAssociate[r.associate_id] = (expenseByAssociate[r.associate_id] || 0) + r.amount;
            }
        });

        let topSpenderId = '';
        let topSpenderValue = 0;

        Object.entries(expenseByAssociate).forEach(([id, val]) => {
            if (val > topSpenderValue) {
                topSpenderValue = val;
                topSpenderId = id;
            }
        });

        const topSpenderName = topSpenderId
            ? associates.find(a => a.id === topSpenderId)?.company_name || associates.find(a => a.id === topSpenderId)?.full_name || 'Desconhecido'
            : '-';

        return {
            totalReceived,
            totalToReceive,
            totalExpense,
            netResult,
            topSpenderName,
            topSpenderValue
        };
    }, [records, associates]);

    const newAssociatesCount = useMemo(() => {
        if (!associates) return 0;
        const start = new Date(selectedDate?.getFullYear() || new Date().getFullYear(), selectedDate?.getMonth() || new Date().getMonth(), 1);
        const end = new Date(selectedDate?.getFullYear() || new Date().getFullYear(), (selectedDate?.getMonth() || new Date().getMonth()) + 1, 0);
        end.setHours(23, 59, 59, 999);

        return associates.filter(a => {
            if (!a.created_at) return false;
            const cDate = new Date(a.created_at);
            return cDate >= start && cDate <= end;
        }).length;
    }, [associates, selectedDate]);

    const alertsCount = useMemo(() => {
        if (!allProjects) return 0;
        return allProjects.filter(p => {
            if (!p.maintenanceEndDate) return false;
            const diff = Math.ceil((new Date(p.maintenanceEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return diff <= 5 && diff >= 0;
        }).length;
    }, [allProjects]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-8">
            {/* Dashboard Header with Minimize Toggle */}
            <div className="flex justify-end mb-2">
                <button
                    onClick={() => setShowSummary(!showSummary)}
                    className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] hover:text-white flex items-center gap-2 transition-colors"
                >
                    {showSummary ? (
                        <>Minimizar <TrendingDown size={14} className="rotate-180" /></>
                    ) : (
                        <>Expandir Resumo <TrendingDown size={14} /></>
                    )}
                </button>
            </div>

            {/* Advanced Dashboard Grid */}
            <AnimatePresence>
                {showSummary && (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    >
                        {/* 1. Vendas (Contratos) */}
                        <motion.div
                            variants={itemVariants}
                            className={`card-glass p-5 relative group hover:border-[var(--color-primary)] transition-colors cursor-pointer ${showSalesDetails ? 'z-[100] border-[var(--color-primary)]' : ''}`}
                            onClick={() => setShowSalesDetails(!showSalesDetails)}
                        >
                            <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-20 transition-opacity">
                                <User size={64} />
                            </div>
                            <h3 className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider mb-1">Vendas (Contratos)</h3>
                            <p className="text-2xl font-bold text-[var(--color-text)]">{formatCurrency(contractSales)}</p>
                            <div className="text-[10px] text-gray-500 mt-2 space-y-1">
                                <div className="flex justify-between items-center">
                                    <span>Novos projetos iniciados</span>
                                    <Activity size={12} className="text-[var(--color-primary)]" />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>{newAssociatesCount} Novos associados</span>
                                    <UserPlus size={12} className="text-[var(--color-primary)]" />
                                </div>
                            </div>

                            {/* Breakdown List - Toggle on Click */}
                            {showSalesDetails && (
                                <div className="absolute left-0 top-full mt-2 w-full bg-[#09090b] border border-white/20 rounded-xl p-3 shadow-[0_0_30px_rgba(0,0,0,0.8)] z-[101]">
                                    <p className="text-[10px] font-bold text-[var(--color-primary)] mb-2 uppercase border-b border-white/10 pb-1 flex justify-between items-center">
                                        Projetos do Mês
                                        <span className="text-[9px] text-gray-500 normal-case hover:text-white transition-colors">(Fechar)</span>
                                    </p>
                                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
                                        {(() => {
                                            const start = new Date((selectedDate || new Date()).getFullYear(), (selectedDate || new Date()).getMonth(), 1);
                                            const end = new Date((selectedDate || new Date()).getFullYear(), (selectedDate || new Date()).getMonth() + 1, 0);
                                            end.setHours(23, 59, 59, 999);

                                            const filtered = allProjects.filter(p => {
                                                if (!p.startDate) return false;
                                                const pDate = new Date(p.startDate);
                                                return pDate >= start && pDate <= end;
                                            });

                                            return filtered.length > 0 ? filtered.map(p => (
                                                <div key={p.id} className="flex justify-between items-center text-[10px] text-gray-300 group/item hover:bg-white/5 p-1.5 rounded transition-colors border-b border-white/5 last:border-0">
                                                    <span className="truncate max-w-[55%]" title={p.service}>{p.service}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-white">{formatCurrency(p.value)}</span>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteProject(p.id, p.service); }}
                                                            className="opacity-0 group-hover/item:opacity-100 p-1 hover:text-red-500 transition-all bg-white/5 rounded-full"
                                                            title="Excluir Projeto"
                                                        >
                                                            <Trash2 size={10} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )) : <p className="text-[10px] text-gray-500 italic">Nenhum projeto encontrado.</p>;
                                        })()}
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* 2. Receita (Caixa) */}
                        <motion.div variants={itemVariants} className="card-glass p-5 relative overflow-hidden group hover:border-green-500/50 transition-colors">
                            <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-20 transition-opacity">
                                <Wallet size={64} />
                            </div>
                            <h3 className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider mb-1">Caixa (Recebido)</h3>
                            <p className="text-2xl font-bold text-green-400">{formatCurrency(metrics.totalReceived)}</p>
                            <div className="text-[10px] text-green-500/50 mt-2 flex items-center gap-1">
                                <ArrowUpRight size={10} /> Entradas efetivadas
                            </div>
                        </motion.div>

                        {/* 3. A Receber (Previsão) */}
                        <motion.div variants={itemVariants} className="card-glass p-5 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                            <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-20 transition-opacity">
                                <Calendar size={64} />
                            </div>
                            <h3 className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider mb-1">A Receber</h3>
                            <p className="text-2xl font-bold text-blue-400">{formatCurrency(metrics.totalToReceive)}</p>
                            <div className="text-[10px] text-blue-500/50 mt-2 flex items-center gap-1">
                                <Activity size={10} /> Pendente no mês
                            </div>
                        </motion.div>

                        {/* 4. Despesas */}
                        <motion.div variants={itemVariants} className="card-glass p-5 relative overflow-hidden group hover:border-red-500/50 transition-colors">
                            <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-20 transition-opacity">
                                <TrendingDown size={64} />
                            </div>
                            <h3 className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider mb-1">Despesas</h3>
                            <p className="text-2xl font-bold text-red-400">{formatCurrency(metrics.totalExpense)}</p>
                            <div className="text-[10px] text-red-500/50 mt-2 flex items-center gap-1">
                                <ArrowDownRight size={10} /> Saídas totais
                            </div>
                        </motion.div>

                        {/* 5. Maior Gasto */}
                        <motion.div variants={itemVariants} className="card-glass p-5 relative overflow-hidden group hover:border-orange-500/50 transition-colors">
                            <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-20 transition-opacity">
                                <Building2 size={64} />
                            </div>
                            <h3 className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider mb-1">Maior Gasto</h3>
                            <p className="text-lg font-bold text-orange-400 truncate" title={metrics.topSpenderName}>
                                {metrics.topSpenderName}
                            </p>
                            <p className="text-sm text-gray-400">{formatCurrency(metrics.topSpenderValue)}</p>
                        </motion.div>

                        {/* 6. Alertas (Vencimento) */}
                        <motion.div variants={itemVariants} className="card-glass p-5 relative overflow-hidden group hover:border-red-500/50 transition-colors">
                            <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-20 transition-opacity">
                                <Activity size={64} />
                            </div>
                            <h3 className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider mb-1">Alertas (Vencimento)</h3>
                            <p className="text-2xl font-bold text-red-500">{alertsCount}</p>
                            <div className="text-[10px] text-red-500/50 mt-2 flex items-center gap-1">
                                <Activity size={10} /> Projetos vencendo (5 dias)
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Charts Section */}
            {activeTab === 'summary' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                    <CashFlowChart records={historyRecords.length > 0 ? historyRecords : records} selectedDate={selectedDate || new Date()} />
                    <ProjectStatusChart projects={allProjects} />
                    <ExpenseBreakdownChart records={records} associates={associates} />
                </motion.div>
            )}

            {/* Main Content Area */}
            <div className="card-glass p-6">
                {/* Tabs */}
                <div className="flex flex-wrap gap-4 mb-8 border-b border-[rgba(255,255,255,0.1)] pb-4">
                    <button
                        onClick={() => setActiveTab('summary')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 border-2 ${activeTab === 'summary'
                            ? 'border-[var(--color-primary)] bg-[rgba(212,175,55,0.1)] text-white shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                            : 'border-transparent bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10 hover:text-white hover:border-white/10'
                            }`}
                    >
                        Extrato Geral
                    </button>
                    <button
                        onClick={() => { setActiveTab('income'); setFormData(prev => ({ ...prev, type: 'income' })); }}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 border-2 ${activeTab === 'income'
                            ? 'border-green-500 bg-green-500/10 text-white shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                            : 'border-transparent bg-white/5 text-[var(--color-text-muted)] hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30'
                            }`}
                    >
                        <Plus size={16} className="inline mr-2 -mt-0.5" />
                        Nova Receita
                    </button>
                    <button
                        onClick={() => { setActiveTab('expense'); setFormData(prev => ({ ...prev, type: 'expense' })); }}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 border-2 ${activeTab === 'expense'
                            ? 'border-red-500 bg-red-500/10 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                            : 'border-transparent bg-white/5 text-[var(--color-text-muted)] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                            }`}
                    >
                        <Plus size={16} className="inline mr-2 -mt-0.5" />
                        Nova Despesa
                    </button>
                </div>

                {activeTab === 'summary' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[rgba(255,255,255,0.1)]">
                                    <th className="p-4 text-[var(--color-text-muted)] font-medium">Data</th>
                                    <th className="p-4 text-[var(--color-text-muted)] font-medium">Descrição</th>
                                    <th className="p-4 text-[var(--color-text-muted)] font-medium">Empresa/Associado</th>
                                    <th className="p-4 text-[var(--color-text-muted)] font-medium">Categoria</th>
                                    <th className="p-4 text-[var(--color-text-muted)] font-medium">Valor Original</th>
                                    <th className="p-4 text-[var(--color-text-muted)] font-medium">Valor (BRL)</th>
                                    <th className="p-4 text-[var(--color-text-muted)] font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(record => {
                                    // Resolve associate name locally if population didn't happen in backend or we rely on props
                                    const assoc = associates.find(a => a.id === record.associate_id);

                                    return (
                                        <tr key={record.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                            <td className="p-4 text-white text-sm">{new Date(record.date).toLocaleDateString('pt-BR')}</td>
                                            <td className="p-4 text-white">
                                                <div className="font-medium">{record.description}</div>
                                                <div className="text-xs text-[var(--color-text-muted)]">{record.payer} • {record.payment_method}</div>
                                            </td>
                                            <td className="p-4 text-white">
                                                {assoc ? (
                                                    <div className="flex items-center gap-2">
                                                        <Building2 size={14} className="text-[var(--color-primary)]" />
                                                        <span className="text-sm font-mono text-gray-300">
                                                            {assoc.company_name || assoc.full_name || 'Sem nome'}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-600">-</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${record.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {record.type === 'income' ? 'Receita' : 'Despesa'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-[var(--color-text-muted)] text-sm">
                                                {formatCurrency(record.original_amount, record.currency)}
                                                {record.currency !== 'BRL' && (
                                                    <div className="text-[10px]">Taxa: {record.exchange_rate?.toFixed(4)}</div>
                                                )}
                                            </td>
                                            <td className={`p-4 font-bold ${record.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                                {record.type === 'income' ? '+' : '-'} {formatCurrency(record.amount)}
                                            </td>
                                            <td className="p-4 text-right">
                                                <button onClick={() => handleDelete(record.id)} className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-full transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {records.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-[var(--color-text-muted)]">Nenhum registro encontrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm text-[var(--color-text-muted)] mb-2">Descrição</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="input-field"
                                    placeholder={activeTab === 'income' ? "Ex: Pagamento Projeto X" : "Ex: Servidor AWS"}
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm text-[var(--color-text-muted)] mb-2">
                                    {activeTab === 'income' ? 'Recebido de (Associado/Empresa)' : 'Referente a (Associado/Empresa)'}
                                </label>
                                <div className="relative">
                                    <select
                                        name="associateId"
                                        value={formData.associateId}
                                        onChange={handleInputChange}
                                        className="input-field appearance-none"
                                    >
                                        <option value="">Selecione uma empresa...</option>
                                        {associates.map(assoc => (
                                            <option key={assoc.id} value={assoc.id}>
                                                {assoc.company_name || assoc.full_name || assoc.email} {assoc.company_name ? `(${assoc.full_name})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <Building2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-[var(--color-text-muted)] mb-2">Valor</label>
                                <div className="flex gap-2">
                                    <select
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleInputChange}
                                        className="input-field w-24"
                                    >
                                        <option value="BRL">BRL</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                        <option value="CHF">CHF</option>
                                    </select>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        className="input-field flex-1"
                                        placeholder="0.00"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                {formData.currency !== 'BRL' && exchangeRates && (
                                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                        Cotação atual: 1 {formData.currency} = {exchangeRates[`${formData.currency}BRL`]?.bid} BRL
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm text-[var(--color-text-muted)] mb-2">Data</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        required
                                    />
                                    <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-[var(--color-text-muted)] mb-2">{activeTab === 'income' ? 'Pagador (Rotulo Livre)' : 'Beneficiário (Rotulo Livre)'}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="payer"
                                        value={formData.payer}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder={activeTab === 'income' ? "Ex: Cliente A (Se não for associado)" : "Ex: AWS (Se não for associado)"}
                                    />
                                    <User size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-[var(--color-text-muted)] mb-2">Método de Pagamento</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="paymentMethod"
                                        value={formData.paymentMethod}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder="Ex: PIX, Cartão de Crédito, Transferência"
                                    />
                                    <CreditCard size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-[var(--color-text-muted)] mb-2">Imposto / Taxa (%)</label>
                                <input
                                    type="number"
                                    name="taxRate"
                                    value={formData.taxRate}
                                    onChange={handleInputChange}
                                    className="input-field"
                                    placeholder="Ex: 6 (para 6%)"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-[rgba(255,255,255,0.1)]">
                            <Button type="submit" className={activeTab === 'income' ? 'bg-green-500 hover:bg-green-600 border-green-500' : 'bg-red-500 hover:bg-red-600 border-red-500'}>
                                <Plus size={18} /> {activeTab === 'income' ? 'Registrar Receita' : 'Registrar Despesa'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FinancialView;
