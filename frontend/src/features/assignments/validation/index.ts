import { z } from "zod";

/** Minimum lead time for a deadline (mirrors backend `after:+2 hours`). */
const MIN_LEAD_MS = 2 * 60 * 60 * 1000;

const ASSIGNMENT_TYPES = [
  "essay",
  "report",
  "research_paper",
  "dissertation",
  "thesis",
  "coursework",
  "case_study",
  "literature_review",
  "presentation",
  "programming",
  "editing",
  "other",
] as const;

const ACADEMIC_LEVELS = [
  "high_school",
  "undergraduate",
  "masters",
  "phd",
] as const;

const PRIORITIES = ["standard", "urgent", "critical"] as const;

/** Empty select/text values submit as "" — treat those as "not provided". */
const optionalText = z
  .string()
  .trim()
  .max(160, "That value is too long.")
  .optional()
  .or(z.literal(""));

/** Mirrors backend StoreAssignmentRequest. */
export const createAssignmentSchema = z.object({
  // Assignment details
  title: z
    .string()
    .min(5, "Give your assignment a clear title (min 5 characters).")
    .max(180, "Title is too long."),
  subject: z
    .string()
    .min(2, "Enter the subject or field.")
    .max(120, "Subject is too long."),
  type: z.enum(ASSIGNMENT_TYPES).optional().or(z.literal("")),
  academic_level: z.enum(ACADEMIC_LEVELS).optional().or(z.literal("")),
  course: optionalText,
  university: optionalText,
  word_count: z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d{1,7}$/.test(value), {
      message: "Enter a whole number of words.",
    })
    .optional(),
  referencing_style: z
    .string()
    .trim()
    .max(60, "That value is too long.")
    .optional()
    .or(z.literal("")),
  priority: z.enum(PRIORITIES).optional().or(z.literal("")),
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

  // Student contact details
  contact_phone: z
    .string()
    .trim()
    .max(40, "That number is too long.")
    .optional()
    .or(z.literal("")),
  contact_whatsapp: z
    .string()
    .trim()
    .max(40, "That number is too long.")
    .optional()
    .or(z.literal("")),

  // Additional information
  description: z
    .string()
    .min(30, "Describe your requirements (min 30 characters).")
    .max(10000, "Description is too long."),
});

export type CreateAssignmentFormValues = z.infer<typeof createAssignmentSchema>;
