export interface User {
  id?: number;
  username: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  payrollNo?: string;
  roles: string[];
  mustChangePassword?: boolean;
  enabled?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  username: string;
  fullName: string;
  payrollNo?: string;
  roles: string[];
  mustChangePassword?: boolean;
}

export interface RoleMetadata {
  role: string;
  name: string;
  code: string;
  description: string;
  tier: string;
  userCount: number;
  permissions: string[];
}

export interface UserRegistrationResult {
  user: User;
  temporaryPassword?: string;
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserUpdateRequest {
  fullName: string;
  email?: string;
  phoneNumber?: string;
  payrollNo?: string;
  roles: string[];
  enabled?: boolean;
}
