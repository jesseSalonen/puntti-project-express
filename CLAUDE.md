# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- No test framework is currently configured (test script exits with error)

## Architecture Overview

This is a Node.js/Express REST API for a fitness tracking application ("Puntti Project") with MongoDB/Mongoose for data persistence.

### Core Application Structure

- **Entry Point**: `index.js` - Express server setup with middleware chain: CORS → JSON parsing → logging → routes → error handling
- **Routes**: Single API router at `/api` in `routes/api.js` with JWT-protected endpoints
- **Authentication**: JWT Bearer token middleware (`authMiddleware.js`) protects all endpoints except user registration/login
- **Database**: MongoDB connection in `config/db.js`, Winston logging in `logger/`

### Data Model Hierarchy

The application manages workout programs through this entity relationship:

- **User** → subscribes to **Programs** 
- **Program** → contains **Workouts** (templates)
- **Workout** → defines exercises with planned sets
- **WorkoutSession** → tracks actual workout execution with performance data

**Key Model Distinctions**:
- **Workout**: Template with planned exercises and sets (no performance data)
- **WorkoutSession**: Actual workout execution with weights, reps, completion status
- **Exercise**: Exercise definitions
- **Muscle**: Muscle group categorization

### API Structure

All endpoints follow RESTful patterns under `/api`:
- User management: `/users` (registration, login, profile)
- Resources: `/exercises`, `/workouts`, `/programs`, `/muscles`, `/workout-sessions`
- Special endpoint: `/workout-sessions/recent` for user's recent sessions
- Utility: `/send-email` for email functionality

### Environment Requirements

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port (defaults to 5000)