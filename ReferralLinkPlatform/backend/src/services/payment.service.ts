import Stripe from 'stripe';
import { User } from '../models';
import { UserRole } from '../models/User.sequelize';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  limits: {
    linksPerMonth: number;
    messagesPerMonth: number;
    analyticsRetention: number; // days
    aiMessagesPerMonth: number;
  };
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export class PaymentService {
  private stripe: Stripe;
  private plans: Map<string, SubscriptionPlan>;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

    // Define subscription plans
    this.plans = new Map([
      ['free', {
        id: 'free',
        name: 'Free',
        price: 0,
        features: [
          'Up to 10 referral links per month',
          '100 messages per month',
          'Basic analytics',
          '7 days data retention'
        ],
        limits: {
          linksPerMonth: 10,
          messagesPerMonth: 100,
          analyticsRetention: 7,
          aiMessagesPerMonth: 10
        }
      }],
      ['premium', {
        id: 'price_premium_monthly',
        name: 'Premium',
        price: 9.99,
        features: [
          'Unlimited referral links',
          '1,000 messages per month',
          'Advanced analytics',
          '90 days data retention',
          'AI personalization',
          'Priority support'
        ],
        limits: {
          linksPerMonth: -1, // unlimited
          messagesPerMonth: 1000,
          analyticsRetention: 90,
          aiMessagesPerMonth: 100
        }
      }],
      ['enterprise', {
        id: 'price_enterprise_monthly',
        name: 'Enterprise',
        price: 49.99,
        features: [
          'Unlimited everything',
          'Custom integrations',
          'Dedicated support',
          'SLA guarantee',
          'White-label options',
          'API access'
        ],
        limits: {
          linksPerMonth: -1,
          messagesPerMonth: -1,
          analyticsRetention: 365,
          aiMessagesPerMonth: -1
        }
      }]
    ]);
  }

  async createCustomer(userId: string, email: string, name: string): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
        metadata: { userId }
      });

      // Save Stripe customer ID to user
      const user = await User.findByPk(userId);
      if (user) {
        user.profile = {
          ...user.profile,
          stripeCustomerId: customer.id
        };
        await user.save();
      }

      return customer.id;
    } catch (error) {
      console.error('Create customer error:', error);
      throw new Error('Failed to create customer');
    }
  }

  async createSubscription(
    userId: string,
    planId: string,
    paymentMethodId?: string
  ): Promise<Stripe.Subscription> {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      let customerId = user.profile?.stripeCustomerId;
      
      // Create customer if doesn't exist
      if (!customerId) {
        customerId = await this.createCustomer(
          userId,
          user.email,
          user.fullName
        );
      }

      // Attach payment method if provided
      if (paymentMethodId) {
        await this.stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId
        });
        
        // Set as default payment method
        await this.stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId
          }
        });
      }

      // Create subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: planId }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
        metadata: { userId }
      });

      // Update user role based on plan
      if (planId.includes('premium')) {
        user.role = UserRole.PREMIUM;
      } else if (planId.includes('enterprise')) {
        // Would need to add ENTERPRISE role
        user.role = UserRole.PREMIUM;
      }
      
      user.profile = {
        ...user.profile,
        subscriptionId: subscription.id,
        subscriptionStatus: subscription.status,
        planId
      };
      await user.save();

      return subscription;
    } catch (error) {
      console.error('Create subscription error:', error);
      throw new Error('Failed to create subscription');
    }
  }

  async cancelSubscription(userId: string): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      const subscriptionId = user.profile?.subscriptionId;
      if (!subscriptionId) throw new Error('No active subscription');

      // Cancel at period end
      await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });

      user.profile = {
        ...user.profile,
        subscriptionStatus: 'canceling'
      };
      await user.save();
    } catch (error) {
      console.error('Cancel subscription error:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  async updateSubscription(
    userId: string,
    newPlanId: string
  ): Promise<Stripe.Subscription> {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      const subscriptionId = user.profile?.subscriptionId;
      if (!subscriptionId) throw new Error('No active subscription');

      // Get current subscription
      const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      // Update subscription
      const updatedSubscription = await this.stripe.subscriptions.update(
        subscriptionId,
        {
          items: [{
            id: subscription.items.data[0].id,
            price: newPlanId
          }],
          proration_behavior: 'create_prorations'
        }
      );

      // Update user profile
      user.profile = {
        ...user.profile,
        planId: newPlanId
      };
      await user.save();

      return updatedSubscription;
    } catch (error) {
      console.error('Update subscription error:', error);
      throw new Error('Failed to update subscription');
    }
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      const customerId = user.profile?.stripeCustomerId;
      if (!customerId) return [];

      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card'
      });

      return paymentMethods.data.map(pm => ({
        id: pm.id,
        type: pm.type,
        last4: pm.card?.last4,
        brand: pm.card?.brand,
        expiryMonth: pm.card?.exp_month,
        expiryYear: pm.card?.exp_year
      }));
    } catch (error) {
      console.error('Get payment methods error:', error);
      return [];
    }
  }

  async addPaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      const customerId = user.profile?.stripeCustomerId;
      if (!customerId) throw new Error('Customer not found');

      await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });
    } catch (error) {
      console.error('Add payment method error:', error);
      throw new Error('Failed to add payment method');
    }
  }

  async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await this.stripe.paymentMethods.detach(paymentMethodId);
    } catch (error) {
      console.error('Remove payment method error:', error);
      throw new Error('Failed to remove payment method');
    }
  }

  async getInvoices(userId: string): Promise<Stripe.Invoice[]> {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      const customerId = user.profile?.stripeCustomerId;
      if (!customerId) return [];

      const invoices = await this.stripe.invoices.list({
        customer: customerId,
        limit: 10
      });

      return invoices.data;
    } catch (error) {
      console.error('Get invoices error:', error);
      return [];
    }
  }

  async createCheckoutSession(
    userId: string,
    planId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<string> {
    try {
      const user = await User.findByPk(userId);
      if (!user) throw new Error('User not found');

      let customerId = user.profile?.stripeCustomerId;
      if (!customerId) {
        customerId = await this.createCustomer(
          userId,
          user.email,
          user.fullName
        );
      }

      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
          price: planId,
          quantity: 1
        }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { userId }
      });

      return session.url || '';
    } catch (error) {
      console.error('Create checkout session error:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  async handleWebhook(signature: string, payload: string): Promise<void> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdate(event.data.object as Stripe.Subscription);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
          break;
      }
    } catch (error) {
      console.error('Webhook handling error:', error);
      throw error;
    }
  }

  private async handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.userId;
    if (!userId) return;

    const user = await User.findByPk(userId);
    if (!user) return;

    user.profile = {
      ...user.profile,
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000)
    };

    // Update role based on subscription
    if (subscription.status === 'active') {
      const priceId = subscription.items.data[0]?.price.id;
      if (priceId?.includes('premium')) {
        user.role = UserRole.PREMIUM;
      }
    }

    await user.save();
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.userId;
    if (!userId) return;

    const user = await User.findByPk(userId);
    if (!user) return;

    user.role = UserRole.USER;
    user.profile = {
      ...user.profile,
      subscriptionId: null,
      subscriptionStatus: 'canceled',
      planId: 'free'
    };

    await user.save();
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice) {
    console.log('Payment succeeded for invoice:', invoice.id);
    // Could send confirmation email here
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    console.log('Payment failed for invoice:', invoice.id);
    // Could send notification email here
  }

  getPlans(): SubscriptionPlan[] {
    return Array.from(this.plans.values());
  }

  getPlan(planId: string): SubscriptionPlan | undefined {
    return this.plans.get(planId);
  }

  async checkUsageLimits(userId: string, feature: string): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user) return false;

    const planId = user.profile?.planId || 'free';
    const plan = this.plans.get(planId);
    if (!plan) return false;

    // Check specific feature limits
    switch (feature) {
      case 'referralLinks':
        if (plan.limits.linksPerMonth === -1) return true;
        // Would need to count links created this month
        return true;
      case 'messages':
        if (plan.limits.messagesPerMonth === -1) return true;
        // Would need to count messages sent this month
        return true;
      case 'aiMessages':
        if (plan.limits.aiMessagesPerMonth === -1) return true;
        // Would need to count AI messages this month
        return true;
      default:
        return true;
    }
  }
}

export default new PaymentService();