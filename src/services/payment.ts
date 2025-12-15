
/**
 * PaymentService Interface
 * Defines the contract for payment operations.
 */
export interface PaymentService {
    createCheckoutSession(id: string, type: 'subscription' | 'hourly' | 'product', amount: number, name?: string): Promise<void>;
}

/**
 * StripePaymentService
 * 
 * Implementation of PaymentService.
 * CURRENTLY A MOCK implementation.
 * In a real scenario, this would communicate with a backend to generate Stripe Checkout Sessions.
 */
class StripePaymentService implements PaymentService {
    async createCheckoutSession(id: string, type: 'subscription' | 'hourly' | 'product', amount: number, name?: string): Promise<void> {
        // SECURITY NOTE: In a real production environment, this method would call your backend API.
        // The backend would then use the Stripe Secret Key to create a session securely.
        // Frontend-only Stripe integration for dynamic pricing is NOT secure as it exposes logic/keys.

        console.log(`Creating ${type} checkout session for ID ${id} with amount ${amount}`);

        // Mocking the behavior for now as requested, until backend is available.
        // In the future, replace this with:
        // const response = await fetch('https://your-secure-backend.com/api/create-checkout-session', { ... });
        // const session = await response.json();
        // stripe.redirectToCheckout({ sessionId: session.id });

        let message = '';
        if (type === 'subscription') {
            message = `Olá, gostaria de contratar a assinatura mensal para o projeto (ID: ${id}). Valor: R$ ${amount.toFixed(2)}/mês.`;
        } else if (type === 'hourly') {
            message = `Olá, gostaria de comprar horas de desenvolvimento para o projeto (ID: ${id}). Valor base: R$ ${amount.toFixed(2)}/hora.`;
        } else if (type === 'product') {
            message = `Olá, tenho interesse no produto/serviço: ${name} (ID: ${id}). Valor: R$ ${amount.toFixed(2)}.`;
        }

        // Fallback to WhatsApp for now to demonstrate the flow without a real backend
        window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(message)}`, '_blank');
    }
}

export const paymentService = new StripePaymentService();
