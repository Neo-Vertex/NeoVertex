import React from 'react';

interface DashboardViewProps {
    associatesCount: number;
    servicesCount: number;
}

const DashboardView: React.FC<DashboardViewProps> = ({ associatesCount, servicesCount }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-glass p-6">
                <h3 className="text-[var(--color-text-muted)] text-sm mb-2">Total de Associados</h3>
                <p className="text-4xl font-bold text-white">{associatesCount}</p>
            </div>
            <div className="card-glass p-6">
                <h3 className="text-[var(--color-text-muted)] text-sm mb-2">Projetos Ativos</h3>
                <p className="text-4xl font-bold text-[var(--color-primary)]">
                    -
                </p>
            </div>
            <div className="card-glass p-6">
                <h3 className="text-[var(--color-text-muted)] text-sm mb-2">Serviços Ofertados</h3>
                <p className="text-4xl font-bold text-white">{servicesCount}</p>
            </div>
        </div>
    );
};

export default DashboardView;
