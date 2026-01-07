import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent implements OnInit {
  leaderboard: LeaderboardEntry[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadLeaderboard();
    setInterval(() => {
      this.loadLeaderboard();
    }, 2000);
  }

  loadLeaderboard() {
    fetch('http://localhost:3000/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        this.leaderboard = data.leaderboard;
        this.loading = false;
      })
      .catch(err => {
        this.error = 'Failed to load leaderboard';
        this.loading = false;
      });
  }

  startNewQuiz() {
    localStorage.removeItem('username');
    this.router.navigate(['/']);
  }
}
