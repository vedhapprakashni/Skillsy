-- Database Functions for Credits Management

-- Function to increment credits
CREATE OR REPLACE FUNCTION increment_credits(
  user_id_param UUID,
  amount_param DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.credits
  SET 
    balance = balance + amount_param,
    total_earned = total_earned + amount_param,
    updated_at = TIMEZONE('utc'::text, NOW())
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement credits
CREATE OR REPLACE FUNCTION decrement_credits(
  user_id_param UUID,
  amount_param DECIMAL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.credits
  SET 
    balance = GREATEST(0, balance - amount_param),
    total_spent = total_spent + amount_param,
    updated_at = TIMEZONE('utc'::text, NOW())
  WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
