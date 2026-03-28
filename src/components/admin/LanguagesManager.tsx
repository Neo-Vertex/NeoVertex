import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';

/**
 * LanguagesManager Component
 *
 * Allows management of supported languages for the system.
 * Corresponds to "Idiomas" in the mind map.
 */
const LanguagesManager: React.FC = () => {
    // In a real app, this might come from a config file or DB.
    const [languages, setLanguages] = useState([
        { code: 'pt-BR', name: 'Português (Brasil)', active: true },
        { code: 'en-US', name: 'Inglês (Estados Unidos)', active: true },
        { code: 'fr-FR', name: 'Francês', active: false },
        { code: 'es-ES', name: 'Espanhol', active: false },
    ]);

    const toggleLanguage = (code: string) => {
        setLanguages(prev => prev.map((lang: any) =>
            lang.code === code ? { ...lang, active: !lang.active } : lang
        ));
    };

    return (
        <div className="p-6 anim-fade-in space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Globe className="text-[var(--color-primary)]" />
                    Idiomas do Sistema
                </h2>
                <p className="text-[var(--color-text-muted)]">Ative ou desative os idiomas disponíveis na plataforma.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {languages.map((lang: any) => (
                    <div
                        key={lang.code}
                        onClick={() => toggleLanguage(lang.code)}
                        className="card relative overflow-hidden cursor-pointer transition-all duration-300"
                        style={{
                            border: lang.active ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(255,255,255,0.05)',
                            background: lang.active ? 'rgba(212,175,55,0.08)' : undefined,
                        }}
                    >
                        <div className="anim-shimmer" />
                        <div className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                                    style={lang.active
                                        ? { background: 'linear-gradient(135deg,#D4AF37,#8a6010)', color: '#000' }
                                        : { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }
                                    }
                                >
                                    {lang.code.split('-')[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold ${lang.active ? 'text-white' : 'text-[var(--color-text-muted)]'}`}>
                                        {lang.name}
                                    </h3>
                                    <p className="text-xs text-[var(--color-text-muted)]">{lang.code}</p>
                                </div>
                            </div>

                            <div className={`
                                w-6 h-6 rounded-full border flex items-center justify-center transition-colors
                                ${lang.active ? 'bg-green-500 border-green-500 text-black' : 'border-[rgba(255,255,255,0.2)]'}
                            `}>
                                {lang.active && <Check size={14} strokeWidth={4} />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="panel relative overflow-hidden mt-8">
                <div className="anim-shimmer" />
                <h3 className="text-lg font-bold text-white mb-2">Nota sobre Internacionalização</h3>
                <p className="text-[var(--color-text-muted)] text-sm">
                    Alterar as configurações de idioma aqui habilitará as opções no seletor de idiomas público e do painel do associado.
                    Certifique-se de que os arquivos de tradução (JSON) correspondentes existam na pasta <code>src/locales</code>.
                </p>
            </div>
        </div>
    );
};

export default LanguagesManager;
