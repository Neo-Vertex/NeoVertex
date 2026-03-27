import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import type { FinancialRecord, Project, Associate } from '../../../types';

interface ChartProps {
    records?: FinancialRecord[];
    projects?: Project[];
    associates?: Associate[];
    selectedDate?: Date;
}


export const CashFlowChart: React.FC<ChartProps> = ({ records = [], selectedDate = new Date() }) => {
    const data = useMemo(() => {
        const year = selectedDate.getFullYear();
        // Generate all 12 months for the selected year
        const months = Array.from({ length: 12 }, (_, i) => {
            const date = new Date(year, i, 1);
            return {
                name: date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', ''),
                fullDate: date,
                income: 0,
                expense: 0
            };
        });

        records.forEach(record => {
            const recordDate = new Date(record.date);
            // Check if record belongs to the selected year
            if (recordDate.getFullYear() === year) {
                const monthIndex = recordDate.getMonth();

                if (record.type === 'income') {
                    // Check for 'paid' status or if status is missing (legacy data considered paid)
                    if (record.status === 'paid' || !record.status) {
                        months[monthIndex].income += record.amount;
                    }
                } else if (record.type === 'expense') {
                    months[monthIndex].expense += record.amount;
                }
            }
        });

        return months.map(m => ({
            name: m.name,
            Entrada: m.income,
            Saída: m.expense
        }));
    }, [records, selectedDate]);

    return (
        <div className="card-glass p-6 h-[350px] flex flex-col">
            <h3 className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-4 shrink-0">
                Fluxo de Caixa ({selectedDate.getFullYear()})
            </h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} interval={0} />
                        <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$ ${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                        />
                        <Legend />
                        <Bar dataKey="Entrada" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="Saída" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const ProjectStatusChart: React.FC<ChartProps> = ({ projects = [] }) => {
    const data = useMemo(() => {
        const stats = {
            'active': 0,
            'completed': 0,
            'maintenance': 0,
            'briefing': 0,
            'standby': 0
        };

        projects.forEach(p => {
            const status = (p.status || 'active').toLowerCase();
            if (status in stats) {
                stats[status as keyof typeof stats]++;
            } else {
                stats['active']++; // Default fallback
            }
        });

        return [
            { name: 'Ativos', value: stats.active, color: '#D4AF37' }, // Gold
            { name: 'Manutenção', value: stats.maintenance, color: '#3B82F6' }, // Blue
            { name: 'Concluídos', value: stats.completed, color: '#10B981' }, // Green
            { name: 'Briefing/Neg.', value: stats.briefing, color: '#F59E0B' }, // Amber
            { name: 'Standby/Canc.', value: stats.standby, color: '#EF4444' }, // Red
        ].filter(d => d.value > 0);
    }, [projects]);

    return (
        <div className="card-glass p-6 h-[350px] flex flex-col">
            <h3 className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-4 shrink-0">Status dos Projetos</h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const ExpenseBreakdownChart: React.FC<ChartProps> = ({ records = [], associates = [] }) => {
    const data = useMemo(() => {
        const expenses = records.filter(r => r.type === 'expense');
        const grouped: Record<string, number> = {};

        expenses.forEach(r => {
            // Determine key logic safely
            let key = "Diversos";

            if (r.associate_id) {
                const assoc = associates.find(a => a.id === r.associate_id);
                if (assoc) {
                    key = assoc.company_name || assoc.full_name || "Associado";
                } else {
                    key = "Associado Desconhecido";
                }
            } else if (r.payer) {
                key = r.payer;
            } else if (r.description) {
                // Fallback to description first word if desperate
                key = r.description.split(' ')[0] || "Outros";
            }

            grouped[key] = (grouped[key] || 0) + r.amount;
        });

        // Top 5 expenses
        return Object.entries(grouped)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [records, associates]);

    return (
        <div className="card-glass p-6 h-[350px] flex flex-col">
            <h3 className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-4 shrink-0">Maiores Despesas (Top 5)</h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                        <XAxis type="number" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value / 1000}k`} />
                        <YAxis dataKey="name" type="category" stroke="#fff" fontSize={11} tickLine={false} axisLine={false} width={100} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar dataKey="value" fill="#EF4444" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
