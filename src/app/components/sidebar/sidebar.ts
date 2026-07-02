import { Component, inject, signal, ElementRef, ViewChild } from '@angular/core';
import { KanbanStateService } from '../../services/kanban-state.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  template: `
    <div class="sidebar-container" [class.collapsed]="isCollapsed()">
      <!-- Toggle Button (Absolute positioned on sidebar edge) -->
      <button class="sidebar-toggle-btn" (click)="toggleSidebar()" [title]="isCollapsed() ? 'Expand Sidebar' : 'Collapse Sidebar'">
        <span class="material-symbols-outlined">
          {{ isCollapsed() ? 'chevron_right' : 'chevron_left' }}
        </span>
      </button>

      <!-- Sidebar Content (Hidden on collapse) -->
      <div class="sidebar-content">
        <!-- Logo Header -->
        <div class="sidebar-logo">
          <span class="material-symbols-outlined logo-icon">dashboard_customize</span>
          <h2>KanbanFlow</h2>
        </div>

        <!-- Section Title -->
        <div class="sidebar-section-title">
          <span>ALL BOARDS ({{ boards().length }})</span>
        </div>

        <!-- Boards List -->
        <div class="boards-list">
          @for (b of boards(); track b.id) {
            <div
              class="board-list-item"
              [class.active]="b.id === activeBoardId()"
              (click)="selectBoard(b.id)"
            >
              <span class="material-symbols-outlined board-icon">space_dashboard</span>
              <span class="board-name-text">{{ b.name }}</span>
              
              @if (boards().length > 1) {
                <button
                  class="board-delete-btn"
                  (click)="deleteBoard(b.id, b.name, $event)"
                  title="Delete board workspace"
                >
                  <span class="material-symbols-outlined">close</span>
                </button>
              }
            </div>
          }
        </div>

        <!-- Sidebar Footer Action (New Board) -->
        <div class="sidebar-footer">
          @if (isAddingBoard()) {
            <div class="add-board-inline-form">
              <input
                #boardNameInput
                type="text"
                placeholder="Workspace name..."
                class="form-control"
                (keydown.enter)="createBoard(boardNameInput.value)"
                (blur)="cancelAddingBoard()"
              />
              <div class="form-actions-row mt-2">
                <button class="btn btn-secondary btn-small" (click)="isAddingBoard.set(false)">
                  Cancel
                </button>
                <button class="btn btn-primary btn-small" (click)="createBoard(boardNameInput.value)">
                  Create
                </button>
              </div>
            </div>
          } @else {
            <button class="add-board-btn" (click)="startAddingBoard()">
              <span class="material-symbols-outlined">add</span> Create New Board
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class SidebarComponent {
  readonly stateService = inject(KanbanStateService);

  @ViewChild('boardNameInput') boardNameInput?: ElementRef<HTMLInputElement>;

  // Sidebar Layout Signals
  readonly isCollapsed = signal(false);
  readonly isAddingBoard = signal(false);

  // Bind values from state service
  readonly boards = this.stateService.boards;
  readonly activeBoardId = this.stateService.activeBoardId;

  toggleSidebar(): void {
    this.isCollapsed.update((val) => !val);
  }

  selectBoard(id: string): void {
    this.stateService.setActiveBoard(id);
  }

  startAddingBoard(): void {
    this.isAddingBoard.set(true);
    setTimeout(() => {
      this.boardNameInput?.nativeElement.focus();
    }, 0);
  }

  createBoard(name: string): void {
    const trimmed = name.trim();
    if (trimmed) {
      this.stateService.addBoard(trimmed);
    }
    this.isAddingBoard.set(false);
  }

  cancelAddingBoard(): void {
    // Timeout to allow the "Create" button click to register before input is destroyed by blur
    setTimeout(() => {
      if (this.isAddingBoard() && !this.boardNameInput?.nativeElement.value.trim()) {
        this.isAddingBoard.set(false);
      }
    }, 150);
  }

  deleteBoard(id: string, name: string, event: MouseEvent): void {
    event.stopPropagation(); // Avoid switching to the board right before deleting it
    if (confirm(`Are you sure you want to delete board "${name}"? This will delete all columns and tasks inside.`)) {
      this.stateService.deleteBoard(id);
    }
  }
}
