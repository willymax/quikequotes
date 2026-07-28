export const PLANS = [
  {
    name: "Solo",
    price: "$29",
    tagline: "For the one-truck operation",
    features: [
      "Up to 20 quotes / month",
      "Good / Better / Best tiers",
      "Shareable tracked quote links",
      "Automatic Day 1/3/7 follow-up",
    ],
    highlight: false,
  },
  {
    name: "Pro",
    price: "$49",
    tagline: "For steady, growing crews",
    features: [
      "Unlimited quotes",
      "Everything in Solo",
      "Priority email + SMS support",
      "Custom branding on quotes",
    ],
    highlight: true,
  },
  {
    name: "Team",
    price: "$79",
    tagline: "For multi-crew businesses",
    features: [
      "Everything in Pro",
      "Higher-volume SMS/email sending",
      "Priority phone support",
      "Early access to new features",
    ],
    highlight: false,
  },
] as const;
