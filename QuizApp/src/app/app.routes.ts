import { Routes } from '@angular/router';
import { StartComponent } from './start.component';
import { QuizComponent } from './quiz.component';
import { LeaderboardComponent } from './leaderboard.component';

export const routes: Routes = [
  { path: '', component: StartComponent },
  { path: 'quiz', component: QuizComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: '**', redirectTo: '' }
];
