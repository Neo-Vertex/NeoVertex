import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, User, Briefcase, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../services/supabase';

// ─── Types ──────────────────────────────────────────────────────────────────

type AppointmentType = 'meeting' | 'call' | 'deadline' | 'reminder' | 'other';
type AppointmentPriority = 'low' | 'medium' | 'high';
type AppointmentStatus = 'pending' | 'completed' | 'cancelled';

interface Appointment {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    start_at: string;
    end_at?: string;
    location?: string;
    type: AppointmentType;
    priority: AppointmentPriority;
    status: AppointmentStatus;
    related_user_id?: string;
    related_project_id?: string;
    created_at: string;
}

interface Profile {
    id: string;
    full_name?: string;
    email: string;
}

interface Project {
    id: string;
    service: string;
}

const TYPE_LABELS: Record<AppointmentType, string> = {
    meeting: 'Reunião',
    call: 'Ligação',
    deadline: 'Prazo',
    reminder: 'Lembrete',
    other: 'Outro',
};

const TYPE_COLORS: Record<AppointmentType, string> = {
    meeting: '#4F8EF7',
    call: '#22C55E',
    deadline: '#EF4444',
    reminder: '#F59E0B',
    other: '#8B5CF6',
};

const PRIORITY_COLORS: Record<AppointmentPriority, string> = {
    low: '#6B7280',
    medium: '#F59E0B',
    high: '#EF4444',
};

const PRIORITY_LABELS: Record<AppointmentPriority, string> = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
};

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// ─── Helpers ────────────────────────────────────────────────────────────────

const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

const toLocalDatetimeInput = (iso: string) => iso ? iso.slice(0, 16) : '';

// ─── Modal de Compromisso ────────────────────────────────────────────────────

