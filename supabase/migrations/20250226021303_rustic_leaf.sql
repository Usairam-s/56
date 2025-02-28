/*
  # User Credits and Subscriptions

  1. New Tables
    - `user_credits`
      - `user_id` (uuid, primary key) - References auth.users
      - `credits` (integer) - Number of available script credits
      - `stripe_customer_id` (text) - Stripe customer ID
      - `subscription_type` (text) - Type of subscription (none, basic, pro)
      - `subscription_expires_at` (timestamptz) - When the subscription expires
      - `created_at` (timestamptz) - When the record was created
      - `updated_at` (timestamptz) - When the record was last updated

  2. Security
    - Enable RLS on user_credits table
    - Add policies for:
      - Users can read their own credits
      - Users can update their own credits
      - Service role can manage all records

  3. Functions
    - Add trigger for updating timestamps
*/

-- Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  credits integer DEFAULT 0 NOT NULL CHECK (credits >= 0),
  stripe_customer_id text UNIQUE,
  subscription_type text DEFAULT 'none' CHECK (subscription_type IN ('none', 'basic', 'pro')),
  subscription_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Create update_updated_at function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamps
DROP TRIGGER IF EXISTS update_user_credits_updated_at ON user_credits;
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create policies
CREATE POLICY "Users can read own credits"
  ON user_credits
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON user_credits
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage all records"
  ON user_credits
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_credits_stripe_customer_id_idx ON user_credits(stripe_customer_id);
CREATE INDEX IF NOT EXISTS user_credits_subscription_type_idx ON user_credits(subscription_type);
CREATE INDEX IF NOT EXISTS user_credits_subscription_expires_at_idx ON user_credits(subscription_expires_at);

-- Create function to check subscription status
CREATE OR REPLACE FUNCTION check_subscription_status()
RETURNS void AS $$
BEGIN
  -- Update expired subscriptions
  UPDATE user_credits
  SET subscription_type = 'none',
      subscription_expires_at = NULL
  WHERE subscription_expires_at < now()
    AND subscription_type != 'none';
END;
$$ LANGUAGE plpgsql;