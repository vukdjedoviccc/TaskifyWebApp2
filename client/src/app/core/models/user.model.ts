// ============================================================================
// TASKIFY - User Models (Minimalna verzija)
// 3 sistemske role: ADMIN, MODERATOR, USER
// ============================================================================

export type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';
