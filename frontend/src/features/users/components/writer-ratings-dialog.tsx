"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Star, Plus, ShieldAlert, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import { useAssignments } from "@/features/assignments/hooks/use-assignments";
import { USERS_QUERY_KEYS } from "../constants";
import { toast } from "sonner";

interface WriterRatingsDialogProps {
  writer: { id: string; name: string } | null;
  onClose: () => void;
}

interface RatingItem {
  id: string;
  clientName: string;
  assignmentTitle: string;
  quality: number;
  timeliness: number;
  communication: number;
  overallRating: number;
  comment: string | null;
  createdAt: string;
}

export function WriterRatingsDialog({
  writer,
  onClose,
}: WriterRatingsDialogProps) {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [assignmentId, setAssignmentId] = useState("");
  const [quality, setQuality] = useState("5");
  const [timeliness, setTimeliness] = useState("5");
  const [communication, setCommunication] = useState("5");
  const [comment, setComment] = useState("");

  // Fetch rating history
  const {
    data: ratings,
    isLoading,
    refetch,
  } = useQuery<RatingItem[]>({
    queryKey: ["users", writer?.id, "ratings"],
    queryFn: async () => {
      const { data } = await apiClient.get(`/users/${writer?.id}/ratings`);
      return data.data;
    },
    enabled: Boolean(writer),
  });

  // Fetch completed assignments for this writer (to rate them)
  const { data: assignmentsData } = useAssignments({
    perPage: 100,
    // Add custom filter in next query render if needed, but loading all allows client selection
  });

  // Filter assignments matching writer and status "completed"
  const filterAssignments =
    assignmentsData?.assignments.filter((a) => a.status === "completed") || [];

  const addRating = useMutation({
    mutationFn: async (payload: any) => {
      await apiClient.post(`/users/${writer?.id}/ratings`, payload);
    },
    onSuccess: () => {
      toast.success("Performance rating submitted.");
      setShowAddForm(false);
      setAssignmentId("");
      setComment("");
      void refetch();
      void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.all });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit rating.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentId) {
      toast.error("Please select an assignment to rate.");
      return;
    }

    addRating.mutate({
      assignmentId,
      quality: Number(quality),
      timeliness: Number(timeliness),
      communication: Number(communication),
      comment: comment || undefined,
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`size-3.5 ${
              s <= Math.round(rating)
                ? "fill-amber-400 text-amber-500"
                : "text-slate-200 dark:text-slate-700"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={Boolean(writer)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col p-6 sm:max-w-lg">
        <DialogHeader className="border-b pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Award className="text-primary size-5" />
            <span>Ratings & Performance — {writer?.name}</span>
          </DialogTitle>
          <DialogDescription>
            Performance reviews submitted by clients and managers.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[250px] flex-1 space-y-4 overflow-y-auto py-4">
          {showAddForm ? (
            <form
              onSubmit={handleSubmit}
              className="bg-muted/40 space-y-4 rounded-lg border p-4"
            >
              <h4 className="text-sm font-semibold">
                Submit New Performance Review
              </h4>

              <div className="space-y-2">
                <Label htmlFor="rate-assignment">Select Assignment</Label>
                <Select value={assignmentId} onValueChange={setAssignmentId}>
                  <SelectTrigger id="rate-assignment">
                    <SelectValue placeholder="Select completed assignment" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterAssignments.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.title}
                      </SelectItem>
                    ))}
                    {filterAssignments.length === 0 && (
                      <SelectItem value="none" disabled>
                        No completed assignments found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="rate-quality">Quality</Label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger id="rate-quality">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 - Excellent</SelectItem>
                      <SelectItem value="4">4 - Good</SelectItem>
                      <SelectItem value="3">3 - Average</SelectItem>
                      <SelectItem value="2">2 - Fair</SelectItem>
                      <SelectItem value="1">1 - Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rate-timeliness">Timeliness</Label>
                  <Select value={timeliness} onValueChange={setTimeliness}>
                    <SelectTrigger id="rate-timeliness">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 - Excellent</SelectItem>
                      <SelectItem value="4">4 - Good</SelectItem>
                      <SelectItem value="3">3 - Average</SelectItem>
                      <SelectItem value="2">2 - Fair</SelectItem>
                      <SelectItem value="1">1 - Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rate-comm">Communication</Label>
                  <Select
                    value={communication}
                    onValueChange={setCommunication}
                  >
                    <SelectTrigger id="rate-comm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 - Excellent</SelectItem>
                      <SelectItem value="4">4 - Good</SelectItem>
                      <SelectItem value="3">3 - Average</SelectItem>
                      <SelectItem value="2">2 - Fair</SelectItem>
                      <SelectItem value="1">1 - Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate-comment">Feedback Comments</Label>
                <textarea
                  id="rate-comment"
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Detail client feedback or PM quality review outlines..."
                  className="border-input focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={addRating.isPending}>
                  {addRating.isPending && (
                    <Loader2 className="mr-1 size-3 animate-spin" />
                  )}
                  Submit Rating
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Rating Logs ({ratings?.length || 0})
              </span>
              <Button
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="size-3.5" />
                Add Rating
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-10">
              <Loader2 className="text-primary h-5 w-5 animate-spin" />
              <span className="text-muted-foreground text-xs font-medium">
                Loading reviews...
              </span>
            </div>
          ) : ratings?.length === 0 ? (
            <p className="text-muted-foreground rounded-lg border border-dashed py-10 text-center text-sm">
              No ratings logged yet for this writer.
            </p>
          ) : (
            <div className="space-y-3">
              {ratings?.map((r) => (
                <div key={r.id} className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {r.clientName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-slate-500">
                        ({r.overallRating.toFixed(1)})
                      </span>
                      {renderStars(r.overallRating)}
                    </div>
                  </div>
                  <p className="text-muted-foreground font-mono text-[11px]">
                    Order: {r.assignmentTitle}
                  </p>
                  {r.comment && (
                    <p className="text-slate-650 rounded-md bg-slate-50 p-2 text-xs italic dark:bg-slate-800/40">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  )}
                  <div className="flex gap-3 pt-1 text-[10px] text-slate-500">
                    <span>Quality: {r.quality}/5</span>
                    <span>Timeliness: {r.timeliness}/5</span>
                    <span>Comm: {r.communication}/5</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
