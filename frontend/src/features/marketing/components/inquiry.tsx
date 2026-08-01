"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MessageCircle,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { easeOut } from "@/animations/variants";
import { submitInquiry } from "../services/inquiry-service";

/** Update these to the studio's real contact details. */
const CONTACT_EMAIL = "hello@prossignment.com";
const CONTACT_WHATSAPP = "+1 (555) 012-3456";

const CHANNELS = [
  {
    icon: Mail,
    label: "Email us",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: CONTACT_WHATSAPP,
    href: `https://wa.me/${CONTACT_WHATSAPP.replace(/[^\d]/g, "")}`,
  },
  {
    icon: Clock,
    label: "Support hours",
    value: "24/7 — every day",
    href: null,
  },
];

/**
 * Landing enquiry section — visitors ask a question without leaving the page.
 * Posts to the public /inquiries endpoint (persisted + emailed to the studio).
 */
export function Inquiry() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState("");

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const message = await submitInquiry({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        subject: form.subject || undefined,
        message: form.message,
      });
      setConfirmation(message);
      setStatus("done");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setStatus("idle");
    }
  };

  return (
    <section id="inquiry" className="relative overflow-hidden py-24 lg:py-32">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_45%_40%_at_25%_40%,rgba(59,130,246,0.10),transparent),radial-gradient(ellipse_40%_35%_at_80%_60%,rgba(139,92,246,0.08),transparent)]"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center">
          {/* Pitch + channels */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: easeOut }}
          >
            <p className="text-muted-foreground font-mono text-xs tracking-[0.3em] uppercase">
              05 / Ask
            </p>
            <h2 className="font-display mt-5 text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl">
              Have a question?
              <br />
              <span className="aurora-text">Ask us anything.</span>
            </h2>
            <p className="text-muted-foreground mt-5 max-w-md text-base leading-relaxed">
              Not ready to submit yet? Tell us about your assignment or ask
              about pricing, timelines, or subjects — a project manager usually
              replies the same day.
            </p>

            <div className="mt-8 space-y-3">
              {CHANNELS.map((channel) => {
                const inner = (
                  <div className="aurora-border flex items-center gap-4 rounded-2xl p-4">
                    <span className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                      <channel.icon className="size-5" />
                    </span>
                    <div>
                      <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
                        {channel.label}
                      </p>
                      <p className="mt-0.5 text-sm font-medium">
                        {channel.value}
                      </p>
                    </div>
                  </div>
                );
                return channel.href ? (
                  <a
                    key={channel.label}
                    href={channel.href}
                    target={
                      channel.href.startsWith("http") ? "_blank" : undefined
                    }
                    rel="noreferrer"
                    className="block transition-transform hover:scale-[1.01]"
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={channel.label}>{inner}</div>
                );
              })}
            </div>
          </motion.div>

          {/* Form / success */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.1 }}
            className="rounded-3xl border border-white/10 bg-white/4 p-6 backdrop-blur-md sm:p-8"
          >
            {status === "done" ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <CheckCircle2 className="size-7" />
                </span>
                <h3 className="font-display mt-5 text-2xl font-bold tracking-tight">
                  Message sent
                </h3>
                <p className="text-muted-foreground mt-2 max-w-xs text-sm">
                  {confirmation}
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5">
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-tight">
                    Send us a message
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm">
                    We reply to every enquiry — usually within hours.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="inq-name">Your name</Label>
                    <Input
                      id="inq-name"
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Full name"
                      required
                      maxLength={120}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inq-email">Email</Label>
                    <Input
                      id="inq-email"
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder="you@university.edu"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="inq-phone">
                      Phone{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="inq-phone"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="+44 …"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inq-subject">
                      Subject{" "}
                      <span className="text-muted-foreground font-normal">
                        (optional)
                      </span>
                    </Label>
                    <Input
                      id="inq-subject"
                      value={form.subject}
                      onChange={set("subject")}
                      placeholder="e.g. Dissertation, Nursing…"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inq-message">Message</Label>
                  <textarea
                    id="inq-message"
                    rows={5}
                    value={form.message}
                    onChange={set("message")}
                    placeholder="Tell us about your assignment or ask a question…"
                    required
                    minLength={10}
                    maxLength={4000}
                    className="border-input focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2"
                  />
                </div>

                {error && (
                  <p className="text-destructive text-sm" role="alert">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={status === "sending"}
                >
                  {status === "sending" ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      Send message
                    </>
                  )}
                </Button>
                <p className="text-muted-foreground text-center text-xs">
                  No account needed — we&apos;ll reply straight to your email.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
