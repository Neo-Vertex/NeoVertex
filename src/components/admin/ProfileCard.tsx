import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Globe, Building, Calendar, Edit, FolderOpen } from 'lucide-react';
import type { Associate, Project } from '../../types';

interface ProfileCardProps {
    associate: Associate;
    projects: Project[];
    onEditProfile: (associate: Associate) => void;
    onManageProjects: (associate: Associate) => void;
    colabBrandLogo?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ associate, projects, onEditProfile, onManageProjects, colabBrandLogo }) => {
    // Calculate Subscription Status
    const activeSubscription = projects.find(p => p.maintenanceEndDate && new Date(p.maintenanceEndDate) > new Date());
    let subStatus = null;
    if (activeSubscription && activeSubscription.maintenanceEndDate) {
        const endDate = new Date(activeSubscription.maintenanceEndDate);
        const today = new Date();
        const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        subStatus = { days: diffDays, date: endDate.toLocaleDateString('pt-BR') };
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-glass p-0 overflow-hidden flex flex-col h-full group hover:border-[var(--color-primary)] transition-colors duration-300"
        >
            {/* Header / Cover */}
            <div className="h-24 bg-gradient-to-r from-[rgba(212,175,55,0.1)] to-transparent relative">
                {colabBrandLogo && (
                    <div className="absolute top-2 right-2 bg-black/50 p-1 rounded backdrop-blur-sm">
                        <img src={colabBrandLogo} alt="Colab Brand" className="h-8 w-auto object-contain" />
                    </div>
                )}
            </div>

            {/* Profile Info */}
            <div className="px-6 pb-6 flex-1 flex flex-col -mt-12">
                <div className="flex justify-between items-end mb-4">
                    <div className="relative">
                        {associate.avatar_url ? (
                            <img src={associate.avatar_url} alt={associate.full_name} className="w-24 h-24 rounded-xl border-4 border-[#0a0a0a] object-cover shadow-lg" />
                        ) : (
                            <div className="w-24 h-24 rounded-xl border-4 border-[#0a0a0a] bg-[var(--color-primary)] flex items-center justify-center text-black text-3xl font-bold shadow-lg">
                                {associate.full_name ? associate.full_name.charAt(0).toUpperCase() : associate.email.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#0a0a0a] ${subStatus ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onEditProfile(associate)}
                            className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[var(--color-primary)] hover:text-black transition-all text-[var(--color-text-muted)]"
                            title="Editar Perfil"
                        >
                            <Edit size={18} />
                        </button>
                        <button
                            onClick={() => onManageProjects(associate)}
                            className="p-2 rounded-lg bg-[rgba(255,255,255,0.05)] hover:bg-[var(--color-primary)] hover:text-black transition-all text-[var(--color-text-muted)]"
                            title="Gerenciar Projetos"
                        >
                            <FolderOpen size={18} />
                        </button>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{associate.full_name || 'Sem Nome'}</h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
                    <Mail size={14} /> {associate.email}
                </p>

                <div className="space-y-2 text-sm text-[var(--color-text-muted)] flex-1">
                    {associate.company_name && (
                        <div className="flex items-center gap-2">
                            <Building size={14} className="text-[var(--color-primary)]" />
                            <span>{associate.company_name}</span>
                        </div>
                    )}
                    {associate.phone && (
                        <div className="flex items-center gap-2">
                            <Phone size={14} className="text-[var(--color-primary)]" />
                            <span>{associate.phone}</span>
                        </div>
                    )}
                    {(associate.location || associate.country) && (
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-[var(--color-primary)]" />
                            <span>{[associate.location, associate.country].filter(Boolean).join(', ')}</span>
                        </div>
                    )}
                    {associate.language && (
                        <div className="flex items-center gap-2">
                            <Globe size={14} className="text-[var(--color-primary)]" />
                            <span className="uppercase">{associate.language}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / Status */}
            <div className="px-6 py-4 bg-[rgba(255,255,255,0.02)] border-t border-[rgba(255,255,255,0.05)]">
                {subStatus ? (
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-green-400 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Mensalidade Ativa
                        </span>
                        <span className="text-[var(--color-text-muted)] flex items-center gap-1">
                            <Calendar size={12} /> Restam {subStatus.days} dias
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--color-text-muted)] font-medium">Sem mensalidade</span>
                        <span className="text-[var(--color-text-muted)] opacity-50">--</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ProfileCard;
