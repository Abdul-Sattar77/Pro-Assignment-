import { z } from "zod";

/**
 * Client-side validation schemas. Mirror the backend FormRequests
 * (LoginRequest / RegisterRequest) so both sides enforce the same rules.
 */
export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters.")
      .max(255, "Name is too long."),
    email: z.email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    passwordConfirmation: z.string().min(1, "Confirm your password."),
    university: z
      .string()
      .min(2, "Enter your university name.")
      .max(160, "University name is too long."),
    department: z
      .string()
      .min(2, "Enter your department.")
      .max(120, "Department is too long."),
    studyYear: z
      .string()
      .min(1, "Enter your year of study.")
      .max(40, "Year is too long."),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

/** Edit own profile (mirrors backend UpdateProfileRequest). */
export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(255),
  email: z.email("Enter a valid email address."),
  university: z.string().max(160).optional().or(z.literal("")),
  department: z.string().max(120).optional().or(z.literal("")),
  studyYear: z.string().max(40).optional().or(z.literal("")),
});

/** Change own password (mirrors backend ChangePasswordRequest). */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    passwordConfirmation: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

/** Request a password-reset link. */
export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email address."),
});

/** Set a new password from an emailed reset link. */
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    passwordConfirmation: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords do not match.",
    path: ["passwordConfirmation"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
