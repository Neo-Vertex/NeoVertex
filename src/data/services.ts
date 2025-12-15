
export interface ServiceData {
    id: string;
    slug: string;
    title: string;
    description: string;
    benefits: string[];
    cta: string;
    theme: {
        primary: string;
        accent: string;
        gradient: string;
    };
    icon: string; // Storing icon name for dynamic rendering if needed, or just use ID
}

export const services: ServiceData[] = [
    {
        id: 'consulting',
        slug: 'consultoria',
        title: 'Consultoria Estratégica',
        description: 'Análise profunda e planos de ação customizados.',
        benefits: [
            'Criação de Branding',
            'Precificação Estratégica',
            'Plano de Ação',
            'Pesquisa de Mercado'
        ],
        cta: 'Agendar Consultoria',
        theme: {
            primary: '#FFD700', // Gold
            accent: '#000000',
            gradient: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.2), transparent 70%)'
        },
        icon: 'LineChart'
    },
    {
        id: 'ai',
        slug: 'ia',
        title: 'Inteligência Artificial',
        description: 'Agentes autônomos e automações 24/7.',
        benefits: [
            'Agentes Inteligentes',
            'Automação de Processos',
            'Análise Preditiva',
            'IA Generativa'
        ],
        cta: 'Automatizar Agora',
        theme: {
            primary: '#00FF00', // Matrix Green
            accent: '#000000',
            gradient: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 0, 0.2), transparent 70%)'
        },
        icon: 'Bot'
    },
    {
        id: 'systems',
        slug: 'sistemas',
        title: 'Desenvolvimento de Sistemas',
        description: 'Sistemas sob medida: ERP, CRM e Dashboards.',
        benefits: [
            'ERP Personalizado',
            'CRM & Vendas',
            'Integração de APIs',
            'Dashboards em Tempo Real'
        ],
        cta: 'Simulador de Sistema',
        theme: {
            primary: '#00EAFF', // Cyan
            accent: '#000000',
            gradient: 'radial-gradient(circle at 50% 50%, rgba(0, 234, 255, 0.2), transparent 70%)'
        },
        icon: 'LayoutDashboard'
    },
    {
        id: 'websites',
        slug: 'websites',
        title: 'Desenvolvimento de Websites',
        description: 'Sites de alta performance que vendem.',
        benefits: [
            'UI/UX Design Premium',
            'SEO & Performance',
            'E-commerce Escalável',
            'Responsividade Total'
        ],
        cta: 'Iniciar Projeto',
        theme: {
            primary: '#9D00FF', // Purple
            accent: '#000000',
            gradient: 'radial-gradient(circle at 50% 50%, rgba(157, 0, 255, 0.2), transparent 70%)'
        },
        icon: 'Globe'
    },
];
