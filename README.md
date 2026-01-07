# Online Quiz Application with Redis

A functional Online Quiz Web Application that demonstrates proper Redis usage with real-time scoring and leaderboard features.

## Architecture Overview

### Backend (Node.js + Express)
- **Port**: 3000
- **Database**: Redis (localhost:6379)
- **Framework**: Express.js

### Frontend (Angular)
- **Port**: 4200
- **Framework**: Angular 19+

## Redis Data Structures Used

### 1. Hash: `user:{username}`
Stores user data including:
- `name` - Username
- `score` - Current score
- `q1`, `q2`, `q3` - User's answers to questions

**Example Redis Data:**
```
user:alice
├── name: "alice"
├── score: 2
├── q1: "B"
├── q2: "C"
└── q3: "A"
```

### 2. Sorted Set: `leaderboard`
Stores user rankings by score:
- **Member**: username
- **Score**: quiz score (automatically sorted in descending order)

**Example Redis Data:**
```
leaderboard
├── alice: 3 (score)
├── bob: 2 (score)
└── charlie: 1 (score)
```

## API Endpoints

### POST /api/start
Register a user and initialize the quiz.
```json
Request:
{
  "username": "alice"
}

Response:
{
  "message": "User alice registered successfully",
  "username": "alice"
}
```

### POST /api/answer
Submit an answer to a question.
```json
Request:
{
  "username": "alice",
  "questionId": "q1",
  "answer": "B"
}

Response (Correct):
{
  "correct": true,
  "message": "Correct answer!",
  "score": 1,
  "leaderboardScore": 1
}

Response (Incorrect):
{
  "correct": false,
  "message": "Wrong answer. Correct answer was: A",
  "score": 1,
  "leaderboardScore": 1
}
```

### GET /api/leaderboard
Retrieve the top 10 users ranked by score.
```json
Response:
{
  "leaderboard": [
    {
      "rank": 1,
      "username": "alice",
      "score": 3
    },
    {
      "rank": 2,
      "username": "bob",
      "score": 2
    }
  ]
}
```

### GET /api/questions
Get all quiz questions (for frontend).
```json
Response:
{
  "questions": {
    "q1": {
      "text": "What is the capital of France?",
      "options": {
        "A": "London",
        "B": "Paris",
        "C": "Berlin"
      },
      "correct": "B"
    },
    ...
  }
}
```

## Quiz Questions

1. **Q1**: What is the capital of France?
   - A: London
   - B: **Paris** ✓
   - C: Berlin

2. **Q2**: What is 2 + 2?
   - A: 3
   - B: 5
   - C: **4** ✓

3. **Q3**: Which planet is closest to the Sun?
   - A: **Mercury** ✓
   - B: Venus
   - C: Earth

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- Redis running on localhost:6379 (Docker container)

### Backend Setup
```bash
cd backend
npm install
npm start
```

Backend will connect to Redis and start on `http://localhost:3000`

### Frontend Setup
```bash
cd QuizApp
npm install
npm start
```

Frontend will be available at `http://localhost:4200`

## Demo Walkthrough

### Step 1: Start Both Servers
1. Open Terminal 1 and run the backend:
   ```bash
   cd backend && npm start
   ```
   Confirm "Connected to Redis" message

2. Open Terminal 2 and run the frontend:
   ```bash
   cd QuizApp && npm start
   ```
   Wait for Angular compilation to complete

### Step 2: Access the Application
1. Open browser and go to `http://localhost:4200`
2. You should see the Quiz Application start page

### Step 3: Demo with User 1 (Alice)
1. Enter username: **alice**
2. Click "Start Quiz"
3. Answer all 3 questions:
   - Q1: Select "Paris" (B) ✓
   - Q2: Select "4" (C) ✓
   - Q3: Select "Mercury" (A) ✓
   - Expected Score: 3/3
4. View Leaderboard

### Step 4: Demo with User 2 (Bob)
1. Start New Quiz
2. Enter username: **bob**
3. Click "Start Quiz"
4. Answer with mix of correct/incorrect:
   - Q1: Select "London" (A) ✗
   - Q2: Select "4" (C) ✓
   - Q3: Select "Venus" (B) ✗
   - Expected Score: 1/3
5. View Leaderboard - Should show alice ranked #1 with score 3

### Step 5: Verify Redis Data

Open Redis CLI to inspect the data:

```bash
# Connect to Redis
redis-cli

# View Alice's Hash
HGETALL user:alice

# View Bob's Hash
HGETALL user:bob

# View Leaderboard (Sorted Set)
ZREVRANGE leaderboard 0 -1 WITHSCORES

# View specific user score
ZSCORE leaderboard alice
```

## Expected Redis Output

```
127.0.0.1:6379> HGETALL user:alice
 1) "name"
 2) "alice"
 3) "score"
 4) "3"
 5) "q1"
 6) "B"
 7) "q2"
 8) "C"
 9) "q3"
10) "A"

127.0.0.1:6379> ZREVRANGE leaderboard 0 -1 WITHSCORES
1) "alice"
2) "3"
3) "bob"
4) "1"
```

## Project Structure

```
redis project/
├── backend/
│   ├── server.js (Express + Redis integration)
│   ├── package.json
│   └── node_modules/
│
├── QuizApp/
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.ts
│   │   │   ├── app.html
│   │   │   ├── app.routes.ts
│   │   │   ├── start.component.ts
│   │   │   ├── start.component.html
│   │   │   ├── quiz.component.ts
│   │   │   ├── quiz.component.html
│   │   │   ├── leaderboard.component.ts
│   │   │   └── leaderboard.component.html
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   ├── package.json
│   └── angular.json
```

## Key Features

✅ **Real-time Scoring**: Scores update instantly using Redis HINCRBY and ZINCRBY

✅ **Live Leaderboard**: Uses Redis Sorted Set for efficient ranking

✅ **User Persistence**: All user data stored in Redis Hashes

✅ **Simple UI**: Minimal, functional interface focusing on Redis demonstration

✅ **CORS Enabled**: Backend accepts requests from frontend

✅ **Error Handling**: Graceful error messages and connection handling

## Redis Justification

### Why Hash for User Data?
- Efficiently stores multiple user attributes
- Fast field-level access with HGET/HSET
- Perfect for storing user profile + answers

### Why Sorted Set for Leaderboard?
- Automatically maintains sorted ranking by score
- O(log N) insertion and score updates
- ZREVRANGE provides instant top N retrieval
- Real-time ranking without application-side sorting

## Troubleshooting

### Redis Connection Error
- Ensure Redis is running: `docker ps | grep redis`
- Check if Redis is on port 6379: `redis-cli ping`

### CORS Errors
- Backend is configured with CORS headers
- Frontend is on port 4200, backend on port 3000

### Angular Compilation Issues
- Clear node_modules: `rm -rf QuizApp/node_modules && npm install`
- Restart Angular dev server

## Technologies Used

- **Backend**: Node.js, Express.js, Redis
- **Frontend**: Angular 19+, TypeScript
- **Data Store**: Redis (Docker)
- **HTTP**: REST API with CORS

---

**This is an academic demonstration of Redis data structures for real-time quiz scoring and leaderboard functionality.**
