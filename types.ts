
export enum ProjectStatus {
  ACTIVE = 'Ativo',
  PAUSED = 'Pausado',
  COMPLETED = 'Concluído',
  ARCHIVED = 'Arquivado'
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  orderIndex: number;
  createdAt: any;
  updatedAt: any;
}

export interface Phase {
  id: string;
  projectId: string;
  ownerId: string;
  title: string;
  notes?: string;
  startAt: any;
  endAt: any;
  done: boolean;
  orderIndex: number;
  createdAt: any;
  updatedAt: any;
}

export interface Subphase {
  id: string;
  phaseId: string;
  ownerId: string;
  title: string;
  notes?: string;
  startAt: any;
  endAt: any;
  done: boolean;
  orderIndex: number;
  createdAt: any;
  updatedAt: any;
}

export interface TaskLog {
  id: string;
  ownerId: string;
  title: string;
  details: string;
  relatedProjectId?: string;
  createdAt: any;
}

export enum ReminderPriority {
  LOW = 'low',
  MED = 'med',
  HIGH = 'high'
}

export enum ReminderStatus {
  ACTIVE = 'active',
  DONE = 'done',
  SNOOZED = 'snoozed'
}

export interface Reminder {
  id: string;
  ownerId: string;
  title: string;
  details?: string;
  targetType: 'project' | 'phase' | 'subphase' | 'general';
  targetId?: string;
  remindAt: any;
  priority: ReminderPriority;
  status: ReminderStatus;
  snoozeUntil?: any;
  sentAt?: any;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  fontScale: number;
}
