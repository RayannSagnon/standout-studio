export const site = {
  name: "Standout Studio",
  email: "hello@standoutstudio.ca",
  localeLabel: {
    active: "EN",
    inactive: "FR",
  },
} as const;

export const nav = {
  links: [
    { label: "Packages", href: "#packages" },
    { label: "Work", href: "#work" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ],
  cta: { label: "Book a call", href: "#contact" },
} as const;

export const hero = {
  kicker: "Design / Build / Care",
  headline: "Own the first impression.",
  primaryCta: { label: "Start a project", href: "#contact" },
  secondaryCta: { label: "See the packages", href: "#packages" },
  support: "We take time on the details that make a website feel finished.",
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
  mobileTitle: "What we ship",
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
        "Optional $29/month for hosting, updates, backups, and small fixes. Month to month.",
      mobileDescription: "$29/mo upkeep",
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
      image: "/work/rayann-desktop.png",
    },
    {
      id: "steven",
      label: "LIVE · PERSONAL BRAND",
      name: "Steven Atchall",
      domain: "stevenatchall.com",
      href: "https://stevenatchall.com",
      image: "/work/steven-desktop.png",
    },
  ],
} as const;

export const footer = {
  meta: "Ottawa · Remote · EN / FR",
} as const;
