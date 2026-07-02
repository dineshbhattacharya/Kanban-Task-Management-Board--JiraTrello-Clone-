import { Injectable, signal, computed, effect } from '@angular/core';
import { Board, Column, Task, SubTask } from '../models/kanban.model';

@Injectable({
  providedIn: 'root',
})
export class KanbanStateService {
  private readonly STORAGE_KEY_BOARDS = 'kanban_boards';
  private readonly STORAGE_KEY_ACTIVE_ID = 'kanban_active_board_id';

  // Signals
  readonly boards = signal<Board[]>(this.loadBoardsFromStorage());
  readonly activeBoardId = signal<string>(this.loadActiveBoardIdFromStorage());

  // Computed
  readonly activeBoard = computed(() => {
    const activeId = this.activeBoardId();
    return this.boards().find((b) => b.id === activeId) || this.boards()[0] || null;
  });

  constructor() {
    // Automatically persist to localStorage when signals change
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY_BOARDS, JSON.stringify(this.boards()));
    });

    effect(() => {
      localStorage.setItem(this.STORAGE_KEY_ACTIVE_ID, this.activeBoardId());
    });
  }

  // --- Board Actions ---

  addBoard(name: string): string {
    const id = this.generateId();
    const newBoard: Board = {
      id,
      name,
      columns: [
        { id: this.generateId(), name: 'To Do', color: '#6366f1', tasks: [] },
        { id: this.generateId(), name: 'In Progress', color: '#f59e0b', tasks: [] },
        { id: this.generateId(), name: 'Done', color: '#10b981', tasks: [] },
      ],
    };

    this.boards.update((current) => [...current, newBoard]);
    this.activeBoardId.set(id);
    return id;
  }

  renameBoard(boardId: string, name: string): void {
    this.boards.update((current) =>
      current.map((b) => (b.id === boardId ? { ...b, name } : b))
    );
  }

  deleteBoard(boardId: string): void {
    this.boards.update((current) => {
      const filtered = current.filter((b) => b.id !== boardId);
      if (this.activeBoardId() === boardId && filtered.length > 0) {
        this.activeBoardId.set(filtered[0].id);
      } else if (filtered.length === 0) {
        this.activeBoardId.set('');
      }
      return filtered;
    });
  }

  setActiveBoard(boardId: string): void {
    this.activeBoardId.set(boardId);
  }

  // --- Column Actions ---

  addColumn(boardId: string, columnName: string, color: string = '#6b7280'): void {
    const newCol: Column = {
      id: this.generateId(),
      name: columnName,
      color,
      tasks: [],
    };

    this.boards.update((current) =>
      current.map((b) => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          columns: [...b.columns, newCol],
        };
      })
    );
  }

  renameColumn(boardId: string, columnId: string, newName: string): void {
    this.boards.update((current) =>
      current.map((b) => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          columns: b.columns.map((c) => (c.id === columnId ? { ...c, name: newName } : c)),
        };
      })
    );
  }

  deleteColumn(boardId: string, columnId: string): void {
    this.boards.update((current) =>
      current.map((b) => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          columns: b.columns.filter((c) => c.id !== columnId),
        };
      })
    );
  }

  moveColumn(boardId: string, previousIndex: number, currentIndex: number): void {
    this.boards.update((current) =>
      current.map((b) => {
        if (b.id !== boardId) return b;
        const columns = [...b.columns];
        const [movedCol] = columns.splice(previousIndex, 1);
        columns.splice(currentIndex, 0, movedCol);
        return {
          ...b,
          columns,
        };
      })
    );
  }

  // --- Task Actions ---

  addTask(
    boardId: string,
    columnId: string,
    taskData: Omit<Task, 'id' | 'createdAt'>
  ): void {
    const newTask: Task = {
      ...taskData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };

    this.boards.update((current) =>
      current.map((b) => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          columns: b.columns.map((c) => {
            if (c.id !== columnId) return c;
            return {
              ...c,
              tasks: [...c.tasks, newTask],
            };
          }),
        };
      })
    );
  }

  updateTask(
    boardId: string,
    columnId: string,
    taskId: string,
    updatedFields: Partial<Task>
  ): void {
    this.boards.update((current) =>
      current.map((b) => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          columns: b.columns.map((c) => {
            if (c.id !== columnId) return c;
            return {
              ...c,
              tasks: c.tasks.map((t) => (t.id === taskId ? { ...t, ...updatedFields } : t)),
            };
          }),
        };
      })
    );
  }

  deleteTask(boardId: string, columnId: string, taskId: string): void {
    this.boards.update((current) =>
      current.map((b) => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          columns: b.columns.map((c) => {
            if (c.id !== columnId) return c;
            return {
              ...c,
              tasks: c.tasks.filter((t) => t.id !== taskId),
            };
          }),
        };
      })
    );
  }

  moveTask(
    boardId: string,
    previousColumnId: string,
    currentColumnId: string,
    previousIndex: number,
    currentIndex: number
  ): void {
    this.boards.update((current) =>
      current.map((b) => {
        if (b.id !== boardId) return b;

        const previousColumn = b.columns.find((c) => c.id === previousColumnId);
        const currentColumn = b.columns.find((c) => c.id === currentColumnId);

        if (!previousColumn || !currentColumn) return b;

        const updatedColumns = b.columns.map((c) => {
          if (c.id === previousColumnId && previousColumnId === currentColumnId) {
            // Drag and drop within the same column
            const tasks = [...c.tasks];
            const [movedTask] = tasks.splice(previousIndex, 1);
            tasks.splice(currentIndex, 0, movedTask);
            return { ...c, tasks };
          } else if (c.id === previousColumnId) {
            // Remove task from source column
            const tasks = [...c.tasks];
            tasks.splice(previousIndex, 1);
            return { ...c, tasks };
          } else if (c.id === currentColumnId) {
            // Add task to destination column
            const tasks = [...c.tasks];
            const taskToMove = previousColumn.tasks[previousIndex];
            if (taskToMove) {
              tasks.splice(currentIndex, 0, taskToMove);
            }
            return { ...c, tasks };
          }
          return c;
        });

        return { ...b, columns: updatedColumns };
      })
    );
  }

  toggleSubtask(
    boardId: string,
    columnId: string,
    taskId: string,
    subtaskId: string
  ): void {
    this.boards.update((current) =>
      current.map((b) => {
        if (b.id !== boardId) return b;
        return {
          ...b,
          columns: b.columns.map((c) => {
            if (c.id !== columnId) return c;
            return {
              ...c,
              tasks: c.tasks.map((t) => {
                if (t.id !== taskId) return t;
                return {
                  ...t,
                  subtasks: t.subtasks.map((s) =>
                    s.id === subtaskId ? { ...s, completed: !s.completed } : s
                  ),
                };
              }),
            };
          }),
        };
      })
    );
  }

  // --- Helper Methods ---

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

  private loadBoardsFromStorage(): Board[] {
    const data = localStorage.getItem(this.STORAGE_KEY_BOARDS);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse boards from storage', e);
      }
    }
    return [this.getSeedBoard()];
  }

  private loadActiveBoardIdFromStorage(): string {
    const id = localStorage.getItem(this.STORAGE_KEY_ACTIVE_ID);
    if (id) return id;
    const initialBoards = this.loadBoardsFromStorage();
    return initialBoards[0]?.id || '';
  }

  private getSeedBoard(): Board {
    return {
      id: 'default-board',
      name: '💡 Core Product Development',
      columns: [
        {
          id: 'todo-col',
          name: 'To Do',
          color: '#6366f1', // Indigo
          tasks: [
            {
              id: 'task-1',
              title: 'Design App Architecture',
              description: 'Define model structures, component hierarchy, and reactive state management using Angular Signals.',
              priority: 'high',
              dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0], // 7 days from now
              createdAt: new Date().toISOString(),
              subtasks: [
                { id: 'sub-1-1', title: 'Create board model interfaces', completed: true },
                { id: 'sub-1-2', title: 'Design Angular Signals state schema', completed: false },
                { id: 'sub-1-3', title: 'Design component data flow map', completed: false },
              ],
            },
            {
              id: 'task-2',
              title: 'Write User Documentation',
              description: 'Prepare a comprehensive walkthrough detailing how to manage task prioritizations and custom boards.',
              priority: 'low',
              dueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0], // 14 days from now
              createdAt: new Date().toISOString(),
              subtasks: [
                { id: 'sub-2-1', title: 'Draft keyboard shortcut references', completed: false },
              ],
            },
          ],
        },
        {
          id: 'progress-col',
          name: 'In Progress',
          color: '#f59e0b', // Amber
          tasks: [
            {
              id: 'task-3',
              title: 'Setup Sleek Design System',
              description: 'Implement dark-themed glassmorphism elements, CSS custom properties, dynamic glow borders, and micro-interactions.',
              priority: 'medium',
              dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days from now
              createdAt: new Date().toISOString(),
              subtasks: [
                { id: 'sub-3-1', title: 'Select custom color scales', completed: true },
                { id: 'sub-3-2', title: 'Add Inter & Outfit Google fonts', completed: true },
                { id: 'sub-3-3', title: 'Build drop placeholder transitions', completed: false },
              ],
            },
          ],
        },
        {
          id: 'done-col',
          name: 'Done',
          color: '#10b981', // Emerald
          tasks: [
            {
              id: 'task-4',
              title: 'Initialize Framework Baseline',
              description: 'Generate Angular standalone starter app and bootstrap workspace configuration structure.',
              priority: 'low',
              dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0], // yesterday
              createdAt: new Date().toISOString(),
              subtasks: [
                { id: 'sub-4-1', title: 'Create app workspace through Angular CLI', completed: true },
                { id: 'sub-4-2', title: 'Install Angular CDK npm packages', completed: true },
              ],
            },
          ],
        },
      ],
    };
  }
}
