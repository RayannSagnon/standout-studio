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

export const footer = {
  meta: "Ottawa · Remote · EN / FR",
} as const;
