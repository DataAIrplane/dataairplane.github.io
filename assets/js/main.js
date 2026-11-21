/* Comportements communs : menu mobile, apparitions, cartes, textes animés,
   et rendu des listes (sites, outils) à partir de donnees.js. */
(function () {
  var D = window.DONNEES || {};
  var calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Petites icônes ----------
  var ICONES = {
    chart: '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/>',
    brain: '<path d="M9 4a3 3 0 00-3 3 3 3 0 00-2 5 3 3 0 002 5 3 3 0 006 0V4a3 3 0 00-3 0z"/><path d="M15 4a3 3 0 013 3 3 3 0 012 5 3 3 0 01-2 5 3 3 0 01-6 0"/>',
    arrow: '<path d="M7 17L17 7M8 7h9v9"/>',
  };
  function icone(nom) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONES[nom] || ICONES.globe) + "</svg>";
  }
  window.icone = icone;

  var LIBELLES = { "en-ligne": "En ligne", operationnel: "Opérationnel", "en-dev": "En développement", bientot: "Bientôt" };
  function echapper(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  window.echapper = echapper;
  function tags(liste) {
    return '<div class="tags">' + (liste || []).map(function (t) { return '<span class="tag">' + echapper(t) + "</span>"; }).join("") + "</div>";
  }

  // ---------- Rendu : sites ----------
  function carteSite(s) {
    var hote = s.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return (
      '<a class="carte revele" href="' + echapper(s.url) + '" target="_blank" rel="noopener">' +
      '<div class="carte-tete"><div class="icone">' + icone(s.icone) + "</div>" +
      '<span class="statut ' + s.statut + '">' + (LIBELLES[s.statut] || "") + "</span></div>" +
      "<div><h3>" + echapper(s.nom) + '</h3><div class="url">' + echapper(hote) + " ↗</div></div>" +
      "<p>" + echapper(s.description) + "</p>" + tags(s.tags) + "</a>"
    );
  }
  // ---------- Rendu : outils ----------
  function carteOutil(o) {
    var pied = "";
    if (o.page) pied += '<a class="btn principal" href="' + echapper(o.page) + '">Découvrir l\'outil →</a>';
    else pied += '<span class="btn" aria-disabled="true">Page bientôt en ligne</span>';
    if (o.code) pied += '<a class="btn" href="' + echapper(o.code) + '" target="_blank" rel="noopener">Code source ↗</a>';
    return (
      '<article class="carte revele">' +
      '<div class="carte-tete"><div class="icone">' + icone(o.icone) + "</div>" +
      '<span class="statut ' + o.statut + '">' + (LIBELLES[o.statut] || "") + "</span></div>" +
      "<h3>" + echapper(o.nom) + "</h3><p>" + echapper(o.description) + "</p>" + tags(o.tags) +
      '<div class="carte-pied">' + pied + "</div></article>"
    );
  }
  var fantome = '<div class="carte fantome revele"><span class="plus">+</span><span>Prochain projet en préparation…</span></div>';

  document.querySelectorAll("[data-liste]").forEach(function (el) {
    var type = el.getAttribute("data-liste");
    var html = "";
    if (type === "sites") html = (D.sites || []).map(carteSite).join("");
    if (type === "outils") html = (D.outils || []).map(carteOutil).join("");
    if (el.hasAttribute("data-fantome")) html += fantome;
    el.innerHTML = html;
  });

  // ---------- Compteurs ----------
  var valeurs = {
    sites: (D.sites || []).filter(function (s) { return s.statut === "en-ligne"; }).length,
    outils: (D.outils || []).length,
    certifs: (D.certifications || []).filter(function (c) { return c.statut === "obtenue"; }).length,
    apprentissage: (D.certifications || []).filter(function (c) { return c.statut !== "obtenue"; }).length,
  };
  document.querySelectorAll("[data-compte]").forEach(function (el) {
    el.setAttribute("data-cible", valeurs[el.getAttribute("data-compte")] || 0);
    el.textContent = "0";
  });
  function compter(el) {
    var cible = +el.getAttribute("data-cible"), debut = null;
    if (calme || cible === 0) { el.textContent = cible; return; }
    function pas(t) {
      if (!debut) debut = t;
      var p = Math.min((t - debut) / 1200, 1);
      el.textContent = Math.round(cible * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(pas);
    }
    requestAnimationFrame(pas);
  }

  // ---------- Apparition au défilement ----------
  function observer() {
    var cibles = document.querySelectorAll(".revele:not(.visible), [data-cible]:not(.compte)");
    if (!("IntersectionObserver" in window)) {
      cibles.forEach(function (el) { el.classList.add("visible"); if (el.hasAttribute("data-cible")) compter(el); });
      return;
    }
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el.hasAttribute("data-cible")) { el.classList.add("compte"); compter(el); }
        else el.classList.add("visible");
        io.unobserve(el);
        el.dispatchEvent(new CustomEvent("visible"));
      });
    }, { threshold: 0.12 });
    cibles.forEach(function (el, i) {
      if (el.classList.contains("revele") && el.parentElement && el.parentElement.classList.contains("cartes"))
        el.style.setProperty("--delai", (i % 3) * 90 + "ms");
      io.observe(el);
    });
  }
  window.observerApparitions = observer;
  observer();

  // ---------- Texte « tapé » ----------
  document.querySelectorAll("[data-tape]").forEach(function (el) {
    var mots = JSON.parse(el.getAttribute("data-tape"));
    var cible = el.querySelector(".texte");
    if (calme) { cible.textContent = mots[0]; return; }
    var i = 0, n = 0, efface = false;
    function tic() {
      var mot = mots[i];
      n += efface ? -1 : 1;
      cible.textContent = mot.slice(0, n);
      var delai = efface ? 35 : 70;
      if (!efface && n === mot.length) { efface = true; delai = 1800; }
      else if (efface && n === 0) { efface = false; i = (i + 1) % mots.length; delai = 300; }
      setTimeout(tic, delai);
    }
    tic();
  });

  // ---------- Menu mobile ----------
  var burger = document.querySelector(".burger"), liens = document.querySelector(".liens");
  if (burger && liens) {
    burger.addEventListener("click", function () {
      var ouvert = liens.classList.toggle("ouvert");
      burger.setAttribute("aria-expanded", ouvert);
    });
  }

  // ---------- Année du pied de page ----------
  document.querySelectorAll("[data-annee]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
