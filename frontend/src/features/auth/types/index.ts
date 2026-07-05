/**
 * Auth domain types — mirror the backend UserResource contract
 * (backend/app/Http/Resources/UserResource.php).
 */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
  createdAt: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}
