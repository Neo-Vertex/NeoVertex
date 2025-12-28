import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Save, X, Check } from 'lucide-react';
import Button from '../Button';
import { supabase } from '../../services/supabase';
import type { Service } from '../../types';

/**
 * ProductsManager Component
 * 
 * Allows the administrator to manage the services/products offered (e.g., Website Creation, Consulting, AI Agents).
 * Corresponds to "Cadastro de Produtos" in the mind map.
 */
const ProductsManager: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentService, setCurrentService] = useState<Partial<Service>>({});

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        setLoading(true);
        const { data } = await supabase.from('services').select('*');
        if (data) {
            setServices(data);
        } else {
            // Fallback default data
            setServices([
                { id: '1', name: 'Criação de Site', description: 'Desenvolvimento de sites institucionais e e-commerce.', active: true },
                { id: '2', name: 'Consultoria Empresarial', description: 'Análise e otimização de processos de negócio.', active: true },
                { id: '3', name: 'Agentes de IA', description: 'Implementação de chatbots e automação com IA.', active: true },
            ]);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!currentService.name) return;

        const serviceData = {
            name: currentService.name,
            description: currentService.description,
            active: currentService.active,
            has_implementation: currentService.has_implementation,
            has_monthly_fee: currentService.has_monthly_fee,
            monthly_fee_value: currentService.monthly_fee_value,
            monthly_fee_start_date: currentService.monthly_fee_start_date,
            payment_methods: currentService.payment_methods,
            features: currentService.features || []
        };

        if (currentService.id) {
            // Update
            const { error } = await supabase
                .from('services')
                .update(serviceData)
                .eq('id', currentService.id);

            if (!error) {
                setServices(prev => prev.map(s => s.id === currentService.id ? { ...s, ...currentService } as Service : s));
            }
        } else {
            // Create
            const { data, error } = await supabase
                .from('services')
                .insert([{
                    ...serviceData,
                    active: currentService.active ?? true,
                    has_implementation: currentService.has_implementation ?? false,
                    has_monthly_fee: currentService.has_monthly_fee ?? false,
                    monthly_fee_value: currentService.monthly_fee_value ?? 0
                }])
                .select();

            if (data) {
                setServices(prev => [...prev, data[0]]);
            } else if (!error) {
                // Mock add for demo if DB insert fails/not set up
                setServices(prev => [...prev, { ...currentService, id: Date.now().toString() } as Service]);
            }
        }
        setIsEditing(false);
        setCurrentService({});
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este produto?')) return;

        const { error } = await supabase.from('services').delete().eq('id', id);
        if (!error) {
            setServices(prev => prev.filter(s => s.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Package className="text-[var(--color-primary)]" />
                        Cadastro de Produtos
                    </h2>
                    <p className="text-[var(--color-text-muted)]">Gerencie os serviços oferecidos pela NeoVertex.</p>
                </div>
                <Button onClick={() => { setCurrentService({ active: true }); setIsEditing(true); }}>
                    <Plus size={18} className="mr-2" /> Novo Produto
                </Button>
            </div>

            {isEditing && (
                <div className="card-glass p-6 border border-[var(--color-primary)]/50 relative animation-slide-down">
                    <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-white">
                        <X size={20} />
                    </button>
                    <h3 className="text-lg font-bold text-white mb-4">{currentService.id ? 'Editar Produto' : 'Novo Produto'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-[var(--color-text-muted)] mb-1">Nome do Serviço</label>
                            <input
                                type="text"
                                className="input-field"
                                value={currentService.name || ''}
                                onChange={e => setCurrentService({ ...currentService, name: e.target.value })}
                                placeholder="Ex: Criação de Site"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-[var(--color-text-muted)] mb-1">Status</label>
                            <select
                                className="input-field"
                                value={currentService.active ? 'true' : 'false'}
                                onChange={e => setCurrentService({ ...currentService, active: e.target.value === 'true' })}
                            >
                                <option value="true">Ativo</option>
                                <option value="false">Inativo</option>
                            </select>
                        </div>

                        {/* New Fields */}
                        <div className="md:col-span-2 flex flex-col md:flex-row gap-6 p-4 border border-white/5 rounded-lg bg-black/20">
                            {/* Implementation & Monthly Fee Toggles */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${currentService.has_implementation ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-[var(--color-text-muted)] group-hover:border-white'}`}>
                                        {currentService.has_implementation && <Check size={14} className="text-black" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={currentService.has_implementation || false}
                                        onChange={e => setCurrentService({ ...currentService, has_implementation: e.target.checked })}
                                    />
                                    <span className="text-white text-sm">Teve Implementação?</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${currentService.has_monthly_fee ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-[var(--color-text-muted)] group-hover:border-white'}`}>
                                        {currentService.has_monthly_fee && <Check size={14} className="text-black" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={currentService.has_monthly_fee || false}
                                        onChange={e => setCurrentService({ ...currentService, has_monthly_fee: e.target.checked })}
                                    />
                                    <span className="text-white text-sm">Tem Mensalidade?</span>
                                </label>
                            </div>

                            {/* Monthly Fee Details - Only show if has_monthly_fee is true */}
                            {currentService.has_monthly_fee && (
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div>
                                        <label className="block text-sm text-[var(--color-text-muted)] mb-1">Valor da Mensalidade</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">R$</span>
                                            <input
                                                type="number"
                                                className="input-field pl-8"
                                                value={currentService.monthly_fee_value || ''}
                                                onChange={e => setCurrentService({ ...currentService, monthly_fee_value: Number(e.target.value) })}
                                                placeholder="0,00"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-[var(--color-text-muted)] mb-1">Data Início</label>
                                        <input
                                            type="date"
                                            className="input-field"
                                            value={currentService.monthly_fee_start_date || ''}
                                            onChange={e => setCurrentService({ ...currentService, monthly_fee_start_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm text-[var(--color-text-muted)] mb-1">Forma de Pagamento</label>
                            <input
                                type="text"
                                className="input-field"
                                value={currentService.payment_methods || ''}
                                onChange={e => setCurrentService({ ...currentService, payment_methods: e.target.value })}
                                placeholder="Ex: Boleto, PIX, Cartão (separe por vírgulas)"
                            />
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">Insira as formas de pagamento disponíveis.</p>
                        </div>

                        {/* Features Management */}
                        <div className="md:col-span-2 border-t border-[rgba(255,255,255,0.1)] pt-4 mt-2">
                            <label className="block text-sm font-bold text-white mb-2">Features / Adicionais</label>
                            <div className="space-y-2">
                                {(currentService.features || []).map((feature, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            placeholder="Nome da Feature"
                                            className="flex-1 input-field"
                                            value={feature.name}
                                            onChange={e => {
                                                const newFeatures = [...(currentService.features || [])];
                                                newFeatures[index].name = e.target.value;
                                                setCurrentService({ ...currentService, features: newFeatures });
                                            }}
                                        />
                                        <div className="w-32 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">R$</span>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="input-field pl-8"
                                                value={feature.value}
                                                onChange={e => {
                                                    const newFeatures = [...(currentService.features || [])];
                                                    newFeatures[index].value = Number(e.target.value);
                                                    setCurrentService({ ...currentService, features: newFeatures });
                                                }}
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newFeatures = (currentService.features || []).filter((_, i) => i !== index);
                                                setCurrentService({ ...currentService, features: newFeatures });
                                            }}
                                            className="p-2 text-red-500 hover:bg-red-500/10 rounded"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentService({
                                        ...currentService,
                                        features: [...(currentService.features || []), { name: '', value: 0 }]
                                    })}
                                    className="w-full mt-2"
                                >
                                    <Plus size={16} className="mr-2" /> Adicionar Feature
                                </Button>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm text-[var(--color-text-muted)] mb-1">Descrição</label>
                            <textarea
                                className="input-field min-h-[100px]"
                                value={currentService.description || ''}
                                onChange={e => setCurrentService({ ...currentService, description: e.target.value })}
                                placeholder="Descreva o serviço..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                        <Button onClick={handleSave}><Save size={18} className="mr-2" /> Salvar</Button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                    <div key={service.id} className="card-glass p-6 group hover:border-[var(--color-primary)] transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-[rgba(255,255,255,0.05)] rounded-lg text-[var(--color-primary)]">
                                <Package size={24} />
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setCurrentService(service); setIsEditing(true); }} className="p-2 hover:bg-white/10 rounded-full text-blue-400">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => handleDelete(service.id)} className="p-2 hover:bg-white/10 rounded-full text-red-400">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                        <p className="text-[var(--color-text-muted)] text-sm mb-4 line-clamp-2">{service.description}</p>
                        <div className={`inline-flex px-2 py-1 rounded text-xs font-bold uppercase ${service.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {service.active ? 'Ativo' : 'Inativo'}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductsManager;
