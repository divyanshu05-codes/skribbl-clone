# 🎨 Skribbl Clone

### Draw it. Guess it. Beat the clock.

A real-time multiplayer drawing and guessing game inspired by skribbl.io.  
Create a room, invite your friends, and see who can guess the word first.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Real--Time-010101?logo=socketdotio&logoColor=white)](https://socket.io/)

**🌐 Live Demo:** [Add your deployed Render URL here]

## ✨ About the Game

Skribbl Clone brings the fun of drawing and word guessing into a multiplayer browser game. Players take turns choosing a word and drawing it on a shared canvas while everyone else races to guess correctly.

## 🕹️ Features

| 🎯 Rooms & Lobby | 🖌️ Drawing | 💬 Gameplay |
| --- | --- | --- |
| Public and private rooms | Live canvas synchronization | Real-time chat and guesses |
| Room codes and invite links | Color palette and custom colors | Timed rounds and hints |
| Public room browsing and Quick Join | Brush sizes, eraser, and fill | Correct-guess scoring |
| Host controls and room settings | Undo and clear canvas | Leaderboard and winner podium |

Additional features include custom word lists, player avatars, late-join canvas history, host moderation, and vote-kick.

## 🚀 Get Started

### Requirements

- [Node.js 20 or newer](https://nodejs.org/)
- npm

### Install dependencies

From the project root:

```bash
npm run install:all
```

### Start the game locally

```bash
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)**. The frontend connects to the development server on port `3001`.

To try multiplayer, open a second browser tab, create or join the same room, and start a game.

### Build and run in production mode

```bash
npm run build
npm start
```

Then open **[http://localhost:3001](http://localhost:3001)**.

## 🔄 How a Round Works

```text
Create a room → Invite players → Choose a word → Draw → Guess → Score
```

1. The host creates a room and chooses its settings.
2. Players join using the room code or invite link.
3. The host starts the game when at least two players have joined.
4. The selected drawer picks a word from the choices.
5. The drawer sketches while the other players submit guesses in chat.
6. Correct guesses earn points. The drawer earns a bonus when players guess correctly.
7. The round ends when time runs out or everyone has guessed. The game continues through the turns and then shows the leaderboard.

## 🧱 Built With

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Drawing:** HTML Canvas API
- **Backend:** Node.js, Express, TypeScript
- **Real-time events:** Socket.IO
- **Deployment:** Render or Docker

## 🏗️ Project Structure

```text
.
├── client/                  # React and Vite frontend
│   └── src/
│       ├── components/      # Lobby, canvas, chat, and game UI
│       └── context/         # Shared game state and Socket.IO client
├── server/                  # Express and Socket.IO backend
│   └── src/
│       ├── data/            # Word lists
│       ├── models/          # Game, player, and room models
│       ├── services/        # Room and word services
│       └── sockets/         # Real-time event handlers
├── Dockerfile
├── render.yaml
└── package.json
```

## ⚙️ How It Works

The server manages rooms, player turns, word choices, timers, guesses, and scoring. Socket.IO sends game updates, chat messages, and drawing actions between players. The frontend renders drawing actions on an HTML canvas and keeps the canvas history for players who join during a round.

In production, the Node.js server serves the built frontend and the Socket.IO connection from the same origin.

## 🐳 Run with Docker

Build the image from the project root:

```bash
docker build -t skribbl-clone .
```

Run the container:

```bash
docker run --rm -p 3001:3001 skribbl-clone
```

Open **[http://localhost:3001](http://localhost:3001)**.

## 📜 Available Scripts

| Command | Description |
| --- | --- |
| `npm run install:all` | Install root, client, and server dependencies |
| `npm run dev` | Start the frontend and backend for development |
| `npm run build` | Build the frontend and compile the backend |
| `npm start` | Start the production server |

### Grab your friends and start drawing! 🎉
