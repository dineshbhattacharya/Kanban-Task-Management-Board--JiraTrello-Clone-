import { Component, inject, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { KanbanStateService } from '../../services/kanban-state.service';
import { ColumnComponent } from '../column/column';
import { TaskModal } from '../task-modal/task-modal';
import { Task } from '../../models/kanban.model';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [ColumnComponent, TaskModal, CdkDropListGroup],
  template: `
    @if (activeBoard(); as board) {
      <div class="board-wrapper">
        <!-- Board Sub-header (Search, Filters, Rename) -->
        <div class="board-subheader">
          <div class="board-title-section">
            @if (isEditingName()) {
              <input
                #boardNameInput
                type="text"
                [value]="board.name"
                class="board-name-input"
                (keydown.enter)="saveBoardName(boardNameInput.value)"
                (blur)="saveBoardName(boardNameInput.value)"
              />
            } @else {
              <h2 class="board-name" (dblclick)="startEditingName()" title="Double click to rename board">
                {{ board.name }}
              </h2>
            }
          </div>

          <div class="board-controls">
            <!-- Search Control -->
            <div class="search-box">
              <span class="material-symbols-outlined search-icon">search</span>
              <input
                type="text"
                placeholder="Search tasks..."
                [value]="searchQuery()"
                (input)="onSearchInput($event)"
              />
              @if (searchQuery()) {
                <button class="clear-search-btn" (click)="clearSearch()">
                  <span class="material-symbols-outlined">close</span>
                </button>
              }
            </div>

            <!-- Priority Filter -->
            <div class="filter-box">
              <span class="material-symbols-outlined filter-icon">filter_list</span>
              <select (change)="onPriorityFilterChange($event)">
                <option value="all">All Priorities</option>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <!-- Add Task Button -->
            <button class="btn btn-primary" (click)="openAddTaskModal()" [disabled]="board.columns.length === 0">
              <span class="material-symbols-outlined">add</span> Add Task
            </button>
          </div>
        </div>

        <!-- Columns View Area -->
        <div cdkDropListGroup class="columns-viewport">
          @for (col of filteredColumns(); track col.id) {
            <app-column
              [column]="col"
              [boardId]="board.id"
              (addTask)="openAddTaskModal($event)"
              (editTask)="openEditTaskModal($event.task, $event.columnId)"
            ></app-column>
          }

          <!-- New Column Creation Panel -->
          <div class="add-column-panel">
            @if (isAddingColumn()) {
              <div class="add-column-form">
                <input
                  #colNameInput
                  type="text"
                  placeholder="Column Name..."
                  class="form-control"
                  (keydown.enter)="createColumn(colNameInput.value)"
                />
                
                <div class="color-palette">
                  @for (color of colorPalette; track color) {
                    <button
                      type="button"
                      class="color-dot"
                      [style.background-color]="color"
                      [class.selected]="selectedColor() === color"
                      (click)="selectedColor.set(color)"
                      title="Select column color theme"
                    ></button>
                  }
                </div>

                <div class="form-actions-row">
                  <button class="btn btn-secondary btn-small" (click)="isAddingColumn.set(false)">
                    Cancel
                  </button>
                  <button class="btn btn-primary btn-small" (click)="createColumn(colNameInput.value)">
                    Add
                  </button>
                </div>
              </div>
            } @else {
              <button class="add-column-btn" (click)="startAddingColumn()">
                <span class="material-symbols-outlined">add</span> Add Column
              </button>
            }
          </div>
        </div>

        <!-- Reusable Modal overlay for Add/Edit Task -->
        <app-task-modal
          [isOpen]="isModalOpen()"
          [task]="editingTask()"
          (close)="closeModal()"
          (save)="saveTask($event)"
        ></app-task-modal>
      </div>
    } @else {
      <div class="no-board-container">
        <span class="material-symbols-outlined empty-icon">dashboard</span>
        <h3>No Board Selected</h3>
        <p>Choose an existing board from the sidebar or click below to create a new board workspace.</p>
        <button class="btn btn-primary" (click)="createNewBoard()">
          Create Workspace Board
        </button>
      </div>
    }
  `
})
export class BoardComponent {
  readonly stateService = inject(KanbanStateService);

