import { Component } from '@angular/core';
import { SidebarComponent } from './components/sidebar/sidebar';
import { BoardComponent } from './components/board/board';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SidebarComponent, BoardComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
