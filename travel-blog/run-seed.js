const { spawn } = require('child_process');
const path = require('path');

console.log('Starting continent seeding...');

const seedProcess = spawn('node', ['backend/seeds/continentsData.js'], {
  cwd: path.join(__dirname),
  stdio: 'inherit'
});

seedProcess.on('close', (code) => {
  console.log(`Seeding process exited with code ${code}`);
});

seedProcess.on('error', (error) => {
  console.error('Error running seed:', error);
});
