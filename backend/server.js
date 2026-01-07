const express = require('express');
const { createClient } = require('redis');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Redis Client Setup
const redisClient = createClient({
  host: 'localhost',
  port: 6379,
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

// Connect to Redis
(async () => {
  await redisClient.connect();
})();

// Hardcoded Quiz Questions with Correct Answers
const questions = {
  q1: {
    text: 'What is the capital of France?',
    options: { A: 'London', B: 'Paris', C: 'Berlin' },
    correct: 'B',
  },
  q2: {
    text: 'What is 2 + 2?',
    options: { A: '3', B: '5', C: '4' },
    correct: 'C',
  },
  q3: {
    text: 'Which planet is closest to the Sun?',
    options: { A: 'Mercury', B: 'Venus', C: 'Earth' },
    correct: 'A',
  },
};

// ============= API ENDPOINTS =============

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// 1. POST /api/start - Register user and initialize
app.post('/api/start', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.trim() === '') {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Create User Hash with initial score of 0
    // Key: user:{username}
    // Fields: name, score, q1, q2, q3 (answers)
    await redisClient.hSet(`user:${username}`, 'name', username);
    await redisClient.hSet(`user:${username}`, 'score', 0);

    // Add user to Leaderboard Sorted Set with score 0
    // Key: leaderboard
    // Member: username
    // Score: 0
    await redisClient.zAdd('leaderboard', { score: 0, value: username });

    res.status(201).json({
      message: `User ${username} registered successfully`,
      username: username,
    });
  } catch (error) {
    console.error('Error in /api/start:', error);
    res.status(500).json({ error: 'Failed to start quiz' });
  }
});

// 2. POST /api/answer - Submit answer and update score
app.post('/api/answer', async (req, res) => {
  try {
    const { username, questionId, answer } = req.body;

    if (!username || !questionId || !answer) {
      return res.status(400).json({ error: 'Username, questionId, and answer are required' });
    }

    if (!questions[questionId]) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const correctAnswer = questions[questionId].correct;
    const isCorrect = answer === correctAnswer;

    // Store the user's answer in their hash
    await redisClient.hSet(`user:${username}`, questionId, answer);

    if (isCorrect) {
      // Increment user score using HINCRBY
      const newScore = await redisClient.hIncrBy(`user:${username}`, 'score', 1);

      // Update leaderboard using ZINCRBY
      const leaderboardScore = await redisClient.zIncrBy('leaderboard', 1, username);

      res.json({
        correct: true,
        message: 'Correct answer!',
        score: newScore,
        leaderboardScore: leaderboardScore,
      });
    } else {
      // Get current score without incrementing
      const currentScore = await redisClient.hGet(`user:${username}`, 'score');

      res.json({
        correct: false,
        message: `Wrong answer. Correct answer was: ${correctAnswer}`,
        score: parseInt(currentScore),
        leaderboardScore: await redisClient.zScore('leaderboard', username),
      });
    }
  } catch (error) {
    console.error('Error in /api/answer:', error);
    res.status(500).json({ error: 'Failed to process answer' });
  }
});

// 3. GET /api/leaderboard - Get top users
app.get('/api/leaderboard', async (req, res) => {
  try {
    // ZRANGE with REV: Get members in reverse order (highest score first)
    // leaderboard: key name
    // 0 9: Get top 10 users
    // WITHSCORES: Include scores in response
    const leaderboard = await redisClient.zRangeWithScores('leaderboard', 0, 9, {
      REV: true,
    });

    // Format the response
    const formattedLeaderboard = leaderboard.map((item, index) => ({
      rank: index + 1,
      username: item.value,
      score: item.score,
    }));

    res.json({
      leaderboard: formattedLeaderboard,
    });
  } catch (error) {
    console.error('Error in /api/leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// GET /api/questions - Get all questions (for frontend)
app.get('/api/questions', (req, res) => {
  res.json({
    questions: questions,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Redis is connected and ready to use!`);
});

