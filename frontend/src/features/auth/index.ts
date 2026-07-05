/**
 * Public surface of the auth feature. Other code imports ONLY from here —
 * never from this feature's internals (frontend-standards §8).
 */
export { AuthProvider, useAuth } from "./components/auth-provider";
export { AuthGuard } from "./components/auth-guard";
export { Can } from "./components/can";
export { LoginForm } from "./components/login-form";
export { RegisterForm } from "./components/register-form";
export {
  useCurrentUser,
  useLogin,
  useLogout,
  useRegister,
} from "./hooks/use-auth-queries";
export type { AuthUser, LoginPayload, RegisterPayload } from "./types";
