export interface Service {
    id: string;
    name: string;
    description: string;
    active: boolean;
    has_implementation?: boolean;
    has_monthly_fee?: boolean;
    monthly_fee_value?: number;
    monthly_fee_start_date?: string; // Date string
    payment_methods?: string;
    features?: { name: string; value: number; }[];
}

export interface Project {
    id: string;
    userId: string;
    service: string;
    status: string;
    stages?: string[];
    startDate: string;
    value: number;
    currency?: string;
    hoursBalance: number;
    maintenanceEndDate?: string;
    maintenanceValue?: number;
    monthlyMaintenanceValue?: number;
    maintenanceDueDay?: number;
    maintenanceStartDate?: string;
    projectUrl?: string;
    upgrades?: { name: string; value: number; date: string }[];
    logs?: any[];
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
    associate_id?: string;
    related_record_id?: string; // ID do registro pai ou relacionado (ex: dívida original)
    is_recurring?: boolean; // Para despesas recorrentes
}

export interface Associate {
    id: string;
    email: string;
    role: string;
    full_name?: string;
    phone?: string;
    company_name?: string;
    avatar_url?: string;
    active?: boolean;
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
    status?: 'paid' | 'pending';
    payment_method?: string; // Novo campo
    description: string;
    amount: number;
    original_amount: number;
    currency: string;
    exchange_rate: number;
    payer?: string;
    tax_amount?: number;
    date: string;
    associate_id?: string;
    associate?: {
        company_name?: string;
        full_name?: string;
    };
    created_at: string;
    is_recurring?: boolean;
    related_record_id?: string;
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
