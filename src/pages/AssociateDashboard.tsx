import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import { Calendar, Clock, AlertTriangle, CheckCircle, Package, Settings, Globe, Link as LinkIcon, Menu } from 'lucide-react';
import { paymentService } from '../services/payment';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabase';
import { useTranslation } from 'react-i18next';

import type { Project } from '../types';

interface Product {
    id: string;
    name: string;
    description: string;
    base_value: number;
}

interface ColabBrand {
    name: string;
    logo_url: string;
}

/**
 * AssociateDashboard Component
 * 
 * This is the main dashboard for "Associate" users (clients).
 * It allows users to:
 * - View their active projects and their status.
 * - Monitor hours balance and maintenance contracts.
 * - Request new subscriptions or buy additional hours.
 * - View available products and services.
 * - Change language settings.
 * - View project logs/history.
 */
const AssociateDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const [userEmail, setUserEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [projects, setProjects] = useState<Project[]>([]);
    const [colabBrand, setColabBrand] = useState<ColabBrand | null>(null);
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [activeSection, setActiveSection] = useState('projects');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    /**
     * Fetches the authenticated user's data, profile, projects, and available products.
     * Also handles language initialization based on user profile.
     */
    useEffect(() => {
        // ... (keep existing useEffect logic)
        const fetchUserData = async () => {
            setIsLoading(true);
            const timeoutId = setTimeout(() => setIsLoading(false), 5000); // Failsafe timeout

            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    navigate('/login');
                    return;
                }

                setUserEmail(user.email || '');
                setUserId(user.id);

                // Fetch Profile for Colab Info and Language
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_colab, colab_brand_id, language')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    if (!profile.language) {
                        setShowLanguageModal(true); // Show modal if no language set
                    } else {
                        i18n.changeLanguage(profile.language);
                    }

                    if (profile.is_colab && profile.colab_brand_id) {
                        const { data: brand } = await supabase
                            .from('colab_brands')
                            .select('*')
                            .eq('id', profile.colab_brand_id)
                            .single();
                        setColabBrand(brand);
                    }
                }

                // Load projects associated with the user
                const { data: projectsData, error: projectsError } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('user_id', user.id);

                if (projectsError) {
                    console.error('Error fetching projects:', projectsError);
                } else {
                    setProjects(projectsData.map(p => ({
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
                }

                // Load available products for purchase
                const { data: productsData } = await supabase
                    .from('products')
                    .select('*');
                setAvailableProducts(productsData || []);
            } catch (error) {
                console.error("Error loading associate data:", error);
            } finally {
                clearTimeout(timeoutId);
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [navigate, i18n]);

    // ... (keep helper functions)
    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const handleUpdateLanguage = async (lang: string) => {
        if (!userId) return;

        await supabase.from('profiles').update({ language: lang }).eq('id', userId);
        i18n.changeLanguage(lang);
        setShowLanguageModal(false);
    };

    const formatCurrency = (value: number, currency: string = 'BRL') => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: currency }).format(value);
    };

    const handleRequestSubscription = async (project: Project) => {
        const fee = (project.value || 0) * 0.10; // 10% for monthly subscription
        await paymentService.createCheckoutSession(project.id, 'subscription', fee);
    };

    const handleBuyHours = async (project: Project) => {
        const hourlyRate = (project.value || 0) * 0.05; // 5% for hourly rate
        await paymentService.createCheckoutSession(project.id, 'hourly', hourlyRate);
    };

    const getMaintenanceStatus = (dateString?: string) => {
        if (!dateString) return { status: 'inactive', text: 'Não Contratada', color: 'var(--color-text-muted)' };

        const today = new Date();
        const endDate = new Date(dateString);
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { status: 'expired', text: 'Expirada', color: '#ff4444' };
        if (diffDays <= 7) return { status: 'warning', text: `Vence em ${diffDays} dias`, color: '#fbbf24' };
        return { status: 'active', text: `Ativa até ${endDate.toLocaleDateString('pt-BR')}`, color: '#4ade80' };
    };


    const [logs, setLogs] = useState<any[]>([]);
    const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
    const [selectedProjectName, setSelectedProjectName] = useState('');

    const handleViewLogs = async (projectId: string, projectName: string) => {
        setIsLoading(true);
        const { data } = await supabase
            .from('project_logs')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (data) {
            setLogs(data);
            setSelectedProjectName(projectName);
            setIsLogsModalOpen(true);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex flex-row relative overflow-hidden" style={{
            backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(212, 175, 55, 0.15), transparent 50%)'
        }}>
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[var(--color-primary)] font-medium animate-pulse">Carregando dados...</p>
                    </div>
                </div>
            )}

            <Sidebar
                title="ÁREA DO ASSOCIADO"
                logo={colabBrand?.logo_url || "/logo.png"}
                userEmail={userEmail}
                activeSection={activeSection}
                onNavigate={(id) => { setActiveSection(id); setIsSidebarOpen(false); }}
                onLogout={handleLogout}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                menuItems={[
                    { id: 'projects', label: 'Meus Projetos', icon: Calendar },
                    { id: 'products', label: 'Produtos & Serviços', icon: Package },

                    { id: 'settings', label: 'Configurações', icon: Settings }
                ]}
            />

            <div className="flex-1 flex flex-col z-10 relative h-screen overflow-hidden">
                <main className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-[var(--color-primary)] scrollbar-track-transparent">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-7xl mx-auto"
                    >
                        {/* Header Content */}
                        <div className="flex items-center justify-between mb-8 gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsSidebarOpen(true)}
                                    className="p-2 md:hidden text-white hover:bg-white/10 rounded-lg"
                                >
                                    <Menu size={24} />
                                </button>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Bem-vindo, Associado!</h2>
                                    <p className="text-[var(--color-text-muted)] text-sm md:text-base">Gerencie seus projetos e contrate novos serviços.</p>
                                </div>
                            </div>
                            {colabBrand && (
                                <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/10 backdrop-blur-sm">
                                    <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Parceria</span>
                                    <div className="h-8 w-[1px] bg-white/10"></div>
                                    <span className="font-bold text-white">{colabBrand.name}</span>
                                </div>
                            )}
                        </div>

                        {activeSection === 'projects' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-[var(--color-primary)] border-b border-[rgba(212,175,55,0.3)] pb-2 inline-block mb-4">
                                    Meus Projetos Ativos
                                </h3>

                                {projects.length === 0 ? (
                                    <p className="text-[var(--color-text-muted)] italic bg-[rgba(255,255,255,0.02)] p-8 rounded-xl text-center border border-[rgba(255,255,255,0.05)]">
                                        Você ainda não possui projetos ativos. Entre em contato com o administrador.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 gap-6">
                                        {projects.map((project, index) => {
                                            const maintenance = getMaintenanceStatus(project.maintenanceEndDate);
                                            return (
                                                <motion.div
                                                    key={project.id}
                                                    initial={{ x: -20, opacity: 0 }}
                                                    animate={{ x: 0, opacity: 1 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className="bg-[rgba(0,0,0,0.4)] border border-[rgba(212,175,55,0.2)] rounded-2xl p-6 hover:border-[var(--color-primary)] transition-colors"
                                                >
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div>
                                                            <strong className="block text-2xl text-white mb-2 flex items-center gap-2">
                                                                {project.service}
                                                                {project.projectUrl && (
                                                                    <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] hover:text-white" title="Acessar Projeto">
                                                                        <LinkIcon size={18} />
                                                                    </a>
                                                                )}
                                                            </strong>
                                                            <div className="text-sm text-[var(--color-text-muted)] space-y-1">
                                                                <p>Início: {new Date(project.startDate).toLocaleDateString('pt-BR')}</p>
                                                                <p className="text-[var(--color-primary-light)] text-lg font-medium">
                                                                    Valor do Projeto: {formatCurrency(project.value || 0, project.currency)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${project.status === 'Concluído' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                                                                project.status === 'Em Desenvolvimento' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]' :
                                                                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                                                                }`}>
                                                                {project.status}
                                                            </span>
                                                            <button
                                                                onClick={() => handleViewLogs(project.id, project.service)}
                                                                className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1"
                                                            >
                                                                <Clock size={12} /> Ver Histórico
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-[rgba(255,255,255,0.03)] p-4 rounded-xl">
                                                        <div>
                                                            <span className="text-xs text-[var(--color-text-muted)] block mb-1">Banco de Horas</span>
                                                            <div className="flex items-center gap-2 text-white text-xl font-bold">
                                                                <Clock size={20} className="text-[var(--color-primary)]" />
                                                                {project.hoursBalance || 0}h
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-xs text-[var(--color-text-muted)] block mb-1">Manutenção</span>
                                                            <div className="flex items-center gap-2 text-lg font-bold" style={{ color: maintenance.color }}>
                                                                {maintenance.status === 'active' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                                                                {maintenance.text}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-[rgba(255,255,255,0.1)]">
                                                        <div className="flex-1">
                                                            <span className="text-xs text-[var(--color-text-muted)] block mb-1">Assinatura Mensal (10%)</span>
                                                            <strong className="text-lg text-[var(--color-primary-light)] block mb-3">
                                                                {formatCurrency((project.value || 0) * 0.10, project.currency)} / mês
                                                            </strong>
                                                            <button
                                                                onClick={() => handleRequestSubscription(project)}
                                                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-primary)] text-black font-bold hover:bg-white transition-colors"
                                                            >
                                                                <Calendar size={18} /> Renovar Assinatura
                                                            </button>
                                                        </div>
                                                        <div className="flex-1">
                                                            <span className="text-xs text-[var(--color-text-muted)] block mb-1">Hora de Desenvolvimento (5%)</span>
                                                            <strong className="text-lg text-[var(--color-primary-light)] block mb-3">
                                                                {formatCurrency((project.value || 0) * 0.05, project.currency)} / hora
                                                            </strong>
                                                            <button
                                                                onClick={() => handleBuyHours(project)}
                                                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--color-primary)] text-[var(--color-primary)] font-bold hover:bg-[var(--color-primary)] hover:text-black transition-colors"
                                                            >
                                                                <Clock size={18} /> Pedir Ajuda
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeSection === 'products' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white border-b border-[rgba(255,255,255,0.1)] pb-2 inline-flex items-center gap-2 mb-4">
                                    <Package className="text-[var(--color-primary)]" /> Produtos & Serviços Disponíveis
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {availableProducts.map((product) => (
                                        <div key={product.id} className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-6 hover:bg-[rgba(255,255,255,0.05)] hover:border-[var(--color-primary)]/30 transition-all group">
                                            <h4 className="font-bold text-white text-xl mb-2 group-hover:text-[var(--color-primary)] transition-colors">{product.name}</h4>
                                            <p className="text-sm text-[var(--color-text-muted)] mb-6 min-h-[3rem]">{product.description}</p>
                                            <div className="flex flex-col gap-4">
                                                <span className="text-2xl font-bold text-white">{formatCurrency(product.base_value)}</span>
                                                <button
                                                    onClick={() => paymentService.createCheckoutSession(product.id, 'product', product.base_value, product.name)}
                                                    className="w-full py-2.5 rounded-xl border border-[var(--color-primary)] text-[var(--color-primary)] font-bold hover:bg-[var(--color-primary)] hover:text-black transition-colors text-sm uppercase tracking-wider"
                                                >
                                                    Tenho Interesse
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {availableProducts.length === 0 && (
                                        <p className="text-[var(--color-text-muted)] col-span-full text-center py-12 bg-[rgba(255,255,255,0.02)] rounded-xl">
                                            Nenhum produto disponível no momento.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}



                        {activeSection === 'settings' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white border-b border-[rgba(255,255,255,0.1)] pb-2 inline-flex items-center gap-2 mb-4">
                                    <Settings className="text-[var(--color-primary)]" /> Configurações
                                </h3>
                                <div className="bg-[rgba(255,255,255,0.03)] p-6 rounded-lg border border-[rgba(255,255,255,0.05)]">
                                    <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <Globe size={18} className="text-[var(--color-primary)]" /> Idioma
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['pt-BR', 'pt-PT', 'en', 'es', 'fr-CH'].map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => handleUpdateLanguage(lang)}
                                                className={`p-4 rounded-lg border transition-all ${i18n.language === lang ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-white' : 'border-[rgba(255,255,255,0.1)] text-[var(--color-text-muted)] hover:bg-[rgba(255,255,255,0.05)]'}`}
                                            >
                                                {lang === 'pt-BR' && 'Português (Brasil)'}
                                                {lang === 'pt-PT' && 'Português (Portugal)'}
                                                {lang === 'en' && 'English'}
                                                {lang === 'es' && 'Español'}
                                                {lang === 'fr-CH' && 'Français'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </main>
            </div>

            {/* Logs Modal */}
            <AnimatePresence>
                {isLogsModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setIsLogsModalOpen(false)}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#1a1a1a] border border-[var(--color-primary)] rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6 border-b border-[rgba(255,255,255,0.1)] pb-4">
                                <h3 className="text-xl font-bold text-white">Histórico: {selectedProjectName}</h3>
                                <button onClick={() => setIsLogsModalOpen(false)} className="text-[var(--color-text-muted)] hover:text-white">Fechar</button>
                            </div>
                            <div className="space-y-3">
                                {logs.length === 0 ? (
                                    <p className="text-center text-[var(--color-text-muted)] py-8">Nenhum registro encontrado.</p>
                                ) : (
                                    logs.map((log: any) => (
                                        <div key={log.id} className="bg-[rgba(255,255,255,0.03)] p-4 rounded-lg border-l-2 border-[var(--color-primary)]">
                                            <div className="flex justify-between items-start">
                                                <p className="text-white font-medium">{log.description}</p>
                                                <span className="text-[var(--color-primary)] font-bold text-sm whitespace-nowrap">-{log.duration_minutes} min</span>
                                            </div>
                                            <p className="text-xs text-[var(--color-text-muted)] mt-2">{new Date(log.created_at).toLocaleString()}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* First Access Language Modal */}
            <AnimatePresence>
                {showLanguageModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            className="bg-[#1a1a1a] border border-[var(--color-primary)] rounded-xl w-full max-w-lg p-8 shadow-[0_0_50px_rgba(212,175,55,0.2)] text-center"
                        >
                            <Globe size={48} className="text-[var(--color-primary)] mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome! / Bem-vindo!</h2>
                            <p className="text-[var(--color-text-muted)] mb-8">Please select your preferred language to continue.<br />Por favor, selecione seu idioma preferido para continuar.</p>

                            <div className="grid grid-cols-1 gap-3">
                                <button onClick={() => handleUpdateLanguage('en')} className="p-4 rounded-lg border border-[rgba(255,255,255,0.1)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all text-white font-medium">
                                    English
                                </button>
                                <button onClick={() => handleUpdateLanguage('pt-BR')} className="p-4 rounded-lg border border-[rgba(255,255,255,0.1)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all text-white font-medium">
                                    Português (Brasil)
                                </button>
                                <button onClick={() => handleUpdateLanguage('pt-PT')} className="p-4 rounded-lg border border-[rgba(255,255,255,0.1)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all text-white font-medium">
                                    Português (Portugal)
                                </button>
                                <button onClick={() => handleUpdateLanguage('es')} className="p-4 rounded-lg border border-[rgba(255,255,255,0.1)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all text-white font-medium">
                                    Español
                                </button>
                                <button onClick={() => handleUpdateLanguage('fr-CH')} className="p-4 rounded-lg border border-[rgba(255,255,255,0.1)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-all text-white font-medium">
                                    Français
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AssociateDashboard;
