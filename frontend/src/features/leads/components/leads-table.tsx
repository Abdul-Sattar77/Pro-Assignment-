"use client";

import { useState } from "react";
import { Search, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { LeadDetail } from "./lead-detail";
import type { Lead, LeadStatus } from "../types";

const MOCK_LEADS: Lead[] = [
  {
    id: "L001",
    clientName: "John Smith",
    clientEmail: "john@example.com",
    subject: "Essay Writing — 2000 words",
    description:
      "I need a well-researched essay on climate change and its economic impacts. APA format, 2000 words, due in 5 days.",
    status: "approved",
    priority: "high",
    budget: "PKR 5,000",
    deadline: "2026-07-15",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "L002",
    clientName: "Sarah Johnson",
    clientEmail: "sarah@example.com",
    subject: "Research Paper — Quantum Computing",
    description:
      "Comprehensive research paper on quantum computing applications in cybersecurity. 5000 words, IEEE format.",
    status: "approved",
    priority: "urgent",
    budget: "PKR 12,000",
    deadline: "2026-07-20",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "L003",
    clientName: "Mike Davis",
    clientEmail: "mike@example.com",
    subject: "Case Study — Business Strategy",
    description:
      "Case study analysis of Tesla business strategy from 2010 to 2025. Harvard format, 3000 words.",
    status: "converted",
    priority: "medium",
    budget: "PKR 8,000",
    deadline: "2026-07-18",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    assignmentId: "A-103",
  },
  {
    id: "L004",
    clientName: "Emma Wilson",
    clientEmail: "emma@example.com",
    subject: "Thesis Chapter — Literature Review",
    description:
      "Literature review chapter for PhD thesis on machine learning in healthcare. 8000 words.",
    status: "new",
    priority: "high",
    budget: "PKR 20,000",
    deadline: "2026-07-30",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "L005",
    clientName: "David Brown",
    clientEmail: "david@example.com",
    subject: "Assignment — Marketing Plan",
    description:
      "Marketing plan for a new product launch in the Pakistani market. 1500 words with SWOT analysis.",
    status: "rejected",
    priority: "low",
    budget: "PKR 3,000",
    deadline: "2026-07-12",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
  },
];

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

export function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  function handleConvert(id: string) {
    const assignmentId = `A-${Math.floor(Math.random() * 900) + 100}`;
    setLeads((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, status: "converted" as LeadStatus, assignmentId }
          : l,
      ),
    );
    setSelectedLead((prev) =>
      prev?.id === id ? { ...prev, status: "converted", assignmentId } : prev,
    );
  }

  const filtered = leads.filter((l) => {
    const matchSearch =
      l.clientName.toLowerCase().includes(search.toLowerCase()) ||
      l.subject.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className={cn("gap-6", selectedLead ? "grid grid-cols-5" : "block")}>
      {/* Table side */}
      <div className={selectedLead ? "col-span-3" : ""}>
        {/* Filters */}
        <div className="mb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats row */}
        <div className="mb-4 grid grid-cols-4 gap-3">
          {(["new", "approved", "converted", "rejected"] as LeadStatus[]).map(
            (s) => (
              <div
                key={s}
                className={cn(
                  "rounded-lg border p-3 text-center",
                  STATUS_STYLES[s],
                )}
              >
                <p className="text-lg font-bold">
                  {leads.filter((l) => l.status === s).length}
                </p>
                <p className="mt-0.5 text-xs capitalize opacity-80">{s}</p>
              </div>
            ),
          )}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full">
            <thead className="bg-muted/30 border-b">
              <tr>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium">
                  Lead
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium">
                  Client
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium">
                  Priority
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium">
                  Status
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium">
                  Budget
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium">
                  Received
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => (
                <tr
                  key={lead.id}
                  className={cn(
                    "hover:bg-muted/30 cursor-pointer border-b transition-colors last:border-0",
                    selectedLead?.id === lead.id && "bg-muted/50",
                    i % 2 === 0 ? "" : "bg-muted/10",
                  )}
                  onClick={() =>
                    setSelectedLead(selectedLead?.id === lead.id ? null : lead)
                  }
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{lead.id}</p>
                    <p className="text-muted-foreground max-w-32 truncate text-xs">
                      {lead.subject}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm">{lead.clientName}</p>
                    <p className="text-muted-foreground text-xs">
                      {lead.clientEmail}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs capitalize",
                        PRIORITY_STYLES[lead.priority],
                      )}
                    >
                      {lead.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs capitalize",
                        STATUS_STYLES[lead.status],
                      )}
                    >
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">{lead.budget ?? "—"}</td>
                  <td className="text-muted-foreground px-4 py-3 text-xs">
                    {formatDistanceToNow(new Date(lead.createdAt), {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="icon" className="size-7">
                      <Eye className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-muted-foreground py-12 text-center text-sm">
              No leads found.
            </div>
          )}
        </div>
        <p className="text-muted-foreground mt-2 text-xs">
          {filtered.length} leads
        </p>
      </div>

      {/* Detail side */}
      {selectedLead && (
        <div className="col-span-2">
          <LeadDetail
            lead={selectedLead}
            onConvert={handleConvert}
            onClose={() => setSelectedLead(null)}
          />
        </div>
      )}
    </div>
  );
}
