export interface Service {
    id: string;
    name: string;
    description: string;
    active: boolean;
}

export interface Project {
    id: string;
    userId: string;
    service: string;
    status: 'Contratado' | 'Em Desenvolvimento' | 'Homologação' | 'Concluído';
    startDate: string;
    value: number;
    currency?: string;
    hoursBalance: number;
    maintenanceEndDate?: string;
    projectUrl?: string;
}

export interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string;
    type?: 'income' | 'expense';
    originalAmount?: number;
    currency?: string;
    exchangeRate?: number;
    payer?: string;
    paymentMethod?: string;
    taxAmount?: number;
}

export interface Associate {
    id: string;
    email: string;
    role: string;
    full_name?: string;
    phone?: string;
    company_name?: string;
    avatar_url?: string;
    bio?: string;
    location?: string;
    country?: string;
    language?: string;
    birth_date?: string;
    referral_source?: string;
    is_colab?: boolean;
    colab_brand_id?: string;
}

export interface ColabBrand {
    id: string;
    name: string;
    logo_url?: string;
}

export interface FinancialRecord {
    id: string;
    type: 'income' | 'expense';
    description: string;
    amount: number;
    original_amount: number;
    currency: string;
    exchange_rate: number;
    payer?: string;
    payment_method?: string;
    tax_amount?: number;
    date: string;
    created_at: string;
}

export interface ContactRequest {
    id: string;
    name: string;
    country: string;
    country_code: string;
    phone: string;
    message: string;
    read: boolean;
    created_at: string;
}
