-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- USERS (extends Supabase auth.users)
-- =====================
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  tagline TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================
-- CLIENTS
-- =====================
CREATE TABLE public.clients (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  whatsapp TEXT,
  platform TEXT DEFAULT 'direct' CHECK (platform IN ('upwork', 'fiverr', 'local', 'direct', 'other')),
  country TEXT,
  timezone TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own clients" ON public.clients USING (auth.uid() = user_id);

-- =====================
-- PROJECTS
-- =====================
CREATE TABLE public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'inquiry' CHECK (status IN ('inquiry','proposal_sent','negotiating','active','in_review','completed','archived')),
  budget NUMERIC(12,2),
  currency TEXT DEFAULT 'PKR' CHECK (currency IN ('PKR','USD','GBP')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','partial','paid')),
  start_date DATE,
  deadline DATE,
  portal_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  portal_enabled BOOLEAN DEFAULT TRUE,
  scope_log TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own projects" ON public.projects USING (auth.uid() = user_id);
-- Public portal access
CREATE POLICY "Portal public read" ON public.projects FOR SELECT USING (portal_enabled = TRUE);

-- =====================
-- MILESTONES
-- =====================
CREATE TABLE public.milestones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','in_progress','done','approved')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage milestones via project" ON public.milestones
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));
CREATE POLICY "Portal can read milestones" ON public.milestones FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.portal_enabled = TRUE));

-- =====================
-- PROJECT UPDATES
-- =====================
CREATE TABLE public.project_updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage updates" ON public.project_updates
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));
CREATE POLICY "Portal can read updates" ON public.project_updates FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.portal_enabled = TRUE));

-- =====================
-- CLIENT MESSAGES (from portal)
-- =====================
CREATE TABLE public.client_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.client_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read client messages" ON public.client_messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));
CREATE POLICY "Portal can insert messages" ON public.client_messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.portal_enabled = TRUE));
CREATE POLICY "Users update client messages" ON public.client_messages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.user_id = auth.uid()));

-- =====================
-- INVOICES
-- =====================
CREATE TABLE public.invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','partial','paid','overdue')),
  currency TEXT DEFAULT 'PKR' CHECK (currency IN ('PKR','USD','GBP')),
  total NUMERIC(12,2) DEFAULT 0,
  amount_paid NUMERIC(12,2) DEFAULT 0,
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  notes TEXT,
  payment_instructions TEXT,
  portal_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage invoices" ON public.invoices USING (auth.uid() = user_id);
CREATE POLICY "Invoice public read" ON public.invoices FOR SELECT USING (status != 'draft');

-- =====================
-- INVOICE ITEMS
-- =====================
CREATE TABLE public.invoice_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) DEFAULT 1,
  rate NUMERIC(12,2) NOT NULL,
  total NUMERIC(12,2) GENERATED ALWAYS AS (quantity * rate) STORED
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage invoice items" ON public.invoice_items
  USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND i.user_id = auth.uid()));
CREATE POLICY "Public read invoice items" ON public.invoice_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.invoices i WHERE i.id = invoice_id AND i.status != 'draft'));

-- =====================
-- PROPOSALS
-- =====================
CREATE TABLE public.proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  overview TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','declined','changes_requested')),
  scope_items JSONB DEFAULT '[]',
  timeline_items JSONB DEFAULT '[]',
  pricing_items JSONB DEFAULT '[]',
  total_amount NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'PKR' CHECK (currency IN ('PKR','USD','GBP')),
  terms TEXT,
  valid_until DATE,
  portal_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage proposals" ON public.proposals USING (auth.uid() = user_id);
CREATE POLICY "Proposal public read" ON public.proposals FOR SELECT USING (status != 'draft');

-- =====================
-- AI MESSAGES
-- =====================
CREATE TABLE public.ai_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  scenario TEXT NOT NULL,
  tone TEXT NOT NULL,
  language TEXT NOT NULL,
  input TEXT NOT NULL,
  output TEXT NOT NULL,
  subject TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage AI messages" ON public.ai_messages USING (auth.uid() = user_id);

-- =====================
-- FUNCTIONS
-- =====================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Get next invoice number for user
CREATE OR REPLACE FUNCTION public.get_next_invoice_number(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO count FROM public.invoices WHERE user_id = p_user_id;
  RETURN 'INV-' || LPAD(count::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
