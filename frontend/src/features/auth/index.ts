/**
 * Public surface of the auth feature. Other code imports ONLY from here —
 * never from this feature's internals (frontend-standards §8).
 */
export { AuthProvider, useAuth } from "./components/auth-provider";
export { AuthGuard } from "./components/auth-guard";
export { Can } from "./components/can";
export { WriterProfileCard } from "./components/writer-profile-card";
export { LoginForm } from "./components/login-form";
export { RegisterForm } from "./components/register-form";
export {
  useCurrentUser,
  useLogin,
  useLogout,
  useRegister,
} from "./hooks/use-auth-queries";
export { useUpdateProfile, useChangePassword, useProfileStats } from "./hooks/use-profile";
export {
  useForgotPassword,
  useResetPassword,
} from "./hooks/use-password-reset";
export { ForgotPasswordForm } from "./components/forgot-password-form";
export { ResetPasswordForm } from "./components/reset-password-form";
export {
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type UpdateProfileFormValues,
  type ChangePasswordFormValues,
  type ForgotPasswordFormValues,
  type ResetPasswordFormValues,
} from "./validation";
export { applyFieldErrors } from "./utils/apply-field-errors";
export type { AuthUser, LoginPayload, RegisterPayload } from "./types";
