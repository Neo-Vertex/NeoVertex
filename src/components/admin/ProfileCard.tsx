import React from 'react';
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
    const activeSubscription = projects.find((p: any) => p.maintenanceEndDate && new Date(p.maintenanceEndDate) > new Date());
    let subStatus = null;

    if (activeSubscription && activeSubscription.maintenanceEndDate) {
        const endDate = new Date(activeSubscription.maintenanceEndDate);
        const today = new Date();
        const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        subStatus = { days: diffDays, date: endDate.toLocaleDateString('pt-BR') };
    }

    const displayName = associate.full_name || associate.email.split('@')[0] || 'Associado';
    const isActive = associate.active !== false;

    const initials = displayName
        .split(' ')
        .map((n: string) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div
            className="glass glass-top-line relative rounded-2xl p-5 overflow-hidden cursor-pointer transition-all duration-300"
            onClick={() => onManageProjects(associate)}
            onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(-4px)';
                el.style.borderColor = 'rgba(212,175,55,0.28)';
                el.style.boxShadow = '0 16px 40px rgba(212,175,55,0.1)';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = '';
                el.style.borderColor = '';
                el.style.boxShadow = '';
            }}
        >
            <div className="anim-shimmer" />

            <div className="flex flex-col h-full">

                {/* Header: Avatar + Info */}
                <div className="flex gap-4 mb-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        {associate.avatar_url ? (
                            <img
                                src={associate.avatar_url}
                                alt={displayName}
                                style={{
                                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                    background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))',
                                    border: '1px solid rgba(212,175,55,0.2)',
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            <div
                                style={{
                                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                                    background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))',
                                    border: '1px solid rgba(212,175,55,0.2)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 14, fontWeight: 700, color: '#D4AF37',
                                }}
                            >
                                {initials || <User size={18} strokeWidth={1.5} />}
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
                            {isActive ? (
                                <span style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)', fontSize: 9, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                                    {subStatus ? `${subStatus.days} dias restantes` : 'Ativo'}
                                </span>
                            ) : (
                                <span style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)', fontSize: 9, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                                    Inativo
                                </span>
                            )}
                        </div>

                        <h3
                            style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}
                            className="truncate"
                            title={displayName}
                        >
                            {displayName}
                        </h3>

                        {associate.email && (
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }} className="truncate mt-0.5">
                                {associate.email}
                            </div>
                        )}

                        {associate.company_name && (
                            <div className="flex items-center gap-1.5 mt-0.5" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                                <Building size={11} style={{ color: '#D4AF37', flexShrink: 0 }} />
                                <span className="truncate">{associate.company_name}</span>
                            </div>
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
        </div>
    );
};

export default ProfileCard;
