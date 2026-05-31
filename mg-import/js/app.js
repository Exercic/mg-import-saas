
// ============================================================
// DONNÉES (localStorage) - STRUCTURE COMPLÈTE AVEC PALIERS PAR TYPE
// ============================================================
let DB = {
  commandes: [],
  societe: { nom: "MG IMPORT", slogan: "Votre partenaire logistique", adresse: "Yaoundé, Cameroun", tel: "+237 6XX XXX XXX", email: "contact@mgimport.com", site: "", registre: "", logo: "", couleur: "#e63329", mentions: "Merci de votre confiance. Paiement à réception.", fraisAnnexes: 2500, fraisAnnexesPro: 2500, fraisAnnexesPart: 2500, tarifLivraison: 3000, clauses: "Le montant final à payer est basé sur les dimensions fournies. Le prix final exact dépend de la pesée et du cubage réels validés par le transitaire lors de l'arrivée. Les délais courent à partir du signal du transitaire.", orangeMoney: "", mtnMoney: "" },
  fournisseurs: [],
  params: {
    tauxCNY: 83, tauxUSD: 600, tauxEUR: 655,
    normalPaliers: [ { max: 0.5, tarif: 6000 }, { max: 1.0, tarif: 8000 }, { max: 1.5, tarif: 14000 }, { max: 2.0, tarif: 16000 }, { max: 2.5, tarif: 22000 } ],
    sensiblePaliers: [ { max: 0.5, tarif: 6500 }, { max: 1.0, tarif: 9000 }, { max: 1.5, tarif: 15000 }, { max: 2.0, tarif: 18000 }, { max: 2.5, tarif: 24000 } ],
    expressPaliers: [ { max: 0.5, tarif: 8000 }, { max: 1.0, tarif: 11000 }, { max: 1.5, tarif: 18000 }, { max: 2.0, tarif: 22000 }, { max: 2.5, tarif: 28000 } ],
    tarifKgNormal: 3000,
    tarifKgSensible: 4000,
    tarifKgExpress: 6000,
    cbmTarifM3: 330000, cbmMinFrais: 16500, cbmMinVolume: 0.05,
    fraisBase: 0,
    nomFraisAnnexes: 'Commission de service',
    bufferMontant: 500,
    bufferActif: true,
    clausesNonResponsabilite: "Les montants indiqués sont des estimations basées sur les poids et dimensions fournis par le fournisseur. Le montant final peut différer selon le poids/volume réels constatés par le transitaire. MG IMPORT ne saurait être tenu responsable de ces différences. Le délai de récupération court dès réception du message du transitaire.",
    delaiPaiement: 15,
    afficherBenefice: 'non',
    qrCode: 'non',
    // NOUVEAUX PARAMÈTRES PDF ET VENDEUR
    pdfStyle: 'moderne',
    afficherLogo: true,
    afficherSlogan: true,
    afficherQRCode: false,
    afficherPaiement: true,
    afficherBlocCommercialVendeur: false,
    prixConseilleVendeur: 0,
    couleurPrincipale: '#e63329',
    couleurSecondaire: '#f0f0f0',
    // Tarifs spéciaux Ordinateurs & Téléphones
    tarifOrdinateurNormal: 15000,
    tarifOrdinateurExpress: 22000,
    tarifOrdinateurSensible: 17000,
    tarifOrdinateurBateau: 0,
    tarifTelephoneNormal: 8000,
    tarifTelephoneExpress: 12000,
    tarifTelephoneSensible: 9000,
    tarifTelephoneBateau: 0
  },
  opportunites: []
};

function load() {
  try {
    // Migration depuis v14 si v15 vide
    if (!localStorage.getItem('mg-imporsystem-ultimate-v15') && localStorage.getItem('mg-imporsystem-ultimate-v14')) {
      localStorage.setItem('mg-imporsystem-ultimate-v15', localStorage.getItem('mg-imporsystem-ultimate-v14'));
    }
    const saved = localStorage.getItem('mg-imporsystem-ultimate-v15');
    if (saved) {
      const reviver = (key, value) => (value === '__Infinity__' ? Infinity : value);
      const parsed = JSON.parse(saved, reviver);
      DB.commandes = parsed.commandes || [];
      DB.societe = { ...DB.societe, ...(parsed.societe || {}) };
      DB.fournisseurs = parsed.fournisseurs || [];
      DB.opportunites = parsed.opportunites || [];
      if (parsed.params) DB.params = { ...DB.params, ...parsed.params };
      if (!DB.params.normalPaliers && parsed.params.paliersPoids) {
        DB.params.normalPaliers = parsed.params.paliersPoids;
        DB.params.sensiblePaliers = parsed.params.paliersPoids.map(p => ({ ...p, tarif: p.tarif + 500 }));
        DB.params.expressPaliers = parsed.params.paliersPoids.map(p => ({ ...p, tarif: p.tarif + 2000 }));
      }
      ['normalPaliers','sensiblePaliers','expressPaliers'].forEach(key => {
        if (DB.params[key]) {
          DB.params[key] = DB.params[key].filter(p => p.max !== Infinity && p.max !== null && !isNaN(p.max));
        }
      });
      if (!DB.params.tarifKgNormal)   DB.params.tarifKgNormal   = 3000;
      if (!DB.params.tarifKgSensible) DB.params.tarifKgSensible = 4000;
      if (!DB.params.tarifKgExpress)  DB.params.tarifKgExpress  = 6000;
      if (!DB.params.fraisBase || DB.params.fraisBase === 2500) DB.params.fraisBase = 0;
      if (DB.societe.orangeMoney === undefined) DB.societe.orangeMoney = '';
      if (DB.societe.mtnMoney === undefined) DB.societe.mtnMoney = '';
      // Migration frais annexes séparés (v9) + correction forcée v11 : fraisAnnexesPro = 2500
      if (DB.societe.fraisAnnexesPro === undefined || DB.societe.fraisAnnexesPro === 5000) DB.societe.fraisAnnexesPro = 2500;
      DB.societe.fraisAnnexes = 2500; // sync legacy
      if (DB.societe.fraisAnnexesPart === undefined) DB.societe.fraisAnnexesPart = 2500;
      if (DB.params.bufferMontant === undefined || DB.params.bufferMontant > 2000) DB.params.bufferMontant = 500;
      if (DB.params.bufferActif === undefined)   DB.params.bufferActif   = true;
      if (!DB.params.clausesNonResponsabilite)   DB.params.clausesNonResponsabilite = '';
      // Initialisation nouveaux paramètres
      if (DB.params.pdfStyle === undefined) DB.params.pdfStyle = 'moderne';
      if (DB.params.afficherLogo === undefined) DB.params.afficherLogo = true;
      if (DB.params.afficherSlogan === undefined) DB.params.afficherSlogan = true;
      if (DB.params.afficherQRCode === undefined) DB.params.afficherQRCode = false;
      if (DB.params.afficherPaiement === undefined) DB.params.afficherPaiement = true;
      if (DB.params.afficherBlocCommercialVendeur === undefined) DB.params.afficherBlocCommercialVendeur = false;
      if (DB.params.prixConseilleVendeur === undefined) DB.params.prixConseilleVendeur = 0;
      if (DB.params.couleurPrincipale === undefined) DB.params.couleurPrincipale = DB.societe.couleur || '#e63329';
      if (DB.params.couleurSecondaire === undefined) DB.params.couleurSecondaire = '#f0f0f0';
      if (DB.params.tarifOrdinateurNormal === undefined) DB.params.tarifOrdinateurNormal = 15000;
      if (DB.params.tarifOrdinateurExpress === undefined) DB.params.tarifOrdinateurExpress = 22000;
      if (DB.params.tarifOrdinateurSensible === undefined) DB.params.tarifOrdinateurSensible = 17000;
      if (DB.params.tarifOrdinateurBateau === undefined) DB.params.tarifOrdinateurBateau = 0;
      if (DB.params.tarifTelephoneNormal === undefined) DB.params.tarifTelephoneNormal = 8000;
      if (DB.params.tarifTelephoneExpress === undefined) DB.params.tarifTelephoneExpress = 12000;
      if (DB.params.tarifTelephoneSensible === undefined) DB.params.tarifTelephoneSensible = 9000;
      if (DB.params.tarifTelephoneBateau === undefined) DB.params.tarifTelephoneBateau = 0;
    }
    DB.commandes.forEach(c => {
      if (!c.typeClient) c.typeClient = 'pro';
      if (c.volumeM3 === undefined) c.volumeM3 = 0;
      if (c.poidsUnitaire === undefined) c.poidsUnitaire = c.poidsReel;
      if (c.email === undefined) c.email = '';
      if (c.fournisseur === undefined) c.fournisseur = '';
      if (c.transportMode === undefined) c.transportMode = c.transport === 'cbm' ? 'cbm' : 'poids';
      if (c.poidsSousType === 'bateau_45') c.transportMode = 'cbm';
      if (c.poidsSousType === undefined) c.poidsSousType = 'normal_14';
      if (c.poidsSousType === 'normal')   c.poidsSousType = 'normal_14';
      if (c.poidsSousType === 'sensible') c.poidsSousType = 'sensible_14';
      if (c.poidsSousType === 'express')  c.poidsSousType = 'express_7';
      if (!c.whatsapp) c.whatsapp = '';
      if (c.paiementStatut === undefined) c.paiementStatut = (c.typeClient === 'particulier') ? 'en_attente' : 'pro';
      if (!c.circuitLogistique) {
        if (c.modeRecup === 'client') { c.circuitLogistique = 'direct_client'; c.modeRecuperation = 'retrait_gratuit'; }
        else { c.circuitLogistique = 'via_moi'; c.modeRecuperation = 'retrait_gratuit'; }
      }
      if (!c.modeRecuperation) c.modeRecuperation = 'retrait_gratuit';
      if (c.commandeValidee === undefined) c.commandeValidee = (c.statut !== 'devis');
      if (c.ville === undefined) c.ville = '';
    });
  } catch(e) {}
}
function save() {
  const replacer = (key, value) => (value === Infinity ? '__Infinity__' : value);
  localStorage.setItem('mg-imporsystem-ultimate-v15', JSON.stringify(DB, replacer));
}

// ========== UTILS ==========
function fmt(n) { if (!n && n !== 0) return '—'; return Math.round(n).toLocaleString('fr-FR') + ' XAF'; }
function fmtR(n) { return (n||0).toFixed(1)+'%'; }
function rentColor(r) { if (r>=25) return 'rent-ok'; if (r>=15) return 'rent-mid'; if (r>=0) return 'rent-low'; return 'rent-neg'; }
function statusBadge(s) {
  const m = { en_attente: ['badge-orange','⏳ En attente'], devis: ['badge-orange','📄 Devis'], livre: ['badge-green','✅ Livré'], annule: ['badge-gray','❌ Annulé'] };
  const [cls,label] = m[s] || ['badge-gray', s];
  return `<span class="badge ${cls}">${label}</span>`;
}
function showToast(msg, type='ok') { const t=document.getElementById('toast'); t.innerHTML=(type==='ok'?'✅ ':'⚠️ ')+msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2500); }
function calculVolumeM3(L,l,H) { if (!L||!l||!H) return 0; return (L*l*H)/1_000_000; }
function tauxDevise(devise) { return { CNY:DB.params.tauxCNY, USD:DB.params.tauxUSD, EUR:DB.params.tauxEUR, XAF:1 }[devise] || 1; }
function poidsFacture(poidsReel) {
  if (!poidsReel || poidsReel <= 0) return 0;
  return Math.ceil(poidsReel * 2) / 2;
}

const SEUIL_PALIER_KG = 2.5;
function normaliseSousType(st) {
  if (!st || st === 'normal') return 'normal_14';
  if (st === 'sensible') return 'sensible_14';
  if (st === 'express') return 'express_7';
  return st;
}
function getTransportLabel(c) {
  if (c.poidsSousType === 'bateau_45') return '🚢 CMB — Bateau (45 jours)';
  if (c.poidsSousType === 'express_7')  return '✈️ Express — Avion (7 jours)';
  if (c.poidsSousType === 'sensible_14') return '✈️ Sensible — Avion (14 jours)';
  return '✈️ Normal — Avion (14 jours)';
}
function getTarifSpecial(produit, sousType) {
  if (!produit) return 0;
  const p = produit.toLowerCase();
  const isOrdi = /ordinateur|laptop|pc portable|macbook|notebook|chromebook/.test(p);
  const isPhone = /t\u00e9l\u00e9phone|iphone|samsung|xiaomi|smartphone|huawei|oppo|realme|tecno|infinix/.test(p);
  if (!isOrdi && !isPhone) return 0;
  const st = sousType || 'normal_14';
  if (isOrdi) {
    if (st === 'bateau_45') return DB.params.tarifOrdinateurBateau || 0;
    if (st === 'express_7') return DB.params.tarifOrdinateurExpress || 0;
    if (st === 'sensible_14') return DB.params.tarifOrdinateurSensible || 0;
    return DB.params.tarifOrdinateurNormal || 0;
  }
  if (isPhone) {
    if (st === 'bateau_45') return DB.params.tarifTelephoneBateau || 0;
    if (st === 'express_7') return DB.params.tarifTelephoneExpress || 0;
    if (st === 'sensible_14') return DB.params.tarifTelephoneSensible || 0;
    return DB.params.tarifTelephoneNormal || 0;
  }
  return 0;
}


function coutTransportPoids(poidsTotal, sousType) {
  const st = normaliseSousType(sousType);
  const poidsFact = poidsFacture(poidsTotal);
  if (poidsFact > SEUIL_PALIER_KG) {
    const tarifKg = (st === 'sensible_14') ? (DB.params.tarifKgSensible || 4000)
                  : (st === 'express_7')   ? (DB.params.tarifKgExpress  || 6000)
                  :                          (DB.params.tarifKgNormal   || 3000);
    return Math.round(poidsFact * tarifKg);
  }
  const paliers = (st === 'sensible_14') ? DB.params.sensiblePaliers
                : (st === 'express_7')   ? DB.params.expressPaliers
                :                          DB.params.normalPaliers;
  if (!paliers || paliers.length === 0) return 0;
  const sorted = [...paliers].sort((a, b) => a.max - b.max);
  for (const p of sorted) {
    if (poidsFact <= p.max) return p.tarif;
  }
  const tarifKgFallback = (st === 'sensible_14') ? (DB.params.tarifKgSensible || 4000)
                        : (st === 'express_7')   ? (DB.params.tarifKgExpress  || 6000)
                        :                          (DB.params.tarifKgNormal   || 3000);
  return Math.round(poidsFact * tarifKgFallback);
}
function coutTransport(type, poidsTotal, volumeTotal, sousType) {
  if (type === 'cbm' || sousType === 'bateau_45') {
    const vol = volumeTotal || 0;
    return Math.max(DB.params.cbmMinFrais, vol * DB.params.cbmTarifM3);
  }
  return coutTransportPoids(poidsTotal, sousType);
}

function calculerBufferIntelligent(transportMode, transport, poidsTotal, volumeTotal) {
  if (!DB.params.bufferActif) return 0;
  return DB.params.bufferMontant || 500;
}

function getPoidsTotal(c) { return (c.poidsUnitaire || 0) * c.quantite; }
function getVolumeTotal(c) {
  if (c.volumeM3) return c.volumeM3;
  if (c.longueurCm && c.largeurCm && c.hauteurCm) return calculVolumeM3(c.longueurCm, c.largeurCm, c.hauteurCm) * c.quantite;
  return 0;
}

function calcCommande(c) {
  const prixProduit = c.prixAchat * c.quantite * tauxDevise(c.devise);
  const poidsTotal = getPoidsTotal(c);
  const volumeTotal = getVolumeTotal(c);
  const sousType = normaliseSousType(c.poidsSousType || 'normal_14');
  const transportMode = (c.transportMode === 'cbm' || sousType === 'bateau_45' || c.transport === 'cbm') ? 'cbm' : 'poids';
  const tarifSpecial = getTarifSpecial(c.produit, sousType);
  const transport = tarifSpecial > 0 ? tarifSpecial : coutTransport(transportMode, poidsTotal, volumeTotal, sousType);
  const buffer = calculerBufferIntelligent(transportMode, transport, poidsTotal, volumeTotal);
  const _isPro = (c.typeClient === 'pro');
  const fraisAnnexes = _isPro
    ? (DB.societe.fraisAnnexesPro  !== undefined ? DB.societe.fraisAnnexesPro  : DB.societe.fraisAnnexes || 2500)
    : (DB.societe.fraisAnnexesPart !== undefined ? DB.societe.fraisAnnexesPart : 2500);
  const livraison = (c.circuitLogistique === 'via_moi' && c.modeRecuperation === 'livraison_payante') ? (DB.societe.tarifLivraison || 3000) : 0;
  const fraisTotaux = DB.params.fraisBase + (c.fraisManuels || 0) + fraisAnnexes + livraison;
  const coutTotal = prixProduit + transport + buffer + fraisTotaux;
  const totalFacture = (c.prixVente && c.prixVente > 0) ? c.prixVente : coutTotal;
  const benefice = (c.prixVente && c.prixVente > 0) ? c.prixVente - coutTotal : 0;
  const rentabilite = (c.prixVente && c.prixVente > 0) ? (benefice / c.prixVente) * 100 : 0;
  const poidsFact = poidsFacture(poidsTotal);
  const beneficePerso = c.beneficePerso || 0;
  return { prixProduit, transport, buffer, fraisTotaux, coutTotal, totalFacture, benefice, rentabilite, poidsTotal, volumeTotal, poidsFact, beneficePerso, livraison, transportMode };
}

// ========== PAGES ==========
function showPage(name) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  document.querySelector(`[onclick="showPage('${name}')"]`).classList.add('active');
  if (name === 'dashboard') renderDashboard();
  if (name === 'commandes') renderCommandes();
  if (name === 'devis') renderDevis();
  if (name === 'fournisseurs') renderFournisseurs();
  if (name === 'factures') { renderFactures(); setTimeout(()=>setStyleFacture(DB.params.pdfStyle||'moderne'),50); }
  if (name === 'optimisation') renderOptimisation();
  if (name === 'parametres') { renderParametres(); initParametresEvents(); }
  if (name === 'exports') renderExports();
  if (name === 'societe') chargerSociete();
}

