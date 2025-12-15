import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, DollarSign, Settings, LogOut, MessageSquare, TrendingUp, Briefcase, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import AssociatesView from '../components/admin/AssociatesView';
import FinancialView from '../components/admin/FinancialView';
import CreateAssociateForm from '../components/admin/CreateAssociateForm';
import ProjectManager from '../components/admin/ProjectManager';
import MessagesView from '../components/admin/MessagesView';
import type { Associate, Project, Expense, Service } from '../types';

/**
 * AdminDashboard Component
 * 
 * Central hub for Administrators to manage the platform.
 * Key features:
 * - Visão Geral (Overview): Stats on associates, projects, and revenue.
 * - Associados (Associates): Management of user profiles (clients).
 * - Financeiro (Financial): Expense tracking and financial overview.
 * - Solicitações (Messages): Handling contact requests.
 * - Configurações (Settings): System-wide settings.
 */
const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('dashboard');
    const [associates, setAssociates] = useState<Associate[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);

    // Editing State
    const [editingAssociate, setEditingAssociate] = useState<Associate | null>(null);
    const [editingTab, setEditingTab] = useState<'projects' | 'logs' | 'profile'>('projects');

    useEffect(() => {
        checkAdmin();
        loadData();

        // Real-time subscription to 'contact_requests' to update the unread badges instantly
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

    /**
     * Verifies if the current user has 'admin' privileges.
     * Redirects to the associate dashboard if they are not an admin.
     */
    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/login');
            return;
        }
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin') {
            navigate('/associate');
        }
    };

    /**
     * Loads all necessary data for the admin dashboard:
     * - Unread message count
     * - List of associates
     * - All projects
     * - Expenses
     * - Available services
     */
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

            // Load Services
            const { data: servicesData } = await supabase.from('services').select('*');
            if (servicesData) setServices(servicesData);

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

    const handleRemindUser = async (email: string) => {
        // In a real app, this would trigger an email function
        alert(`Lembrete enviado para ${email}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex flex-row relative overflow-hidden" style={{
            backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(212, 175, 55, 0.05), transparent 40%)'
        }}>
            <Sidebar
                title="ADMINISTRADOR"
                logo="/logo.png" // Ensure you have a logo or remove this prop if optional
                activeSection={activeSection}
                onNavigate={setActiveSection}
                onLogout={handleLogout}
                menuItems={[
                    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
                    { id: 'associates', label: 'Associados', icon: Users },
                    { id: 'financial', label: 'Financeiro', icon: DollarSign },
                    { id: 'messages', label: 'Solicitações', icon: MessageSquare, badge: unreadCount },
                    { id: 'settings', label: 'Configurações', icon: Settings }
                ]}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col z-10 relative h-screen overflow-hidden">
                <main className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-[var(--color-primary)] scrollbar-track-transparent">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-7xl mx-auto"
                    >
                        <header className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-1">
                                    {activeSection === 'dashboard' && 'Visão Geral'}
                                    {activeSection === 'associates' && 'Gerenciar Associados'}
                                    {activeSection === 'financial' && 'Controle Financeiro'}
                                    {activeSection === 'messages' && 'Solicitações de Contato'}
                                    {activeSection === 'settings' && 'Configurações'}
                                    {activeSection === 'create-associate' && 'Novo Associado'}
                                </h2>
                                <p className="text-[var(--color-text-muted)]">Painel Administrativo NeoVertex</p>
                            </div>

                            <div className="flex items-center gap-4 bg-[rgba(255,255,255,0.03)] px-4 py-2 rounded-full border border-[rgba(255,255,255,0.05)]">
                                <div className="text-right hidden md:block">
                                    <p className="text-xs text-[var(--color-text-muted)]">Logado como</p>
                                    <p className="font-bold text-sm text-white">Administrador</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-amber-700 flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                                    AD
                                </div>
                            </div>
                        </header>

                        {activeSection === 'dashboard' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-gradient-to-br from-[rgba(255,255,255,0.03)] to-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] p-6 rounded-2xl relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Users size={64} />
                                    </div>
                                    <h3 className="text-[var(--color-text-muted)] text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Users size={16} className="text-[var(--color-primary)]" /> Total de Associados
                                    </h3>
                                    <p className="text-4xl font-bold text-white">{associates.length}</p>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-gradient-to-br from-[rgba(255,255,255,0.03)] to-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] p-6 rounded-2xl relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Briefcase size={64} />
                                    </div>
                                    <h3 className="text-[var(--color-text-muted)] text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Briefcase size={16} className="text-[var(--color-primary)]" /> Projetos Ativos
                                    </h3>
                                    <p className="text-4xl font-bold text-[var(--color-primary)]">
                                        {projects.filter(p => p.status !== 'Concluído').length}
                                    </p>
                                </motion.div>

                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="bg-gradient-to-br from-[rgba(255,255,255,0.03)] to-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] p-6 rounded-2xl relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <TrendingUp size={64} />
                                    </div>
                                    <h3 className="text-[var(--color-text-muted)] text-sm uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <TrendingUp size={16} className="text-green-400" /> Receita Mensal Est.
                                    </h3>
                                    <p className="text-4xl font-bold text-green-400">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                                            projects.reduce((acc, curr) => acc + (curr.value * 0.10), 0)
                                        )}
                                    </p>
                                </motion.div>
                            </div>
                        )}

                        {activeSection === 'associates' && (
                            <AssociatesView
                                associates={associates}
                                allProjects={projects}
                                startEditing={startEditing}
                                handleRemindUser={handleRemindUser}
                                onNewAssociate={() => setActiveSection('create-associate')}
                            />
                        )}

                        {activeSection === 'create-associate' && (
                            <CreateAssociateForm onCancel={() => setActiveSection('associates')} onSuccess={() => { loadData(); setActiveSection('associates'); }} />
                        )}

                        {activeSection === 'financial' && (
                            <FinancialView expenses={expenses} onUpdate={loadData} />
                        )}

                        {activeSection === 'messages' && (
                            <MessagesView />
                        )}

                        {activeSection === 'settings' && (
                            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-12 text-center">
                                <Settings size={64} className="mx-auto text-[var(--color-text-muted)] mb-6 opacity-50" />
                                <h3 className="text-2xl font-bold text-white mb-2">Configurações do Sistema</h3>
                                <p className="text-[var(--color-text-muted)] max-w-md mx-auto">
                                    Em breve você poderá configurar parâmetros globais, permissões e integrações diretamente por aqui.
                                </p>
                            </div>
                        )}
                    </motion.div>
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
