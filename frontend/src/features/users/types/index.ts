/**
 * Users domain types — mirror the backend UserResource + UserController
 * contracts (list omits `permissions`; detail includes it).
 */
export interface UserListItem {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  roles: string[];
  createdAt: string | null;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: "active" | "inactive";
  page?: number;
  perPage?: number;
  sort?: string;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface UsersPage {
  users: UserListItem[];
  pagination: PaginationMeta;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  roles: string[];
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  roles?: string[];
  isActive?: boolean;
}
