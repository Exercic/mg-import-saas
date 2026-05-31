# MG IMPORT Pro — SaaS v23.0

Système complet de gestion d'importation **avec authentification multi-utilisateurs**.

---

## 🚀 Mise en route en 5 minutes

### Étape 1 — Créer votre base de données Supabase (gratuit)

1. Allez sur [supabase.com](https://supabase.com) → **New Project**
2. Choisissez un nom (ex: `mg-import-pro`) et un mot de passe fort
3. Région recommandée : **West EU** (le plus proche du Cameroun)
4. Attendez ~2 minutes que le projet se crée

### Étape 2 — Configurer la base de données

1. Dans Supabase, allez dans **SQL Editor → New Query**
2. Copiez-collez le contenu de `supabase-setup.sql`
3. Cliquez **Run** (doit afficher les tables créées sans erreur)

### Étape 3 — Récupérer vos clés API

1. Allez dans **Project Settings → API**
2. Copiez :
   - **Project URL** (ex: `https://xxxx.supabase.co`)
   - **anon public** key (longue chaîne commençant par `eyJ...`)

### Étape 4 — Configurer l'app

Ouvrez `js/supabase-config.js` et remplacez :
```
const SUPABASE_URL  = 'https://XXXX.supabase.co';
const SUPABASE_ANON = 'eyJhbGci...votre_cle_anon...';
```

### Étape 5 — Déployer sur Vercel (gratuit)

1. Créez un compte sur vercel.com
2. Glissez-déposez le dossier sur Vercel OU connectez votre GitHub
3. Votre app est en ligne avec HTTPS → la PWA fonctionne !

---

## Structure du projet

```
mg-import-saas/
├── index.html              ← App principale (protégée par auth)
├── auth.html               ← Page de connexion / inscription
├── supabase-setup.sql      ← Script SQL à exécuter une seule fois
├── manifest.json           ← PWA
├── sw.js                   ← Service Worker
│
├── css/
│   └── styles.css
│
└── js/
    ├── supabase-config.js  ← À REMPLIR avec vos clés
    ├── auth.js             ← Logique auth + rôles
    ├── app.js              ← App existante (inchangée)
    └── pwa.js
```

---

## Rôles utilisateurs

| Rôle       | Accès |
|------------|-------|
| Admin       | Tout : commandes, factures, paramètres, gestion utilisateurs |
| Gestionnaire| Commandes, factures, fournisseurs, exports |
| Vendeur     | Dashboard + créer/voir ses commandes uniquement |

---

## Modèle SaaS — Multi-tenant

Chaque entreprise cliente possède un tenant_id unique.
Les données sont totalement isolées grâce au Row Level Security (RLS) de PostgreSQL.

---

## Tarification suggérée

| Plan     | Prix            | Utilisateurs | Commandes/mois |
|----------|-----------------|-------------|----------------|
| Starter  | 5 000 XAF/mois  | 1           | Illimité       |
| Pro      | 15 000 XAF/mois | 5           | Illimité       |
| Business | 35 000 XAF/mois | Illimité    | Illimité       |

---

## Limites du plan gratuit Supabase

- 500 MB base de données
- 1 GB stockage fichiers
- 50 000 utilisateurs actifs/mois
- 2 projets simultanés

Amplement suffisant pour démarrer. Upgrade à ~$25/mois si vous dépassez.
