/* Pages outil : boutons « Copier », barre de lecture et section active du sommaire. */
(function () {
  document.querySelectorAll(".copier").forEach(function (bouton) {
    bouton.addEventListener("click", function () {
      var texte = bouton.nextElementSibling.textContent;
      var fini = function () { bouton.textContent = "Copié ✓"; setTimeout(function () { bouton.textContent = "Copier"; }, 1500); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(texte).then(fini);
      else {
        var zone = document.createElement("textarea");
        zone.value = texte; document.body.appendChild(zone); zone.select();
        try { document.execCommand("copy"); fini(); } catch (e) {}
        zone.remove();
      }
    });
  });

  var barre = document.querySelector(".lecture i");
  var article = document.querySelector(".prose");
  var liens = Array.prototype.slice.call(document.querySelectorAll(".sommaire-lateral a"));
  var titres = liens.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });

  function maj() {
    if (article && barre) {
      var r = article.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, -r.top / (r.height - window.innerHeight)));
      barre.style.transform = "scaleX(" + p + ")";
    }
    var actif = -1;
    for (var i = 0; i < titres.length; i++) if (titres[i] && titres[i].getBoundingClientRect().top < 140) actif = i;
    liens.forEach(function (a, j) { a.classList.toggle("actif", j === actif); });
  }
  window.addEventListener("scroll", maj, { passive: true });
  window.addEventListener("resize", maj);
  maj();
})();
