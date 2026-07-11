"use client";

import {
  Calendar,
  Mail,
  User,
  DollarSign,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Lead } from "../types";

const STATUS_STYLES = {
  new: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  approved: "bg-green-500/15 text-green-400 border-green-500/30",
  converted: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  rejected: "bg-red-500/15 text-red-400 border-red-500/30",
};

const PRIORITY_STYLES = {
  low: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  urgent: "bg-red-500/15 text-red-400 border-red-500/30",
};

interface LeadDetailProps {
  lead: Lead;
  onConvert: (id: string) => void;
  onClose: () => void;
}

export function LeadDetail({ lead, onConvert, onClose }: LeadDetailProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">
            {lead.subject}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="shrink-0 text-xs"
          >
            Close
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className={cn("text-xs capitalize", STATUS_STYLES[lead.status])}
          >
            {lead.status}
          </Badge>
          <Badge
            variant="outline"
            className={cn("text-xs capitalize", PRIORITY_STYLES[lead.priority])}
          >
            {lead.priority}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="text-muted-foreground size-4 shrink-0" />
            <span>{lead.clientName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="text-muted-foreground size-4 shrink-0" />
            <span className="text-muted-foreground">{lead.clientEmail}</span>
          </div>
          {lead.budget && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="text-muted-foreground size-4 shrink-0" />
              <span>{lead.budget}</span>
            </div>
          )}
          {lead.deadline && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="text-muted-foreground size-4 shrink-0" />
              <span>{lead.deadline}</span>
            </div>
          )}
        </div>

        <Separator />

        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium">
            Description
          </p>
          <p className="text-sm leading-relaxed">{lead.description}</p>
        </div>

        {lead.status === "approved" && (
          <>
            <Separator />
            <Button className="w-full gap-2" onClick={() => onConvert(lead.id)}>
              <FileText className="size-4" />
              Convert to Assignment
              <ArrowRight className="size-4" />
            </Button>
          </>
        )}

        {lead.status === "converted" && lead.assignmentId && (
          <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-3 text-sm text-purple-400">
            ✓ Converted to {lead.assignmentId}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
