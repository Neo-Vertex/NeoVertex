import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ptBR from './locales/pt-BR.json';
import ptPT from './locales/pt-PT.json';
import frCH from './locales/fr-CH.json';
import en from './locales/en.json';
import es from './locales/es.json';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            'pt-BR': { translation: ptBR },
            'pt-PT': { translation: ptPT },
            'fr-CH': { translation: frCH },
            'en': { translation: en },
            'es': { translation: es }
        },
        lng: 'pt-BR', // Default language
        fallbackLng: 'pt-BR',
        interpolation: {
            escapeValue: false // React already safes from xss
        }
    });

export default i18n;
