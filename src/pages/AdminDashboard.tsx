import React, { useState, useEffect } from 'react';
import { Users, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/admin/TopBar';
import Sidebar from '../components/admin/Sidebar';
import AssociatesView from '../components/admin/AssociatesView';
import FinancialView from '../components/admin/FinancialView';
import CreateAssociateForm from '../components/admin/CreateAssociateForm';
import ProjectManager from '../components/admin/ProjectManager';
import MessagesView from '../components/admin/MessagesView';
import ProductsManager from '../components/admin/ProductsManager';
import LanguagesManager from '../components/admin/LanguagesManager';
import CRMView from '../components/crm/CRMView';
import AgendaView from '../components/admin/AgendaView';
import AmbientBackground from '../components/AmbientBackground';
import type { Associate, Project, FinancialRecord } from '../types';
import type { CRMLead } from '../types/crm';

// Helper for Month/Year Selection
const getMonthYearRange = (date: Date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0); // Last day of month
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Data State
    const [associates, setAssociates] = useState<Associate[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
    // const [expenses, setExpenses] = useState<Expense[]>([]); // Removed: using financialRecords strictly

    // UI State
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [userEmail, setUserEmail] = useState('');

    // Filter State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [leadConversionData, setLeadConversionData] = useState<CRMLead | null>(null);

    // Editing State
    const [editingAssociate, setEditingAssociate] = useState<Associate | null>(null);
    const [editingTab, setEditingTab] = useState<'projects' | 'logs' | 'profile'>('projects');

    useEffect(() => {
        checkAdmin();
        loadData();

        const subscription = supabase
            .channel('admin_dashboard_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_requests' }, () => fetchUnreadCount())
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Reload data when parameters that affect calculations change
    useEffect(() => {
        // Ideally we would fetch filtered data here, but we fetch all for now.
        // Ensuring financial records are fresh is good practice.
        loadFinancialData();
    }, [selectedDate]);

    const fetchUnreadCount = async () => {
        const { count } = await supabase
            .from('contact_requests')
            .select('*', { count: 'exact', head: true })
            .eq('read', false);
        setUnreadCount(count || 0);
    };

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/login');
            return;
        }
        setUserEmail(user.email || '');
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin') {
            navigate('/associate');
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            fetchUnreadCount();

            // Load Associates
            const { data: associatesData } = await supabase.from('profiles').select('*').eq('role', 'associate');
            if (associatesData) setAssociates(associatesData);

            // Load Projects (All, for stats)
            const { data: projectsData } = await supabase.from('projects').select('*');
            if (projectsData) setProjects(projectsData.map((p: any) => ({
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

            await loadFinancialData();

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadFinancialData = async () => {
        // Fetch financial records
        const { data: financialData } = await supabase
            .from('financial_records')
            .select('*');

        if (financialData) {
            setFinancialRecords(financialData);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const startEditing = (associate: Associate, tab: 'projects' | 'logs' | 'profile' = 'projects') => {
        setEditingAssociate(associate);
        setEditingTab(tab);
    };

    // --- Monthly Filter & Metrics ---
    const getMonthlyData = () => {
        const { start, end } = getMonthYearRange(selectedDate);

        // Filter Financial Records for Selected Month
        const monthlyRecords = financialRecords.filter(r => {
            const rDate = new Date(r.date + 'T12:00:00');
            return rDate >= start && rDate <= end;
        });

        // Calculate Monthly Sales (New Projects)
        const monthlySales = projects.reduce((acc, project) => {
            if (!project.startDate) return acc;
            const projectDate = new Date(project.startDate);
            if (projectDate >= start && projectDate <= end) {
                return acc + Number(project.value || 0);
            }
            return acc;
        }, 0);

        return { monthlyRecords, monthlySales };
    };

    const { monthlyRecords, monthlySales } = getMonthlyData();



    // --- Modal States ---
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [associateToDelete, setAssociateToDelete] = useState<string | null>(null);
    const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resetPasswordAssociate, setResetPasswordAssociate] = useState<Associate | null>(null);
    const [newResetPassword, setNewResetPassword] = useState('');
    const [isResettingPassword, setIsResettingPassword] = useState(false);

    // --- Handlers --- (Keep existing logic for password/delete/reset)
    const handleRemindUser = async (email: string) => { alert(`Lembrete enviado para ${email}`); };
    const handleToggleActive = async (associate: Associate) => {
        const newStatus = !associate.active;
        const { error } = await supabase.from('profiles').update({ active: newStatus }).eq('id', associate.id);
        if (error) { alert('Erro ao atualizar status.'); return; }
        setAssociates(associates.map(a => a.id === associate.id ? { ...a, active: newStatus } : a));
    };

    const requestDeleteAssociate = (associateId: string) => { setAssociateToDelete(associateId); setIsPasswordModalOpen(true); };
    const confirmDeleteAssociate = async () => {
        if (!associateToDelete || !passwordConfirmation) return;
        setIsVerifyingPassword(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) return;

            // 1. Verify Admin Password
            const { error: authError } = await supabase.auth.signInWithPassword({ email: user.email, password: passwordConfirmation });
            if (authError) { alert('Senha incorreta.'); return; }

            // 2. Attempt Safe Deletion via RPC
            const { error: rpcError } = await supabase.rpc('admin_delete_associate', { target_user_id: associateToDelete });

            if (rpcError) {
                console.error('RPC Error:', rpcError);
                // Fallback or specific error handling
                if (rpcError.message.includes('function admin_delete_associate') && rpcError.message.includes('does not exist')) {
                    alert('ERRO DE SISTEMA: A função de exclusão segura não foi encontrada no banco de dados.\n\nPor favor, execute o script "fix_delete_associate.sql" no SQL Editor do Supabase.');
                    return;
                }

                // If RPC fails for other reasons, try direct delete (legacy method) just in case
                // preventing complete blocking if RPC has issues but direct works (unlikely for constraints)
                const { error: deleteError } = await supabase.from('profiles').delete().eq('id', associateToDelete);
                if (deleteError) throw deleteError;
            }

            setAssociates(associates.filter(a => a.id !== associateToDelete));
            setIsPasswordModalOpen(false);
            alert('Associado e todos os seus dados vinculados foram excluídos com sucesso.');
            loadData(); // Force reload to confirm DB deletion
        } catch (error: any) {
            console.error('Full Delete Error:', error);
            alert(`Erro detalhado ao excluir: \n${JSON.stringify(error, null, 2) || error.message}`);
        } finally {
            setIsVerifyingPassword(false);
        }
    };

    const handleResetPasswordInit = (associate: Associate) => { setResetPasswordAssociate(associate); setIsResetModalOpen(true); };
    const confirmResetPassword = async () => {
        if (!resetPasswordAssociate || !newResetPassword) return;
        setIsResettingPassword(true);
        try {
            const { error } = await supabase.rpc('admin_reset_password', { target_user_id: resetPasswordAssociate.id, new_password: newResetPassword });
            if (error) throw error;
            alert(`Senha redefinida com sucesso para ${resetPasswordAssociate.full_name}.`);
            setIsResetModalOpen(false);
        } catch (error: any) { alert(`Erro: ${error.message}`); } finally { setIsResettingPassword(false); }
    };

    // Helper to change month
    const changeMonth = (offset: number) => {
        const newDate = new Date(selectedDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setSelectedDate(newDate);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen text-white overflow-hidden relative" style={{ background: '#04040a' }}>
            <AmbientBackground />
            {/* --- Password Confirmation Modal --- */}
            <AnimatePresence>
                {isPasswordModalOpen && (
                    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1a1a1a] p-6 rounded-lg border border-red-500/50 w-full max-w-md shadow-2xl"
                        >
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Trash2 className="text-red-500" /> Confirmar Exclusão
                            </h3>
                            <p className="text-gray-300 mb-6">
                                Tem certeza que deseja excluir este associado? Esta ação apagará todos os projetos, mensagens e dados financeiros vinculados. <br /><br />
                                <strong>Para confirmar, digite sua senha de administrador:</strong>
                            </p>

                            <input
                                type="password"
                                value={passwordConfirmation}
                                onChange={e => setPasswordConfirmation(e.target.value)}
                                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg p-3 text-white focus:outline-none focus:border-red-500 transition-colors mb-6"
                                placeholder="Sua senha..."
                                autoFocus
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => { setIsPasswordModalOpen(false); setPasswordConfirmation(''); }}
                                    className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDeleteAssociate}
                                    disabled={isVerifyingPassword || !passwordConfirmation}
                                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isVerifyingPassword ? 'Verificando...' : 'Confirmar Exclusão'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- Reset Password Modal --- */}
            <AnimatePresence>
                {isResetModalOpen && resetPasswordAssociate && (
                    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1a1a1a] p-6 rounded-lg border border-[var(--color-primary)]/50 w-full max-w-md shadow-2xl"
                        >
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Users className="text-[var(--color-primary)]" /> Redefinir Senha
                            </h3>
                            <p className="text-gray-300 mb-6">
                                Digite a nova senha para o associado <strong>{resetPasswordAssociate.full_name || resetPasswordAssociate.email}</strong>.
                                <br />
                                <span className='text-xs text-yellow-500/80'>Esta senha será usada para o login imediato.</span>
                            </p>

                            <input
                                type="text"
                                value={newResetPassword}
                                onChange={e => setNewResetPassword(e.target.value)}
                                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg p-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors mb-6 font-mono"
                                placeholder="Nova senha..."
                                autoFocus
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => { setIsResetModalOpen(false); setResetPasswordAssociate(null); }}
                                    className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmResetPassword}
                                    disabled={isResettingPassword || !newResetPassword || newResetPassword.length < 6}
                                    className="px-4 py-2 rounded-lg bg-[var(--color-primary)] hover:brightness-110 text-black font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isResettingPassword ? 'Salvando...' : 'Redefinir Senha'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="relative z-10 flex flex-row w-full min-h-screen overflow-hidden">
            <Sidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                handleLogout={handleLogout}
                unreadCount={unreadCount}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                adminEmail={userEmail}
            />

            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <TopBar
                    activeSection={activeSection}
                    adminEmail={userEmail}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {activeSection === 'dashboard' && (
                            <>
                                {/* --- Month Selector --- */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => changeMonth(-1)} className="btn btn-ghost btn-sm">
                                            <ChevronLeft size={16} />
                                        </button>
                                        <div className="flex items-center gap-2 px-4 py-2 card" style={{ borderRadius: 8, padding: '8px 16px' }}>
                                            <CalendarIcon size={16} style={{ color: '#D4AF37' }} />
                                            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: '#fff', textTransform: 'uppercase' }}>
                                                {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <button onClick={() => changeMonth(1)} className="btn btn-ghost btn-sm">
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                    <button onClick={() => setSelectedDate(new Date())} className="btn btn-secondary btn-sm">
                                        Mês Atual
                                    </button>
                                </div>

                                <div className="mb-8">
                                    <FinancialView
                                        key={`fin-overview-${selectedDate.toISOString()}`}
                                        records={monthlyRecords}
                                        associates={associates}
                                        onUpdate={loadData}
                                        initialTab="summary"
                                        contractSales={monthlySales}
                                        selectedDate={selectedDate}
                                        historyRecords={financialRecords}
                                        allProjects={projects}
                                    />
                                </div>


                            </>
                        )}

                        {activeSection === 'create-associate' && (
                            <CreateAssociateForm
                                initialData={leadConversionData}
                                onCancel={() => {
                                    setActiveSection('settings-associates');
                                    setLeadConversionData(null);
                                }}
                                onSuccess={() => {
                                    loadData();
                                    setActiveSection('settings-associates');
                                    setLeadConversionData(null);
                                }}
                            />
                        )}

                        {activeSection === 'settings-associates' && (
                            <AssociatesView
                                associates={associates}
                                allProjects={projects}
                                startEditing={startEditing}
                                handleRemindUser={handleRemindUser}
                                onNewAssociate={() => setActiveSection('create-associate')}
                                onDeleteAssociate={requestDeleteAssociate}
                                onToggleActive={handleToggleActive}
                                onResetPassword={handleResetPasswordInit}
                            />
                        )}

                        {activeSection === 'settings-products' && <ProductsManager />}
                        {activeSection === 'settings-languages' && <LanguagesManager />}

                        {activeSection === 'financial-dashboard' && (
                            <FinancialView
                                key={`fin-dash-${selectedDate.toISOString()}`}
                                records={monthlyRecords}
                                associates={associates}
                                onUpdate={loadData}
                                initialTab="summary"
                                contractSales={monthlySales}
                                selectedDate={selectedDate}
                            />
                        )}

                        {activeSection === 'financial-records' && (
                            <FinancialView key="fin-rec" records={financialRecords} associates={associates} onUpdate={loadData} initialTab="income" />
                        )}

                        {activeSection === 'messages' && <MessagesView />}

                        {activeSection === 'crm' && <CRMView onConvertLead={(lead) => { setLeadConversionData(lead); setActiveSection('create-associate'); }} />}

                        {activeSection === 'agenda' && <AgendaView />}
                    </div>
                </main>
            </div>
            </div>

            {/* Edit Modal */}
            {editingAssociate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <ProjectManager
                        associate={editingAssociate}
                        onClose={() => setEditingAssociate(null)}
                        initialTab={editingTab}
                    />
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
