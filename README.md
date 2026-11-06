# RenovIm — dossier GitHub / Vercel

Version préparée le 6 novembre 2026. Le site existant, ses images, ses polices et ses interactions sont inclus. Le formulaire a été adapté pour Vercel et Resend. Ce dossier ne contient aucune clé privée.

## 1. Mettre les fichiers dans GitHub

1. Décompresser `RenovIm_Vercel.zip` sur votre ordinateur (clic droit → Extraire tout).
2. Ouvrir le dépôt : https://github.com/Diti1909/RenovIm-S-rl
3. Sur le dépôt vide, cliquer **uploading an existing file**. Si le dépôt contient déjà des fichiers : **Add file → Upload files**.
4. Ouvrir le dossier décompressé : sélectionner son **contenu**, fichiers ET dossiers, puis le glisser dans GitHub. Ne pas importer le ZIP, ni un dossier parent supplémentaire.
5. En bas, écrire « Ajout du site RenovIm », puis **Commit changes** sur `main`.
6. À la racine de GitHub, on doit voir `package.json`, `package-lock.json`, `app`, `lib`, `public`, `proxy.ts`, `next.config.ts`, `tsconfig.json`, `vercel.json` et ce README.

Le fichier `.env.example` est un modèle vide : ne jamais le remplir dans GitHub. Ne pas importer de `.env.local`, de clé Resend, de jeton Turso ou de dossiers `node_modules` / `.next`.

## 2. Créer le projet Vercel depuis ce dépôt

Le compte Vercel peut être connecté à GitHub sans qu'un projet ait été importé. La capture fournie affichait encore « Deploy your first project ».

1. Ouvrir https://vercel.com/new ou **Import Project → Import**.
2. Choisir `Diti1909/RenovIm-S-rl`. Si absent, ajuster les autorisations de l'application GitHub Vercel pour ce dépôt.
3. Réglages :

| Réglage | Valeur |
| --- | --- |
| Project Name | `renovim` (ou un nom disponible) |
| Framework Preset | `Next.js` |
| Root Directory | `./` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | laisser la valeur par défaut Next.js ; ne pas mettre `dist` |
| Node.js | `22.x` |

4. Cliquer **Deploy**. Le site s'affichera même sans secrets ; le formulaire restera indisponible jusqu'à l'étape 4. Téléphone, e-mail et WhatsApp restent utilisables.

**Offre Vercel :** Hobby est réservé aux usages personnels non commerciaux. Pour le site de l'entreprise, sélectionner une offre permettant l'usage commercial, comme Pro. Aucun abonnement n'a été souscrit pour vous. Vérifier le tarif et les limites dans Vercel avant validation.

## 3. Créer la base technique du formulaire

Cette copie emploie **Turso Cloud (base libSQL)** pour conserver les compteurs antispam et les références d'envoi entre les différentes instances Vercel. Une simple mémoire locale ne suffirait pas. Aucun message, photo ou IP en clair n'est enregistré dans cette base par le site.

1. Créer un compte sur https://turso.tech et ouvrir le tableau de bord.
2. Créer une base **libSQL** nommée `renovim-contact`, dans une région européenne disponible. Ne pas choisir le nouveau moteur « Turso Database » : cette version emploie le client libSQL.
3. Dans les informations de connexion, copier la **Database URL**, commençant par `libsql://`.
4. Créer un **Database auth token** autorisant lecture et écriture sur cette seule base. Copier le jeton en lieu sûr ; ne pas le mettre dans GitHub ni dans une conversation.
5. Les tables sont créées automatiquement au premier envoi. Aucun SQL à copier.

Si les libellés de l'interface diffèrent : consulter https://docs.turso.tech/sdk/ts/quickstart, partie « Remote libSQL database ». La base doit être libSQL ; le domaine et le jeton sont ceux de la base, pas un jeton d'administration du compte.

Prévoir le renouvellement du jeton s'il expire. Choisir une offre adaptée à l'entreprise et vérifier quotas, conditions de traitement et région.

## 4. Où mettre la clé API Resend

**Vercel → ouvrir le projet `renovim` → Settings → Environment Variables → Add Environment Variable.**

Ajouter ces sept variables, avec les noms exactement écrits ci-dessous. Choisir l'environnement **Production**. Marquer les clés et jetons comme sensibles lorsque proposé. Ne pas activer l'envoi sur les Preview de branches avec des clés de production.

| Name / Key | Value |
| --- | --- |
| `RESEND_API_KEY` | Votre clé Resend copiée, commençant par `re_` |
| `CONTACT_FROM` | `info@renov-im.ch` |
| `CONTACT_TO` | `info@renov-im.ch` |
| `CONTACT_DELIVERY_ENABLED` | `true` |
| `CONTACT_RATE_SECRET` | Une nouvelle chaîne aléatoire d'au moins 32 caractères créée avec le générateur de votre gestionnaire de mots de passe |
| `TURSO_DATABASE_URL` | L'URL `libsql://...` de l'étape 3 |
| `TURSO_AUTH_TOKEN` | Le jeton de cette base créé à l'étape 3 |

La clé Resend doit avoir **Sending access**, limité à `renov-im.ch`. Le domaine doit rester Verified dans Resend. Ne préfixer aucun nom par `NEXT_PUBLIC_` : les clés sont réservées au serveur.

