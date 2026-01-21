# Skillsy 
A full-stack web application that allows users to trade skills by earning credits in a barter-like system. Users can be both learners and mentors, switching between profiles with different interfaces.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript + Tailwind CSS
- **Backend**: Python FastAPI
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Google OAuth
- **Real-time**: Supabase Realtime

## Project Structure

```
skillsy/
├── frontend/          # Next.js application
├── backend/           # FastAPI application
├── .env.example       # Environment variables template
└── README.md
```

## Features (MVP)

- ✅ Google Authentication
- ✅ User profiles (skills, certifications, achievements)
- ✅ Learner/Mentor mode toggle
- ✅ Light/Dark theme
- ✅ Search mentors by skills
- ✅ Connection requests
- ✅ Real-time chat
- ✅ Credits system (initial 10 credits, earning/spending, tips)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Supabase account

### Installation

1. Clone the repository
2. Install frontend dependencies: `cd frontend && npm install`
3. Install backend dependencies: `cd backend && pip install -r requirements.txt`
4. Set up environment variables (see `.env.example`)
5. Run frontend: `cd frontend && npm run dev`
6. Run backend: `cd backend && uvicorn main:app --reload`

