// ============================================================================
// TASKIFY - Project Models (Minimalna verzija)
// Bez ProjectMember - pristup baziran na ownerId
// ============================================================================

import { User } from './user.model';
import { Board } from './board.model';
import { Label } from './task.model';

export interface Project {
  id: number;
  name: string;
  description?: string;
  color: string;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  boards?: Board[];
  labels?: Label[];
  _count?: {
    boards: number;
  };
}

export interface ProjectFilters {
  q?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  color?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
