import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Building, Clock, Pencil, ExternalLink, Trash2, Power, MoreVertical, Smartphone, User, Lock } from 'lucide-react';
import type { Associate, Project } from '../../types';

interface ProfileCardProps {
    associate: Associate;
    projects: Project[];
    onEditProfile: (associate: Associate) => void;
    onManageProjects: (associate: Associate) => void;
    onDelete: () => void;
    onToggleActive: () => void;
    onResetPassword: () => void;
    colabBrandLogo?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ associate, projects, onEditProfile, onManageProjects, onDelete, onToggleActive, onResetPassword, colabBrandLogo }) => {
    // Calculate Subscription Status
    const activeSubscription = projects.find(p => p.maintenanceEndDate && new Date(p.maintenanceEndDate) > new Date());
    let subStatus = null;

    if (activeSubscription && activeSubscription.maintenanceEndDate) {
        const endDate = new Date(activeSubscription.maintenanceEndDate);
        const today = new Date();
        const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        subStatus = { days: diffDays, date: endDate.toLocaleDateString('pt-BR') };
    }

    const displayName = associate.full_name || associate.email.split('@')[0] || 'Associado';
    const isActive = associate.active !== false;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: isActive ? 1 : 0.7, scale: 1 }}
            onClick={() => onManageProjects(associate)}
            className={`
                group relative flex flex-col rounded-xl overflow-hidden transition-all duration-300
                bg-[#18181b] border border-[#27272a] hover:border-[var(--color-primary)] hover:shadow-lg
                cursor-pointer
            `}
        >
            <div className="p-5 flex flex-col h-full">

                {/* Header: Avatar + Info */}
                <div className="flex gap-4 mb-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        {associate.avatar_url ? (
                            <img
                                src={associate.avatar_url}
                                alt={displayName}
                                className="w-16 h-16 rounded-xl object-cover bg-[#27272a]"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-xl bg-[#27272a] flex items-center justify-center text-gray-500">
                                <User size={28} strokeWidth={1.5} />
                            </div>
                        )}

                        {/* Brand Badge */}
                        {colabBrandLogo && (
                            <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#18181b] border border-[#27272a] p-1 shadow-sm z-10">
                                <img src={colabBrandLogo} alt="Brand" className="w-full h-full object-contain" />
                            </div>
                        )}
                    </div>

                    {/* Main Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        {/* Status Badge */}
                        <div className="mb-1 flex">
                            <span className={`
                                inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border
                                ${subStatus
                                    ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                    : isActive
                                        ? 'bg-gray-800 text-gray-400 border-gray-700'
                                        : 'bg-red-500/10 text-red-500 border-red-500/20'}
                            `}>
                                {isActive && !subStatus && <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>}
                                {subStatus && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>}
                                {!isActive && <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>}

                                {subStatus ? `${subStatus.days} dias restantes` : (isActive ? 'Plano Free' : 'Inativo')}
                            </span>
                        </div>

                        <h3 className="text-base font-bold text-white truncate group-hover:text-[var(--color-primary)] transition-colors" title={displayName}>
                            {displayName}
                        </h3>

                        {associate.company_name ? (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                                <Building size={12} className="text-[var(--color-primary)]" />
                                <span className="truncate">{associate.company_name}</span>
                            </div>
                        ) : (
                            <div className="text-[10px] text-gray-600 mt-0.5 italic">Sem empresa vinculada</div>
                        )}
                    </div>
                </div>

                {/* Contact Info List */}
                <div className="space-y-2.5 mb-6 flex-1">
                    <div className="flex items-center gap-3 text-xs text-gray-400 p-2 rounded-lg bg-[#27272a]/30 border border-transparent hover:border-[#3f3f46] hover:bg-[#27272a]/50 transition-colors">
                        <Mail size={14} className="text-gray-500 shrink-0" />
                        <span className="truncate">{associate.email}</span>
                    </div>

                    {(associate.phone || associate.location) && (
                        <div className="flex items-center gap-3 text-xs text-gray-400 p-2 rounded-lg bg-[#27272a]/30 border border-transparent hover:border-[#3f3f46] hover:bg-[#27272a]/50 transition-colors">
                            {associate.phone ? <Smartphone size={14} className="text-gray-500 shrink-0" /> : <MapPin size={14} className="text-gray-500 shrink-0" />}
                            <span className="truncate">
                                {associate.phone || associate.location}
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-[#27272a]">
                    <div className="flex gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); onEditProfile(associate); }}
                            className="p-2 rounded-lg hover:bg-[#27272a] text-gray-400 hover:text-white transition-all"
                            title="Editar Dados"
                        >
                            <Pencil size={16} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-[10px] text-gray-700 font-mono select-none" title="ID do Usuário">
                            #{associate.id.slice(0, 6)}
                        </div>

                        <div className="w-[1px] h-4 bg-[#27272a]"></div>

                        <div className="flex gap-1">
                            <button
                                onClick={(e) => { e.stopPropagation(); onResetPassword(); }}
                                className="p-1.5 rounded-md hover:bg-yellow-500/10 text-gray-600 hover:text-yellow-500 transition-colors"
                                title="Redefinir Senha"
                            >
                                <Lock size={14} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleActive(); }}
                                className={`p-1.5 rounded-md hover:bg-[#27272a] transition-colors ${isActive ? 'text-gray-500 hover:text-red-400' : 'text-green-600 hover:text-green-500'}`}
                                title={isActive ? "Desativar" : "Ativar"}
                            >
                                <Power size={14} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); if (window.confirm('Excluir?')) onDelete(); }}
                                className="p-1.5 rounded-md hover:bg-red-500/10 text-gray-600 hover:text-red-500 transition-colors"
                                title="Excluir"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProfileCard;
