// ============================================================================
// TASKIFY - Board Models
// ============================================================================

import { Task } from './task.model';

export interface Board {
  id: number;
  name: string;
  projectId: number;
  createdAt: string;
  updatedAt: string;
  columns?: Column[];
  _count?: {
    columns: number;
  };
}

export interface Column {
  id: number;
  name: string;
  color: string;
  position: number;
  boardId: number;
  tasks?: Task[];
  _count?: {
    tasks: number;
  };
}

export interface CreateBoardDto {
  name: string;
  createDefaultColumns?: boolean;
}

export interface UpdateBoardDto {
  name?: string;
}

export interface CreateColumnDto {
  name: string;
  color?: string;
}

export interface UpdateColumnDto {
  name?: string;
  color?: string;
}

export interface ReorderColumnsDto {
  columnIds: number[];
}
