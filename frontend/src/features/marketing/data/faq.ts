/** FAQ content — plain data (no "use client") so both the client accordion and
 *  the server FAQPage JSON-LD can import the actual array. */

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: "What kinds of assignments can you help with?",
    a: "Essays, reports, dissertations and theses, research and data analysis, programming and coding, presentations, typing and transcription, and editing or proofreading — across business, law, nursing, engineering, computer science, the sciences, humanities, and more.",
  },
  {
    q: "Is the work original and confidential?",
    a: "Yes. Every assignment is written from scratch to your brief and checked for originality. Your identity and details are never shared, and your work is never resold or reused.",
  },
  {
    q: "How do you match my assignment to a writer?",
    a: "When you submit, we capture the subject, academic level, type, and requirements. A project manager reviews the brief and assigns a specialist who actually works in that field — not a generalist.",
  },
  {
    q: "Can you follow a specific referencing style?",
    a: "Absolutely. Tell us your style — APA, MLA, Harvard, Chicago, IEEE, Vancouver, OSCOLA, or another — and your expert formats every citation and the reference list to match.",
  },
  {
    q: "How do deadlines work?",
    a: "You set the deadline date and time when you submit, and can mark the priority. We schedule the work to deliver with time to spare so you can review before your own submission.",
  },
  {
    q: "Can I talk to my writer and share files?",
    a: "Yes. Once your assignment is submitted you get a private page where you can message the team, upload briefs, reference files, images, and notes, and track every step of the workflow.",
  },
  {
    q: "What if I need changes after delivery?",
    a: "You can request a revision from your assignment page. Your expert reworks the draft against your feedback and the marking criteria until it meets the brief.",
  },
  {
    q: "How much does it cost?",
    a: "Price depends on the type, length, level, and deadline. Submit your assignment for a no-obligation quote — your project manager confirms scope and price with you before any work or payment.",
  },
];
