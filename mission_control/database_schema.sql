-- 1. Accounts Table (User profiles & sync from auth.users)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    plan TEXT DEFAULT 'Free',
    profile JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on accounts
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- 2. Activity Table (Chat history & agent logs)
CREATE TABLE IF NOT EXISTS public.activity (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    agent TEXT NOT NULL,
    action TEXT NOT NULL, -- 'chat_user', 'chat_agent', 'trigger', 'update'
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on activity
ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;

-- 3. Drafts Table (Agent generated posts)
CREATE TABLE IF NOT EXISTS public.drafts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    agent TEXT NOT NULL,
    content TEXT NOT NULL,
    platform TEXT NOT NULL, -- 'linkedin', 'twitter', 'substack'
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'published'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on drafts
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow users to see their own data)
CREATE POLICY "Users can view their own account" ON public.accounts FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view their own activity" ON public.activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own activity" ON public.activity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own drafts" ON public.drafts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own drafts" ON public.drafts FOR UPDATE USING (auth.uid() = user_id);

-- 4. Memory Table (Permanent Graph Memory)
CREATE TABLE IF NOT EXISTS public.memory (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    agent TEXT NOT NULL, -- 'jarvis', 'fury', 'oracle', etc.
    type TEXT NOT NULL,  -- 'UserProfile', 'PainPoint', 'Idea', 'VoiceProfile'
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on memory
ALTER TABLE public.memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own memory" ON public.memory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own memory" ON public.memory FOR ALL USING (auth.uid() = user_id);

-- Trigger to sync auth.users to public.accounts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.accounts (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
