import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import Stripe from 'https://esm.sh/stripe@14.17.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  try {
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      return new Response('Missing signature or webhook secret', { status: 400 });
    }

    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const customerId = session.customer;

        if (!userId) {
          throw new Error('Missing user ID');
        }

        // Get subscription or line items
        let credits = 0;
        let subscriptionType = 'none';
        let expiresAt = null;

        if (session.mode === 'subscription') {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          const plan = subscription.items.data[0].price.lookup_key;
          
          if (plan === 'pro_monthly') {
            credits = 20;
            subscriptionType = 'pro';
            expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
          }
        } else {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
          const item = lineItems.data[0];
          
          if (item.price?.lookup_key === 'basic_10scripts') {
            credits = 10;
          }
        }

        // Update user credits and subscription
        const { error: updateError } = await supabase
          .from('user_credits')
          .upsert({
            user_id: userId,
            credits: credits,
            stripe_customer_id: customerId,
            subscription_type: subscriptionType,
            subscription_expires_at: expiresAt
          });

        if (updateError) {
          throw updateError;
        }

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Get user ID from customer ID
        const { data: userData, error: userError } = await supabase
          .from('user_credits')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (userError || !userData) {
          throw new Error('User not found');
        }

        const plan = subscription.items.data[0].price.lookup_key;
        const credits = plan === 'pro_monthly' ? 20 : 0;
        const subscriptionType = plan === 'pro_monthly' ? 'pro' : 'none';
        const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();

        // Update subscription details
        const { error: updateError } = await supabase
          .from('user_credits')
          .update({
            credits,
            subscription_type: subscriptionType,
            subscription_expires_at: expiresAt
          })
          .eq('user_id', userData.user_id);

        if (updateError) {
          throw updateError;
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // Get user ID from customer ID
        const { data: userData, error: userError } = await supabase
          .from('user_credits')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single();

        if (userError || !userData) {
          throw new Error('User not found');
        }

        // Reset subscription details
        const { error: updateError } = await supabase
          .from('user_credits')
          .update({
            subscription_type: 'none',
            subscription_expires_at: null
          })
          .eq('user_id', userData.user_id);

        if (updateError) {
          throw updateError;
        }

        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(
      JSON.stringify({ error: { message: err.message } }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});