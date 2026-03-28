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
        <div className="chart-card h-[320px]">
            <h3>Fluxo de Caixa ({selectedDate.getFullYear()})</h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="name" stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} tickLine={false} axisLine={false} interval={0} />
                        <YAxis stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} width={40} />
                        <Tooltip
                            contentStyle={{ background: '#0a0a14', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 8, fontSize: 12, color: '#fff', padding: '8px 12px' }}
                            itemStyle={{ color: '#fff', padding: '2px 0' }}
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                            formatter={(value: number | undefined) => [`R$ ${(value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']}
                        />
                        <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', paddingTop: 8 }} />
                        <Bar dataKey="Entrada" fill="#D4AF37" radius={[4,4,0,0]} maxBarSize={32} />
                        <Bar dataKey="Saída" fill="#f87171" radius={[4,4,0,0]} maxBarSize={32} />
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
            { name: 'Manutenção', value: stats.maintenance, color: '#60a5fa' }, // Blue
            { name: 'Concluídos', value: stats.completed, color: '#4ade80' }, // Green
            { name: 'Briefing/Neg.', value: stats.briefing, color: 'rgba(212,175,55,0.2)' }, // Gold dim
            { name: 'Standby/Canc.', value: stats.standby, color: '#f87171' }, // Red
        ].filter(d => d.value > 0);
    }, [projects]);

    return (
        <div className="chart-card h-[320px]">
            <h3>Status dos Projetos</h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} cx="50%" cy="45%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.3)" strokeWidth={2} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ background: '#0a0a14', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 8, fontSize: 12, color: '#fff', padding: '8px 12px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend verticalAlign="bottom" height={32} wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
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
                const assoc = associates.find((a: any) => a.id === r.associate_id);
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
        <div className="chart-card h-[320px]">
            <h3>Maiores Despesas (Top 5)</h3>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                        <XAxis type="number" stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
                        <YAxis dataKey="name" type="category" stroke="transparent" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }} tickLine={false} axisLine={false} width={110} />
                        <Tooltip
                            contentStyle={{ background: '#0a0a14', border: '1px solid rgba(212,175,55,0.25)', borderRadius: 8, fontSize: 12, color: '#fff', padding: '8px 12px' }}
                            itemStyle={{ color: '#fff' }}
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                            formatter={(value: number | undefined) => [`R$ ${(value ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                        />
                        <Bar dataKey="value" fill="#D4AF37" radius={[0,4,4,0]} barSize={18} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
