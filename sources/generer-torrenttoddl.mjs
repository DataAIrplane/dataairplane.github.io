// Construit la page outil TorrentToDDL (outils/torrenttoddl/index.html)
// à partir de l'article d'origine (sources/torrenttoddl/article.md), sans en changer le texte.
// Usage, depuis la racine du site : node sources/generer-torrenttoddl.mjs
// Aucune dépendance. Ce dossier « sources » n'a pas besoin d'être envoyé sur OVH.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
let source = readFileSync(join(racine, "sources/torrenttoddl/article.md"), "utf8").replace(/\r\n/g, "\n");

// En-tête YAML : titre et description
const meta = {};
source = source.replace(/^---\n([\s\S]*?)\n---\n/, (_, bloc) => {
  for (const ligne of bloc.split("\n")) {
    const m = ligne.match(/^(\w+):\s*"?(.*?)"?$/);
    if (m) meta[m[1]] = m[2];
  }
  return "";
});

const echapper = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ancre = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
  .replace(/[^a-z0-9 -]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
const texteBrut = (t) => t.replace(/\\\*/g, "*").replace(/`/g, "").replace(/\*\*/g, "");

function enLigne(texte) {
  const codes = [];
  let t = texte.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
  t = echapper(t.replace(/\\\*/g, "\u0001"))
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<figure><img src="$2" alt="$1" loading="lazy"><figcaption>$1</figcaption></figure>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, txt, url) =>
      url.startsWith("#") ? `<a href="${url}">${txt}</a>` : `<a href="${url}" target="_blank" rel="noopener">${txt}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>")
    .replace(/(https:\/\/github\.com\/[\w./-]+)(?![^<]*<\/a>)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  return t.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${echapper(codes[i])}</code>`).replace(/\u0001/g, "*");
}

const lignes = source.split("\n");
const html = [];
const sections = [];
let titrePrincipal = "";
let i = 0;

function liste(ordonnee) {
  const balise = ordonnee ? "ol" : "ul";
  const motif = ordonnee ? /^\d+\.\s+(.*)$/ : /^-\s+(.*)$/;
  const items = [];
  while (i < lignes.length && motif.test(lignes[i])) {
    const item = { texte: lignes[i].match(motif)[1], sous: [] };
    i++;
    while (i < lignes.length && /^\s{2,}-\s+/.test(lignes[i])) {
      item.sous.push(lignes[i].replace(/^\s+-\s+/, ""));
      i++;
    }
    items.push(item);
  }
  html.push(`<${balise}>` + items.map((it) => `<li>${enLigne(it.texte)}`
    + (it.sous.length ? `<ul>${it.sous.map((s) => `<li>${enLigne(s)}</li>`).join("")}</ul>` : "")
    + "</li>").join("") + `</${balise}>`);
}

while (i < lignes.length) {
  const ligne = lignes[i];
  if (!ligne.trim()) { i++; continue; }

  if (ligne.startsWith("```")) {
    const langue = ligne.slice(3).trim();
    const code = [];
    i++;
    while (i < lignes.length && !lignes[i].startsWith("```")) code.push(lignes[i++]);
    i++;
    html.push(`<pre data-langue="${langue}"><button class="copier" type="button">Copier</button><code>${echapper(code.join("\n"))}</code></pre>`);
    continue;
  }
  const titre = ligne.match(/^(#{1,4})\s+(.*)$/);
  if (titre) {
    const niveau = titre[1].length;
    const id = ancre(titre[2]);
    if (niveau === 1 && !titrePrincipal) { titrePrincipal = titre[2]; i++; continue; } // affiché dans l'en-tête
    if (niveau === 2) sections.push({ id, texte: texteBrut(titre[2]) });
    html.push(`<h${niveau} id="${id}">${enLigne(titre[2])}</h${niveau}>`);
    i++;
    continue;
  }
  if (/^---+$/.test(ligne)) { html.push("<hr>"); i++; continue; }
  if (ligne.startsWith(">")) {
    const bloc = [];
    while (i < lignes.length && lignes[i].startsWith(">")) bloc.push(lignes[i++].replace(/^>\s?/, ""));
    html.push(`<blockquote><p>${enLigne(bloc.join(" "))}</p></blockquote>`);
    continue;
  }
  if (ligne.startsWith("|")) {
    const rangees = [];
    while (i < lignes.length && lignes[i].startsWith("|")) rangees.push(lignes[i++]);
    const cellules = (r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    const [entete, , ...corps] = rangees;
    html.push('<div class="tableau"><table><thead><tr>' + cellules(entete).map((c) => `<th>${enLigne(c)}</th>`).join("")
      + "</tr></thead><tbody>" + corps.map((r) => "<tr>" + cellules(r).map((c) => `<td>${enLigne(c)}</td>`).join("") + "</tr>").join("")
      + "</tbody></table></div>");
    continue;
  }
  if (/^-\s+/.test(ligne)) { liste(false); continue; }
  if (/^\d+\.\s+/.test(ligne)) { liste(true); continue; }

  const paragraphe = [];
  while (i < lignes.length && lignes[i].trim() && !/^(#|```|>|\||-\s|\d+\.\s|---)/.test(lignes[i])) paragraphe.push(lignes[i++]);
  const contenu = enLigne(paragraphe.join(" "));
  html.push(contenu.startsWith("<figure>") ? contenu : `<p>${contenu}</p>`);
}

// Le titre « Nom : sous-titre » est découpé pour l'en-tête de la page outil
const [nomOutil, ...reste] = titrePrincipal.split(" : ");
const suite = reste.join(" : ");
const sousTitre = suite.charAt(0).toUpperCase() + suite.slice(1);
const P = "../../";
const minutes = Math.round(source.split(/\s+/).length / 200);

const page = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${echapper(texteBrut(nomOutil))} · Outil · DataAIrplane</title>
<meta name="description" content="${echapper(meta.description || "")}">
<meta name="theme-color" content="#070912">
<meta property="og:title" content="${echapper(meta.titre || "")}">
<meta property="og:description" content="${echapper(meta.description || "")}">
<meta property="og:type" content="article">
<link rel="icon" href="${P}favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="${P}assets/css/style.css">
</head>
<body class="page-outil">
<!-- Page générée par sources/generer-torrenttoddl.mjs : modifier l'article, pas ce fichier. -->
<div class="lecture" aria-hidden="true"><i></i></div>
<canvas id="reseau" aria-hidden="true"></canvas>
<div class="halo a" aria-hidden="true"></div><div class="halo b" aria-hidden="true"></div><div class="grille" aria-hidden="true"></div>
<header class="nav">
  <nav class="nav-in" aria-label="Navigation principale">
    <a class="logo" href="${P}index.html">__LOGO__<span>Data<b>AI</b>rplane</span></a>
    <button class="burger" aria-label="Ouvrir le menu" aria-expanded="false"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>
    <ul class="liens">
      <li><a href="${P}index.html">Accueil</a></li>
      <li><a href="${P}outils.html" aria-current="page">Outils</a></li>
      <li><a href="${P}cv.html">CV &amp; parcours</a></li>
      <li><a href="${P}blog/index.html">Blog <span class="pastille-bientot">bientôt</span></a></li>
    </ul>
  </nav>
</header>
<main>
  <div class="conteneur">
    <section class="outil-hero">
      <a class="retour revele" href="${P}outils.html">← Tous les outils</a>
      <div class="outil-tete revele">
        <div class="icone grande"><svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg></div>
        <div>
          <p class="surtitre">Outil · auto-hébergement</p>
          <h1>${enLigne(nomOutil)}</h1>
        </div>
      </div>
      <p class="outil-sous revele">${enLigne(sousTitre)}</p>
      <p class="intro revele">${echapper(meta.description || "")}</p>
      <div class="outil-infos revele">
        <span class="statut operationnel">Opérationnel</span>
        <span class="tag">Docker</span><span class="tag">AllDebrid</span><span class="tag">Radarr · Sonarr · Chaptarr</span><span class="tag">Synology</span><span class="tag">Plex</span>
        <span class="tag">≈ ${minutes} min de lecture</span>
      </div>
      <div class="actions revele">
        <a class="btn principal" href="#guide">Lire le guide ↓</a>
        <span class="btn" aria-disabled="true">Code source bientôt sur GitHub</span>
      </div>
    </section>

    <div class="outil-corps" id="guide">
      <aside class="sommaire-lateral" aria-label="Sections">
        <p>Sections</p>
        <ol>
${sections.map((s) => `          <li><a href="#${s.id}">${echapper(s.texte)}</a></li>`).join("\n")}
        </ol>
      </aside>
      <article class="prose">
${html.join("\n")}
      </article>
    </div>
  </div>
</main>
<footer class="pied">
  <div class="conteneur">
    <span>© <span data-annee>2026</span> DataAIrplane · dataairplane.com</span>
    <span><a href="${P}index.html">Accueil</a> · <a href="${P}outils.html">Outils</a> · <a href="${P}cv.html">CV</a> · <a href="https://github.com/DataAIrplane" target="_blank" rel="noopener">GitHub</a></span>
  </div>
</footer>
<script src="${P}assets/js/donnees.js"></script>
<script src="${P}assets/js/reseau.js"></script>
<script src="${P}assets/js/main.js"></script>
<script src="${P}assets/js/guide.js"></script>
</body>
</html>
`;

const logo = readFileSync(join(racine, "favicon.svg"), "utf8").trim().replace(' xmlns="http://www.w3.org/2000/svg"', ' aria-hidden="true"');
writeFileSync(join(racine, "outils/torrenttoddl/index.html"), page.replace("__LOGO__", logo));
console.log(`outils/torrenttoddl/index.html généré (${sections.length} sections)`);
