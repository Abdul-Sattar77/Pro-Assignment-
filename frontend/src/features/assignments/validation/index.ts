import { z } from "zod";

/** Minimum lead time for a deadline (mirrors backend `after:+2 hours`). */
const MIN_LEAD_MS = 2 * 60 * 60 * 1000;

/** Mirrors backend StoreAssignmentRequest. */
export const createAssignmentSchema = z.object({
  title: z
    .string()
    .min(5, "Give your order a clear title (min 5 characters).")
    .max(180, "Title is too long."),
  subject: z
    .string()
    .min(2, "Enter the subject or field.")
    .max(120, "Subject is too long."),
  description: z
    .string()
    .min(30, "Describe your requirements (min 30 characters).")
    .max(10000, "Description is too long."),
  deadline: z
    .string()
    .min(1, "Pick a deadline.")
    .refine(
      (value) => {
        const date = new Date(value);
        return !Number.isNaN(date.getTime());
      },
      { message: "Enter a valid date and time." },
    )
    .refine((value) => new Date(value).getTime() > Date.now() + MIN_LEAD_MS, {
      message: "The deadline must be at least 2 hours from now.",
    }),
});

export type CreateAssignmentFormValues = z.infer<typeof createAssignmentSchema>;
