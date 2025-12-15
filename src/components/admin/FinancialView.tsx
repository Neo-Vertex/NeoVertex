import React, { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Calendar, CreditCard, User, RefreshCw } from 'lucide-react';
import Button from '../Button';
import { supabase } from '../../services/supabase';
import type { FinancialRecord, Expense } from '../../types';

interface FinancialViewProps {
    expenses?: Expense[]; // Legacy prop, can be ignored or migrated
    onUpdate?: () => void;
}

const FinancialView: React.FC<FinancialViewProps> = ({ onUpdate }) => {
    const [records, setRecords] = useState<FinancialRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'summary' | 'income' | 'expense'>('summary');
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
        taxRate: ''
    });

    useEffect(() => {
        loadRecords();
        fetchRates();
    }, []);

    const loadRecords = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('financial_records')
            .select('*')
            .order('date', { ascending: false });

        if (data) setRecords(data);
        setLoading(false);
    };

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
            // For income, tax reduces the net amount? Or just tracked?
            // Usually tax is an expense or a deduction. 
            // Let's assume for now it's just stored.
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
            date: formData.date
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
                taxRate: ''
            });
            loadRecords();
            if (onUpdate) onUpdate();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este registro?')) return;
        await supabase.from('financial_records').delete().eq('id', id);
        setRecords(records.filter(r => r.id !== id));
        if (onUpdate) onUpdate();
    };

    const formatCurrency = (value: number, currency = 'BRL') => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency }).format(value);
    };

    // Calculations
    const totalIncome = records.filter(r => r.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = records.filter(r => r.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const netResult = totalIncome - totalExpense;

    return (
        <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card-glass p-6 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp size={64} />
                    </div>
                    <h3 className="text-[var(--color-text-muted)] text-sm uppercase tracking-wider mb-2">Entradas (BRL)</h3>
                    <p className="text-3xl font-bold text-green-400">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="card-glass p-6 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingDown size={64} />
                    </div>
                    <h3 className="text-[var(--color-text-muted)] text-sm uppercase tracking-wider mb-2">Saídas (BRL)</h3>
                    <p className="text-3xl font-bold text-red-400">{formatCurrency(totalExpense)}</p>
                </div>
                <div className="card-glass p-6 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <DollarSign size={64} />
                    </div>
                    <h3 className="text-[var(--color-text-muted)] text-sm uppercase tracking-wider mb-2">Resultado Líquido</h3>
                    <p className={`text-3xl font-bold ${netResult >= 0 ? 'text-liquid-gold' : 'text-red-500'}`}>
                        {formatCurrency(netResult)}
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="card-glass p-6">
                {/* Tabs */}
                <div className="flex border-b border-[rgba(255,255,255,0.1)] mb-6">
                    <button
                        onClick={() => setActiveTab('summary')}
                        className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'summary' ? 'border-b-2 border-[var(--color-primary)] text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] hover:text-white'}`}
                    >
                        Extrato
                    </button>
                    <button
                        onClick={() => { setActiveTab('income'); setFormData(prev => ({ ...prev, type: 'income' })); }}
                        className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'income' ? 'border-b-2 border-green-500 text-green-500' : 'text-[var(--color-text-muted)] hover:text-white'}`}
                    >
                        Nova Receita
                    </button>
                    <button
                        onClick={() => { setActiveTab('expense'); setFormData(prev => ({ ...prev, type: 'expense' })); }}
                        className={`px-6 py-3 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'expense' ? 'border-b-2 border-red-500 text-red-500' : 'text-[var(--color-text-muted)] hover:text-white'}`}
                    >
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
                                    <th className="p-4 text-[var(--color-text-muted)] font-medium">Categoria</th>
                                    <th className="p-4 text-[var(--color-text-muted)] font-medium">Valor Original</th>
                                    <th className="p-4 text-[var(--color-text-muted)] font-medium">Valor (BRL)</th>
                                    <th className="p-4 text-[var(--color-text-muted)] font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(record => (
                                    <tr key={record.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                                        <td className="p-4 text-white text-sm">{new Date(record.date).toLocaleDateString('pt-BR')}</td>
                                        <td className="p-4 text-white">
                                            <div className="font-medium">{record.description}</div>
                                            <div className="text-xs text-[var(--color-text-muted)]">{record.payer} • {record.payment_method}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${record.type === 'income' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {record.type === 'income' ? 'Receita' : 'Despesa'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-[var(--color-text-muted)] text-sm">
                                            {formatCurrency(record.original_amount, record.currency)}
                                            {record.currency !== 'BRL' && (
                                                <div className="text-[10px]">Taxa: {record.exchange_rate.toFixed(4)}</div>
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
                                ))}
                                {records.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-[var(--color-text-muted)]">Nenhum registro encontrado.</td>
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
                                <label className="block text-sm text-[var(--color-text-muted)] mb-2">{activeTab === 'income' ? 'Pagador (Cliente)' : 'Beneficiário (Fornecedor)'}</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="payer"
                                        value={formData.payer}
                                        onChange={handleInputChange}
                                        className="input-field"
                                        placeholder={activeTab === 'income' ? "Ex: Cliente A" : "Ex: Amazon Web Services"}
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
