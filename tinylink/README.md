# TinyLink – URL Shortener with Click Analytics

A full-stack URL shortener built with React, Node.js, Express, and MongoDB. Generates short links using a Base62-style code (via `nanoid`) and tracks click analytics (timestamp, referrer) for each link in real time.

## Tech Stack
- **Frontend:** React (Vite), Axios
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)

## Features
- Shorten any valid URL into a short code
- Redirect from short link to original URL
- Track total clicks and click history per link
- Live dashboard showing all created links and their click counts

## Project Structure
```
tinylink/
├── backend/
│   ├── models/Link.js       # Mongoose schema for links + clicks
│   ├── routes/links.js      # API routes: create, list, stats
│   ├── server.js            # Express app + redirect handler
│   └── .env.example
└── frontend/
    ├── src/App.jsx          # Main UI: shorten form + dashboard
    ├── src/main.jsx
    └── src/index.css
```

## Setup Instructions

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your MongoDB connection string
npm run dev
```
The API runs on `http://localhost:5000` by default.

You'll need a MongoDB connection string. The easiest way: create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register), then copy the connection string into `.env` as `MONGO_URI`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
The app runs on `http://localhost:5173` by default and talks to the backend at `http://localhost:5000`.

If you deploy the backend elsewhere, set `VITE_API_BASE` in a `.env` file in `frontend/` to point to your deployed backend URL.

## API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/links` | Create a short link. Body: `{ "originalUrl": "https://..." }` |
| GET | `/api/links` | List all links |
| GET | `/api/links/:shortCode/stats` | Get click analytics for one link |
| GET | `/:shortCode` | Redirects to original URL, logs a click |

## Deployment
- **Backend:** Deploy to [Render](https://render.com) or [Railway](https://railway.app) (free tier). Set `MONGO_URI` as an environment variable there.
- **Frontend:** Deploy to [Vercel](https://vercel.com) or [Netlify](https://netlify.com). Set `VITE_API_BASE` to your deployed backend URL.

## What I'd Improve With More Time
- Custom short codes (user-chosen aliases)
- QR code generation for each short link
- Link expiration dates
- User accounts to manage personal links
