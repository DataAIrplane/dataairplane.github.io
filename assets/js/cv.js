/* Page CV : remplit le profil, les compétences (onglets + jauges),
   le plan de vol des certifications et les expériences depuis donnees.js.
   Chargé avant main.js, qui se charge ensuite des apparitions et du texte tapé. */
(function () {
  var D = window.DONNEES || {};
  var P = D.profil || {};
  function e(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function $(id) { return document.getElementById(id); }

  // ---------- Profil ----------
  $("cv-nom").textContent = P.nom || "";
  var initiales = (P.nom || "DA").match(/[A-Z]/g) || ["D", "A"];
  $("cv-initiales").textContent = initiales.slice(0, 2).join("");
  $("cv-accroche").textContent = P.accroche || "";
  $("cv-titre").setAttribute("data-tape", JSON.stringify([P.titre || ""].concat((P.motsCles || []).map(function (m) { return "Passionné par " + m; }))));
  var contacts = [];
  if (P.github) contacts.push('<a class="btn" href="' + e(P.github) + '" target="_blank" rel="noopener">GitHub ↗</a>');
  if (P.linkedin) contacts.push('<a class="btn" href="' + e(P.linkedin) + '" target="_blank" rel="noopener">LinkedIn ↗</a>');
  if (P.email) contacts.push('<a class="btn principal" href="mailto:' + e(P.email) + '">Me contacter</a>');
  if (P.localisation) contacts.push('<span class="btn" aria-disabled="false" style="cursor:default">📍 ' + e(P.localisation) + "</span>");
  $("cv-contacts").innerHTML = contacts.join("");

  // ---------- Compétences ----------
  var groupes = D.competences || [];
  var onglets = $("cv-onglets"), jauges = $("cv-jauges");
  function afficherGroupe(i) {
    onglets.querySelectorAll(".onglet").forEach(function (b, j) { b.setAttribute("aria-selected", i === j); });
    var g = groupes[i];
    jauges.innerHTML = g.items.map(function (it) {
      return '<div><div class="jauge-tete"><span>' + e(it[0]) + "</span><span>" + it[1] + '%</span></div><div class="jauge"><i data-v="' + it[1] + '"></i></div></div>';
    }).join("");
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        jauges.querySelectorAll("i").forEach(function (b) { b.style.width = b.getAttribute("data-v") + "%"; });
      });
    });
  }
  onglets.innerHTML = groupes.map(function (g, i) {
    return '<button class="onglet" role="tab" aria-selected="' + (i === 0) + '">' + e(g.groupe) + "</button>";
  }).join("");
  onglets.querySelectorAll(".onglet").forEach(function (b, i) { b.addEventListener("click", function () { afficherGroupe(i); }); });
  // les jauges se remplissent quand la section devient visible
  var jaugesVues = false;
  function remplirQuandVisible() {
    if (jaugesVues || !groupes.length) return;
    var r = jauges.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.9) { jaugesVues = true; afficherGroupe(0); window.removeEventListener("scroll", remplirQuandVisible); }
  }
  window.addEventListener("scroll", remplirQuandVisible, { passive: true });
  setTimeout(remplirQuandVisible, 300);

  // ---------- Plan de vol ----------
  var LIB = { obtenue: "Obtenue", "en-cours": "En cours", prevue: "Prévue" };
  var plan = $("cv-plan");
  (D.certifications || []).forEach(function (c, i) {
    var div = document.createElement("div");
    div.className = "etape revele " + c.statut;
    var prog = c.statut === "en-cours" && c.progression != null
      ? '<div class="progression"><div class="jauge"><i style="width:' + +c.progression + '%"></i></div><small>' + +c.progression + " % parcouru</small></div>"
      : "";
    div.innerHTML =
      '<span class="balise"></span>' +
      '<button class="etape-carte" aria-expanded="false" aria-controls="etape-' + i + '">' +
      '<div class="ligne"><div><h3>' + e(c.nom) + '</h3><div class="org">' + e(c.organisme) + " · " + e(c.date) + "</div></div>" +
      '<span class="statut ' + c.statut + '">' + LIB[c.statut] + "</span></div>" + prog + "</button>" +
      '<div class="etape-detail" id="etape-' + i + '"><div><p>' + e(c.texte) + "</p>" +
      (c.lien ? '<a href="' + e(c.lien) + '" target="_blank" rel="noopener">Voir le badge ↗</a>' : "") + "</div></div>";
    plan.appendChild(div);
  });
  plan.addEventListener("click", function (ev) {
    var b = ev.target.closest(".etape-carte");
    if (b) b.setAttribute("aria-expanded", b.getAttribute("aria-expanded") !== "true");
  });

  // l'avion avance le long de la piste au fil du défilement
  var trace = plan.querySelector(".trace"), avion = plan.querySelector(".avion");
  function vol() {
    var r = plan.getBoundingClientRect();
    var hauteur = plan.offsetHeight - 16;
    var p = (window.innerHeight * 0.6 - r.top) / hauteur;
    p = Math.max(0, Math.min(1, p));
    var px = 8 + p * hauteur;
    trace.style.height = px - 8 + "px";
    avion.style.top = px + "px";
  }
  window.addEventListener("scroll", vol, { passive: true });
  window.addEventListener("resize", vol);
  vol();

  // ---------- Expériences ----------
  $("cv-experiences").innerHTML = (D.experiences || []).map(function (x) {
    return '<article class="experience revele"><div class="periode">' + e(x.periode) + "</div><div><h3>" + e(x.titre) +
      '</h3><div class="lieu">' + e(x.lieu) + "</div><p>" + e(x.texte) + "</p></div></article>";
  }).join("");
})();
