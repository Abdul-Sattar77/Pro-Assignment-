"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Edit3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { apiClient } from "@/lib/api-client";
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
import { applyFieldErrors } from "@/lib/apply-field-errors";
import { useUpdateTask } from "../hooks/use-tasks";
import { TASK_PRIORITY, TASK_STATUS, type Task } from "../types";
import { PRIORITY_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from "../constants";

const editTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(255),
  description: z.string().max(10000).optional().nullable(),
  assignmentId: z.string().optional().nullable(),
  assignedUserId: z.string().optional().nullable(),
  priority: z.nativeEnum(TASK_PRIORITY),
  status: z.nativeEnum(TASK_STATUS),
  dueDate: z.string().optional().nullable(),
  notes: z.string().max(10000).optional().nullable(),
});

type EditTaskFormValues = z.infer<typeof editTaskSchema>;

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ task, open, onOpenChange }: EditTaskDialogProps) {
  const updateTask = useUpdateTask(task.id);

  // Fetch active users for assignee list
  const { data: users } = useQuery({
    queryKey: ["users", "active-list"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { id: string; name: string }[] }>("/users", {
        params: { "filter[status]": "active", per_page: 100 },
      });
      return data.data;
    },
    enabled: open,
    staleTime: 30 * 1000,
  });

  // Fetch assignments for order links
  const { data: assignments } = useQuery({
    queryKey: ["assignments", "dropdown-list"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { id: string; title: string }[] }>("/assignments", {
        params: { per_page: 100 },
      });
      return data.data;
    },
    enabled: open,
    staleTime: 30 * 1000,
  });

  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: task.title,
      description: task.description || "",
      assignmentId: task.assignment?.id || "",
      assignedUserId: task.assignedUser?.id || "",
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm") : "",
      notes: task.notes || "",
    },
  });

  // Reset form defaults when dialog is opened with a task
  useEffect(() => {
    if (open) {
      form.reset({
        title: task.title,
        description: task.description || "",
        assignmentId: task.assignment?.id || "",
        assignedUserId: task.assignedUser?.id || "",
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm") : "",
        notes: task.notes || "",
      });
    }
  }, [open, task, form]);

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      ...values,
      description: values.description === "" ? null : values.description,
      notes: values.notes === "" ? null : values.notes,
      assignmentId: values.assignmentId === "none" || values.assignmentId === "" ? null : values.assignmentId,
      assignedUserId: values.assignedUserId === "none" || values.assignedUserId === "" ? null : values.assignedUserId,
      dueDate: values.dueDate === "" || !values.dueDate ? null : new Date(values.dueDate).toISOString(),
    };

    updateTask.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false);
      },
      onError: (error) => {
        applyFieldErrors(error, form.setError);
        if (!error.isValidationError) {
          form.setError("root", { message: error.message });
        }
      },
    });
  });

  const { errors } = form.formState;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="text-primary size-5" />
            Edit task details
          </DialogTitle>
          <DialogDescription>
            Modify task summary, status, due dates, or reassign to another user.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="edit-task-title">Title</Label>
            <Input
              id="edit-task-title"
              type="text"
              placeholder="e.g. Research sources for history paper"
              aria-invalid={Boolean(errors.title)}
              {...form.register("title")}
            />
            {errors.title && (
              <p className="text-destructive text-xs" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-task-description">Description</Label>
            <textarea
              id="edit-task-description"
              rows={3}
              placeholder="Detailed description of what needs to be done..."
              className="border-input focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2"
              aria-invalid={Boolean(errors.description)}
              {...form.register("description")}
            />
            {errors.description && (
              <p className="text-destructive text-xs" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-task-assignment">Linked Assignment (Optional)</Label>
              <Controller
                control={form.control}
                name="assignmentId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || "none"}>
                    <SelectTrigger id="edit-task-assignment" className="w-full">
                      <SelectValue placeholder="Select assignment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {assignments?.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-task-assignee">Assign To (Optional)</Label>
              <Controller
                control={form.control}
                name="assignedUserId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || "none"}>
                    <SelectTrigger id="edit-task-assignee" className="w-full">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {users?.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-task-priority">Priority</Label>
              <Controller
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="edit-task-priority" className="w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITY_FILTER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-task-status">Status</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="edit-task-status" className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_FILTER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-task-due-date">Due Date (Optional)</Label>
            <Input
              id="edit-task-due-date"
              type="datetime-local"
              {...form.register("dueDate")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-task-notes">Internal Notes (Optional)</Label>
            <textarea
              id="edit-task-notes"
              rows={3}
              placeholder="Additional internal work notes..."
              className="border-input focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-2"
              aria-invalid={Boolean(errors.notes)}
              {...form.register("notes")}
            />
          </div>

          {errors.root && (
            <div
              className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
              role="alert"
            >
              {errors.root.message}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                form.reset();
              }}
              disabled={updateTask.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateTask.isPending}>
              {updateTask.isPending && <Loader2 className="size-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
