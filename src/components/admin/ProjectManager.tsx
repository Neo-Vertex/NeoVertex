import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    Plus,
    Trash2,
    Calendar,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Check,
    Briefcase,
    Pencil,
    X,
    MessageSquare,
    Save,
    Link as LinkIcon,
    User,
    Building,
    Smartphone,
    Mail,
    Settings,
    GitCommit,
    AlarmClock,
    RefreshCw
} from 'lucide-react';
import { supabase } from '../../services/supabase';
import Button from '../Button';
import type { Project, Associate, FinancialRecord } from '../../types';

interface ProjectManagerProps {
    associate: Associate;
    onClose: () => void;
    initialTab?: 'projects' | 'logs' | 'profile' | 'financial';
}

interface ProjectLog {
    id: string;
    description: string;
    created_at: string;
}

interface ServiceOption {
    id: string;
    name: string;
}

// Componente de Timeline com Interação de Clique
const ProjectStatusTimeline = ({
    stages = ['Contratado', 'Em Desenvolvimento', 'Concluído'],
    currentStatus,
    onStatusChange,
    readOnly = false
}: {
    stages?: string[],
    currentStatus: string,
    onStatusChange?: (status: string) => void,
    readOnly?: boolean
}) => {
    const steps = stages;

    if (steps.length === 0) {
        return (
            <div className="py-8 px-4 w-full text-center border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                <p className="text-sm text-[var(--color-text-muted)] mb-2">Timeline não configurada</p>
                <div className="text-xs text-[var(--color-primary)] flex justify-center items-center gap-1 opacity-70">
                    <Settings size={12} /> Clique na engrenagem para adicionar etapas
                </div>
            </div>
        );
    }

    const currentIndex = steps.indexOf(currentStatus);
    const progress = Math.max(0, currentIndex / (steps.length - 1));

    // Calcular deslocamento para alinhar trilha com centros dos primeiro e último passos
    // Cada passo ocupa 1/N da largura. O centro está em 1/2N.
    const halfStepPercent = 100 / (steps.length * 2);

    return (
        <div className="py-8 px-4 select-none w-full">
            <div className="relative">
                {/* Fundo da Trilha */}
                <div
                    className="absolute top-[5px] h-1 bg-white/5 rounded-full overflow-hidden z-0"
                    style={{ left: `${halfStepPercent}%`, right: `${halfStepPercent}%` }}
                >
                    {/* Trilha Ativa */}
                    <motion.div
                        className="h-full bg-gradient-to-r from-[var(--color-primary-dim)] to-[var(--color-primary)]"
                        initial={{ width: `${progress * 100}%` }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    />
                </div>

                {/* Indicador Knob Ativo (Posição Animada) */}
                <div
                    className="absolute top-[5px] h-1 z-20 pointer-events-none"
                    style={{ left: `${halfStepPercent}%`, right: `${halfStepPercent}%` }}
                >
                    <motion.div
                        animate={{ left: `${progress * 100}%` }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-[var(--color-primary)] rounded-full shadow-[0_0_15px_rgba(212,175,55,0.6)] flex items-center justify-center z-30"
                    >
                        <div className="w-1.5 h-1.5 bg-[#09090b] rounded-full" />
                    </motion.div>
                </div>

                {/* Contêiner de Passos / Etiquetas */}
                <div className="relative flex justify-between z-10 w-full">
                    {steps.map((step, index) => {
                        const isCompleted = index <= currentIndex;
                        const isCurrent = index === currentIndex;

                        return (
                            <div
                                key={step}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!readOnly && onStatusChange) {
                                        onStatusChange(step);
                                    }
                                }}
                                className={`flex flex-col items-center group/step w-0 flex-1 overflow-visible ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                                {/* Alvo de Interação do Ponto */}
                                <div className="relative p-2 -m-2 mb-2 rounded-full hover:bg-white/5 transition-colors">
                                    <div
                                        className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 bg-[#09090b] z-10
                                            ${isCompleted ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'bg-[#09090b] border-white/20 group-hover/step:border-white/40'}
                                        `}
                                    />
                                </div>

                                {/* Etiqueta */}
                                <span className={`text-[10px] uppercase font-bold tracking-wider transition-colors text-center w-[120px] leading-tight block select-none
                                        ${isCompleted ? 'text-white' : 'text-white/20 group-hover/step:text-white/40'}
                                        ${isCurrent ? 'opacity-100' : 'opacity-70'}
                                    `}>
                                    {step}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

const ProjectManager: React.FC<ProjectManagerProps> = ({ associate, onClose, initialTab = 'projects' }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [logs, setLogs] = useState<ProjectLog[]>([]);
    const [activeTab, setActiveTab] = useState<'projects' | 'logs' | 'profile' | 'financial'>(initialTab);
    const [availableServices, setAvailableServices] = useState<ServiceOption[]>([]);

    const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

    // Estado do Perfil
    const [profileData, setProfileData] = useState({
        full_name: '',
        email: '',
        phone: '',
        company_name: '',
        bio: '',
        location: '',
        country: '',
        avatar_url: '',
        language: 'pt-BR',
        is_colab: false,
        colab_brand_id: '',
        colab_logo_url: '',
        birth_date: ''
    });

    const [editingStageIndex, setEditingStageIndex] = useState<number | null>(null);
    const [editingStageName, setEditingStageName] = useState('');
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Estado de Novo Projeto
    const [newProjectService, setNewProjectService] = useState('');
    const [newProjectValue, setNewProjectValue] = useState('');
    const [newProjectCurrency, setNewProjectCurrency] = useState('BRL');
    const [newProjectUrl, setNewProjectUrl] = useState('');
    const [isAddingProject, setIsAddingProject] = useState(false);


    const [managingStagesProject, setManagingStagesProject] = useState<Project | null>(null);

    // Estado de Upgrades
    const [newUpgradeName, setNewUpgradeName] = useState('');
    const [newUpgradeValue, setNewUpgradeValue] = useState('');
    const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'stages' | 'upgrades'>('general');
    const [logDescription, setLogDescription] = useState('');

    // Estado de Edição de Log
    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    const [editingLogDescription, setEditingLogDescription] = useState('');
    const [editingLogDate, setEditingLogDate] = useState('');

    // Estado Financeiro
    const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
    const [newFinancialType, setNewFinancialType] = useState<'income' | 'expense'>('income');
    const [newFinancialMethod, setNewFinancialMethod] = useState('pix');
    const [newFinancialDesc, setNewFinancialDesc] = useState('');
    const [newFinancialAmount, setNewFinancialAmount] = useState('');
    const [newFinancialDate, setNewFinancialDate] = useState(new Date().toISOString().split('T')[0]);
    const [newFinancialRecurring, setNewFinancialRecurring] = useState(false);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const filteredFinancialRecords = useMemo(() => {
        return financialRecords.filter(rec => {
            if (!rec.date) return false;
            const [year, month] = rec.date.split('-').map(Number);
            return (month - 1) === selectedMonth && year === selectedYear;
        });
    }, [financialRecords, selectedMonth, selectedYear]);

    // Estado para Quitação de Débitos
    const [settleRecord, setSettleRecord] = useState<FinancialRecord | null>(null);
    const [settleAmount, setSettleAmount] = useState('');
    const [settleMethod, setSettleMethod] = useState('');
    const [settleDate, setSettleDate] = useState(new Date().toISOString().split('T')[0]);

    // Estado de Edição
    const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
    const [editDesc, setEditDesc] = useState('');
    const [editAmount, setEditAmount] = useState('');
    const [editDate, setEditDate] = useState('');
    const [editMethod, setEditMethod] = useState('');
    const [editType, setEditType] = useState<'income' | 'expense'>('income');
    const [editRecurring, setEditRecurring] = useState(false);

    // ... (Existing Settle Logic)

    // Função para abrir modal de edição
    const openEditModal = (record: FinancialRecord) => {
        setEditingRecord(record);
        setEditDesc(record.description);
        setEditAmount(record.amount.toString());
        setEditDate(record.date.toString());
        setEditMethod(record.payment_method || 'pix'); // Default if empty
        setEditType(record.type);
        setEditRecurring(record.is_recurring || false);
    };

    const handleSaveEdit = async () => {
        if (!editingRecord || !editDesc || !editAmount || !editDate) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }

        try {
            const { error } = await supabase
                .from('financial_records')
                .update({
                    description: editDesc,
                    amount: parseFloat(editAmount),
                    date: editDate,
                    payment_method: editMethod,
                    type: editType,
                    is_recurring: editRecurring
                })
                .eq('id', editingRecord.id);

            if (error) throw error;

            alert('Registro atualizado com sucesso!');
            setEditingRecord(null);
            loadFinancialRecords();
        } catch (error) {
            console.error('Error updating record:', error);
            alert('Erro ao atualizar registro.');
        }
    };
    // Estado para Parcelamento / Entrada (Restaurado)
    const [hasDownPayment, setHasDownPayment] = useState(false);
    const [downPaymentValue, setDownPaymentValue] = useState('');
    const [remainderDate, setRemainderDate] = useState('');

    // Helper para calcular dias até o vencimento (Recorrência Mensal Simples)
    const getDaysUntilDue = (expenseDay: number) => {
        const today = new Date();
        const currentDay = today.getDate();

        // Se o dia da despesa é hoje ou futuro próximo no mesmo mês
        if (expenseDay >= currentDay) {
            return expenseDay - currentDay;
        }

        // Se já passou este mês, seria mês que vem (ignorar alerta ou mostrar como "já passou"?)
        // Como o pedido é "avisar 5 dias antes", focamos no ciclo atual ou próximo.
        // Simplificação: Avisar apenas se estiver dentro do range [0, 5] do mês corrente.
        // Ex: Hoje 25, Despesa 30 -> Diff 5 -> Alerta.
        // Ex: Hoje 28, Despesa 2 -> (Mes que vem).

        // Melhor lógica: Próxima ocorrência real.
        let nextDate = new Date(today.getFullYear(), today.getMonth(), expenseDay);
        if (nextDate < today) {
            nextDate = new Date(today.getFullYear(), today.getMonth() + 1, expenseDay);
        }

        const diffTime = Math.abs(nextDate.getTime() - today.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const upcomingExpenses = financialRecords.filter(r => {
        if (r.type !== 'expense' || !r.is_recurring) return false;

        // Extrair dia da despesa (YYYY-MM-DD)
        const expenseDay = new Date(r.date + 'T12:00:00').getDate(); // T12 para evitar fuso
        const daysUntil = getDaysUntilDue(expenseDay);

        return daysUntil <= 5;
    });

    useEffect(() => {
        loadProjects();
        loadProfile();
        loadServices();
        loadFinancialRecords();
    }, [associate.id]);



    const loadServices = async () => {
        const { data } = await supabase.from('services').select('id, name').eq('active', true);
        if (data) setAvailableServices(data);
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
                projectUrl: p.project_url,
                stages: p.stages || [],
                upgrades: p.upgrades || []
            })));
        }
    };

    const loadProfile = async () => {
        const { data } = await supabase.from('profiles').select(`
            *,
            colab_brands ( id, name, logo_url )
        `).eq('id', associate.id).single();

        if (data) {
            setProfileData({
                full_name: data.full_name || '',
                email: associate.email || '',
                phone: data.phone || '',
                company_name: data.company_name || '',
                bio: data.bio || '',
                location: data.location || '',
                country: data.country || '',
                avatar_url: data.avatar_url || '',
                language: data.language || 'pt-BR',
                is_colab: data.is_colab || false,
                colab_brand_id: data.colab_brand_id || '',
                colab_logo_url: data.colab_brands?.logo_url || '',
                birth_date: data.birth_date || ''
            });
        } else {
            setProfileData(prev => ({ ...prev, email: associate.email }));
        }
    };

    const handleSaveProfile = async () => {
        setIsSavingProfile(true);
        const { error } = await supabase.from('profiles').update({
            full_name: profileData.full_name,
            phone: profileData.phone,
            company_name: profileData.company_name,
            bio: profileData.bio,
            location: profileData.location,
            country: profileData.country,
            avatar_url: profileData.avatar_url,
            language: profileData.language,
            is_colab: profileData.is_colab,
            colab_brand_id: profileData.is_colab ? profileData.colab_brand_id : null,
            birth_date: profileData.birth_date || null
        }).eq('id', associate.id);

        if (error) {
            alert('Erro ao salvar perfil.');
        } else {
            alert('Perfil atualizado com sucesso!');
        }
        setIsSavingProfile(false);
    };

    const loadLogs = async (projectId: string) => {
        const { data } = await supabase
            .from('project_logs')
            .select('*')
            .eq('project_id', projectId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });
        if (data) setLogs(data);
    };

    const handleAddLog = async (projectId: string) => {
        if (!logDescription) return;
        const project = projects.find(p => p.id === projectId);
        const stagePrefix = project ? `[${project.status}] ` : '';

        await supabase.from('project_logs').insert([{
            project_id: projectId,
            description: `${stagePrefix}${logDescription}`,
            created_at: new Date().toISOString()
        }]);
        setLogDescription('');
        loadLogs(projectId);
    };

    const handleDeleteLog = async (logId: string) => {
        if (!confirm('Excluir este registro?')) return;

        // Soft Delete: Atualiza deleted_at em vez de remover a linha
        await supabase.from('project_logs').update({ deleted_at: new Date().toISOString() }).eq('id', logId);

        setLogs(logs.filter(l => l.id !== logId));
    };

    const handleStartEditLog = (log: ProjectLog) => {
        setEditingLogId(log.id);
        setEditingLogDescription(log.description);
        // Formatar data para input datetime-local (YYYY-MM-DDTHH:mm)
        const date = new Date(log.created_at);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        setEditingLogDate(date.toISOString().slice(0, 16));
    };

    const handleUpdateLog = async (logId: string) => {
        if (!editingLogDescription || !editingLogDate) return;

        const { error } = await supabase.from('project_logs').update({
            description: editingLogDescription,
            created_at: new Date(editingLogDate).toISOString()
        }).eq('id', logId);

        if (error) {
            alert('Erro ao atualizar log: ' + error.message);
            return;
        }

        // Atualizar estado local
        setLogs(logs.map(l => l.id === logId ? { ...l, description: editingLogDescription, created_at: new Date(editingLogDate).toISOString() } : l));
        setEditingLogId(null);
    };

    const handleAddProject = async () => {
        if (!newProjectService || !newProjectValue) return;
        setIsAddingProject(true);
        try {
            const { data, error } = await supabase.from('projects').insert([{
                user_id: associate.id,
                service: newProjectService,
                status: 'Aguardando Início',
                start_date: new Date().toISOString(),
                value: parseFloat(newProjectValue),
                currency: newProjectCurrency,
                hours_balance: 0,
                project_url: newProjectUrl || null,
                stages: []
            }]).select().single();

            if (data && !error) {
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
                setNewProjectService('');
                setNewProjectValue('');
                setNewProjectUrl('');
                setIsAddingProject(false);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemoveProject = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Tem certeza?')) return;
        await supabase.from('projects').delete().eq('id', id);
        setProjects(projects.filter(p => p.id !== id));
    };





    const handleUpdateStages = async (projectId: string, newStages: string[]) => {
        const { error } = await supabase.from('projects').update({ stages: newStages }).eq('id', projectId);

        if (error) {
            console.error('Error updating stages:', error);
            alert(`Erro ao salvar etapas: ${error.message}\n\nRode o SQL de atualização no Supabase!`);
            return;
        }

        // Forçar recarregamento do BD para garantir persistência
        await loadProjects();

        // Atualizar estado local imediatamente para responsividade da UI
        if (managingStagesProject?.id === projectId) {
            setManagingStagesProject(prev => prev ? { ...prev, stages: [...newStages] } : null);
        }

        // Apenas alertar se for uma ação manual (evitar spam se for automático, mas aqui é manual)
        alert('Etapas atualizadas com sucesso!');
    };

    const handleAddUpgrade = async () => {
        if (!managingStagesProject || !newUpgradeName || !newUpgradeValue) return;

        const upgradeValue = parseFloat(newUpgradeValue);
        if (isNaN(upgradeValue) || upgradeValue <= 0) {
            alert('Valor inválido');
            return;
        }

        const newUpgrade = {
            name: newUpgradeName,
            value: upgradeValue,
            date: new Date().toISOString()
        };

        const updatedUpgrades = [...(managingStagesProject.upgrades || []), newUpgrade];
        const updatedTotalValue = (managingStagesProject.value || 0) + upgradeValue;

        // Atualização Otimista
        setManagingStagesProject({ ...managingStagesProject, upgrades: updatedUpgrades, value: updatedTotalValue });

        // Atualização no Banco de Dados
        const { error } = await supabase.from('projects').update({
            upgrades: updatedUpgrades,
            value: updatedTotalValue
        }).eq('id', managingStagesProject.id);

        if (error) {
            console.error('Error adding upgrade:', error);
            alert(`Erro ao adicionar upgrade: ${error.message || 'Erro desconhecido'}\nDetalhes: ${error.details || ''}`);
        } else {
            // Recarregar projetos para sincronizar
            await loadProjects();
            setNewUpgradeName('');
            setNewUpgradeValue('');
            alert('Upgrade adicionado e valor atualizado!');
        }
    };

    const loadFinancialRecords = async () => {
        const { data } = await supabase
            .from('financial_records')
            .select('*')
            .eq('associate_id', associate.id)
            .order('date', { ascending: false });

        if (data) setFinancialRecords(data);
    };



    const handleAddFinancialRecord = async () => {
        if (!newFinancialDesc || !newFinancialAmount || !newFinancialDate) {
            alert('Preencha todos os campos obrigatórios!');
            return;
        }

        const totalAmount = parseFloat(newFinancialAmount.replace(',', '.'));
        if (isNaN(totalAmount) || totalAmount <= 0) {
            alert('Valor inválido!');
            return;
        }

        // Lógica de Pagamento Parcelado (Entrada + Restante)
        if (newFinancialType === 'income' && hasDownPayment) {
            const entryValue = parseFloat(downPaymentValue.replace(',', '.'));
            if (isNaN(entryValue) || entryValue <= 0 || entryValue >= totalAmount) {
                alert('Valor da entrada inválido! Deve ser maior que 0 e menor que o total.');
                return;
            }
            if (!remainderDate) {
                alert('Selecione a data para o pagamento do restante.');
                return;
            }

            const remainderValue = totalAmount - entryValue;

            // 1. Criar REGISTRO DO RESTANTE (Pendente) PRIMEIRO para ter o ID
            const { data: remainderData, error: errorRemainder } = await supabase.from('financial_records').insert([{
                associate_id: associate.id,
                type: 'income',
                status: 'pending',
                description: `${newFinancialDesc} (Restante)`,
                amount: remainderValue,
                date: remainderDate,
                created_at: new Date().toISOString()
            }]).select().single();

            if (errorRemainder || !remainderData) {
                console.error('Error adding remainder:', errorRemainder);
                alert('Erro ao registrar o restante. Operação cancelada.');
                return;
            }

            // 2. Registrar Entrada (PAGO) vinculada ao Restante
            const { error: errorEntry } = await supabase.from('financial_records').insert([{
                associate_id: associate.id,
                type: 'income',
                status: 'paid',
                payment_method: newFinancialMethod,
                description: `${newFinancialDesc} (Entrada)`,
                amount: entryValue,
                date: newFinancialDate,
                related_record_id: remainderData.id, // VINCULA AO RESTANTE
                created_at: new Date().toISOString()
            }]);

            if (errorEntry) {
                console.error('Error adding entry:', errorEntry);
                alert('Restante registrado, mas erro ao registrar entrada.');
                // Idealmente, desfazer o restante aqui, mas por simplicidade alertamos.
            } else {
                alert('Pagamento parcelado registrado com sucesso!');
                resetFinancialForm();
                loadFinancialRecords();
            }

            if (errorRemainder) {
                console.error('Error adding remainder:', errorRemainder);
                alert('Entrada registrada, mas erro ao registrar o restante.');
            } else {
                alert('Pagamento parcelado registrado com sucesso!');
                resetFinancialForm();
                loadFinancialRecords();
            }

        } else {
            // Registro Simples (Padrão: Pago, mas se for despesa futura poderia ser pendente - assumindo pago por enquanto ou 'pending' se data futura? 
            // Para simplificar, registro simples = PAGO, a menos que especificado. O usuário pediu "aviso de débito em aberto", que vem do split.
            // Vamos assumir registro simples = PAGO.

            const { error } = await supabase.from('financial_records').insert([{
                associate_id: associate.id,
                type: newFinancialType,
                status: 'paid', // Default single entry is paid unless we add logic for pending expense
                payment_method: newFinancialMethod,
                description: newFinancialDesc,
                amount: totalAmount,
                date: newFinancialDate,
                is_recurring: newFinancialRecurring,
                created_at: new Date().toISOString()
            }]);

            if (error) {
                console.error('Error adding record:', error);
                alert('Erro ao adicionar registro financeiro.');
            } else {
                alert('Registro adicionado com sucesso!');
                resetFinancialForm();
                loadFinancialRecords();
            }
        }
    };

    const resetFinancialForm = () => {
        setNewFinancialDesc('');
        setNewFinancialAmount('');
        setNewFinancialType('income');
        setNewFinancialMethod('pix');
        setHasDownPayment(false);
        setDownPaymentValue('');
        setRemainderDate('');
    };

    // Função para abrir o modal de quitação
    const openSettlementModal = (record: FinancialRecord) => {
        setSettleRecord(record);
        setSettleAmount(record.amount.toString());
        setSettleMethod('pix');
        setSettleDate(new Date().toISOString().split('T')[0]);
    };

    // Função para confirmar a quitação (Parcial ou Total)
    const handleConfirmSettlement = async () => {
        if (!settleRecord || !settleAmount || !settleMethod || !settleDate) {
            alert('Preencha todos os campos da quitação.');
            return;
        }

        const amountToPay = parseFloat(settleAmount);
        if (isNaN(amountToPay) || amountToPay <= 0 || amountToPay > settleRecord.amount) {
            alert('Valor inválido. O valor deve ser maior que zero e não pode exceder o valor pendente.');
            return;
        }

        // Comparação segura para valores decimais
        const isFullPayment = Math.abs(amountToPay - settleRecord.amount) < 0.01;

        try {
            if (isFullPayment) {
                // Pagamento Total: Atualiza o registro existente
                const { error } = await supabase
                    .from('financial_records')
                    .update({
                        status: 'paid',
                        payment_method: settleMethod,
                        date: settleDate, // Atualiza para a data do pagamento real
                        amount: settleRecord.amount // Garante que o valor fique exato
                    })
                    .eq('id', settleRecord.id);

                if (error) throw error;

            } else {
                // Pagamento Parcial
                const remainingAmount = settleRecord.amount - amountToPay;

                // 1. Atualizar o registro pendente com o valor restante
                const { error: errorUpdate } = await supabase
                    .from('financial_records')
                    .update({
                        amount: remainingAmount
                    })
                    .eq('id', settleRecord.id);

                if (errorUpdate) throw errorUpdate;

                // 2. Criar novo registro de "Entrada" para o valor pago
                // VINCULANDO ao registro pendente (b.id) para permitir estorno futuro
                const { error: errorInsert } = await supabase
                    .from('financial_records')
                    .insert([{
                        associate_id: associate.id,
                        type: 'income',
                        status: 'paid',
                        payment_method: settleMethod,
                        description: `Pagamento Parcial: ${settleRecord.description}`,
                        amount: amountToPay,
                        date: settleDate,
                        related_record_id: settleRecord.id, // VINCULA AO PENDENTE
                        created_at: new Date().toISOString()
                    }]);

                if (errorInsert) throw errorInsert;
            }

            alert('Baixa efetuada com sucesso!');
            setSettleRecord(null); // Fecha o modal
            loadFinancialRecords();

        } catch (error) {
            console.error('Error settling debt:', error);
            alert('Erro ao dar baixa no débito.');
        }
    };

    const handleDeleteFinancialRecord = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este registro?')) return;

        try {
            // 1. Buscar o registro para ver se tem vínculo (related_record_id)
            const { data: recordToDelete, error: fetchError } = await supabase
                .from('financial_records')
                .select('*')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            // 2. Se tiver um pai, devolver o valor para o pai (estorno)
            if (recordToDelete && recordToDelete.related_record_id) {
                // Busca o pai
                const { data: parentRecord, error: parentError } = await supabase
                    .from('financial_records')
                    .select('*')
                    .eq('id', recordToDelete.related_record_id)
                    .single();

                if (parentRecord) {
                    // Soma o valor de volta ao pai
                    const newAmount = parentRecord.amount + recordToDelete.amount;
                    const { error: updateError } = await supabase
                        .from('financial_records')
                        .update({ amount: newAmount }) // Volta a dívida original
                        .eq('id', parentRecord.id);

                    if (updateError) {
                        console.error('Erro ao restaurar valor no pai:', updateError);
                        alert('Erro ao restaurar o valor no registro original. Exclusão cancelada por segurança.');
                        return;
                    }
                }
            }

            // 3. Excluir o registro
            const { error } = await supabase.from('financial_records').delete().eq('id', id);
            if (error) throw error;

            alert('Registro excluído com sucesso!');
            loadFinancialRecords();
        } catch (error) {
            console.error('Error deleting financial record:', error);
            alert('Erro ao excluir registro.');
        }
    };

    const handleRemoveUpgrade = async (indexToRemove: number) => {
        if (!managingStagesProject || !managingStagesProject.upgrades) return;

        const upgradeToRemove = managingStagesProject.upgrades[indexToRemove];
        if (!confirm(`Remover upgrade "${upgradeToRemove.name}"?`)) return;

        const updatedUpgrades = managingStagesProject.upgrades.filter((_, i) => i !== indexToRemove);
        const updatedTotalValue = (managingStagesProject.value || 0) - upgradeToRemove.value;

        // Atualização Otimista
        setManagingStagesProject({ ...managingStagesProject, upgrades: updatedUpgrades, value: updatedTotalValue });

        // Atualização no Banco de Dados
        const { error } = await supabase.from('projects').update({
            upgrades: updatedUpgrades,
            value: updatedTotalValue
        }).eq('id', managingStagesProject.id);

        if (error) {
            console.error('Error removing upgrade:', error);
            alert('Erro ao remover upgrade.');
            // Reverter estado se necessário ou apenas recarregar
            await loadProjects();
        } else {
            await loadProjects();
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="fixed inset-y-0 right-0 w-full max-w-[95vw] md:max-w-[1600px] bg-[#09090b] border-l border-white/10 shadow-2xl z-50 overflow-hidden flex flex-col"
            >
                {/* Cabeçalho */}
                <div className="shrink-0 bg-[#09090b]/90 backdrop-blur-md border-b border-white/5 p-8 flex justify-between items-center z-10">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            {profileData.avatar_url ? (
                                <img src={profileData.avatar_url} alt="Avatar" className="w-20 h-20 rounded-2xl border border-white/10 object-cover shadow-lg group-hover:border-[var(--color-primary)] transition-colors" />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl border border-white/10 flex items-center justify-center bg-white/5 text-[var(--color-text-muted)] group-hover:border-[var(--color-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                                    <User size={40} />
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-[#09090b] rounded-full"></div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">{profileData.full_name || 'Novo Associado'}</h3>
                            <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                                <span className="flex items-center gap-1.5"><Mail size={14} /> {associate.email}</span>
                                {profileData.phone && <span className="flex items-center gap-1.5 border-l border-white/10 pl-4"><Smartphone size={14} /> {profileData.phone}</span>}
                                {profileData.company_name && <span className="flex items-center gap-1.5 border-l border-white/10 pl-4"><Building size={14} /> {profileData.company_name}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full text-[var(--color-text-muted)] hover:text-white transition-all">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Barra Superior de Abas e Estatísticas */}
                <div className="shrink-0 flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#09090b]">
                    <div className="flex gap-4">
                        <button onClick={() => setActiveTab('projects')} className={`px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 border-2 ${activeTab === 'projects' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-white shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'border-transparent bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10 hover:text-white hover:border-white/10'}`}>
                            Portfólio de Projetos
                        </button>
                        <button onClick={() => setActiveTab('profile')} className={`px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 border-2 ${activeTab === 'profile' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-white shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'border-transparent bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10 hover:text-white hover:border-white/10'}`}>
                            Dados do Perfil
                        </button>
                        <button onClick={() => setActiveTab('financial')} className={`px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 border-2 ${activeTab === 'financial' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-white shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'border-transparent bg-white/5 text-[var(--color-text-muted)] hover:bg-white/10 hover:text-white hover:border-white/10'}`}>
                            Financeiro
                        </button>
                    </div>

                    {/* Estatísticas Resumidas (Apenas na aba de projetos) */}
                    {activeTab === 'projects' && (
                        <div className="flex gap-8 py-4">
                            <div className="text-right">
                                <span className="block text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">Total em Projetos</span>
                                <span className="text-xl font-bold text-white font-heading">
                                    R$ {projects.reduce((acc, curr) => acc + curr.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="text-right border-l border-white/10 pl-8">
                                <span className="block text-[10px] uppercase font-bold text-[var(--color-text-muted)] tracking-wider">Projetos Ativos</span>
                                <span className="text-xl font-bold text-[var(--color-primary)] font-heading">{projects.length}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Conteúdo Rolável */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#09090b]">

                    {activeTab === 'projects' && (
                        <div className="mx-auto max-w-[2000px]">
                            {/* Ações do Cabeçalho */}
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Briefcase size={20} className="text-[var(--color-primary)]" /> Meus Projetos
                                </h4>
                                <Button onClick={() => setIsAddingProject(!isAddingProject)} className="text-sm px-6 py-2.5 h-auto shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all">
                                    <Plus size={16} className="mr-2" /> Novo Projeto
                                </Button>
                            </div>

                            {/* Formulário Colapsável de Novo Projeto */}
                            <AnimatePresence>
                                {isAddingProject && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
                                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="bg-[#121214] p-8 rounded-2xl border border-dashed border-white/10 shadow-inner max-w-3xl mx-auto">
                                            <div className="grid gap-6">
                                                <div>
                                                    <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase mb-2 block tracking-wider">Serviço Contratado</label>
                                                    <select
                                                        className="input-field w-full text-base p-3 rounded-xl bg-[#09090b]"
                                                        onChange={(e) => setNewProjectService(e.target.value)}
                                                        value={newProjectService}
                                                    >
                                                        <option value="">Selecione o serviço...</option>
                                                        {availableServices.map(srv => (
                                                            <option key={srv.id} value={srv.name}>{srv.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase mb-2 block tracking-wider">Valor do Projeto</label>
                                                        <div className="relative">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] font-bold">R$</span>
                                                            <input
                                                                type="number"
                                                                value={newProjectValue}
                                                                onChange={e => setNewProjectValue(e.target.value)}
                                                                className="input-field w-full pl-10 text-base p-3 rounded-xl bg-[#09090b]"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold text-[var(--color-text-muted)] uppercase mb-2 block tracking-wider">Moeda</label>
                                                        <select
                                                            value={newProjectCurrency}
                                                            onChange={e => setNewProjectCurrency(e.target.value)}
                                                            className="input-field w-full text-base p-3 rounded-xl bg-[#09090b]"
                                                        >
                                                            <option value="BRL">BRL (Real)</option>
                                                            <option value="USD">USD (Dólar)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-3 pt-4 border-t border-white/5 mt-2">
                                                    <Button variant="outline" onClick={() => setIsAddingProject(false)}>Cancelar</Button>
                                                    <Button onClick={handleAddProject}><Plus size={16} className="mr-2" /> Criar Projeto</Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Grid de Cards de Projetos */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                                {projects.map(project => {
                                    const isExpanded = expandedProjectId === project.id;

                                    return (
                                        <motion.div
                                            key={project.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className={`relative rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col group h-fit 
                                                ${isExpanded ? 'bg-[#121214] border-[var(--color-primary)] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)] col-span-1 lg:col-span-2' : 'bg-[#121214] border-white/5 hover:border-white/20 hover:bg-[#151518]'}`}
                                        >
                                            {/* Seção Superior do Card */}
                                            <div className="p-6 cursor-pointer" onClick={() => {
                                                if (!isExpanded) {
                                                    setExpandedProjectId(project.id);
                                                    loadLogs(project.id);
                                                } else {
                                                    setExpandedProjectId(null);
                                                }
                                            }}>
                                                <div className="flex justify-between items-start gap-4 mb-6">
                                                    <div>
                                                        <h4 className={`text-xl font-bold mb-2 transition-colors ${isExpanded ? 'text-white' : 'text-white/90 group-hover:text-white'}`}>
                                                            {project.service}
                                                        </h4>
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <span className="flex items-center gap-2 bg-[#09090b] border border-white/5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-text-muted)]">
                                                                <Calendar size={12} /> {new Date(project.startDate).toLocaleDateString()}
                                                            </span>
                                                            <span className="flex items-center gap-2 bg-[#09090b] border border-white/5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--color-primary)]">
                                                                {project.currency} {project.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </span>
                                                        </div>

                                                        {/* Upgrades Badges */}
                                                        {project.upgrades && project.upgrades.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mt-3 text-left">
                                                                {project.upgrades.map((upgrade, idx) => (
                                                                    <span key={idx} className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 text-green-500 px-2 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wider">
                                                                        <div className="w-1 h-1 rounded-full bg-green-500"></div> {upgrade.name}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {project.projectUrl && (
                                                            <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="p-2.5 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-xl transition-colors border border-transparent hover:border-[var(--color-primary)]/20">
                                                                <LinkIcon size={18} />
                                                            </a>
                                                        )}
                                                        <div className="flex flex-col gap-1">
                                                            <button onClick={e => { e.stopPropagation(); setManagingStagesProject(project); }} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors" title="Gerenciar Projeto">
                                                                <Settings size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Timeline Visual (Somente Leitura) */}
                                                <div className="mt-8 mb-4">
                                                    <ProjectStatusTimeline
                                                        stages={project.stages}
                                                        currentStatus={project.status}
                                                        readOnly={!isExpanded}
                                                        onStatusChange={async (newStatus) => {
                                                            // Atualização otimista
                                                            const updated = { ...project, status: newStatus };
                                                            setProjects(projects.map(p => p.id === project.id ? updated : p));

                                                            // Persistência no BD
                                                            // Persistência no BD
                                                            // Usamos upsert ou update com select para garantir retorno
                                                            const { error, data } = await supabase.from('projects')
                                                                .update({ status: newStatus })
                                                                .eq('id', project.id)
                                                                .select();

                                                            if (error) {
                                                                console.error('Error saving status:', error);
                                                                alert(`Erro ao salvar: ${error.message || 'Erro desconhecido'}\nDetalhes: ${error.details || ''}\nDica: Verifique se você está logado e tem permissão.`);
                                                                await loadProjects(); // Reverter
                                                            } else if (data) {
                                                                // Sucesso confirmado
                                                                alert('Status atualizado e salvo!');
                                                                console.log('Status saved:', data);
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Seção Diário de Bordo (Layout Dividido) */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="border-t border-white/5 bg-[#0b0b0d] flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5"
                                                    >
                                                        {/* Esquerda: Input e Contexto */}
                                                        <div className="p-8 md:w-1/3 shrink-0 bg-[#09090b]/50" onClick={e => e.stopPropagation()}>
                                                            <div className="sticky top-0">
                                                                <h5 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider mb-6 flex items-center gap-2">
                                                                    <MessageSquare size={16} /> Diário de Bordo
                                                                </h5>

                                                                {/* Input de Log de Contexto */}
                                                                <div className="space-y-4">
                                                                    <label className="text-xs text-[var(--color-text-muted)] font-medium mb-2 block uppercase tracking-wide">
                                                                        O que você está trabalhando agora?
                                                                    </label>
                                                                    <div className="relative group/input">
                                                                        <textarea
                                                                            className="input-field w-full min-h-[140px] text-sm resize-none rounded-xl bg-[#121214] border border-white/5 focus:border-[var(--color-primary)]/50 p-4 transition-all"
                                                                            placeholder={`Escreva uma atualização para a etapa "${project.status}"...\n(Pressione Enter para salvar)`}
                                                                            value={logDescription}
                                                                            onChange={e => setLogDescription(e.target.value)}
                                                                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddLog(project.id); } }}
                                                                        />
                                                                        <div className="absolute bottom-3 right-3 opacity-0 group-hover/input:opacity-100 transition-opacity">
                                                                            <span className="text-[10px] text-[var(--color-text-muted)] bg-black/50 px-2 py-1 rounded">Enter para enviar</span>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        onClick={() => handleAddLog(project.id)}
                                                                        className="w-full justify-center shadow-lg shadow-black/20"
                                                                    >
                                                                        <Save size={16} className="mr-2" /> Salvar Progresso
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Direita: Feed Histórico */}
                                                        <div className="p-6 md:w-2/3 flex-1 bg-[#0b0b0d]" onClick={e => e.stopPropagation()}>
                                                            <h5 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-6">Histórico de Atividades</h5>

                                                            <div className="relative pl-4 border-l border-white/5 space-y-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                                                {logs.length > 0 ? logs.map((log) => (
                                                                    <div key={log.id} className="relative group/log">
                                                                        <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#121214] border border-white/20 group-hover/log:border-[var(--color-primary)] group-hover/log:bg-[var(--color-primary)] transition-colors shadow-[0_0_0_4px_#0b0b0d]"></div>
                                                                        <div className="bg-[#121214]/50 border border-white/5 p-4 rounded-xl hover:border-white/10 transition-colors group">
                                                                            {editingLogId === log.id ? (
                                                                                // Edit Mode
                                                                                <div className="space-y-3">
                                                                                    <textarea
                                                                                        className="input-field w-full min-h-[80px] text-sm bg-[#09090b] p-3 rounded-lg border border-white/10"
                                                                                        value={editingLogDescription}
                                                                                        onChange={e => setEditingLogDescription(e.target.value)}
                                                                                    />
                                                                                    <div className="flex justify-between items-center gap-3">
                                                                                        <input
                                                                                            type="datetime-local"
                                                                                            className="input-field text-xs bg-[#09090b] p-2 rounded-lg border border-white/10 text-white/70"
                                                                                            value={editingLogDate}
                                                                                            onChange={e => setEditingLogDate(e.target.value)}
                                                                                        />
                                                                                        <div className="flex gap-2">
                                                                                            <button
                                                                                                onClick={(e) => { e.stopPropagation(); setEditingLogId(null); }}
                                                                                                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg"
                                                                                                title="Cancelar"
                                                                                            >
                                                                                                <X size={14} />
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={(e) => { e.stopPropagation(); handleUpdateLog(log.id); }}
                                                                                                className="p-1.5 text-green-500 hover:bg-green-500/10 rounded-lg"
                                                                                                title="Salvar"
                                                                                            >
                                                                                                <Check size={14} />
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                // View Mode
                                                                                <>
                                                                                    <div className="flex justify-between items-start">
                                                                                        <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{log.description}</p>
                                                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                            <button
                                                                                                onClick={(e) => { e.stopPropagation(); handleStartEditLog(log); }}
                                                                                                className="p-1.5 text-gray-500 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-all"
                                                                                                title="Editar"
                                                                                            >
                                                                                                <Pencil size={14} />
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={(e) => { e.stopPropagation(); handleDeleteLog(log.id); }}
                                                                                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                                                                title="Excluir"
                                                                                            >
                                                                                                <Trash2 size={14} />
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                    <span className="text-[10px] text-gray-500 mt-2 block font-mono font-medium">{new Date(log.created_at).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}</span>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )) : (
                                                                    <div className="text-center py-10 opacity-30">
                                                                        <Clock size={32} className="mx-auto mb-2" />
                                                                        <p className="text-sm">Nenhum registro ainda.</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.div>
                                    );
                                })}
                                {projects.length === 0 && (
                                    <div className="col-span-1 lg:col-span-3 flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-[var(--color-text-muted)] mb-6">
                                            <Briefcase size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Seu portfólio está vazio</h3>
                                        <p className="text-gray-400 mb-6">Comece adicionando seu primeiro projeto para gerenciar.</p>
                                        <Button onClick={() => setIsAddingProject(true)} className="px-8 py-3"><Plus size={18} className="mr-2" /> Criar Primeiro Projeto</Button>
                                    </div>
                                )}
                            </div >
                        </div >
                    )}

                    {/* Modal de Gerenciamento de Etapas/Upgrades */}
                    <AnimatePresence>
                        {managingStagesProject && (
                            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6" onClick={() => setManagingStagesProject(null)}>
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.9, opacity: 0 }}
                                    className="bg-[#121214] border border-[var(--color-primary)] w-full max-w-2xl rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.15)] flex flex-col max-h-[90vh]"
                                    onClick={e => e.stopPropagation()}
                                >
                                    {/* Cabeçalho */}
                                    <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#09090b]">
                                        <div>
                                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                <GitCommit size={20} className="text-[var(--color-primary)]" /> Gerenciar Projeto
                                            </h3>
                                            <p className="text-sm text-[var(--color-text-muted)] mt-1">{managingStagesProject.service}</p>
                                        </div>
                                        <button onClick={() => setManagingStagesProject(null)} className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-white transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {/* Abas */}
                                    <div className="flex border-b border-white/5 bg-[#09090b]/50 px-6 gap-6">
                                        <button
                                            onClick={() => setActiveSettingsTab('stages')}
                                            className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeSettingsTab === 'stages' ? 'border-[var(--color-primary)] text-white' : 'border-transparent text-[var(--color-text-muted)] hover:text-white'}`}
                                        >
                                            Etapas
                                        </button>
                                        <button
                                            onClick={() => setActiveSettingsTab('upgrades')}
                                            className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeSettingsTab === 'upgrades' ? 'border-[var(--color-primary)] text-white' : 'border-transparent text-[var(--color-text-muted)] hover:text-white'}`}
                                        >
                                            Upgrades & Financeiro
                                        </button>
                                    </div>

                                    {/* Conteúdo */}
                                    <div className="p-6 overflow-y-auto custom-scrollbar">
                                        {activeSettingsTab === 'stages' && (
                                            <div className="space-y-6">
                                                {/* Timeline Interativa */}
                                                <div className="bg-[#121214] p-5 rounded-xl border border-white/5 shadow-inner">
                                                    <h4 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                                                        <Clock size={14} /> Status Atual
                                                    </h4>
                                                    <ProjectStatusTimeline
                                                        stages={managingStagesProject.stages}
                                                        currentStatus={managingStagesProject.status}
                                                        onStatusChange={async (newStatus) => {
                                                            // Atualização Otimista
                                                            setManagingStagesProject({ ...managingStagesProject, status: newStatus });

                                                            // Persistência
                                                            // Usamos upsert ou update com select para garantir retorno
                                                            const { error, data } = await supabase.from('projects')
                                                                .update({ status: newStatus })
                                                                .eq('id', managingStagesProject.id)
                                                                .select();

                                                            await loadProjects(); // Sincronizar

                                                            if (error) {
                                                                console.error('Error saving status (modal):', error);
                                                                alert('Erro ao salvar status.');
                                                            } else if (data) {
                                                                alert('Status salvo com sucesso!');
                                                            }
                                                        }}
                                                    />
                                                </div>

                                                <div className="bg-[#121214] p-5 rounded-xl border border-white/5 shadow-inner">
                                                    <h4 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                                                        <Plus size={14} /> Adicionar Nova Etapa
                                                    </h4>
                                                    <div className="flex gap-3">
                                                        <input
                                                            id="new-stage-input"
                                                            type="text"
                                                            className="input-field flex-1 p-3 bg-[#09090b] text-sm border border-white/10 focus:border-[var(--color-primary)]/50 rounded-lg transition-all"
                                                            placeholder="Nome da etapa (ex: Aprovação de Design)"
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') {
                                                                    const val = e.currentTarget.value;
                                                                    if (val && managingStagesProject) {
                                                                        const newStages = [...(managingStagesProject.stages || []), val];
                                                                        handleUpdateStages(managingStagesProject.id, newStages);
                                                                        e.currentTarget.value = '';
                                                                        // Não alertar para ser mais fluido
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                        <Button onClick={() => {
                                                            const input = document.getElementById('new-stage-input') as HTMLInputElement;
                                                            if (input?.value && managingStagesProject) {
                                                                const newStages = [...(managingStagesProject.stages || []), input.value];
                                                                handleUpdateStages(managingStagesProject.id, newStages);
                                                                input.value = '';
                                                            }
                                                        }} className="px-6 shadow-lg shadow-black/20 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dim)] text-[#09090b] font-bold">
                                                            <Plus size={18} />
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Etapas Atuais</h4>
                                                    <div className="space-y-2">
                                                        {managingStagesProject.stages && managingStagesProject.stages.length > 0 ? (
                                                            managingStagesProject.stages.map((stage, index) => (
                                                                <div key={index} className="flex items-center justify-between bg-[#09090b]/50 p-3 rounded-lg border border-white/5 group hover:border-white/10 transition-colors">
                                                                    <div className="flex items-center gap-3 flex-1">
                                                                        <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-[var(--color-text-muted)]">
                                                                            {index + 1}
                                                                        </div>

                                                                        {editingStageIndex === index ? (
                                                                            <div className="flex flex-1 gap-2 items-center">
                                                                                <input
                                                                                    type="text"
                                                                                    value={editingStageName}
                                                                                    onChange={(e) => setEditingStageName(e.target.value)}
                                                                                    className="flex-1 bg-[#121214] border border-[var(--color-primary)] rounded px-2 py-1 text-sm text-white focus:outline-none"
                                                                                    autoFocus
                                                                                />
                                                                                <button
                                                                                    onClick={async () => {
                                                                                        if (editingStageName.trim() && managingStagesProject) {
                                                                                            const newStages = [...(managingStagesProject.stages || [])];
                                                                                            newStages[index] = editingStageName.trim();
                                                                                            await handleUpdateStages(managingStagesProject.id, newStages);
                                                                                            setEditingStageIndex(null);
                                                                                        }
                                                                                    }}
                                                                                    className="p-1 text-green-500 hover:bg-green-500/10 rounded"
                                                                                >
                                                                                    <Check size={14} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => setEditingStageIndex(null)}
                                                                                    className="p-1 text-red-500 hover:bg-red-500/10 rounded"
                                                                                >
                                                                                    <X size={14} />
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <span className="text-sm text-gray-300">{stage}</span>
                                                                        )}
                                                                    </div>

                                                                    {editingStageIndex !== index && (
                                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEditingStageIndex(index);
                                                                                    setEditingStageName(stage);
                                                                                }}
                                                                                className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                                            >
                                                                                <Pencil size={14} />
                                                                            </button>
                                                                            <button
                                                                                onClick={async () => {
                                                                                    if (!confirm('Remover esta etapa?')) return;
                                                                                    const newStages = managingStagesProject.stages!.filter((_, i) => i !== index);
                                                                                    await handleUpdateStages(managingStagesProject.id, newStages);
                                                                                }}
                                                                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-sm text-[var(--color-text-muted)] italic text-center py-4">Nenhuma etapa definida.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Danger Zone */}
                                                <div className="pt-6 border-t border-white/5">
                                                    <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3">Zona de Perigo</h4>
                                                    <button
                                                        onClick={(e) => {
                                                            handleRemoveProject(managingStagesProject.id, e);
                                                            setManagingStagesProject(null);
                                                        }}
                                                        className="w-full flex items-center justify-center gap-2 bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-red-500/20 hover:border-red-500/30 p-4 rounded-xl transition-all font-bold text-xs uppercase tracking-wider"
                                                    >
                                                        <Trash2 size={16} /> Excluir Projeto Permanentemente
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {activeSettingsTab === 'upgrades' && (
                                            <div className="space-y-6">
                                                <div className="bg-[#121214] p-5 rounded-xl border border-white/5 shadow-inner">
                                                    <div className="flex justify-between items-center mb-6">
                                                        <h4 className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider flex items-center gap-2">
                                                            <Plus size={14} /> Adicionar Novo Upgrade
                                                        </h4>
                                                        <span className="text-[10px] font-bold bg-green-500/10 text-green-500 px-2 py-1 rounded border border-green-500/20 uppercase">Aumenta Valor Total</span>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                                        <div className="col-span-2">
                                                            <label className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold mb-2 block">Nome do Item</label>
                                                            <input
                                                                type="text"
                                                                className="input-field w-full p-3 bg-[#09090b] text-sm border border-white/10 focus:border-[var(--color-primary)]/50 rounded-lg"
                                                                placeholder="Ex: Integração WhatsApp..."
                                                                value={newUpgradeName}
                                                                onChange={e => setNewUpgradeName(e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] text-[var(--color-text-muted)] uppercase font-bold mb-2 block">Valor (R$)</label>
                                                            <input
                                                                type="number"
                                                                className="input-field w-full p-3 bg-[#09090b] text-sm border border-white/10 focus:border-[var(--color-primary)]/50 rounded-lg"
                                                                placeholder="0.00"
                                                                value={newUpgradeValue}
                                                                onChange={e => setNewUpgradeValue(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <Button onClick={handleAddUpgrade} className="w-full py-3 shadow-lg shadow-black/20 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dim)] text-[#09090b] font-bold uppercase text-xs tracking-wider">
                                                        <Plus size={16} className="mr-2" /> Adicionar ao Projeto
                                                    </Button>
                                                </div>

                                                <div>
                                                    <h4 className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Histórico de Upgrades do Projeto</h4>
                                                    <div className="space-y-2">
                                                        {managingStagesProject.upgrades && managingStagesProject.upgrades.length > 0 ? (
                                                            managingStagesProject.upgrades.map((item, index) => (
                                                                <div key={index} className="flex items-center justify-between bg-[#09090b]/50 p-3 rounded-lg border border-white/5 group hover:border-white/10 transition-colors">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                                                                            <Briefcase size={14} />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-sm font-medium text-white">{item.name}</p>
                                                                            <p className="text-[10px] text-[var(--color-text-muted)]">{new Date(item.date).toLocaleDateString()}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="text-sm font-bold text-green-400">+ R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                                        <button
                                                                            onClick={() => handleRemoveUpgrade(index)}
                                                                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                                            title="Remover Upgrade"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-sm text-[var(--color-text-muted)] italic text-center py-4">Nenhum upgrade registrado.</p>
                                                        )}
                                                    </div>

                                                    <div className="mt-6 pt-6 border-t border-white/10 flex justify-between items-center text-sm">
                                                        <span className="text-[var(--color-text-muted)]">Valor Total Atual</span>
                                                        <span className="text-xl font-bold text-white">R$ {managingStagesProject.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div >
                        )}
                    </AnimatePresence >



                    {/* Fechamento da Grid de Projetos e da Aba Projects - REMOVIDOS DIVS EXTRAS */}

                    {
                        activeTab === 'financial' && (
                            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 py-4">

                                {/* ALERTA DE DESPESAS RECORRENTES PRÓXIMAS */}
                                {upcomingExpenses.length > 0 && (
                                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-start gap-4 animate-in slide-in-from-top-4 duration-500">
                                        <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500 shrink-0">
                                            <AlarmClock size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-orange-500 font-bold text-sm uppercase tracking-wide mb-1">Atenção: Despesas Próximas</h4>
                                            <p className="text-sm text-gray-300 mb-3">
                                                Você tem <strong>{upcomingExpenses.length}</strong> despesa(s) recorrente(s) com vencimento em breve (5 dias).
                                            </p>
                                            <div className="space-y-2">
                                                {upcomingExpenses.map(exp => (
                                                    <div key={exp.id} className="flex justify-between items-center text-xs bg-black/20 p-2 rounded border border-white/5">
                                                        <span className="text-white font-medium">{exp.description}</span>
                                                        <div className="flex gap-3">
                                                            <span className="text-[var(--color-text-muted)]">Dia {new Date(exp.date + 'T12:00:00').getDate()}</span>
                                                            <span className="text-red-400 font-bold">R$ {exp.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Filtros de Data */}
                                <div className="flex gap-4 mb-6 animate-in fade-in duration-500 delay-100">
                                    <div className="bg-[#121214] border border-white/5 rounded-xl p-3 flex-1 flex items-center gap-4">
                                        <label className="text-xs text-[var(--color-text-muted)] uppercase font-bold">Mês</label>
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                            className="bg-transparent text-white font-bold text-sm focus:outline-none flex-1 cursor-pointer"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <option key={i} value={i} className="bg-[#121214] text-white">
                                                    {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="bg-[#121214] border border-white/5 rounded-xl p-3 flex-1 flex items-center gap-4">
                                        <label className="text-xs text-[var(--color-text-muted)] uppercase font-bold">Ano</label>
                                        <select
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                                            className="bg-transparent text-white font-bold text-sm focus:outline-none flex-1 cursor-pointer"
                                        >
                                            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                                <option key={year} value={year} className="bg-[#121214] text-white">
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Cards de Resumo */}
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="bg-[#121214] border border-white/5 rounded-2xl p-6">
                                        <div className="text-xs uppercase font-bold text-green-500 mb-2 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            Total Recebido
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            R$ {filteredFinancialRecords
                                                .filter(r => r.type === 'income' && r.status === 'paid')
                                                .reduce((acc, curr) => acc + curr.amount, 0)
                                                .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div className="bg-[#121214] border border-white/5 rounded-2xl p-6">
                                        <div className="text-xs uppercase font-bold text-red-500 mb-2 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                            Total Gasto
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            R$ {filteredFinancialRecords
                                                .filter(r => r.type === 'expense')
                                                .reduce((acc, curr) => acc + curr.amount, 0)
                                                .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                    <div className="bg-[#121214] border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <DollarSign size={64} className="text-[var(--color-primary)]" />
                                        </div>
                                        <div className="text-xs uppercase font-bold text-yellow-500 mb-2 flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                            Em Aberto (A Receber)
                                        </div>
                                        <div className="text-2xl font-bold text-white">
                                            R$ {filteredFinancialRecords
                                                .filter(r => r.type === 'income' && r.status === 'pending')
                                                .reduce((acc, curr) => acc + curr.amount, 0)
                                                .toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>

                                {/* Formulário de Adição */}
                                <div className="bg-[#121214] border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-muted)] mb-6 flex items-center gap-2">
                                        <Plus size={16} /> Novo Lançamento
                                    </h3>
                                    <div className="grid grid-cols-12 gap-4 items-end">
                                        <div className="col-span-2">
                                            <label className="block text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-2">Tipo</label>
                                            <select
                                                value={newFinancialType}
                                                onChange={(e) => setNewFinancialType(e.target.value as 'income' | 'expense')}
                                                className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[var(--color-primary)] outline-none"
                                            >
                                                <option value="income">Entrada</option>
                                                <option value="expense">Saída</option>
                                            </select>
                                        </div>

                                        {/* PREVIEW: Checkbox de Recorrência (Apenas para Saída) */}
                                        {newFinancialType === 'expense' && (
                                            <div className="col-span-12 flex items-center gap-2 mb-2">
                                                <input
                                                    type="checkbox"
                                                    id="newRec"
                                                    checked={newFinancialRecurring}
                                                    onChange={(e) => setNewFinancialRecurring(e.target.checked)}
                                                    className="w-4 h-4 rounded border-gray-600/50 bg-[#09090b] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                                />
                                                <label htmlFor="newRec" className="text-xs text-gray-300 select-none cursor-pointer flex items-center gap-1">
                                                    <RefreshCw size={12} /> Despesa Recorrente (Avisar 5 dias antes)
                                                </label>
                                            </div>
                                        )}
                                        <div className="col-span-3">
                                            <label className="block text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-2">Método</label>
                                            <select
                                                value={newFinancialMethod}
                                                onChange={(e) => setNewFinancialMethod(e.target.value)}
                                                className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[var(--color-primary)] outline-none"
                                            >
                                                <option value="pix">Pix</option>
                                                <option value="credit_card">Cartão de Crédito</option>
                                                <option value="debit_card">Cartão de Débito</option>
                                                <option value="cash">Dinheiro</option>
                                                <option value="transfer">Transf.</option>
                                            </select>
                                        </div>
                                        <div className="col-span-3">
                                            <label className="block text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-2">Descrição</label>
                                            <input
                                                type="text"
                                                value={newFinancialDesc}
                                                onChange={(e) => setNewFinancialDesc(e.target.value)}
                                                placeholder="Ex: Pagamento Mensalidade"
                                                className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[var(--color-primary)] outline-none"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-2">Valor Total (R$)</label>
                                            <input
                                                type="text"
                                                value={newFinancialAmount}
                                                onChange={(e) => setNewFinancialAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                                                placeholder="0.00"
                                                className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[var(--color-primary)] outline-none"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-2">Data</label>
                                            <input
                                                type="date"
                                                value={newFinancialDate}
                                                onChange={(e) => setNewFinancialDate(e.target.value)}
                                                className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[var(--color-primary)] outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <Button onClick={handleAddFinancialRecord} className="w-full h-[46px] flex items-center justify-center bg-[var(--color-primary)] text-[#09090b] hover:bg-white transition-all duration-300 shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/40 hover:scale-[1.01] active:scale-[0.98] border border-[var(--color-primary)]/20 font-bold uppercase tracking-wider">
                                            <Plus size={20} className="mr-2" /> Adicionar Registro
                                        </Button>
                                    </div>

                                    {newFinancialType === 'income' && newFinancialAmount && (
                                        <div className="mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                                            <div className="flex items-center gap-2 mb-4">
                                                <input
                                                    type="checkbox"
                                                    id="hasDownPayment"
                                                    checked={hasDownPayment}
                                                    onChange={(e) => setHasDownPayment(e.target.checked)}
                                                    className="w-4 h-4 rounded border-gray-600/50 bg-[#09090b] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                                                />
                                                <label htmlFor="hasDownPayment" className="text-sm text-gray-300 select-none cursor-pointer">
                                                    Este pagamento tem entrada? (Dividir em Entrada + Restante)
                                                </label>
                                            </div>

                                            {hasDownPayment && (
                                                <div className="grid grid-cols-12 gap-4 items-end bg-white/5 p-4 rounded-xl border border-white/5">
                                                    <div className="col-span-4">
                                                        <label className="block text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-2">Valor da Entrada (R$)</label>
                                                        <input
                                                            type="text"
                                                            value={downPaymentValue}
                                                            onChange={(e) => setDownPaymentValue(e.target.value.replace(/[^0-9.,]/g, ''))}
                                                            placeholder="0.00"
                                                            className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[var(--color-primary)] outline-none"
                                                        />
                                                    </div>
                                                    <div className="col-span-4">
                                                        <label className="block text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-2">Data do Restante</label>
                                                        <input
                                                            type="date"
                                                            value={remainderDate}
                                                            onChange={(e) => setRemainderDate(e.target.value)}
                                                            className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-sm text-white focus:border-[var(--color-primary)] outline-none"
                                                        />
                                                    </div>
                                                    <div className="col-span-4 flex items-center h-[46px] text-sm text-[var(--color-text-muted)] italic">
                                                        Restante: R$ {(() => {
                                                            try {
                                                                const total = parseFloat(newFinancialAmount.replace(',', '.')) || 0;
                                                                const entry = parseFloat(downPaymentValue.replace(',', '.')) || 0;
                                                                return Math.max(0, total - entry).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                                                            } catch {
                                                                return '0,00';
                                                            }
                                                        })()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Lista de Registros */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Histórico</h3>
                                    {filteredFinancialRecords.length > 0 ? (
                                        filteredFinancialRecords.map((record) => (
                                            <div key={record.id} className="flex items-center justify-between bg-[#121214] border border-white/5 p-4 rounded-xl group hover:border-white/10 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${record.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                        {record.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-white text-sm">{record.description}</span>
                                                            {record.status === 'pending' && <span className="text-[9px] font-bold uppercase bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20">Pendente</span>}
                                                            {record.status === 'paid' && <span className="text-[9px] font-bold uppercase bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded border border-green-500/20">Pago</span>}
                                                        </div>
                                                        <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-2">
                                                            <span>{new Date(record.date).toLocaleDateString('pt-BR')}</span>
                                                            <span className="w-1 h-1 rounded-full bg-white/20" />
                                                            <span className="uppercase">{record.type === 'income' ? 'Entrada' : 'Saída'}</span>
                                                            {record.is_recurring && (
                                                                <span title="Despesa Recorrente" className="text-orange-400 flex items-center gap-1">
                                                                    • <RefreshCw size={10} />
                                                                </span>
                                                            )}
                                                            {record.payment_method && (
                                                                <>
                                                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                                                    <span className="uppercase text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                                                        {
                                                                            ({
                                                                                'pix': 'Pix',
                                                                                'credit_card': 'Crédito',
                                                                                'debit_card': 'Débito',
                                                                                'cash': 'Dinheiro',
                                                                                'transfer': 'Transf.'
                                                                            } as Record<string, string>)[record.payment_method] || record.payment_method
                                                                        }
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`font-bold font-heading ${record.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                                                        {record.type === 'income' ? '+' : '-'} R$ {record.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>

                                                    {record.type === 'income' && record.status === 'pending' && (
                                                        <button
                                                            onClick={() => openSettlementModal(record)}
                                                            title="Quitar Débito"
                                                            className="p-2 text-yellow-500 hover:text-white hover:bg-green-500 rounded-lg transition-colors border border-yellow-500/20 hover:border-green-500"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => openEditModal(record)}
                                                        className="p-2 text-[var(--color-text-muted)] hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Editar"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteFinancialRecord(record.id)}
                                                        className="p-2 text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Excluir"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-[var(--color-text-muted)] bg-[#121214] rounded-2xl border border-dashed border-white/5">
                                            <DollarSign size={32} className="mx-auto mb-3 opacity-20" />
                                            <p>Nenhum registro financeiro encontrado.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Modal de Edição */}
                                {editingRecord && (
                                    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                                        <div className="bg-[#121214]/90 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-300 relative overflow-hidden group">
                                            {/* Gradient Glow */}
                                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--color-primary)]/20 rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />

                                            <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
                                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)] border border-blue-500/20">
                                                    <Pencil size={22} />
                                                </div>
                                                <span className="tracking-tight">Editar Registro</span>
                                            </h3>

                                            <div className="space-y-6 relative z-10">
                                                <div>
                                                    <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider ml-1">Descrição</label>
                                                    <input
                                                        type="text"
                                                        value={editDesc}
                                                        onChange={(e) => setEditDesc(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 placeholder:text-white/20 hover:bg-white/10"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider ml-1">Valor (R$)</label>
                                                        <input
                                                            type="number"
                                                            value={editAmount}
                                                            onChange={(e) => setEditAmount(e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 placeholder:text-white/20 hover:bg-white/10"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider ml-1">Tipo</label>
                                                            <select
                                                                value={editType}
                                                                onChange={(e) => setEditType(e.target.value as 'income' | 'expense')}
                                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 cursor-pointer hover:bg-white/10"
                                                            >
                                                                <option value="income" className="bg-[#121214]">Entrada</option>
                                                                <option value="expense" className="bg-[#121214]">Saída</option>
                                                            </select>
                                                        </div>
                                                        {editType === 'expense' && (
                                                            <div className="flex items-center h-full pt-6">
                                                                <div className="flex items-center gap-2 px-1">
                                                                    <input
                                                                        type="checkbox"
                                                                        id="editRec"
                                                                        checked={editRecurring}
                                                                        onChange={(e) => setEditRecurring(e.target.checked)}
                                                                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500"
                                                                    />
                                                                    <label htmlFor="editRec" className="text-xs text-gray-300 select-none cursor-pointer flex items-center gap-1 font-bold uppercase tracking-wider">
                                                                        <RefreshCw size={12} /> Recorrente
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider ml-1">Método</label>
                                                        <select
                                                            value={editMethod}
                                                            onChange={(e) => setEditMethod(e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 cursor-pointer hover:bg-white/10"
                                                        >
                                                            <option value="pix" className="bg-[#121214]">Pix</option>
                                                            <option value="credit_card" className="bg-[#121214]">Crédito</option>
                                                            <option value="debit_card" className="bg-[#121214]">Débito</option>
                                                            <option value="cash" className="bg-[#121214]">Dinheiro</option>
                                                            <option value="transfer" className="bg-[#121214]">Transf.</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider ml-1">Data</label>
                                                        <input
                                                            type="date"
                                                            value={editDate}
                                                            onChange={(e) => setEditDate(e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-300 cursor-pointer hover:bg-white/10 [color-scheme:dark]"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 pt-6 mt-8">
                                                    <button
                                                        onClick={() => setEditingRecord(null)}
                                                        className="flex-1 py-4 bg-transparent hover:bg-white/5 text-[var(--color-text-muted)] hover:text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 border border-white/10 hover:border-white/20"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        onClick={handleSaveEdit}
                                                        className="flex-1 py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-[1.02] active:scale-[0.98] border border-blue-400/20"
                                                    >
                                                        Salvar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Modal de Quitação */}
                                {settleRecord && (
                                    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
                                        <div className="bg-[#121214]/90 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-300 relative overflow-hidden group">
                                            {/* Gradient Glow */}
                                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />

                                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-3 relative z-10">
                                                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] border border-emerald-500/20">
                                                    <DollarSign size={22} />
                                                </div>
                                                <span className="tracking-tight">Confirmar Recebimento</span>
                                            </h3>
                                            <p className="text-sm text-[var(--color-text-muted)] mb-8 ml-14 relative z-10">
                                                Dando baixa em: <span className="text-white font-medium border-b border-white/20 pb-0.5">{settleRecord.description}</span>
                                            </p>

                                            <div className="space-y-6 relative z-10">
                                                <div>
                                                    <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider ml-1">Valor a Receber (R$)</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            value={settleAmount}
                                                            onChange={(e) => setSettleAmount(e.target.value)}
                                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-300 placeholder:text-white/20 hover:bg-white/10"
                                                        />
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-right text-[var(--color-text-muted)]">
                                                            Pendente: <span className="text-white">R$ {settleRecord.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider ml-1">Forma de Pagamento</label>
                                                    <select
                                                        value={settleMethod}
                                                        onChange={(e) => setSettleMethod(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-300 cursor-pointer hover:bg-white/10"
                                                    >
                                                        <option value="pix" className="bg-[#121214]">Pix</option>
                                                        <option value="credit_card" className="bg-[#121214]">Cartão de Crédito</option>
                                                        <option value="debit_card" className="bg-[#121214]">Cartão de Débito</option>
                                                        <option value="cash" className="bg-[#121214]">Dinheiro</option>
                                                        <option value="transfer" className="bg-[#121214]">Transferência</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-wider ml-1">Data do Recebimento</label>
                                                    <input
                                                        type="date"
                                                        value={settleDate}
                                                        onChange={(e) => setSettleDate(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all duration-300 cursor-pointer hover:bg-white/10 [color-scheme:dark]"
                                                    />
                                                </div>

                                                <div className="flex gap-4 pt-6 mt-8">
                                                    <button
                                                        onClick={() => setSettleRecord(null)}
                                                        className="flex-1 py-4 bg-transparent hover:bg-white/5 text-[var(--color-text-muted)] hover:text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 border border-white/10 hover:border-white/20"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        onClick={handleConfirmSettlement}
                                                        className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-[#09090b] rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-[1.02] active:scale-[0.98] border border-emerald-400/20"
                                                    >
                                                        Confirmar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}                        </div>
                        )}

                    {
                        activeTab === 'profile' && (
                            <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 py-4">

                                {/* Two Column Profile Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {/* Left Column: Personal */}
                                    <div className="space-y-10">
                                        <section className="bg-[#121214] p-8 rounded-2xl border border-white/5">
                                            <h4 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
                                                <User size={16} /> Informações Pessoais
                                            </h4>
                                            <div className="space-y-5">
                                                <div>
                                                    <label className="text-xs text-[var(--color-text-muted)] font-bold uppercase mb-2 block">Nome Completo</label>
                                                    <input type="text" className="input-field p-3 bg-[#09090b]" value={profileData.full_name} onChange={e => setProfileData({ ...profileData, full_name: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-[var(--color-text-muted)] font-bold uppercase mb-2 block">Bio / Sobre</label>
                                                    <textarea className="input-field min-h-[140px] p-3 bg-[#09090b]" value={profileData.bio} onChange={e => setProfileData({ ...profileData, bio: e.target.value })} placeholder="Escreva uma breve descrição..." />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs text-[var(--color-text-muted)] font-bold uppercase mb-2 block">Nascimento</label>
                                                        <input
                                                            type="date"
                                                            className="input-field p-3 bg-[#09090b]"
                                                            value={profileData.birth_date}
                                                            onChange={e => setProfileData({ ...profileData, birth_date: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-[var(--color-text-muted)] font-bold uppercase mb-2 block">Idioma</label>
                                                        <select className="input-field p-3 bg-[#09090b]" value={profileData.language} onChange={e => setProfileData({ ...profileData, language: e.target.value })}>
                                                            <option value="pt-BR">Português (BR)</option>
                                                            <option value="en-US">English (US)</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </div>

                                    {/* Right Column: Contact & Company */}
                                    <div className="space-y-10">
                                        <section className="bg-[#121214] p-8 rounded-2xl border border-white/5">
                                            <h4 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
                                                <Smartphone size={16} /> Contato
                                            </h4>
                                            <div className="space-y-5">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-xs text-[var(--color-text-muted)] font-bold uppercase mb-2 block">WhatsApp</label>
                                                        <input type="text" className="input-field p-3 bg-[#09090b]" value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} placeholder="+55..." />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs text-[var(--color-text-muted)] font-bold uppercase mb-2 block">Localização</label>
                                                        <input type="text" className="input-field p-3 bg-[#09090b]" value={profileData.location} onChange={e => setProfileData({ ...profileData, location: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs text-[var(--color-text-muted)] font-bold uppercase mb-2 block">Avatar URL</label>
                                                    <input type="text" className="input-field p-3 bg-[#09090b]" value={profileData.avatar_url} onChange={e => setProfileData({ ...profileData, avatar_url: e.target.value })} />
                                                </div>
                                            </div>
                                        </section>

                                        <section className="bg-[#121214] p-8 rounded-2xl border border-white/5">
                                            <h4 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-widest mb-6 flex items-center gap-3 border-b border-white/5 pb-4">
                                                <Building size={16} /> Empresa
                                            </h4>
                                            <div className="space-y-5">
                                                <div>
                                                    <label className="text-xs text-[var(--color-text-muted)] font-bold uppercase mb-2 block">Nome da Empresa</label>
                                                    <input type="text" className="input-field p-3 bg-[#09090b]" value={profileData.company_name} onChange={e => setProfileData({ ...profileData, company_name: e.target.value })} />
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>

                                <div className="pt-8 text-center">
                                    <Button onClick={handleSaveProfile} disabled={isSavingProfile} className="w-full md:w-auto px-12 py-4 text-base font-bold shadow-[0_0_30px_rgba(212,175,55,0.25)] hover:shadow-[0_0_50px_rgba(212,175,55,0.4)]">
                                        {isSavingProfile ? <><Clock size={20} className="animate-spin mr-2" /> Salvando...</> : <><Save size={20} className="mr-2" /> Salvar Alterações Detalhadas</>}
                                    </Button>
                                </div>
                            </div>
                        )
                    }
                </div >
            </motion.div >

        </>
    );
};

export default ProjectManager;

