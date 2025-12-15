import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Globe, Package, Briefcase, Pencil, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../Button';
import { supabase } from '../../services/supabase';
import type { Service } from '../../types';

interface SettingsViewProps {
    services: Service[];
    setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}

const SettingsView: React.FC<SettingsViewProps> = ({ services, setServices }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'products' | 'colabs'>('general');

    // Services State
    const [newServiceName, setNewServiceName] = useState('');
    const [newServiceDesc, setNewServiceDesc] = useState('');
    const [editingService, setEditingService] = useState<Service | null>(null);

    // Products State
    const [products, setProducts] = useState<any[]>([]);
    const [newProductName, setNewProductName] = useState('');
    const [newProductDesc, setNewProductDesc] = useState('');
    const [newProductValue, setNewProductValue] = useState('');

    // Colabs State
    const [colabs, setColabs] = useState<any[]>([]);
    const [newColabName, setNewColabName] = useState('');
    const [newColabLogo, setNewColabLogo] = useState('');

    useEffect(() => {
        if (activeTab === 'products') loadProducts();
        if (activeTab === 'colabs') loadColabs();
    }, [activeTab]);

    const loadProducts = async () => {
        const { data } = await supabase.from('products').select('*');
        if (data) setProducts(data);
    };

    const loadColabs = async () => {
        const { data } = await supabase.from('colab_brands').select('*');
        if (data) setColabs(data);
    };

    // Service Handlers
    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newServiceName.trim()) {
            const { data } = await supabase.from('services').insert([{
                name: newServiceName,
                description: newServiceDesc
            }]).select().single();

            if (data) {
                setServices([...services, data]);
                setNewServiceName('');
                setNewServiceDesc('');
            }
        }
    };

    const handleUpdateService = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingService && newServiceName.trim()) {
            const { data } = await supabase.from('services').update({
                name: newServiceName,
                description: newServiceDesc
            }).eq('id', editingService.id).select().single();

            if (data) {
                setServices(services.map(s => s.id === data.id ? data : s));
                cancelEditService();
            }
        }
    };

    const handleRemoveService = async (id: string) => {
        await supabase.from('services').delete().eq('id', id);
        setServices(services.filter(s => s.id !== id));
    };

    const startEditService = (service: Service) => {
        setEditingService(service);
        setNewServiceName(service.name);
        setNewServiceDesc(service.description || '');
    };

    const cancelEditService = () => {
        setEditingService(null);
        setNewServiceName('');
        setNewServiceDesc('');
    };

    // Product Handlers
    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data, error } = await supabase.from('products').insert([{
            name: newProductName,
            description: newProductDesc,
            base_value: parseFloat(newProductValue)
        }]).select().single();

        if (data) {
            setProducts([...products, data]);
            setNewProductName('');
            setNewProductDesc('');
            setNewProductValue('');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        await supabase.from('products').delete().eq('id', id);
        setProducts(products.filter(p => p.id !== id));
    };

    // Colab Handlers
    const handleAddColab = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data, error } = await supabase.from('colab_brands').insert([{
            name: newColabName,
            logo_url: newColabLogo
        }]).select().single();

        if (data) {
            setColabs([...colabs, data]);
            setNewColabName('');
            setNewColabLogo('');
        }
    };

    const handleDeleteColab = async (id: string) => {
        await supabase.from('colab_brands').delete().eq('id', id);
        setColabs(colabs.filter(c => c.id !== id));
    };

    const tabs = [
        { id: 'general', label: 'Geral', icon: Globe },
        { id: 'products', label: 'Produtos', icon: Package },
        { id: 'colabs', label: 'Colabs', icon: Briefcase },
    ];

    return (
        <div className="card-glass p-8">
            {/* Segmented Control Tabs */}
            <div className="flex mb-8 bg-black/30 p-1.5 rounded-xl relative w-fit mx-auto md:mx-0 border border-white/5">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`relative flex items-center gap-2 px-6 py-2.5 rounded-lg transition-all duration-300 z-10 ${isActive ? 'text-black font-bold' : 'text-[var(--color-text-muted)] hover:text-white'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeSettingsTab"
                                    className="absolute inset-0 bg-[var(--color-primary)] rounded-lg shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <Icon size={18} className="relative z-10" />
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* General Tab */}
                    {activeTab === 'general' && (
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Globe className="text-[var(--color-primary)]" /> Gerenciar Serviços
                            </h3>

                            <form onSubmit={editingService ? handleUpdateService : handleAddService} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 bg-white/5 p-6 rounded-2xl border border-white/5">
                                <div className="md:col-span-4">
                                    <label className="block text-xs text-[var(--color-text-muted)] mb-1 ml-1">Nome do Serviço</label>
                                    <input
                                        type="text"
                                        value={newServiceName}
                                        onChange={(e) => setNewServiceName(e.target.value)}
                                        placeholder="Ex: Web Site"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)] focus:bg-black/40 outline-none transition-all"
                                    />
                                </div>
                                <div className="md:col-span-8">
                                    <label className="block text-xs text-[var(--color-text-muted)] mb-1 ml-1">Descrição</label>
                                    <input
                                        type="text"
                                        value={newServiceDesc}
                                        onChange={(e) => setNewServiceDesc(e.target.value)}
                                        placeholder="Descrição detalhada do serviço..."
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)] focus:bg-black/40 outline-none transition-all"
                                    />
                                </div>
                                <div className="md:col-span-12 flex justify-end gap-2 mt-2">
                                    {editingService && (
                                        <Button type="button" onClick={cancelEditService} className="bg-white/10 hover:bg-white/20 text-white border-none">
                                            <X size={18} /> Cancelar
                                        </Button>
                                    )}
                                    <Button type="submit" className="w-full md:w-auto">
                                        {editingService ? <><Save size={18} /> Salvar Alterações</> : <><Plus size={18} /> Adicionar Serviço</>}
                                    </Button>
                                </div>
                            </form>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <AnimatePresence>
                                    {services.map((service) => (
                                        <motion.div
                                            key={service.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className={`flex justify-between items-center p-4 bg-white/5 rounded-xl border transition-colors group ${editingService?.id === service.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-white/5 hover:border-[var(--color-primary)]/50'}`}
                                        >
                                            <div className="flex-1">
                                                <span className="text-white font-medium block">{service.name}</span>
                                                {service.description && <span className="text-sm text-[var(--color-text-muted)] block mt-1">{service.description}</span>}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => startEditService(service)}
                                                    className="text-[var(--color-primary)] hover:text-white p-2 hover:bg-[var(--color-primary)]/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveService(service.id)}
                                                    className="text-red-400/70 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Products Tab */}
                    {activeTab === 'products' && (
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Package className="text-[var(--color-primary)]" /> Gerenciar Produtos
                            </h3>
                            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 bg-white/5 p-6 rounded-2xl border border-white/5">
                                <div className="md:col-span-4">
                                    <label className="block text-xs text-[var(--color-text-muted)] mb-1 ml-1">Nome do Produto</label>
                                    <input
                                        type="text"
                                        value={newProductName}
                                        onChange={(e) => setNewProductName(e.target.value)}
                                        placeholder="Ex: Consultoria Premium"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)] focus:bg-black/40 outline-none transition-all"
                                    />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-xs text-[var(--color-text-muted)] mb-1 ml-1">Valor Base (R$)</label>
                                    <input
                                        type="number"
                                        value={newProductValue}
                                        onChange={(e) => setNewProductValue(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)] focus:bg-black/40 outline-none transition-all"
                                    />
                                </div>
                                <div className="md:col-span-5">
                                    <label className="block text-xs text-[var(--color-text-muted)] mb-1 ml-1">Descrição Curta</label>
                                    <input
                                        type="text"
                                        value={newProductDesc}
                                        onChange={(e) => setNewProductDesc(e.target.value)}
                                        placeholder="Breve descrição do serviço..."
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)] focus:bg-black/40 outline-none transition-all"
                                    />
                                </div>
                                <div className="md:col-span-12 flex justify-end mt-2">
                                    <Button type="submit" className="w-full md:w-auto">
                                        <Plus size={18} /> Adicionar Produto
                                    </Button>
                                </div>
                            </form>
                            <div className="space-y-3">
                                {products.map((product) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex justify-between items-center p-5 bg-white/5 rounded-xl border border-white/5 hover:border-[var(--color-primary)]/30 transition-all hover:bg-white/10"
                                    >
                                        <div>
                                            <p className="font-bold text-white text-lg">{product.name}</p>
                                            <p className="text-sm text-[var(--color-text-muted)]">{product.description}</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <span className="text-[var(--color-primary)] font-bold text-xl">R$ {product.base_value}</span>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="text-red-400/70 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Colabs Tab */}
                    {activeTab === 'colabs' && (
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <Briefcase className="text-[var(--color-primary)]" /> Marcas Parceiras (Colabs)
                            </h3>
                            <form onSubmit={handleAddColab} className="flex flex-col md:flex-row gap-4 mb-8 bg-white/5 p-6 rounded-2xl border border-white/5">
                                <div className="flex-1">
                                    <label className="block text-xs text-[var(--color-text-muted)] mb-1 ml-1">Nome da Marca</label>
                                    <input
                                        type="text"
                                        value={newColabName}
                                        onChange={(e) => setNewColabName(e.target.value)}
                                        placeholder="Nome da empresa parceira"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)] focus:bg-black/40 outline-none transition-all"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs text-[var(--color-text-muted)] mb-1 ml-1">URL da Logo</label>
                                    <input
                                        type="text"
                                        value={newColabLogo}
                                        onChange={(e) => setNewColabLogo(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[var(--color-primary)] focus:bg-black/40 outline-none transition-all"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button type="submit" className="w-full md:w-auto h-[50px]">
                                        <Plus size={18} /> Adicionar
                                    </Button>
                                </div>
                            </form>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {colabs.map((colab) => (
                                    <motion.div
                                        key={colab.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-[var(--color-primary)]/30 transition-all hover:bg-white/10 group"
                                    >
                                        <div className="w-16 h-16 rounded-lg bg-black/40 flex items-center justify-center border border-white/10 p-2">
                                            {colab.logo_url ? (
                                                <img src={colab.logo_url} alt={colab.name} className="w-full h-full object-contain" />
                                            ) : (
                                                <Briefcase className="text-white/20" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-white text-lg">{colab.name}</p>
                                            <p className="text-xs text-[var(--color-text-muted)]">Parceiro Registrado</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteColab(colab.id)}
                                            className="text-red-400/70 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default SettingsView;
