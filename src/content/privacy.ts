/**
 * Rendered by /privacy. Plain sections so the owner (and a lawyer) can edit
 * without touching layout. [OWNER: have a lawyer review before enabling the
 * Meta Pixel.]
 */
export const privacy = {
  effectiveDate: "[EFFECTIVE DATE, e.g. October 1, 2026]",
  sections: [
    {
      heading: "What we collect",
      body: [
        "When you use the contact form we collect the name, email address, phone number, and message you type, plus which service and industry you selected.",
        "When you enter your email to watch a full-length video we collect that email address and the service you were reading about.",
        "For spam control we store a salted, one-way hash of your IP address. We do not store the address itself.",
        "We set one first-party cookie that remembers how you first arrived (for example a search engine or an email link) for thirty days.",
        "If our advertising or analytics tools are switched on, Meta and Google may set their own identifiers. This page will say so explicitly when that happens.",
      ],
    },
    {
      heading: "Why we collect it",
      body: [
        "To reply to your message and judge whether we are a fit.",
        "To send you the video you asked for and, if you keep it, a short daily marketing puzzle by email.",
        "To understand which pages and channels bring visitors, so we can improve the site.",
        "To keep bots and spam out of our inbox.",
      ],
    },
    {
      heading: "How long we keep it",
      body: [
        "Contact messages are kept for as long as we might work together, then deleted on request.",
        "Email list entries are kept until you unsubscribe. Every email carries an unsubscribe link.",
        "The arrival cookie expires after thirty days.",
      ],
    },
    {
      heading: "Who else sees it",
      body: [
        "Vercel hosts the site. Neon stores the database. Resend delivers our email. Cloudflare serves video files.",
        "Meta and Google receive analytics data only if their tools are enabled on this site.",
        "We do not sell or rent your information.",
      ],
    },
    {
      heading: "Your choices",
      body: [
        "Unsubscribe from any email using the link at the bottom of it.",
        "Ask us to delete your information by emailing the address below. We will confirm when it is done.",
      ],
    },
  ],
} as const;
