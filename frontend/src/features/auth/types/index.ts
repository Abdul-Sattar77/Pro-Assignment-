/**
 * Auth domain types — mirror the backend UserResource contract
 * (backend/app/Http/Resources/UserResource.php).
 */
export type WriterAvailability = "available" | "busy" | "away";

/** Structured writer expertise/availability (self-service; JSON blob). */
export interface WriterProfile {
  subjects?: string | null;
  universities?: string | null;
  codingLanguages?: string | null;
  dissertationExperience?: boolean | null;
  urgentCapable?: boolean | null;
  maxWordCount?: number | null;
  maxWorkload?: number | null;
}

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
  writerProfile: WriterProfile | null;
  averageRating: number | null;
  totalEarnings: number;
  /** Active assignment count — only returned for the user's own record. */
  currentWorkload?: number;
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