// ========== DASHBOARD ==========
let beneficeChart, statutChart, topClientsChart;
function renderDashboard() {
  const now=new Date(); document.getElementById('dash-date').innerHTML=now.toLocaleDateString('fr-FR',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const all=DB.commandes.filter(c=>c.statut!=='devis');
  const livrees=all.filter(c=>c.statut==='livre'), attente=all.filter(c=>c.statut==='en_attente'), pertes=all.filter(c=>c.benefice<0);
  const totalBenef=all.reduce((s,c)=>s+(c.benefice||0),0);
  const totalBenefPerso=DB.opportunites.reduce((s,o)=>s+(o.beneficePerso||0),0);
  const totalBenefGlobal=totalBenef+totalBenefPerso;
  const avgRent=all.length?all.reduce((s,c)=>s+(c.rentabilite||0),0)/all.length:0;
  const nbOppActives=DB.opportunites.length;
  const tauxCommission = DB.societe.fraisAnnexesPro !== undefined ? DB.societe.fraisAnnexesPro : (DB.societe.fraisAnnexes || 2500);
  const totalCommissions = all.filter(c=>c.statut!=='annule').length * tauxCommission;
  document.getElementById('kpi-grid').innerHTML=`
    <div class="kpi-card"><div class="kpi-label">Commandes</div><div class="kpi-value">${all.length}</div><div class="kpi-sub">${livrees.length} livrées · ${attente.length} attente</div></div>
    <div class="kpi-card green"><div class="kpi-label">Bénéfice Clients</div><div class="kpi-value green">${Math.round(totalBenef).toLocaleString('fr-FR')}</div><div class="kpi-sub">XAF</div></div>
    <div class="kpi-card" style="border-top-color:var(--gold)"><div class="kpi-label">Bénéfice Perso (optim)</div><div class="kpi-value" style="color:var(--gold)">${Math.round(totalBenefPerso).toLocaleString('fr-FR')}</div><div class="kpi-sub">${nbOppActives} opportunité(s) activée(s)</div></div>
    <div class="kpi-card" style="border-top-color:#818cf8"><div class="kpi-label">Bénéfice Global</div><div class="kpi-value" style="color:#818cf8">${Math.round(totalBenefGlobal).toLocaleString('fr-FR')}</div><div class="kpi-sub">Clients + perso · Rent. moy ${avgRent.toFixed(1)}%</div></div>
    <div class="kpi-card orange"><div class="kpi-label">Alertes</div><div class="kpi-value red">${pertes.length}</div><div class="kpi-sub">Commandes en perte</div></div>
    <div class="kpi-card" style="border-top-color:#06b6d4"><div class="kpi-label">💼 Commissions gagnées</div><div class="kpi-value" style="color:#06b6d4">${Math.round(totalCommissions).toLocaleString('fr-FR')}</div><div class="kpi-sub">XAF · ${tauxCommission.toLocaleString('fr-FR')} × ${all.filter(c=>c.statut!=='annule').length} cmd</div></div>`;
  const recent=all.slice(0,5);
  document.getElementById('dash-table-body').innerHTML=recent.length?`<table class="w-full"><thead><tr><th>Client</th><th>Ville</th><th>Produit</th><th>Date</th><th>Statut</th><th>Bénéfice</th><th>Rent.</th></tr></thead><tbody>${recent.map(c=>`<tr onclick="openModal(${c.id})"><td><strong>${c.client}</strong> ${c.typeClient==='particulier'?'🔒':''}</td><td class="mono">${c.ville || '—'}</td><td class="mono">${c.produit}</td><td class="mono">${c.date}</td><td class="mono">${statusBadge(c.statut)}</td><td class="mono ${c.benefice>=0?'rent-ok':'rent-neg'}">${fmt(c.benefice)}</td><td class="mono ${rentColor(c.rentabilite)}">${fmtR(c.rentabilite)}</td></tr>`).join('')}</tbody></table>`:'<div class="empty-state">Aucune commande</div>';
  const moisMap=new Map(); all.forEach(c=>{if(c.date&&c.benefice){const m=c.date.slice(0,7);moisMap.set(m,(moisMap.get(m)||0)+c.benefice);}});
  const sorted=Array.from(moisMap.keys()).sort();
  const ctx1=document.getElementById('beneficeChart').getContext('2d');
  if(beneficeChart)beneficeChart.destroy();
  beneficeChart=new Chart(ctx1,{type:'line',data:{labels:sorted,datasets:[{label:'Bénéfice net (XAF)',data:sorted.map(m=>moisMap.get(m)),borderColor:'#e63329',tension:0.2,fill:false}]}});
  const statCount={livre:livrees.length, attente:attente.length, pertes:pertes.length};
  const ctx2=document.getElementById('statutChart').getContext('2d');
  if(statutChart)statutChart.destroy();
  statutChart=new Chart(ctx2,{type:'pie',data:{labels:['Livré','En attente','Perte'],datasets:[{data:[statCount.livre,statCount.attente,statCount.pertes],backgroundColor:['#22c55e','#f97316','#e63329']}]}});
  const clientBenef=new Map(); all.forEach(c=>{if(c.benefice)clientBenef.set(c.client,(clientBenef.get(c.client)||0)+c.benefice);});
  const topClients=Array.from(clientBenef.entries()).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const ctx3=document.getElementById('topClientsChart').getContext('2d');
  if(topClientsChart)topClientsChart.destroy();
  topClientsChart=new Chart(ctx3,{type:'bar',data:{labels:topClients.map(t=>t[0]),datasets:[{label:'Bénéfice total (XAF)',data:topClients.map(t=>t[1]),backgroundColor:'#d4a827'}]}});
  let recos=[]; if(pertes.length)recos.push(`<div class="reco-box reco-bad">🔴 ${pertes.length} commande(s) en perte</div>`); if(attente.length>3)recos.push(`<div class="reco-box reco-warn">⏳ ${attente.length} en attente</div>`);
  document.getElementById('dash-recos').innerHTML=recos.join('');
}

// ========== COMMANDES ==========
let commandesFiltrees = [], pageCourante = 1, lignesParPage = 50;
let triColonne = 'date', triOrdre = 'desc';

function renderCommandes() {
  const search = document.getElementById('search-input')?.value.toLowerCase() || '';
  const mois = document.getElementById('filter-month')?.value || '';
  const statutFiltre = document.getElementById('filter-statut')?.value || '';
  commandesFiltrees = DB.commandes.filter(c => {
    if (search && !c.client.toLowerCase().includes(search) && !c.produit.toLowerCase().includes(search)) return false;
    if (mois && c.date && !c.date.startsWith(mois)) return false;
    if (statutFiltre && c.statut !== statutFiltre) return false;
    return true;
  });
  trierCommandes();
  pageCourante = 1;
  afficherPageCommandes();
}
function trierCommandes() {
  commandesFiltrees.sort((a, b) => {
    let valA, valB;
    switch(triColonne) {
      case 'client': valA = a.client.toLowerCase(); valB = b.client.toLowerCase(); break;
      case 'produit': valA = a.produit.toLowerCase(); valB = b.produit.toLowerCase(); break;
      case 'date': valA = a.date || ''; valB = b.date || ''; break;
      case 'poidsTotal': valA = getPoidsTotal(a); valB = getPoidsTotal(b); break;
      case 'coutTotal': valA = a.coutTotal || 0; valB = b.coutTotal || 0; break;
      case 'prixVente': valA = a.prixVente || 0; valB = b.prixVente || 0; break;
      case 'benefice': valA = a.benefice || 0; valB = b.benefice || 0; break;
      case 'rentabilite': valA = a.rentabilite || 0; valB = b.rentabilite || 0; break;
      default: valA = a.date || ''; valB = b.date || '';
    }
    if (typeof valA === 'string') return triOrdre === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    else return triOrdre === 'asc' ? valA - valB : valB - valA;
  });
}
function setTri(colonne) {
  if (triColonne === colonne) triOrdre = triOrdre === 'asc' ? 'desc' : 'asc';
  else { triColonne = colonne; triOrdre = 'desc'; }
  renderCommandes();
}
function afficherPageCommandes() {
  const start = (pageCourante - 1) * lignesParPage;
  const paginated = commandesFiltrees.slice(start, start + lignesParPage);
  const totalPages = Math.ceil(commandesFiltrees.length / lignesParPage);
  const totalVente = commandesFiltrees.reduce((s, c) => s + (c.prixVente || 0), 0);
  const totalBenef = commandesFiltrees.reduce((s, c) => s + (c.benefice || 0), 0);
  document.getElementById('commandes-count').innerHTML = `${commandesFiltrees.length} commande(s) - CA: ${fmt(totalVente)} - Bénéfice: ${fmt(totalBenef)}`;
  if (paginated.length === 0) { document.getElementById('commandes-body').innerHTML = '<div class="empty-state">Aucune commande</div>'; document.getElementById('pagination-controls').innerHTML = ''; return; }
  document.getElementById('commandes-body').innerHTML = `
    <div class="overflow-x-auto"><table class="w-full"><thead class="bg-bg3"><tr>
      <th class="px-4 py-3 text-left text-xs font-mono text-text3 cursor-pointer hover:bg-bg2" onclick="setTri('client')">Client ${triColonne === 'client' ? (triOrdre === 'asc' ? '▲' : '▼') : ''}</th>
      <th class="px-4 py-3 text-left text-xs font-mono text-text3">Ville</th>
      <th class="px-4 py-3 text-left text-xs font-mono text-text3 cursor-pointer hover:bg-bg2" onclick="setTri('produit')">Produit ${triColonne === 'produit' ? (triOrdre === 'asc' ? '▲' : '▼') : ''}</th>
      <th class="px-4 py-3 text-left text-xs font-mono text-text3">Qté</th>
      <th class="px-4 py-3 text-left text-xs font-mono text-text3 cursor-pointer hover:bg-bg2" onclick="setTri('poidsTotal')">Poids total ${triColonne === 'poidsTotal' ? (triOrdre === 'asc' ? '▲' : '▼') : ''}</th>
      <th class="px-4 py-3 text-left text-xs font-mono text-text3">Volume</th>
      <th class="px-4 py-3 text-left text-xs font-mono text-text3">Transport</th>
      <th class="px-4 py-3 text-left text-xs font-mono text-text3 cursor-pointer hover:bg-bg2" onclick="setTri('coutTotal')">Coût total ${triColonne === 'coutTotal' ? (triOrdre === 'asc' ? '▲' : '▼') : ''}</th>
      <th class="px-4 py-3 text-left text-xs font-mono text-text3 cursor-pointer hover:bg-bg2" onclick="setTri('prixVente')">Prix vente ${triColonne === 'prixVente' ? (triOrdre === 'asc' ? '▲' : '▼') : ''}</th>
      <th class="px-4 py-3 text-left text-xs font-mono text-text3 cursor-pointer hover:bg-bg2" onclick="setTri('benefice')">Bénéfice ${triColonne === 'benefice' ? (triOrdre === 'asc' ? '▲' : '▼') : ''}</th>
      <th class="px-4 py-3 text-left text-xs font-mono text-text3 cursor-pointer hover:bg-bg2" onclick="setTri('rentabilite')">Rent. ${triColonne === 'rentabilite' ? (triOrdre === 'asc' ? '▲' : '▼') : ''}</th>
      <th class="px-4 py-3 text-left text-xs font-mono text-text3">Statut</th>
      <th class="px-4 py-3 text-left text-xs font-mono text-text3">Actions</th>
    </tr></thead><tbody>${paginated.map(c => `<tr class="border-b border-border hover:bg-bg3 transition cursor-pointer" onclick="openModal(${c.id})">
      <td class="px-4 py-3"><strong>${c.client}</strong> ${c.typeClient === 'particulier' ? '🔒' : ''}</td>
      <td class="px-4 py-3 mono">${c.ville || '—'}</td>
      <td class="px-4 py-3">${c.produit}</td>
      <td class="px-4 py-3 mono">${c.quantite}</td>
      <td class="px-4 py-3 mono">${getPoidsTotal(c).toFixed(2)} kg</td> <td class="px-4 py-3 mono">${getVolumeTotal(c).toFixed(4)} m³</td>
      <td class="px-4 py-3"><span class="badge ${c.poidsSousType === 'bateau_45' ? 'badge-cbm' : 'badge-gray'}">${getTransportLabel(c)
      }</span></td>
      <td class="px-4 py-3 mono">${fmt(c.coutTotal)}</td> <td class="px-4 py-3 mono">${c.prixVente ? fmt(c.prixVente) : '—'}</td>
      <td class="px-4 py-3 mono ${c.benefice >= 0 ? 'text-green' : 'text-red'}">${fmt(c.benefice)}</td>
      <td class="px-4 py-3 mono ${rentColor(c.rentabilite)}">${fmtR(c.rentabilite)}</td>
      <td class="px-4 py-3">${statusBadge(c.statut)}</td>
      <td class="px-4 py-3"><button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); openModal(${c.id})">👁️</button><button class="delete-btn" onclick="event.stopPropagation(); deleteCommande(${c.id})">🗑</button></td>
    </tr>`).join('')}</tbody></table></div>`;
  let pagHtml = `<div class="flex justify-between items-center p-4 border-t border-border">
    <div class="flex gap-2 items-center"><span class="text-sm text-text2">Afficher :</span><select id="lignes-par-page" class="form-input py-1 px-2 w-20" onchange="changerLignesParPage()"><option value="25" ${lignesParPage === 25 ? 'selected' : ''}>25</option><option value="50" ${lignesParPage === 50 ? 'selected' : ''}>50</option><option value="100" ${lignesParPage === 100 ? 'selected' : ''}>100</option><option value="999999" ${lignesParPage === 999999 ? 'selected' : ''}>Tout</option></select></div>
    <div class="flex gap-2"><button class="px-3 py-1 bg-bg3 rounded ${pageCourante === 1 ? 'opacity-50' : ''}" onclick="changerPage(1)" ${pageCourante === 1 ? 'disabled' : ''}>«</button><button class="px-3 py-1 bg-bg3 rounded ${pageCourante === 1 ? 'opacity-50' : ''}" onclick="changerPage(${pageCourante - 1})" ${pageCourante === 1 ? 'disabled' : ''}>‹</button><span class="px-3 py-1">Page ${pageCourante} / ${totalPages}</span><button class="px-3 py-1 bg-bg3 rounded ${pageCourante === totalPages ? 'opacity-50' : ''}" onclick="changerPage(${pageCourante + 1})" ${pageCourante === totalPages ? 'disabled' : ''}>›</button><button class="px-3 py-1 bg-bg3 rounded ${pageCourante === totalPages ? 'opacity-50' : ''}" onclick="changerPage(${totalPages})" ${pageCourante === totalPages ? 'disabled' : ''}>»</button></div>
  </div>`;
  document.getElementById('pagination-controls').innerHTML = pagHtml;
}
function changerPage(p) { const totalPages = Math.ceil(commandesFiltrees.length / lignesParPage); if (p >= 1 && p <= totalPages) { pageCourante = p; afficherPageCommandes(); } }
function changerLignesParPage() { lignesParPage = parseInt(document.getElementById('lignes-par-page').value); pageCourante = 1; afficherPageCommandes(); }
function deleteCommande(id){ if(confirm('Supprimer ?')){ DB.commandes=DB.commandes.filter(c=>c.id!==id); save(); renderCommandes(); renderDashboard(); showToast('Supprimée'); } }

// ========== IMPORT CSV ==========
document.getElementById('import-csv-btn').onclick=()=>{ const input=document.createElement('input'); input.type='file'; input.accept='.csv'; input.onchange=e=>importCSV(e.target.files[0]); input.click(); };
function importCSV(file){
  const reader=new FileReader();
  reader.onload=(e)=>{
    const text=e.target.result;
    const lignes=text.split('\n').slice(1);
    for(let ligne of lignes){
      if(!ligne.trim()) continue;
      const cols=ligne.split(',');
      if(cols.length<10) continue;
      const c={ client:cols[0], typeClient:cols[1]||'pro', produit:cols[2], quantite:parseInt(cols[3])||1, prixAchat:parseFloat(cols[4])||0, devise:cols[5]||'XAF', poidsUnitaire:parseFloat(cols[6])||0, transportMode:cols[7]||'poids', prixVente:parseFloat(cols[8])||0, fraisManuels:parseFloat(cols[9])||0, statut:cols[10]||'en_attente', date:new Date().toISOString().split('T')[0], fournisseur:cols[11]||'', email:cols[12]||'', poidsSousType:cols[13]||'normal', ville:cols[14]||'' };
      c.poidsReel=c.poidsUnitaire*c.quantite;
      const calc=calcCommande(c);
      Object.assign(c,calc);
      c.id=Date.now()+Math.random();
      DB.commandes.unshift(c);
    }
    save(); renderCommandes(); renderDashboard(); showToast('Import CSV terminé');
  };
  reader.readAsText(file);
}

// ========== DEVIS ==========
function montrerFormulaireDevis() { document.getElementById('formulaire-devis').style.display = document.getElementById('formulaire-devis').style.display === 'none' ? 'block' : 'none'; }
function creerDevis() {
  const client = document.getElementById('devis-client').value.trim(); if(!client) { showToast('Client requis','err'); return; }
  const email = document.getElementById('devis-email').value;
  const typeClient = document.getElementById('devis-typeClient').value;
  const produit = document.getElementById('devis-produit').value.trim();
  const qty = parseInt(document.getElementById('devis-qty').value) || 1;
  const prixAchat = parseFloat(document.getElementById('devis-prixAchat').value);
  const devise = document.getElementById('devis-devise').value;
  const poidsUnitaire = parseFloat(document.getElementById('devis-poids').value);
  const sousTypeDevis = normaliseSousType(document.getElementById('devis-transport').value);
  const prixVente = parseFloat(document.getElementById('devis-prixVente').value);
  if(!produit || !prixAchat || !poidsUnitaire) { showToast('Champs obligatoires','err'); return; }
  const devisType = document.getElementById('devis-typeClient').value;
  if(devisType==='particulier' && !prixVente){ showToast('Prix de vente obligatoire pour particulier','err'); return; }
  const effectiveModeDevis = sousTypeDevis === 'bateau_45' ? 'cbm' : 'poids';
  const c = { id: Date.now(), client, email, typeClient: devisType, produit, quantite: qty, prixAchat, devise, poidsUnitaire, poidsReel: poidsUnitaire * qty, transportMode: effectiveModeDevis, transport: effectiveModeDevis, prixVente: prixVente||0, fraisManuels: 0, statut: 'devis', date: new Date().toISOString().split('T')[0], fournisseur: '', poidsSousType: sousTypeDevis, ville: '' };
  const calc = calcCommande(c); Object.assign(c, calc);
  DB.commandes.unshift(c); save(); showToast('Devis créé'); renderDevis(); document.getElementById('formulaire-devis').style.display = 'none';
}
function renderDevis() {
  const devis = DB.commandes.filter(c=>c.statut==='devis');
  document.getElementById('devis-body').innerHTML = devis.length ? `<table class="w-full"><thead><tr><th>Client</th><th>Ville</th><th>Produit</th><th>Date</th><th>Montant</th><th></th></tr></thead><tbody>${devis.map(c=>`<tr onclick="openModal(${c.id})"><td>${c.client}</td><td class="mono">${c.ville || '—'}</td><td class="mono">${c.produit}</td><td class="mono">${c.date}</td><td class="mono">${fmt(c.prixVente)}</td><td><button class="btn btn-sm btn-red" onclick="event.stopPropagation(); transformerDevisEnCommande(${c.id})">📦 Transformer</button></td></tr>`).join('')}</tbody></table>` : '<div class="empty-state">Aucun devis</div>';
}
function transformerDevisEnCommande(id) { const cmd = DB.commandes.find(c=>c.id===id); if(cmd && cmd.statut==='devis') { cmd.statut = 'en_attente'; save(); renderDevis(); renderCommandes(); showToast('Devis transformé en commande'); } }

