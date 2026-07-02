export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  subtasks: SubTask[];
  createdAt: string;
}

export interface Column {
  id: string;
  name: string;
  color: string; // CSS color string for column highlights (e.g. hex or hsl)
  tasks: Task[];
}

export interface Board {
  id: string;
  name: string;
  columns: Column[];
}
