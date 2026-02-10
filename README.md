# Skillsy 
A full-stack skill-exchange platform built on a credit-based barter model, where users can alternate between learner and mentor roles, each with dedicated user experiences.

![Uploading image.png…]()


## Tech Stack

- **Frontend**: Next.js 14 (App Router) + React + TypeScript + Tailwind CSS
- **Backend**: Python FastAPI
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Google OAuth
- **Real-time**: Supabase Realtime


## Features (MVP)

- Google Authentication
- User profiles (skills, certifications, achievements)
- Learner/Mentor mode toggle
- Light/Dark theme
- Search mentors by skills
- Connection requests
- Real-time chat
- Credits system (initial 10 credits, earning/spending, tips)

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

For Quick Startup in Windows:

1. Run `.\start-frontend.ps1`
2. Run `.\start-backend.ps1` in two different terminals.
