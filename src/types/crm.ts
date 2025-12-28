export interface CRMPipeline {
    id: string;
    name: string;
    created_at: string;
}

export interface CRMStage {
    id: string;
    pipeline_id: string;
    name: string;
    order: number;
    color: string;
    created_at?: string;
}

export interface CRMLead {
    id: string;
    created_at: string;
    updated_at: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    position?: string;
    address?: string;
    country?: string;
    observation?: string;
    value: number;
    status: 'active' | 'converted' | 'lost';
    pipeline_id: string;
    stage_id: string;
    user_id?: string;
    source?: string;
    tags?: string[];
}

export interface CRMInteraction {
    id: string;
    lead_id: string;
    type: 'note' | 'call' | 'email' | 'meeting' | 'whatsapp';
    content: string;
    created_at: string;
    created_by?: string;
}
