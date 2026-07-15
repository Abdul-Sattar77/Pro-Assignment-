"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Mail, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { easeOut } from "@/animations/variants";
import { useCurrentUser } from "@/features/auth";
import { orderHref } from "../constants";

/** Update these to the studio's real contact details. */
const CONTACT_EMAIL = "hello@prossignment.com";
const CONTACT_WHATSAPP = "+1 (555) 012-3456";

const CHANNELS = [
  {
    icon: Mail,
    label: "Email",
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

/** Contact page — channels plus a message form that opens the user's mail app. */
export function ContactContent() {
  const { data: user } = useCurrentUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const subject = encodeURIComponent(`Enquiry from ${name || "a student"}`);
    const body = encodeURIComponent(
      `${message}\n\n— ${name}${email ? ` (${email})` : ""}`,
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="mx-auto max-w-5xl px-6 pb-24">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        {/* Channels */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: easeOut }}
          className="space-y-4"
        >
          {CHANNELS.map((channel) => {
            const inner = (
              <div className="aurora-border flex items-center gap-4 rounded-2xl p-5">
                <span className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-full">
                  <channel.icon className="size-5" />
                </span>
                <div>
                  <p className="text-muted-foreground font-mono text-[10px] tracking-[0.18em] uppercase">
                    {channel.label}
                  </p>
                  <p className="mt-0.5 font-medium">{channel.value}</p>
                </div>
              </div>
            );
            return channel.href ? (
              <a
                key={channel.label}
                href={channel.href}
                target={channel.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="block transition-transform hover:scale-[1.01]"
              >
                {inner}
              </a>
            ) : (
              <div key={channel.label}>{inner}</div>
            );
          })}

          <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
            <p className="text-sm font-medium">Ready to get started?</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Skip the back-and-forth — submit your assignment and a project
              manager will reply with a quote.
            </p>
            <Button asChild className="mt-4">
              <Link href={orderHref(Boolean(user))}>Submit an assignment</Link>
            </Button>
          </div>
        </motion.div>

        {/* Message form */}
        <motion.form
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: easeOut, delay: 0.08 }}
          onSubmit={onSubmit}
          className="space-y-5 rounded-3xl border border-white/8 bg-white/3 p-6 sm:p-8"
        >
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Send us a message
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Questions before you submit? Ask away — we usually reply the same
              day.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-name">Your name</Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@university.edu"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message">Message</Label>
            <textarea
              id="contact-message"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us about your assignment or ask a question…"
              required
              className="border-input focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2"
            />
          </div>

          <Button type="submit" size="lg" className="w-full">
            <Send className="size-4" />
            Send message
          </Button>
          <p className="text-muted-foreground text-center text-xs">
            This opens your email app addressed to our team.
          </p>
        </motion.form>
      </div>
    </div>
  );
}
