export const site = {
  name: "Standout Studio",
  email: "hello@standoutstudio.ca",
  localeLabel: {
    active: "FR",
    inactive: "EN",
  },
};

export const nav = {
  links: [
    { label: "Forfaits", href: "#packages" },
    { label: "Projets", href: "#work" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ],
  cta: { label: "Réserver un appel", href: "#contact" },
};

export const hero = {
  kicker: "Design / Build / Care",
  expandTitle: "Marquez dès le premier regard.",
  headline: "Des sites soignés qui génèrent de vrais résultats",
  primaryCta: { label: "Lancer un projet", href: "#contact" },
  secondaryCta: { label: "Voir les forfaits", href: "#packages" },
  support:
    "On prend le temps des détails qui font qu'un site a l'air vraiment terminé.",
  scrollHint: "Défiler",
};

export const trust = {
  items: [
    "Vous travaillez directement avec nous",
    "Réponse en 1 à 2 jours ouvrables",
    "Périmètre clair avant toute production",
    "Des sites en ligne que vous pouvez juger vous-même",
    "30 jours de suivi après la mise en ligne",
  ],
  mobileItems: [
    "En direct avec nous",
    "Réponse en 1-2 jours",
    "Périmètre clair",
    "Sites en ligne",
    "30 jours de suivi",
  ],
};

export const whatWeDo = {
  kicker: "CE QU'ON FAIT",
  title: "Tirez le plein potentiel de votre présence en ligne",
  intro:
    "Sites, boutiques, entretien, et les extras qui font tenir un site dans le temps.",
  swipeHint: "Glisser →",
  items: [
    {
      id: "personal-brand",
      title: "Sites de marque personnelle",
      mobileTitle: "Marque personnelle",
      description:
        "Portfolios et pages de présence nets pour freelances et chercheurs d'emploi qui doivent paraître solides, vite.",
      mobileDescription: "Portfolios nets, rapidement",
      icon: "person" as const,
    },
    {
      id: "business",
      title: "Vitrines d'entreprise",
      mobileTitle: "Sites d'affaires",
      description:
        "Sites pour commerces locaux et petites équipes : ce que vous offrez, qui vous êtes, et comment vous joindre.",
      mobileDescription: "Offre, histoire, contact",
      icon: "window" as const,
    },
    {
      id: "care",
      title: "Hébergement et entretien",
      mobileTitle: "Hébergement",
      description:
        "Option à 29 $/mois : hébergement, mises à jour, sauvegardes et petits correctifs. Mois par mois.",
      mobileDescription: "29 $/mois d'entretien",
      icon: "shield" as const,
    },
    {
      id: "shopify",
      title: "Boutiques Shopify",
      mobileTitle: "Shopify",
      description:
        "Fiches produits, panier et paiement clairs. Une boutique depuis laquelle on peut vraiment acheter.",
      mobileDescription: "Boutiques prêtes à vendre",
      icon: "bag" as const,
    },
    {
      id: "a11y",
      title: "Accessibilité",
      mobileTitle: "Accessibilité",
      description:
        "Conçu avec le WCAG 2.2 AA en tête pour que plus de gens puissent utiliser votre site, et réduire les risques inutiles.",
      mobileDescription: "Orienté WCAG 2.2 AA",
      icon: "access" as const,
    },
    {
      id: "speed",
      title: "Optimisation de la vitesse",
      mobileTitle: "Vitesse",
      description:
        "Des pages rapides qui gardent les visiteurs et aident la recherche à vous trouver.",
      mobileDescription: "Pages rapides qui retiennent",
      icon: "bolt" as const,
    },
    {
      id: "cro",
      title: "Optimisation des conversions",
      mobileTitle: "Conversions",
      description:
        "De la structure de page aux appels à l'action et tests simples, on vise ce qui pousse à appeler, réserver ou acheter.",
      mobileDescription: "CTA et structure qui convertissent",
      icon: "chart" as const,
    },
  ],
};

export const selectedWork = {
  kicker: "PROJETS SÉLECTIONNÉS",
  title: "Quelques sites déjà en ligne.",
  mobileTitle: "Sites en ligne",
  intro: "Ouvrez-les, naviguez, et jugez la qualité par vous-même.",
  swipeHint: "Glisser pour parcourir →",
  projects: [
    {
      id: "rayann",
      label: "EN LIGNE · MARQUE PERSONNELLE",
      name: "Rayann Sagnon",
      domain: "rayannsagnon.com",
      href: "https://rayannsagnon.com",
      image: "/work/rayann-desktop.png",
    },
    {
      id: "steven",
      label: "EN LIGNE · MARQUE PERSONNELLE",
      name: "Steven Atchall",
      domain: "stevenatchall.com",
      href: "https://stevenatchall.com",
      image: "/work/steven-desktop.png",
    },
  ],
};

export const packages = {
  kicker: "FORFAITS",
  title: "Forfaits et tarifs",
  swipeHint: "Glisser pour comparer →",
  plans: [
    {
      id: "digital-card",
      name: "Carte numérique",
      price: "250 $",
      featured: false,
      features: [
        "Mini page sur un écran",
        "Lien unique + code QR",
        "Contact enregistrable (vCard)",
        "3 tours de révision",
      ],
      mobileFeatures: ["Page sur un écran", "Lien + QR", "3 révisions"],
      cta: { label: "Commencer", href: "#contact" },
    },
    {
      id: "personal-brand",
      name: "Marque personnelle",
      price: "650 $",
      featured: true,
      badge: "Le plus populaire",
      mobileBadge: "LE PLUS POPULAIRE",
      features: [
        "Site de 3 à 5 pages",
        "Appel à l'action clair",
        "SEO de base + analytique",
        "3 tours de révision",
      ],
      mobileFeatures: [
        "3 à 5 pages",
        "CTA clair",
        "Bases SEO",
        "3 révisions",
      ],
      cta: { label: "Commencer", href: "#contact" },
    },
    {
      id: "business-starter",
      name: "Vitrine entreprise",
      price: "999 $",
      featured: false,
      features: [
        "Vitrine de 5 à 8 pages",
        "Parcours contact / devis",
        "Bases de SEO local",
        "3 tours de révision",
      ],
      mobileFeatures: [
        "5 à 8 pages",
        "Demande de devis",
        "SEO local",
        "3 révisions",
      ],
      cta: { label: "Commencer", href: "#contact" },
    },
  ],
  siteCareNote:
    "En option après la mise en ligne : Site Care s'occupe de l'hébergement, des mises à jour et des sauvegardes.",
  siteCare: {
    kicker: "SITE CARE",
    title: "Hébergement et entretien, 29 $ / mois",
    mobileTitle: "SITE CARE  ·  29 $/mois",
    description:
      "Hébergement, mises à jour, sauvegardes et petits changements de contenu. Mois par mois. Annulable en tout temps.",
    mobileDescription:
      "Hébergement, mises à jour, sauvegardes, petits correctifs.",
    cta: { label: "Parler de Care", href: "#contact" },
  },
};

export const why = {
  kicker: "POURQUOI ÇA COMPTE",
  title: "Un site clair change la façon dont on vous perçoit.",
  body: "Quelqu'un vous cherche. En quelques secondes, il décide si vous avez l'air crédible. Cette page doit rendre ça simple : qui vous êtes, ce que vous faites, comment vous joindre.",
  points: [
    "Compréhensible en quelques secondes",
    "Chemin évident pour appeler, réserver ou écrire",
    "L'air d'un projet pris au sérieux",
  ],
  mobilePoints: [
    "Clair en quelques secondes",
    "Prochaine étape évidente",
    "Soigné sur mobile",
  ],
};

export const marquee = {
  top: [
    "Marquez dès le premier regard",
    "Des sites qui génèrent des résultats",
    "Des forfaits clairs",
  ],
  bottom: [
    "Cartes numériques",
    "Shopify",
    "Hébergement et entretien",
    "Pensé pour être mis en ligne",
  ],
};

export const process = {
  title: "De l'idée à la mise en ligne, sans détour.",
  mobileTitle: "De l'idée au lancement",
  intro:
    "Un appel court, un brief clair, puis on conçoit et on révise jusqu'à ce que ce soit prêt à publier.",
  note: "La plupart des forfaits sortent en quelques semaines une fois qu'on a votre contenu et vos photos.",
  steps: [
    {
      id: "call",
      icon: "phone" as const,
      title: "Un appel rapide",
      mobileTitle: "Appel",
      description: "Objectifs, budget et échéancier. Zoom ou téléphone.",
      mobileDescription: "Objectifs et budget",
    },
    {
      id: "brief",
      icon: "brief" as const,
      title: "Valider le brief",
      mobileTitle: "Brief",
      description: "Pages, contenu et direction visuelle figés avant production.",
      mobileDescription: "Périmètre verrouillé",
    },
    {
      id: "build",
      icon: "build" as const,
      title: "Design et production",
      mobileTitle: "Production",
      description: "Maquettes partagées. Vos 3 tours de révision.",
      mobileDescription: "3 révisions",
    },
    {
      id: "launch",
      icon: "launch" as const,
      title: "Mise en ligne",
      mobileTitle: "Lancement",
      description: "Publication, remise des accès, analytique de base.",
      mobileDescription: "Mise en ligne",
    },
  ],
};

export const testimonials = {
  title: "Ce que disent les clients",
  mobileKicker: "AVIS CLIENTS",
  mobileTitle: "Notes de clients",
  intro:
    "Des retours de gens avec qui on a travaillé sur des projets de marque personnelle et de vitrine entreprise.",
  swipeHint: "Glisser →",
  items: [
    {
      id: "maya",
      quote:
        "J'avais besoin de quelque chose qui me ressemble, pas d'un gabarit. Ils m'ont aidée à clarifier les appels à l'action, et le site m'aide vraiment à décrocher des appels.",
      mobileQuote:
        "Ça me ressemble, pas un gabarit. Ça m'aide à décrocher des mandats.",
      name: "Maya Chen",
      role: "Designer UX freelance · Marque personnelle",
      mobileRole: "Marque personnelle",
    },
    {
      id: "noah",
      quote:
        "Tarifs transparents, aucune surprise, et ils répondent au téléphone. Notre site de rénovation a l'air solide sans avoir l'air hors de prix à produire.",
      mobileQuote: "Tarifs clairs. Ils répondent au téléphone.",
      name: "Noah Berger",
      role: "Propriétaire, Berger Builds · Vitrine entreprise",
      mobileRole: "Vitrine entreprise",
    },
    {
      id: "priya",
      quote:
        "Trois tours de révision ont suffi. Ils nous ont gardés concentrés sur la vitesse, le mobile et un formulaire de contact que les gens utilisent vraiment.",
      mobileQuote: "3 tours ont suffi. Focus mobile.",
      name: "Priya Nair",
      role: "En recherche d'emploi · Marque personnelle",
      mobileRole: "Marque personnelle",
    },
  ],
};

export const about = {
  kicker: "À PROPOS",
  lead:
    "Standout Studio est un studio web boutique, porté par le désir de voir nos clients réussir. Pour freelances ambitieux et entreprises locales en croissance, on agit comme des partenaires, pas seulement comme un fournisseur.",
  body: "On construit des sites clairs, un projet à la fois : marques personnelles, vitrines d'entreprise, et l'entretien qui les garde en ligne. Du travail stratégique, des échéanciers francs, et une équipe qui répond au téléphone.",
  locale: "Français et anglais. Basés à Ottawa, Canada",
};

export const faq = {
  kicker: "FAQ",
  title: "Vos questions, nos réponses",
  mobileTitle: "Réponses rapides",
  hint: "Cliquez une question pour voir la réponse.",
  items: [
    {
      id: "timeline",
      question: "Combien de temps dure un projet ?",
      answer:
        "En général quelques semaines une fois qu'on a votre contenu et vos photos. On donne un échéancier clair après l'appel de démarrage.",
      mobile: true,
    },
    {
      id: "conversion",
      question: "Comment allez-vous maximiser le taux de conversion de notre site ?",
      answer:
        "On garde le parcours clair : une forte première impression, une prochaine étape évidente, et des mises en page qui fonctionnent sur mobile. Structure et appels à l'action d'abord ; de petits tests quand c'est utile.",
      mobile: false,
    },
    {
      id: "seo",
      question:
        "Pouvez-vous optimiser notre site pour les moteurs comme Google et ChatGPT ?",
      answer:
        "Oui. On met en place les bases : titres clairs, structure, vitesse et analytique pour que les moteurs comprennent et classent vos pages.",
      mobile: false,
    },
    {
      id: "maintain",
      question: "Sera-t-il facile pour nous d'entretenir et modifier le site ?",
      answer:
        "Oui. On vous laisse un site que vous pouvez mettre à jour, plus une courte passation. Site Care est optionnel si vous voulez qu'on gère l'hébergement et les petits correctifs.",
      mobile: false,
    },
    {
      id: "shopify",
      question: "Est-ce que vous créez des boutiques Shopify ?",
      answer:
        "Oui. Fiches produits, panier et paiement clairs, pour que les gens puissent vraiment acheter.",
      mobile: true,
    },
    {
      id: "host",
      question: "Est-ce que vous hébergez et entretenez le site ?",
      answer:
        "Oui, via Site Care à 29 $/mois : hébergement, mises à jour, sauvegardes et petits changements de contenu. Mois par mois.",
      mobile: true,
    },
    {
      id: "revisions",
      question: "Et si une maquette ne me convient pas ?",
      answer:
        "Les forfaits incluent 3 tours de révision. On verrouille le brief avant la production pour que les révisions restent du polish, pas une réécriture.",
      mobile: true,
    },
    {
      id: "ads",
      question: "Est-ce que vous gérez de la publicité ?",
      answer:
        "Non. On conçoit et on construit des sites. Les pubs payantes et l'achat média ne font pas partie de notre offre.",
      mobile: true,
    },
  ],
};

export const contact = {
  kicker: "/ contactez-nous /",
  title: "On est là pour répondre à vos questions.",
  intro:
    "Écrivez-nous en quelques lignes ce dont vous avez besoin. On répond avec un forfait suggéré, un échéancier réaliste et une fourchette de prix.",
  mobileIntro:
    "Un court message suffit. On répond en 1 à 2 jours ouvrables.",
  meta: "Ottawa · À distance  ·  hello@standoutstudio.ca",
  formTitle: "Écrivez-nous",
  formSupport: "Pas de spam. Juste une prochaine étape claire.",
  requiredHint: "* Obligatoire",
  fields: {
    name: { label: "Nom *", placeholder: "Votre nom" },
    email: { label: "Courriel *", placeholder: "vous@courriel.com" },
    phone: { label: "Téléphone (optionnel)", placeholder: "+1 ..." },
    need: {
      label: "De quoi avez-vous besoin ? *",
      placeholder:
        "Carte numérique / Marque personnelle / Vitrine entreprise / Pas sûr",
      mobilePlaceholder: "Forfait ou pas sûr",
    },
    message: {
      label: "Message *",
      placeholder: "Parlez-nous du projet...",
    },
    files: {
      label: "Joindre des fichiers (optionnel)",
      button: "Choisir des fichiers",
      empty: "Aucun fichier choisi",
      hint: "Briefs, références, logos — PDF, PNG, JPG, DOC, quelques Mo max.",
      mailNote:
        "Veuillez joindre ces fichiers à ce courriel avant l'envoi :",
    },
  },
  submit: "Envoyer",
  mailSubject: "Demande Standout Studio de",
  sentWithFiles:
    "Ouverture de votre application courriel. Joignez les fichiers choisis avant d'envoyer.",
  sent: "Ouverture de votre application courriel avec le message prêt à envoyer.",
};

export const footer = {
  meta: "Ottawa · À distance · FR / EN",
};

export const ui = {
  primaryNav: "Navigation principale",
  language: "Langue",
  starsLabel: "5 étoiles sur 5",
  trustLabel: "Signaux de confiance",
};
