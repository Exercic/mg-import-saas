// ============================================================
// AUTH.JS — Authentification MG IMPORT PRO via Supabase
// ============================================================

let supabase = null;
let currentUser = null;
let currentProfile = null;

// Initialise le client Supabase
function initSupabase() {
  if (typeof SUPABASE_URL === 'undefined' || SUPABASE_URL === 'VOTRE_URL_ICI') {
    console.warn('[Auth] Supabase non configuré — mode démo localStorage');
    return null;
  }
  const { createClient } = window.supabase;
  return createClient(SUPABASE_URL, SUPABASE_ANON);
}

// ============================================================
// PROTECTION DE L'APP — appelé au chargement de index.html
// ============================================================
async function checkAuth() {
  supabase = initSupabase();

  // Mode démo : pas de Supabase configuré → on laisse passer
  if (!supabase) {
    injectUserMenuDemo();
    return;
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Pas de session → redirection vers la page de connexion
    window.location.href = 'auth.html';
    return;
  }

  currentUser = session.user;
  await loadProfile();
  injectUserMenu();
  applyRoleRestrictions();
}

// ============================================================
// PROFIL UTILISATEUR (table profiles dans Supabase)
// ============================================================
async function loadProfile() {
  if (!supabase || !currentUser) return;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single();

  if (!error && data) {
    currentProfile = data;
  } else {
    // Fallback : profil minimal depuis les métadonnées
    currentProfile = {
      id: currentUser.id,
      email: currentUser.email,
      nom: currentUser.user_metadata?.nom || currentUser.email,
      role: currentUser.user_metadata?.role || 'gestionnaire',
      tenant_id: currentUser.user_metadata?.tenant_id || currentUser.id
    };
  }
}

// ============================================================
// DÉCONNEXION
// ============================================================
async function logout() {
  if (supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem('mg_demo_user');
  window.location.href = 'auth.html';
}

// ============================================================
// RESTRICTIONS PAR RÔLE — masque les pages non autorisées
// ============================================================
function applyRoleRestrictions() {
  if (!currentProfile) return;
  const role = currentProfile.role || 'gestionnaire';
  const allowed = ROLE_PAGES[role] || ROLE_PAGES['gestionnaire'];

  // Masquer les nav-items non autorisés
  document.querySelectorAll('.nav-item').forEach(item => {
    const onclick = item.getAttribute('onclick') || '';
    const match = onclick.match(/showPage\('([^']+)'\)/);
    if (match) {
      const page = match[1];
      if (!allowed.includes(page)) {
        item.style.display = 'none';
      }
    }
  });

  // Bloquer l'accès direct aux pages
  const origShowPage = window.showPage;
  window.showPage = function(name) {
    if (!allowed.includes(name)) {
      showToast('Accès non autorisé pour votre rôle', 'error');
      return;
    }
    origShowPage(name);
  };
}

// ============================================================
// MENU UTILISATEUR — injecté dans la sidebar
// ============================================================
function injectUserMenu() {
  const sidebarBottom = document.querySelector('.sidebar-bottom');
  if (!sidebarBottom) return;

  const nom = currentProfile?.nom || currentUser?.email || 'Utilisateur';
  const role = currentProfile?.role || 'gestionnaire';
  const roleLabel = { admin: '👑 Admin', gestionnaire: '🗂️ Gestionnaire', vendeur: '💼 Vendeur' }[role] || role;
  const initiale = nom.charAt(0).toUpperCase();

  const menuHTML = `
    <div id="user-menu" style="margin-bottom:10px;padding:10px 12px;background:rgba(255,255,255,0.05);border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <div style="width:34px;height:34px;background:var(--red);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:white;flex-shrink:0;">${initiale}</div>
        <div style="min-width:0;">
          <div style="font-size:12px;font-weight:600;color:var(--text1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${nom}</div>
          <div style="font-size:10px;color:var(--text3);margin-top:1px;">${roleLabel}</div>
        </div>
      </div>
      <button onclick="logout()" style="width:100%;padding:6px 10px;background:rgba(220,38,38,0.12);border:1px solid rgba(220,38,38,0.2);border-radius:6px;color:#ef4444;font-size:11px;cursor:pointer;font-family:inherit;transition:all 0.2s;" onmouseover="this.style.background='rgba(220,38,38,0.2)'" onmouseout="this.style.background='rgba(220,38,38,0.12)'">
        🚪 Se déconnecter
      </button>
    </div>
  `;
  sidebarBottom.insertAdjacentHTML('afterbegin', menuHTML);
}

function injectUserMenuDemo() {
  const sidebarBottom = document.querySelector('.sidebar-bottom');
  if (!sidebarBottom) return;
  const menuHTML = `
    <div style="margin-bottom:10px;padding:8px 12px;background:rgba(234,179,8,0.08);border-radius:8px;border:1px solid rgba(234,179,8,0.2);">
      <div style="font-size:10px;color:#ca8a04;margin-bottom:6px;">⚠️ Mode démo — Supabase non configuré</div>
      <button onclick="window.location.href='auth.html'" style="width:100%;padding:5px 8px;background:rgba(234,179,8,0.1);border:1px solid rgba(234,179,8,0.25);border-radius:5px;color:#ca8a04;font-size:10px;cursor:pointer;font-family:inherit;">
        ⚙️ Configurer l'auth
      </button>
    </div>
  `;
  sidebarBottom.insertAdjacentHTML('afterbegin', menuHTML);
}

// ============================================================
// ÉCOUTEUR DE CHANGEMENT DE SESSION (déconnexion sur autre onglet)
// ============================================================
function listenAuthChanges() {
  if (!supabase) return;
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      window.location.href = 'auth.html';
    }
  });
}

// Auto-init quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  listenAuthChanges();
});
