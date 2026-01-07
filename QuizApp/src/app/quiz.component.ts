import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

interface Question {
  text: string;
  options: { A: string; B: string; C: string };
  correct: string;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent implements OnInit {
  username: string = '';
  questions: { [key: string]: Question } = {};
  currentQuestionIndex: number = 0;
  currentQuestionId: string = '';
  currentQuestion: Question | null = null;
  score: number = 0;
  answeredQuestions: Set<string> = new Set();
  loading: boolean = false;
  quizCompleted: boolean = false;
  feedback: string = '';
  feedbackType: 'success' | 'error' = 'success';
  optionLabels = ['A', 'B', 'C'];

  constructor(private router: Router) {}

  ngOnInit() {
    this.username = localStorage.getItem('username') || '';
    if (!this.username) {
      this.router.navigate(['/']);
      return;
    }

    fetch('http://localhost:3000/api/questions')
      .then(res => res.json())
      .then(data => {
        this.questions = data.questions;
        this.loadQuestion();
      })
      .catch(err => console.error('Error loading questions:', err));
  }

  loadQuestion() {
    const questionIds = Object.keys(this.questions);
    if (this.currentQuestionIndex < questionIds.length) {
      this.currentQuestionId = questionIds[this.currentQuestionIndex];
      this.currentQuestion = this.questions[this.currentQuestionId];
      this.feedback = '';
    } else {
      this.quizCompleted = true;
    }
  }

  getOptionText(option: string): string {
    if (!this.currentQuestion) return '';
    return this.currentQuestion.options[option as 'A' | 'B' | 'C'] || '';
  }

  submitAnswer(answer: string) {
    if (this.loading) return;

    this.loading = true;
    this.answeredQuestions.add(this.currentQuestionId);

    fetch('http://localhost:3000/api/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: this.username,
        questionId: this.currentQuestionId,
        answer: answer
      })
    })
      .then(res => res.json())
      .then(data => {
        this.score = data.score;
        this.feedbackType = data.correct ? 'success' : 'error';
        this.feedback = data.message;
        this.loading = false;

        setTimeout(() => {
          this.currentQuestionIndex++;
          this.loadQuestion();
        }, 1500);
      })
      .catch(err => {
        console.error('Error:', err);
        this.loading = false;
      });
  }

  viewLeaderboard() {
    this.router.navigate(['/leaderboard']);
  }
}

