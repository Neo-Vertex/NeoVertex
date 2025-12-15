import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save } from 'lucide-react';
import Button from '../Button';
import { supabase } from '../../services/supabase';

interface CreateAssociateFormProps {
    onCancel?: () => void;
    onSuccess?: () => void;
}

const CreateAssociateForm: React.FC<CreateAssociateFormProps> = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        country: '',
        location: '',
        language: 'pt-BR',
        birthDate: '',
        referralSource: '',
        isColab: false,
        colabBrandId: ''
    });

    const [colabBrands, setColabBrands] = useState<any[]>([]);

    useEffect(() => {
        const loadBrands = async () => {
            const { data } = await supabase.from('colab_brands').select('*');
            if (data) setColabBrands(data);
        };
        loadBrands();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // alert('Atenção: A criação direta de usuários via Admin requer uma Edge Function ou logout. Por enquanto, vamos simular o cadastro dos dados do perfil.');

        // Simulate success
        console.log('Form Data:', formData);
        if (onSuccess) onSuccess();
    };

    return (
        <div className="card-glass p-10 max-w-5xl mx-auto shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.05)]">
            <div className="text-center mb-10">
                <h3 className="text-3xl font-bold text-liquid-gold mb-2">Cadastrar Novo Associado</h3>
                <p className="text-[var(--color-text-muted)]">Preencha os dados abaixo para criar um novo perfil de associado.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Account Info Section */}
                <div className="bg-[rgba(255,255,255,0.02)] p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
                    <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[var(--color-primary)] text-sm">1</span>
                        Dados de Acesso
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Email</label>
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
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Senha Temporária</label>
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

                {/* Personal Info Section */}
                <div className="bg-[rgba(255,255,255,0.02)] p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
                    <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[var(--color-primary)] text-sm">2</span>
                        Informações Pessoais
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Localização (Cidade/Estado)</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[var(--color-primary)] focus:bg-black/40 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] outline-none transition-all duration-300"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Idioma</label>
                            <div className="relative">
                                <select
                                    name="language"
                                    value={formData.language}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-[var(--color-primary)] focus:bg-black/40 outline-none appearance-none cursor-pointer transition-all duration-300"
                                >
                                    <option value="pt-BR">Português (Brasil)</option>
                                    <option value="en-US">Inglês (US)</option>
                                    <option value="fr-FR">Francês</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]">▼</div>
                            </div>
                        </div>
                        <div className="group">
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2 group-focus-within:text-[var(--color-primary)] transition-colors">Data de Nascimento</label>
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

                {/* Marketing & Colab Section */}
                <div className="bg-[rgba(255,255,255,0.02)] p-6 rounded-2xl border border-[rgba(255,255,255,0.05)]">
                    <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[var(--color-primary)] text-sm">3</span>
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
                                        <p className="text-xs text-[var(--color-text-muted)] mt-3 relative z-10 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]"></span>
                                            A logo desta marca aparecerá automaticamente no dashboard do associado.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="pt-4">
                    <Button type="submit" className="w-full justify-center py-5 text-lg font-bold tracking-wide shadow-[0_10px_30px_rgba(212,175,55,0.2)] hover:shadow-[0_15px_40px_rgba(212,175,55,0.4)] transform hover:-translate-y-1 transition-all duration-300">
                        <Save size={24} className="mr-3" /> Cadastrar Associado
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateAssociateForm;
