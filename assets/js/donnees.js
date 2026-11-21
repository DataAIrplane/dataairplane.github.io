/*
 * ============================================================
 *  DONNÉES DU SITE — c'est le seul fichier à modifier
 *  pour ajouter un site, un outil, une certification, etc.
 * ============================================================
 *
 *  statut possibles :
 *   - sites / outils : "en-ligne" | "operationnel" | "en-dev" | "bientot"
 *   - certifications : "obtenue" | "en-cours" | "prevue"
 */
window.DONNEES = {
  profil: {
    nom: "DataAIrplane",
    titre: "Data & IA · Développeur de projets",
    accroche:
      "Je construis des outils autour de la donnée et de l'IA, je les mets en ligne et je documente ce que j'apprends en chemin.",
    localisation: "France",
    email: "", // ex : "contact@dataairplane.com" (laisser vide pour masquer)
    github: "https://github.com/DataAIrplane",
    linkedin: "", // ex : "https://www.linkedin.com/in/ton-profil"
    motsCles: ["la data", "l'IA", "l'automatisation", "le web"],
  },

  // ---------- Sous-domaines de dataairplane.com ----------
  sites: [
    {
      nom: "TirageScope",
      url: "https://tiragescope.dataairplane.com",
      description:
        "Résultats et statistiques des tirages Euromillions, Loto, Crescendo, EuroDreams et Keno sur tout l'historique : numéros les plus sortis, écarts, calendrier, simulateur.",
      tags: ["Next.js", "Supabase", "Statistiques", "FR / EN"],
      statut: "en-ligne",
      icone: "chart",
    },
  ],

  // ---------- Outils ----------
  outils: [
    {
      nom: "TorrentToDDL",
      description:
        "Les *arr cherchent, AllDebrid télécharge, le NAS Synology rapatrie en direct : vos films et séries arrivent tout seuls dans Plex, sans client BitTorrent. Guide d'installation complet.",
      tags: ["Docker", "AllDebrid", "*arr", "Synology", "Plex"],
      statut: "operationnel",
      page: "outils/torrenttoddl/index.html", // page de présentation de l'outil
      code: "", // URL du dépôt GitHub quand il sera public
      icone: "bolt",
    },
  ],

  // ---------- CV : compétences (niveau sur 100) ----------
  competences: [
    { groupe: "Data", items: [["Python", 80], ["SQL", 75], ["Analyse statistique", 70]] },
    { groupe: "IA", items: [["Prompt engineering", 85], ["Agents & automatisation", 70], ["Machine learning", 50]] },
    { groupe: "Web", items: [["JavaScript", 70], ["Next.js / React", 60], ["Supabase / Postgres", 60]] },
  ],

  // ---------- CV : expériences (de la plus récente à la plus ancienne) ----------
  experiences: [
    {
      periode: "2026 — aujourd'hui",
      titre: "Créateur de projets · DataAIrplane",
      lieu: "Projets personnels",
      texte: "Conception et mise en ligne de sites data (TirageScope) et d'outils (TorrentToDDL).",
    },
    {
      periode: "À compléter",
      titre: "Poste précédent",
      lieu: "Entreprise",
      texte: "Quelques mots sur les missions et les résultats.",
    },
  ],

  // ---------- Parcours de certifications (dans l'ordre du « plan de vol ») ----------
  certifications: [
    {
      nom: "Certification n°1",
      organisme: "Organisme",
      date: "2025",
      statut: "obtenue",
      texte: "Ce que cette certification valide, en une phrase.",
      lien: "",
    },
    {
      nom: "Certification n°2",
      organisme: "Organisme",
      date: "En cours",
      statut: "en-cours",
      progression: 40, // en %, seulement pour "en-cours"
      texte: "Ce que tu apprends en ce moment.",
      lien: "",
    },
    {
      nom: "Prochaine étape",
      organisme: "Organisme",
      date: "Prévue",
      statut: "prevue",
      texte: "La prochaine destination du plan de vol.",
      lien: "",
    },
  ],
};