  @ViewChild('boardNameInput') boardNameInput?: ElementRef<HTMLInputElement>;

  // Modal State Signals
  readonly isModalOpen = signal(false);
  readonly editingTask = signal<Task | undefined>(undefined);
  readonly targetColumnId = signal<string>('');

  // Column Creator Signals
  readonly isAddingColumn = signal(false);
  readonly selectedColor = signal('#6366f1');

  // Search & Filtering Signals
  readonly searchQuery = signal('');
  readonly priorityFilter = signal<string>('all');

  // Board Name Editing Signal
  readonly isEditingName = signal(false);

  readonly colorPalette = [
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#0ea5e9', // Sky Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#a855f7', // Purple
    '#ec4899', // Pink
  ];

  // Computations
  readonly activeBoard = this.stateService.activeBoard;

  readonly filteredColumns = computed(() => {
    const board = this.activeBoard();
    if (!board) return [];

    const query = this.searchQuery().toLowerCase().trim();
    const priority = this.priorityFilter();

    return board.columns.map((col) => {
      const filteredTasks = col.tasks.filter((task) => {
        const matchesQuery =
          !query ||
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query);
        const matchesPriority = priority === 'all' || task.priority === priority;
        return matchesQuery && matchesPriority;
      });

      return {
        ...col,
        tasks: filteredTasks,
      };
    });
  });

  // --- Board Name Editing ---
  startEditingName(): void {
    this.isEditingName.set(true);
    setTimeout(() => {
      this.boardNameInput?.nativeElement.focus();
      this.boardNameInput?.nativeElement.select();
    }, 0);
  }

  saveBoardName(newName: string): void {
    const board = this.activeBoard();
    const trimmed = newName.trim();
    if (board && trimmed && trimmed !== board.name) {
      this.stateService.renameBoard(board.id, trimmed);
    }
    this.isEditingName.set(false);
  }

  createNewBoard(): void {
    const name = prompt('Enter board name:');
    if (name && name.trim()) {
      this.stateService.addBoard(name.trim());
    }
  }

  // --- Task Modals ---
  openAddTaskModal(columnId?: string): void {
    const board = this.activeBoard();
    if (!board) return;

    // If no columnId is provided, default to the first column
    this.targetColumnId.set(columnId || board.columns[0]?.id || '');
    this.editingTask.set(undefined);
    this.isModalOpen.set(true);
  }

  openEditTaskModal(task: Task, columnId: string): void {
    this.targetColumnId.set(columnId);
    this.editingTask.set(task);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingTask.set(undefined);
  }

  saveTask(taskData: Omit<Task, 'id' | 'createdAt'>): void {
    const board = this.activeBoard();
    if (!board) return;

    const editing = this.editingTask();
    if (editing) {
      // Update existing task
      this.stateService.updateTask(board.id, this.targetColumnId(), editing.id, taskData);
    } else {
      // Add new task
      this.stateService.addTask(board.id, this.targetColumnId(), taskData);
    }
  }

  // --- Column Creation ---
  startAddingColumn(): void {
    this.isAddingColumn.set(true);
    this.selectedColor.set(this.colorPalette[Math.floor(Math.random() * this.colorPalette.length)]);
  }

  createColumn(name: string): void {
    const board = this.activeBoard();
    const trimmed = name.trim();
    if (board && trimmed) {
      this.stateService.addColumn(board.id, trimmed, this.selectedColor());
    }
    this.isAddingColumn.set(false);
  }


  // --- Search and Filters ---
  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  onPriorityFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.priorityFilter.set(value);
  }
}
