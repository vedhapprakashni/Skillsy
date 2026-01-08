-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User Skills Table
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name TEXT NOT NULL,
  skill_type TEXT NOT NULL CHECK (skill_type IN ('teach', 'learn')),
  proficiency_level TEXT DEFAULT 'intermediate' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Certifications Table
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  issuer TEXT,
  issue_date DATE,
  credential_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Achievements Table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date_earned DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Credits Table
CREATE TABLE IF NOT EXISTS public.credits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  balance DECIMAL(10, 2) DEFAULT 10.00 NOT NULL CHECK (balance >= 0),
  total_earned DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  total_spent DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Credit Transactions Table
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('session_payment', 'tip', 'initial_credit', 'refund')),
  session_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Connections Table
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  responded_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(learner_id, mentor_id)
);

-- Sessions Table
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  learner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  connection_id UUID REFERENCES public.connections(id) ON DELETE SET NULL,
  skill_id UUID REFERENCES public.user_skills(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER DEFAULT 60,
  credits_cost DECIMAL(10, 2) NOT NULL CHECK (credits_cost > 0),
  tip_amount DECIMAL(10, 2) DEFAULT 0.00 CHECK (tip_amount >= 0),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Messages Table (for real-time chat)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Mentor Settings Table
CREATE TABLE IF NOT EXISTS public.mentor_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  min_session_credits DECIMAL(10, 2) DEFAULT 5.00 NOT NULL CHECK (min_session_credits > 0),
  accepts_tips BOOLEAN DEFAULT TRUE,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_type ON public.user_skills(skill_type);
CREATE INDEX IF NOT EXISTS idx_connections_learner_id ON public.connections(learner_id);
CREATE INDEX IF NOT EXISTS idx_connections_mentor_id ON public.connections(mentor_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections(status);
CREATE INDEX IF NOT EXISTS idx_sessions_learner_id ON public.sessions(learner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_mentor_id ON public.sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.sessions(status);
CREATE INDEX IF NOT EXISTS idx_messages_connection_id ON public.messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_from_user ON public.credit_transactions(from_user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_to_user ON public.credit_transactions(to_user_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User Skills policies
CREATE POLICY "Users can view all skills" ON public.user_skills FOR SELECT USING (true);
CREATE POLICY "Users can manage own skills" ON public.user_skills FOR ALL USING (auth.uid() = user_id);

-- Certifications policies
CREATE POLICY "Users can view all certifications" ON public.certifications FOR SELECT USING (true);
CREATE POLICY "Users can manage own certifications" ON public.certifications FOR ALL USING (auth.uid() = user_id);

-- Achievements policies
CREATE POLICY "Users can view all achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Users can manage own achievements" ON public.achievements FOR ALL USING (auth.uid() = user_id);

-- Credits policies
CREATE POLICY "Users can view own credits" ON public.credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON public.credit_transactions FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Connections policies
CREATE POLICY "Users can view own connections" ON public.connections FOR SELECT USING (auth.uid() = learner_id OR auth.uid() = mentor_id);
CREATE POLICY "Learners can create connections" ON public.connections FOR INSERT WITH CHECK (auth.uid() = learner_id);
CREATE POLICY "Mentors can update connections" ON public.connections FOR UPDATE USING (auth.uid() = mentor_id);

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON public.sessions FOR SELECT USING (auth.uid() = learner_id OR auth.uid() = mentor_id);
CREATE POLICY "Learners can create sessions" ON public.sessions FOR INSERT WITH CHECK (auth.uid() = learner_id);
CREATE POLICY "Users can update own sessions" ON public.sessions FOR UPDATE USING (auth.uid() = learner_id OR auth.uid() = mentor_id);

-- Messages policies
CREATE POLICY "Users can view messages in own connections" ON public.messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.connections
    WHERE connections.id = messages.connection_id
    AND (connections.learner_id = auth.uid() OR connections.mentor_id = auth.uid())
  )
);
CREATE POLICY "Users can send messages in own connections" ON public.messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.connections
    WHERE connections.id = messages.connection_id
    AND (connections.learner_id = auth.uid() OR connections.mentor_id = auth.uid())
    AND connections.status = 'accepted'
  )
);

-- Mentor Settings policies
CREATE POLICY "Users can view all mentor settings" ON public.mentor_settings FOR SELECT USING (true);
CREATE POLICY "Users can manage own mentor settings" ON public.mentor_settings FOR ALL USING (auth.uid() = user_id);

-- Functions and Triggers

-- Function to create profile and initial credits on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.credits (user_id, balance, total_earned)
  VALUES (NEW.id, 10.00, 10.00);
  
  INSERT INTO public.credit_transactions (from_user_id, to_user_id, amount, transaction_type, description)
  VALUES (NULL, NEW.id, 10.00, 'initial_credit', 'Welcome bonus credits');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_credits_updated_at BEFORE UPDATE ON public.credits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentor_settings_updated_at BEFORE UPDATE ON public.mentor_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