// ========== FOURNISSEURS ==========
let rechercheFournisseur = '', filtrePaysFournisseur = '';
function renderFournisseurs() {
  const list = DB.fournisseurs;
  let filtered = list.filter(f => {
    if (rechercheFournisseur && !f.nom.toLowerCase().includes(rechercheFournisseur.toLowerCase()) && !(f.contact && f.contact.toLowerCase().includes(rechercheFournisseur.toLowerCase())) && !(f.produits && f.produits.toLowerCase().includes(rechercheFournisseur.toLowerCase()))) return false;
    if (filtrePaysFournisseur && f.pays !== filtrePaysFournisseur) return false;
    return true;
  });
  const commandesParFournisseur = {}; DB.commandes.forEach(c => { if (c.fournisseur) commandesParFournisseur[c.fournisseur] = (commandesParFournisseur[c.fournisseur] || 0) + 1; });
  const paysList = [...new Set(list.map(f => f.pays).filter(p => p))];
  let html = `<div style="margin-bottom:16px; display:flex; gap:10px; flex-wrap:wrap;"><input type="text" id="search-fournisseur" placeholder="🔍 Rechercher (nom, contact, produits)" class="form-input" style="flex:1;" value="${rechercheFournisseur}"><select id="filtre-pays-fournisseur" class="form-select" style="width:150px;"><option value="">Tous les pays</option>${paysList.map(p => `<option value="${p}" ${filtrePaysFournisseur === p ? 'selected' : ''}>${p}</option>`).join('')}</select><button class="btn btn-ghost btn-sm" onclick="resetFiltresFournisseurs()">Réinitialiser</button></div>`;
  if (filtered.length === 0) html += '<div class="empty-state">Aucun fournisseur</div>';
  else {
    html += `<div class="overflow-x-auto"><table class="w-full"><thead><tr><th>Nom</th><th>Contact</th><th>Email</th><th>Adresse</th><th>Pays</th><th>Délai (j)</th><th>Produits</th><th>Commandes</th><th>Note</th><th></th></tr></thead><tbody>`;
    filtered.forEach((f, idx) => {
      const nbCmd = commandesParFournisseur[f.nom] || 0;
      const produitsApercu = f.produits ? f.produits.split(',').slice(0,3).join(', ') + (f.produits.split(',').length > 3 ? '…' : '') : '-';
      html += `<tr onclick="voirCommandesFournisseur('${f.nom.replace(/'/g, "\\'")}')" style="cursor:pointer"><td>${f.nom}</td><td class="mono">${f.contact || '-'}</td><td class="mono">${f.email || '-'}</td><td class="mono">${f.adresse || '-'}</td><td class="mono">${f.pays || '-'}</td><td class="mono">${f.delai || 0} j</td><td class="mono" title="${f.produits || ''}">${produitsApercu}</td><td class="mono"><span class="badge ${nbCmd > 0 ? 'badge-green' : 'badge-gray'}">${nbCmd} commande(s)</span></td><td class="mono">${f.note || '-'}</td><td class="mono"><button class="delete-btn" onclick="event.stopPropagation(); modifierFournisseur(${idx})">✏️</button><button class="delete-btn" onclick="event.stopPropagation(); supprimerFournisseur(${idx})">🗑</button></td></tr>`;
    });
    html += `</tbody></table></div>`;
  }
  document.getElementById('fournisseurs-body').innerHTML = html;
  const searchInput = document.getElementById('search-fournisseur'); if (searchInput) searchInput.oninput = (e) => { rechercheFournisseur = e.target.value; renderFournisseurs(); };
  const paysSelect = document.getElementById('filtre-pays-fournisseur'); if (paysSelect) paysSelect.onchange = (e) => { filtrePaysFournisseur = e.target.value; renderFournisseurs(); };
  const select = document.getElementById('f-fournisseur'); if (select) { const currentVal = select.value; select.innerHTML = '<option value="">Sélectionner</option>' + list.map(f => `<option value="${f.nom}">${f.nom}</option>`).join(''); if (currentVal) select.value = currentVal; }
}
function resetFiltresFournisseurs() { rechercheFournisseur = ''; filtrePaysFournisseur = ''; renderFournisseurs(); }
function ouvrirModalFournisseur(idx) {
  const isEdit = idx !== undefined && idx !== null;
  const f = isEdit ? DB.fournisseurs[idx] : {};
  const titre = isEdit ? 'Modifier le fournisseur' : 'Ajouter un fournisseur';
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-title">${titre}</div>
    <div class="form-grid" style="margin-top:0;">
      <div class="form-group"><label class="form-label">Nom *</label><input class="form-input" id="fourn-nom" value="${f.nom||''}" placeholder="Nom du fournisseur"></div>
      <div class="form-group"><label class="form-label">Téléphone</label><input class="form-input" id="fourn-contact" value="${f.contact||''}" placeholder="+86 / +237..."></div>
      <div class="form-group"><label class="form-label">Email</label><input class="form-input" id="fourn-email" type="email" value="${f.email||''}" placeholder="contact@fournisseur.com"></div>
      <div class="form-group"><label class="form-label">Pays</label><input class="form-input" id="fourn-pays" value="${f.pays||''}" placeholder="Chine, Turquie..."></div>
      <div class="form-group full"><label class="form-label">Adresse complète</label><input class="form-input" id="fourn-adresse" value="${f.adresse||''}" placeholder="Adresse / ville / région"></div>
      <div class="form-group"><label class="form-label">Délai livraison (jours)</label><input class="form-input" id="fourn-delai" type="number" value="${f.delai||0}" min="0"></div>
      <div class="form-group full"><label class="form-label">Produits vendus (séparés par virgule)</label><input class="form-input" id="fourn-produits" value="${f.produits||''}" placeholder="Chaussures, vêtements, électronique..."></div>
      <div class="form-group full"><label class="form-label">Note / fiabilité</label><textarea class="form-input" id="fourn-note" rows="3" placeholder="Fiable, délai respecté, attention aux tailles...">${f.note||''}</textarea></div>
    </div>
    <div style="display:flex;gap:10px;margin-top:16px;">
      <button class="btn btn-red" style="flex:1;" onclick="sauvegarderFournisseur(${isEdit ? idx : 'null'})">💾 ${isEdit ? 'Enregistrer' : 'Ajouter'}</button>
      <button class="btn btn-ghost" onclick="closeModal()">Annuler</button>
    </div>`;
  document.getElementById('modal-overlay').classList.add('open');
  setTimeout(() => document.getElementById('fourn-nom').focus(), 100);
}
function sauvegarderFournisseur(idx) {
  const nom = document.getElementById('fourn-nom').value.trim();
  if (!nom) { showToast('Le nom est obligatoire', 'err'); return; }
  const data = {
    nom,
    contact: document.getElementById('fourn-contact').value.trim(),
    email: document.getElementById('fourn-email').value.trim(),
    adresse: document.getElementById('fourn-adresse').value.trim(),
    pays: document.getElementById('fourn-pays').value.trim(),
    delai: parseInt(document.getElementById('fourn-delai').value) || 0,
    produits: document.getElementById('fourn-produits').value.trim(),
    note: document.getElementById('fourn-note').value.trim(),
  };
  if (idx !== null && idx !== undefined) {
    DB.fournisseurs[idx] = data;
    showToast('Fournisseur modifié ✅');
  } else {
    DB.fournisseurs.push(data);
    showToast('Fournisseur ajouté ✅');
  }
  save(); renderFournisseurs(); closeModal();
}
function ajouterFournisseur() { ouvrirModalFournisseur(); }
function modifierFournisseur(idx) { ouvrirModalFournisseur(idx); }
function supprimerFournisseur(idx) { if (confirm('Supprimer ce fournisseur ?')) { DB.fournisseurs.splice(idx,1); save(); renderFournisseurs(); showToast('Fournisseur supprimé'); } }
function voirCommandesFournisseur(nom) {
  const commandes = DB.commandes.filter(c => c.fournisseur === nom);
  if (commandes.length === 0) { alert(`Aucune commande pour le fournisseur ${nom}`); return; }
  let html = `<div class="modal-title">Commandes - ${nom}</div><div class="table-wrap"><table class="w-full"><thead><tr><th>Date</th><th>Client</th><th>Ville</th><th>Produit</th><th>Montant</th><th>Statut</th></tr></thead><tbody>`;
  commandes.forEach(c => { html += `<tr onclick="openModal(${c.id})" style="cursor:pointer"><td class="mono">${c.date}</td><td class="mono">${c.client}</td><td class="mono">${c.ville || '—'}</td><td class="mono">${c.produit}</td><td class="mono">${fmt(c.prixVente)}</td><td class="mono">${statusBadge(c.statut)}</td></tr>`; });
  html += `</tbody></table></div><div class="flex justify-end mt-4"><button class="btn btn-red" onclick="closeModal()">Fermer</button></div>`;
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('open');
}

// ========== FACTURES AMÉLIORÉES ==========
function setStyleFacture(style) {
  DB.params.pdfStyle = style;
  save();
  ['moderne','blocs','premium'].forEach(s => {
    const btn = document.getElementById('style-btn-'+s);
    if (!btn) return;
    if (s === style) btn.classList.add('active'); else btn.classList.remove('active');
  });
  const labels = {moderne:'Version 1 — Moderne (épurée, bande latérale rouge)', blocs:'Version 2 — Carte/Blocs (lisible, impact visuel fort)', premium:'Version 3 — Premium (contraste, focus sur le total)'};
  const el = document.getElementById('style-actif-label');
  if (el) el.innerHTML = `<span style="color:var(--red);">✅ Style actif :</span> ${labels[style]||style}`;
  showToast('Style facture : ' + (labels[style]||style).split(' — ')[0]);
}

function renderFactures() {
  const all = DB.commandes.filter(c => c.statut !== 'devis');
  const moisSel = document.getElementById('facture-mois');
  if (moisSel) {
    const moisSet = [...new Set(all.map(c => c.date ? c.date.slice(0,7) : '').filter(Boolean))].sort().reverse();
    const currentMois = moisSel.value;
    moisSel.innerHTML = '<option value="">Tous les mois</option>' + moisSet.map(m => `<option value="${m}" ${currentMois === m ? 'selected' : ''}>${m}</option>`).join('');
  }
  const search = document.getElementById('facture-search')?.value.toLowerCase() || '';
  const statutF = document.getElementById('facture-statut')?.value || '';
  const moisF = document.getElementById('facture-mois')?.value || '';
  let filtered = all.filter(c => {
    if (search && !c.client.toLowerCase().includes(search) && !c.produit.toLowerCase().includes(search)) return false;
    if (statutF && c.statut !== statutF) return false;
    if (moisF && c.date && !c.date.startsWith(moisF)) return false;
    return true;
  });
  const totalCA = filtered.reduce((s,c) => s + (c.prixVente||0), 0);
  const totalBenef = filtered.reduce((s,c) => s + (c.benefice||0), 0);
  const nbLivrees = filtered.filter(c => c.statut === 'livre').length;
  const kpiEl = document.getElementById('factures-kpis');
  if (kpiEl) kpiEl.innerHTML = `
    <div class="kpi-card"><div class="kpi-label">Commandes</div><div class="kpi-value">${filtered.length}</div><div class="kpi-sub">${nbLivrees} livrées</div></div>
    <div class="kpi-card green"><div class="kpi-label">CA Total</div><div class="kpi-value green" style="font-size:18px">${Math.round(totalCA).toLocaleString('fr-FR')}</div><div class="kpi-sub">XAF</div></div>
    <div class="kpi-card gold"><div class="kpi-label">Bénéfice</div><div class="kpi-value" style="font-size:18px;color:var(--gold)">${Math.round(totalBenef).toLocaleString('fr-FR')}</div><div class="kpi-sub">XAF</div></div>
    <div class="kpi-card orange"><div class="kpi-label">Sélectionnées</div><div class="kpi-value" style="font-size:22px" id="kpi-selected-val">0</div><div class="kpi-sub">pour PDF groupé</div></div>
  `;
  if (filtered.length === 0) {
    document.getElementById('factures-list').innerHTML = '<div class="empty-state"><div class="empty-icon">📄</div><div class="empty-text">Aucune commande correspondante</div></div>';
    return;
  }
  let html = `<div class="overflow-x-auto"><table class="w-full">
    <thead><tr>
      <th style="width:36px;padding:10px 12px;"><input type="checkbox" id="select-all-factures" onchange="toggleSelectAll(this)"></th>
      <th onclick="setTriFactures('date')" style="cursor:pointer">Date</th>
      <th onclick="setTriFactures('client')" style="cursor:pointer">Client</th>
      <th>Ville</th>
      <th>Produit</th>
      <th>Qté</th>
      <th>Montant</th>
      <th>Bénéfice</th>
      <th>Statut</th>
      <th>Actions</th>
    </tr></thead><tbody>`;
  filtered.forEach(c => {
    html += `<tr class="border-b border-border hover:bg-bg3 transition" id="row-fact-${c.id}">
      <td style="padding:10px 12px;"><input type="checkbox" class="facture-checkbox" data-id="${c.id}" onchange="updateSelectedCount()"></td>
      <td class="mono px-4 py-3">${c.date || '—'}</td>
      <td class="px-4 py-3"><strong>${c.client}</strong> <span style="font-size:11px;color:var(--text3);">${c.typeClient === 'particulier' ? '🔒' : '👔'}</span>
        ${c.typeClient === 'particulier' ? `<span class="paiement-badge ${c.paiementStatut === 'payé' ? 'payé' : 'en-attente'}">${c.paiementStatut === 'payé' ? '✅ Payé' : '⏳ Non payé'}</span>` : ''}
      </td>
      <td class="mono px-4 py-3">${c.ville || '—'}</td>
      <td class="mono px-4 py-3">${c.produit}</td>
      <td class="mono px-4 py-3">${c.quantite}</td>
      <td class="mono px-4 py-3">${c.prixVente ? fmt(c.prixVente) : '<span style="color:var(--text3)">—</span>'}</td>
      <td class="mono px-4 py-3 ${c.benefice >= 0 ? 'text-green' : 'text-red'}">${fmt(c.benefice)}</td>
      <td class="px-4 py-3">${statusBadge(c.statut)}</td>
      <td class="px-4 py-3" style="display:flex;gap:6px;flex-wrap:wrap;">
        <button class="btn btn-ghost btn-sm" onclick="imprimerFacturePro(${c.id})" title="Facture HTML">🖨️</button>
        <button class="btn btn-red btn-sm" onclick="genererFacturePDFPro(${c.id})" title="PDF">📄</button>
        <button class="btn btn-sm" style="background:#25D366;color:white;padding:6px 8px;" onclick="ouvrirMenuWhatsApp(${c.id})" title="Messages WhatsApp">💬</button>
      </td>
    </tr>`;
  });
  html += `</tbody></table></div>`;
  document.getElementById('factures-list').innerHTML = html;
  updateSelectedCount();
}
let triFacturesCol = 'date', triFacturesOrdre = 'desc';
function setTriFactures(col) {
  if (triFacturesCol === col) triFacturesOrdre = triFacturesOrdre === 'asc' ? 'desc' : 'asc';
  else { triFacturesCol = col; triFacturesOrdre = 'desc'; }
  renderFactures();
}
function toggleSelectAll(cb) {
  document.querySelectorAll('.facture-checkbox').forEach(c => c.checked = cb.checked);
  updateSelectedCount();
}
function updateSelectedCount() {
  const n = document.querySelectorAll('.facture-checkbox:checked').length;
  const el = document.getElementById('factures-selected-count');
  const kpiEl = document.getElementById('kpi-selected-val');
  if (el) el.textContent = `${n} sélectionnée(s)`;
  if (kpiEl) kpiEl.textContent = n;
}
function toutSelectionnerFactures() {
  document.querySelectorAll('.facture-checkbox').forEach(c => c.checked = true);
  const allCb = document.getElementById('select-all-factures');
  if (allCb) allCb.checked = true;
  updateSelectedCount();
}
function deselectionnerTout() {
  document.querySelectorAll('.facture-checkbox').forEach(c => c.checked = false);
  const allCb = document.getElementById('select-all-factures');
  if (allCb) allCb.checked = false;
  updateSelectedCount();
}
function toggleCheckbox(id){ const cb=document.querySelector(`.facture-checkbox[data-id="${id}"]`); if(cb){ cb.checked=!cb.checked; updateSelectedCount(); } }
async function genererFactureLot(){
  const checkboxes=document.querySelectorAll('.facture-checkbox:checked');
  const ids=[...checkboxes].map(cb=>parseInt(cb.dataset.id));
  if(ids.length===0){ showToast('Sélectionnez au moins une commande','err'); return; }
  const commandes=DB.commandes.filter(c=>ids.includes(c.id));
  await genererFacturePDFPro(null, true, commandes);
}

// ========== NOUVEAU MOTEUR PDF PAR TYPE CLIENT - 3 STYLES ==========
function hexToRgbArr(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return [isNaN(r)?230:r, isNaN(g)?51:g, isNaN(b)?41:b];
}

async function genererFacturePDFPro(id, isLot = false, commandesLot = null) {
  let commande, commandes;
  if (isLot && commandesLot) { commandes = commandesLot; commande = commandes[0]; }
  else { commande = DB.commandes.find(x => x.id === id); commandes = [commande]; }
  if (!commande) return;

  const s = DB.societe;
  const params = DB.params;
  const primHex = params.couleurPrincipale || s.couleur || '#e63329';
  const [pr,pg,pb] = hexToRgbArr(primHex);
  const secColor = params.couleurSecondaire || '#f0f0f0';
  const style = params.pdfStyle || 'moderne';
  const numFact = isLot ? `FAC-LOT-${Date.now()}` : `FAC-2026-${String(commande.id).padStart(5,'0')}`;
  const dateEmission = new Date().toLocaleDateString('fr-FR');
  const dateEch = new Date(); dateEch.setDate(dateEch.getDate() + (params.delaiPaiement || 15));
  const calc = calcCommande(commande);
  const montantTotal = commande.prixVente || calc.coutTotal;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const W = doc.internal.pageSize.width;
  const H = doc.internal.pageSize.height;
  let y = 14;

  // ======================== STYLE 1 : MODERNE (épurée, bande latérale) ========================
  if (style === 'moderne' || style === 'v1') {
    // Bande latérale gauche rouge
    doc.setFillColor(pr,pg,pb);
    doc.rect(0, 0, 8, H, 'F');
    // En-tête
    doc.setFont('helvetica','bold'); doc.setFontSize(22); doc.setTextColor(pr,pg,pb);
    doc.text(s.nom || 'MG IMPORT', 16, 22);
    if (params.afficherSlogan && s.slogan) {
      doc.setFontSize(8); doc.setTextColor(130,130,130); doc.setFont('helvetica','italic');
      doc.text(s.slogan, 16, 28);
    }
    if (params.afficherLogo && s.logo && s.logo.startsWith('data:image')) {
      try { doc.addImage(s.logo, 'JPEG', W-52, 10, 36, 18); } catch(e) {}
    }
    // FACTURE + numéro
    doc.setFillColor(40,40,40); doc.rect(W-70, 10, 62, 20, 'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.setTextColor(255,255,255);
    doc.text('FACTURE', W-39, 19, {align:'center'});
    doc.setFontSize(8); doc.setTextColor(pr,pg,pb);
    doc.text(numFact, W-39, 26, {align:'center'});
    // Ligne séparatrice
    doc.setDrawColor(pr,pg,pb); doc.setLineWidth(0.6);
    doc.line(16, 34, W-14, 34);
    y = 42;
    // Bloc émetteur
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(pr,pg,pb);
    doc.text('ÉMIS PAR', 16, y);
    doc.setFont('helvetica','normal'); doc.setTextColor(50,50,50); doc.setFontSize(9);
    y += 6;
    [s.nom||'', s.adresse||'', s.tel||'', s.email||''].filter(Boolean).forEach(l=>{ doc.text(l,16,y); y+=5; });
    // Bloc client (droite)
    const ycli = 42;
    doc.setFillColor(248,248,248); doc.rect(120, ycli-4, 76, 36, 'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(pr,pg,pb);
    doc.text('CLIENT', 124, ycli+2);
    doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(30,30,30);
    doc.text(commande.client||'', 124, ycli+9);
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(80,80,80);
    if(commande.ville) doc.text(commande.ville, 124, ycli+16);
    if(commande.whatsapp) doc.text(commande.whatsapp, 124, ycli+22);
    // Statut
    const statutLabel = commande.statut === 'livre' ? 'VALIDÉE' : commande.statut === 'annule' ? 'ANNULÉE' : 'EN COURS';
    const [sc1,sc2,sc3] = commande.statut==='livre'?[34,197,94]:commande.statut==='annule'?[230,51,41]:[249,115,22];
    doc.setFillColor(sc1,sc2,sc3); doc.roundedRect(152, ycli+26, 40, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(255,255,255);
    doc.text(statutLabel, 172, ycli+31.5, {align:'center'});
    // Dates
    doc.setFontSize(8); doc.setTextColor(100,100,100); doc.setFont('helvetica','normal');
    doc.text(`DATE D'ÉMISSION`, 16, y+8); doc.setFont('helvetica','bold'); doc.setTextColor(30,30,30); doc.text(dateEmission, 16, y+14);
    doc.setFont('helvetica','normal'); doc.setTextColor(100,100,100);
    doc.text('RÉFÉRENCE', 80, y+8); doc.setFont('helvetica','bold'); doc.setTextColor(30,30,30); doc.text(`REF-${commande.id}`, 80, y+14);
    y = Math.max(y+22, ycli+44);
    doc.setDrawColor(230,230,230); doc.setLineWidth(0.3); doc.line(16, y, W-14, y);
    y += 8;
    // Détails commande
    doc.setFillColor(248,248,248); doc.rect(14, y-2, W-28, 7, 'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(pr,pg,pb);
    doc.text('DÉTAILS DE LA COMMANDE', 18, y+3);
    y += 12;
  }

  // ======================== STYLE 2 : CARTE/BLOCS ========================
  else if (style === 'blocs' || style === 'v2') {
    // Header rouge
    doc.setFillColor(pr,pg,pb); doc.rect(0, 0, W, 36, 'F');
    if (params.afficherLogo && s.logo && s.logo.startsWith('data:image')) {
      try { doc.addImage(s.logo, 'JPEG', 14, 6, 28, 14); } catch(e) {}
    }
    doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.setTextColor(255,255,255);
    doc.text(s.nom||'MG IMPORT', 48, 16);
    if(params.afficherSlogan&&s.slogan){doc.setFontSize(8);doc.setFont('helvetica','italic');doc.text(s.slogan,48,23);}
    doc.setFillColor(255,255,255); doc.roundedRect(W-60, 8, 46, 14, 2, 2, 'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.setTextColor(pr,pg,pb);
    doc.text('FACTURE', W-37, 16, {align:'center'});
    doc.setFontSize(7); doc.setTextColor(60,60,60); doc.text(numFact, W-37, 21, {align:'center'});
    y = 44;
    // Bande info (date, ref, statut)
    doc.setFillColor(245,245,245); doc.rect(14, y, W-28, 14, 'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(120,120,120);
    doc.text('DATE', 20, y+5); doc.text('RÉFÉRENCE', 70, y+5); doc.text('STATUT', 130, y+5);
    doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(30,30,30);
    doc.text(dateEmission, 20, y+11);
    doc.text(`REF-${commande.id}`, 70, y+11);
    const sl = commande.statut==='livre'?'VALIDÉE':commande.statut==='annule'?'ANNULÉE':'EN COURS';
    const [sc1,sc2,sc3] = commande.statut==='livre'?[34,197,94]:commande.statut==='annule'?[230,51,41]:[249,115,22];
    doc.setFillColor(sc1,sc2,sc3); doc.roundedRect(128, y+4, 30, 7, 1.5,1.5,'F');
    doc.setTextColor(255,255,255); doc.setFontSize(7); doc.text(sl, 143, y+9, {align:'center'});
    y += 20;
    // Bloc client (carte)
    doc.setDrawColor(220,220,220); doc.setLineWidth(0.5); doc.rect(14, y, 88, 36);
    doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(120,120,120); doc.text('CLIENT', 18, y+6);
    doc.setFontSize(11); doc.setTextColor(30,30,30); doc.text(commande.client||'', 18, y+14);
    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(80,80,80);
    if(commande.ville) doc.text(commande.ville, 18, y+21);
    if(commande.whatsapp) doc.text(commande.whatsapp, 18, y+28);
    // Type client badge
    const tcLabel = commande.typeClient==='particulier'?'PARTICULIER':'PROFESSIONNEL';
    const [tc1,tc2,tc3] = commande.typeClient==='particulier'?[249,115,22]:[99,102,241];
    doc.setFillColor(tc1,tc2,tc3); doc.roundedRect(75, y+27, 24, 6, 1,1,'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(6); doc.setTextColor(255,255,255);
    doc.text(tcLabel, 87, y+31.5, {align:'center'});
    // Infos commande (carte droite)
    doc.rect(108, y, 88, 36);
    doc.setFont('helvetica','bold'); doc.setFontSize(7); doc.setTextColor(120,120,120); doc.text('INFORMATIONS COMMANDE', 112, y+6);
    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(50,50,50);
    doc.text(`Produit : ${commande.produit}`, 112, y+13);
    doc.text(`Quantité : ${commande.quantite}`, 112, y+19);
    doc.text(`Transport : ${getTransportLabel(commande)}`, 112, y+25);
    doc.text(`Référence : REF-${commande.id}`, 112, y+31);
    y += 44;
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(pr,pg,pb);
  }

  // ======================== STYLE 3 : PREMIUM / CONTRASTE ========================
  else if (style === 'premium' || style === 'v3') {
    // En-tête bicolore
    doc.setFillColor(20,20,20); doc.rect(0, 0, W/2, 32, 'F');
    doc.setFillColor(pr,pg,pb); doc.rect(W/2, 0, W/2, 32, 'F');
    if (params.afficherLogo && s.logo && s.logo.startsWith('data:image')) {
      try { doc.addImage(s.logo, 'JPEG', 14, 4, 28, 14); } catch(e) {}
    }
    doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.setTextColor(255,255,255);
    doc.text(s.nom||'MG IMPORT', 48, 16);
    if(params.afficherSlogan&&s.slogan){doc.setFontSize(7);doc.setFont('helvetica','normal');doc.text(s.slogan,48,23);}
    doc.setFont('helvetica','bold'); doc.setFontSize(14); doc.setTextColor(255,255,255);
    doc.text('FACTURE', W-14, 14, {align:'right'});
    doc.setFontSize(9); doc.text(numFact, W-14, 22, {align:'right'});
    y = 40;
    // Ligne info
    doc.setFillColor(245,245,245); doc.rect(14, y, W-28, 12, 'F');
    doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(100,100,100);
    doc.text('📅 '+dateEmission, 18, y+5); doc.text('🔖 REF-'+commande.id, 60, y+5);
    const sl3 = commande.statut==='livre'?'✅ VALIDÉE':commande.statut==='annule'?'❌ ANNULÉE':'⏳ EN COURS';
    doc.text(sl3, 110, y+5);
    // Client + Commande en deux colonnes
    y += 18;
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(120,120,120);
    doc.text('CLIENT', 14, y); doc.text('COMMANDE', 110, y);
    doc.setFontSize(11); doc.setTextColor(20,20,20); doc.setFont('helvetica','bold');
    y += 6; doc.text(commande.client||'', 14, y);
    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(80,80,80);
    if(commande.ville){y+=5;doc.text(commande.ville, 14, y);}
    if(commande.whatsapp){y+=5;doc.text(commande.whatsapp, 14, y);}
    const yCmdStart = y - (commande.ville?5:0) - (commande.whatsapp?5:0) - 8;
    doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.setTextColor(50,50,50);
    let yc = yCmdStart + 6;
    doc.text(`Produit : ${commande.produit}`, 110, yc); yc+=5;
    doc.text(`Quantité : ${commande.quantite}`, 110, yc); yc+=5;
    doc.text(`Transport : ${getTransportLabel(commande)}`, 110, yc); yc+=5;
    if(commande.delaiTransit){doc.text(`Délai : ${commande.delaiTransit}`, 110, yc); yc+=5;}
    y = Math.max(y, yc) + 10;
    // Total bien visible
    doc.setFillColor(20,20,20); doc.rect(14, y, W-28, 18, 'F');
    doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(200,200,200);
    doc.text('TOTAL À PAYER', 20, y+7);
    doc.setFontSize(18); doc.setTextColor(pr,pg,pb);
    doc.text(fmt(montantTotal), W-18, y+13, {align:'right'});
    y += 26;
    doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(pr,pg,pb);
    doc.text('DÉTAILS FINANCIERS', 14, y); y += 8;
  }

  // ======================== CONTENU COMMUN (tableau + paiement + pied de page) ========================
  
  // Tableau produit / détails financiers
  const primColor = [pr,pg,pb];
  const secColorArr = [240,240,240];

  if (isLot) {
    const tableData = commandes.map(c => [c.date, c.client, c.ville || '', c.produit, String(c.quantite), fmt(c.prixVente)]);
    const totalLot = commandes.reduce((s,c) => s + (c.prixVente||0), 0);
    doc.autoTable({
      startY: y,
      head: [['Date', 'Client', 'Ville', 'Produit', 'Qté', 'Montant TTC']],
      body: tableData,
      foot: [['', '', '', '', 'TOTAL TTC', fmt(totalLot)]],
      theme: 'striped',
      headStyles: { fillColor: primColor, textColor: [255,255,255], fontStyle: 'bold', fontSize: 9 },
      footStyles: { fillColor: secColorArr, textColor: primColor, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4 }
    });
    y = doc.lastAutoTable.finalY + 10;
  } else {
    const isParticulier = commande.typeClient === 'particulier';
    const isVendeur = commande.typeClient === 'vendeur';
    
    if (isParticulier) {
      // PARTICULIER : on affiche uniquement le total — aucun détail de coût interne
      doc.autoTable({
        startY: y,
        head: [['Désignation', 'Quantité', 'Prix Total (XAF)']],
        body: [[commande.produit, String(commande.quantite), fmt(montantTotal)]],
        foot: [['', 'TOTAL À PAYER', fmt(montantTotal)]],
        theme: 'striped',
        headStyles: { fillColor: primColor, textColor: [255,255,255], fontStyle: 'bold', fontSize: 9 },
        footStyles: { fillColor: secColorArr, textColor: primColor, fontStyle: 'bold', fontSize: 11 },
        columnStyles: { 2: { halign: 'right' } },
        styles: { fontSize: 9, cellPadding: 4 }
      });
      y = doc.lastAutoTable.finalY + 10;
    } else if (isVendeur) {
      // Type revendeur supprimé — traitement identique au particulier (total uniquement)
      doc.autoTable({
        startY: y,
        head: [['Désignation', 'Quantité', 'Prix Total (XAF)']],
        body: [[commande.produit, String(commande.quantite), fmt(montantTotal)]],
        foot: [['', 'TOTAL À PAYER', fmt(montantTotal)]],
        theme: 'striped',
        headStyles: { fillColor: primColor, textColor: [255,255,255], fontStyle: 'bold', fontSize: 9 },
        footStyles: { fillColor: secColorArr, textColor: primColor, fontStyle: 'bold', fontSize: 11 },
        columnStyles: { 2: { halign: 'right' } },
        styles: { fontSize: 9, cellPadding: 4 }
      });
      y = doc.lastAutoTable.finalY + 10;
    } else {
      // PROFESSIONNEL : tableau détaillé — style screenshot (Désignation / Détail / Montant)
      const montantProVisible = (commande.prixVente && commande.prixVente > 0)
        ? commande.prixVente
        : calc.coutTotal;

      const prixProduitSeul = calc.prixProduit;
      const coutTransportAffiche = calc.transport || 0;
      const fraisAnnexesVisibles = s.fraisAnnexesPro !== undefined ? s.fraisAnnexesPro : 2500;
      const fraisService = fraisAnnexesVisibles + (commande.fraisManuels || 0);

      const deviseLabel = commande.devise || 'XAF';
      const prixAchatBrut = commande.prixAchat || 0;
      const detailProduit = `${prixAchatBrut} ${deviseLabel} x ${commande.quantite}`;
      const designationProduit = `${commande.produit} x ${commande.quantite}`;

      const poidsReel = calc.poidsTotal || 0;
      const poidsFact = calc.poidsFact || poidsReel;
      const detailTransport = `Poids ${poidsReel.toFixed(2)} kg (facturé ${poidsFact.toFixed(2)} kg)`;

      let rows = [
        [designationProduit, detailProduit, `${Math.round(prixProduitSeul).toLocaleString('fr-FR')} XAF`],
        ['Transport', detailTransport, `${Math.round(coutTransportAffiche).toLocaleString('fr-FR')} XAF`],
        ['Frais de service', '', `${Math.round(fraisService).toLocaleString('fr-FR')} XAF`],
      ];

      doc.autoTable({
        startY: y,
        head: [['Désignation', 'Détail', 'Montant (XAF)']],
        body: rows,
        foot: [['', 'TOTAL TTC', `${Math.round(montantProVisible).toLocaleString('fr-FR')} XAF`]],
        theme: 'grid',
        headStyles: { fillColor: primColor, textColor: [255,255,255], fontStyle: 'bold', fontSize: 9 },
        footStyles: { fillColor: [255,255,255], textColor: primColor, fontStyle: 'bold', fontSize: 11 },
        columnStyles: {
          0: { fontStyle: 'normal', cellWidth: 55 },
          1: { cellWidth: 'auto' },
          2: { halign: 'right', cellWidth: 40 }
        },
        bodyStyles: { fontSize: 9, textColor: [40,40,40] },
        alternateRowStyles: { fillColor: [250,250,250] },
        styles: { fontSize: 9, cellPadding: 5, lineColor: [220,220,220], lineWidth: 0.3 }
      });
      y = doc.lastAutoTable.finalY + 6;
      // Transport et frais de service affiches pour le client professionnel
    }
  }
  
  // Moyens de paiement
  if (params.afficherPaiement && (s.orangeMoney || s.mtnMoney)) {
    doc.setFillColor(248,248,248); doc.rect(14, y, W - 28, (s.orangeMoney && s.mtnMoney ? 30 : 20), 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(60,60,60);
    doc.text('PAIEMENT SÉCURISÉ', 18, y + 6);
    let py = y + 14;
    if (s.orangeMoney) {
      doc.setFillColor(255,107,0); doc.roundedRect(18, py - 5, 28, 7, 1, 1, 'F');
      doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
      doc.text('ORANGE MONEY', 32, py, {align:'center'});
      doc.setTextColor(30,30,30); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text(s.orangeMoney, 50, py);
      py += 10;
    }
    if (s.mtnMoney) {
      doc.setFillColor(255,200,0); doc.roundedRect(18, py - 5, 28, 7, 1, 1, 'F');
      doc.setTextColor(50,50,50); doc.setFontSize(7); doc.setFont('helvetica', 'bold');
      doc.text('MTN MOMO', 32, py, {align:'center'});
      doc.setTextColor(30,30,30); doc.setFontSize(9); doc.setFont('helvetica', 'bold');
      doc.text(s.mtnMoney, 50, py);
    }
    y += (s.orangeMoney && s.mtnMoney) ? 38 : 28;
  }
  
  // Pied de page
  doc.setDrawColor(200,200,200); doc.setLineWidth(0.3);
  doc.line(14, H - 22, W - 14, H - 22);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(150,150,150);
  const mentionsLines = doc.splitTextToSize(s.mentions || 'Merci pour votre confiance !', W - 28);
  doc.text(mentionsLines, W/2, H - 16, { align: 'center' });
  const clauses = s.clauses || params.clausesNonResponsabilite || '';
  if(clauses){ doc.setFontSize(7); doc.setTextColor(180,180,180); const cl = doc.splitTextToSize('⚖ '+clauses, W-28); doc.text(cl, W/2, H - 9, { align: 'center' }); }
  
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const fileName = `facture_${numFact}.pdf`;
  const a = document.createElement('a');
  a.href = pdfUrl;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(pdfUrl);
  showToast('✅ PDF généré — Style ' + (style==='moderne'||style==='v1'?'Moderne':style==='blocs'||style==='v2'?'Carte/Blocs':'Premium'));
}
  


// ========== MESSAGES WHATSAPP — 5 TYPES ==========
// ORDRE LOGIQUE D'ENVOI :
// 1. Confirmation commande (avec montant à payer AVANT traitement)
// 2. Rappel paiement (si pas encore réglé)
// 3. Arrivée colis (colis disponible)
// 4. Paiement reçu (confirmation règlement)
// 5. Suivi état (mise à jour en cours de route)

// Fonction d'ouverture de lien compatible navigateur ET .exe (Electron/NW.js)
function ouvrirLienExterne(url) {
  if (typeof require !== 'undefined') {
    try { const { shell } = require('electron'); shell.openExternal(url); return; } catch(e) {}
  }
  if (typeof nw !== 'undefined' && nw.Shell) {
    try { nw.Shell.openExternal(url); return; } catch(e) {}
  }
  const win = window.open(url, '_blank');
  if (!win || win.closed || typeof win.closed === 'undefined') {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => showToast('🔗 Lien copié — Collez-le dans WhatsApp Web'));
    } else {
      prompt('Copiez ce lien et ouvrez-le dans WhatsApp Web :', url);
    }
  }
}

// MSG 1 — Confirmation commande (1er message envoyé, demande paiement AVANT traitement)
function detailProWA(c) {
  const calc = calcCommande(c);
  const prixProduit = calc.prixProduit || 0;
  const transport = calc.transport || 0;
  const fraisService = (DB.societe.fraisAnnexesPro !== undefined ? DB.societe.fraisAnnexesPro : 2500) + (c.fraisManuels || 0);
  const total = (c.prixVente && c.prixVente > 0) ? c.prixVente : calc.coutTotal;
  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🛍️ Prix produit    : ${fmt(prixProduit)}\n🚚 Transport       : ${fmt(transport)}\n🔧 Frais de service: ${fmt(fraisService)}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💰 *TOTAL TTC      : ${fmt(total)}*\n━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

function buildMsgConfirmation(c) {
  const calc = calcCommande(c);
  const soc = DB.societe;
  const ref = `REF-${c.id}`;
  const isPro = c.typeClient === 'pro';
  const _fraisConf = isPro
    ? (soc.fraisAnnexesPro  !== undefined ? soc.fraisAnnexesPro  : soc.fraisAnnexes || 2500)
    : (soc.fraisAnnexesPart !== undefined ? soc.fraisAnnexesPart : 2500);
  const montantPro = calc.prixProduit + _fraisConf;
  const montant = isPro
    ? ((c.prixVente && c.prixVente > 0) ? c.prixVente : montantPro)
    : (c.prixVente || calc.coutTotal);
  if (isPro) {
    return `🎉 Bonjour ${c.client},\nVotre commande a bien été enregistrée.\n\n📦 Référence : ${ref}\n🛒 Produit    : ${c.produit} (x${c.quantite})\n⏳ Délai      : ${c.delaiTransit || (c.poidsSousType==='bateau_45'?'45 jours':c.poidsSousType==='express_7'?'7 jours':'14 jours')}\n\n${detailProWA(c)}\n\n💳 *Paiement requis avant traitement*\nRéglez via :\n${soc.orangeMoney?'🟠 Orange Money : '+soc.orangeMoney+'\n':''}${soc.mtnMoney?'🟡 MTN Money    : '+soc.mtnMoney+'\n':''}Envoyez-nous la capture après paiement.\n\nMerci 🙏\n${soc.nom} — 📞 ${soc.tel||'+237 6 00 00 00 00'}`;
  }
  // PARTICULIER : uniquement le montant total, circuit logistique visible
  const circuitLabel = c.modeRecuperation === 'livraison_payante' ? 'Livraison à domicile' : 'Retrait chez nous';
  return `🎉 Bonjour ${c.client},\nVotre commande a bien été enregistrée.\n\n-----------------------------------\n📦 Référence   : ${ref}\n🛍️ Produit      : ${c.produit}\n🔢 Quantité    : ${c.quantite}\n💰 *Montant total : ${fmt(montant)}*\n🚚 Récupération : ${circuitLabel}\n-----------------------------------\n\n💳 *IMPORTANT — Paiement requis avant traitement*\nVotre commande ne sera traitée qu'après réception de votre paiement.\n\nRéglez via :\n${soc.orangeMoney?'🟠 Orange Money : '+soc.orangeMoney+'\n':''}${soc.mtnMoney?'🟡 MTN Money    : '+soc.mtnMoney+'\n':''}Après paiement, envoyez-nous la capture d'écran.\n\nMerci 🙏\n${soc.nom} — 📞 ${soc.tel||'+237 6 00 00 00 00'}`;
}

// MSG 2 — Rappel paiement (si le client tarde à payer)
function buildMsgRappelPaiement(c) {
  const calc = calcCommande(c);
  const soc = DB.societe;
  const ref = `REF-${c.id}`;
  const isPro = c.typeClient === 'pro';
  const _frais = isPro
    ? (soc.fraisAnnexesPro !== undefined ? soc.fraisAnnexesPro : soc.fraisAnnexes || 2500)
    : (soc.fraisAnnexesPart !== undefined ? soc.fraisAnnexesPart : 2500);
  const montant = isPro
    ? ((c.prixVente && c.prixVente > 0) ? c.prixVente : calc.prixProduit + _frais)
    : (c.prixVente || calc.coutTotal);
  if (isPro) {
    return `\u23f0 Rappel paiement \u2014 ${ref}\n\nBonjour ${c.client},\n\nVotre commande *${c.produit}* est toujours en attente de r\u00e8glement.\n\n${detailProWA(c)}\n\n\u26a0\ufe0f *Votre commande ne sera trait\u00e9e qu\u2019apr\u00e8s r\u00e9ception du paiement.*\n\nR\u00e9glez via :\n${soc.orangeMoney?'\ud83d\udfe0 Orange Money : '+soc.orangeMoney+'\n':''}${soc.mtnMoney?'\ud83d\udfe1 MTN Money    : '+soc.mtnMoney+'\n':''}Envoyez-nous la capture apr\u00e8s paiement.\n\nMerci \ud83d\ude4f\n${soc.nom} \u2014 \ud83d\udcde ${soc.tel||'+237 6 00 00 00 00'}`;
  }
  return `\u23f0 Rappel paiement \u2014 ${ref}\n\nBonjour ${c.client},\n\nVotre commande *${c.produit}* est en attente de r\u00e8glement.\n\n\ud83d\udcb0 *Montant \u00e0 payer : ${fmt(montant)}*\n\n\u26a0\ufe0f *Votre commande ne sera trait\u00e9e qu\u2019apr\u00e8s r\u00e9ception du paiement.*\n\nR\u00e9glez via :\n${soc.orangeMoney?'\ud83d\udfe0 Orange Money : '+soc.orangeMoney+'\n':''}${soc.mtnMoney?'\ud83d\udfe1 MTN Money    : '+soc.mtnMoney+'\n':''}Envoyez-nous la capture apr\u00e8s paiement.\n\nMerci \ud83d\ude4f\n${soc.nom} \u2014 \ud83d\udcde ${soc.tel||'+237 6 00 00 00 00'}`;
}

// MSG 3 — Arriv\u00e9e colis (colis disponible \u2014 diff\u00e9renci\u00e9 PRO / particulier)
function buildMsgArrivee(c) {
  const calc = calcCommande(c);
  const soc = DB.societe;
  const ref = `REF-${c.id}`;
  const today = new Date().toLocaleDateString('fr-FR');
  const isPro = c.typeClient === 'pro';
  if (isPro) {
    return `\ud83d\udce6 VOTRE COLIS EST ARRIV\u00c9 !\n\nBonjour ${c.client},\n\nVotre commande ${ref} est disponible chez le transitaire.\n\n\ud83d\udce6 Produit  : ${c.produit} (x${c.quantite})\n\ud83d\udccd Ville     : ${c.ville||'Yaound\u00e9'}\n\ud83d\udcc5 Date      : ${today}\n\n${detailProWA(c)}\n\n\ud83d\udd14 R\u00c9CUP\u00c9RATION DIRECTE\nVous serez notifi\u00e9 par le transitaire pour le retrait. Pr\u00e9sentez-vous avec votre pi\u00e8ce d\u2019identit\u00e9.\n\nMerci \ud83d\ude4f\n${soc.nom} \u2014 \ud83d\udcde ${soc.tel||'+237 6 00 00 00 00'}`;
  }
  const circuitLabel = c.modeRecuperation === 'livraison_payante'
    ? `\ud83d\ude9a *LIVRAISON \u00c0 DOMICILE*\nNous allons vous contacter pour organiser la livraison.`
    : `\ud83d\udccd *RETRAIT CHEZ NOUS*\nVenez r\u00e9cup\u00e9rer votre commande \u00e0 notre adresse : ${soc.adresse || 'contactez-nous pour l\'adresse'}`;
  return `\ud83c\udf89 Bonne nouvelle, votre colis est arriv\u00e9 !\n\nBonjour ${c.client},\n\nVotre commande ${ref} est disponible.\n\n\ud83d\udce6 Produit  : ${c.produit}\n\ud83d\udd22 Quantit\u00e9 : ${c.quantite}\n\ud83d\udccd Ville     : ${c.ville||'Yaound\u00e9'}\n\ud83d\udcc5 Date      : ${today}\n\n${circuitLabel}\n\nMerci \ud83d\ude4f\n${soc.nom} \u2014 \ud83d\udcde ${soc.tel||'+237 6 00 00 00 00'}`;
}

// MSG 4 — Confirmation paiement re\u00e7u
function buildMsgConfirmationPaiement(c) {
  const calc = calcCommande(c);
  const soc = DB.societe;
  const isPro = c.typeClient === 'pro';
  const _frais = isPro
    ? (soc.fraisAnnexesPro !== undefined ? soc.fraisAnnexesPro : soc.fraisAnnexes || 2500)
    : (soc.fraisAnnexesPart !== undefined ? soc.fraisAnnexesPart : 2500);
  const montant = isPro
    ? ((c.prixVente && c.prixVente > 0) ? c.prixVente : calc.prixProduit + _frais)
    : (c.prixVente || calc.coutTotal);
  if (isPro) {
    return `\u2705 Paiement confirm\u00e9 !\n\nMerci ${c.client},\nVotre paiement a bien \u00e9t\u00e9 re\u00e7u.\n\n${detailProWA(c)}\n\n\u2705 Votre commande est maintenant en cours de traitement.\nNous vous tiendrons inform\u00e9 \u00e0 chaque \u00e9tape.\n\nMerci \ud83d\ude4f\n${soc.nom} \u2014 \ud83d\udcde ${soc.tel||'+237 6 00 00 00 00'}`;
  }
  return `\u2705 Paiement confirm\u00e9 !\n\nMerci ${c.client},\nVotre paiement de *${fmt(montant)}* a bien \u00e9t\u00e9 re\u00e7u.\n\n\u2705 Votre commande est maintenant en cours de traitement.\nNous vous tiendrons inform\u00e9 \u00e0 chaque \u00e9tape.\n\nMerci \ud83d\ude4f\n${soc.nom} \u2014 \ud83d\udcde ${soc.tel||'+237 6 00 00 00 00'}`;
}

// MSG 5 — Suivi \u00e9tat
function buildMsgSuivi(c) {
  const soc = DB.societe;
  const ref = `REF-${c.id}`;
  const etats = c.statut === 'livre'
    ? ['\u2705 Commande valid\u00e9e','\u2705 Paiement re\u00e7u','\u2705 Achat fournisseur','\u2705 En transit','\u2705 Arriv\u00e9e au Cameroun','\u2705 Disponible']
    : ['\u2705 Commande valid\u00e9e','\u2705 Paiement re\u00e7u','\u2705 Achat fournisseur','\u23f3 En transit','\u23f3 Arriv\u00e9e au Cameroun','\u23f3 Disponible'];
  return `\ud83d\udd04 Suivi commande \u2014 ${ref}\n\nBonjour ${c.client},\n\n\u26a1 \u00c9TAT ACTUEL\n${etats.join('\n')}\n\nNous vous informerons d\u00e8s la prochaine \u00e9tape.\n\nMerci \ud83d\ude4f\n${soc.nom} \u2014 \ud83d\udcde ${soc.tel||'+237 6 00 00 00 00'}`;
}

function buildMsgDevis(c) { return buildMsgConfirmation(c); }

function ouvrirMenuWhatsApp(id) {
  const c = DB.commandes.find(x => x.id === id);
  if (!c) return;
  if (!c.whatsapp) {
    const n = prompt('Numéro WhatsApp du client (ex: +237612345678) :', '');
    if (!n) return;
    c.whatsapp = n.trim(); save();
  }
  const msgs = [
    { label: '1. Confirmation', short: 'Commande + paiement', fn: buildMsgConfirmation, color: '#075e54' },
    { label: '2. Rappel paiement', short: 'Rappel de règlement', fn: buildMsgRappelPaiement, color: '#d97706' },
    { label: '3. Arrivée colis', short: 'Colis disponible', fn: buildMsgArrivee, color: '#16a34a' },
    { label: '4. Paiement reçu', short: 'Confirmation paiement', fn: buildMsgConfirmationPaiement, color: '#7c3aed' },
    { label: '5. Suivi état', short: 'Mise à jour état', fn: buildMsgSuivi, color: '#1a56db' },
  ];
  let activeIdx = 0;
  function renderWA(idx) {
    const m = msgs[idx];
    const msgText = m.fn(c);
    const now = new Date().toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'});
    const tabs = msgs.map((t, i) => 
      `<span style="padding:6px 12px;border-radius:20px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid ${i===idx?'#25D366':'var(--border)'};background:${i===idx?'#25D366':'var(--card)'};color:${i===idx?'white':'var(--text2)'};transition:all 0.15s;" onclick="document.getElementById('wa-rendered').innerHTML=renderWAContent(${i});activeWAIdx=${i};">${t.label}</span>`
    ).join('');
    return `
      <div style="margin-bottom:16px;overflow-x:auto;display:flex;gap:6px;flex-wrap:wrap;">${tabs}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;">
        <div>
          <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);margin-bottom:10px;">Aperçu WhatsApp</div>
          <div style="background:#075e54;border-radius:14px 14px 0 0;padding:12px 16px;display:flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;background:#25D366;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">🏪</div>
            <div>
              <div style="color:white;font-weight:700;font-size:13px;">${DB.societe.nom || 'MG IMPORT'}</div>
              <div style="color:rgba(255,255,255,0.6);font-size:10px;">en ligne</div>
            </div>
          </div>
          <div style="background:#e5ddd5;padding:12px;border-radius:0 0 14px 14px;min-height:140px;">
            <div style="background:white;border-radius:0 10px 10px 10px;padding:10px 14px;font-size:11px;line-height:1.7;color:#333;white-space:pre-wrap;max-width:100%;box-shadow:0 1px 2px rgba(0,0,0,0.08);">${msgText.replace(/</g,'&lt;')}</div>
            <div style="font-size:10px;color:#888;text-align:right;margin-top:4px;">${now} ✓✓</div>
          </div>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);margin-bottom:10px;">Message brut</div>
          <textarea style="width:100%;height:220px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px;font-size:11px;line-height:1.6;color:var(--text);resize:vertical;font-family:var(--font-mono);" id="wa-edit-${idx}">${msgText}</textarea>
          <button onclick="envoyerWAMsgCustom(${id}, ${idx})" style="width:100%;margin-top:8px;padding:11px;background:#25D366;color:white;border:none;border-radius:8px;font-weight:700;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">📤 Envoyer ce message</button>
        </div>
      </div>`;
  }
  window.renderWAContent = renderWA;
  window.activeWAIdx = activeIdx;
  let html = `<div class="modal-title" style="font-size:28px;">💬 Messages <span style="color:#25D366">WhatsApp</span></div>
    <div style="margin-bottom:20px;padding:12px 16px;background:var(--bg3);border-radius:8px;font-size:13px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <span>👤 <strong>${c.client}</strong></span>
      <span style="color:var(--text3)">·</span>
      <span>📦 ${c.produit} (${c.quantite})</span>
      <span style="color:var(--text3)">·</span>
      <span style="color:#25D366;font-family:var(--font-mono);">${c.whatsapp}</span>
    </div>
    <div id="wa-rendered">${renderWA(0)}</div>
    <button class="btn btn-ghost" style="margin-top:16px;width:100%;" onclick="closeModal()">✕ Fermer</button>`;
  document.getElementById('modal-content').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('open');
}

function envoyerWAMsg(id, typeIdx) {
  const c = DB.commandes.find(x => x.id === id);
  if (!c || !c.whatsapp) { showToast('Numéro WhatsApp manquant'); return; }
  const fns = [buildMsgConfirmation, buildMsgRappelPaiement, buildMsgArrivee, buildMsgConfirmationPaiement, buildMsgSuivi];
  const msg = fns[typeIdx](c);
  ouvrirLienExterne(`https://wa.me/${c.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`);
  closeModal();
  showToast('✅ Message WhatsApp ouvert');
}
function envoyerWAMsgCustom(id, typeIdx) {
  const c = DB.commandes.find(x => x.id === id);
  if (!c || !c.whatsapp) { showToast('Numéro WhatsApp manquant'); return; }
  const editEl = document.getElementById('wa-edit-' + typeIdx);
  const msg = editEl ? editEl.value : (() => { const fns=[buildMsgConfirmation,buildMsgRappelPaiement,buildMsgArrivee,buildMsgConfirmationPaiement,buildMsgSuivi]; return fns[typeIdx](c); })();
  ouvrirLienExterne(`https://wa.me/${c.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`);
  closeModal();
  showToast('✅ Message WhatsApp envoyé');
}

function envoyerWhatsAppDevis(id) { ouvrirMenuWhatsApp(id); }
function envoyerAlerteArrivee(id) {
  const c = DB.commandes.find(x => x.id === id);
  if (!c) return;
  if (!c.whatsapp) { ouvrirMenuWhatsApp(id); return; }
  const msg = buildMsgArrivee(c);
  ouvrirLienExterne(`https://wa.me/${c.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`);
  showToast('📦 Notification arrivée envoyée');
}
function envoyerWhatsAppManuel(id) { ouvrirMenuWhatsApp(id); }

function validerCommandeClient(id) {
  const c = DB.commandes.find(x => x.id === id);
  if (!c) return;
  c.statut = 'en_attente';
  c.commandeValidee = true;
  c.paiementStatut = 'payé';
  c.dateValidation = new Date().toISOString().split('T')[0];
  save();
  closeModal();
  renderCommandes();
  renderDashboard();
  showToast('✅ Paiement validé');
  if (c.whatsapp) {
    const soc = DB.societe;
    const msg = `Bonjour ${c.client},\n\n✅ Paiement reçu pour votre commande ${c.produit}.\n\nNous vous tiendrons informé de l'arrivée.\n\n— ${soc.nom}`;
    if (confirm('Envoyer confirmation de paiement par WhatsApp ?')) {
      ouvrirLienExterne(`https://wa.me/${c.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`);
    }
  }
}

// ========== OPTIMISATION ==========
function espaceDispo(c) {
  if (c.transportMode === 'cbm') {
    const vol = getVolumeTotal(c);
    const seuil = DB.params.cbmMinVolume || 0.02;
    if (vol >= seuil) return { type: 'cbm', libre: 0, econMax: 0 };
    const libre = parseFloat((seuil - vol).toFixed(5));
    return { type: 'cbm', libre, econMax: Math.round(libre * DB.params.cbmTarifM3) };
  }
  const pTotal = getPoidsTotal(c);
  const pFact  = poidsFacture(pTotal);
  const libre  = parseFloat((pFact - pTotal).toFixed(3));
  const sousType = c.poidsSousType || 'normal';
  if (libre <= 0.001) return { type: 'poids', libre: 0, econMax: 0, pFact };
  return { type: 'poids', libre, pFact, sousType, econMax: coutTransportPoids(libre, sousType) };
}

function calcOpportunite(cmdId, poids, prixAchat, prixRevente, mode) {
  const c = DB.commandes.find(x => x.id === cmdId);
  if (!c || !poids) return null;
  const sousType = c.poidsSousType || 'normal';
  let transCout = 0;
  if (mode === 'demi') transCout = Math.round(coutTransportPoids(poids, sousType) / 2);
  else if (mode === 'plein') transCout = coutTransportPoids(poids, sousType);
  const coutTotal = prixAchat + transCout + DB.params.fraisBase;
  const benef = prixRevente > 0 ? prixRevente - coutTotal : -coutTotal;
  return { transCout, coutTotal, benef, rentabilite: prixRevente > 0 ? (benef / prixRevente) * 100 : null };
}

function updateOpportunitePreview(uid, cmdId, mode, poidsMax) {
  const poidsEl  = document.getElementById(uid + '_poids');
  const prixEl   = document.getElementById(uid + '_prix');
  const venteEl  = document.getElementById(uid + '_vente');
  const prevEl   = document.getElementById(uid + '_preview');
  const btnEl    = document.getElementById(uid + '_btn');
  if (!poidsEl || !prevEl) return;

  const poids      = parseFloat(poidsEl.value) || 0;
  const prixAchat  = parseFloat(prixEl?.value)  || 0;
  const prixRevente= parseFloat(venteEl?.value) || 0;

  if (mode === 'gratuit' && poidsMax > 0 && poids > poidsMax + 0.001) {
    const cDep = DB.commandes.find(x => x.id === cmdId);
    if (!cDep) return;
    const stDep = cDep.poidsSousType || 'normal';
    const poidsExces = parseFloat((poids - poidsMax).toFixed(3));
    const poidsClient = getPoidsTotal(cDep);
    const transportClient = coutTransportPoids(poidsClient, stDep);
    const poidsGroupe = poidsClient + poids;
    const transportGroupe = coutTransportPoids(poidsGroupe, stDep);
    const surCout = transportGroupe - transportClient;
    const coutTotalReel = prixAchat + surCout + DB.params.fraisBase;
    const benefReel = prixRevente > 0 ? prixRevente - coutTotalReel : -coutTotalReel;
    const rentDep = prixRevente > 0 ? (benefReel / prixRevente * 100) : null;
    const benefStrDep = benefReel >= 0
      ? `Bénéfice <b style="color:var(--green)">${fmt(benefReel)}</b>`
      : `Perte <b style="color:var(--red)">${fmt(benefReel)}</b>`;
    const rentStrDep = rentDep !== null
      ? ` · Rentabilité <b style="color:${rentDep >= 20 ? 'var(--green)' : rentDep >= 0 ? 'var(--gold)' : 'var(--red)'}">${rentDep.toFixed(1)}%</b>`
      : '';

    prevEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:8px;">
        <div style="background:rgba(251,146,60,0.12);border-left:3px solid var(--orange);border-radius:0 6px 6px 0;padding:10px 14px;display:flex;flex-direction:column;gap:4px;">
          <div style="color:var(--orange);font-weight:700;font-size:13px;">
            ⚠️ +${poidsExces} kg dépasse la tranche gratuite
          </div>
          <div style="font-size:12px;color:var(--text2);line-height:1.7;">
            Client : <b>${poidsClient.toFixed(3)} kg</b> → facturé <b>${fmt(transportClient)}</b>
            &nbsp;+&nbsp; toi : <b>${poids} kg</b> → total <b>${poidsGroupe.toFixed(3)} kg</b> → facturé <b>${fmt(transportGroupe)}</b><br>
            Tu paieras la différence : <b style="color:var(--orange);font-size:14px;">${fmt(surCout)}</b>
            ${surCout === 0 ? '<span style="color:var(--green)"> (même tranche — encore gratuit !)</span>' : ''}
          </div>
        </div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px;align-items:center;padding:2px 4px;">
          <span>💸 Coût total : <b>${fmt(coutTotalReel)}</b></span>
          <span>${benefStrDep}${rentStrDep}</span>
          ${prixRevente === 0 ? '<span style="color:var(--text3);font-style:italic;">Remplis le prix de revente pour voir si ça vaut le coup</span>' : ''}
        </div>
      </div>`;
    if (btnEl) { btnEl.disabled = false; btnEl.style.opacity = '1'; }
    return;
  }
  if (btnEl) { btnEl.disabled = false; btnEl.style.opacity = '1'; }

  if (!poids) { prevEl.innerHTML = '<span style="color:var(--text3)">Saisis le poids pour voir la simulation</span>'; return; }

  const calc = calcOpportunite(cmdId, poids, prixAchat, prixRevente, mode);
  if (!calc) return;

  const rentColor = calc.rentabilite === null ? 'var(--text3)' : calc.rentabilite >= 20 ? 'var(--green)' : calc.rentabilite >= 0 ? 'var(--gold)' : 'var(--red)';
  const rentLabel = calc.rentabilite !== null ? ` · Rentabilité <b style="color:${rentColor}">${calc.rentabilite.toFixed(1)}%</b>` : '';
  const benefLabel = calc.benef >= 0
    ? `Bénéfice <b style="color:var(--green)">${fmt(calc.benef)}</b>`
    : `Perte <b style="color:var(--red)">${fmt(calc.benef)}</b>`;
  const transLabel = mode === 'gratuit' ? '<b style="color:var(--green)">0 XAF</b> (tranche gratuite)' : `<b>${fmt(calc.transCout)}</b>`;

  prevEl.innerHTML = `
    <div style="display:flex;gap:20px;flex-wrap:wrap;font-size:12px;align-items:center;">
      <span>🚚 Transport : ${transLabel}</span>
      <span>💸 Coût total : <b>${fmt(calc.coutTotal)}</b></span>
      <span>${benefLabel}${rentLabel}</span>
      ${calc.benef < 0 && prixRevente === 0 ? '<span style="color:var(--text3);font-style:italic;">Usage perso sans revente</span>' : ''}
    </div>`;
}

function renderOptimisation() {
  const attente = DB.commandes.filter(c => c.statut === 'en_attente' && !c.opportuniteActivee);
  const all     = DB.commandes.filter(c => c.statut !== 'annule');
  const pertes  = all.filter(c => c.benefice < 0);

  let nbGratuits = 0, nbDemi = 0, kgLibreTotal = 0;
  attente.forEach(c => {
    const e = espaceDispo(c);
    if (e.libre >= 0.05) nbGratuits++;
    if (c.transportMode === 'poids' && getPoidsTotal(c) >= 0.5) nbDemi++;
    if (e.type === 'poids') kgLibreTotal += e.libre;
  });

  document.getElementById('optim-cards').innerHTML = `
    <div class="optim-card" style="border-top-color:var(--gold);">
      <div class="optim-icon">🎁</div>
      <div class="optim-title" style="color:var(--gold)">${nbGratuits} espace(s) gratuit(s)</div>
      <div class="optim-desc">${kgLibreTotal.toFixed(2)} kg dans tranches déjà payées par tes clients</div>
    </div>
    <div class="optim-card" style="border-top-color:#818cf8;">
      <div class="optim-icon">½</div>
      <div class="optim-title" style="color:#818cf8">${nbDemi} demi-tarif possible(s)</div>
      <div class="optim-desc">Rajoute un article perso à 50% du transport normal</div>
    </div>
    <div class="optim-card" style="border-top-color:${pertes.length ? 'var(--red)' : 'var(--green)'};">
      <div class="optim-icon">${pertes.length ? '🔴' : '✅'}</div>
      <div class="optim-title">${pertes.length} commande(s) en perte</div>
      <div class="optim-desc">${pertes.length ? 'Ajuste le prix de vente' : 'Toutes les commandes sont rentables'}</div>
    </div>`;

  const cards = [];

  attente.forEach(c => {
    const e = espaceDispo(c);
    if (e.libre < (e.type === 'poids' ? 0.05 : 0.001)) return;

    const uid        = 'op_g_' + c.id;
    const libreKg    = e.type === 'poids' ? e.libre.toFixed(3) : e.libre.toFixed(5);
    const unite      = e.type === 'poids' ? 'kg' : 'm³';
    const poidsMax   = e.libre;
    const sousType   = c.poidsSousType || 'normal';
    const econTrans  = e.type === 'poids' ? coutTransportPoids(e.libre, sousType) : e.econMax;
    const prodEscape = c.produit.replace(/'/g, "\\'").replace(/"/g, '&quot;');

    cards.push(`
      <div class="optim-action-card" id="${uid}" style="border-left:4px solid var(--gold);">
        <div class="oac-header">
          <div class="oac-badge" style="background:rgba(212,168,39,0.15);color:var(--gold);">🎁 GRATUIT</div>
          <div class="oac-title"><b>${c.client}</b> — ${c.produit}</div>
          <div class="oac-pill" style="background:rgba(212,168,39,0.12);color:var(--gold);">
            ${libreKg} ${unite} libre · transport économisé ≈ ${fmt(econTrans)}
          </div>
        </div>
        <div class="oac-body">
          <div style="font-size:12px;color:var(--text2);background:var(--bg3);border-radius:6px;padding:8px 12px;">
            Poids réel client : <b>${getPoidsTotal(c).toFixed(3)} kg</b>
            &nbsp;·&nbsp; Tranche facturée : <b>${(e.pFact||0).toFixed(2)} kg</b>
            &nbsp;·&nbsp; Marge disponible : <b style="color:var(--gold)">${libreKg} ${unite}</b>
            &nbsp;·&nbsp; Tu peux ajouter jusqu'à <b>${libreKg} ${unite}</b> sans payer un centime de transport
          </div>
          <div class="oac-field-row">
            <div class="oac-field" style="min-width:180px;flex:2;">
              <label>Produit (même fournisseur recommandé)</label>
              <div class="oac-input-group">
                <input type="text" id="${uid}_prod" class="form-input" value="${c.produit}" style="flex:1;" oninput="updateOpportunitePreview('${uid}',${c.id},'gratuit',${poidsMax})">
                <button class="btn btn-ghost btn-sm" title="Réinitialiser au produit client" onclick="document.getElementById('${uid}_prod').value='${prodEscape}'; updateOpportunitePreview('${uid}',${c.id},'gratuit',${poidsMax})">↺</button>
              </div>
            </div>
            <div class="oac-field" style="max-width:110px;">
              <label>Poids (${unite}) ≤ ${libreKg}</label>
              <input type="number" id="${uid}_poids" class="form-input" value="${libreKg}" step="0.001" min="0.001" max="${libreKg}"
                oninput="updateOpportunitePreview('${uid}',${c.id},'gratuit',${poidsMax})">
            </div>
            <div class="oac-field" style="max-width:130px;">
              <label>Prix achat (XAF)</label>
              <input type="number" id="${uid}_prix" class="form-input" placeholder="0"
                oninput="updateOpportunitePreview('${uid}',${c.id},'gratuit',${poidsMax})">
            </div>
            <div class="oac-field" style="max-width:130px;">
              <label>Prix revente (XAF)</label>
              <input type="number" id="${uid}_vente" class="form-input" placeholder="Usage perso"
                oninput="updateOpportunitePreview('${uid}',${c.id},'gratuit',${poidsMax})">
            </div>
          </div>
          <div class="oac-preview" id="${uid}_preview">
            <span style="color:var(--text3);font-size:12px;">Saisis le poids pour voir la simulation</span>
          </div>
          <div class="oac-footer">
            <span class="oac-note">🔒 Invisible sur la facture de ${c.client} · Transport : 0 XAF</span>
            <button class="btn btn-red btn-sm" id="${uid}_btn" onclick="validerOpportunite('${uid}',${c.id},'gratuit',${poidsMax})">✅ Adhérer à cette opportunité</button>
          </div>
        </div>
      </div>`);

    setTimeout(() => updateOpportunitePreview(uid, c.id, 'gratuit', poidsMax), 0);
  });

  attente.filter(c => c.transportMode === 'poids' && getPoidsTotal(c) >= 0.5).forEach(c => {
    const e = espaceDispo(c);
    if (e.type === 'poids' && e.libre >= 0.05) return;

    const uid      = 'op_d_' + c.id;
    const sousType = c.poidsSousType || 'normal';
    const pSuggere = 0.5;
    const tarifRef = coutTransportPoids(pSuggere, sousType);
    const demiRef  = Math.round(tarifRef / 2);
    const prodEscape = c.produit.replace(/'/g, "\\'").replace(/"/g, '&quot;');

    cards.push(`
      <div class="optim-action-card" id="${uid}" style="border-left:4px solid #818cf8;">
        <div class="oac-header">
          <div class="oac-badge" style="background:rgba(99,102,241,0.12);color:#818cf8;">½ DEMI-TARIF</div>
          <div class="oac-title"><b>${c.client}</b> — ${c.produit} <span style="font-size:12px;color:var(--text3)">(${getPoidsTotal(c).toFixed(2)} kg)</span></div>
          <div class="oac-pill" style="background:rgba(99,102,241,0.1);color:#818cf8;">
            Ex : 0.5 kg → ${fmt(demiRef)} au lieu de ${fmt(tarifRef)}
          </div>
        </div>
        <div class="oac-body">
          <div style="font-size:12px;color:var(--text2);background:var(--bg3);border-radius:6px;padding:8px 12px;">
            La commande de <b>${c.client}</b> pèse <b>${getPoidsTotal(c).toFixed(2)} kg</b>.
            Tu peux y ajouter un article personnel en payant <b>50% du tarif de transport</b> normal.
            Plus ton article est léger, plus l'économie est grande.
          </div>
          <div class="oac-field-row">
            <div class="oac-field" style="min-width:180px;flex:2;">
              <label>Produit (même fournisseur recommandé)</label>
              <div class="oac-input-group">
                <input type="text" id="${uid}_prod" class="form-input" value="${c.produit}" style="flex:1;" oninput="updateOpportunitePreview('${uid}',${c.id},'demi',0)">
                <button class="btn btn-ghost btn-sm" title="Réinitialiser" onclick="document.getElementById('${uid}_prod').value='${prodEscape}'; updateOpportunitePreview('${uid}',${c.id},'demi',0)">↺</button>
              </div>
            </div>
            <div class="oac-field" style="max-width:110px;">
              <label>Poids (kg)</label>
              <input type="number" id="${uid}_poids" class="form-input" value="${pSuggere}" step="0.1" min="0.1"
                oninput="updateOpportunitePreview('${uid}',${c.id},'demi',0)">
            </div>
            <div class="oac-field" style="max-width:130px;">
              <label>Prix achat (XAF)</label>
              <input type="number" id="${uid}_prix" class="form-input" placeholder="0"
                oninput="updateOpportunitePreview('${uid}',${c.id},'demi',0)">
            </div>
            <div class="oac-field" style="max-width:130px;">
              <label>Prix revente (XAF)</label>
              <input type="number" id="${uid}_vente" class="form-input" placeholder="Usage perso"
                oninput="updateOpportunitePreview('${uid}',${c.id},'demi',0)">
            </div>
          </div>
          <div class="oac-preview" id="${uid}_preview">
            <span style="color:var(--text3);font-size:12px;">Modifie le poids pour voir la simulation</span>
          </div>
          <div class="oac-footer">
            <span class="oac-note">🔒 Invisible sur la facture de ${c.client}</span>
            <button class="btn btn-red btn-sm" id="${uid}_btn" onclick="validerOpportunite('${uid}',${c.id},'demi',0)">✅ Adhérer à cette opportunité</button>
          </div>
        </div>
      </div>`);

    setTimeout(() => updateOpportunitePreview(uid, c.id, 'demi', 0), 0);
  });

  if (pertes.length) {
    cards.push(`<div class="reco-box reco-bad" style="margin:0;">🔴 ${pertes.length} commande(s) en perte — Ouvre la commande et ajuste le prix de vente</div>`);
  }

  const totalBenefPerso = DB.opportunites.reduce((s,o) => s + (o.beneficePerso||0), 0);
  const histoHtml = DB.opportunites.length ? `
    <div style="margin-top:8px;background:var(--card);border:1px solid var(--border);border-radius:10px;overflow:hidden;">
      <div class="table-header">
        <div class="table-title">📋 Opportunités activées (${DB.opportunites.length}) · Bénéfice perso total : <span style="color:var(--gold)">${fmt(totalBenefPerso)}</span></div>
        <button class="btn btn-ghost btn-sm" onclick="if(confirm('Effacer tout l\'historique ?')){DB.opportunites=[];DB.commandes.forEach(c=>{delete c.opportuniteActivee;delete c.beneficePerso;});save();renderOptimisation();}">🗑 Effacer</button>
      </div>
      <div style="padding:12px 16px;display:flex;flex-direction:column;gap:8px;">
        ${DB.opportunites.slice().reverse().map(o => {
          const bStr = o.beneficePerso > 0
            ? '<span style="color:var(--green);font-weight:700">+' + fmt(o.beneficePerso) + '</span>'
            : '<span style="color:var(--text3)">Usage perso — coût : ' + fmt(o.prixAchat) + '</span>';
          const modeStr = o.mode === 'gratuit' ? '🎁 Gratuit' : o.mode === 'supplement' ? '⚡ Surcoût' : '½ Demi-tarif';
          return '<div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;background:var(--bg3);border-radius:8px;padding:10px 14px;font-size:12px;">'
            + '<div style="display:flex;flex-direction:column;gap:2px;">'
            + '<span style="font-weight:600;">' + o.produit + ' <span style="color:var(--text3);font-weight:400;">→ ' + o.client + '</span></span>'
            + '<span style="color:var(--text3);">' + o.date + ' · ' + o.poids + ' kg · ' + modeStr + ' · Transport : ' + fmt(o.transportCout) + '</span>'
            + '</div>'
            + '<div style="display:flex;align-items:center;gap:12px;">'
            + (o.usagePerso ? '' : '<span>Revente : <b>' + fmt(o.prixRevente) + '</b></span>')
            + '<span>' + bStr + '</span>'
            + '<button class="btn btn-ghost btn-sm" style="padding:4px 8px;" onclick="supprimerOpportunite(' + o.id + ')">✕</button>'
            + '</div>'
            + '</div>';
        }).join('')}
      </div>
    </div>` : '';

  document.getElementById('optim-body').innerHTML = (cards.length
    ? '<div style="display:flex;flex-direction:column;gap:16px;padding:16px;">' + cards.join('') + '</div>'
    : '<div class="empty-state"><div class="empty-icon">✅</div><div class="empty-text">Aucune opportunité disponible</div></div>')
    + histoHtml;
}

function supprimerOpportunite(id) {
  const opp = DB.opportunites.find(o => o.id === id);
  if (!opp) return;
  const c = DB.commandes.find(x => x.id === opp.cmdId);
  if (c) { delete c.opportuniteActivee; delete c.beneficePerso; }
  DB.opportunites = DB.opportunites.filter(o => o.id !== id);
  save();
  renderOptimisation();
  showToast('Opportunité retirée');
}

function validerOpportunite(uid, cmdId, mode, poidsMax) {
  const c = DB.commandes.find(x => x.id === cmdId); if (!c) return;
  const produit = document.getElementById(uid + '_prod')?.value.trim();
  if (!produit) { showToast('Saisis le nom du produit', 'err'); return; }
  const poids  = parseFloat(document.getElementById(uid + '_poids')?.value) || 0;
  const prix   = parseFloat(document.getElementById(uid + '_prix')?.value)  || 0;
  const vente  = parseFloat(document.getElementById(uid + '_vente')?.value) || 0;
  if (!poids) { showToast('Poids invalide', 'err'); return; }
  const sousType = c.poidsSousType || 'normal';

  let transCout = 0;
  let modeLabel = '';
  if (mode === 'gratuit') {
    if (poids <= poidsMax + 0.001) {
      transCout = 0;
      modeLabel = '0 XAF — dans la tranche gratuite ✨';
    } else {
      const poidsClient = getPoidsTotal(c);
      const transportClient = coutTransportPoids(poidsClient, sousType);
      const transportGroupe = coutTransportPoids(poidsClient + poids, sousType);
      transCout = transportGroupe - transportClient;
      modeLabel = fmt(transCout) + ' (supplément de palier)';
    }
  } else if (mode === 'demi') {
    transCout = Math.round(coutTransportPoids(poids, sousType) / 2);
    modeLabel = fmt(transCout) + ' (50% du tarif normal)';
  }

  const partage = mode === 'gratuit' ? (poids <= poidsMax + 0.001 ? 'gratuit' : 'supplement') : 'moitie';
  const beneficePerso = vente > 0 ? vente - (prix + transCout) : -(prix + transCout);

  const opp = {
    id: Date.now(),
    cmdId: cmdId,
    client: c.client,
    produitClient: c.produit,
    produit,
    poids,
    prixAchat: prix,
    prixRevente: vente,
    mode: partage,
    transportCout: transCout,
    beneficePerso,
    usagePerso: vente === 0,
    date: new Date().toISOString().split('T')[0]
  };
  DB.opportunites.push(opp);
  c.opportuniteActivee = opp.id;
  c.beneficePerso = beneficePerso;
  save();

  const card = document.getElementById(uid);
  const benefStr = c.beneficePerso >= 0
    ? `<b style="color:var(--green)">+${fmt(c.beneficePerso)}</b>`
    : `<b style="color:var(--red)">${fmt(c.beneficePerso)}</b>`;
  if (card) card.outerHTML = `
    <div style="background:var(--green-dim);border:1px solid rgba(34,197,94,0.3);border-radius:10px;padding:16px 18px;display:flex;flex-direction:column;gap:10px;">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <span style="font-size:22px;">✅</span>
        <div>
          <div style="font-weight:700;font-size:14px;color:var(--green)">Opportunité activée — ${produit}</div>
          <div style="font-size:12px;color:var(--text2);margin-top:2px;">Rattaché à la commande de <b>${c.client}</b> · Invisible sur sa facture</div>
        </div>
      </div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:12px;background:var(--bg3);border-radius:6px;padding:10px 12px;">
        <span>📦 <b>${poids} kg</b></span>
        <span>🚚 Transport : <b>${modeLabel}</b></span>
        ${prix > 0 ? `<span>💰 Achat : <b>${fmt(prix)}</b></span>` : ''}
        ${vente > 0 ? `<span>🏷️ Revente : <b>${fmt(vente)}</b></span><span>📈 Bénéfice : ${benefStr}</span>` : '<span style="color:var(--text3)">Usage perso</span>'}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-ghost btn-sm" onclick="renderOptimisation()">↺ Voir autres opportunités</button>
        <button class="btn btn-ghost btn-sm" onclick="showPage('commandes')">→ Voir les commandes</button>
      </div>
    </div>`;
  showToast('✅ Opportunité activée sur ' + c.client);
}

// ========== PARAMÈTRES ==========
function renderParametres() {
  const p = DB.params;
  ['normalPaliers','sensiblePaliers','expressPaliers'].forEach(key => {
    if (p[key]) p[key] = p[key]
      .filter(palier => palier.max !== Infinity && palier.max !== null && !isNaN(palier.max))
      .map(palier => ({ ...palier, max: (palier.max === null || palier.max === undefined || isNaN(palier.max)) ? 2.5 : palier.max }));
  });
  function renderPaliers(paliers, typeName) {
    if (!paliers || paliers.length === 0) return '<div class="empty-state">Aucun palier (tous les poids seront au tarif/kg)</div>';
    let html = '';
    paliers.forEach((palier, idx) => {
      html += `<div class="param-row" data-type="${typeName}" data-idx="${idx}">
        <span class="param-key">Poids ≤ ${palier.max.toFixed(2)} kg :</span>
        <input type="number" class="param-input palier-max" value="${palier.max}" placeholder="max kg" step="0.5" min="0.5" max="2.5">
        <input type="number" class="param-input palier-tarif" value="${palier.tarif}" placeholder="tarif XAF">
        <button class="btn btn-ghost btn-sm remove-palier" data-type="${typeName}" data-idx="${idx}">🗑</button>
      </div>`;
    });
    return html;
  }
  function tarifKgSection(label, idSuffix, val) {
    return `<div class="param-row" style="background:rgba(212,168,39,0.06);border-radius:6px;padding:10px 12px;margin-top:8px;">
      <span class="param-key" style="color:var(--gold);font-weight:600;">⚡ > 2.5 kg → tarif au kg (XAF/kg)</span>
      <input type="number" class="param-input" id="p-tarifKg${idSuffix}" value="${val}" min="0" step="100" style="border-color:var(--gold);">
    </div>`;
  }
  const normalHtml = renderPaliers(p.normalPaliers, 'normal');
  const sensibleHtml = renderPaliers(p.sensiblePaliers, 'sensible');
  const expressHtml = renderPaliers(p.expressPaliers, 'express');
  document.getElementById('params-grid').innerHTML = `
    <div class="param-section"><div class="param-section-title">Taux de change</div><div class="param-row"><span>CNY → XAF</span><input class="param-input" id="p-tauxCNY" value="${p.tauxCNY}"></div><div class="param-row"><span>USD → XAF</span><input class="param-input" id="p-tauxUSD" value="${p.tauxUSD}"></div><div class="param-row"><span>EUR → XAF</span><input class="param-input" id="p-tauxEUR" value="${p.tauxEUR}"></div></div>
    <div class="param-section">
      <div class="param-section-title">Transport NORMAL</div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:10px;">Paliers fixes (≤ 2.5 kg) · Au-delà → tarif/kg automatique</div>
      <div id="paliers-normal-container" class="paliers-container">${normalHtml}</div>
      <button class="btn btn-ghost btn-sm add-palier" data-type="normal">+ Ajouter un palier</button>
      ${tarifKgSection('Normal','Normal', p.tarifKgNormal || 3000)}
    </div>
    <div class="param-section">
      <div class="param-section-title">Transport SENSIBLE</div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:10px;">Paliers fixes (≤ 2.5 kg) · Au-delà → tarif/kg automatique</div>
      <div id="paliers-sensible-container" class="paliers-container">${sensibleHtml}</div>
      <button class="btn btn-ghost btn-sm add-palier" data-type="sensible">+ Ajouter un palier</button>
      ${tarifKgSection('Sensible','Sensible', p.tarifKgSensible || 4000)}
    </div>
    <div class="param-section">
      <div class="param-section-title">Transport EXPRESS</div>
      <div style="font-size:11px;color:var(--text3);margin-bottom:10px;">Paliers fixes (≤ 2.5 kg) · Au-delà → tarif/kg automatique</div>
      <div id="paliers-express-container" class="paliers-container">${expressHtml}</div>
      <button class="btn btn-ghost btn-sm add-palier" data-type="express">+ Ajouter un palier</button>
      ${tarifKgSection('Express','Express', p.tarifKgExpress || 6000)}
    </div>
    <div class="param-section"><div class="param-section-title">CBM (Volume)</div><div class="param-row"><span>Tarif par m³ (XAF)</span><input class="param-input" id="p-cbmTarifM3" value="${p.cbmTarifM3}"></div><div class="param-row"><span>Frais minimum CBM (XAF)</span><input class="param-input" id="p-cbmMinFrais" value="${p.cbmMinFrais}"></div><div class="param-row"><span>Volume minimum (m³)</span><input class="param-input" id="p-cbmMinVolume" value="${p.cbmMinVolume}"></div></div>
    <div class="param-section"><div class="param-section-title">Frais fixes & facturation</div>
      <div style="background:var(--green-dim);border-radius:6px;padding:10px 14px;margin-bottom:12px;font-size:12px;color:var(--green);">ℹ️ La <b>commission principale (2 500 XAF)</b> est configurée dans la section Société → Frais &amp; Tarifs</div>
      <div class="param-row"><span class="param-key">Frais annexes supplémentaires (XAF)</span><input class="param-input" id="p-fraisBase" value="${p.fraisBase}"></div>
      <div class="param-row"><span class="param-key">Libellé sur la facture</span><input class="param-input" id="p-nomFraisAnnexes" value="${p.nomFraisAnnexes||'Commission de service'}" style="width:200px;text-align:left;"></div>
      <div style="font-size:11px;color:var(--text3);padding-top:8px;">Ce libellé apparaît sur chaque facture client. Mettre 0 si tu n'as pas de frais supplémentaires.</div>
    </div>
    <div class="param-section" style="border-top:3px solid var(--orange);">
      <div class="param-section-title" style="color:var(--orange);">⚙️ Ajustement estimatif</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:12px;">Petite différence entre l'estimation et le montant réel (quelques francs). Affiché au client de façon transparente dans le devis.</div>
      <div class="param-row"><span class="param-key">Actif ?</span><select class="form-select" id="p-bufferActif" style="width:80px;"><option value="oui" ${p.bufferActif!==false?'selected':''}>Oui</option><option value="non" ${p.bufferActif===false?'selected':''}>Non</option></select></div>
      <div class="param-row"><span class="param-key">Montant ajustement (XAF)</span><input class="param-input" id="p-bufferMontant" value="${p.bufferMontant||500}"></div>
      <div style="font-size:11px;color:var(--text3);padding-top:6px;">ℹ️ Valeur recommandée : 500 XAF (correspond aux écarts réels observés)</div>
    </div>
    <div class="param-section" style="grid-column:1/-1;">
      <div class="param-section-title">⚖️ Clauses de non-responsabilité</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:10px;">Incluses dans les PDFs, factures HTML et messages WhatsApp.</div>
      <textarea class="form-input" id="p-clausesNonResponsabilite" rows="5" style="font-size:12px;">${p.clausesNonResponsabilite||''}</textarea>
    </div>
    <div class="param-section"><div class="param-section-title">Options factures</div><div class="param-row"><span>Délai de paiement (jours)</span><input class="param-input" id="p-delaiPaiement" value="${p.delaiPaiement || 15}"></div><div class="param-row"><span>Afficher bénéfice sur facture pro ?</span><select class="form-select" id="p-afficherBenefice"><option value="oui" ${p.afficherBenefice === 'oui' ? 'selected' : ''}>Oui</option><option value="non" ${p.afficherBenefice !== 'oui' ? 'selected' : ''}>Non</option></select></div><div class="param-row"><span>Générer QR code sur facture ?</span><select class="form-select" id="p-qrCode"><option value="oui" ${p.qrCode === 'oui' ? 'selected' : ''}>Oui</option><option value="non" ${p.qrCode !== 'oui' ? 'selected' : ''}>Non</option></select></div></div>
    <!-- TARIFS SPÉCIAUX ORDINATEURS & TÉLÉPHONES -->
    <div class="param-section" style="grid-column:1/-1; border-top:3px solid #6366f1;">
      <div class="param-section-title" style="color:#6366f1;">💻📱 Tarifs spéciaux — Ordinateurs &amp; Téléphones</div>
      <div style="font-size:12px;color:var(--text2);margin-bottom:16px;">Ces tarifs de transport fixes s'appliquent aux commandes dont le produit contient « ordinateur », « laptop », « pc », « macbook », « téléphone », « iphone », « samsung », « smartphone ». Mettre 0 pour utiliser les tarifs standards.</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6366f1;margin-bottom:12px;">💻 Ordinateurs / Laptops</div>
          <div class="param-row"><span class="param-key">✈️ Normal — Avion (XAF)</span><input class="param-input" id="p-tarifOrdinateurNormal" value="${p.tarifOrdinateurNormal || 15000}" type="number" step="500"></div>
          <div class="param-row"><span class="param-key">✈️ Express — Avion (XAF)</span><input class="param-input" id="p-tarifOrdinateurExpress" value="${p.tarifOrdinateurExpress || 22000}" type="number" step="500"></div>
          <div class="param-row"><span class="param-key">✈️ Sensible — Avion (XAF)</span><input class="param-input" id="p-tarifOrdinateurSensible" value="${p.tarifOrdinateurSensible || 17000}" type="number" step="500"></div>
          <div class="param-row"><span class="param-key">🚢 CMB — Bateau (XAF/m³)</span><input class="param-input" id="p-tarifOrdinateurBateau" value="${p.tarifOrdinateurBateau || 0}" type="number" step="500"></div>
        </div>
        <div>
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6366f1;margin-bottom:12px;">📱 Téléphones / Smartphones</div>
          <div class="param-row"><span class="param-key">✈️ Normal — Avion (XAF)</span><input class="param-input" id="p-tarifTelephoneNormal" value="${p.tarifTelephoneNormal || 8000}" type="number" step="500"></div>
          <div class="param-row"><span class="param-key">✈️ Express — Avion (XAF)</span><input class="param-input" id="p-tarifTelephoneExpress" value="${p.tarifTelephoneExpress || 12000}" type="number" step="500"></div>
          <div class="param-row"><span class="param-key">✈️ Sensible — Avion (XAF)</span><input class="param-input" id="p-tarifTelephoneSensible" value="${p.tarifTelephoneSensible || 9000}" type="number" step="500"></div>
          <div class="param-row"><span class="param-key">🚢 CMB — Bateau (XAF/m³)</span><input class="param-input" id="p-tarifTelephoneBateau" value="${p.tarifTelephoneBateau || 0}" type="number" step="500"></div>
        </div>
      </div>
      <div style="margin-top:14px;padding:10px 14px;background:rgba(99,102,241,0.07);border-radius:8px;font-size:11px;color:#6366f1;">ℹ️ Ces tarifs sont fixes et remplacent le calcul par palier/poids pour ces produits. Mettre <b>0</b> pour revenir au tarif standard.</div>
    </div>
    <!-- NOUVEAUX PARAMÈTRES PDF ET VENDEUR -->
    <div class="param-section" style="grid-column:1/-1; border-top:3px solid var(--gold);">
      <div class="param-section-title" style="color:var(--gold);">🎨 STYLES PDF & OPTIONS VENDEUR</div>
      <div class="param-row"><span class="param-key">Style PDF</span><select id="p-pdfStyle" class="form-select" style="width:200px;"><option value="moderne" ${p.pdfStyle==='moderne'?'selected':''}>Version 1 — Moderne (épurée)</option><option value="blocs" ${p.pdfStyle==='blocs'?'selected':''}>Version 2 — Carte/Blocs (lisible)</option><option value="premium" ${p.pdfStyle==='premium'?'selected':''}>Version 3 — Premium (contraste)</option></select></div>
      <div class="param-row"><span class="param-key">Couleur principale</span><input type="color" id="p-couleurPrincipale" value="${p.couleurPrincipale || '#e63329'}" style="width:60px;height:32px;"></div>
      <div class="param-row"><span class="param-key">Couleur secondaire</span><input type="color" id="p-couleurSecondaire" value="${p.couleurSecondaire || '#f0f0f0'}" style="width:60px;height:32px;"></div>
      <div class="param-row"><span class="param-key">Afficher logo sur PDF</span><select id="p-afficherLogo" class="form-select" style="width:80px;"><option value="oui" ${p.afficherLogo!==false?'selected':''}>Oui</option><option value="non" ${p.afficherLogo===false?'selected':''}>Non</option></select></div>
      <div class="param-row"><span class="param-key">Afficher slogan</span><select id="p-afficherSlogan" class="form-select" style="width:80px;"><option value="oui" ${p.afficherSlogan!==false?'selected':''}>Oui</option><option value="non" ${p.afficherSlogan===false?'selected':''}>Non</option></select></div>
      <div class="param-row"><span class="param-key">Afficher QR code</span><select id="p-afficherQRCode" class="form-select" style="width:80px;"><option value="oui" ${p.afficherQRCode===true?'selected':''}>Oui</option><option value="non" ${p.afficherQRCode!==true?'selected':''}>Non</option></select></div>
      <div class="param-row"><span class="param-key">Afficher coordonnées paiement</span><select id="p-afficherPaiement" class="form-select" style="width:80px;"><option value="oui" ${p.afficherPaiement!==false?'selected':''}>Oui</option><option value="non" ${p.afficherPaiement===false?'selected':''}>Non</option></select></div>
      <div class="param-row"><span class="param-key" style="color:var(--orange);">📊 Bloc commercial vendeur (activable)</span><select id="p-afficherBlocVendeur" class="form-select" style="width:80px;"><option value="oui" ${p.afficherBlocCommercialVendeur===true?'selected':''}>Oui</option><option value="non" ${p.afficherBlocCommercialVendeur!==true?'selected':''}>Non</option></select></div>
      <div class="param-row"><span class="param-key">Prix de vente conseillé (XAF)</span><input type="number" id="p-prixConseilleVendeur" class="param-input" value="${p.prixConseilleVendeur || 0}" step="1000"></div>
      <div style="font-size:11px;color:var(--text3);margin-top:8px;">Le bloc commercial apparaît uniquement sur les factures des vendeurs (typeClient="vendeur") et affiche prix d'acquisition, prix conseillé et marge potentielle.</div>
    </div>
  `;
}
function initParametresEvents() {
  document.querySelectorAll('.add-palier').forEach(btn => {
    btn.removeEventListener('click', handleAddPalier);
    btn.addEventListener('click', handleAddPalier);
  });
  document.getElementById('params-grid')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-palier')) {
      const type = e.target.dataset.type;
      const idx = parseInt(e.target.dataset.idx);
      DB.params[`${type}Paliers`].splice(idx, 1);
      renderParametres();
      initParametresEvents();
      showToast('Palier supprimé');
    }
  });
  document.getElementById('params-grid')?.addEventListener('change', (e) => {
    if (e.target.classList.contains('palier-max') || e.target.classList.contains('palier-tarif')) {
      const row = e.target.closest('.param-row');
      if (!row) return;
      const type = row.dataset.type;
      const idx = parseInt(row.dataset.idx);
      if (e.target.classList.contains('palier-max')) {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = Infinity;
        DB.params[`${type}Paliers`][idx].max = val;
      } else {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = 0;
        DB.params[`${type}Paliers`][idx].tarif = val;
      }
      save();
    }
  });
}
function handleAddPalier(e) {
  const type = e.currentTarget.dataset.type;
  DB.params[`${type}Paliers`].push({ max: 0, tarif: 0 });
  renderParametres();
  initParametresEvents();
  showToast('Palier ajouté');
}
function saveParams() {
  DB.params.tauxCNY = parseFloat(document.getElementById('p-tauxCNY')?.value) || DB.params.tauxCNY;
  DB.params.tauxUSD = parseFloat(document.getElementById('p-tauxUSD')?.value) || DB.params.tauxUSD;
  DB.params.tauxEUR = parseFloat(document.getElementById('p-tauxEUR')?.value) || DB.params.tauxEUR;
  DB.params.tarifKgNormal   = parseFloat(document.getElementById('p-tarifKgNormal')?.value)   || DB.params.tarifKgNormal;
  DB.params.tarifKgSensible = parseFloat(document.getElementById('p-tarifKgSensible')?.value) || DB.params.tarifKgSensible;
  DB.params.tarifKgExpress  = parseFloat(document.getElementById('p-tarifKgExpress')?.value)  || DB.params.tarifKgExpress;
  DB.params.cbmTarifM3 = parseFloat(document.getElementById('p-cbmTarifM3')?.value) || DB.params.cbmTarifM3;
  DB.params.cbmMinFrais = parseFloat(document.getElementById('p-cbmMinFrais')?.value) || DB.params.cbmMinFrais;
  DB.params.cbmMinVolume = parseFloat(document.getElementById('p-cbmMinVolume')?.value) || DB.params.cbmMinVolume;
  DB.params.fraisBase = parseFloat(document.getElementById('p-fraisBase')?.value) || DB.params.fraisBase;
  DB.params.nomFraisAnnexes = document.getElementById('p-nomFraisAnnexes')?.value.trim() || DB.params.nomFraisAnnexes;
  var _bA = document.getElementById('p-bufferActif'); if(_bA) DB.params.bufferActif = _bA.value !== 'non';
  var _bM = document.getElementById('p-bufferMontant'); if(_bM) DB.params.bufferMontant = parseFloat(_bM.value)||DB.params.bufferMontant;
  var _cl = document.getElementById('p-clausesNonResponsabilite'); if(_cl) DB.params.clausesNonResponsabilite = _cl.value.trim();
  DB.params.delaiPaiement = parseInt(document.getElementById('p-delaiPaiement')?.value) || 15;
  DB.params.afficherBenefice = document.getElementById('p-afficherBenefice')?.value || 'non';
  DB.params.qrCode = document.getElementById('p-qrCode')?.value || 'non';
  // Nouveaux paramètres
  DB.params.pdfStyle = document.getElementById('p-pdfStyle')?.value || 'moderne';
  DB.params.couleurPrincipale = document.getElementById('p-couleurPrincipale')?.value || DB.societe.couleur || '#e63329';
  DB.params.couleurSecondaire = document.getElementById('p-couleurSecondaire')?.value || '#f0f0f0';
  DB.params.afficherLogo = document.getElementById('p-afficherLogo')?.value === 'oui';
  DB.params.afficherSlogan = document.getElementById('p-afficherSlogan')?.value === 'oui';
  DB.params.afficherQRCode = document.getElementById('p-afficherQRCode')?.value === 'oui';
  DB.params.afficherPaiement = document.getElementById('p-afficherPaiement')?.value === 'oui';
  DB.params.afficherBlocCommercialVendeur = document.getElementById('p-afficherBlocVendeur')?.value === 'oui';
  DB.params.prixConseilleVendeur = parseFloat(document.getElementById('p-prixConseilleVendeur')?.value) || 0;
  // Tarifs spéciaux ordinateurs & téléphones
  DB.params.tarifOrdinateurNormal   = parseFloat(document.getElementById('p-tarifOrdinateurNormal')?.value)   || 0;
  DB.params.tarifOrdinateurExpress  = parseFloat(document.getElementById('p-tarifOrdinateurExpress')?.value)  || 0;
  DB.params.tarifOrdinateurSensible = parseFloat(document.getElementById('p-tarifOrdinateurSensible')?.value) || 0;
  DB.params.tarifOrdinateurBateau   = parseFloat(document.getElementById('p-tarifOrdinateurBateau')?.value)   || 0;
  DB.params.tarifTelephoneNormal    = parseFloat(document.getElementById('p-tarifTelephoneNormal')?.value)    || 0;
  DB.params.tarifTelephoneExpress   = parseFloat(document.getElementById('p-tarifTelephoneExpress')?.value)   || 0;
  DB.params.tarifTelephoneSensible  = parseFloat(document.getElementById('p-tarifTelephoneSensible')?.value)  || 0;
  DB.params.tarifTelephoneBateau    = parseFloat(document.getElementById('p-tarifTelephoneBateau')?.value)    || 0;
  save();
  showToast('Paramètres sauvegardés');
}

// ========== EXPORTS ==========
function exportCSV(){
  const data=DB.commandes; if(!data.length){showToast('Aucune donnée','err');return;}
  const headers=['ID','Date','Client','Ville','Type','Produit','Qté','PoidsUnitaire','PoidsTotal','VolumeTotal','TransportMode','CoutTotal','PrixVente','Benefice','Rentabilite','Statut','Fournisseur','Email'];
  const rows=data.map(c=>[c.id,c.date,c.client,c.ville||'',c.typeClient,c.produit,c.quantite,(c.poidsUnitaire||c.poidsReel/c.quantite).toFixed(2),getPoidsTotal(c).toFixed(2),getVolumeTotal(c).toFixed(4),c.transportMode,Math.round(c.coutTotal),c.prixVente?Math.round(c.prixVente):'',Math.round(c.benefice),(c.rentabilite||0).toFixed(1),c.statut,c.fournisseur||'',c.email||''].join(';'));
  const csv='\uFEFF'+[headers.join(';'),...rows].join('\n'); const blob=new Blob([csv],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`export_${new Date().toISOString().slice(0,10)}.csv`; a.click(); showToast('CSV exporté');
}
function exportExcel(){
  const data=DB.commandes; if(!data.length){showToast('Aucune donnée','err');return;}
  const wsData=[['ID','Date','Client','Ville','Type','Produit','Qté','Poids unitaire (kg)','Poids total (kg)','Volume total (m³)','Transport','Coût total (XAF)','Prix vente (XAF)','Bénéfice (XAF)','Rentabilité (%)','Statut','Fournisseur','Email']];
  data.forEach(c=>{ wsData.push([c.id,c.date,c.client,c.ville||'',c.typeClient,c.produit,c.quantite,(c.poidsUnitaire||c.poidsReel/c.quantite).toFixed(2),getPoidsTotal(c).toFixed(2),getVolumeTotal(c).toFixed(4),c.transportMode,Math.round(c.coutTotal),c.prixVente?Math.round(c.prixVente):'',Math.round(c.benefice),(c.rentabilite||0).toFixed(1),c.statut,c.fournisseur||'',c.email||'']); });
  const ws=XLSX.utils.aoa_to_sheet(wsData); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Commandes'); XLSX.writeFile(wb,`export_${new Date().toISOString().slice(0,10)}.xlsx`); showToast('Excel exporté');
}
function exportCSVMois() { const mois=document.getElementById('export-mois').value; if(mois) exportCSV(DB.commandes.filter(c=>c.date&&c.date.startsWith(mois))); }
function renderExports() {
  const moisSet=new Set(); DB.commandes.forEach(c=>{if(c.date) moisSet.add(c.date.slice(0,7));});
  const sel=document.getElementById('export-mois'); if(sel) sel.innerHTML=[...moisSet].sort().reverse().map(m=>`<option value="${m}">${m}</option>`).join('');
  renderRecapMensuel();
  const totalBenef=DB.commandes.reduce((s,c)=>s+(c.benefice||0),0); const totalCA=DB.commandes.reduce((s,c)=>s+(c.prixVente||0),0);
  document.getElementById('export-stats').innerHTML=`<div><div class="kpi-label">Commandes</div><div>${DB.commandes.length}</div></div><div><div class="kpi-label">CA total</div><div>${fmt(totalCA)}</div></div><div><div class="kpi-label">Bénéfice cumulé</div><div class="${totalBenef>=0?'green':'red'}">${fmt(totalBenef)}</div></div>`;
}
function renderRecapMensuel() {
  const mois=document.getElementById('export-mois').value;
  const data=DB.commandes.filter(c=>c.date&&c.date.startsWith(mois));
  if(!data.length){ document.getElementById('recap-mensuel-body').innerHTML='<div class="empty-state">Aucune donnée</div>'; return; }
  const totalVente=data.reduce((s,c)=>s+(c.prixVente||0),0); const totalBenef=data.reduce((s,c)=>s+(c.benefice||0),0);
  document.getElementById('recap-mensuel-body').innerHTML=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:20px"><div>Commandes: ${data.length}</div><div>CA: ${fmt(totalVente)}</div><div>Bénéfice: ${fmt(totalBenef)}</div></div><div class="table-wrap"><table class="w-full"><thead><tr><th>Date</th><th>Client</th><th>Ville</th><th>Produit</th><th>Vente</th><th>Bénéfice</th></tr></thead><tbody>${data.map(c=>`<tr onclick="openModal(${c.id})"><td>${c.date}</td><td class="mono">${c.client}</td><td class="mono">${c.ville||'—'}</td><td class="mono">${c.produit}</td><td class="mono">${c.prixVente?fmt(c.prixVente):'—'}</td><td class="${c.benefice>=0?'green':'red'}">${fmt(c.benefice)}</td></tr>`).join('')}</tbody></table></div>`;
}
function exportRecapPDF() {
  const mois=document.getElementById('export-mois').value;
  const data=DB.commandes.filter(c=>c.date&&c.date.startsWith(mois));
  if(!data.length){showToast('Aucune donnée','err');return;}
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  doc.text(`Récapitulatif ${mois}`,14,20);
  const tableData=data.map(c=>[c.date,c.client,c.ville||'',c.produit,fmt(c.prixVente),fmt(c.benefice)]);
  doc.autoTable({head:[['Date','Client','Ville','Produit','Vente','Bénéfice']],body:tableData,startY:30});
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const fileName = `recap_${mois}.pdf`;
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
  overlay.innerHTML = `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:28px;max-width:400px;width:100%;">
    <div style="font-family:var(--font-title);font-size:24px;letter-spacing:2px;margin-bottom:16px;">RÉCAP <span style="color:var(--red)">${mois}</span></div>
    <a href="${pdfUrl}" download="${fileName}" style="display:flex;align-items:center;justify-content:center;gap:10px;width:100%;padding:14px;background:var(--red);color:white;border-radius:8px;font-weight:700;font-size:14px;text-decoration:none;margin-bottom:10px;" onclick="showToast('Téléchargement récap ${mois}')">📥 Télécharger le récapitulatif PDF</a>
    <button onclick="this.closest('div[style*=fixed]').remove();" style="display:flex;align-items:center;justify-content:center;width:100%;padding:10px;background:none;color:var(--text2);border:1px solid var(--border);border-radius:8px;font-size:13px;cursor:pointer;">✕ Fermer</button>
  </div>`;
  document.body.appendChild(overlay);
}

// ========== NOUVELLE COMMANDE ==========
function toggleDimensions() {
  const sousType = document.getElementById('f-poidsSousType').value;
  const dimGroup = document.getElementById('dimensions-group');
  const cbmNote = document.getElementById('bateau-cbm-note');
  const isCBM = (sousType === 'bateau_45');
  if (isCBM) {
    dimGroup.style.display = 'flex';
    if (cbmNote) cbmNote.style.display = 'flex';
  } else {
    dimGroup.style.display = 'none';
    if (cbmNote) cbmNote.style.display = 'none';
  }
}
function toggleModeRecuperation() {
  const circuit = document.getElementById('f-circuitLogistique').value;
  const group = document.getElementById('f-modeRecup-group');
  if (group) group.style.display = (circuit === 'via_moi') ? 'flex' : 'none';
}
function majRequisVente() {
  const type = document.getElementById('f-typeClient').value;
  const reqEl = document.getElementById('vente-requis');
  if (reqEl) reqEl.style.display = (type === 'particulier') ? 'inline' : 'none';
}
function recalc() {
  const prixAchat=parseFloat(document.getElementById('f-prix').value)||0;
  const qty=parseInt(document.getElementById('f-qty').value)||1;
  const devise=document.getElementById('f-devise').value;
  const poidsUnitaire=parseFloat(document.getElementById('f-poids').value)||0;
  const sousType=normaliseSousType(document.getElementById('f-poidsSousType').value);
  const isBateauCBM = (sousType === 'bateau_45');
  let poidsTotal=poidsUnitaire*qty;
  let volumeTotal=0;
  if(isBateauCBM) { const L=parseFloat(document.getElementById('f-long').value)||0, l=parseFloat(document.getElementById('f-larg').value)||0, H=parseFloat(document.getElementById('f-haut').value)||0; volumeTotal=calculVolumeM3(L,l,H)*qty; }
  const prixVente=parseFloat(document.getElementById('f-vente').value)||null;
  const fraisMan=parseFloat(document.getElementById('f-frais').value)||0;
  const prixProduit=prixAchat*qty*tauxDevise(devise);
  const effectiveMode = isBateauCBM ? 'cbm' : 'poids';
  const produitVal = document.getElementById('f-produit')?.value || '';
  const tarifSpecial = getTarifSpecial(produitVal, sousType);
  const transCout = tarifSpecial > 0 ? tarifSpecial : coutTransport(effectiveMode, poidsTotal, volumeTotal, sousType);
  const buffer = calculerBufferIntelligent(effectiveMode, transCout, poidsTotal, volumeTotal);
  const _typeClientRecalc = document.getElementById('f-typeClient').value;
  const fraisAnnexes = (_typeClientRecalc === 'pro')
    ? (DB.societe.fraisAnnexesPro  !== undefined ? DB.societe.fraisAnnexesPro  : DB.societe.fraisAnnexes || 2500)
    : (DB.societe.fraisAnnexesPart !== undefined ? DB.societe.fraisAnnexesPart : 2500);
  const circuit = document.getElementById('f-circuitLogistique').value;
  const modeRecup = document.getElementById('f-modeRecuperation').value;
  const livraison = (circuit === 'via_moi' && modeRecup === 'livraison_payante') ? (DB.societe.tarifLivraison || 3000) : 0;
  const fraisAuto = DB.params.fraisBase;
  const coutTotal = prixProduit + transCout + buffer + fraisAuto + fraisMan + fraisAnnexes + livraison;
  const benefice = (prixVente !== null && !isNaN(prixVente)) ? prixVente - coutTotal : 0;
  const rent = (prixVente && prixVente > 0) ? (benefice / prixVente) * 100 : 0;

  let baseFact = '';
  if (effectiveMode === 'cbm') {
    baseFact = `${volumeTotal.toFixed(4)} m³ (facturé)`;
  } else {
    const pFact = poidsFacture(poidsTotal);
    if (pFact > SEUIL_PALIER_KG) {
      const tarifKg = (sousType === 'sensible_14') ? (DB.params.tarifKgSensible||4000) : (sousType === 'express_7') ? (DB.params.tarifKgExpress||6000) : (DB.params.tarifKgNormal||3000);
      baseFact = `${pFact.toFixed(2)} kg facturé · <span style="color:var(--gold);font-weight:600;">⚡ Tarif/kg : ${tarifKg.toLocaleString('fr-FR')} XAF/kg</span>`;
    } else {
      baseFact = `${pFact.toFixed(2)} kg facturé · <span style="color:var(--green);font-weight:600;">📋 Palier fixe</span>`;
    }
  }

  document.getElementById('r-poids-volume').innerHTML = effectiveMode === 'cbm' ? `${volumeTotal.toFixed(4)} m³` : `${poidsTotal.toFixed(3)} kg réel`;
  document.getElementById('r-base-facturee').innerHTML = baseFact;
  document.getElementById('r-prix-produit').innerHTML = fmt(prixProduit);
  document.getElementById('r-transport').innerHTML = fmt(transCout);
  const rowFraisMan = document.getElementById('row-frais-manuels');
  if (fraisMan > 0) { rowFraisMan.style.display = 'flex'; document.getElementById('r-frais-manuels').innerHTML = fmt(fraisMan); }
  else { rowFraisMan.style.display = 'none'; }
  document.getElementById('r-cout-total').innerHTML = fmt(coutTotal);
  var _buf = DB.params.bufferActif ? (DB.params.bufferMontant || 500) : 0;
  var _prudent = coutTotal + (DB.params.bufferActif ? (DB.params.bufferMontant || 500) : 0);
  var _bufEl = document.getElementById('r-buffer'); var _prEl = document.getElementById('r-cout-prudent');
  if (_bufEl) _bufEl.innerHTML = _buf > 0 ? '+' + Math.round(_buf).toLocaleString('fr-FR') + ' XAF (ajustement estimatif)' : 'Désactivé';
  if (_prEl) _prEl.innerHTML = fmt(_prudent);
  const bEl = document.getElementById('r-benefice'); bEl.innerHTML = fmt(benefice); bEl.className = 'calc-val ' + (benefice >= 0 ? 'green' : 'red');
  const rEl = document.getElementById('r-rentabilite'); rEl.innerHTML = fmtR(rent); rEl.className = 'calc-val ' + rentColor(rent);

  let reco = ''; if (prixVente && prixVente > 0) { if (rent >= 25) reco = '<div class="reco-box reco-ok">✅ Rentabilité élevée</div>'; else if (rent >= 15) reco = '<div class="reco-box reco-warn">⚠️ Marge correcte</div>'; else if (rent >= 0) reco = '<div class="reco-box reco-bad">⚠️ Marge faible</div>'; else reco = '<div class="reco-box reco-bad">🔴 PERTE</div>'; }

  // Ajouter avertissement paiement selon type client
  const typeClient = document.getElementById('f-typeClient').value;
  const totalDisplay = prixVente && prixVente > 0 ? Math.round(prixVente).toLocaleString('fr-FR') + ' XAF' : '—';
  let paymentReco = '';
  if (typeClient === 'particulier') {
    paymentReco = `<div class="payment-alert alert-red" style="margin-top:8px;">
      <div class="payment-alert-icon">💳</div>
      <div class="payment-alert-content">
        <div class="payment-alert-title">🔒 Particulier — Paiement TOTAL requis avant commande fournisseur</div>
        <div class="payment-alert-body">Ce client doit payer la totalité <strong>${totalDisplay}</strong> avant que vous passiez la commande. Envoyez la facture ou le devis WhatsApp pour demander le règlement.</div>
      </div>
    </div>`;
  }
  // Pro : aucun bloc affiché
  document.getElementById('reco-box').innerHTML = reco + paymentReco;
}
function saveCommande() {
  const client = document.getElementById('f-client').value.trim();
  const ville = document.getElementById('f-ville').value.trim();
  const email = document.getElementById('f-email').value.trim();
  const typeClient = document.getElementById('f-typeClient').value;
  const produit = document.getElementById('f-produit').value.trim();
  const prixAchat = parseFloat(document.getElementById('f-prix').value);
  const qty = parseInt(document.getElementById('f-qty').value) || 1;
  const devise = document.getElementById('f-devise').value;
  const poidsUnitaire = parseFloat(document.getElementById('f-poids').value);
  const sousType = document.getElementById('f-poidsSousType').value;
  let prixVente = parseFloat(document.getElementById('f-vente').value);
  const fraisManuels = parseFloat(document.getElementById('f-frais').value) || 0;
  const statut = document.getElementById('f-statut').value;
  const fournisseur = document.getElementById('f-fournisseur').value;
  const whatsapp = document.getElementById('f-whatsapp').value.trim();
  const circuitLogistique = document.getElementById('f-circuitLogistique').value;
  const modeRecuperation = document.getElementById('f-modeRecuperation').value;
  if (!client || !ville || !produit || !prixAchat || !poidsUnitaire) { showToast('Champs obligatoires (Client, Ville, Produit, Prix achat, Poids)', 'err'); return; }
  if (typeClient === 'particulier' && (isNaN(prixVente) || prixVente <= 0)) { showToast('Prix de vente obligatoire pour un particulier', 'err'); return; }
  const isBateauCBM = (sousType === 'bateau_45');
  const effectiveTransportMode = isBateauCBM ? 'cbm' : 'poids';
  let volumeTotal = 0, longueurCm = 0, largeurCm = 0, hauteurCm = 0;
  if (isBateauCBM) {
    longueurCm = parseFloat(document.getElementById('f-long').value) || 0;
    largeurCm = parseFloat(document.getElementById('f-larg').value) || 0;
    hauteurCm = parseFloat(document.getElementById('f-haut').value) || 0;
    volumeTotal = calculVolumeM3(longueurCm, largeurCm, hauteurCm) * qty;
    if (volumeTotal <= 0) { showToast('Dimensions requises pour le fret maritime (CBM)', 'err'); return; }
  }
  const poidsTotal = poidsUnitaire * qty;
  const articlePerso = null;

  const c = {
    id: Date.now(), client, ville, email, typeClient, produit, quantite: qty, prixAchat, devise,
    poidsUnitaire, poidsReel: poidsTotal, longueurCm, largeurCm, hauteurCm, volumeM3: volumeTotal,
    transportMode: effectiveTransportMode, transport: effectiveTransportMode, prixVente: prixVente || 0, fraisManuels, statut,
    date: new Date().toISOString().split('T')[0], fournisseur, poidsSousType: sousType, articlePerso,
    whatsapp, circuitLogistique, modeRecuperation, commandeValidee: statut !== 'devis',
    paiementStatut: (typeClient === 'particulier') ? 'en_attente' : 'pro'
  };
  const calc = calcCommande(c);
  Object.assign(c, calc);
  if (articlePerso) {
    const fpCoutProduit = articlePerso.prixAchat * tauxDevise(articlePerso.devise);
    let fpTransportCout = 0;
    if (articlePerso.partageTransport === 'moitie') fpTransportCout = Math.round(coutTransportPoids(articlePerso.poids, sousType) / 2);
    else if (articlePerso.partageTransport === 'plein') fpTransportCout = coutTransportPoids(articlePerso.poids, sousType);
    c.beneficePerso = articlePerso.prixVente > 0 ? articlePerso.prixVente - (fpCoutProduit + fpTransportCout + DB.params.fraisBase) : -(fpCoutProduit + fpTransportCout + DB.params.fraisBase);
  }
  DB.commandes.unshift(c);
  save();
  showPage('commandes');

  const hasWA = !!c.whatsapp;
  const overlay = document.createElement('div');
  overlay.className = 'pdf-confirm-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
  const _cid = c.id;
  const _cnom = c.client;
  const _cprod = c.produit;
  const _cqty = c.quantite;
  const _cvente = c.prixVente;
  overlay.innerHTML = `
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:32px;max-width:440px;width:100%;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px;">
        <span style="font-size:28px;">✅</span>
        <div style="font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:2px;">COMMANDE <span style="color:var(--green)">ENREGISTRÉE</span></div>
      </div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border);">
        <strong>${_cnom}</strong> — ${_cprod} × ${_cqty}
        ${_cvente > 0 ? `<span style="float:right;font-family:monospace;color:var(--green);font-weight:700;">${Math.round(_cvente).toLocaleString('fr-FR')} XAF</span>` : ''}
      </div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text3);margin-bottom:12px;">Que voulez-vous faire ?</div>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <button id="btn-pdf-new" style="display:flex;align-items:center;gap:10px;padding:13px 16px;background:var(--red);color:white;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;text-align:left;">
          📄 <span><b>Générer la facture PDF</b><br><span style="font-size:11px;font-weight:400;opacity:0.85;">Télécharger puis envoyer au client</span></span>
        </button>
        ${hasWA ? `<button id="btn-wa-new" style="display:flex;align-items:center;gap:10px;padding:13px 16px;background:#25D366;color:white;border:none;border-radius:8px;font-weight:600;font-size:13px;cursor:pointer;text-align:left;">
          💬 <span><b>Envoyer le devis WhatsApp</b><br><span style="font-size:11px;font-weight:400;opacity:0.85;">Message avec montant + délai (sans PDF joint)</span></span>
        </button>` : `<div style="padding:10px 14px;background:var(--orange-dim);border-radius:8px;font-size:12px;color:var(--orange);">⚠️ Aucun numéro WhatsApp renseigné — ajoutez-en un dans la fiche commande pour envoyer un message.</div>`}
        <button id="btn-close-new" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;background:none;color:var(--text2);border:1px solid var(--border);border-radius:8px;font-size:13px;cursor:pointer;">✕ Ne rien faire pour l'instant</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  // Determine payment message by client type
  const _tclient = c.typeClient;
  const _transport = c.transport;
  const _transportCout = c.transport;
  let paymentNotice = '';
  if (_tclient === 'particulier') {
    paymentNotice = `<div class="payment-alert alert-red" style="margin-bottom:16px;">
      <div class="payment-alert-icon">💳</div>
      <div class="payment-alert-content">
        <div class="payment-alert-title">🔒 Particulier — Paiement TOTAL requis avant commande</div>
        <div class="payment-alert-body">Ce client doit payer la <strong>totalité du montant</strong> (${Math.round(_cvente||0).toLocaleString('fr-FR')} XAF) <strong>avant</strong> que vous passiez la commande au fournisseur.</div>
      </div>
    </div>`;
  } else {
    paymentNotice = `<div class="payment-alert alert-blue" style="margin-bottom:16px;">
      <div class="payment-alert-icon">📋</div>
      <div class="payment-alert-content">
        <div class="payment-alert-title">Client Pro — Commandez, le client récupère chez le transitaire</div>
        <div class="payment-alert-body">Vous pouvez passer la commande maintenant. Le client sera notifié dès l'arrivée chez le transitaire.</div>
      </div>
    </div>`;
  }
  // Insert notice before the action buttons
  const actionsDiv = overlay.querySelector('[style*="flex-direction:column"]');
  if (actionsDiv) actionsDiv.insertAdjacentHTML('beforebegin', paymentNotice);
  document.getElementById('btn-pdf-new').onclick = function() { overlay.remove(); genererFacturePDFPro(_cid); };
  if (hasWA) document.getElementById('btn-wa-new').onclick = function() { overlay.remove(); envoyerWhatsAppDevis(_cid); };
  document.getElementById('btn-close-new').onclick = function() { overlay.remove(); };
}

// ========== MODAL & AUTRES ==========
function openModal(id) {
  var c = DB.commandes.find(function(x) { return x.id === id; }); if (!c) return;
  var calc = calcCommande(c);
  var modeLabel = (function() {
    var circuit = c.circuitLogistique || 'via_moi';
    var recup = c.modeRecuperation || 'retrait_gratuit';
    if (circuit === 'direct_client') return '🏭 Direct client';
    if (recup === 'livraison_payante') return '🚚 Livraison à domicile';
    return '📍 Retrait gratuit chez moi';
  })();
  var delaiInfo = c.poidsSousType === 'express_7' ? '✈️ Express — 7 jours dès message transitaire'
    : c.poidsSousType === 'bateau_45' ? '🚢 Fret Maritime — 45 jours dès message transitaire'
    : c.poidsSousType === 'sensible_14' ? '🔥 Sensible — 14 jours dès message transitaire'
    : '🚢 Normal — 14 jours dès message transitaire';
  var buf = DB.params.bufferActif ? (DB.params.bufferMontant || 3000) : 0;
  var montant = (c.prixVente && c.prixVente > 0) ? c.prixVente : calc.coutTotal;
  var prudent = montant + buf;
  var bufHtml = buf > 0 ? '<div class="calc-row" style="color:var(--orange);font-size:12px;"><span>⚙️ Ajustement estimatif</span><span>+' + fmt(buf) + '</span></div><div class="calc-row" style="color:var(--orange);font-weight:600;"><span>Total à prévoir</span><span>' + fmt(prudent) + '</span></div>' : '';
  var waHtml = c.whatsapp
    ? '<button class="btn btn-sm" style="background:#25D366;color:white;" onclick="envoyerWhatsAppDevis(' + c.id + ')">💬 Devis WA</button> <button class="btn btn-sm" style="background:#128C7E;color:white;" onclick="envoyerAlerteArrivee(' + c.id + ')">📦 Arrivée WA</button>'
    : '<button class="btn btn-ghost btn-sm" onclick="envoyerWhatsAppManuel(' + c.id + ')">💬 WhatsApp</button>';
  var validBanner = (!c.commandeValidee && c.statut === 'devis')
    ? '<div style="margin-top:10px;padding:10px;background:var(--orange-dim);border-radius:8px;border:1px solid var(--orange);font-size:12px;color:var(--orange);"><b>⏳ En attente paiement client</b><br>Envoyez le devis WA, puis validez quand payé.<br><button class="btn btn-sm" style="margin-top:6px;background:var(--orange);color:white;" onclick="validerCommandeClient(' + c.id + ')">✅ Valider — Client a payé</button></div>'
    : '';
  // Payment notice per client type
  var paymentBannerModal = '';
  if (c.typeClient === 'particulier') {
    var isPaid = c.paiementStatut === 'payé';
    if (!isPaid) {
      paymentBannerModal = '<div class="payment-alert alert-red" style="margin-top:10px;">'
        + '<div class="payment-alert-icon">💳</div>'
        + '<div class="payment-alert-content">'
        + '<div class="payment-alert-title">🔒 Particulier — Paiement TOTAL obligatoire avant commande</div>'
        + '<div class="payment-alert-body">Le client doit payer <strong>' + fmt(c.prixVente || calc.coutTotal) + '</strong> avant que vous passiez la commande au fournisseur.</div>'
        + '</div></div>';
    } else {
      paymentBannerModal = '<div class="payment-alert alert-green" style="margin-top:10px;">'
        + '<div class="payment-alert-icon">✅</div>'
        + '<div class="payment-alert-content">'
        + '<div class="payment-alert-title">Paiement confirmé</div>'
        + '<div class="payment-alert-body">Le paiement a été enregistré le ' + (c.dateValidation || c.date) + '. Vous pouvez passer la commande.</div>'
        + '</div></div>';
    }
  } else {
    // Pro: show transport info
    var transportInfo = '';
    if (calc.transport > 0) {
      transportInfo = ' · Frais transport : <strong>' + fmt(calc.transport) + '</strong> (client peut récupérer chez transitaire)';
    }
    paymentBannerModal = '<div class="payment-alert alert-blue" style="margin-top:10px;">'
      + '<div class="payment-alert-icon">📋</div>'
      + '<div class="payment-alert-content">'
      + '<div class="payment-alert-title">Client Professionnel — Passez la commande maintenant</div>'
      + '<div class="payment-alert-body">Le paiement n\'est pas requis avant la commande.' + transportInfo + '</div>'
      + '</div></div>';
  }
  document.getElementById('modal-content').innerHTML = '<div class="modal-title">' + c.client + ' · ' + c.produit + '</div>'
    + '<div style="font-size:12px;color:var(--text2);margin-bottom:8px;">' + delaiInfo + ' | ' + modeLabel + (c.whatsapp ? ' | 📱 ' + c.whatsapp : '') + (c.ville ? ' | 📍 ' + c.ville : '') + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;font-size:13px;">'
    + '<div>📅 ' + c.date + '</div><div>' + statusBadge(c.statut) + '</div>'
    + '<div>Qté: ' + c.quantite + '</div><div>Poids: ' + getPoidsTotal(c).toFixed(2) + ' kg</div></div><hr style="margin:8px 0;">'
    + '<div class="calc-row"><span>Coût total</span><span class="red">' + fmt(calc.coutTotal) + '</span></div>'
    + '<div class="calc-row"><span>Prix vente</span><span>' + (c.prixVente ? fmt(c.prixVente) : 'Non défini') + '</span></div>'
    + bufHtml
    + '<div class="calc-row total"><span>Bénéfice</span><span class="' + (calc.benefice >= 0 ? 'green' : 'red') + '">' + fmt(calc.benefice) + '</span></div>'
    + '<div class="calc-row"><span>Rentabilité</span><span>' + fmtR(calc.rentabilite) + '</span></div>'
    + '<hr style="margin:8px 0;"><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px;">'
    + '<select id="modal-statut" class="form-select" style="flex:1;"><option value="devis"' + (c.statut === 'devis' ? ' selected' : '') + '>📄 Devis</option><option value="en_attente"' + (c.statut === 'en_attente' ? ' selected' : '') + '>⏳ En attente</option><option value="livre"' + (c.statut === 'livre' ? ' selected' : '') + '>✅ Livré</option><option value="annule"' + (c.statut === 'annule' ? ' selected' : '') + '>❌ Annulé</option></select>'
    + '<button class="btn btn-red btn-sm" onclick="updateStatut(' + c.id + ')">Mettre à jour</button></div>'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap;">'
    + '<button class="btn btn-ghost btn-sm" onclick="imprimerFacturePro(' + c.id + ')">🖨️ HTML</button>'
    + '<button class="btn btn-red btn-sm" onclick="genererFacturePDFPro(' + c.id + ')">📄 PDF</button>'
    + waHtml + '</div>' + validBanner + paymentBannerModal;
  document.getElementById('modal-overlay').classList.add('open');
}
function updateStatut(id) { const c = DB.commandes.find(x => x.id === id); if (c) { c.statut = document.getElementById('modal-statut').value; save(); closeModal(); renderCommandes(); renderDashboard(); showToast('Statut mis à jour'); } }
function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); }

// ========== WHATSAPP & VALIDATION ==========
function getDelaiParSousType(st) {
  if (st === 'express_7') return '7 jours';
  if (st === 'bateau_45') return '45 jours';
  return '14 jours';
}
function getLabelTransport(st) {
  if (st === 'express_7') return '✈️ Express';
  if (st === 'bateau_45') return '🚢 Fret Maritime / Bateau';
  if (st === 'sensible_14') return '🔥 Sensible';
  return '🚢 Normal';
}
// buildMsgDevis et buildMsgArrivee sont déjà définis plus haut (version par type client)
function envoyerWhatsAppArrivee(id) {
  const c = DB.commandes.find(x => x.id === id);
  if (!c || !c.whatsapp) { showToast('Numéro WhatsApp manquant'); return; }
  const msg = buildMsgArrivee(c);
  ouvrirLienExterne(`https://wa.me/${c.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`);
}

function imprimerFacturePro(id) {
  const c = DB.commandes.find(x => x.id === id); if (!c) return;
  const calc = calcCommande(c);
  const s = DB.societe;
  const style = DB.params.pdfStyle || 'moderne';
  const couleur = DB.params.couleurPrincipale || s.couleur || '#e63329';
  const numFact = 'FAC-2026-' + String(c.id).padStart(5,'0');
  const dateAuj = new Date().toLocaleDateString('fr-FR');
  const montantTotal = c.prixVente || calc.coutTotal;
  const statutLabel = c.statut === 'livre' ? 'VALIDÉE' : c.statut === 'annule' ? 'ANNULÉE' : 'EN COURS';
  const statutColor = c.statut === 'livre' ? '#16a34a' : c.statut === 'annule' ? '#dc2626' : '#ea580c';
  const logoHtml = (DB.params.afficherLogo && s.logo)
    ? `<img src="${s.logo}" style="height:50px;max-width:120px;object-fit:contain;">`
    : '';
  const paiementHtml = (DB.params.afficherPaiement && (s.orangeMoney || s.mtnMoney)) ? `
    <div style="margin-top:24px;">
      <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#888;margin-bottom:10px;">💳 Paiement sécurisé</div>
      ${s.orangeMoney ? `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #eee;font-size:13px;"><span style="background:#FF6B00;color:white;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">🟠 ORANGE MONEY</span><strong>${s.orangeMoney}</strong></div>` : ''}
      ${s.mtnMoney ? `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;font-size:13px;"><span style="background:#FFC200;color:#333;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;">🟡 MTN MOMO</span><strong>${s.mtnMoney}</strong></div>` : ''}
    </div>` : '';
  const footerHtml = `<div style="text-align:center;font-size:11px;color:#aaa;border-top:1px solid #eee;padding-top:16px;margin-top:28px;line-height:1.7;">${s.mentions || 'Merci pour votre confiance !'}</div>`;

  let bodyHtml = '';

  if (style === 'moderne' || style === 'v1') {
    bodyHtml = `
    <div style="display:flex;min-height:100vh;">
      <!-- Bande latérale rouge -->
      <div style="width:10px;background:${couleur};flex-shrink:0;"></div>
      <!-- Contenu -->
      <div style="flex:1;padding:36px;font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#111;max-width:860px;">
        <!-- En-tête -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid #eee;">
          <div>
            ${logoHtml ? logoHtml + '<br>' : `<div style="font-size:26px;font-weight:900;color:${couleur};letter-spacing:1px;">${s.nom || 'MG IMPORT'}</div>`}
            ${!logoHtml ? '' : `<div style="font-size:22px;font-weight:900;color:${couleur};letter-spacing:1px;">${s.nom || 'MG IMPORT'}</div>`}
            ${s.slogan ? `<div style="font-size:11px;color:#888;font-style:italic;margin-top:3px;">${s.slogan}</div>` : ''}
            <div style="font-size:11px;color:#666;line-height:1.9;margin-top:8px;">
              ${s.adresse ? `📍 ${s.adresse}<br>` : ''}${s.tel ? `📞 ${s.tel}<br>` : ''}${s.email ? `✉️ ${s.email}` : ''}
            </div>
          </div>
          <div style="text-align:right;">
            <div style="background:#1a1a1a;color:white;padding:8px 18px;border-radius:6px;display:inline-block;margin-bottom:8px;">
              <div style="font-size:14px;font-weight:700;letter-spacing:1px;">FACTURE</div>
              <div style="font-size:11px;color:${couleur};margin-top:2px;">${numFact}</div>
            </div>
            <div style="font-size:11px;color:#666;line-height:1.9;">
              Date : ${dateAuj}<br>
              Réf : REF-${c.id}
            </div>
          </div>
        </div>

        <!-- Client + Statut -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;gap:20px;">
          <div>
            <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#aaa;margin-bottom:8px;">Client</div>
            <div style="font-size:16px;font-weight:700;">${c.client}</div>
            ${c.ville ? `<div style="font-size:12px;color:#666;margin-top:2px;">📍 ${c.ville}</div>` : ''}
            ${c.whatsapp ? `<div style="font-size:12px;color:#25D366;margin-top:2px;">📱 ${c.whatsapp}</div>` : ''}
          </div>
          <div style="text-align:right;">
            <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#aaa;margin-bottom:8px;">Statut de la commande</div>
            <span style="background:${statutColor}22;color:${statutColor};padding:5px 14px;border-radius:20px;font-size:12px;font-weight:700;">✓ ${statutLabel}</span>
          </div>
        </div>

        <!-- Tableau -->
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <thead>
            <tr style="background:${couleur};color:white;">
              <th style="padding:11px 14px;text-align:left;font-size:11px;letter-spacing:0.5px;">#</th>
              <th style="padding:11px 14px;text-align:left;font-size:11px;letter-spacing:0.5px;">PRODUIT</th>
              <th style="padding:11px 14px;text-align:center;font-size:11px;letter-spacing:0.5px;">QUANTITÉ</th>
              <th style="padding:11px 14px;text-align:right;font-size:11px;letter-spacing:0.5px;">PRIX UNITAIRE</th>
              <th style="padding:11px 14px;text-align:right;font-size:11px;letter-spacing:0.5px;">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom:1px solid #eee;">
              <td style="padding:12px 14px;font-size:13px;">1</td>
              <td style="padding:12px 14px;font-size:13px;font-weight:600;">${c.produit}</td>
              <td style="padding:12px 14px;font-size:13px;text-align:center;">${c.quantite}</td>
              <td style="padding:12px 14px;font-size:13px;text-align:right;font-family:monospace;">${Math.round(montantTotal / c.quantite).toLocaleString('fr-FR')} XAF</td>
              <td style="padding:12px 14px;font-size:13px;text-align:right;font-family:monospace;">${Math.round(montantTotal).toLocaleString('fr-FR')} XAF</td>
            </tr>
          </tbody>
          <tfoot>
            ${c.typeClient === 'particulier'
              ? `<tr style="background:${couleur};color:white;"><td colspan="4" style="padding:13px 14px;font-weight:800;font-size:14px;letter-spacing:1px;">TOTAL TTC</td><td style="padding:13px 14px;font-size:18px;font-weight:900;text-align:right;font-family:monospace;">${Math.round(montantTotal).toLocaleString('fr-FR')} XAF</td></tr>`
              : `<tr><td colspan="4" style="padding:9px 14px;font-size:12px;color:#333;">🚚 Transport</td><td style="padding:9px 14px;font-size:12px;text-align:right;font-family:monospace;">${Math.round(calc.transport||0).toLocaleString('fr-FR')} XAF</td></tr>
                 <tr><td colspan="4" style="padding:9px 14px;font-size:12px;color:#333;">🔧 Frais de service</td><td style="padding:9px 14px;font-size:12px;text-align:right;font-family:monospace;">${Math.round((s.fraisAnnexesPro||2500)+(c.fraisManuels||0)).toLocaleString('fr-FR')} XAF</td></tr>
                 <tr style="background:${couleur};color:white;"><td colspan="4" style="padding:13px 14px;font-weight:800;font-size:14px;letter-spacing:1px;">TOTAL TTC</td><td style="padding:13px 14px;font-size:18px;font-weight:900;text-align:right;font-family:monospace;">${Math.round(montantTotal).toLocaleString('fr-FR')} XAF</td></tr>`
            }
          </tfoot>
        </table>
        ${paiementHtml}
        ${footerHtml}
      </div>
    </div>`;

  } else if (style === 'blocs' || style === 'v2') {
    bodyHtml = `
    <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#111;max-width:860px;margin:0 auto;padding:0;">
      <!-- Header -->
      <div style="background:${couleur};padding:28px 36px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          ${logoHtml ? `<div style="margin-bottom:8px;">${logoHtml}</div>` : ''}
          <div style="font-size:24px;font-weight:800;color:white;letter-spacing:1px;">${s.nom || 'MG IMPORT'}</div>
          ${s.slogan ? `<div style="font-size:12px;color:rgba(255,255,255,0.8);font-style:italic;">${s.slogan}</div>` : ''}
        </div>
        <div style="background:white;border-radius:8px;padding:12px 20px;text-align:center;">
          <div style="font-size:16px;font-weight:800;color:${couleur};">FACTURE</div>
          <div style="font-size:12px;font-weight:600;color:#333;margin-top:2px;">${numFact}</div>
        </div>
      </div>

      <!-- Info bar -->
      <div style="background:#f5f5f5;padding:14px 36px;display:flex;gap:32px;flex-wrap:wrap;">
        <div><div style="font-size:10px;color:#999;font-weight:700;text-transform:uppercase;letter-spacing:1px;">DATE</div><div style="font-size:13px;font-weight:600;margin-top:2px;">${dateAuj}</div></div>
        <div><div style="font-size:10px;color:#999;font-weight:700;text-transform:uppercase;letter-spacing:1px;">RÉFÉRENCE</div><div style="font-size:13px;font-weight:600;margin-top:2px;">REF-${c.id}</div></div>
        <div><div style="font-size:10px;color:#999;font-weight:700;text-transform:uppercase;letter-spacing:1px;">STATUT</div><div style="margin-top:4px;"><span style="background:${statutColor}22;color:${statutColor};padding:3px 12px;border-radius:20px;font-size:11px;font-weight:700;">${statutLabel}</span></div></div>
      </div>

      <div style="padding:28px 36px;">
        <!-- Client + Commande en 2 blocs -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:28px;">
          <div style="border:1.5px solid #e5e5e5;border-radius:10px;padding:20px;">
            <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#aaa;margin-bottom:12px;">👤 Client</div>
            <div style="font-size:16px;font-weight:700;margin-bottom:4px;">${c.client}</div>
            ${c.ville ? `<div style="font-size:12px;color:#666;">📍 ${c.ville}</div>` : ''}
            ${c.whatsapp ? `<div style="font-size:12px;color:#25D366;margin-top:4px;">📱 ${c.whatsapp}</div>` : ''}
            <div style="margin-top:10px;">
              <span style="background:${c.typeClient==='particulier'?'#ea580c':'#4f46e5'}22;color:${c.typeClient==='particulier'?'#ea580c':'#4f46e5'};padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;text-transform:uppercase;">${c.typeClient==='particulier'?'PARTICULIER':'PROFESSIONNEL'}</span>
            </div>
          </div>
          <div style="border:1.5px solid #e5e5e5;border-radius:10px;padding:20px;">
            <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#aaa;margin-bottom:12px;">📦 Commande</div>
            <div style="font-size:13px;line-height:2;color:#333;">
              <div><strong>Produit :</strong> ${c.produit}</div>
              <div><strong>Quantité :</strong> ${c.quantite}</div>
              <div><strong>Transport :</strong> ${getTransportLabel(c)}</div>
              ${c.delaiTransit ? `<div><strong>Délai :</strong> ${c.delaiTransit}</div>` : ''}
            </div>
          </div>
        </div>

        <!-- Total bien visible -->
        <div style="background:#1a1a1a;border-radius:10px;padding:20px 28px;margin-bottom:24px;display:flex;justify-content:space-between;align-items:center;">
          <div style="color:#aaa;font-size:13px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">TOTAL À PAYER</div>
          <div style="font-size:30px;font-weight:900;color:${couleur};font-family:monospace;">${Math.round(montantTotal).toLocaleString('fr-FR')} XAF</div>
        </div>

        <!-- Détails financiers -->
        <div style="background:#f9f9f9;border-radius:10px;padding:20px;margin-bottom:24px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${couleur};margin-bottom:14px;">Détails</div>
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:13px;"><span style="color:#666;">🛍️ ${c.produit} × ${c.quantite}</span><span style="font-family:monospace;font-weight:600;">${Math.round(calc.prixProduit||0).toLocaleString('fr-FR')} XAF</span></div>
          ${c.typeClient !== 'particulier' ? `<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:13px;"><span style="color:#666;">🚚 Transport</span><span style="font-family:monospace;font-weight:600;">${Math.round(calc.transport||0).toLocaleString('fr-FR')} XAF</span></div><div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:13px;"><span style="color:#666;">🔧 Frais de service</span><span style="font-family:monospace;font-weight:600;">${Math.round((s.fraisAnnexesPro||2500)+(c.fraisManuels||0)).toLocaleString('fr-FR')} XAF</span></div>` : ''}
          <div style="display:flex;justify-content:space-between;padding:10px 0;border-top:2px solid #eee;margin-top:4px;font-size:15px;font-weight:800;"><span>TOTAL TTC</span><span style="font-family:monospace;color:${couleur};">${Math.round(montantTotal).toLocaleString('fr-FR')} XAF</span></div>
        </div>

        ${paiementHtml}
        ${footerHtml}
      </div>
    </div>`;

  } else {
    // PREMIUM / V3
    bodyHtml = `
    <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#111;max-width:860px;margin:0 auto;">
      <!-- Header bicolore -->
      <div style="display:flex;">
        <div style="flex:1;background:#0f0f0f;padding:28px 28px 28px 36px;">
          ${logoHtml ? `<div style="margin-bottom:10px;">${logoHtml}</div>` : ''}
          <div style="font-size:22px;font-weight:800;color:white;letter-spacing:0.5px;">${s.nom || 'MG IMPORT'}</div>
          ${s.slogan ? `<div style="font-size:11px;color:#aaa;font-style:italic;margin-top:3px;">${s.slogan}</div>` : ''}
        </div>
        <div style="flex:1;background:${couleur};padding:28px 36px 28px 28px;text-align:right;">
          <div style="font-size:16px;font-weight:700;color:white;letter-spacing:2px;">FACTURE</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.8);margin-top:4px;">${numFact}</div>
          <div style="font-size:11px;color:rgba(255,255,255,0.7);margin-top:8px;">${dateAuj} · REF-${c.id}</div>
        </div>
      </div>

      <div style="padding:28px 36px;">
        <!-- Info ligne -->
        <div style="display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap;">
          <div style="flex:1;min-width:160px;background:#f5f5f5;border-radius:8px;padding:14px;">
            <div style="font-size:10px;color:#999;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Client</div>
            <div style="font-size:15px;font-weight:700;">${c.client}</div>
            ${c.ville ? `<div style="font-size:11px;color:#666;margin-top:2px;">${c.ville}</div>` : ''}
          </div>
          <div style="flex:1;min-width:160px;background:#f5f5f5;border-radius:8px;padding:14px;">
            <div style="font-size:10px;color:#999;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Commande</div>
            <div style="font-size:13px;font-weight:600;">${c.produit}</div>
            <div style="font-size:11px;color:#666;">Qté: ${c.quantite} · Transport: ${getTransportLabel(c)}</div>
          </div>
          <div style="flex:1;min-width:160px;background:${statutColor}15;border:1.5px solid ${statutColor}44;border-radius:8px;padding:14px;">
            <div style="font-size:10px;color:#999;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Statut</div>
            <div style="font-size:14px;font-weight:700;color:${statutColor};">${statutLabel}</div>
          </div>
        </div>

        <!-- Total central -->
        <div style="border:2px solid ${couleur};border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;background:linear-gradient(135deg,white 60%,${couleur}08);">
          <div style="font-size:11px;color:#999;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px;">TOTAL À PAYER</div>
          <div style="font-size:40px;font-weight:900;color:${couleur};font-family:monospace;">${Math.round(montantTotal).toLocaleString('fr-FR')} XAF</div>
        </div>

        <!-- Détails en 2 colonnes -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
          <div>
            <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#aaa;margin-bottom:10px;">Détails</div>
            <div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #eee;font-size:12px;"><span style="color:#666;">🛍️ ${c.produit} × ${c.quantite}</span><span style="font-family:monospace;">${Math.round(calc.prixProduit||0).toLocaleString('fr-FR')} XAF</span></div>
            ${c.typeClient !== 'particulier' ? `<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #eee;font-size:12px;"><span style="color:#666;">🚚 Transport</span><span style="font-family:monospace;">${Math.round(calc.transport||0).toLocaleString('fr-FR')} XAF</span></div><div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #eee;font-size:12px;"><span style="color:#666;">🔧 Frais de service</span><span style="font-family:monospace;">${Math.round((s.fraisAnnexesPro||2500)+(c.fraisManuels||0)).toLocaleString('fr-FR')} XAF</span></div>` : ''}
            <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:13px;font-weight:800;"><span>TOTAL TTC</span><span style="font-family:monospace;color:${couleur};">${Math.round(montantTotal).toLocaleString('fr-FR')} XAF</span></div>
          </div>
          <div>
            ${paiementHtml}
          </div>
        </div>

        ${footerHtml}
      </div>
    </div>`;
  }

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Facture ${numFact}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700;800&display=swap" rel="stylesheet">
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:white}@media print{.no-print{display:none!important}}</style>
</head><body>
${bodyHtml}
<div class="no-print" style="position:fixed;bottom:24px;right:24px;display:flex;gap:10px;z-index:999;">
  <button onclick="window.print()" style="background:${couleur};color:white;border:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.2);">🖨️ Imprimer / PDF</button>
  <button onclick="window.close()" style="background:#333;color:white;border:none;padding:12px 18px;border-radius:8px;font-size:14px;cursor:pointer;">✕</button>
</div>
</body></html>`);
  win.document.close();
}


// ========== SOCIÉTÉ ==========
function chargerSociete() {
  const s = DB.societe;
  document.getElementById('soc-nom').value = s.nom || '';
  document.getElementById('soc-slogan').value = s.slogan || '';
  document.getElementById('soc-adresse').value = s.adresse || '';
  document.getElementById('soc-tel').value = s.tel || '';
  document.getElementById('soc-email').value = s.email || '';
  document.getElementById('soc-site').value = s.site || '';
  document.getElementById('soc-registre').value = s.registre || '';
  document.getElementById('soc-mentions').value = s.mentions || '';
  document.getElementById('soc-couleur').value = s.couleur || '#e63329';
  document.getElementById('soc-fraisAnnexesPart').value = s.fraisAnnexesPart !== undefined ? s.fraisAnnexesPart : 2500;
  document.getElementById('soc-fraisAnnexesPro').value  = s.fraisAnnexesPro  !== undefined ? s.fraisAnnexesPro  : 2500;
  document.getElementById('soc-tarifLivraison').value = s.tarifLivraison || 3000;
  document.getElementById('soc-orangeMoney').value = s.orangeMoney || '';
  document.getElementById('soc-mtnMoney').value = s.mtnMoney || '';
  document.getElementById('soc-clauses').value = s.clauses || '';
  const preview = document.getElementById('logo-preview');
  if (s.logo) preview.innerHTML = `<img src="${s.logo}" style="width:100%;height:100%;object-fit:contain;border-radius:8px;">`;
  else preview.innerHTML = '🏢';
  const fileInput = document.getElementById('soc-logo-file');
  fileInput.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        DB.societe.logo = ev.target.result;
        preview.innerHTML = `<img src="${DB.societe.logo}" style="width:100%;height:100%;object-fit:contain;border-radius:8px;">`;
        previewSociete(); save(); showToast('Logo chargé ✅');
      };
      reader.readAsDataURL(file);
    }
  };
  previewSociete();
}
function saveSociete() {
  DB.societe.nom = document.getElementById('soc-nom').value.trim();
  DB.societe.slogan = document.getElementById('soc-slogan').value.trim();
  DB.societe.adresse = document.getElementById('soc-adresse').value.trim();
  DB.societe.tel = document.getElementById('soc-tel').value.trim();
  DB.societe.email = document.getElementById('soc-email').value.trim();
  DB.societe.site = document.getElementById('soc-site').value.trim();
  DB.societe.registre = document.getElementById('soc-registre').value.trim();
  DB.societe.mentions = document.getElementById('soc-mentions').value.trim();
  DB.societe.couleur = document.getElementById('soc-couleur').value;
  DB.societe.fraisAnnexesPart = parseFloat(document.getElementById('soc-fraisAnnexesPart').value) || 2500;
  DB.societe.fraisAnnexesPro  = parseFloat(document.getElementById('soc-fraisAnnexesPro').value)  || 2500;
  DB.societe.fraisAnnexes     = DB.societe.fraisAnnexesPro; // compatibilité legacy
  DB.societe.tarifLivraison = parseFloat(document.getElementById('soc-tarifLivraison').value) || 3000;
  DB.societe.orangeMoney = document.getElementById('soc-orangeMoney').value.trim();
  DB.societe.mtnMoney = document.getElementById('soc-mtnMoney').value.trim();
  DB.societe.clauses = document.getElementById('soc-clauses').value.trim();
  save(); showToast('Société sauvegardée ✅'); previewSociete();
}
function previewSociete() {
  const nom = document.getElementById('soc-nom')?.value || DB.societe.nom;
  const slogan = document.getElementById('soc-slogan')?.value || DB.societe.slogan;
  const adresse = document.getElementById('soc-adresse')?.value || DB.societe.adresse;
  const tel = document.getElementById('soc-tel')?.value || DB.societe.tel;
  const email = document.getElementById('soc-email')?.value || DB.societe.email;
  const site = document.getElementById('soc-site')?.value || DB.societe.site;
  const registre = document.getElementById('soc-registre')?.value || DB.societe.registre;
  const couleur = document.getElementById('soc-couleur')?.value || DB.societe.couleur || '#e63329';
  const logo = DB.societe.logo;
  const today = new Date().toLocaleDateString('fr-FR');
  const previewEl = document.getElementById('societe-preview');
  if (!previewEl) return;
  previewEl.innerHTML = `
    <div style="border-bottom:3px solid ${couleur};padding-bottom:16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;">
      <div style="display:flex;align-items:center;gap:14px;">
        ${logo ? `<img src="${logo}" style="width:52px;height:52px;object-fit:contain;border-radius:6px;">` : `<div style="width:52px;height:52px;background:${couleur};border-radius:6px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:18px;">${(nom || 'MG')[0]}</div>`}
        <div>
          <div style="font-weight:800;font-size:18px;color:${couleur};letter-spacing:1px;">${nom || 'NOM SOCIÉTÉ'}</div>
          ${slogan ? `<div style="font-size:11px;color:#666;margin-top:2px;">${slogan}</div>` : ''}
          ${registre ? `<div style="font-size:10px;color:#999;margin-top:2px;">RC: ${registre}</div>` : ''}
        </div>
      </div>
      <div style="text-align:right;font-size:11px;color:#555;line-height:1.7;">
        <div style="font-weight:700;font-size:14px;color:#111;">FACTURE</div>
        <div>Date: ${today}</div>
        ${adresse ? `<div>📍 ${adresse}</div>` : ''}
        ${tel ? `<div>📞 ${tel}</div>` : ''}
        ${email ? `<div>✉️ ${email}</div>` : ''}
        ${site ? `<div>🌐 ${site}</div>` : ''}
        ${DB.societe.orangeMoney ? `<div>🟠 Orange : ${DB.societe.orangeMoney}</div>` : ''}
        ${DB.societe.mtnMoney ? `<div>🟡 MTN : ${DB.societe.mtnMoney}</div>` : ''}
      </div>
    </div>
    <div style="font-size:11px;color:#888;font-style:italic;">${document.getElementById('soc-mentions')?.value || DB.societe.mentions || ''}</div>
  `;
}
function supprimerLogo() {
  DB.societe.logo = '';
  document.getElementById('logo-preview').innerHTML = '🏢';
  document.getElementById('soc-logo-file').value = '';
  save(); previewSociete(); showToast('Logo supprimé');
}
function reinitialiserSociete() {
  if (!confirm('Réinitialiser toutes les informations société ?')) return;
  DB.societe = { nom: "MG IMPORT", slogan: "Votre partenaire logistique", adresse: "Yaoundé, Cameroun", tel: "+237 6XX XXX XXX", email: "contact@mgimport.com", site: "", registre: "", logo: "", couleur: "#e63329", mentions: "Merci de votre confiance. Paiement à réception.", fraisAnnexes: 2500, fraisAnnexesPro: 2500, fraisAnnexesPart: 2500, tarifLivraison: 3000, clauses: "Le montant final à payer est basé sur les dimensions fournies. Le prix final exact dépend de la pesée et du cubage réels validés par le transitaire lors de l'arrivée. Les délais courent à partir du signal du transitaire.", orangeMoney: "", mtnMoney: "" };
  save(); chargerSociete(); showToast('Réinitialisé');
}

// Thème
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') document.body.classList.add('dark');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  themeToggle.textContent = document.body.classList.contains('dark') ? '☀️ Mode clair' : '🌙 Mode sombre';
});

// Sauvegarde automatique
setInterval(() => { save(); }, 5 * 60 * 1000);

// Raccourcis clavier
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'n') { e.preventDefault(); showPage('nouvelle'); }
  if (e.ctrlKey && e.key === 'd') { e.preventDefault(); showPage('dashboard'); }
  if (e.ctrlKey && e.key === 'c') { e.preventDefault(); showPage('commandes'); }
  if (e.ctrlKey && e.key === 'e') { e.preventDefault(); showPage('exports'); }
  if (e.ctrlKey && e.key === 'p') { e.preventDefault(); showPage('parametres'); }
});

// Initialisation
load();
toggleDimensions();
toggleModeRecuperation();
renderFournisseurs();
majRequisVente();
renderDashboard();

