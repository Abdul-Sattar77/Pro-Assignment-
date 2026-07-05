import { z } from "zod";

/**
 * User form schema (mirrors backend Store/UpdateUserRequest).
 * One consistent output shape for create and edit: `password` is always a
 * string — required ≥8 chars on create, empty-or-≥8 on edit (empty = keep).
 */
export function userFormSchema(isEdit: boolean) {
  return z.object({
    name: z.string().min(2, "Name must be at least 2 characters.").max(255),
    email: z.email("Enter a valid email address."),
    password: isEdit
      ? z
          .string()
          .refine(
            (value) => value === "" || value.length >= 8,
            "Password must be at least 8 characters.",
          )
      : z.string().min(8, "Password must be at least 8 characters."),
    role: z.string().min(1, "Select a role."),
  });
}

export type UserFormValues = z.infer<ReturnType<typeof userFormSchema>>;
