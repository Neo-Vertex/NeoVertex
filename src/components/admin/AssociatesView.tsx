import React from 'react';
import { Plus } from 'lucide-react';
import Button from '../Button';
import type { Project, Associate } from '../../types';
import ProfileCard from './ProfileCard';

interface AssociatesViewProps {
    associates: Associate[];
    allProjects: Project[];
    startEditing: (associate: Associate, tab?: 'projects' | 'profile') => void;
    handleRemindUser: (email: string) => void;
    onNewAssociate: () => void;
}

const AssociatesView: React.FC<AssociatesViewProps> = ({ associates, allProjects, startEditing, handleRemindUser, onNewAssociate }) => {

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-white">Associados ({associates.length})</h3>
                <Button onClick={onNewAssociate}>
                    <Plus size={18} /> Novo Associado
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {associates.map((associate) => {
                    const userProjects = allProjects.filter(p => p.userId === associate.id);
                    // In a real app, we would fetch the brand logo here or have it in the associate data
                    // For now, we assume colab_brand_id might be linked to a logo URL if we had that data joined.
                    // We'll pass undefined for now unless we fetch brands.

                    return (
                        <ProfileCard
                            key={associate.id}
                            associate={associate}
                            projects={userProjects}
                            onEditProfile={() => startEditing(associate, 'profile')}
                            onManageProjects={() => startEditing(associate, 'projects')}
                        />
                    );
                })}
            </div>

            {associates.length === 0 && (
                <div className="text-center py-20 bg-[rgba(255,255,255,0.02)] rounded-xl border border-[rgba(255,255,255,0.05)]">
                    <p className="text-[var(--color-text-muted)]">Nenhum associado encontrado.</p>
                </div>
            )}
        </div>
    );
};

export default AssociatesView;
