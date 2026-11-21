/* Fond « réseau de neurones » : nœuds qui dérivent, liaisons, impulsions de données
   et réaction à la souris. Léger : nombre de nœuds adapté à l'écran, pause quand
   l'onglet est caché, image fixe si l'utilisateur préfère réduire les animations. */
(function () {
  var canvas = document.getElementById("reseau");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var L, H, noeuds = [], impulsions = [], distMax = 150;
  var souris = { x: -9999, y: -9999 };
  var couleurs = ["56,225,255", "139,92,255", "255,95,162"];

  function init() {
    L = window.innerWidth; H = window.innerHeight;
    canvas.width = L * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    distMax = L < 700 ? 110 : 150;
    var n = Math.min(95, Math.round((L * H) / 16000));
    noeuds = [];
    for (var i = 0; i < n; i++) {
      noeuds.push({
        x: Math.random() * L, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.8,
        c: couleurs[(Math.random() * 3) | 0],
      });
    }
    impulsions = [];
  }

  function dessiner() {
    ctx.clearRect(0, 0, L, H);
    var i, j, a, b, dx, dy, d;
    for (i = 0; i < noeuds.length; i++) {
      a = noeuds[i];
      if (!calme) {
        // légère attraction vers la souris
        dx = souris.x - a.x; dy = souris.y - a.y; d = Math.sqrt(dx * dx + dy * dy);
        if (d < 200 && d > 1) { a.vx += (dx / d) * 0.012; a.vy += (dy / d) * 0.012; }
        a.vx *= 0.995; a.vy *= 0.995;
        var v = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
        if (v < 0.12) { a.vx += (Math.random() - 0.5) * 0.05; a.vy += (Math.random() - 0.5) * 0.05; }
        a.x += a.vx; a.y += a.vy;
        if (a.x < -20) a.x = L + 20; else if (a.x > L + 20) a.x = -20;
        if (a.y < -20) a.y = H + 20; else if (a.y > H + 20) a.y = -20;
      }
    }
    for (i = 0; i < noeuds.length; i++) {
      a = noeuds[i];
      for (j = i + 1; j < noeuds.length; j++) {
        b = noeuds[j];
        dx = a.x - b.x; dy = a.y - b.y;
        if (Math.abs(dx) > distMax || Math.abs(dy) > distMax) continue;
        d = Math.sqrt(dx * dx + dy * dy);
        if (d < distMax) {
          var proche = Math.hypot(souris.x - (a.x + b.x) / 2, souris.y - (a.y + b.y) / 2) < 160;
          var alpha = (1 - d / distMax) * (proche ? 0.55 : 0.18);
          ctx.strokeStyle = "rgba(" + a.c + "," + alpha + ")";
          ctx.lineWidth = proche ? 1.1 : 0.7;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          if (!calme && impulsions.length < 14 && Math.random() < 0.0009) impulsions.push({ a: a, b: b, t: 0 });
        }
      }
    }
    for (i = 0; i < noeuds.length; i++) {
      a = noeuds[i];
      ctx.fillStyle = "rgba(" + a.c + ",0.85)";
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
    }
    // impulsions de « données » qui voyagent sur les liaisons
    for (i = impulsions.length - 1; i >= 0; i--) {
      var p = impulsions[i];
      p.t += 0.018;
      if (p.t >= 1) { impulsions.splice(i, 1); continue; }
      var x = p.a.x + (p.b.x - p.a.x) * p.t, y = p.a.y + (p.b.y - p.a.y) * p.t;
      var g = ctx.createRadialGradient(x, y, 0, x, y, 7);
      g.addColorStop(0, "rgba(255,255,255,0.95)");
      g.addColorStop(0.4, "rgba(" + p.a.c + ",0.6)");
      g.addColorStop(1, "rgba(" + p.a.c + ",0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, 7, 0, 6.283); ctx.fill();
    }
  }

  var enCours = false;
  function boucle() {
    if (document.hidden) { enCours = false; return; }
    dessiner();
    requestAnimationFrame(boucle);
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
  window.addEventListener("pointermove", function (e) { souris.x = e.clientX; souris.y = e.clientY; }, { passive: true });
  document.addEventListener("pointerleave", function () { souris.x = souris.y = -9999; });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) demarrer(); });

  init();
  demarrer();
})();
