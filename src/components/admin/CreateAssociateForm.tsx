import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader2, AlertCircle } from 'lucide-react';
import Button from '../Button';
import { supabase } from '../../services/supabase';
import { createClient } from '@supabase/supabase-js';
import type { Service } from '../../types';

interface CreateAssociateFormProps {
    onCancel?: () => void;
    onSuccess?: () => void;
}

const CreateAssociateForm: React.FC<CreateAssociateFormProps> = ({ onSuccess, onCancel }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        companyName: '',
        address: '',
        phone: '',
        country: '',
        location: '',
        language: 'pt-BR',
        birthDate: '',
        referralSource: '',
        isColab: false,
        colabBrandId: '',
        contractedProducts: [] as string[]
    });

    const [colabBrands, setColabBrands] = useState<any[]>([]);
    const [availableServices, setAvailableServices] = useState<Service[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const { data: brands } = await supabase.from('colab_brands').select('*');
            if (brands) setColabBrands(brands);

            const { data: services } = await supabase.from('services').select('*').eq('active', true);
            if (services) setAvailableServices(services);
            else {
                setAvailableServices([
                    { id: '1', name: 'Criação de Site', description: 'Websites institucionais', active: true },
                    { id: '2', name: 'Consultoria Empresarial', description: 'Análise de negócios', active: true },
                    { id: '3', name: 'Agentes de IA', description: 'Automação com IA', active: true },
                ]);
            }
        };
        loadData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const toggleProduct = (serviceId: string) => {
        setFormData(prev => {
            const current = prev.contractedProducts;
            const updated = current.includes(serviceId)
                ? current.filter(id => id !== serviceId)
                : [...current, serviceId];
            return { ...prev, contractedProducts: updated };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Create a temporary client to avoid logging out the admin
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            // Use memory storage to prevent affecting the main localStorage
            const MemoryStorage = {
                getItem: (key: string) => null,
                setItem: (key: string, value: string) => { },
                removeItem: (key: string) => { }
            };

            const tempSupabase = createClient(supabaseUrl, supabaseAnonKey, {
                auth: {
                    persistSession: false,
                    storage: MemoryStorage,
                    autoRefreshToken: false,
                    detectSessionInUrl: false
                }
            });

            // 2. Sign Up the new user
            const { data: authData, error: authError } = await tempSupabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) throw authError;
            if (!authData.user) throw new Error('Erro ao criar usuário. Tente novamente.');

            const userId = authData.user.id;

            // 3. Update the Profile (Trigger creates it, we update details)
            // We wait a moment to ensure trigger validation (optional, but good practice)
            // Actually, we use the session from signUp to perform the update as the user itself

            // Wait for trigger to insert profile row
            await new Promise(r => setTimeout(r, 1000));

            const { error: profileError } = await tempSupabase
                .from('profiles')
                .update({
                    full_name: formData.companyName, // Mapping company name to full_name for now or strict mapping
                    company_name: formData.companyName,
                    role: 'associate', // Trigger sets it, but ensuring
                    phone: formData.phone,
                    location: formData.address, // Using address as location
                    country: formData.country,
                    language: formData.language,
                    birth_date: formData.birthDate || null,
                    referral_source: formData.referralSource,
                    is_colab: formData.isColab,
                    colab_brand_id: formData.colabBrandId || null
                })
                .eq('id', userId);

            if (profileError) {
                console.error('Profile Update Error:', profileError);
                // Continue anyway, it's non-critical
            }

            // 4. Create Projects for selected products
            if (formData.contractedProducts.length > 0) {
                const projectsToInsert = formData.contractedProducts.map(serviceId => {
                    const service = availableServices.find(s => s.id === serviceId);
                    return {
                        user_id: userId,
                        service: service?.name || 'Serviço Personalizado',
                        status: 'Contratado',
                        start_date: new Date().toISOString(),
                        value: 0, // Default or fetch from service
                    };
                });

                const { error: projectsError } = await tempSupabase
                    .from('projects')
                    .insert(projectsToInsert);

                if (projectsError) console.error('Projects Error:', projectsError);
            }

            // Success
            if (onSuccess) onSuccess();

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Ocorreu um erro ao cadastrar o associado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card-glass p-10 max-w-5xl mx-auto shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.05)]">
            <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-liquid-gold mb-2">Cadastrar Novo Associado</h3>
                <p className="text-[var(--color-text-muted)]">Preencha os dados abaixo para criar um novo perfil de associado.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-200">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Account Info Section */}
                <div className="bg-[rgba(255,255,255,0.02)] p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
                    <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[var(--color-primary)] text-sm">1</span>
                        Dados de Acesso
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Login (Email)</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="ex: nome@empresa.com"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[var(--color-primary)] focus:bg-black/40 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] outline-none transition-all duration-300"
                                required
                            />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Senha</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[var(--color-primary)] focus:bg-black/40 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] outline-none transition-all duration-300"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Personal/Company Info Section */}
                <div className="bg-[rgba(255,255,255,0.02)] p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
                    <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[var(--color-primary)] text-sm">2</span>
                        Informações do Associado/Empresa
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Nome do Contratante / Empresa</label>
                            <input
                                type="text"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                                placeholder="Nome Completo ou Razão Social"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[var(--color-primary)] focus:bg-black/40 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] outline-none transition-all duration-300"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Telefone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+55 (11) 99999-9999"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[var(--color-primary)] focus:bg-black/40 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] outline-none transition-all duration-300"
                            />
                        </div>
                        <div className="group md:col-span-2">
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Endereço da Empresa</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Rua, Número, Bairro, Cidade - UF"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[var(--color-primary)] focus:bg-black/40 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] outline-none transition-all duration-300"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">País</label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[var(--color-primary)] focus:bg-black/40 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] outline-none transition-all duration-300"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Data de Nascimento (Opcional)</label>
                            <input
                                type="date"
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[var(--color-primary)] focus:bg-black/40 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] outline-none transition-all duration-300 [color-scheme:dark]"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Products/Services Section */}
                <div className="bg-[rgba(255,255,255,0.02)] p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
                    <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[var(--color-primary)] text-sm">3</span>
                        Produtos Contratados
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableServices.map(service => (
                            <div
                                key={service.id}
                                onClick={() => toggleProduct(service.id)}
                                className={`
                                    cursor-pointer p-4 rounded-xl border transition-all duration-300 flex flex-col gap-2 relative overflow-hidden
                                    ${formData.contractedProducts.includes(service.id)
                                        ? 'bg-[rgba(212,175,55,0.1)] border-[var(--color-primary)]'
                                        : 'bg-black/20 border-white/10 hover:bg-black/40'}
                                `}
                            >
                                <div className="flex justify-between items-start">
                                    <h5 className={`font-bold ${formData.contractedProducts.includes(service.id) ? 'text-[var(--color-primary)]' : 'text-white'}`}>{service.name}</h5>
                                    {formData.contractedProducts.includes(service.id) && <div className="w-5 h-5 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-black text-xs font-bold">✓</div>}
                                </div>
                                <p className="text-xs text-[var(--color-text-muted)]">{service.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Marketing & Colab Section */}
                <div className="bg-[rgba(255,255,255,0.02)] p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
                    <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[var(--color-primary)] text-sm">4</span>
                        Origem & Parcerias
                    </h4>
                    <div className="space-y-6">
                        <div className="group">
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Como nos conheceu?</label>
                            <input
                                type="text"
                                name="referralSource"
                                value={formData.referralSource}
                                onChange={handleChange}
                                placeholder="Ex: Instagram, Indicação, Google..."
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[var(--color-primary)] focus:bg-black/40 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] outline-none transition-all duration-300"
                            />
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl border border-white/5 hover:border-[var(--color-primary)]/30 transition-colors cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, isColab: !prev.isColab }))}>
                            <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${formData.isColab ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-[var(--color-text-muted)]'}`}>
                                {formData.isColab && <span className="text-black font-bold">✓</span>}
                            </div>
                            <input
                                type="checkbox"
                                id="isColab"
                                name="isColab"
                                checked={formData.isColab}
                                onChange={handleChange}
                                className="hidden"
                            />
                            <label htmlFor="isColab" className="text-white font-medium cursor-pointer select-none flex-1">
                                Este associado veio de uma Colaboração (Parceria)?
                            </label>
                        </div>

                        <AnimatePresence>
                            {formData.isColab && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="bg-gradient-to-r from-[rgba(212,175,55,0.1)] to-transparent p-6 rounded-xl border border-[rgba(212,175,55,0.3)] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Save size={100} />
                                        </div>
                                        <label className="block text-sm font-bold text-[var(--color-primary)] mb-3 relative z-10">Selecione a Marca Parceira</label>
                                        <div className="relative z-10">
                                            <select
                                                name="colabBrandId"
                                                value={formData.colabBrandId}
                                                onChange={handleChange}
                                                className="w-full bg-black/40 border border-[rgba(212,175,55,0.3)] rounded-xl px-4 py-3.5 text-white focus:border-[var(--color-primary)] focus:shadow-[0_0_20px_rgba(212,175,55,0.2)] outline-none appearance-none cursor-pointer transition-all duration-300"
                                            >
                                                <option value="">Selecione uma marca...</option>
                                                {colabBrands.map(brand => (
                                                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-primary)]">▼</div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="pt-4 flex gap-4">
                    {onCancel && (
                        <Button variant="outline" type="button" onClick={onCancel} className="flex-1 justify-center py-5">
                            Cancelar
                        </Button>
                    )}
                    <Button type="submit" disabled={loading} className="flex-[2] justify-center py-5 text-lg font-bold tracking-wide shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.4)] transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? <Loader2 className="animate-spin mr-2" /> : <Save size={24} className="mr-3" />}
                        {loading ? 'Cadastrando...' : 'Cadastrar Associado'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateAssociateForm;
