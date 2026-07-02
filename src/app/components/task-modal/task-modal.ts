import { Component, Input, Output, EventEmitter, inject, effect, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Task, SubTask } from '../../models/kanban.model';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    @if (isOpen) {
      <div class="modal-overlay" (click)="onClose()">
        <div class="modal-container" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ task ? 'Edit Task' : 'Create New Task' }}</h3>
            <button class="close-btn" (click)="onClose()">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label for="title">Title *</label>
              <input
                id="title"
                type="text"
                formControlName="title"
                placeholder="e.g. Design Landing Page"
                class="form-control"
              />
              @if (taskForm.get('title')?.touched && taskForm.get('title')?.invalid) {
                <span class="error-msg">Title is required.</span>
              }
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                formControlName="description"
                placeholder="e.g. Gather feedback from stakeholders and create wireframes."
                class="form-control"
                rows="3"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group half-width">
                <label>Priority</label>
                <div class="priority-selector">
                  <label class="priority-option low" [class.selected]="taskForm.get('priority')?.value === 'low'">
                    <input type="radio" formControlName="priority" value="low" />
                    <span>Low</span>
                  </label>
                  <label class="priority-option medium" [class.selected]="taskForm.get('priority')?.value === 'medium'">
                    <input type="radio" formControlName="priority" value="medium" />
                    <span>Medium</span>
                  </label>
                  <label class="priority-option high" [class.selected]="taskForm.get('priority')?.value === 'high'">
                    <input type="radio" formControlName="priority" value="high" />
                    <span>High</span>
                  </label>
                </div>
              </div>

              <div class="form-group half-width">
                <label for="dueDate">Due Date</label>
                <input
                  id="dueDate"
                  type="date"
                  formControlName="dueDate"
                  class="form-control"
                />
              </div>
            </div>

            <div class="form-group">
              <label>Subtasks</label>
              <div formArrayName="subtasks" class="subtasks-list">
                @for (subtask of subtasksFormArray.controls; track subtask; let i = $index) {
                  <div [formGroupName]="i" class="subtask-row">
                    <input
                      type="checkbox"
                      formControlName="completed"
                      class="subtask-checkbox"
                    />
                    <input
                      type="text"
                      formControlName="title"
                      placeholder="Subtask title"
                      class="form-control subtask-input"
                    />
                    <button type="button" class="delete-subtask-btn" (click)="removeSubtask(i)">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                }
              </div>
              <button type="button" class="btn btn-secondary add-subtask-btn" (click)="addSubtask()">
                <span class="material-symbols-outlined">add</span> Add Subtask
              </button>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-tertiary" (click)="onClose()">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="taskForm.invalid">
                {{ task ? 'Save Changes' : 'Create Task' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class TaskModal implements OnChanges {
  @Input() isOpen = false;
  @Input() task?: Task; // If provided, we are editing this task

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Omit<Task, 'id' | 'createdAt'>>();

  private readonly fb = inject(FormBuilder);

  readonly taskForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    description: [''],
    priority: ['medium', Validators.required],
    dueDate: [''],
    subtasks: this.fb.array([]),
  });

  get subtasksFormArray(): FormArray {
    return this.taskForm.get('subtasks') as FormArray;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      this.initForm();
    }
  }

  private initForm(): void {
    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        priority: this.task.priority,
        dueDate: this.task.dueDate || '',
      });

      // Clear existing subtasks
      while (this.subtasksFormArray.length) {
        this.subtasksFormArray.removeAt(0);
      }

      // Populate subtasks
      this.task.subtasks.forEach((subtask) => {
        this.subtasksFormArray.push(
          this.fb.group({
            id: [subtask.id],
            title: [subtask.title, Validators.required],
            completed: [subtask.completed],
          })
        );
      });
    } else {
      this.taskForm.reset({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
      });
      while (this.subtasksFormArray.length) {
        this.subtasksFormArray.removeAt(0);
      }
    }
  }

  addSubtask(): void {
    this.subtasksFormArray.push(
      this.fb.group({
        id: [this.generateId()],
        title: ['', Validators.required],
        completed: [false],
      })
    );
  }

  removeSubtask(index: number): void {
    this.subtasksFormArray.removeAt(index);
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    if (this.taskForm.invalid) return;

    const formValue = this.taskForm.value;
    const taskData: Omit<Task, 'id' | 'createdAt'> = {
      title: formValue.title.trim(),
      description: formValue.description ? formValue.description.trim() : '',
      priority: formValue.priority,
      dueDate: formValue.dueDate || undefined,
      subtasks: formValue.subtasks || [],
    };

    this.save.emit(taskData);
    this.onClose();
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }
}
