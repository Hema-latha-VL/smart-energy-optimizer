# Smart Energy Consumption Optimizer

A comprehensive full-stack web application that helps users optimize their renewable energy consumption by predicting energy generation and suggesting optimal appliance usage times. Built with modern technologies and AI-powered predictions.

## 🌟 Features

### Core Functionality
- **User Authentication**: Secure JWT-based registration and login system
- **Energy Setup**: Configure renewable resources (solar/wind) and devices for individual or community users
- **Real-time Dashboard**: View energy generation, consumption, and AI-powered predictions
- **Smart Predictions**: ML-powered recommendations for optimal device usage windows
- **Usage Tracking**: Manual input and comprehensive tracking of energy consumption
- **Detailed Reports**: Export usage reports in CSV format with analytics
- **Profile Management**: Edit user settings, devices, and system configurations

### Advanced Features
- **Weather Integration**: Real-time weather data for accurate energy predictions
- **Responsive Design**: Professional, mobile-friendly interface
- **Data Visualization**: Interactive charts and graphs for energy trends
- **Export Functionality**: CSV export for usage data and reports
- **Multi-user Support**: Individual and community user types

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite + React Router + Recharts
- **Backend**: Node.js + Express + JWT Authentication
- **Database**: MongoDB with Mongoose ODM
- **ML Service**: Python + FastAPI + OpenWeather API
- **Styling**: Modern CSS3 with responsive design
- **Charts**: Recharts for data visualization

## 📁 Project Structure

```
smart-energy-optimizer/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── services/        # API services
│   │   └── styles/          # CSS styles
│   └── package.json
├── backend/                  # Node.js + Express backend
│   ├── models/              # MongoDB models
│   ├── routes/              # API routes
│   ├── middleware/          # Custom middleware
│   └── package.json
├── ml-service/              # Python ML microservice
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
├── setup.js                 # Automated setup script
└── README.md
```

## 🚀 Quick Start

### Automated Setup (Recommended)

1. **Run the setup script**:
   ```bash
   node setup.js
   ```

2. **Configure environment variables**:
   - Get an OpenWeather API key from [OpenWeatherMap](https://openweathermap.org/api)
   - Update `ml-service/.env` with your API key
   - Update `backend/.env` with a secure JWT secret

3. **Start MongoDB** (if not already running)

4. **Start all services**:
   ```bash
   # Terminal 1: Backend
   npm run dev:backend
   
   # Terminal 2: Frontend  
   npm run dev:frontend
   
   # Terminal 3: ML Service
   npm run dev:ml
   ```

5. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - ML Service: http://localhost:8001

### Manual Setup

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Set up environment files** (copy from .env.example files)

3. **Start services individually** as shown above

## ⚙️ Environment Configuration

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/energy_optimizer
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3000
ML_SERVICE_URL=http://localhost:8001
NODE_ENV=development
```

### ML Service (.env)
```env
OPENWEATHER_API_KEY=your_openweather_api_key_here
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Setup Endpoints
- `POST /api/setup` - Save user setup data
- `GET /api/setup` - Get user setup data
- `PUT /api/setup` - Update user setup data

### Dashboard Endpoints
- `GET /api/dashboard/summary` - Get energy summary
- `GET /api/dashboard/predictions` - Get energy predictions
- `GET /api/dashboard/recent-usage` - Get recent usage data

### Usage Endpoints
- `POST /api/usage` - Log device usage
- `GET /api/usage` - Get usage history
- `GET /api/usage/today` - Get today's usage summary
- `DELETE /api/usage/:id` - Delete usage record

### Reports Endpoints
- `GET /api/reports/summary` - Get usage summary
- `GET /api/reports/monthly` - Export monthly report
- `GET /api/reports/export` - Export custom date range

## 🎯 Usage Guide

### Getting Started
1. **Register** a new account (Individual or Community)
2. **Complete Setup** by configuring your renewable energy system
3. **Add Devices** that you want to track and optimize
4. **View Dashboard** for real-time energy insights
5. **Log Usage** when you use your devices
6. **Check Reports** for detailed analytics

### Key Features
- **Energy Cards**: View daily generation, consumption, and surplus/deficit
- **Predictions**: See hourly energy generation forecasts
- **Recommendations**: Get optimal time windows for device usage
- **Usage Tracking**: Log device usage with timestamps and duration
- **Reports**: Export detailed usage data and analytics

## 🔧 Development

### Prerequisites
- Node.js 16+ 
- Python 3.8+
- MongoDB 4.4+
- OpenWeather API key

### Available Scripts
```bash
# Development
npm run dev              # Start all services
npm run dev:backend      # Start backend only
npm run dev:frontend     # Start frontend only
npm run dev:ml          # Start ML service only

# Installation
npm run install:all     # Install all dependencies
```

### Database Models
- **User**: User accounts with setup data
- **Usage**: Device usage records
- **Prediction**: Energy generation predictions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



