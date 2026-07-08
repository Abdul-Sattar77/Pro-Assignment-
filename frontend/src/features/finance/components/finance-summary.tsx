"use client";

import { BadgeCheck, Clock, FileText, Wallet } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "../constants";
import { useFinanceSummary } from "../hooks/use-finance";

/** Money summary tiles (scoped by the API: clients see their own totals). */
export function FinanceSummaryTiles() {
  const { data, isPending } = useFinanceSummary();

  const tiles = [
    {
      label: "Paid",
      icon: BadgeCheck,
      value: data ? formatMoney(data.paidCents, data.currency) : "—",
    },
    {
      label: "Outstanding",
      icon: Wallet,
      value: data ? formatMoney(data.outstandingCents, data.currency) : "—",
    },
    {
      label: "Awaiting verification",
      icon: Clock,
      value: data ? formatMoney(data.awaitingCents, data.currency) : "—",
    },
    {
      label: "Invoices",
      icon: FileText,
      value: data ? String(data.invoiceCount) : "—",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((tile) => (
        <Card key={tile.label}>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1.5">
              <tile.icon className="size-3.5" />
              {tile.label}
            </CardDescription>
            {isPending ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <CardTitle className="text-2xl tabular-nums">
                {tile.value}
              </CardTitle>
            )}
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
