// MG IMPORT Pro — PWA Manager
// Gestion du service worker, installation et mises à jour

let deferredInstallPrompt = null;
let swRegistration = null;

// ─── Enregistrement du Service Worker ───────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      swRegistration = await navigator.serviceWorker.register('./sw.js');
      console.log('[PWA] Service Worker enregistré:', swRegistration.scope);

      // Vérifier mises à jour toutes les 30 minutes
      setInterval(() => {
        swRegistration.update();
      }, 30 * 60 * 1000);

      // Détecter une nouvelle version disponible
      swRegistration.addEventListener('updatefound', () => {
        const newWorker = swRegistration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateBanner();
          }
        });
      });

      // Mettre à jour le statut
      updatePWAStatus('✅ App prête hors ligne');

    } catch (err) {
      console.warn('[PWA] Service Worker échoué:', err);
      updatePWAStatus('');
    }
  });
}

// ─── Bannière de mise à jour ──────────────────────────────────────────────────
function showUpdateBanner() {
  const banner = document.getElementById('pwa-update-banner');
  if (banner) banner.style.display = 'block';
}

function applyPWAUpdate() {
  if (swRegistration && swRegistration.waiting) {
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
  window.location.reload();
}

// ─── Prompt d'installation ─────────────────────────────────────────────────
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  showInstallButton();
  console.log('[PWA] Installation disponible');
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  hideInstallButton();
  updatePWAStatus('✅ Application installée');
  showToast('Application installée avec succès 🎉');
});

function showInstallButton() {
  const btn = document.getElementById('pwa-install-btn');
  if (btn) btn.style.display = 'block';
}

function hideInstallButton() {
  const btn = document.getElementById('pwa-install-btn');
  if (btn) btn.style.display = 'none';
}

async function installPWA() {
  if (!deferredInstallPrompt) {
    showToast('Installation non disponible sur ce navigateur');
    return;
  }
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  if (outcome === 'accepted') {
    console.log('[PWA] Utilisateur a accepté l\'installation');
  } else {
    console.log('[PWA] Utilisateur a refusé l\'installation');
  }
  deferredInstallPrompt = null;
}

function updatePWAStatus(msg) {
  const el = document.getElementById('pwa-status');
  if (el) el.textContent = msg;
}

// ─── Détection connexion réseau ────────────────────────────────────────────
window.addEventListener('online',  () => showToast('🌐 Connexion rétablie'));
window.addEventListener('offline', () => showToast('⚠️ Mode hors ligne — données locales'));

// ─── Bannière mise à jour dans HTML ───────────────────────────────────────────
// Injecter la bannière dans le DOM si elle n'existe pas
(function injectUpdateBanner() {
  if (!document.getElementById('pwa-update-banner')) {
    const banner = document.createElement('div');
    banner.id = 'pwa-update-banner';
    banner.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;z-index:9999;background:#dc2626;color:white;padding:10px 20px;text-align:center;font-size:13px;font-weight:600;font-family:var(--font-body);box-shadow:0 2px 8px rgba(0,0,0,0.2);';
    banner.innerHTML = `
      🔄 Une nouvelle version est disponible —
      <button onclick="applyPWAUpdate()" style="background:white;color:#dc2626;border:none;border-radius:4px;padding:3px 10px;font-weight:700;cursor:pointer;margin-left:8px;">Mettre à jour</button>
      <button onclick="this.parentElement.style.display='none'" style="background:transparent;border:1px solid rgba(255,255,255,0.5);color:white;border-radius:4px;padding:3px 10px;cursor:pointer;margin-left:6px;">Plus tard</button>
    `;
    document.body.insertAdjacentElement('afterbegin', banner);
  }
})();
