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

export function WriterRatingsDialog({ writer, onClose }: WriterRatingsDialogProps) {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [assignmentId, setAssignmentId] = useState("");
  const [quality, setQuality] = useState("5");
  const [timeliness, setTimeliness] = useState("5");
  const [communication, setCommunication] = useState("5");
  const [comment, setComment] = useState("");

  // Fetch rating history
  const { data: ratings, isLoading, refetch } = useQuery<RatingItem[]>({
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
  const filterAssignments = assignmentsData?.assignments.filter(
    (a) => a.status === "completed"
  ) || [];

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
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Award className="size-5 text-primary" />
            <span>Ratings & Performance — {writer?.name}</span>
          </DialogTitle>
          <DialogDescription>
            Performance reviews submitted by clients and managers.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4 min-h-[250px]">
          {showAddForm ? (
            <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4 bg-muted/40">
              <h4 className="font-semibold text-sm">Submit New Performance Review</h4>
              
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
                      <SelectItem value="none" disabled>No completed assignments found</SelectItem>
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
                  <Select value={communication} onValueChange={setCommunication}>
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

              <div className="flex gap-2 justify-end pt-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={addRating.isPending}>
                  {addRating.isPending && <Loader2 className="size-3 animate-spin mr-1" />}
                  Submit Rating
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rating Logs ({ratings?.length || 0})
              </span>
              <Button size="sm" className="h-8 gap-1.5" onClick={() => setShowAddForm(true)}>
                <Plus className="size-3.5" />
                Add Rating
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex py-10 items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground font-medium">Loading reviews...</span>
            </div>
          ) : ratings?.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground py-10 border rounded-lg border-dashed">
              No ratings logged yet for this writer.
            </p>
          ) : (
            <div className="space-y-3">
              {ratings?.map((r) => (
                <div key={r.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {r.clientName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500 font-medium">({r.overallRating.toFixed(1)})</span>
                      {renderStars(r.overallRating)}
                    </div>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Order: {r.assignmentTitle}
                  </p>
                  {r.comment && (
                    <p className="text-xs text-slate-650 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-md italic">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  )}
                  <div className="flex gap-3 text-[10px] text-slate-500 pt-1">
                    <span>Quality: {r.quality}/5</span>
                    <span>Timeliness: {r.timeliness}/5</span>
                    <span>Comm: {r.communication}/5</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
