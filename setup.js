#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Smart Energy Consumption Optimizer...\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js version: ${nodeVersion}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js first.');
  process.exit(1);
}

// Check if Python is installed
try {
  const pythonVersion = execSync('python --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Python version: ${pythonVersion}`);
} catch (error) {
  console.error('❌ Python is not installed. Please install Python first.');
  process.exit(1);
}

// Install root dependencies
console.log('\n📦 Installing root dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed');
} catch (error) {
  console.error('❌ Failed to install root dependencies');
  process.exit(1);
}

// Install backend dependencies
console.log('\n📦 Installing backend dependencies...');
try {
  execSync('cd backend && npm install', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Install frontend dependencies
console.log('\n📦 Installing frontend dependencies...');
try {
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

// Install ML service dependencies
console.log('\n📦 Installing ML service dependencies...');
try {
  execSync('cd ml-service && pip install -r requirements.txt', { stdio: 'inherit' });
  console.log('✅ ML service dependencies installed');
} catch (error) {
  console.error('❌ Failed to install ML service dependencies');
  process.exit(1);
}

// Create environment files
console.log('\n⚙️  Setting up environment files...');

// Backend .env
const backendEnvPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(backendEnvPath)) {
  const backendEnvContent = `MONGODB_URI=mongodb://localhost:27017/energy_optimizer
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
PORT=3000
ML_SERVICE_URL=http://localhost:8001
NODE_ENV=development
`;
  fs.writeFileSync(backendEnvPath, backendEnvContent);
  console.log('✅ Backend .env file created');
} else {
  console.log('ℹ️  Backend .env file already exists');
}

// ML service .env
const mlEnvPath = path.join(__dirname, 'ml-service', '.env');
if (!fs.existsSync(mlEnvPath)) {
  const mlEnvContent = `OPENWEATHER_API_KEY=your_openweather_api_key_here
`;
  fs.writeFileSync(mlEnvPath, mlEnvContent);
  console.log('✅ ML service .env file created');
} else {
  console.log('ℹ️  ML service .env file already exists');
}

// Frontend .env
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
if (!fs.existsSync(frontendEnvPath)) {
  const frontendEnvContent = `VITE_API_URL=http://localhost:3000/api
`;
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log('✅ Frontend .env file created');
} else {
  console.log('ℹ️  Frontend .env file already exists');
}

// Create temp directory for backend
const tempDir = path.join(__dirname, 'backend', 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log('✅ Backend temp directory created');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Start MongoDB (if not already running)');
console.log('2. Get an OpenWeather API key from https://openweathermap.org/api');
console.log('3. Update the API key in ml-service/.env');
console.log('4. Update JWT_SECRET in backend/.env for production');
console.log('5. Run the application:');
console.log('   - Backend: npm run dev:backend');
console.log('   - Frontend: npm run dev:frontend');
console.log('   - ML Service: npm run dev:ml');
console.log('\n🌐 Access the application at http://localhost:5173');
console.log('\n📚 For more information, see README.md');
