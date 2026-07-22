/**
 * Auth domain types — mirror the backend UserResource contract
 * (backend/app/Http/Resources/UserResource.php).
 */
export type WriterAvailability = "available" | "busy" | "away";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  university: string | null;
  department: string | null;
  studyYear: string | null;
  /** Writer self-service fields (present for all users; meaningful for writers). */
  availability: WriterAvailability | null;
  expertise: string | null;
  averageRating: number | null;
  totalEarnings: number;
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
  university: string;
  department: string;
  studyYear: string;
}
