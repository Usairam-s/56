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
    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing auth header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get request body
    const { planId, successUrl, cancelUrl } = await req.json();

    // Get or create customer
    let customerId: string;
    const { data: userData, error: userError } = await supabase
      .from('user_credits')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (userError || !userData?.stripe_customer_id) {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;

      // Save customer ID
      await supabase
        .from('user_credits')
        .upsert({
          user_id: user.id,
          stripe_customer_id: customerId,
          credits: 0,
          subscription_type: 'none',
        });
    } else {
      customerId = userData.stripe_customer_id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: user.id,
      payment_method_types: ['card'],
      mode: planId === 'pro_monthly' ? 'subscription' : 'payment',
      line_items: [{
        price: planId === 'pro_monthly' 
          ? 'price_pro_monthly' 
          : 'price_basic_10scripts',
        quantity: 1,
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return new Response(
      JSON.stringify({ id: session.id, url: session.url }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err) {
    console.error('Create checkout error:', err);
    return new Response(
      JSON.stringify({ error: { message: err.message } }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});