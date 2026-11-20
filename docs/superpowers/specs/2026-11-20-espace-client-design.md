# Espace client et espace admin : conception

Date : 20 novembre 2026. Décisions prises avec Rayann (questions 1 à 5), puis par délégation ("je te laisse le lead").

## But

Trois parties qui partagent les mêmes données :

1. **Le site public** (déjà en ligne) : le formulaire de contact crée un prospect.
2. **L'espace client** (`/client`, `/fr/client`) : chaque client suit son projet, valide les versions, paie, écrit au studio.
3. **L'espace admin** (`/admin`) : Rayann et Steven gèrent les clients, les projets, les versions, les factures et les messages.

Les quatre objectifs comptent : moins d'allers-retours (A), être payé facilement (B), avoir l'air professionnel (C), garder les clients après le lancement (D).

## Contraintes décidées

| Sujet | Décision |
|---|---|
| Taille | Moins de 10 clients en même temps. Pas de recherche avancée, pas de pagination. |
| Paiement | Stripe : factures payables par carte, entretien à 39 $/mois en prélèvement automatique. |
| Connexion | Lien magique par email, sans mot de passe. Les comptes sont créés par invitation, jamais par inscription libre. |
| Liens entre les parties | Prioritaires : formulaire → prospect, emails automatiques, validation des versions. Ensuite : messagerie, relances automatiques. |
| Pile technique | Tout dans le projet Next.js actuel. Supabase (Postgres, connexion, sécurité par ligne), Resend (emails), Stripe (paiements). |

## Architecture

- La vitrine reste l'application unique actuelle (`SiteRoot`). Elle ne s'affiche plus sur `/client`, `/fr/client`, `/admin`, `/auth` : ces pages sont de vraies pages Next.js rendues par le serveur, qui vérifie la session avant d'envoyer la moindre donnée.
- Les liens de la vitrine vers l'espace client sont des liens normaux (rechargement complet), pour ne pas mélanger les deux mondes.
- **Mode démo** : si Supabase n'est pas configuré (variables absentes), tout tourne sur une base en mémoire avec des données d'exemple, les emails sont affichés dans l'admin au lieu d'être envoyés, et le paiement est simulé. Le mode démo est refusé en production (`VERCEL_ENV=production`) sauf si `PORTAL_DEMO=1` est posé exprès.
- Une seule couche de logique (`src/lib/portal/service.ts`) parle à la base à travers un petit adaptateur de tables. Deux adaptateurs : Supabase et mémoire. La logique est donc écrite et testée une seule fois.

## Modèle de données

| Table | Contenu |
|---|---|
| `clients` | Nom, entreprise, email de contact, téléphone, langue (`fr`/`en`), statut (`prospect`, `active`, `care`, `archived`), message d'origine. |
| `client_notes` | Notes internes, dans une table à part que seuls les admins peuvent lire. |
| `users` | Lien vers le compte de connexion : email, nom, rôle (`client`/`admin`), `client_id`. Plusieurs utilisateurs possibles par client. |
| `projects` | Client, nom, forfait (`essential`, `growth`, `signature`), étape (`call`, `brief`, `build`, `launch`, `live`), dates de chaque étape, révisions incluses, prochaine action (texte FR/EN) et qui doit agir (`client`/`studio`). |
| `versions` | Projet, numéro, lien de prévisualisation, note du studio, statut (`pending`, `approved`, `changes_requested`), commentaire du client, dates. Le compteur de révisions = nombre de versions avec `changes_requested`. |
| `invoices` | Client, projet (facultatif), numéro (`F-2026-001`), libellé, montant avant taxes en cents, taux de taxe, statut (`draft`, `sent`, `paid`, `overdue`, `void`), échéance, référence Stripe. Un devis = une facture en `draft`. |
| `subscriptions` | Entretien mensuel : client, statut (`none`, `active`, `past_due`, `canceled`), prix en cents, références Stripe. |
| `messages` | Fil client ↔ studio : client, auteur, texte, date. |
| `events` | Journal : type, client, projet, données, date. Sert à l'historique, aux emails et aux relances (on ne relance pas deux fois la même chose). |

Sécurité : chaque table a la sécurité par ligne de Postgres activée. Ce que l'espace client affiche est lu avec la session du client : la base ne lui renvoie que les lignes de son `client_id`, jamais les factures en brouillon, jamais les notes internes. Aucune écriture n'est permise directement depuis une session : toutes les modifications passent par le serveur, après les règles de `service.ts` (double protection).

