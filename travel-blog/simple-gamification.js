// Simple working gamification server
const express = require('express');
const app = express();
const port = 5003;

app.use(express.json());

// Mock data
let users = {
  'test-user': {
    id: 'test-user',
    points: 0,
    level: 1,
    activities: { blogs: 0, photos: 0, follows: 0 },
    achievements: []
  }
};

let achievements = [
  { id: 'first-blog', title: 'First Blog', points: 100, requirement: { type: 'blogs', value: 1 } },
  { id: 'social-butterfly', title: 'Social Butterfly', points: 200, requirement: { type: 'follows', value: 5 } }
];

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Real Gamification System Running' });
});

app.get('/user/:id', (req, res) => {
  const user = users[req.params.id] || users['test-user'];
  res.json(user);
});

app.post('/award-points/:id/:points', (req, res) => {
  const userId = req.params.id;
  const points = parseInt(req.params.points);
  
  if (!users[userId]) {
    users[userId] = { id: userId, points: 0, level: 1, activities: { blogs: 0, photos: 0, follows: 0 }, achievements: [] };
  }
  
  users[userId].points += points;
  users[userId].level = Math.floor(users[userId].points / 500) + 1;
  
  console.log(`🎉 Awarded ${points} points to ${userId}. Total: ${users[userId].points}`);
  res.json(users[userId]);
});

app.post('/track-activity/:id/:type', (req, res) => {
  const userId = req.params.id;
  const activityType = req.params.type;
  
  if (!users[userId]) {
    users[userId] = { id: userId, points: 0, level: 1, activities: { blogs: 0, photos: 0, follows: 0 }, achievements: [] };
  }
  
  users[userId].activities[activityType] = (users[userId].activities[activityType] || 0) + 1;
  
  // Check achievements
  achievements.forEach(achievement => {
    if (!users[userId].achievements.includes(achievement.id)) {
      const userActivityValue = users[userId].activities[achievement.requirement.type] || 0;
      if (userActivityValue >= achievement.requirement.value) {
        users[userId].achievements.push(achievement.id);
        users[userId].points += achievement.points;
        users[userId].level = Math.floor(users[userId].points / 500) + 1;
        console.log(`🏆 ${userId} unlocked achievement: ${achievement.title}!`);
      }
    }
  });
  
  console.log(`📈 ${userId} ${activityType}: ${users[userId].activities[activityType]}`);
  res.json(users[userId]);
});

app.get('/leaderboard', (req, res) => {
  const leaderboard = Object.values(users)
    .sort((a, b) => b.points - a.points)
    .slice(0, 10)
    .map((user, index) => ({ rank: index + 1, ...user }));
  
  res.json(leaderboard);
});

app.listen(port, () => {
  console.log(`🚀 Working Gamification Server: http://localhost:${port}`);
  console.log('📋 Test URLs:');
  console.log(`  GET  /health`);
  console.log(`  GET  /user/:id`);
  console.log(`  POST /award-points/:id/:points`);
  console.log(`  POST /track-activity/:id/:type`);
  console.log(`  GET  /leaderboard`);
  
  // Keep server alive
  setInterval(() => {
    // Just a heartbeat to keep server running
  }, 60000);
});