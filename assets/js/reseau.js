/* Fond discret de l'en-tête d'accueil : un réseau de points reliés qui dérive lentement.
   Une seule couleur (celle du thème), peu de nœuds, pause quand l'onglet est caché,
   image fixe si l'utilisateur préfère réduire les animations. */
(function () {
  var canvas = document.getElementById("reseau");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var L, H, noeuds = [], distMax = 140, couleur = "37,99,235";

  function lireCouleur() {
    var c = getComputedStyle(document.documentElement).getPropertyValue("--reseau").trim();
    if (c) couleur = c;
  }
  function init() {
    var r = canvas.parentElement.getBoundingClientRect();
    L = r.width; H = r.height;
    canvas.width = L * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.min(55, Math.round((L * H) / 26000));
    noeuds = [];
    for (var i = 0; i < n; i++) {
      noeuds.push({ x: Math.random() * L, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18 });
    }
  }
  function dessiner() {
    ctx.clearRect(0, 0, L, H);
    var i, j, a, b, dx, dy, d;
    for (i = 0; i < noeuds.length; i++) {
      a = noeuds[i];
      if (!calme) {
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > L) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
      }
    }
    ctx.lineWidth = 1;
    for (i = 0; i < noeuds.length; i++) {
      a = noeuds[i];
      for (j = i + 1; j < noeuds.length; j++) {
        b = noeuds[j]; dx = a.x - b.x; dy = a.y - b.y;
        if (Math.abs(dx) > distMax || Math.abs(dy) > distMax) continue;
        d = Math.sqrt(dx * dx + dy * dy);
        if (d < distMax) {
          ctx.strokeStyle = "rgba(" + couleur + "," + (1 - d / distMax) * 0.22 + ")";
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      ctx.fillStyle = "rgba(" + couleur + ",0.45)";
      ctx.beginPath(); ctx.arc(a.x, a.y, 1.6, 0, 6.283); ctx.fill();
    }
  }
  var enCours = false;
  function boucle() {
    if (document.hidden) { enCours = false; return; }
    dessiner(); requestAnimationFrame(boucle);
  }
  function demarrer() {
    if (calme) { dessiner(); return; }
    if (!enCours) { enCours = true; requestAnimationFrame(boucle); }
  }
  var minuteur;
  window.addEventListener("resize", function () {
    clearTimeout(minuteur);
    minuteur = setTimeout(function () { init(); if (calme) dessiner(); }, 150);
  });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) demarrer(); });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", lireCouleur);
  lireCouleur(); init(); demarrer();
})();
