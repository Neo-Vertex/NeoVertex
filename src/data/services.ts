
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
        title: 'Consultoria Empresarial',
        description: 'Da criação de branding e precificação ao plano de ação estratégico. Análise de mercado e da concorrência para posicionar sua empresa no topo.',
        benefits: [
            'Criação de Branding Impactante',
            'Estratégias de Precificação Lucrativa',
            'Plano de Ação Personalizado',
            'Análise Profunda de Concorrência'
        ],
        cta: 'Elevar meu Negócio',
        theme: {
            primary: '#FFD700', // Gold
            accent: '#000000',
            gradient: 'radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.2), transparent 70%)'
        },
        icon: 'LineChart'
    },
    {
        id: 'websites',
        slug: 'websites',
        title: 'Construção de Websites',
        description: 'Sites institucionais e e-commerce de alta performance. Design exclusivo, velocidade e conversão focados em resultados reais.',
        benefits: [
            'Design Exclusivo e Premium',
            'E-commerce de Alta Conversão',
            'Otimização SEO Avançada',
            'Integração Completa'
        ],
        cta: 'Iniciar Projeto Web',
        theme: {
            primary: '#9D00FF', // Purple
            accent: '#000000',
            gradient: 'radial-gradient(circle at 50% 50%, rgba(157, 0, 255, 0.2), transparent 70%)'
        },
        icon: 'Globe'
    },
    {
        id: 'systems',
        slug: 'sistemas',
        title: 'Desenvolvimento de Sistemas',
        description: 'Soluções sob medida para gestão completa: Estoque, CRM, Financeiro e interação com cliente. O controle total da sua empresa em um só lugar.',
        benefits: [
            'Gestão de Estoque em Tempo Real',
            'CRM Integrado e Inteligente',
            'Controle Financeiro Preciso',
            'Painéis de Dados Customizáveis'
        ],
        cta: 'Otimizar minha Gestão',
        theme: {
            primary: '#00EAFF', // Cyan/Blue
            accent: '#000000',
            gradient: 'radial-gradient(circle at 50% 50%, rgba(0, 234, 255, 0.2), transparent 70%)'
        },
        icon: 'LayoutDashboard'
    },
    {
        id: 'ai',
        slug: 'ia',
        title: 'Inteligência Artificial',
        description: 'Agentes de IA que trabalham por você: atendem, vendem, agendam e organizam. A revolução operacional para sua empresa.',
        benefits: [
            'Atendimento 24/7 Automatizado',
            'Agendamento Inteligente de Reuniões',
            'Vendas e Negociação Autônoma',
            'Análise Preditiva de Pedidos'
        ],
        cta: 'Implementar IA Agora',
        theme: {
            primary: '#00FF00', // Matrix Green
            accent: '#000000',
            gradient: 'radial-gradient(circle at 50% 50%, rgba(0, 255, 0, 0.2), transparent 70%)'
        },
        icon: 'Bot'
    }
];
