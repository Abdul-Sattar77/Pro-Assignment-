export interface Role {
  id: string;
  name: string;
  permissions: string[];
  createdAt: string | null;
}

export interface Permission {
  id: string;
  name: string;
}

export interface RolePayload {
  name?: string;
  permissions: string[];
}
