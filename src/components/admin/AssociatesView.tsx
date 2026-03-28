import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import type { Project, Associate } from '../../types';
import ProfileCard from './ProfileCard';

interface AssociatesViewProps {
    associates: Associate[];
    allProjects: Project[];
    startEditing: (associate: Associate, tab?: 'projects' | 'profile') => void;
    handleRemindUser: (email: string) => void;
    onNewAssociate: () => void;
    onDeleteAssociate: (id: string) => void;
    onToggleActive: (associate: Associate) => void;
    onResetPassword: (associate: Associate) => void;
}

const AssociatesView: React.FC<AssociatesViewProps> = ({ associates, allProjects, startEditing, onNewAssociate, onDeleteAssociate, onToggleActive, onResetPassword }) => {
    const [search, setSearch] = useState('');

    const filtered = associates.filter((a) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            (a.full_name && a.full_name.toLowerCase().includes(q)) ||
            (a.email && a.email.toLowerCase().includes(q)) ||
            (a.company_name && a.company_name.toLowerCase().includes(q))
        );
    });

    return (
        <div className="p-6 anim-fade-in">
            <div className="flex gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={14} aria-hidden={true} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(212,175,55,0.4)', pointerEvents: 'none' }} />
                    <input
                        className="input-field" style={{ paddingLeft: 36 }}
                        placeholder="Buscar associado..." value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    />
                </div>
                <button onClick={() => onNewAssociate()} className="btn btn-primary">
                    <Plus size={14} aria-hidden={true} /> NOVO ASSOCIADO
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((associate, index) => {
                    const userProjects = allProjects.filter((p: any) => p.userId === associate.id);

                    return (
                        <div key={associate.id} style={{ animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${index * 0.06}s both` }}>
                            <ProfileCard
                                associate={associate}
                                projects={userProjects}
                                onEditProfile={() => startEditing(associate, 'profile')}
                                onManageProjects={() => startEditing(associate, 'projects')}
                                onDelete={() => onDeleteAssociate(associate.id)}
                                onToggleActive={() => onToggleActive(associate)}
                                onResetPassword={() => onResetPassword(associate)}
                            />
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.05)]">
                    <p className="text-[var(--color-text-muted)]">Nenhum associado encontrado.</p>
                </div>
            )}
        </div>
    );
};

export default AssociatesView;
