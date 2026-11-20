# Mettre l'espace client en ligne

Le code est prêt. Il manque trois comptes, à créer au nom de Standout Studio, puis quelques réglages dans Vercel. Tant que ce n'est pas fait, l'espace client tourne en mode démo sur les aperçus, et il reste fermé sur le vrai site.

Compter environ une heure. Les étapes 1 à 3 peuvent se faire dans n'importe quel ordre.

## 1. Supabase (base de données et connexion)

1. Créer un compte sur supabase.com, puis un projet. Région : **Canada (Central)**, pour garder les données au Canada.
2. Dans **SQL Editor**, coller tout le fichier `supabase/migrations/20261120000000_portal.sql`, puis cliquer sur **Run**.
3. Dans **Authentication > Sign In / Providers** :
   - laisser **Email** activé ;
   - désactiver **Allow new users to sign up**, car les comptes sont créés seulement par invitation depuis l'admin.
4. Dans **Authentication > URL Configuration** :
   - Site URL : `https://standoutstudio.ca` ;
   - Redirect URLs : `https://standoutstudio.ca/**` et `https://*-rayannsagnon60-1160s-projects.vercel.app/**`.
5. Dans **Project Settings > API**, noter trois valeurs :
   - l'URL du projet ;
   - la clé `anon` ;
   - la clé `service_role`. Elle est secrète : ne jamais la mettre dans le code ni l'envoyer par message.

Sur l'offre gratuite, Supabase met le projet en pause après 7 jours sans aucune visite. Avec de vrais clients, ça arrive rarement. Sinon, il suffit de le relancer en un clic.

## 2. Resend (emails)

1. Créer un compte sur resend.com.
2. **Domains > Add domain** : `standoutstudio.ca`. Resend donne des lignes DNS à ajouter chez le fournisseur du domaine. Attendre que le domaine passe à « Verified ».
3. **API Keys > Create** : noter la clé.

Gratuit jusqu'à 3 000 emails par mois.

## 3. Stripe (paiements)

1. Créer un compte sur stripe.com, au nom de l'entreprise si elle est déclarée, sinon au nom de Rayann. Stripe demande une pièce d'identité et un compte bancaire pour les versements.
2. Commencer en **mode test** :
   - **Developers > API keys** : noter la clé secrète `sk_test_…` ;
   - **Developers > Webhooks > Add endpoint** : URL `https://standoutstudio.ca/api/stripe/webhook`. Choisir ces événements :
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - noter le **Signing secret** `whsec_…`.
3. **Settings > Billing > Customer portal** : l'activer. C'est la page où le client gère ou arrête son entretien.
4. Quand tout marche en test, refaire l'étape 2 en **mode live**, puis remplacer les deux clés dans Vercel.

Commission : environ 2,9 % plus 0,30 $ par paiement par carte canadienne.

## 4. Vercel (variables)

Dans **Project Settings > Environment Variables**, ajouter, pour Production et Preview :

| Variable | Valeur |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé `anon` |
| `SUPABASE_SERVICE_ROLE_KEY` | clé `service_role` |
| `ADMIN_EMAILS` | vos deux adresses, séparées par une virgule |
| `RESEND_API_KEY` | clé Resend |
| `EMAIL_FROM` | `Standout Studio <bonjour@standoutstudio.ca>` |
| `STRIPE_SECRET_KEY` | `sk_test_…`, puis `sk_live_…` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_…` |
| `CRON_SECRET` | une longue phrase au hasard |
| `NEXT_PUBLIC_CLIENT_AREA` | `1` quand vous voulez afficher le lien « Espace client » sur le site |

Ensuite, redéployer.

Attention à l'offre Vercel. L'offre gratuite (Hobby) interdit l'usage commercial. Avec des clients qui paient, il faut passer à l'offre Pro (20 $ US par mois).

## 5. Premier essai

1. Ouvrir `https://standoutstudio.ca/fr/client/login` et entrer ton adresse (celle de `ADMIN_EMAILS`). Le lien reçu ouvre l'admin.
2. Dans l'admin, créer un client test avec une deuxième adresse à toi, puis l'inviter.
3. Ouvrir l'email d'invitation : tu arrives dans l'espace client, comme un client.
4. Faire tout le parcours :
   - partager une version, puis la valider côté client ;
   - envoyer une facture et la payer avec la carte de test Stripe `4242 4242 4242 4242` ;
   - vérifier que la facture passe à « payée » toute seule.
5. Remplir le formulaire de contact du site : le prospect doit apparaître dans l'admin.

## Ce qui n'est pas encore fait

- **Le lien avec la carte numérique** (`cards.standoutstudio.ca`). On le fera quand ce site sera branché sur la même base.
- **Les pièces jointes** (envoyer un fichier dans un message).
- **La messagerie en direct** : il faut recharger la page pour voir une nouvelle réponse.
