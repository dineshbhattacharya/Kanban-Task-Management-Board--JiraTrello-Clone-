import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { Task, SubTask } from '../../models/kanban.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [],
  template: `
    @if (taskSignal(); as t) {
      <div class="task-card" [class]="t.priority">
        <!-- Task Header with Priority and Actions -->
        <div class="task-card-header">
          <span class="priority-badge" [class]="t.priority">
            {{ t.priority }}
          </span>
          <div class="task-actions">
            <button class="icon-btn-small" (click)="onEdit($event)" title="Edit Task">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button class="icon-btn-small delete" (click)="onDelete($event)" title="Delete Task">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>

        <!-- Task Content -->
        <div class="task-card-body">
          <h4 class="task-title">{{ t.title }}</h4>
          @if (t.description) {
            <p class="task-desc">{{ t.description }}</p>
          }
        </div>

        <!-- Task Footer (Due Date, Subtasks) -->
        <div class="task-card-footer">
          @if (t.dueDate) {
            <div class="due-date" [class.overdue]="isOverdue()" title="Due date">
              <span class="material-symbols-outlined">calendar_today</span>
              <span>{{ formattedDueDate() }}</span>
            </div>
          } @else {
            <div></div>
          }

          @if (totalCount() > 0) {
            <div class="subtask-badge" (click)="toggleExpand($event)" [class.expanded]="isExpanded()" title="Toggle subtasks">
              <span class="material-symbols-outlined">checklist</span>
              <span>{{ completedCount() }}/{{ totalCount() }}</span>
            </div>
          }
        </div>

        <!-- Expanded Subtask Checklist -->
        @if (isExpanded() && totalCount() > 0) {
          <div class="task-subtasks-expanded" (click)="$event.stopPropagation()">
            <div class="progress-bar-container">
              <div class="progress-bar" [style.width.%]="progressPercentage()"></div>
              <span class="progress-text">{{ progressPercentage() }}%</span>
            </div>
            <div class="subtask-checklist">
              @for (subtask of t.subtasks; track subtask.id) {
                <label class="subtask-check-item">
                  <input
                    type="checkbox"
                    [checked]="subtask.completed"
                    (change)="onSubtaskToggle(subtask.id, $event)"
                  />
                  <span [class.completed]="subtask.completed">{{ subtask.title }}</span>
                </label>
              }
            </div>
          </div>
        }
      </div>
    }
  `
})
export class TaskCard {
  @Input() set task(value: Task) {
    this.taskSignal.set(value);
  }
  @Input() columnId!: string;

  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() toggleSubtask = new EventEmitter<string>(); // emits subtask ID

  readonly taskSignal = signal<Task | null>(null);
  readonly isExpanded = signal(false);

  // Computations
  readonly completedCount = computed(() => {
    const t = this.taskSignal();
    return t ? t.subtasks.filter((s) => s.completed).length : 0;
  });

  readonly totalCount = computed(() => {
    const t = this.taskSignal();
    return t ? t.subtasks.length : 0;
  });

  readonly progressPercentage = computed(() => {
    const total = this.totalCount();
    return total === 0 ? 0 : Math.round((this.completedCount() / total) * 100);
  });

  readonly isOverdue = computed(() => {
    const t = this.taskSignal();
    if (!t || !t.dueDate) return false;
    // If all subtasks are completed, consider it done/not overdue
    if (t.subtasks.length > 0 && t.subtasks.every((s) => s.completed)) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(t.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  });

  readonly formattedDueDate = computed(() => {
    const t = this.taskSignal();
    if (!t || !t.dueDate) return '';
    const date = new Date(t.dueDate);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  });

  toggleExpand(event: MouseEvent): void {
    event.stopPropagation();
    this.isExpanded.update((val) => !val);
  }

  onEdit(event: MouseEvent): void {
    event.stopPropagation();
    this.edit.emit();
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    this.delete.emit();
  }

  onSubtaskToggle(subtaskId: string, event: Event): void {
    event.stopPropagation();
    this.toggleSubtask.emit(subtaskId);
  }
}
