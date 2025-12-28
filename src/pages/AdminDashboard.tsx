import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Bell, Trash2, Briefcase, ChevronDown } from 'lucide-react';
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
import type { Associate, Project, Expense } from '../types';

// Editing State
const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [associates, setAssociates] = useState<Associate[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [userEmail, setUserEmail] = useState('');

    const [editingAssociate, setEditingAssociate] = useState<Associate | null>(null);
    const [editingTab, setEditingTab] = useState<'projects' | 'logs' | 'profile'>('projects');

    useEffect(() => {
        checkAdmin();
        loadData();

        const subscription = supabase
            .channel('admin_dashboard_badges')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_requests' }, () => {
                fetchUnreadCount();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

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

            // Load Projects
            const { data: projectsData } = await supabase.from('projects').select('*');
            if (projectsData) setProjects(projectsData.map(p => ({
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

            // Load Expenses
            const { data: expensesData } = await supabase.from('expenses').select('*');
            if (expensesData) setExpenses(expensesData);

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
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

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [associateToDelete, setAssociateToDelete] = useState<string | null>(null);
    const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

    // Reset Password State
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [resetPasswordAssociate, setResetPasswordAssociate] = useState<Associate | null>(null);
    const [newResetPassword, setNewResetPassword] = useState('');
    const [isResettingPassword, setIsResettingPassword] = useState(false);

    const handleRemindUser = async (email: string) => {
        alert(`Lembrete enviado para ${email}`);
    };

    const handleToggleActive = async (associate: Associate) => {
        const newStatus = !associate.active;
        const { error } = await supabase.from('profiles').update({ active: newStatus }).eq('id', associate.id);

        if (error) {
            console.error('Error toggling active status:', error);
            alert('Erro ao atualizar status do associado.');
            return;
        }

        setAssociates(associates.map(a => a.id === associate.id ? { ...a, active: newStatus } : a));
    };

    const requestDeleteAssociate = (associateId: string) => {
        setAssociateToDelete(associateId);
        setIsPasswordModalOpen(true);
    };

    const confirmDeleteAssociate = async () => {
        if (!associateToDelete || !passwordConfirmation) return;
        setIsVerifyingPassword(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user || !user.email) {
                alert('Erro ao identificar usuário logado.');
                return;
            }

            const { error: authError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: passwordConfirmation
            });

            if (authError) {
                alert('Senha incorreta.');
                setIsVerifyingPassword(false);
                return;
            }

            // Password correct, proceed with delete
            const { error: deleteError } = await supabase.from('profiles').delete().eq('id', associateToDelete);

            if (deleteError) {
                throw deleteError;
            }

            setAssociates(associates.filter(a => a.id !== associateToDelete));
            setIsPasswordModalOpen(false);
            setAssociateToDelete(null);
            setPasswordConfirmation('');
            alert('Associado excluído com sucesso.');

        } catch (error: any) {
            console.error('Error deleting associate:', error);
            alert(`Erro ao excluir associado: ${error.message || error.details || 'Erro desconhecido'}. \n\nVerifique se rodou o script de correção de banco de dados.`);
        } finally {
            setIsVerifyingPassword(false);
        }
    };

    const handleResetPasswordInit = (associate: Associate) => {
        setResetPasswordAssociate(associate);
        setNewResetPassword('');
        setIsResetModalOpen(true);
    };

    const confirmResetPassword = async () => {
        if (!resetPasswordAssociate || !newResetPassword) return;
        setIsResettingPassword(true);

        try {
            const { error } = await supabase.rpc('admin_reset_password', {
                target_user_id: resetPasswordAssociate.id,
                new_password: newResetPassword
            });

            if (error) throw error;

            alert(`Senha redefinida com sucesso para o associado ${resetPasswordAssociate.full_name || resetPasswordAssociate.email}.`);
            setIsResetModalOpen(false);
            setResetPasswordAssociate(null);
            setNewResetPassword('');

        } catch (error: any) {
            console.error('Error resetting password:', error);
            alert(`Erro ao redefinir senha: ${error.message || 'Erro desconhecido'}. \n\nVerifique se o script 'reset_user_password.sql' foi rodado no banco de dados.`);
        } finally {
            setIsResettingPassword(false);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[var(--color-bg)] text-white overflow-hidden">
            {/* Password Confirmation Modal */}
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

            {/* Reset Password Modal */}
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

            {/* Sidebar (New Tech Component) */}
            <Sidebar
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                handleLogout={handleLogout}
                unreadCount={unreadCount}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                <TopBar
                    activeSection={activeSection}
                    adminEmail={userEmail}
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {activeSection === 'dashboard' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <motion.div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-gray-400 text-sm">Total de Associados</h3>
                                            <p className="text-2xl font-bold">{associates.length}</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                                            <Briefcase size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-gray-400 text-sm">Projetos Ativos</h3>
                                            <p className="text-2xl font-bold">{projects.filter(p => p.status === 'Em Desenvolvimento').length}</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-[var(--color-primary)]/10 rounded-xl text-[var(--color-primary)]">
                                            <DollarSign size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-gray-400 text-sm">Receita Mensal</h3>
                                            <p className="text-2xl font-bold">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                                    projects.reduce((acc, curr) => acc + (Number(curr.value || 0) * 0.1), 0)
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
                                            <Bell size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-gray-400 text-sm">Alertas (Vencimento)</h3>
                                            <p className="text-2xl font-bold">
                                                {projects.filter(p => {
                                                    if (!p.maintenanceEndDate) return false;
                                                    const today = new Date();
                                                    const end = new Date(p.maintenanceEndDate);
                                                    const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                                    return diffDays <= 5 && diffDays >= 0;
                                                }).length}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        {activeSection === 'create-associate' && (
                            <CreateAssociateForm onCancel={() => setActiveSection('settings-associates')} onSuccess={() => { loadData(); setActiveSection('settings-associates'); }} />
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
                            <FinancialView key="fin-dash" expenses={expenses} onUpdate={loadData} initialTab="summary" />
                        )}

                        {activeSection === 'financial-records' && (
                            <FinancialView key="fin-rec" expenses={expenses} onUpdate={loadData} initialTab="income" />
                        )}

                        {activeSection === 'messages' && <MessagesView />}

                    </div>
                </main>
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
