import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2, Save, X } from 'lucide-react';
import { supabase } from '../../services/supabase';
import Stamp from '../common/Stamp';
import Button from '../Button';

interface CreateAssociateFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    initialData?: any;
}

interface FormData {
    email: string;
    password: string;
    companyName: string;
    phone: string;
    address: string;
    country: string;
    language: string;
    birthDate: string;
    contractedProducts: string[];
    referralSource: string;
    isColab: boolean;
    colabBrandId: string;
}

const availableServices = [
    { id: '1', name: 'Websites & Landing Pages', description: 'Criação de sites de alta conversão' },
    { id: '2', name: 'Sistemas & Aplicativos', description: 'Automação e ERP' },
    { id: '3', name: 'Consultoria de IA', description: 'Integração de Inteligência Artificial' },
];

const colabBrands = [
    { id: 'brand1', name: 'Marca Parceira 1' },
    { id: 'brand2', name: 'Marca Parceira 2' },
];

const CreateAssociateForm: React.FC<CreateAssociateFormProps> = ({ onSuccess, onCancel, initialData }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showStamp, setShowStamp] = useState(false);

    const [formData, setFormData] = useState<FormData>({
        email: initialData?.email || '',
        password: '',
        companyName: initialData?.companyName || '',
        phone: initialData?.phone || '',
        address: initialData?.address || '',
        country: initialData?.country || '',
        language: initialData?.language || 'pt-BR',
        birthDate: initialData?.birthDate || '',
        contractedProducts: initialData?.contractedProducts || [],
        referralSource: initialData?.referralSource || '',
        isColab: initialData?.isColab || false,
        colabBrandId: initialData?.colabBrandId || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const toggleProduct = (serviceId: string) => {
        setFormData(prev => {
            const products = prev.contractedProducts;
            if (products.includes(serviceId)) {
                return { ...prev, contractedProducts: products.filter(id => id !== serviceId) };
            } else {
                return { ...prev, contractedProducts: [...products, serviceId] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // ... (existing logic for creating user, profile, projects)

            // 1. Criar o usuário (não afeta a sessão do admin no novo sistema)
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
            });

            if (authError) {
                if (authError.message.includes('already registered') || authError.message.includes('já existe')) {
                    throw new Error('Este email já está cadastrado para outro associado. Por favor, utilize outro email.');
                }
                throw authError;
            }

            if (!authData?.user) throw new Error('Erro ao criar usuário. Tente novamente.');

            const userId = authData.user.id;

            // 2. Atualizar o perfil
            const { error: profileError } = (await supabase
                .from('profiles')
                .update({
                    full_name: formData.companyName,
                    company_name: formData.companyName,
                    role: 'associate',
                    phone: formData.phone,
                    location: formData.address,
                    country: formData.country,
                    language: formData.language,
                    birth_date: formData.birthDate || null,
                    referral_source: formData.referralSource,
                    is_colab: formData.isColab,
                    colab_brand_id: formData.colabBrandId || null
                })
                .eq('id', userId)) as any;

            if (profileError) {
                console.error('Profile Update Error:', profileError);
            }

            // 3. Criar projetos vinculados
            if (formData.contractedProducts.length > 0) {
                const projectsToInsert = formData.contractedProducts.map(serviceId => {
                    const service = availableServices.find(s => s.id === serviceId);
                    return {
                        user_id: userId,
                        service: service?.name || 'Serviço Personalizado',
                        status: 'Contratado',
                        start_date: new Date().toISOString().split('T')[0],
                        value: 0,
                    };
                });

                const { error: projectsError } = (await supabase
                    .from('projects')
                    .insert(projectsToInsert)) as any;

                if (projectsError) console.error('Projects Error:', projectsError);
            }

            // Success Animation
            triggerStamp();
            setTimeout(() => {
                if (onSuccess) onSuccess();
            }, 3000);

        } catch (err: any) {
            console.error(err);
            // Translate common Supabase errors
            let msg = err.message || 'Ocorreu um erro ao cadastrar o associado.';
            if (msg.includes('already registered')) msg = 'Este email já está cadastrado para outro associado.';

            setError(msg);
            setLoading(false);
        }
    };

    const triggerStamp = () => {
        setShowStamp(true);
        setTimeout(() => setShowStamp(false), 3000);
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)' }}
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{
              background:'rgba(8,8,18,0.95)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
              border:'1px solid rgba(212,175,55,0.15)',
              boxShadow:'0 40px 80px rgba(0,0,0,0.7)',
              animation:'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
            }}
          >
            {/* Top shimmer line */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.5),transparent)' }} />

            {/* Header */}
            <div className="flex items-center justify-between p-6 sticky top-0 z-10"
              style={{ borderBottom:'1px solid rgba(212,175,55,0.08)', background:'rgba(8,8,18,0.95)', backdropFilter:'blur(12px)' }}
            >
              <h2 style={{ fontFamily:'Cinzel, serif', fontSize:14, fontWeight:700, color:'#D4AF37', letterSpacing:'0.1em' }}>
                CADASTRAR NOVO ASSOCIADO
              </h2>
              <button
                onClick={onCancel}
                aria-label="Fechar"
                style={{ color:'rgba(255,255,255,0.4)', transition:'color 0.2s', background:'none', border:'none', cursor:'pointer' }}
                onMouseEnter={e=>(e.currentTarget.style.color='#fff')}
                onMouseLeave={e=>(e.currentTarget.style.color='rgba(255,255,255,0.4)')}
              ><X size={18} aria-hidden={true}/></button>
            </div>

            <div style={{ padding:'24px' }}>
            <AnimatePresence>
                {showStamp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-none"
                        onClick={() => setShowStamp(false)}
                    >
                        <Stamp />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="text-center mb-10 relative">
                <p className="text-[var(--color-text-muted)]">Preencha os dados abaixo para criar um novo perfil de associado.</p>

                {/* Manual Stamp Button */}
                <button
                    type="button"
                    onClick={triggerStamp}
                    className="absolute right-0 top-0 p-2 text-[var(--color-primary)] hover:bg-[rgba(212,175,55,0.1)] rounded-full transition-colors flex flex-col items-center gap-1 group"
                    title="Carimbar Manualmente"
                >
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-lg">★</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Carimbar</span>
                </button>
            </div>

            {/* ... (rest of the form content same as before) */}

            {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-200">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* ... (Form Fields) */}
                {/* 1. Account Info Section */}
                <div className="bg-[rgba(255,255,255,0.02)] p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
                    <h4 className="mb-6 flex items-center gap-2" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.15em', color:'rgba(212,175,55,0.55)', marginBottom:12 }}>
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
                                className="input-field w-full"
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
                                className="input-field w-full"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Personal/Company Info Section */}
                <div className="bg-[rgba(255,255,255,0.02)] p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
                    <h4 className="mb-6 flex items-center gap-2" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.15em', color:'rgba(212,175,55,0.55)', marginBottom:12 }}>
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
                                className="input-field w-full"
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
                                className="input-field w-full"
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
                                className="input-field w-full"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">País</label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="input-field w-full"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Data de Nascimento (Opcional)</label>
                            <input
                                type="date"
                                name="birthDate"
                                value={formData.birthDate}
                                onChange={handleChange}
                                className="input-field w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Products/Services Section */}
                <div className="bg-[rgba(255,255,255,0.02)] p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
                    <h4 className="mb-6 flex items-center gap-2" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.15em', color:'rgba(212,175,55,0.55)', marginBottom:12 }}>
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
                    <h4 className="mb-6 flex items-center gap-2" style={{ fontSize:10, fontWeight:700, letterSpacing:'0.15em', color:'rgba(212,175,55,0.55)', marginBottom:12 }}>
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
                                className="input-field w-full"
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
                                                className="input-field w-full"
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
                    <button
                        type="submit"
                        disabled={loading}
                        style={{ background:'linear-gradient(135deg,#D4AF37,#8a6010)', color:'#000', fontWeight:700, fontSize:12, letterSpacing:'0.1em', padding:'10px 24px', borderRadius:10, boxShadow:'0 4px 16px rgba(212,175,55,0.25)', border:'none', cursor:'pointer', flex:2, display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity: loading ? 0.5 : 1 }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {loading ? 'Cadastrando...' : 'Cadastrar Associado'}
                    </button>
                </div>
            </form>
            </div>
          </div>
        </div>
    );
};

export default CreateAssociateForm;