Puis **Deployments → dernier déploiement → menu ⋯ → Redeploy**. Une modification d'environnement ne modifie pas un ancien déploiement : ce redéploiement est nécessaire.

Le fonctionnement prévu : visiteur → formulaire → serveur Vercel → Resend → **info@renov-im.ch dans Google Workspace**. Resend ne remplace pas votre boîte. « Répondre » à une demande reçue reprend l'adresse du client via Reply-To.

## 5. Vérifier avant d'ouvrir aux clients

1. Ouvrir l'URL Vercel du déploiement récent, puis `/contact`.
2. Envoyer une demande marquée « TEST » avec une adresse e-mail que vous contrôlez, d'abord sans photo.
3. Vérifier la réception dans `info@renov-im.ch`, y compris les indésirables. Vérifier aussi l'envoi dans **Resend → Emails**.
4. Faire un second test avec une petite photo JPEG et vérifier la pièce jointe. Limite : 5 photos, 3 Mo au total ; JPG, PNG et WebP sont convertis en JPEG sans métadonnées intégrées.
5. Cliquer Répondre dans votre messagerie et vérifier que le destinataire est l'adresse du testeur.
6. Vérifier téléphone / WhatsApp sur un téléphone et le formulaire sur ordinateur. Un lien d'appel sur ordinateur nécessite une application téléphonique ; cela ne déclenche pas toujours un appel directement.

La confirmation à l'écran signifie que Resend a accepté le message, pas qu'il a déjà été lu ou livré en boîte de réception. Aucun accusé automatique n'est envoyé au client.

Dépannage :
- Formulaire indisponible : vérifier les sept variables, Production, puis Redeploy.
- Envoi non confirmé : vérifier domaine et permission Resend, URL/jeton et accès Turso ; consulter les logs Vercel et Resend sans publier de clé.
- Message absent : vérifier Resend, les indésirables Google Workspace et `CONTACT_TO`.
- Trop de tentatives : limite de dix requêtes par heure et par adresse réseau. Attendre une heure ou utiliser le contact direct.
- Désactiver immédiatement le formulaire : `CONTACT_DELIVERY_ENABLED=false`, puis Redeploy.

## 6. Relier renov-im.ch

Après les tests : **Vercel → projet → Settings → Domains**, ajouter `renov-im.ch` et éventuellement `www.renov-im.ch`. Copier chez Infomaniak uniquement les enregistrements indiqués par Vercel pour le site web, puis vérifier la validation HTTPS.

**Conserver les enregistrements de messagerie existants** : MX Google, SPF Google, DKIM Google, DMARC, DKIM Resend et CNAME `send` / `rsend`. Ne pas activer la réception Resend et ne pas changer les serveurs DNS du domaine pour cette migration. Si un enregistrement web existe déjà au même nom, le comparer avant remplacement.

## 7. Contenu et confidentialité avant ouverture publique

Les pages et coordonnées existantes sont préservées. Le logo, le téléphone, les services, l'avant/après et la photo LED de détail sont inclus. Les mentions sur l'hébergement ont été adaptées à Vercel, Turso, Resend et Google Workspace.

Quelques informations de l'ancien site étaient encore en attente : inscription effective de la Sàrl, numéro IDE, calendrier de suppression des e-mails/photos et renseignements sur les fournisseurs/transferts internationaux. Les pages légales signalent toujours ces points ; les compléter dans `app/site.tsx` avec les informations confirmées avant l'ouverture publique. Le dossier n'est pas une attestation de conformité juridique.

Les compteurs expirés sont purgés à l'occasion des envois suivants ; les références d'envoi de plus de trente jours également. La suppression des e-mails et des journaux/backups chez les fournisseurs doit être gérée dans leurs services. Aucun analytics ni pixel publicitaire n'est ajouté.

## 8. Maintenance technique

- Installer : `npm ci`
- Développement : `npm run dev`
- Compiler : `npm run build`
- Démarrer : `npm start`
- Tests du formulaire : `npm test` (transport Resend simulé ; aucun e-mail réel envoyé)
- Vérifier les types : `npm run typecheck`
- Audit : `npm audit --omit=dev`

Versions verrouillées dans package-lock.json. Ne pas envoyer node_modules sur GitHub. Les fichiers éditoriaux sont `app/content.ts` et `app/site.tsx`, le style `app/globals.css`, les images `public/images`.

Les clés restent exclusivement dans Vercel. Ne jamais mettre une clé dans le code, une capture ou un ticket GitHub. Si une clé est exposée, la révoquer et en générer une nouvelle.

## Vérifications réalisées

Compilation Next.js et TypeScript réussie. 25 contrôles du formulaire réussis avec transport simulé et base libSQL locale. Pages et ressources liées vérifiées par requêtes HTTP locales. Audit des dépendances de production sans vulnérabilité signalée au moment de la préparation. Tests du formulaire réussis sous Node 22 et Node 24. Node 22 configuré pour Vercel. Pas de déploiement Vercel effectué et pas de test d'e-mail réel sans votre configuration. Pas de certification de rendu sur tous les appareils.

## Documentation officielle

- https://vercel.com/docs/plans/hobby
- https://vercel.com/docs/environment-variables/managing-environment-variables
- https://vercel.com/docs/functions/limitations
- https://docs.turso.tech/sdk/ts/quickstart
- https://resend.com/docs/send-with-nextjs
