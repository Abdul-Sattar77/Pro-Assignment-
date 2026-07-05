import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { ApiError } from "@/lib/http-error";

/**
 * Maps a 422 ApiError's field details onto React Hook Form fields.
 * Backend keys are snake_case; pass a key map for fields whose client name
 * differs (e.g. password_confirmation → passwordConfirmation).
 *
 * Shared infrastructure (used by auth, users, and future form features).
 */
export function applyFieldErrors<T extends FieldValues>(
  error: ApiError,
  setError: UseFormSetError<T>,
  keyMap: Record<string, Path<T>> = {},
): void {
  if (!error.isValidationError) return;

  for (const [field, messages] of Object.entries(error.fieldErrors)) {
    const target = keyMap[field] ?? (field as Path<T>);
    const message = messages[0];
    if (message) {
      setError(target, { type: "server", message });
    }
  }
}
