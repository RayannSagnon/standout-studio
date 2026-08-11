export const site = {
  name: "Standout Studio",
  email: "standout.studio.ottawa@gmail.com",
  localeLabel: {
    active: "EN",
    inactive: "FR",
  },
} as const;

export const seo = {
  title: "Standout Studio | Web Design & Development in Ottawa",
  description:
    "Bilingual web studio in Ottawa. Custom websites, digital cards, and Shopify stores for freelancers and small businesses. Clear packages from $299.",
  ogLocale: "en_CA",
  keywords: [
    "Ottawa web design",
    "Ottawa website development",
    "small business websites Ottawa",
    "freelance portfolio website",
    "bilingual web studio Ottawa",
  ],
} as const;

export const nav = {
  links: [
    { label: "Packages", href: "#packages" },
    { label: "Work", href: "#work" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ],
  cta: { label: "Book a call", href: "#contact", shortLabel: "Contact" },
} as const;

export const hero = {
  kicker: "Design / Build / Care",
  expandTitle: "Own the first impression.",
  headline: "Creating Beautiful Websites That Drive Revenue",
  heroImageAlt: "Teal abstract backdrop for the Standout Studio homepage hero",
  primaryCta: { label: "Start a project", href: "#contact" },
  secondaryCta: { label: "See the packages", href: "#packages" },
  support: "We take time on the details that make a website feel finished.",
  scrollHint: "Scroll",
} as const;

export const trust = {
  items: [
    "You work with us directly",
    "Reply within 1-2 business days",
    "Clear scope before any build",
    "Live websites you can open and judge",
    "30 days of post-launch support",
  ],
  mobileItems: [
    "Direct with us",
    "Reply in 1-2 days",
    "Clear scope",
    "Live websites",
    "30 days support",
  ],
} as const;

export const whatWeDo = {
  kicker: "WHAT WE DO",
  title: "Unlock the Full Potential of Your Online Presence",
  intro: "Websites, stores, care, and the extras that make a website hold up.",
  swipeHint: "Swipe →",
  items: [
    {
      id: "personal-brand",
      title: "Personal Brand websites",
      mobileTitle: "Personal Brand",
      description:
        "Clean portfolios and presence pages for freelancers and job seekers who need to look sharp fast.",
      mobileDescription: "Portfolios that look sharp fast",
      icon: "person" as const,
    },
    {
      id: "business",
      title: "Business showcases",
      mobileTitle: "Business sites",
      description:
        "Websites for local shops and small teams: what you offer, who you are, and how to get in touch.",
      mobileDescription: "Offer, story, contact path",
      icon: "window" as const,
    },
    {
      id: "care",
      title: "Hosting & Care",
      mobileTitle: "Hosting & Care",
      description:
        "Optional $39/month for hosting, updates, backups, and small fixes. Month to month.",
      mobileDescription: "$39/mo upkeep",
      icon: "shield" as const,
    },
    {
      id: "shopify",
      title: "Shopify stores",
      mobileTitle: "Shopify",
      description:
        "Product pages, cart, and checkout that feel clear. A store people can actually buy from.",
      mobileDescription: "Storefronts when you sell",
      icon: "bag" as const,
    },
    {
      id: "a11y",
      title: "Accessibility compliance",
      mobileTitle: "Accessibility",
      description:
        "Built with WCAG 2.2 AA in mind so more people can use your website, and you reduce avoidable risk.",
      mobileDescription: "WCAG 2.2 AA minded",
      icon: "access" as const,
    },
    {
      id: "speed",
      title: "Loading speed optimization",
      mobileTitle: "Speed",
      description:
        "Fast pages that keep people on your website and help search find you.",
      mobileDescription: "Fast pages that hold attention",
      icon: "bolt" as const,
    },
    {
      id: "cro",
      title: "Conversion Rate Optimization",
      mobileTitle: "CRO",
      description:
        "From page structure to CTAs and simple tests, we focus on what moves people to call, book, or buy.",
      mobileDescription: "CTAs and structure that convert",
      icon: "chart" as const,
    },
  ],
} as const;

export const selectedWork = {
  kicker: "SELECTED WORK",
  title: "A few websites that are live.",
  mobileTitle: "Live websites",
  intro: "Open them, click around, and judge the quality yourself.",
  swipeHint: "Swipe to browse →",
  projects: [
    {
      id: "rayann",
      label: "LIVE · PERSONAL BRAND",
      name: "Rayann Sagnon",
      domain: "rayannsagnon.com",
      href: "https://rayannsagnon.com",
      image: "/work/rayann-desktop.webp",
      imageMobile: "/work/rayann-mobile.webp",
    },
    {
      id: "steven",
      label: "LIVE · PERSONAL BRAND",
      name: "Steven Atchall",
      domain: "stevenatchall.com",
      href: "https://stevenatchall.com",
      image: "/work/steven-desktop.webp",
      imageMobile: "/work/steven-mobile.webp",
    },
  ],
} as const;

export const packages = {
  kicker: "PACKAGES",
  title: "Packages & pricing",
  swipeHint: "Swipe to compare →",
  priceFrom: "From",
  plans: [
    {
      id: "digital-card",
      name: "Digital Card",
      price: "$299",
      featured: false,
      features: [
        "One-screen mini page",
        "Unique link + QR code",
        "Savable contact (vCard)",
        "3 revision rounds",
      ],
      mobileFeatures: ["One-screen page", "Link + QR", "3 revisions"],
      cta: { label: "Get started", href: "#contact" },
    },
    {
      id: "personal-brand",
      name: "Personal Brand",
      price: "$799",
      featured: true,
      badge: "Most popular",
      mobileBadge: "MOST POPULAR",
      features: [
        "3 to 5 page website",
        "Clear call to action",
        "Basic SEO + analytics",
        "3 revision rounds",
      ],
      mobileFeatures: ["3-5 pages", "Clear CTA", "SEO basics", "3 revisions"],
      cta: { label: "Get started", href: "#contact" },
    },
    {
      id: "business-starter",
      name: "Business Starter",
      price: "$1,299",
      featured: false,
      features: [
        "5 to 8 page showcase",
        "Contact / quote path",
        "Local SEO basics",
        "3 revision rounds",
      ],
      mobileFeatures: ["5-8 pages", "Quote path", "Local SEO", "3 revisions"],
      cta: { label: "Get started", href: "#contact" },
    },
  ],
  siteCareNote:
    "Optional after launch: Site Care keeps hosting, updates, and backups handled.",
  siteCare: {
    kicker: "SITE CARE",
    title: "Hosting & upkeep, $39 / month",
    mobileTitle: "SITE CARE  ·  $39/mo",
    description:
      "Hosting, updates, backups, and small content fixes. Month to month. Cancel anytime.",
    mobileDescription: "Hosting, updates, backups, small fixes.",
    cta: { label: "Ask about Care", href: "#contact" },
  },
} as const;

export const why = {
  kicker: "WHY IT MATTERS",
  title: "A clear website changes how people treat you.",
  body: "Someone looks you up. In a few seconds they decide if you feel legit. That page should make it easy: who you are, what you do, how to reach you.",
  points: [
    "Easy to understand in a few seconds",
    "Obvious path to call, book, or email",
    "Looks like someone took it seriously",
  ],
  mobilePoints: [
    "Clear in a few seconds",
    "Obvious next step",
    "Finished on mobile",
  ],
} as const;

export const marquee = {
  top: ["Own the first impression", "Websites that drive revenue", "Clear packages"],
  bottom: ["Digital cards", "Shopify", "Hosting & Care", "Built to go live"],
} as const;

export const process = {
  title: "Crafting your website from concept to launch.",
  mobileTitle: "From concept to launch",
  intro:
    "A short call, a clear brief, then we build and revise until it is ready to publish.",
  note: "Most packages ship in a few weeks once we have your content and photos.",
  steps: [
    {
      id: "call",
      icon: "phone" as const,
      title: "A quick call",
      mobileTitle: "Call",
      description: "Goals, budget, and timeline. Zoom or phone.",
      mobileDescription: "Goals & budget",
    },
    {
      id: "brief",
      icon: "brief" as const,
      title: "Agree the brief",
      mobileTitle: "Brief",
      description: "Pages, content, and look locked before build.",
      mobileDescription: "Scope locked",
    },
    {
      id: "build",
      icon: "build" as const,
      title: "Design and build",
      mobileTitle: "Build",
      description: "Drafts shared. Your 3 revision rounds.",
      mobileDescription: "3 revisions",
    },
    {
      id: "launch",
      icon: "launch" as const,
      title: "Launch",
      mobileTitle: "Launch",
      description: "Go live, hand over access, basic analytics.",
      mobileDescription: "Go live",
    },
  ],
} as const;

export const testimonials = {
  title: "What clients say",
  mobileKicker: "WHAT CLIENTS SAY",
  mobileTitle: "Client notes",
  intro:
    "Notes from people who worked with us on personal brand and business starter projects.",
  swipeHint: "Swipe →",
  items: [
    {
      id: "maya",
      quote:
        "I needed something that felt like me, not a template. They helped me clarify the CTAs and the website actually helps me book calls.",
      mobileQuote: "Felt like me, not a template. Helps me get hired.",
      name: "Maya Chen",
      role: "Freelance UX designer · Personal Brand",
      mobileRole: "Personal Brand",
    },
    {
      id: "noah",
      quote:
        "Transparent pricing, no surprises, and they picked up the phone. Our renovation website looks solid without looking expensive to build.",
      mobileQuote: "Transparent pricing. They picked up the phone.",
      name: "Noah Berger",
      role: "Owner, Berger Builds · Business Starter",
      mobileRole: "Business Starter",
    },
    {
      id: "priya",
      quote:
        "Three revision rounds were enough. They kept us focused on speed, mobile, and a contact form that people use.",
      mobileQuote: "3 rounds were enough. Focused on mobile.",
      name: "Priya Nair",
      role: "Job seeker · Personal Brand",
      mobileRole: "Personal Brand",
    },
  ],
} as const;

export const about = {
  kicker: "ABOUT US",
  lead:
    "Standout Studio is a boutique web studio driven by a genuine passion for seeing our clients succeed. For ambitious freelancers and growing local businesses, we act as dedicated partners, not just service providers.",
  body: "We build clear websites one project at a time: personal brands, business showcases, and the care that keeps them live. Strategic craft, straight timelines, and a team that answers the phone.",
  locale: "English and French. Based in Ottawa, Canada",
} as const;

export const faq = {
  kicker: "FAQs",
  title: "Your Questions, Answered",
  mobileTitle: "Quick answers",
  hint: "Click a question to see the answer.",
  items: [
    {
      id: "timeline",
      question: "How long does a project take?",
      answer:
        "Usually a few weeks once we have your content and photos. We give a clear timeline after the kickoff call.",
      mobile: true,
    },
    {
      id: "conversion",
      question: "How will you maximize the conversion rate of our website?",
      answer:
        "We keep the path clear: strong first impression, obvious next step, and layouts that work on mobile. Structure and CTAs come first; small tests come when useful.",
      mobile: false,
    },
    {
      id: "seo",
      question:
        "Can you optimize our website for search engines like Google and ChatGPT?",
      answer:
        "Yes. We set up the basics: clear titles, structure, speed, and analytics so search engines can understand and rank your pages.",
      mobile: false,
    },
    {
      id: "maintain",
      question: "Will it be easy for us to maintain and edit the website ourselves?",
      answer:
        "Yes. We leave you with a website you can update, plus a short handoff. Site Care is optional if you want us to handle hosting and small fixes.",
      mobile: false,
    },
    {
      id: "shopify",
      question: "Do you build Shopify stores?",
      answer:
        "Yes. Product pages, cart, and checkout that feel clear, so people can actually buy.",
      mobile: true,
    },
    {
      id: "host",
      question: "Do you host and maintain the website?",
      answer:
        "Yes, through Site Care at $39/month: hosting, updates, backups, and small content fixes. Month to month.",
      mobile: true,
    },
    {
      id: "revisions",
      question: "What if I am not happy with a draft?",
      answer:
        "Packages include 3 revision rounds. We lock the brief before build so revisions stay focused on polish, not rewrites.",
      mobile: true,
    },
    {
      id: "ads",
      question: "Do you run ads?",
      answer:
        "No. We design and build websites. Paid ads and media buying are not part of what we offer.",
      mobile: true,
    },
  ],
} as const;

export const contact = {
  kicker: "/ get in touch /",
  title: "We are always ready to help and answer your questions.",
  intro:
    "Send a short note about what you need. We reply with a suggested package, a realistic timeline, and a price range.",
  mobileIntro: "A short note is enough. We reply in 1-2 business days.",
  meta: "Ottawa · Remote  ·  standout.studio.ottawa@gmail.com",
  formTitle: "Get in touch",
  requiredHint: "* Required",
  fields: {
    name: { label: "Name *", placeholder: "Your name", mailLabel: "Name" },
    email: { label: "Email *", placeholder: "you@email.com", mailLabel: "Email" },
    phone: {
      label: "Phone (optional)",
      placeholder: "+1 ...",
      mailLabel: "Phone",
    },
    need: {
      label: "What do you need? *",
      placeholder: "Digital Card / Personal Brand / Business Starter / Not sure",
      mobilePlaceholder: "Pack or not sure",
      mailLabel: "Need",
    },
    message: {
      label: "Message *",
      placeholder: "Tell us about the project...",
    },
    files: {
      label: "Project files (optional)",
      button: "Choose Files",
      empty: "No file chosen",
      hint: "File names are included in your message. We may ask you to send the files by reply. PDF, PNG, JPG, DOC up to 5 MB each.",
      tooLarge: "Each file must be under 5 MB.",
    },
  },
  submit: "Send",
  submitting: "Sending...",
  previewAltSuffix: "website preview",
  newTabHint: "(opens in a new tab)",
  sent: "Thanks. We got your message and will reply in 1-2 business days.",
  error: "Something went wrong. Please try again or email standout.studio.ottawa@gmail.com.",
} as const;

export const footer = {
  meta: "Ottawa · Remote · EN / FR",
} as const;

export const ui = {
  primaryNav: "Primary",
  language: "Language",
  starsLabel: "5 out of 5 stars",
  trustLabel: "Trust signals",
  menuOpen: "Open menu",
  menuClose: "Close menu",
  skipToContent: "Skip to content",
} as const;
