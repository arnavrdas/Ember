<div align="center">

  # Ember

</div>

A real-time dating app with swipe-based matching, instant messaging, and live presence indicators.
<br><br>

<p align="center">
  <a href="https://ember.arnavdas.in">
    <img src="https://img.shields.io/badge/-Live_Demo-green?style=for-the-badge" />
  </a>
  <!-- <a href="https://youtu.be/VIDEO_ID">
    <img src="https://img.shields.io/badge/-YouTube-red?style=for-the-badge&logo=youtube" />
  </a> -->
</p>
<!-- <br> -->
<!-- ![Demo GIF](docs/GIF_NAME.gif) -->
<br><br><br>

## Features
- Swipe to Match
- Real-Time Chat
- Typing Indicators
- Read Receipts
- Online Presence
- Match Notifications
- Match Management
- Profile Customisation
- Seed Data
<br><br><br>

## Architecture
```
Ember/
├── backend/    Express REST API + Socket.io server
└── frontend/   React SPA (Vite)
```
 
The backend and frontend are independent packages that run as separate processes and communicate over HTTP and WebSocket.
 
```
Browser  ──HTTP──▶  Express API  ──Mongoose──▶  MongoDB
         ◀───WS───  Socket.io
```
<br><br><br>

## Tech Stack
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Frontend:** React
<br><br><br>

## Setup

  ### Prerequisite
  - Node.js 18+

  ### Step 1: Start MongoDB (locally or point MONGO_URI at Atlas)
  
  ### Step 2: Backend
  ```bash
    cd backend
    cp .env.example .env   # fill in MONGO_URI, JWT_SECRET, etc.
    npm install
    npm run dev            # http://localhost:5000
  ```
  
  ### Step 3: Frontend
  ```bash
    cd frontend
    npm install
    npm run dev            # http://localhost:5173
  ```
  
  ### Step 4: Seed database (Optional)
  ```bash
    cd backend
    npm run seed
  ```
<!-- <br><br><br>

## Future Improvements
- ...
- ...
- ... -->