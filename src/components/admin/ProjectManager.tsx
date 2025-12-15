import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Pencil, Check, Clock, Play, Square, User, Save, Globe, Link as LinkIcon, Building } from 'lucide-react';
import { supabase } from '../../services/supabase';
import Button from '../Button';
import type { Project, Associate } from '../../types';

interface ProjectManagerProps {
    associate: Associate;
    onClose: () => void;
    initialTab?: 'projects' | 'logs' | 'profile';
}

interface ProjectLog {
    id: string;
    description: string;
    start_time: string | null;
    end_time: string | null;
    duration_minutes: number;
    created_at: string;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ associate, onClose, initialTab = 'projects' }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [logs, setLogs] = useState<ProjectLog[]>([]);
    const [activeTab, setActiveTab] = useState<'projects' | 'logs' | 'profile'>(initialTab);
    const [selectedProjectForLog, setSelectedProjectForLog] = useState<string>('');

    // Profile State
    const [profileData, setProfileData] = useState({
        full_name: '',
        phone: '',
        company_name: '',
        bio: '',
        location: '',
        country: '',
        avatar_url: '',
        language: 'pt-BR',
        is_colab: false,
        colab_brand_id: '',
        colab_logo_url: ''
    });
    const [colabBrands, setColabBrands] = useState<any[]>([]);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // New Project State
    const [newProjectService, setNewProjectService] = useState('');
    const [newProjectValue, setNewProjectValue] = useState('');
    const [newProjectCurrency, setNewProjectCurrency] = useState('BRL');
    const [newProjectHours, setNewProjectHours] = useState('');
    const [newProjectMaintenance, setNewProjectMaintenance] = useState('');
    const [newProjectUrl, setNewProjectUrl] = useState('');

    // Editing State
    const [editingProjectHours, setEditingProjectHours] = useState<string | null>(null);
    const [tempHours, setTempHours] = useState('');

    // Timer State
    const [activeTimer, setActiveTimer] = useState<{ projectId: string, startTime: number } | null>(null);
    const [timerDuration, setTimerDuration] = useState(0);
    const [isStopModalOpen, setIsStopModalOpen] = useState(false);
    const [logDescription, setLogDescription] = useState('');

    // Manual Entry State
    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
    const [manualDuration, setManualDuration] = useState('');
    const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadProjects();
        loadProfile();
        loadBrands();
        // Check for active timer in local storage
        const savedTimer = localStorage.getItem('neovertex_active_timer');
        if (savedTimer) {
            const parsed = JSON.parse(savedTimer);
            setActiveTimer(parsed);
        }
    }, [associate.id]);

    useEffect(() => {
        let interval: any;
        if (activeTimer) {
            interval = setInterval(() => {
                setTimerDuration(Math.floor((Date.now() - activeTimer.startTime) / 1000));
            }, 1000);
        } else {
            setTimerDuration(0);
        }
        return () => clearInterval(interval);
    }, [activeTimer]);

    const loadBrands = async () => {
        const { data } = await supabase.from('colab_brands').select('*');
        if (data) setColabBrands(data);
    };

    const loadProjects = async () => {
        const { data } = await supabase.from('projects').select('*').eq('user_id', associate.id);
        if (data) {
            setProjects(data.map(p => ({
                id: p.id,
                userId: p.user_id,
                service: p.service,
                status: p.status,
                startDate: p.start_date,
                value: p.value,
                currency: p.currency,
                hoursBalance: p.hours_balance,
                maintenanceEndDate: p.maintenance_end_date,
                projectUrl: p.project_url
            })));
            if (data.length > 0 && !selectedProjectForLog) {
                setSelectedProjectForLog(data[0].id);
            }
        }
    };

    const loadProfile = async () => {
        const { data } = await supabase.from('profiles').select(`
            *,
            colab_brands (
                id,
                name,
                logo_url
            )
        `).eq('id', associate.id).single();

        if (data) {
            setProfileData({
                full_name: data.full_name || '',
                phone: data.phone || '',
                company_name: data.company_name || '',
                bio: data.bio || '',
                location: data.location || '',
                country: data.country || '',
                avatar_url: data.avatar_url || '',
                language: data.language || 'pt-BR',
                is_colab: data.is_colab || false,
                colab_brand_id: data.colab_brand_id || '',
                colab_logo_url: data.colab_brands?.logo_url || ''
            });
        }
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);

        const { error: profileError } = await supabase.from('profiles').update({
            full_name: profileData.full_name,
            phone: profileData.phone,
            company_name: profileData.company_name,
            bio: profileData.bio,
            location: profileData.location,
            country: profileData.country,
            avatar_url: profileData.avatar_url,
            language: profileData.language,
            is_colab: profileData.is_colab,
            colab_brand_id: profileData.is_colab ? profileData.colab_brand_id : null
        }).eq('id', associate.id);

        if (profileError) {
            console.error('Error updating profile:', profileError);
            alert('Erro ao salvar perfil.');
            setIsSavingProfile(false);
            return;
        }

        if (profileData.is_colab && profileData.colab_brand_id && profileData.colab_logo_url) {
            const { error: brandError } = await supabase.from('colab_brands').update({
                logo_url: profileData.colab_logo_url
            }).eq('id', profileData.colab_brand_id);

            if (brandError) console.error('Error updating brand logo:', brandError);
        }

        alert('Perfil atualizado com sucesso!');
        setIsSavingProfile(false);
    };

    const loadLogs = async (projectId: string) => {
        const { data } = await supabase
            .from('project_logs')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });
        if (data) setLogs(data);
    };

    useEffect(() => {
        if (activeTab === 'logs' && selectedProjectForLog) {
            loadLogs(selectedProjectForLog);
        }
    }, [activeTab, selectedProjectForLog]);

    const handleStartTimer = (projectId: string) => {
        if (activeTimer) return; // Only one timer at a time
        const startTime = Date.now();
        const timerData = { projectId, startTime };
        setActiveTimer(timerData);
        localStorage.setItem('neovertex_active_timer', JSON.stringify(timerData));
    };

    const handleStopTimer = () => {
        setIsStopModalOpen(true);
    };

    const confirmStopTimer = async () => {
        if (!activeTimer || !logDescription) return;

        const endTime = Date.now();
        const durationMinutes = Math.ceil((endTime - activeTimer.startTime) / 60000);

        // 1. Create Log
        await supabase.from('project_logs').insert([{
            project_id: activeTimer.projectId,
            description: logDescription,
            start_time: new Date(activeTimer.startTime).toISOString(),
            end_time: new Date(endTime).toISOString(),
            duration_minutes: durationMinutes
        }]);

        // 2. Update Project Balance (Deduct hours)
        const project = projects.find(p => p.id === activeTimer.projectId);
        if (project) {
            const newBalance = project.hoursBalance - (durationMinutes / 60);
            await supabase.from('projects').update({ hours_balance: newBalance }).eq('id', project.id);
            // Update local state
            setProjects(projects.map(p => p.id === project.id ? { ...p, hoursBalance: newBalance } : p));
        }

        // Reset
        setActiveTimer(null);
        localStorage.removeItem('neovertex_active_timer');
        setLogDescription('');
        setIsStopModalOpen(false);
        if (activeTab === 'logs') loadLogs(activeTimer.projectId);
    };

    const handleManualEntry = async () => {
        if (!selectedProjectForLog || !manualDuration || !logDescription) return;

        const durationMinutes = parseInt(manualDuration);

        // 1. Create Log
        await supabase.from('project_logs').insert([{
            project_id: selectedProjectForLog,
            description: logDescription,
            duration_minutes: durationMinutes,
            created_at: new Date(manualDate).toISOString()
        }]);

        // 2. Update Project Balance
        const project = projects.find(p => p.id === selectedProjectForLog);
        if (project) {
            const newBalance = project.hoursBalance - (durationMinutes / 60);
            await supabase.from('projects').update({ hours_balance: newBalance }).eq('id', project.id);
            setProjects(projects.map(p => p.id === project.id ? { ...p, hoursBalance: newBalance } : p));
        }

        setLogDescription('');
        setManualDuration('');
        setIsManualEntryOpen(false);
        loadLogs(selectedProjectForLog);
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleAddProject = async () => {
        if (!newProjectService || !newProjectValue || !newProjectHours) return;

        const { data, error } = await supabase.from('projects').insert([{
            user_id: associate.id,
            service: newProjectService,
            value: parseFloat(newProjectValue),
            currency: newProjectCurrency,
            hours_balance: parseFloat(newProjectHours),
            maintenance_end_date: newProjectMaintenance || null,
            project_url: newProjectUrl || null,
            status: 'active'
        }]).select().single();

        if (data) {
            setProjects([...projects, {
                id: data.id,
                userId: data.user_id,
                service: data.service,
                status: data.status,
                startDate: data.start_date,
                value: data.value,
                currency: data.currency,
                hoursBalance: data.hours_balance,
                maintenanceEndDate: data.maintenance_end_date,
                projectUrl: data.project_url
            }]);
            // Reset form
            setNewProjectService('');
            setNewProjectValue('');
            setNewProjectHours('');
            setNewProjectMaintenance('');
            setNewProjectUrl('');
        }
    };

    const handleRemoveProject = async (id: string) => {
        await supabase.from('projects').delete().eq('id', id);
        setProjects(projects.filter(p => p.id !== id));
    };

    const handleUpdateProjectHours = async (project: Project) => {
        if (!tempHours) return;
        const newHours = parseFloat(tempHours);
        await supabase.from('projects').update({ hours_balance: newHours }).eq('id', project.id);
        setProjects(projects.map(p => p.id === project.id ? { ...p, hoursBalance: newHours } : p));
        setEditingProjectHours(null);
        setTempHours('');
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[var(--color-bg)] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-[var(--color-primary)] shadow-2xl relative"
        >
            {/* Header */}
            <div className="sticky top-0 bg-[var(--color-bg)] z-10 p-6 border-b border-[rgba(255,255,255,0.1)] flex justify-between items-center">
                <div className="flex items-center gap-4">
                    {profileData.avatar_url ? (
                        <img src={profileData.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-[var(--color-primary)] object-cover" />
                    ) : (
                        <div className="w-12 h-12 rounded-full border-2 border-[var(--color-primary)] flex items-center justify-center bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                            <User size={24} />
                        </div>
                    )}
                    <div>
                        <h3 className="text-2xl font-bold text-white">{profileData.full_name || 'Gerenciar Associado'}</h3>
                        <p className="text-[var(--color-text-muted)]">{associate.email}</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-[var(--color-text-muted)] hover:text-white transition-colors">
                    <X size={24} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[rgba(255,255,255,0.1)]">
                <button
                    onClick={() => setActiveTab('projects')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'projects' ? 'bg-[var(--color-primary)] text-black' : 'text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.05)]'}`}
                >
                    Projetos
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'logs' ? 'bg-[var(--color-primary)] text-black' : 'text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.05)]'}`}
                >
                    Logs de Tempo
                </button>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'profile' ? 'bg-[var(--color-primary)] text-black' : 'text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.05)]'}`}
                >
                    Perfil
                </button>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'projects' && (
                    <div className="space-y-6">
                        {/* Add Project Form */}
                        <div className="bg-[rgba(255,255,255,0.03)] p-4 rounded-lg border border-[rgba(255,255,255,0.05)]">
                            <h4 className="text-sm font-bold text-[var(--color-primary)] mb-4 uppercase tracking-wider">Novo Projeto</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Nome do Serviço"
                                    value={newProjectService}
                                    onChange={e => setNewProjectService(e.target.value)}
                                    className="input-field"
                                />
                                <div className="flex gap-2">
                                    <select
                                        value={newProjectCurrency}
                                        onChange={e => setNewProjectCurrency(e.target.value)}
                                        className="input-field w-24"
                                    >
                                        <option value="BRL">R$</option>
                                        <option value="USD">$</option>
                                        <option value="EUR">€</option>
                                        <option value="CHF">Fr</option>
                                    </select>
                                    <input
                                        type="number"
                                        placeholder="Valor"
                                        value={newProjectValue}
                                        onChange={e => setNewProjectValue(e.target.value)}
                                        className="input-field flex-1"
                                    />
                                </div>
                                <input
                                    type="number"
                                    placeholder="Horas Contratadas"
                                    value={newProjectHours}
                                    onChange={e => setNewProjectHours(e.target.value)}
                                    className="input-field"
                                />
                                <input
                                    type="date"
                                    placeholder="Fim da Manutenção"
                                    value={newProjectMaintenance}
                                    onChange={e => setNewProjectMaintenance(e.target.value)}
                                    className="input-field"
                                />
                                <div className="md:col-span-2">
                                    <input
                                        type="url"
                                        placeholder="URL do Projeto (Link)"
                                        value={newProjectUrl}
                                        onChange={e => setNewProjectUrl(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <Button onClick={handleAddProject}>
                                    <Plus size={18} /> Adicionar Projeto
                                </Button>
                            </div>
                        </div>

                        {/* Projects List */}
                        <div className="space-y-4">
                            {projects.map(project => (
                                <div key={project.id} className="bg-[rgba(255,255,255,0.03)] p-4 rounded-lg border border-[rgba(255,255,255,0.05)] flex justify-between items-center">
                                    <div>
                                        <h4 className="font-bold text-white flex items-center gap-2">
                                            {project.service}
                                            {project.projectUrl && (
                                                <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:text-white">
                                                    <LinkIcon size={14} />
                                                </a>
                                            )}
                                        </h4>
                                        <div className="flex gap-4 text-xs text-[var(--color-text-muted)] mt-1">
                                            <span>Início: {new Date(project.startDate).toLocaleDateString('pt-BR')}</span>
                                            {project.maintenanceEndDate && (
                                                <span>Manutenção até: {new Date(project.maintenanceEndDate).toLocaleDateString('pt-BR')}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xs text-[var(--color-text-muted)]">Saldo de Horas</p>
                                            {editingProjectHours === project.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={tempHours}
                                                        onChange={e => setTempHours(e.target.value)}
                                                        className="w-20 bg-black/50 border border-[var(--color-primary)] rounded px-2 py-1 text-white text-sm"
                                                    />
                                                    <button onClick={() => handleUpdateProjectHours(project)} className="text-green-400 hover:text-green-300"><Check size={16} /></button>
                                                    <button onClick={() => setEditingProjectHours(null)} className="text-red-400 hover:text-red-300"><X size={16} /></button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 justify-end">
                                                    <span className={`text-lg font-bold ${project.hoursBalance > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {project.hoursBalance.toFixed(1)}h
                                                    </span>
                                                    <button onClick={() => { setEditingProjectHours(project.id); setTempHours(project.hoursBalance.toString()); }} className="text-[var(--color-text-muted)] hover:text-white">
                                                        <Pencil size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <button onClick={() => handleRemoveProject(project.id)} className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-full transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {projects.length === 0 && (
                                <p className="text-center text-[var(--color-text-muted)] py-8">Nenhum projeto cadastrado.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="space-y-6">
                        {/* Timer Controls */}
                        <div className="bg-[rgba(255,255,255,0.03)] p-6 rounded-lg border border-[rgba(255,255,255,0.05)] text-center">
                            <div className="mb-6">
                                <label className="block text-sm text-[var(--color-text-muted)] mb-2">Selecione o Projeto</label>
                                <select
                                    value={selectedProjectForLog}
                                    onChange={e => setSelectedProjectForLog(e.target.value)}
                                    className="input-field max-w-md mx-auto"
                                >
                                    <option value="">Selecione um projeto...</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.service}</option>
                                    ))}
                                </select>
                            </div>

                            {activeTimer ? (
                                <div className="space-y-4">
                                    <div className="text-6xl font-mono font-bold text-[var(--color-primary)] animate-pulse">
                                        {formatTime(timerDuration)}
                                    </div>
                                    <p className="text-[var(--color-text-muted)]">Em andamento: {projects.find(p => p.id === activeTimer.projectId)?.service}</p>
                                    <Button onClick={() => setIsStopModalOpen(true)} className="w-full bg-red-500 hover:bg-red-600 border-red-500 text-white justify-center">
                                        <Square size={18} fill="currentColor" className="mr-2" /> Parar Timer
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4 items-center">
                                    <Button
                                        onClick={() => selectedProjectForLog && handleStartTimer(selectedProjectForLog)}
                                        disabled={!selectedProjectForLog}
                                        className="w-full max-w-xs"
                                    >
                                        <Play size={18} fill="currentColor" /> Iniciar Timer
                                    </Button>
                                    <div className="text-[var(--color-text-muted)] text-sm">- ou -</div>
                                    <button
                                        onClick={() => setIsManualEntryOpen(true)}
                                        className="text-[var(--color-primary)] hover:underline text-sm"
                                    >
                                        Lançamento Manual
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Logs History */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Histórico de Atividades</h4>
                            {logs.map(log => (
                                <div key={log.id} className="bg-[rgba(255,255,255,0.02)] p-4 rounded border border-[rgba(255,255,255,0.05)] flex justify-between items-center">
                                    <div>
                                        <p className="text-white font-medium">{log.description}</p>
                                        <p className="text-xs text-[var(--color-text-muted)]">{new Date(log.created_at).toLocaleString('pt-BR')}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold">
                                        <Clock size={14} />
                                        <span>{log.duration_minutes} min</span>
                                    </div>
                                </div>
                            ))}
                            {logs.length === 0 && (
                                <p className="text-center text-[var(--color-text-muted)] py-4">Nenhum registro encontrado.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <div className="bg-[rgba(255,255,255,0.03)] p-6 rounded-lg border border-[rgba(255,255,255,0.05)]">
                            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <User size={18} className="text-[var(--color-primary)]" /> Informações do Perfil
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs text-[var(--color-text-muted)] mb-1">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={profileData.full_name}
                                        onChange={e => setProfileData({ ...profileData, full_name: e.target.value })}
                                        className="input-field"
                                        placeholder="Ex: João da Silva"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--color-text-muted)] mb-1">Telefone / WhatsApp</label>
                                    <input
                                        type="text"
                                        value={profileData.phone}
                                        onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                        className="input-field"
                                        placeholder="Ex: (11) 99999-9999"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--color-text-muted)] mb-1">Nome da Empresa</label>
                                    <input
                                        type="text"
                                        value={profileData.company_name}
                                        onChange={e => setProfileData({ ...profileData, company_name: e.target.value })}
                                        className="input-field"
                                        placeholder="Ex: Minha Empresa Ltda"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--color-text-muted)] mb-1">Localização</label>
                                    <input
                                        type="text"
                                        value={profileData.location}
                                        onChange={e => setProfileData({ ...profileData, location: e.target.value })}
                                        className="input-field"
                                        placeholder="Ex: São Paulo, SP"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--color-text-muted)] mb-1">Idioma</label>
                                    <div className="relative">
                                        <select
                                            value={profileData.language}
                                            onChange={e => setProfileData({ ...profileData, language: e.target.value })}
                                            className="input-field appearance-none"
                                        >
                                            <option value="pt-BR">Português (Brasil)</option>
                                            <option value="pt-PT">Português (Portugal)</option>
                                            <option value="en-US">Inglês (US)</option>
                                            <option value="es">Espanhol</option>
                                            <option value="fr-CH">Francês</option>
                                        </select>
                                        <Globe size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--color-text-muted)] mb-1">País</label>
                                    <input
                                        type="text"
                                        value={profileData.country}
                                        onChange={e => setProfileData({ ...profileData, country: e.target.value })}
                                        className="input-field"
                                        placeholder="Ex: Brasil"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-[var(--color-text-muted)] mb-1">URL do Avatar</label>
                                    <input
                                        type="text"
                                        value={profileData.avatar_url}
                                        onChange={e => setProfileData({ ...profileData, avatar_url: e.target.value })}
                                        className="input-field"
                                        placeholder="https://exemplo.com/foto.jpg"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-[var(--color-text-muted)] mb-1">Bio / Sobre</label>
                                    <textarea
                                        value={profileData.bio}
                                        onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                                        className="input-field min-h-[100px]"
                                        placeholder="Breve descrição sobre o associado..."
                                    />
                                </div>

                                {/* Colab Section */}
                                <div className="md:col-span-2 border-t border-[rgba(255,255,255,0.1)] pt-6 mt-2">
                                    <h5 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                        <Building size={16} className="text-[var(--color-primary)]" /> Parceria / Colab
                                    </h5>
                                    <div className="flex items-center gap-4 mb-4">
                                        <input
                                            type="checkbox"
                                            id="isColab"
                                            checked={profileData.is_colab}
                                            onChange={e => setProfileData({ ...profileData, is_colab: e.target.checked })}
                                            className="w-4 h-4 rounded border-[var(--color-primary)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                        />
                                        <label htmlFor="isColab" className="text-sm text-[var(--color-text-muted)]">Este associado é uma Colab?</label>
                                    </div>

                                    {profileData.is_colab && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-[var(--color-text-muted)] mb-1">Marca Parceira</label>
                                                <select
                                                    value={profileData.colab_brand_id}
                                                    onChange={e => setProfileData({ ...profileData, colab_brand_id: e.target.value })}
                                                    className="input-field"
                                                >
                                                    <option value="">Selecione...</option>
                                                    {colabBrands.map(brand => (
                                                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {profileData.colab_brand_id && (
                                                <div>
                                                    <label className="block text-xs text-[var(--color-text-muted)] mb-1">URL da Logo da Marca</label>
                                                    <input
                                                        type="text"
                                                        value={profileData.colab_logo_url}
                                                        onChange={e => setProfileData({ ...profileData, colab_logo_url: e.target.value })}
                                                        className="input-field"
                                                        placeholder="https://..."
                                                    />
                                                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Isso atualizará a logo para todos os associados desta marca.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                                    {isSavingProfile ? 'Salvando...' : <><Save size={18} /> Salvar Alterações</>}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Stop Timer Modal */}
            <AnimatePresence>
                {isStopModalOpen && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1a1a1a] p-6 rounded-lg border border-[var(--color-primary)] w-full max-w-md"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Finalizar Atividade</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-[var(--color-text-muted)] mb-1">Descrição do que foi feito</label>
                                    <textarea
                                        value={logDescription}
                                        onChange={e => setLogDescription(e.target.value)}
                                        className="input-field min-h-[100px]"
                                        placeholder="Ex: Ajustes no layout da home..."
                                        autoFocus
                                    />
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <Button onClick={() => setIsStopModalOpen(false)} variant="secondary">Cancelar</Button>
                                    <Button onClick={confirmStopTimer}>Confirmar e Salvar</Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Manual Entry Modal */}
            <AnimatePresence>
                {isManualEntryOpen && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1a1a1a] p-6 rounded-lg border border-[var(--color-primary)] w-full max-w-md"
                        >
                            <h3 className="text-xl font-bold text-white mb-4">Lançamento Manual</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-[var(--color-text-muted)] mb-1">Data</label>
                                    <input
                                        type="date"
                                        value={manualDate}
                                        onChange={e => setManualDate(e.target.value)}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[var(--color-text-muted)] mb-1">Duração (minutos)</label>
                                    <input
                                        type="number"
                                        value={manualDuration}
                                        onChange={e => setManualDuration(e.target.value)}
                                        className="input-field"
                                        placeholder="Ex: 60"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-[var(--color-text-muted)] mb-1">Descrição</label>
                                    <textarea
                                        value={logDescription}
                                        onChange={e => setLogDescription(e.target.value)}
                                        className="input-field min-h-[100px]"
                                        placeholder="Ex: Reunião de alinhamento..."
                                    />
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <Button onClick={() => setIsManualEntryOpen(false)} variant="secondary">Cancelar</Button>
                                    <Button onClick={handleManualEntry}>Salvar Lançamento</Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div >
    );
};

export default ProjectManager;
