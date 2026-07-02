import { Component, Input, Output, EventEmitter, signal, ElementRef, ViewChild } from '@angular/core';
import { Column, Task } from '../../models/kanban.model';
import { KanbanStateService } from '../../services/kanban-state.service';
import { TaskCard } from '../task-card/task-card';
import { CdkDropList, CdkDrag, CdkDragPlaceholder, CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [TaskCard, CdkDropList, CdkDrag, CdkDragPlaceholder],
  template: `
    <div class="column-container" [style.border-top-color]="column.color">
      <!-- Column Header -->
      <div class="column-header">
        <div class="column-title-section">
          @if (isEditingName()) {
            <input
              #nameInput
              type="text"
              [value]="column.name"
              class="column-name-input"
              (keydown.enter)="saveColumnName(nameInput.value)"
              (blur)="saveColumnName(nameInput.value)"
            />
          } @else {
            <h3 class="column-name" (dblclick)="startEditingName()">
              {{ column.name }}
            </h3>
          }
          <span class="task-count-badge" [style.background-color]="column.color + '22'" [style.color]="column.color">
            {{ column.tasks.length }}
          </span>
        </div>

        <div class="column-actions">
          <button class="icon-btn-small" (click)="toggleMenu()" title="Column settings">
            <span class="material-symbols-outlined">more_vert</span>
          </button>
          
          @if (isMenuOpen()) {
            <div class="column-dropdown-menu" (click)="$event.stopPropagation()">
              <button class="dropdown-item" (click)="startEditingName()">
                <span class="material-symbols-outlined">edit</span> Rename Column
              </button>
              <button class="dropdown-item delete" (click)="deleteColumn()">
                <span class="material-symbols-outlined">delete</span> Delete Column
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Task Cards Container -->
      <div
        cdkDropList
        [id]="column.id"
        [cdkDropListData]="column.tasks"
        class="column-task-list"
        [class.empty-list]="column.tasks.length === 0"
        (cdkDropListDropped)="onDrop($event)"
      >
        @for (task of column.tasks; track task.id) {
          <div cdkDrag [cdkDragData]="task" class="cdk-drag-item">
            <!-- CDK Drag Placeholder -->
            <div class="card-drag-placeholder" *cdkDragPlaceholder></div>
            
            <app-task-card
              [task]="task"
              [columnId]="column.id"
              (edit)="onEditTask(task)"
              (delete)="onDeleteTask(task.id)"
              (toggleSubtask)="onToggleSubtask(task.id, $event)"
            ></app-task-card>
          </div>
        } @empty {
          <div class="empty-column-placeholder">
            <span class="material-symbols-outlined">inbox</span>
            <p>No tasks here yet</p>
          </div>
        }
      </div>

      <!-- Add Task Footer Action -->
      <button class="add-task-footer-btn" (click)="onAddTask()">
        <span class="material-symbols-outlined">add</span> Add Card
      </button>
    </div>
  `
})
export class ColumnComponent {
  @Input() column!: Column;
  @Input() boardId!: string;

  @Output() addTask = new EventEmitter<string>(); // Emits column ID
  @Output() editTask = new EventEmitter<{ task: Task; columnId: string }>();

  @ViewChild('nameInput') nameInput?: ElementRef<HTMLInputElement>;

  readonly isEditingName = signal(false);
  readonly isMenuOpen = signal(false);

  constructor(private stateService: KanbanStateService) {
    // Close dropdown menu if user clicks elsewhere
    window.addEventListener('click', () => {
      this.isMenuOpen.set(false);
    });
  }

  toggleMenu(): void {
    // Stop propagation so document click doesn't instantly close it
    event?.stopPropagation();
    this.isMenuOpen.update((val) => !val);
  }

  startEditingName(): void {
    this.isEditingName.set(true);
    this.isMenuOpen.set(false);
    setTimeout(() => {
      this.nameInput?.nativeElement.focus();
      this.nameInput?.nativeElement.select();
    }, 0);
  }

  saveColumnName(newName: string): void {
    const trimmed = newName.trim();
    if (trimmed && trimmed !== this.column.name) {
      this.stateService.renameColumn(this.boardId, this.column.id, trimmed);
    }
    this.isEditingName.set(false);
  }

  deleteColumn(): void {
    if (confirm(`Are you sure you want to delete column "${this.column.name}"? All tasks inside will be permanently deleted.`)) {
      this.stateService.deleteColumn(this.boardId, this.column.id);
    }
    this.isMenuOpen.set(false);
  }

  onAddTask(): void {
    this.addTask.emit(this.column.id);
  }

  onEditTask(task: Task): void {
    this.editTask.emit({ task, columnId: this.column.id });
  }

  onDeleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.stateService.deleteTask(this.boardId, this.column.id, taskId);
    }
  }

  onToggleSubtask(taskId: string, subtaskId: string): void {
    this.stateService.toggleSubtask(this.boardId, this.column.id, taskId, subtaskId);
  }

  onDrop(event: CdkDragDrop<Task[]>): void {
    this.stateService.moveTask(
      this.boardId,
      event.previousContainer.id,
      event.container.id,
      event.previousIndex,
      event.currentIndex
    );
  }
}
