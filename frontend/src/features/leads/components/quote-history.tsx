"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Plus, Receipt, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLeadQuotes, useCreateLeadQuote } from "../hooks/use-leads";

export function QuoteHistory({ leadId }: { leadId: string }) {
  const { data: quotes, isPending } = useLeadQuotes(leadId);
  const createQuote = useCreateLeadQuote(leadId);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) return;

    createQuote.mutate(
      { amount: parsedAmount, notes: notes || null },
      {
        onSuccess: () => {
          setOpen(false);
          setAmount("");
          setNotes("");
        },
      },
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Receipt className="text-primary size-4" />
            Quote History
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => setOpen(true)}
          >
            <Plus className="size-3.5" />
            Add Quote
          </Button>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="text-muted-foreground flex items-center gap-2 py-6 text-sm">
              <Loader2 className="size-4 animate-spin" />
              Loading quote history…
            </div>
          ) : !quotes || quotes.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              No quotes generated for this lead yet.
            </p>
          ) : (
            <div className="divide-y rounded-md border">
              {quotes.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-start justify-between p-3 text-sm"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">
                      ${quote.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    {quote.notes && (
                      <p className="text-muted-foreground text-xs">{quote.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-xs">
                      {quote.createdAt
                        ? format(new Date(quote.createdAt), "MMM d, yyyy HH:mm")
                        : "—"}
                    </p>
                    {quote.createdBy && (
                      <p className="text-muted-foreground font-mono text-[10px]">
                        by {quote.createdBy}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Quote</DialogTitle>
            <DialogDescription>
              Record a new price quote for this prospect.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quote-amount">Quote Amount ($)</Label>
              <Input
                id="quote-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quote-notes">Notes / Scope (Optional)</Label>
              <textarea
                id="quote-notes"
                rows={3}
                placeholder="Enter details about what is included in this quote..."
                className="border-input focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createQuote.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createQuote.isPending}>
                {createQuote.isPending && (
                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                )}
                Save Quote
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
