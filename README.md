# dataairplane.com

Site principal de DataAIrplane : 100 % statique (HTML, CSS, JS), sans base de données, prévu pour l'hébergement gratuit OVH (100 Mo). Le site entier pèse moins de 100 Ko.

## Pages

| Fichier | Contenu |
|---|---|
| `index.html` | Accueil : sous-domaines en ligne, aperçu des outils, lien vers le parcours |
| `outils.html` | Les outils (TorrentToDDL pour commencer) |
| `cv.html` | CV interactif : compétences, plan de vol des certifications, expériences |
| `blog/` | Emplacement réservé pour le futur blog |
| `404.html` | Page d'erreur |

## Modifier le contenu

Tout le contenu (sites, outils, compétences, expériences, certifications, liens de contact) est dans **un seul fichier** : `assets/js/donnees.js`. Pour ajouter un sous-domaine, copie le bloc de TirageScope dans `sites` et change les valeurs. Pas besoin de toucher au HTML.

## Tester en local

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Mettre en ligne sur OVH (FTP)

1. **Récupérer les accès FTP** : espace client OVH → *Web Cloud* → *Hébergements* → ton hébergement → onglet **FTP - SSH**. Note le serveur (ex. `ftp.clusterXXX.hosting.ovh.net`), l'identifiant et, si besoin, clique sur *Changer le mot de passe*.
2. **Ouvrir FileZilla** (gratuit) : Hôte = le serveur FTP, Identifiant, Mot de passe, Port `21`, puis *Connexion rapide*.
3. **Aller dans le dossier `www`** côté serveur (c'est la racine de dataairplane.com). Supprime l'ancien `index.html` d'OVH s'il y en a un.
4. **Décompresser `dataairplane-site.zip`** sur ton ordinateur, puis glisser **le contenu** du dossier (pas le dossier lui-même) dans `www`. Il faut voir `index.html`, `cv.html`, `assets/`… directement dans `www`.
5. **Le fichier `.htaccess`** commence par un point, il peut être masqué : dans FileZilla, menu *Serveur* → *Forcer l'affichage des fichiers cachés* pour vérifier qu'il est bien envoyé.
6. **HTTPS** : dans l'espace client, onglet *Multisite*, vérifie que le certificat SSL (Let's Encrypt, gratuit) est actif pour `dataairplane.com` et `www.dataairplane.com`. Le `.htaccess` redirige ensuite automatiquement vers `https://`. Si le site affiche une erreur de redirection, supprime le bloc « Forcer le HTTPS » du `.htaccess` le temps que le certificat soit actif.

Pour une mise à jour : modifie `assets/js/donnees.js`, puis renvoie seulement ce fichier par FTP.

> Les sous-domaines (comme `tiragescope.dataairplane.com`) ne sont pas touchés : ils pointent ailleurs via la zone DNS.
