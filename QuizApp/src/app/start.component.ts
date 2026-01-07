import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './start.component.html',
  styleUrl: './start.component.css'
})
export class StartComponent {
  username: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(private router: Router) {}

  startQuiz() {
    if (!this.username.trim()) {
      this.error = 'Please enter a username';
      return;
    }

    this.loading = true;
    this.error = '';

    fetch('http://localhost:3000/api/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: this.username })
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to start quiz');
        return response.json();
      })
      .then(data => {
        localStorage.setItem('username', this.username);
        this.router.navigate(['/quiz']);
      })
      .catch(err => {
        this.error = err.message;
        this.loading = false;
      });
  }
}