interface AppointmentModalProps {
    appointment?: Appointment | null;
    defaultDate?: Date;
    profiles: Profile[];
    projects: Project[];
    currentUserId: string;
    onClose: () => void;
    onSave: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({
    appointment, defaultDate, profiles, projects, currentUserId, onClose, onSave
}) => {
    const [form, setForm] = useState({
        title: appointment?.title || '',
        description: appointment?.description || '',
        start_at: appointment ? toLocalDatetimeInput(appointment.start_at) : defaultDate
            ? `${defaultDate.toISOString().slice(0, 10)}T09:00`
            : '',
        end_at: appointment?.end_at ? toLocalDatetimeInput(appointment.end_at) : '',
        location: appointment?.location || '',
        type: (appointment?.type || 'meeting') as AppointmentType,
        priority: (appointment?.priority || 'medium') as AppointmentPriority,
        status: (appointment?.status || 'pending') as AppointmentStatus,
        related_user_id: appointment?.related_user_id || '',
        related_project_id: appointment?.related_project_id || '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.start_at) return;
        setSaving(true);
        try {
            const payload = {
                user_id: currentUserId,
                title: form.title,
                description: form.description || null,
                start_at: new Date(form.start_at).toISOString(),
                end_at: form.end_at ? new Date(form.end_at).toISOString() : null,
                location: form.location || null,
                type: form.type,
                priority: form.priority,
                status: form.status,
                related_user_id: form.related_user_id || null,
                related_project_id: form.related_project_id || null,
            };
            if (appointment?.id) {
                await supabase.from('appointments').update(payload).eq('id', appointment.id);
            } else {
                await supabase.from('appointments').insert(payload);
            }
            onSave();
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const labelClass = "block text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mb-1.5";

    return (
        <div
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-2xl shadow-2xl overflow-y-auto max-h-[90vh] rounded-2xl"
                style={{
                    background: 'rgba(8,8,18,0.95)',
                    border: '1px solid rgba(212,175,55,0.3)',
                }}
            >
                <div
                    className="flex items-center justify-between p-6"
                    style={{ borderBottom: '1px solid rgba(212,175,55,0.15)' }}
                >
                    <h2 className="text-lg font-bold text-white font-mono tracking-wider">
                        {appointment ? 'EDITAR COMPROMISSO' : 'NOVO COMPROMISSO'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Título */}
                    <div>
                        <label className={labelClass}>Título *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            className="input-field"
                            placeholder="Ex: Reunião com cliente, Prazo entrega..."
                            required
                        />
                    </div>

                    {/* Tipo e Prioridade */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Tipo</label>
                            <select
                                value={form.type}
                                onChange={e => setForm({ ...form, type: e.target.value as AppointmentType })}
                                className="input-field"
                            >
                                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Prioridade</label>
                            <select
                                value={form.priority}
                                onChange={e => setForm({ ...form, priority: e.target.value as AppointmentPriority })}
                                className="input-field"
                            >
                                {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Data/Hora */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Início *</label>
                            <input
                                type="datetime-local"
                                value={form.start_at}
                                onChange={e => setForm({ ...form, start_at: e.target.value })}
                                className="input-field"
                                required
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Fim</label>
                            <input
                                type="datetime-local"
                                value={form.end_at}
                                onChange={e => setForm({ ...form, end_at: e.target.value })}
                                className="input-field"
                            />
                        </div>
                    </div>

                    {/* Local */}
                    <div>
                        <label className={labelClass}>Local / Link</label>
                        <input
                            type="text"
                            value={form.location}
                            onChange={e => setForm({ ...form, location: e.target.value })}
                            className="input-field"
                            placeholder="Ex: Escritório, Google Meet, Zoom..."
                        />
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className={labelClass}>Descrição</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            className="input-field resize-none"
                            rows={3}
                            placeholder="Detalhes do compromisso..."
                        />
                    </div>

                    {/* Vincular Associado e Projeto */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Associado (opcional)</label>
                            <select
                                value={form.related_user_id}
                                onChange={e => setForm({ ...form, related_user_id: e.target.value })}
                                className="input-field"
                            >
                                <option value="">-- Nenhum --</option>
                                {profiles.map(p => (
                                    <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Projeto (opcional)</label>
                            <select
                                value={form.related_project_id}
                                onChange={e => setForm({ ...form, related_project_id: e.target.value })}
                                className="input-field"
                            >
                                <option value="">-- Nenhum --</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.service}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Status (somente edição) */}
                    {appointment && (
                        <div>
                            <label className={labelClass}>Status</label>
                            <select
                                value={form.status}
                                onChange={e => setForm({ ...form, status: e.target.value as AppointmentStatus })}
                                className="input-field"
                            >
                                <option value="pending">Pendente</option>
                                <option value="completed">Concluído</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-sm text-gray-300 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="btn btn-primary"
                        >
                            {saving ? 'Salvando...' : (appointment ? 'Salvar Alterações' : 'Criar Compromisso')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

// ─── Componente Principal ────────────────────────────────────────────────────

const AgendaView: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [currentUserId, setCurrentUserId] = useState('');
    const [loading, setLoading] = useState(true);

    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [filterType, setFilterType] = useState<AppointmentType | 'all'>('all');

    useEffect(() => {
        loadAll();
    }, []);

    const loadAll = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setCurrentUserId(user.id);

        const [{ data: appts }, { data: profs }, { data: projs }] = await Promise.all([
            supabase.from('appointments').select('*').order('start_at', { ascending: true }),
            supabase.from('profiles').select('id, full_name, email').eq('role', 'associate'),
            supabase.from('projects').select('id, service'),
        ]);

        if (appts) setAppointments(appts);
        if (profs) setProfiles(profs);
        if (projs) setProjects(projs);
        setLoading(false);
    };

    const deleteAppointment = async (id: string) => {
        if (!confirm('Excluir este compromisso?')) return;
        await supabase.from('appointments').delete().eq('id', id);
        loadAll();
    };

    const markStatus = async (id: string, status: AppointmentStatus) => {
        await supabase.from('appointments').update({ status }).eq('id', id);
        loadAll();
    };

    // ── Calendar logic ─────────────────────────────────────────────────────

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarDays: (Date | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
    ];

    const getAppsForDay = (day: Date) =>
        appointments.filter((a: any) => isSameDay(new Date(a.start_at), day));

    const filteredAppts = appointments.filter((a: any) =>
        (filterType === 'all' || a.type === filterType) &&
        a.status !== 'cancelled'
    );

    const upcomingAppts = filteredAppts
        .filter((a: any) => new Date(a.start_at) >= new Date(new Date().setHours(0, 0, 0, 0)))
        .slice(0, 10);

    const dayAppts = selectedDay
        ? appointments.filter((a: any) => isSameDay(new Date(a.start_at), selectedDay))
        : [];

    const today = new Date();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[var(--color-primary)]" />
            </div>
        );
    }

    return (
        <div className="p-6 anim-fade-in space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white font-mono tracking-widest uppercase">Agenda</h1>
                    <p className="text-xs text-gray-500 font-mono mt-1">Gerencie seus compromissos e reuniões</p>
                </div>
                <button
                    onClick={() => { setEditingAppointment(null); setSelectedDay(null); setIsModalOpen(true); }}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus size={16} />
                    Novo Compromisso
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-2 flex-wrap">
                {(['all', ...Object.keys(TYPE_LABELS)] as const).map(type => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type as AppointmentType | 'all')}
                        style={filterType === type && type !== 'all' ? { borderColor: TYPE_COLORS[type as AppointmentType], color: TYPE_COLORS[type as AppointmentType] } : {}}
                        className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition-all ${filterType === type
                            ? type === 'all' ? 'border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'bg-current/10'
                            : 'border-[#333] text-gray-500 hover:border-[#555] hover:text-gray-300'
                            }`}
                    >
                        {type === 'all' ? 'TODOS' : TYPE_LABELS[type as AppointmentType].toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Calendário ── */}
                <div className="panel relative overflow-hidden lg:col-span-2">
                    <div className="anim-shimmer" />
                    {/* Nav do mês */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                            className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <h2 className="text-base font-bold font-mono text-white uppercase tracking-widest">
                            {MONTHS[month]} {year}
                        </h2>
                        <button
                            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                            className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Cabeçalho dos dias */}
                    <div className="grid grid-cols-7 mb-2">
                        {WEEKDAYS.map(d => (
                            <div key={d} className="text-center text-[10px] font-mono font-bold text-gray-600 uppercase tracking-wider py-2">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Dias */}
                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day, i) => {
                            if (!day) return <div key={i} />;
                            const dayAppsAll = getAppsForDay(day);
                            const isToday = isSameDay(day, today);
                            const isSelected = selectedDay && isSameDay(day, selectedDay);

                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDay(isSelected ? null : day)}
                                    className={`relative aspect-square flex flex-col items-center justify-start pt-1.5 rounded-lg text-xs font-mono transition-all border`}
                                    style={
                                        isSelected
                                            ? { background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }
                                            : isToday
                                                ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }
                                                : { border: '1px solid transparent', color: '#6b7280' }
                                    }
                                >
                                    <span className={`text-xs font-bold ${isToday && !isSelected ? 'text-[var(--color-primary)]' : ''}`}>
                                        {day.getDate()}
                                    </span>
                                    {dayAppsAll.length > 0 && (
                                        <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                                            {dayAppsAll.slice(0, 3).map((a: any) => (
                                                <div
                                                    key={a.id}
                                                    className="w-1.5 h-1.5 rounded-full"
                                                    style={{ backgroundColor: TYPE_COLORS[a.type as AppointmentType] }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legenda */}
                    <div className="flex gap-4 mt-4 flex-wrap">
                        {Object.entries(TYPE_COLORS).map(([type, color]) => (
                            <div key={type} className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                                <span className="text-[10px] font-mono text-gray-500">{TYPE_LABELS[type as AppointmentType]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Painel Lateral ── */}
                <div className="space-y-4">
                    {/* Dia selecionado */}
                    {selectedDay && (
                        <div className="panel relative overflow-hidden">
                            <div className="anim-shimmer" />
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold font-mono text-[var(--color-primary)] uppercase tracking-wider">
                                    {selectedDay.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </h3>
                                <button
                                    onClick={() => { setEditingAppointment(null); setIsModalOpen(true); }}
                                    className="p-1.5 rounded-md bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] transition-colors"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            {dayAppts.length === 0 ? (
                                <p className="text-xs text-gray-600 font-mono py-3 text-center">Nenhum compromisso neste dia.</p>
                            ) : (
                                <div className="space-y-2">
                                    {dayAppts.map((a: any) => (
                                        <AppointmentCard
                                            key={a.id}
                                            appointment={a}
                                            profiles={profiles}
                                            projects={projects}
                                            onEdit={() => { setEditingAppointment(a); setIsModalOpen(true); }}
                                            onDelete={() => deleteAppointment(a.id)}
                                            onMarkStatus={markStatus}
                                            compact
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Próximos compromissos */}
                    <div className="panel relative overflow-hidden">
                        <div className="anim-shimmer" />
                        <h3 className="text-xs font-bold font-mono text-gray-400 uppercase tracking-wider mb-3">
                            Próximos Compromissos
                        </h3>
                        {upcomingAppts.length === 0 ? (
                            <p className="text-xs text-gray-600 font-mono py-4 text-center">Nenhum compromisso futuro.</p>
                        ) : (
                            <div className="space-y-2">
                                {upcomingAppts.map((a: any) => (
                                    <AppointmentCard
                                        key={a.id}
                                        appointment={a}
                                        profiles={profiles}
                                        projects={projects}
                                        onEdit={() => { setEditingAppointment(a); setIsModalOpen(true); }}
                                        onDelete={() => deleteAppointment(a.id)}
                                        onMarkStatus={markStatus}
                                        compact
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <AppointmentModal
                        appointment={editingAppointment}
                        defaultDate={selectedDay || undefined}
                        profiles={profiles}
                        projects={projects}
                        currentUserId={currentUserId}
                        onClose={() => { setIsModalOpen(false); setEditingAppointment(null); }}
                        onSave={loadAll}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// ─── Card de Compromisso ─────────────────────────────────────────────────────

interface AppointmentCardProps {
    appointment: Appointment;
    profiles: Profile[];
    projects: Project[];
    onEdit: () => void;
    onDelete: () => void;
    onMarkStatus: (id: string, status: AppointmentStatus) => void;
    compact?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
    appointment: a, profiles, projects, onEdit, onDelete, onMarkStatus, compact
}) => {
    const relatedProfile = profiles.find((p: any) => p.id === a.related_user_id);
    const relatedProject = projects.find((p: any) => p.id === a.related_project_id);
    const startDate = new Date(a.start_at);

    const statusIcon = a.status === 'completed'
        ? <CheckCircle size={14} className="text-green-500" />
        : a.status === 'cancelled'
            ? <XCircle size={14} className="text-red-500" />
            : <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-600" />;

    return (
        <div
            className={`card group relative transition-all cursor-pointer ${a.status === 'completed' ? 'opacity-50' : ''} ${compact ? 'p-3' : 'p-4'}`}
            style={{ borderLeftColor: TYPE_COLORS[a.type], borderLeftWidth: 3, borderLeftStyle: 'solid', borderColor: 'transparent' }}
            onClick={onEdit}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                    <button
                        onClick={e => { e.stopPropagation(); onMarkStatus(a.id, a.status === 'completed' ? 'pending' : 'completed'); }}
                        className="mt-0.5 flex-shrink-0"
                    >
                        {statusIcon}
                    </button>
                    <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold text-white truncate ${a.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                            {a.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                                <Clock size={10} />
                                {startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                {' · '}
                                {startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                            </span>
                            <span
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                                style={{ color: TYPE_COLORS[a.type], backgroundColor: `${TYPE_COLORS[a.type]}20` }}
                            >
                                {TYPE_LABELS[a.type]}
                            </span>
                            <span
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                                style={{ color: PRIORITY_COLORS[a.priority], backgroundColor: `${PRIORITY_COLORS[a.priority]}20` }}
                            >
                                {PRIORITY_LABELS[a.priority]}
                            </span>
                        </div>
                        {!compact && (
                            <div className="mt-2 space-y-1">
                                {a.location && (
                                    <p className="flex items-center gap-1 text-[10px] text-gray-500">
                                        <MapPin size={10} /> {a.location}
                                    </p>
                                )}
                                {relatedProfile && (
                                    <p className="flex items-center gap-1 text-[10px] text-gray-500">
                                        <User size={10} /> {relatedProfile.full_name || relatedProfile.email}
                                    </p>
                                )}
                                {relatedProject && (
                                    <p className="flex items-center gap-1 text-[10px] text-gray-500">
                                        <Briefcase size={10} /> {relatedProject.service}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <button
                    onClick={e => { e.stopPropagation(); onDelete(); }}
                    className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all flex-shrink-0"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

export default AgendaView;
