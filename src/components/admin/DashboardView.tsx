import React from 'react';

interface DashboardViewProps {
    associatesCount: number;
    servicesCount: number;
    projects?: any[];
    associates?: any[];
    financialRecords?: any[];
}

function useCountUp(target: number, duration = 1600, start = true) {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    if (!start) return;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      setValue(Math.round(target * ease));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, start]);
  return value;
}

const DashboardView: React.FC<DashboardViewProps> = ({
    associatesCount,
    servicesCount,
    projects,
    associates,
    financialRecords,
}) => {
    const activeProjectsCount = projects?.filter((p: any) => p.status === 'active')?.length ?? 0;

    const now = new Date();
    const monthRevenue = financialRecords
        ?.filter((r: any) => {
            const d = new Date(r.date || r.created_at || '');
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        })
        .reduce((sum: number, r: any) => sum + (Number(r.amount) || 0), 0) ?? 0;

    const animAssociates = useCountUp(associatesCount);
    const animProjects = useCountUp(activeProjectsCount);
    const animRevenue = useCountUp(monthRevenue);
    const animServices = useCountUp(servicesCount);

    return (
        <div className="p-6 space-y-6 anim-fade-in">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'TOTAL ASSOCIADOS', value: animAssociates, suffix: '', sub: 'ativos na plataforma', color: 'var(--color-primary)' },
                    { label: 'PROJETOS ATIVOS',  value: animProjects,   suffix: '', sub: 'em andamento',         color: 'var(--color-info)' },
                    { label: 'RECEITA DO MÊS',   value: animRevenue,    suffix: 'R$', sub: 'faturamento mensal', color: 'var(--color-success)' },
                    { label: 'SERVIÇOS ATIVOS',  value: animServices,   suffix: '', sub: 'tipos de serviço',     color: 'rgba(212,175,55,0.8)' },
                ].map((kpi, i) => (
                    <div
                        key={kpi.label}
                        className="glass glass-top-line relative overflow-hidden rounded-2xl p-5 cursor-default transition-all duration-300 anim-fade-up"
                        style={{ animationDelay: `${i * 0.08}s` }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-3px)'; el.style.borderColor = 'rgba(212,175,55,0.28)'; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.borderColor = ''; }}
                    >
                        <div className="anim-shimmer" />
                        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(212,175,55,0.55)', marginBottom: 8 }}>{kpi.label}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                            {kpi.suffix && <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginRight: 2 }}>{kpi.suffix}</span>}
                            {kpi.value.toLocaleString('pt-BR')}
                        </div>
                        <div style={{ fontSize: 10, color: kpi.color, marginTop: 6 }}>{kpi.sub}</div>
                    </div>
                ))}
            </div>

            {/* Bottom row: charts + activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Chart panel */}
                <div className="glass glass-top-line relative rounded-2xl p-5 overflow-hidden anim-fade-up" style={{ animationDelay: '0.35s' }}>
                    <div className="anim-shimmer" />
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(212,175,55,0.55)', marginBottom: 16 }}>STATUS DOS PROJETOS</div>
                    <div className="space-y-2">
                        {(['active', 'pending', 'completed', 'cancelled'] as const).map(status => {
                            const count = projects?.filter((p: any) => p.status === status)?.length ?? 0;
                            const total = projects?.length || 1;
                            const labels: Record<string, string> = { active: 'Ativos', pending: 'Pendentes', completed: 'Concluídos', cancelled: 'Cancelados' };
                            const colors: Record<string, string> = { active: '#4ade80', pending: '#D4AF37', completed: '#60a5fa', cancelled: '#f87171' };
                            return (
                                <div key={status}>
                                    <div className="flex justify-between mb-1">
                                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{labels[status]}</span>
                                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{count}</span>
                                    </div>
                                    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.05)' }}>
                                        <div style={{ height: '100%', borderRadius: 2, background: colors[status], width: `${(count / total) * 100}%`, transition: 'width 1s ease' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent activity */}
                <div className="glass glass-top-line relative rounded-2xl p-5 overflow-hidden anim-fade-up" style={{ animationDelay: '0.45s' }}>
                    <div className="anim-shimmer" />
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(212,175,55,0.55)', marginBottom: 16 }}>ASSOCIADOS RECENTES</div>
                    <div className="space-y-3">
                        {(associates || []).slice(0, 5).map((a: any, i: number) => (
                            <div key={a.id || i} className="flex items-center gap-3">
                                <div style={{
                                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                                    background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))',
                                    border: '1px solid rgba(212,175,55,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 11, fontWeight: 700, color: '#D4AF37',
                                }}>
                                    {(a.full_name || a.name || '?')[0]?.toUpperCase()}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.full_name || a.name}</div>
                                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{a.email || ''}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardView;
