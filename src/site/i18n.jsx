import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setRouterLang, splitPath } from './router';

const NNBSP = '\u202F';

export const COPY = {
  fr: {
    nav: {
      work: 'Réalisations', services: 'Services', about: 'À propos', contact: 'Contact',
      card: 'La carte', account: 'Espace client', myAccount: 'Mon espace', skip: 'Aller au contenu',
      menu: 'Menu', close: 'Fermer', homeAria: 'Standout Studio, accueil', lang: 'Langue'
    },
    routes: { home: 'Accueil', work: 'Réalisations', services: 'Services', about: 'À propos', contact: 'Contact', card: 'La carte', login: 'Espace client', account: 'Espace client', notfound: 'Page introuvable' },
    notFound: { title: ['Cette page', 'n’existe pas'], text: 'Le lien est peut-être ancien, ou il manque une lettre. Le reste du site, lui, est bien là.', back: 'Retour à l’accueil' },
    loader: 'Studio web bilingue, Ottawa',
    where: 'Ottawa et à distance. Français et anglais.',
    menu: { hello: 'Bonjour, {name}' },
    footerAria: 'Pied de page',
    home: {
      h1: ['Stand', 'out'],
      sub: 'Studio web bilingue à Ottawa. On fait des sites pour les indépendants et les petites entreprises qui refusent de se fondre dans le décor.',
      start: 'Démarrer un projet', seeWork: 'Voir les réalisations',
      hint: 'La seule bille en couleur, c’est vous. Faites-vous de la place.', hintSmall: 'La seule bille en couleur, c’est vous.',
      philoLead: 'La plupart des marques essaient de se fondre dans le décor.',
      philoBreak: ['Nous, on préfère', 'les rendre impossibles à ignorer.'],
      philoMore: 'Ce qu’on croit, en entier', workMore: 'Toutes les réalisations',
      principles: [
        ['Un point de vue d’abord.', 'Avant les couleurs et les polices, on décide de ce que vous défendez. Le reste en découle.'],
        ['Une seule chose mémorable.', 'Chaque page a un élément qui sort du lot. Un seul. C’est ce qui rend tout le reste lisible.'],
        ['Rapide et accessible, sans négocier.', 'Un site lent ou illisible ne sort pas du lot. Il sort de l’onglet.'],
        ['Mesurer, puis ajuster.', 'Quelques chiffres simples pour savoir qui vous trouve et ce qui fonctionne.']
      ],
      servicesTitle: 'Quatre façons de sortir du lot.',
      services: [
        ['Qu’on se souvienne de vous.', 'Positionnement et identité', 'On trouve ce qui vous rend différent et on lui donne une forme : un ton, une typo, des couleurs, une phrase qu’on retient.'],
        ['Qu’on ait envie de rester.', 'Design et développement web', 'Sites de marque personnelle, vitrines et boutiques Shopify. Rapides, accessibles, bilingues au besoin.'],
        ['Qu’on vous trouve.', 'Référencement local', 'Les bons mots aux bons endroits, une fiche Google à jour et de quoi mesurer ce qui marche.'],
        ['Qu’on n’ait plus à y penser.', 'Hébergement et entretien', 'Mises à jour, sauvegardes et petites corrections, chaque mois. Résiliable en tout temps.']
      ],
      wallLead: 'Sur le web, presque tout se ressemble.',
      wallTwist: 'Presque.',
      processTitle: 'Du premier appel à la mise en ligne.',
      steps: [
        ['Un appel', 'Objectifs, budget et échéancier, par Zoom ou au téléphone.'],
        ['Le brief', 'Pages, contenus et direction visuelle validés avant de construire.'],
        ['La création', 'On partage les versions et on révise avec vous.'],
        ['Le lancement', 'Mise en ligne, remise des accès et statistiques de base.']
      ],
      processNote: 'La plupart des forfaits sont livrés en quelques semaines, une fois vos contenus et vos photos reçus.',
      ctaTitle: ['Prêt à sortir', `du lot${NNBSP}?`],
      ctaText: 'Un court message suffit. On répond en 1 à 2 jours ouvrables avec un forfait suggéré, un échéancier réaliste et une fourchette de prix.',
      ctaBtn: ['Démarrer', 'un projet']
    },
    showcase: {
      title: ['On ne fait pas juste des sites.', 'On fait des noms qu’on retient.'],
      intro: 'Quatre sites en ligne. Ouvrez-les, cliquez partout, jugez par vous-même.',
      visit: 'Visiter le site de {name}', alt: 'Aperçu du site {name}'
    },
    work: {
      title: 'Réalisations',
      lead: 'Quatre sites en ligne, quatre personnalités. Entrez dans chacun.',
      open: 'Entrer dans le projet',
      indexTitle: 'Index',
      indexLead: 'Survolez pour voir le site, cliquez pour l’ouvrir.',
      more: 'D’autres projets sont en cours de lancement. Le vôtre pourrait être le prochain.'
    },
    caseStudy: {
      client: 'Client', sector: 'Secteur', scope: 'Ce qu’on a fait', year: 'Année', live: 'En ligne',
      visit: 'Voir le site en ligne', next: 'Projet suivant', back: 'Toutes les réalisations',
      outcomeTitle: 'Le résultat', outcome: 'Le site est en ligne. Le mieux, c’est encore d’aller voir.',
      explore: 'Faites défiler l’intérieur des écrans pour parcourir tout le site, sur ordinateur et sur téléphone.',
      desktopAlt: 'Page d’accueil complète de {name} sur ordinateur', mobileAlt: 'Page d’accueil complète de {name} sur téléphone'
    },
    servicesPage: {
      intro: 'Tout ce qu’on fait tient en deux mots. D’abord, une base solide. Ensuite, on la fait remarquer.',
      stand: {
        lead: 'La structure. Ce qui fait qu’on vous prend au sérieux.',
        items: [
          ['Positionnement', 'Ce qui vous rend différent, dit en une phrase qu’on retient.'],
          ['Identité', 'Un ton, une typo, des couleurs. Assez précis pour qu’on vous reconnaisse sans votre nom.'],
          ['Architecture du site', 'Les bonnes pages, dans le bon ordre, avec un chemin évident vers le contact.']
        ]
      },
      out: {
        lead: 'L’expression. Ce qui fait qu’on se souvient de vous.',
        items: [
          ['Direction créative', 'Un parti pris visuel, puis la discipline de s’y tenir.'],
          ['Design web', 'Une mise en page qui a un point de vue, pas un modèle repeint.'],
          ['Développement et interactions', 'Rapide, accessible, bilingue au besoin, avec du mouvement seulement là où il sert.']
        ]
      },
      afterTitle: 'Après le lancement',
      after: [
        ['Hébergement et entretien', 'Mises à jour, sauvegardes et petites corrections, 39 $ par mois. Résiliable en tout temps.'],
        ['Boutiques Shopify', 'Quand il faut vendre en ligne, sans changer de studio.'],
        ['Cartes numériques', 'Votre carte de visite dans le téléphone, avec code QR et Wallet.']
      ],
      packagesTitle: 'Forfaits',
      packagesLead: 'Des prix clairs, annoncés avant de commencer. Taxes en sus.',
      from: 'À partir de',
      popular: 'Le plus populaire',
      plans: [
        { id: 'essential', name: 'Essentiel', price: '399 $', features: ['Site d’une page', 'Design sur mesure, adapté au mobile', 'Un appel à l’action clair', 'Référencement de base', '2 tours de révision'] },
        { id: 'growth', name: 'Croissance', price: '999 $', featured: true, features: ['Site de 3 à 5 pages', 'Design sur mesure, adapté au mobile', 'Un parcours pensé pour convertir', 'Référencement local et statistiques', 'Formulaire de contact ou de devis', '3 tours de révision'] },
        { id: 'signature', name: 'Signature', price: '1 299 $', features: ['Site de 6 à 10 pages', 'Expérience entièrement sur mesure', 'Parcours client avancé', 'Référencement avancé et statistiques', 'Fonctionnalités sur mesure', '5 tours de révision'] }
      ],
      planCta: 'Démarrer avec ce forfait',
      careNote: 'En option après la mise en ligne : hébergement et entretien à 39 $ par mois.'
    },
    about: {
      title: ['On n’est pas là', 'pour faire joli'],
      lead: 'Standout est un petit studio bilingue à Ottawa. On travaille en tête-à-tête avec des indépendants et des petites entreprises, à des prix qui restent accessibles.',
      whyTitle: 'Pourquoi on existe',
      why: 'Parce que la plupart des sites se ressemblent, et que ce n’est pas une fatalité. Un bon site ne demande pas plus d’argent. Il demande un point de vue, et le courage de s’y tenir.',
      believeTitle: 'Ce qu’on croit',
      refuseTitle: 'Ce qu’on refuse',
      refuse: [
        'Les modèles achetés puis repeints.',
        'Les chiffres inventés pour faire sérieux.',
        'Le jargon qui cache qu’on n’a rien à dire.',
        'Les sites qu’il faut une semaine pour modifier.',
        'Les animations qui ne servent à rien.'
      ],
      howTitle: 'Comment on travaille',
      how: [
        ['En tête-à-tête', 'Vous parlez aux personnes qui font votre site, pas à un intermédiaire.'],
        ['En français et en anglais', 'À Ottawa et à distance, dans la langue de vos clients.'],
        ['À prix accessible', 'Des forfaits clairs, annoncés avant de commencer.']
      ]
    },
    card: {
      title: 'Votre carte de visite tient dans un téléphone.',
      lead: 'Un scan pour vous ajouter, Apple Wallet et Google Wallet inclus, et des mises à jour sans rien réimprimer. Essayez avec votre nom.',
      name: 'Votre nom', role: 'Votre métier',
      fine: 'Une version gratuite pour commencer, une version premium pour aller plus loin.',
      cta: 'Découvrir les cartes', hint: 'Inclinez-la avec la souris.', scan: ['Scannez pour', 'm’ajouter.']
    },
    contact: {
      title: ['Faisons quelque chose', 'qui sort du lot'],
      hello: 'Bonjour, je m’appelle', needIntro: 'et j’aurais besoin', reach: 'Vous pouvez m’écrire à', more: 'Un mot de plus',
      phName: 'votre nom', phEmail: 'votre courriel', phMore: 'facultatif',
      needOptions: ['d’un site de marque personnelle', 'd’une vitrine pour mon entreprise', 'd’une boutique Shopify', 'd’hébergement et d’entretien', 'd’une carte numérique', 'de conseils, pour commencer'],
      lead: 'Envoyez une courte note sur ce dont vous avez besoin. On vous répond avec un forfait suggéré, un échéancier réaliste et une fourchette de prix.',
      where: 'Ottawa et à distance, en français et en anglais.',
      legend: `De quoi avez-vous besoin${NNBSP}?`,
      needs: ['Site de marque personnelle', 'Vitrine d’entreprise', 'Boutique Shopify', 'Hébergement et entretien', 'Carte numérique'],
      name: 'Nom', email: 'Courriel', phone: 'Téléphone (facultatif)', message: 'Message', send: 'Envoyer',
      sentTitle: 'Message envoyé.',
      sentText: 'Merci. On vous répond en 1 à 2 jours ouvrables avec un forfait suggéré.',
      mailTitle: 'Votre courriel est prêt.',
      mailText: 'Votre messagerie s’est ouverte avec le message déjà rempli. Il ne reste qu’à l’envoyer.',
      sending: 'Envoi…',
      error: 'L’envoi n’a pas fonctionné. Réessayez, ou écrivez-nous directement :',
      subject: 'Projet', subjectDefault: 'site web',
      body: { name: 'Nom', email: 'Courriel', phone: 'Téléphone', need: 'Besoin' }
    },
    login: {
      title: 'Espace client',
      lead: 'Suivez l’avancement de votre site, donnez vos commentaires, gérez votre hébergement et votre carte numérique.',
      notClient: `Pas encore client${NNBSP}?`, start: 'Démarrer un projet',
      signIn: 'Connexion', resetTitle: 'Mot de passe oublié',
      resetHelp: 'Entrez votre courriel, on vous envoie un lien pour en choisir un nouveau.',
      email: 'Courriel', password: 'Mot de passe', show: 'Afficher', hide: 'Masquer',
      submit: 'Se connecter', submitting: 'Connexion…', sendLink: 'Envoyer le lien', sending: 'Envoi…',
      forgot: 'Mot de passe oublié', back: 'Revenir à la connexion',
      checkTitle: 'Vérifiez vos courriels.',
      checkText: 'Si un compte existe pour {email}, un lien pour choisir un nouveau mot de passe vient d’être envoyé.',
      thisAddress: 'cette adresse',
      demoTitle: 'Compte de démonstration.', demoEmail: 'Courriel', demoPassword: 'mot de passe', demoFill: 'Remplir avec le compte démo',
      errors: { invalid_credentials: 'Courriel ou mot de passe incorrect.', generic: 'Connexion impossible pour le moment. Réessayez.' }
    },
    account: {
      hello: 'Bonjour, {name}.', since: 'Forfait {pkg}, client depuis le {date}.', signOut: 'Se déconnecter',
      loading: 'Chargement de votre espace…', revision: 'Révision {used} sur {total}', progress: 'Avancement du projet',
      inProgress: 'En cours', upcoming: 'À venir', next: 'Prochaine étape', working: 'Version de travail',
      previewAlt: 'Aperçu de la version 2 de {name}',
      requestLabel: 'Demander une modification',
      requestPh: 'Ex. : remplacer la photo de l’accueil, ajouter mes tarifs en anglais…',
      send: 'Envoyer la demande', sending: 'Envoi…', sent: 'Demande envoyée. On vous répond en 1 à 2 jours ouvrables.',
      careTitle: 'Hébergement et entretien', perMonth: 'par mois', careIncl: 'Mises à jour, sauvegardes et petites corrections incluses.',
      careStatus: 'À activer au lancement',
      cardTitle: 'Votre carte numérique', cardEdit: 'Modifier ma carte', cardAlt: 'Carte numérique de {name}',
      activity: 'Activité', you: 'Vous', studio: 'Standout', invoices: 'Factures',
      paidOn: 'Payée le {date}', dueAtLaunch: 'À la mise en ligne',
      note: 'Espace de démonstration : toutes les données sont fictives.'
    }
  },

  en: {
    nav: {
      work: 'Work', services: 'Services', about: 'About', contact: 'Contact',
      card: 'The card', account: 'Client area', myAccount: 'My account', skip: 'Skip to content',
      menu: 'Menu', close: 'Close', homeAria: 'Standout Studio, home', lang: 'Language'
    },
    routes: { home: 'Home', work: 'Work', services: 'Services', about: 'About', contact: 'Contact', card: 'The card', login: 'Client area', account: 'Client area', notfound: 'Page not found' },
    notFound: { title: ['This page', 'doesn’t exist'], text: 'The link may be old, or a letter is missing. The rest of the site is right where it should be.', back: 'Back to home' },
    loader: 'Bilingual web studio, Ottawa',
    where: 'Ottawa and remote. English and French.',
    menu: { hello: 'Hello, {name}' },
    footerAria: 'Footer',
    home: {
      h1: ['Stand', 'out'],
      sub: 'Bilingual web studio in Ottawa. We build websites for freelancers and small businesses who refuse to blend in.',
      start: 'Start a project', seeWork: 'See the work',
      hint: 'The only coloured ball is you. Make some room.', hintSmall: 'The only coloured ball is you.',
      philoLead: 'Most brands are trying to fit in.',
      philoBreak: ['We’d rather make them', 'impossible to ignore.'],
      philoMore: 'What we believe, in full', workMore: 'All work',
      principles: [
        ['A point of view first.', 'Before colours and fonts, we decide what you stand for. Everything else follows.'],
        ['One memorable thing.', 'Every page gets one element that stands out. Just one. That’s what makes the rest readable.'],
        ['Fast and accessible, no trade-offs.', 'A slow or unreadable site doesn’t stand out. It gets closed.'],
        ['Measure, then adjust.', 'A few simple numbers to know who finds you and what works.']
      ],
      servicesTitle: 'Four ways to stand out.',
      services: [
        ['Be remembered.', 'Positioning & identity', 'We find what makes you different and give it a shape: a voice, a typeface, colours, a line people repeat.'],
        ['Be worth the visit.', 'Web design & development', 'Personal brand sites, business showcases and Shopify stores. Fast, accessible, bilingual when you need it.'],
        ['Be found.', 'Local SEO', 'The right words in the right places, an up-to-date Google profile, and a way to see what works.'],
        ['Never think about it again.', 'Hosting & care', 'Updates, backups and small fixes, every month. Cancel anytime.']
      ],
      wallLead: 'Online, almost everything looks the same.',
      wallTwist: 'Almost.',
      processTitle: 'From first call to launch.',
      steps: [
        ['A quick call', 'Goals, budget and timeline, over Zoom or by phone.'],
        ['The brief', 'Pages, content and look agreed before we build.'],
        ['Design and build', 'We share drafts and revise them with you.'],
        ['Launch', 'We go live, hand over access and set up basic analytics.']
      ],
      processNote: 'Most packages ship in a few weeks once we have your content and photos.',
      ctaTitle: ['Ready to stand', 'out?'],
      ctaText: 'A short note is enough. We reply within 1–2 business days with a suggested package, a realistic timeline and a price range.',
      ctaBtn: ['Start', 'a project']
    },
    showcase: {
      title: ['We don’t just make websites.', 'We make names people remember.'],
      intro: 'Four live websites. Open them, click around, judge for yourself.',
      visit: 'Visit the {name} website', alt: 'Preview of the {name} website'
    },
    work: {
      title: 'Work',
      lead: 'Four live websites, four personalities. Step into each one.',
      open: 'Enter the project',
      indexTitle: 'Index',
      indexLead: 'Hover to preview, click to open.',
      more: 'More projects are on their way to launch. Yours could be next.'
    },
    caseStudy: {
      client: 'Client', sector: 'Sector', scope: 'What we did', year: 'Year', live: 'Live',
      visit: 'See the live site', next: 'Next project', back: 'All work',
      outcomeTitle: 'The result', outcome: 'The site is live. The best way to judge is to go and see.',
      explore: 'Scroll inside the screens to walk through the whole site, on a computer and on a phone.',
      desktopAlt: 'The full {name} home page on a computer', mobileAlt: 'The full {name} home page on a phone'
    },
    servicesPage: {
      intro: 'Everything we do fits in two words. First, a solid base. Then we make it impossible to miss.',
      stand: {
        lead: 'The structure. What makes people take you seriously.',
        items: [
          ['Positioning', 'What makes you different, said in one line people remember.'],
          ['Identity', 'A voice, a typeface, colours. Precise enough to be recognised without your name.'],
          ['Site architecture', 'The right pages, in the right order, with one obvious path to getting in touch.']
        ]
      },
      out: {
        lead: 'The expression. What makes people remember you.',
        items: [
          ['Creative direction', 'A visual stance, and the discipline to stick to it.'],
          ['Web design', 'A layout with a point of view, not a repainted template.'],
          ['Development & interaction', 'Fast, accessible, bilingual when needed, with motion only where it earns its place.']
        ]
      },
      afterTitle: 'After launch',
      after: [
        ['Hosting & care', 'Updates, backups and small fixes, $39 a month. Cancel anytime.'],
        ['Shopify stores', 'When you need to sell online, without switching studios.'],
        ['Digital cards', 'Your business card on your phone, with QR code and Wallet.']
      ],
      packagesTitle: 'Packages',
      packagesLead: 'Clear prices, agreed before we start. Plus applicable taxes.',
      from: 'From',
      popular: 'Most popular',
      plans: [
        { id: 'essential', name: 'Essential', price: '$399', features: ['One-page website', 'Custom design that works on mobile', 'One clear call to action', 'Basic SEO', '2 revision rounds'] },
        { id: 'growth', name: 'Growth', price: '$999', featured: true, features: ['3 to 5-page website', 'Custom design that works on mobile', 'A journey built to convert', 'Local SEO and analytics', 'Contact or quote form', '3 revision rounds'] },
        { id: 'signature', name: 'Signature', price: '$1,299', features: ['6 to 10-page website', 'Fully custom experience', 'Advanced customer journey', 'Advanced SEO and analytics', 'Custom features', '5 revision rounds'] }
      ],
      planCta: 'Start with this package',
      careNote: 'Optional after launch: hosting and care at $39 a month.'
    },
    about: {
      title: ['We’re not here', 'to make it pretty'],
      lead: 'Standout is a small bilingual studio in Ottawa. We work one-on-one with freelancers and small businesses, at prices that stay reasonable.',
      whyTitle: 'Why we exist',
      why: 'Because most websites look the same, and they don’t have to. A good site doesn’t need a bigger budget. It needs a point of view, and the nerve to keep it.',
      believeTitle: 'What we believe',
      refuseTitle: 'What we refuse',
      refuse: [
        'Templates bought and repainted.',
        'Made-up numbers to look serious.',
        'Jargon that hides having nothing to say.',
        'Sites that take a week to edit.',
        'Animation that does nothing.'
      ],
      howTitle: 'How we work',
      how: [
        ['One-on-one', 'You talk to the people building your site, not a go-between.'],
        ['In English and French', 'Ottawa and remote, in your clients’ language.'],
        ['Reasonably priced', 'Clear packages, agreed before we start.']
      ]
    },
    card: {
      title: 'Your business card fits in your phone.',
      lead: 'One scan to add you, Apple Wallet and Google Wallet included, and updates without reprinting a thing. Try it with your name.',
      name: 'Your name', role: 'Your job',
      fine: 'A free version to start, a premium version to go further.',
      cta: 'Discover the cards', hint: 'Tilt it with your mouse.', scan: ['Scan to', 'add me.']
    },
    contact: {
      title: ['Let’s make something', 'that stands out'],
      hello: 'Hi, my name is', needIntro: 'and I need', reach: 'You can reach me at', more: 'One more thing',
      phName: 'your name', phEmail: 'your email', phMore: 'optional',
      needOptions: ['a personal brand website', 'a website for my business', 'a Shopify store', 'hosting and care', 'a digital card', 'some advice, to start'],
      lead: 'Send a short note about what you need. We reply with a suggested package, a realistic timeline and a price range.',
      where: 'Ottawa and remote, in English and French.',
      legend: 'What do you need?',
      needs: ['Personal brand website', 'Business showcase', 'Shopify store', 'Hosting & care', 'Digital card'],
      name: 'Name', email: 'Email', phone: 'Phone (optional)', message: 'Message', send: 'Send',
      sentTitle: 'Message sent.',
      sentText: 'Thanks. We’ll reply within 1 to 2 business days with a suggested package.',
      mailTitle: 'Your email is ready.',
      mailText: 'Your mail app opened with the message filled in. All that’s left is to hit send.',
      sending: 'Sending…',
      error: 'That didn’t go through. Try again, or write to us directly:',
      subject: 'Project', subjectDefault: 'website',
      body: { name: 'Name', email: 'Email', phone: 'Phone', need: 'Need' }
    },
    login: {
      title: 'Client area',
      lead: 'Follow your website’s progress, leave feedback, and manage your hosting and digital card.',
      notClient: 'Not a client yet?', start: 'Start a project',
      signIn: 'Sign in', resetTitle: 'Forgot your password',
      resetHelp: 'Enter your email and we’ll send you a link to choose a new one.',
      email: 'Email', password: 'Password', show: 'Show', hide: 'Hide',
      submit: 'Sign in', submitting: 'Signing in…', sendLink: 'Send the link', sending: 'Sending…',
      forgot: 'Forgot password', back: 'Back to sign in',
      checkTitle: 'Check your email.',
      checkText: 'If an account exists for {email}, we just sent a link to choose a new password.',
      thisAddress: 'this address',
      demoTitle: 'Demo account.', demoEmail: 'Email', demoPassword: 'password', demoFill: 'Fill in the demo account',
      errors: { invalid_credentials: 'Incorrect email or password.', generic: 'We can’t sign you in right now. Try again.' }
    },
    account: {
      hello: 'Hello, {name}.', since: '{pkg} package, client since {date}.', signOut: 'Sign out',
      loading: 'Loading your account…', revision: 'Revision {used} of {total}', progress: 'Project progress',
      inProgress: 'In progress', upcoming: 'Upcoming', next: 'Next step', working: 'Working version',
      previewAlt: 'Preview of version 2 of {name}',
      requestLabel: 'Request a change',
      requestPh: 'E.g. replace the homepage photo, add my rates in French…',
      send: 'Send request', sending: 'Sending…', sent: 'Request sent. We reply within 1–2 business days.',
      careTitle: 'Hosting & care', perMonth: 'per month', careIncl: 'Updates, backups and small fixes included.',
      careStatus: 'Starts at launch',
      cardTitle: 'Your digital card', cardEdit: 'Edit my card', cardAlt: 'Digital card of {name}',
      activity: 'Activity', you: 'You', studio: 'Standout', invoices: 'Invoices',
      paidOn: 'Paid {date}', dueAtLaunch: 'Due at launch',
      note: 'Demo area: all data is fictional.'
    }
  }
};

export const fmt = (str, vars = {}) => str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
// Picks the right language from { fr, en } objects coming from data/mock API
export const pick = (value, lang) => (value && typeof value === 'object' && 'fr' in value ? value[lang] : value);

const KEY = 'standout.lang';

const LangContext = createContext(null);

// The URL decides the language (/ is English, /fr is French). Switching rewrites the URL
// in place, so the page you are on stays the same.
export function LangProvider({ children, initialLang = 'en' }) {
  const [lang, setLangState] = useState(initialLang === 'fr' ? 'fr' : 'en');
  setRouterLang(lang);
  const setLang = useCallback(next => {
    if (next !== 'fr' && next !== 'en') return;
    setRouterLang(next);
    setLangState(next);
    const { rest } = splitPath(window.location.pathname);
    const url = next === 'fr' ? (rest === '/' ? '/fr' : `/fr${rest}`) : rest;
    window.history.replaceState(window.history.state, '', url);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const value = useMemo(() => ({ lang, setLang, c: COPY[lang], locale: lang === 'fr' ? 'fr-CA' : 'en-CA' }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
