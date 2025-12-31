# Collab Canvas

A real-time collaborative whiteboard built with the **MERN stack** and **Socket.IO** that allows multiple users to draw together instantly — no authentication required.  
Just share a room code and start collaborating.

---

## 🚀 Project Overview

Collab Canvas is a web-based collaborative whiteboard where users can join a shared room using a simple alphanumeric code and draw together in real time.  
All drawing actions are synchronized across connected users, and **late joiners automatically receive the existing canvas state**.

This project focuses on real-time communication, event synchronization, and clean system design.

---

## ⚙️ Tech Stack

| Layer | Technology |
|------|-----------|
| Frontend | React.js (Vite) |
| Backend | Node.js + Express |
| Database | MongoDB |
| Real-time | Socket.IO |
| Styling | Tailwind CSS / CSS |
| Deployment | Vercel (Frontend), Render (Backend) |

---

## ✨ Features

### ✅ Room Management
- Join rooms using a 6–8 character alphanumeric room code
- No login or registration required
- Rooms are created dynamically

### ✅ Drawing Features
- Pencil tool with multiple colors
- Adjustable stroke width
- Clear canvas button
- Smooth drawing using HTML5 Canvas

### ✅ Real-time Collaboration
- Live drawing synchronization across all users
- **Late joiners receive the existing canvas state**
- Active user count per room
- Multi-tab and multi-user sync

### ⚠️ Cursor Sync (Baseline)
- Basic real-time cursor sharing
- Implemented using viewport coordinates
- Intentionally kept simple for stability

---

## 🗂️ Folder Structure

collab-canvas/
├── client/ # React frontend
│ ├── src/
│ │ ├── components/
│ │ │ ├── RoomJoin.jsx
│ │ │ ├── Whiteboard.jsx
│ │ │ ├── DrawingCanvas.jsx
│ │ │ ├── Toolbar.jsx
│ │ │ └── UserCursors.jsx
│ │ ├── socket.js
│ │ └── App.jsx
│ └── package.json
│
├── server/ # Express + Socket.IO backend
│ ├── socket/
│ │ └── socketHandlers.js
│ ├── routes/
│ ├── models/
│ ├── db/
│ ├── server.js
│ └── package.json
│
└── README.md

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v16 or above)
- MongoDB (local or Atlas)
- npm or yarn

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Zfocc31/collab-canvas.git
cd collab-canvas
2️⃣ Backend Setup
cd server
npm install


Create a .env file inside server/:

PORT=8000
MONGODB_URI=your_mongodb_connection_string


Start the backend:

npm start

3️⃣ Frontend Setup
cd ../client
npm install
npm run dev


Create a .env file inside client/ (for local development):

VITE_BACKEND_URL=http://localhost:8000

🔌 Socket.IO Events
Client → Server

join-room — join a room by roomId

draw-start — begin a drawing stroke

draw-move — continue drawing

draw-end — finish the stroke

clear-canvas — clear the canvas

cursor-move — send cursor position (baseline)

Server → Client

user-count — updated number of active users

draw-start — start stroke from another user

draw-move — receive stroke path data

draw-end — end stroke

clear-canvas — clear canvas for all users

cursor-update — receive cursor positions

🏗️ Architecture Overview
[Client Browser]
        ↓ Socket.IO
[React Frontend]
        ↓ API + WebSocket
[Express Backend]
        ↓
[MongoDB] (optional persistence)

🚀 Deployment Guide
Backend Deployment

Supported platforms:

Render

Railway

VPS / Docker

Ensure:

WebSocket support enabled

Proper CORS configuration

MongoDB Atlas URI set in environment variables

Example production env:

PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/collab_canvas

Frontend Deployment

Supported platforms:

Vercel

Netlify

Set environment variable:

VITE_BACKEND_URL=https://your-backend-url.com

🔮 Future Improvements

Canvas state persistence in database

Canvas-relative cursor tracking

Undo / redo support

Room expiry (TTL)

Usernames and avatars

✅ Current Status

Room-based collaboration ✔

Real-time drawing sync ✔

Late join canvas replay ✔

Cursor sync (baseline) ✔

Multi-user & multi-tab support ✔

👤 Author

Rahul Sinha