## Connexion

1. La personne entre son email sur `/client/login`.
2. Si l'email correspond à un compte (ou à `ADMIN_EMAILS`), le serveur génère un lien à usage unique valable 1 heure et l'envoie par email avec notre gabarit. Sinon, il ne se passe rien, mais l'écran affiche le même message (on ne révèle pas qui est client).
3. Le lien ouvre `/auth/confirm`, qui crée la session (cookie `httpOnly`, `Secure`) et redirige vers `/client` ou `/admin` selon le rôle.
4. L'admin invite un client : création du compte, puis email d'invitation avec un lien de connexion.

Les adresses dans `ADMIN_EMAILS` deviennent admin à leur première connexion. Personne d'autre ne peut devenir admin. Une même adresse ne peut demander qu'un lien toutes les 30 secondes.

## Écrans

**Espace client** (FR/EN, langue du client par défaut, bouton pour changer) :
- Le projet : étapes avec dates, prochaine action et qui doit agir, révisions utilisées sur incluses.
- La dernière version : lien de prévisualisation, boutons « J'approuve » et « Demander des modifications » avec commentaire. Les anciennes versions restent listées.
- Factures : montant, statut, bouton « Payer » (Stripe) pour celles envoyées ou en retard.
- Entretien : statut, bouton pour l'activer après le lancement.
- Messages : fil et champ d'envoi.
- Historique : le journal des événements visibles par le client.

**Espace admin** (en français, outil interne) :
- Tableau de bord : nouveaux prospects, projets en attente du studio, projets en attente du client, factures impayées, derniers événements.
- Fiche client : coordonnées et notes internes, utilisateurs et invitation, projets (changer d'étape, prochaine action, partager une version), factures (créer, envoyer, marquer payée, annuler), entretien, messages, historique.
- Nouveau client (sans passer par le formulaire).
- Emails envoyés (mode démo seulement), pour voir ce que les clients recevraient.

## Emails automatiques

| Événement | Destinataire |
|---|---|
| Nouveau prospect via le formulaire | Admins |
| Invitation | Client |
| Lien de connexion | La personne |
| Nouvelle version partagée | Client |
| Version approuvée ou modifications demandées | Admins |
| Nouvelle étape | Client |
| Facture envoyée | Client |
| Facture payée | Admins et client (reçu) |
| Nouveau message | L'autre côté |
| Relance : commentaires attendus depuis 5 jours | Client (au plus tous les 5 jours) |
| Relance : facture en retard | Client (au plus tous les 7 jours), et la facture passe en `overdue` |

Les emails partent dans la langue du client. Les relances tournent une fois par jour (`/api/cron/reminders`, protégé par `CRON_SECRET`).

## Paiements

- « Payer » crée une session Stripe Checkout (CAD) pour le montant TTC de la facture. Le webhook `checkout.session.completed` marque la facture payée.
- L'entretien crée une session Checkout en mode abonnement (39 $/mois). Les webhooks d'abonnement tiennent le statut à jour.
- Le webhook vérifie la signature Stripe. On ne se fie jamais à la page de retour pour marquer une facture payée.
- Taxes : taux par facture, 0 % par défaut. Un petit fournisseur (moins de 30 000 $ de revenus sur 12 mois) n'est pas obligé de facturer la TVH. À revoir avec la décision sur l'entreprise.

## Erreurs

- Session expirée ou absente : retour à la page de connexion, puis retour à la page demandée.
- Action interdite (un client qui vise les données d'un autre) : réponse 404, rien n'est révélé.
- Email ou Stripe en panne : l'action principale réussit quand même (la version est partagée), l'échec est journalisé dans `events`, et l'admin le voit.
- Formulaire de contact : Web3Forms reste l'envoi principal. La création du prospect est un envoi en plus ; s'il échoue, le visiteur ne voit pas d'erreur.

## Tests

- Tests de la logique (`node --test`) sur l'adaptateur mémoire : droits d'accès, compteur de révisions, relances, webhook Stripe.
- Parcours complet dans un vrai navigateur (Playwright) en mode démo : prospect → client invité → connexion → version → validation → facture → paiement simulé, sur téléphone, tablette et ordinateur.
- `npm run lint` et `npm run build` avant la PR.

## Hors de cette étape

- Carte numérique (`cards.standoutstudio.ca`) : la connexion partagée viendra quand ce site sera branché.
- Pièces jointes et fichiers.
- Temps réel dans la messagerie (on recharge la page).
