// ============================================================
// CONFIGURATION SUPABASE — MG IMPORT PRO
// ============================================================
// 1. Créez un projet gratuit sur https://supabase.com
// 2. Allez dans Project Settings → API
// 3. Copiez "Project URL" et "anon public" key ci-dessous
// ============================================================

const SUPABASE_URL = 'https://afuopqnrbaszrklkbavu.supabase.co'; // ex: https://xxxx.supabase.co
const SUPABASE_ANON = 'sb_publishable_LAdV2z6ryMYIXuQXvDgmXQ_z8X4wWSx'; // clé longue commençant par "eyJ..."

// ============================================================
// RÔLES DISPONIBLES
// ============================================================
const ROLES = {
    ADMIN: 'admin', // Tout voir + gérer utilisateurs + paramètres
    GESTIONNAIRE: 'gestionnaire', // Commandes + factures + fournisseurs
    VENDEUR: 'vendeur' // Créer/voir commandes uniquement
};

// Pages accessibles par rôle
const ROLE_PAGES = {
    admin: ['dashboard', 'commandes', 'nouvelle', 'devis', 'fournisseurs', 'optimisation', 'factures', 'societe', 'exports', 'parametres', 'utilisateurs'],
    gestionnaire: ['dashboard', 'commandes', 'nouvelle', 'devis', 'fournisseurs', 'optimisation', 'factures', 'exports'],
    vendeur: ['dashboard', 'commandes', 'nouvelle']
};