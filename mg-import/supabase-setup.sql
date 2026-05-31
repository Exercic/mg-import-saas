-- ============================================================
-- MG IMPORT PRO — Configuration Supabase
-- Copiez-collez ce script dans Supabase > SQL Editor > New Query
-- ============================================================

-- 1. TABLE PROFILES (infos utilisateurs + rôles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT,
  nom         TEXT,
  role        TEXT DEFAULT 'gestionnaire' CHECK (role IN ('admin','gestionnaire','vendeur')),
  tenant_id   UUID,                     -- identifiant de l'entreprise cliente
  actif       BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nom, role, tenant_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nom', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'gestionnaire'),
    NEW.id  -- le premier utilisateur = son propre tenant
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. ROW LEVEL SECURITY — chaque tenant ne voit que ses données
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Un utilisateur peut lire son propre profil
CREATE POLICY "Voir son profil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Un admin peut voir tous les profils de son tenant
CREATE POLICY "Admin voit son tenant"
  ON public.profiles FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Un admin peut modifier les profils de son tenant
CREATE POLICY "Admin modifie son tenant"
  ON public.profiles FOR UPDATE
  USING (
    tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- 4. TABLE COMMANDES (optionnel — pour future migration depuis localStorage)
-- CREATE TABLE IF NOT EXISTS public.commandes (
--   id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   tenant_id   UUID NOT NULL,
--   data        JSONB NOT NULL,           -- stocke tout l'objet commande
--   created_at  TIMESTAMPTZ DEFAULT NOW(),
--   updated_at  TIMESTAMPTZ DEFAULT NOW()
-- );
-- ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Tenant isolé" ON public.commandes
--   FOR ALL USING (tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid()));

-- ============================================================
-- VÉRIFICATION — doit retourner la liste des tables créées
-- ============================================================
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
