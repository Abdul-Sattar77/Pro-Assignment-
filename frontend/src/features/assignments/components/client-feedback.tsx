"use client";

import { useState } from "react";
import { Loader2, MessageSquareWarning, Star } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useSubmitComplaint } from "@/features/complaints";

function Stars({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              "size-6",
              n <= value
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}

/**
 * Client-only actions on a delivered/completed assignment: leave a review of
 * the writer, or report an issue (complaint) to the admin team.
 */
export function ClientFeedback({
  assignmentId,
  writerId,
  writerName,
}: {
  assignmentId: string;
  writerId?: string | null;
  writerName?: string | null;
}) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [complaintOpen, setComplaintOpen] = useState(false);

  return (
    <div className="flex flex-wrap gap-3">
      {writerId && (
        <Button variant="outline" onClick={() => setReviewOpen(true)}>
          <Star className="size-4" />
          Leave a review
        </Button>
      )}
      <Button variant="outline" onClick={() => setComplaintOpen(true)}>
        <MessageSquareWarning className="size-4" />
        Report an issue
      </Button>

      {writerId && (
        <ReviewDialog
          open={reviewOpen}
          onOpenChange={setReviewOpen}
          assignmentId={assignmentId}
          writerId={writerId}
          writerName={writerName}
        />
      )}
      <ComplaintDialog
        open={complaintOpen}
        onOpenChange={setComplaintOpen}
        assignmentId={assignmentId}
      />
    </div>
  );
}

function ReviewDialog({
  open,
  onOpenChange,
  assignmentId,
  writerId,
  writerName,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  assignmentId: string;
  writerId: string;
  writerName?: string | null;
}) {
  const [quality, setQuality] = useState(5);
  const [timeliness, setTimeliness] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await apiClient.post(`/users/${writerId}/ratings`, {
        assignmentId,
        quality,
        timeliness,
        communication,
        comment: comment.trim() || undefined,
      });
      toast.success("Thanks — your review has been submitted.");
      onOpenChange(false);
    } catch {
      toast.error("Couldn't submit your review. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Review your expert</DialogTitle>
          <DialogDescription>
            How did {writerName ?? "your writer"} do on this assignment?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {(
            [
              ["Quality of work", quality, setQuality],
              ["Timeliness", timeliness, setTimeliness],
              ["Communication", communication, setCommunication],
            ] as const
          ).map(([label, val, set]) => (
            <div key={label} className="flex items-center justify-between">
              <Label>{label}</Label>
              <Stars value={val} onChange={set} />
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="review-comment">Comment (optional)</Label>
            <textarea
              id="review-comment"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Anything you'd like to add…"
              className="border-input focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Submit review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ComplaintDialog({
  open,
  onOpenChange,
  assignmentId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  assignmentId: string;
}) {
  const submitComplaint = useSubmitComplaint();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const submit = () => {
    if (subject.trim().length < 3 || description.trim().length < 10) {
      toast.error("Add a subject and a bit more detail.");
      return;
    }
    submitComplaint.mutate(
      {
        assignmentId,
        subject: subject.trim(),
        description: description.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Your issue has been sent to the admin team.");
          setSubject("");
          setDescription("");
          onOpenChange(false);
        },
        onError: () => toast.error("Couldn't submit. Please try again."),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report an issue</DialogTitle>
          <DialogDescription>
            Tell the admin team what went wrong with this assignment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="complaint-subject">Subject</Label>
            <Input
              id="complaint-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Delivery was late"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="complaint-desc">What happened?</Label>
            <textarea
              id="complaint-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in a few sentences…"
              className="border-input focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={submitComplaint.isPending}>
            {submitComplaint.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Send to admin
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
