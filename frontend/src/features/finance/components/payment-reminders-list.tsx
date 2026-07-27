"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Bell,
  Send,
  Loader2,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  usePaymentReminders,
  useSendReminder,
  useInvoices,
} from "../hooks/use-finance";
import { invoiceClientName } from "../types";

export function PaymentRemindersList() {
  const [sendOpen, setSendOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<string>("");
  const [notes, setNotes] = useState("");

  const {
    data: reminders = [],
    isLoading,
    refetch,
    isFetching,
  } = usePaymentReminders();
  const sendReminder = useSendReminder();
  const { data: invoicesPage } = useInvoices({
    status: "pending",
    perPage: 50,
  });
  const pendingInvoices = invoicesPage?.invoices ?? [];

  const handleSend = () => {
    if (!selectedInvoice) return;
    sendReminder.mutate(
      { invoiceId: selectedInvoice, notes },
      {
        onSuccess: () => {
          setSendOpen(false);
          setSelectedInvoice("");
          setNotes("");
          void refetch();
        },
      },
    );
  };

  const statusMeta: Record<
    string,
    { icon: React.ReactNode; className: string }
  > = {
    sent: {
      icon: <CheckCircle className="size-3" />,
      className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    },
    pending: {
      icon: <Clock className="size-3" />,
      className: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    },
    failed: {
      icon: <AlertCircle className="size-3" />,
      className: "bg-rose-500/10 text-rose-600 border-rose-500/30",
    },
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="text-primary size-4" /> Payment Reminders
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              View and send payment reminders for unpaid invoices.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-1.5 size-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setSendOpen(true)}>
              <Send className="mr-1.5 size-4" />
              Send Reminder
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
              <Loader2 className="size-4 animate-spin" /> Loading reminders…
            </div>
          ) : reminders.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-sm">
              <Bell className="mx-auto mb-2 size-8 opacity-30" />
              No payment reminders sent yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reminders.map((r) => {
                  const meta = statusMeta[r.status] ?? statusMeta.sent;
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-mono text-xs font-medium">
                        {r.invoice?.number ?? r.invoiceId ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {r.client?.name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {r.type ?? "manual"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`flex w-fit items-center gap-1 text-xs ${meta.className}`}
                        >
                          {meta.icon}
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {r.sentAt
                          ? format(new Date(r.sentAt), "MMM d, yyyy HH:mm")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate text-xs">
                        {r.notes ?? "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Send Reminder Dialog */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="text-primary size-4" /> Send Payment Reminder
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Select Invoice (Pending)
              </Label>
              <Select
                value={selectedInvoice}
                onValueChange={setSelectedInvoice}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a pending invoice…" />
                </SelectTrigger>
                <SelectContent>
                  {pendingInvoices.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No pending invoices
                    </SelectItem>
                  ) : (
                    pendingInvoices.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>
                        {inv.number} — {invoiceClientName(inv.client)} (
                        {inv.formattedAmount ?? inv.amount})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">
                Message / Notes (optional)
              </Label>
              <Textarea
                rows={3}
                placeholder="Optional notes to attach to this reminder…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSendOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!selectedInvoice || sendReminder.isPending}
              className="gap-1.5"
            >
              {sendReminder.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
