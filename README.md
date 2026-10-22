# 🎨 Skribbl.io Clone - Full Stack Multiplayer Drawing & Guessing Game

> A modern, end-to-end real-time multiplayer drawing and guessing game clone built with **React**, **TypeScript**, **Node.js**, **Express**, **Socket.IO**, and **HTML5 Canvas**.

---

## 🌟 Live Demo & Deployment

- **Live URL**: `https://skribbl-clone-web3.onrender.com` *(Replace with your deployed Render or Railway URL)*
- **Demo Mode**: Public rooms and private invite links (`?room=CODE`) supported out of the box!
- **Local URL**: `http://localhost:3001` (Single unified full-stack server) or `http://localhost:5173` (Vite dev server)

---

## 📑 Table of Contents
1. [Core Features](#-core-features)
2. [Bonus Features Implemented](#-bonus-features-implemented)
3. [Architecture Overview](#-architecture-overview)
4. [OOP Design for WebSocket Server](#-oop-design-for-websocket-server)
5. [Technical Deep Dive & Code Understanding](#-technical-deep-dive--code-understanding)
   - [Real-Time Canvas Sync & Normalization](#1-real-time-canvas-sync--normalization)
   - [Midpoint Curve Smoothing & Flood Fill](#2-midpoint-curve-smoothing--flood-fill)
   - [Game State Machine & Lifecycle](#3-game-state-machine--lifecycle)
   - [Scoring Formula & Hint Reveal Engine](#4-scoring-formula--hint-reveal-engine)
   - [Word Matching & Fuzzy Levenshtein Detection](#5-word-matching--fuzzy-levenshtein-detection)
6. [WebSocket Protocol & Event Dictionary](#-websocket-protocol--event-dictionary)
7. [Tech Stack](#-tech-stack)
8. [Local Development & Setup Guide](#-local-development--setup-guide)
9. [Deployment Guide (Render / Railway / Docker)](#-deployment-guide-render--railway--docker)

---

## 🚀 Core Features

- **Multiplayer Rooms**:
  - Host creates rooms with configurable game parameters (players, rounds, draw time, hints, custom words).
  - Join via short 6-character room codes or 1-click shareable invite URLs (`?room=ABCDEF`).
  - Public rooms lobby browser & "Quick Play" auto-matchmaking.
- **Turn-Based Drawing & Guessing**:
  - Synchronized turn rotation ensures each active player gets an equal turn to draw each round.
  - Drawer gets 15 seconds to pick 1 of 3 categorized words (or custom host words).
  - Real-time countdown timer with urgent ticking audio cues under 10 seconds.
- **Real-Time Synchronized Canvas**:
  - Live stroke broadcasting with normalized `[0, 1]` coordinate space for resolution independence.
  - 20-color classic Skribbl palette + custom HEX color picker.
  - 4 stroke brush sizes (S, M, L, XL).
  - Eraser tool, Undo (with `Ctrl+Z` shortcut), and Clear Canvas actions.
  - Canvas catch-up history: late joiners immediately see the existing drawing.
- **Intelligent Guessing & Chat Separation**:
  - Non-drawers submit guesses in chat.
  - Guess filtering: Once a player guesses correctly, their chat switches to a private "Guessed Room" visible only to the drawer and other guessers to prevent spoilers!
  - Levenshtein-based fuzzy match: notifies guessers when they are "very close" (1 letter typo).
- **Scoring & Leaderboard**:
  - Time-scaled scoring: faster correct guesses earn higher points (100–500 pts).
  - Drawer incentive bonus: drawer earns +50 pts for each player who successfully guesses their drawing.
  - Live dynamic scoreboard with animated rank updates and celebratory confetti.
- **Game End & Podium**:
  - Podium display for 1st, 2nd, and 3rd place winners with crown and trophy medals.
  - Host can restart the match with "Play Again" or return to lobby.

---

## 🎁 Bonus Features Implemented

1. **Object-Oriented Programming (OOP) Architecture**:
   - Clean domain encapsulation with dedicated classes: `Player`, `Room`, `Game`, `RoomManager`, and `WordService`.
2. **Interactive Cartoon Avatar Builder**:
   - Skribbl-style customizable avatars with selectable body colors, eye expressions (cool shades, winks, wide eyes, dizzy X eyes, cyclops), mouth styles (smile, grin, tongue out, mustache, toothy), and a 1-click Randomize button.
3. **Flood Fill (Bucket Tool)**:
   - High-performance BFS scanline flood fill running directly on HTML5 Canvas ImageData.
4. **Synthesized Web Audio Effects (Zero Asset Dependencies)**:
   - Synthesized using native browser Web Audio API: countdown clock ticks, correct guess chime arpeggios, turn start horns, round end chords, and game win fanfares.
5. **Custom Host Word Bank**:
   - Hosts can specify comma-separated custom words in lobby settings which get blended into the game rotation.
6. **Room Moderation (Kick & Votekick)**:
   - Host direct kick & ban capabilities, plus player-initiated votekicking with majority threshold consensus.
7. **Word Mode Options**:
   - Normal mode (reveals underscores `_ _ _ _` with progressive hint letters) or Hidden mode (`???` hardcore challenge).

---

## 🏛 Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │          Web Browser Client          │
                      │  (React 18 + TypeScript + Vite + TW) │
                      └──────────────────┬───────────────────┘
                                         │
                         HTTP & WebSocket (Socket.IO)
                                         │
                      ┌──────────────────▼───────────────────┐
                      │         Node.js Express Server       │
                      │  ┌────────────────────────────────┐  │
                      │  │   Socket Event Router / Ctrl   │  │
                      │  └───────────────┬────────────────┘  │
                      │                  │                   │
                      │  ┌───────────────▼────────────────┐  │
                      │  │     RoomManager (Singleton)    │  │
                      │  └───────────────┬────────────────┘  │
                      │                  │                   │
                      │  ┌───────────────▼────────────────┐  │
                      │  │          Room Instance         │  │
                      │  │  ┌───────────┐   ┌───────────┐ │  │
                      │  │  │ Player(s) │   │Game Engine│ │  │
                      │  │  └───────────┘   └─────┬─────┘ │  │
                      │  └────────────────────────┼───────┘  │
                      │                           │          │
                      │  ┌────────────────────────▼───────┐  │
                      │  │          WordService           │  │
                      │  │   (Categorized Bank + Hints)   │  │
                      │  └────────────────────────────────┘  │
                      └──────────────────────────────────────┘
```

The application is structured as a **unified full-stack repository**:
- In **development**, the Vite client runs with HMR on port `5173` and proxies WebSocket and API requests to Express on port `3001`.
- In **production**, the Express server serves both the compiled static React build (`client/dist`) and handles all real-time Socket.IO connections on a single port (`PORT || 3001`). This eliminates CORS challenges and cross-origin WebSocket upgrade issues on platforms like Render or Railway.

---

## 🧩 OOP Design for WebSocket Server

The server avoids monolithic spaghetti handlers by cleanly encapsulating logic into object-oriented models:

### 1. `Player.ts`
- Encapsulates player state: `id`, `socketId`, `name`, `avatar`, `score`, `roundScore`, `isHost`, `isDrawing`, and `guessedCurrentRound`.
- Provides state mutations: `resetRound()`, `addScore(points)`, `resetGame()`, and sanitized serialization `toJSON()`.

### 2. `Room.ts`
- Represents a game room identified by both a unique UUID and a 6-character user-friendly code (`SKR-8B2`).
- Manages player membership: join, leave, host reassignment if host disconnects, and kick/ban moderation.
- Owns the `Game` instance and isolates room-scoped chat and canvas history.

### 3. `Game.ts`
- State machine for game lifecycle phases: `LOBBY` ➔ `STARTING` ➔ `CHOOSING_WORD` ➔ `DRAWING` ➔ `ROUND_END` ➔ `GAME_OVER`.
- Controls turn queues: creates a shuffled rotation ensuring every player gets an equal turn to draw.
- Manages round timers, hint progression intervals, canvas stroke history for catch-up, and score distribution.

### 4. `RoomManager.ts`
- Singleton manager maintaining active room maps (`roomId -> Room`, `roomCode -> roomId`).
- Generates collisions-free 6-character codes.
- Implements background garbage collection to clean up abandoned/empty rooms.

### 5. `WordService.ts`
- Manages 600+ categorised words (Animals, Food, Tech, Objects, Places, Actions).
- Blends custom host words with system words.
- Calculates hint masks (`_ _ a _ _`) and computes Levenshtein distance for close-guess feedback.

---

## 🔍 Technical Deep Dive & Code Understanding

### 1. Real-Time Canvas Sync & Normalization
- **The Challenge**: Users play across wildly varying screen sizes (mobile phones, tablets, laptops, ultra-wide 4K monitors). If raw pixel coordinates `(x, y)` were broadcast, strokes would render distorted or misaligned on different screens.
- **The Solution**: All pointer coordinates are normalized to the `[0.0, 1.0]` float interval before being transmitted:
  $$\text{normalizedX} = \frac{\text{clientX} - \text{rect.left}}{\text{rect.width}}$$
  $$\text{normalizedY} = \frac{\text{clientY} - \text{rect.top}}{\text{rect.height}}$$
- When receiving strokes, clients scale the normalized coordinates to their internal logical canvas resolution ($1200 \times 800$), guaranteeing 100% pixel-perfect synchronization across all devices.

### 2. Midpoint Curve Smoothing & Flood Fill
- **Quadratic Curve Smoothing**: Raw mouse move events can produce jagged, angular strokes. The canvas renderer computes midpoints between consecutive coordinates:
  $$M_i = \left(\frac{x_i + x_{i+1}}{2}, \frac{y_i + y_{i+1}}{2}\right)$$
  and connects points using `ctx.quadraticCurveTo(x_i, y_i, M_{i}.x, M_{i}.y)`. This produces fluid, natural calligraphy-like lines.
- **Flood Fill Algorithm**: Implemented using a 4-way Breadth-First Search (BFS) on `ctx.getImageData()` with color tolerance comparisons ($R, G, B, A \pm 24$). This enables instant bucket fills without external canvas dependencies.

### 3. Game State Machine & Lifecycle
- The match transitions through explicit phases:
  1. **LOBBY**: Players customize avatars, host configures rules, minimum 2 players required.
  2. **STARTING**: 3-second countdown tone before turn 1 starts.
  3. **CHOOSING_WORD**: Drawer receives 3 random choices. If 15 seconds expire without a selection, the server automatically picks word 0.
  4. **DRAWING**: Drawer draws, guessers guess, seconds tick down. If all guessers guess correctly, the round ends early!
  5. **ROUND_END**: 5-second intermission displaying the revealed word and score gains.
  6. **GAME_OVER**: Final podium celebrating 1st, 2nd, and 3rd place with confetti.

### 4. Scoring Formula & Hint Reveal Engine
- **Guess Scoring**: Points decay smoothly based on time elapsed:
  $$\text{Ratio} = \max\left(0.2, \frac{\text{TimeLeft}}{\text{DrawTime}}\right)$$
  $$\text{Points} = \text{round}(500 \times \text{Ratio})$$
  *(First fast guessers earn up to 500 points; minimum reward is 100 points).*
- **Drawer Bonus**: The drawer earns $+50\text{ points}$ for every player who correctly guesses their drawing, incentivizing clear artwork.
- **Hint Engine**: Hints are paced evenly across the draw time. If a round has 2 hints and draw time is 80s, hints trigger at intervals of $\frac{80}{2+1} \approx 26\text{s}$. Indices are pseudo-randomly selected based on character hashes so hints remain deterministic for all viewers.

### 5. Word Matching & Fuzzy Levenshtein Detection
- Guesses are sanitized: trimmed, converted to lowercase, and stripped of extraneous whitespace.
- If an exact match occurs, the guess is intercepted: points are awarded, a celebration banner is emitted, and the word is hidden from the chat feed.
- If not an exact match, the server runs a Levenshtein edit-distance calculation:
  - If distance is 1 and the target word has $\ge 4$ characters, a private message is sent to that player: `"Your guess is very close!"`.

---

## 📡 WebSocket Protocol & Event Dictionary

| Event | Direction | Payload | Description |
| :--- | :--- | :--- | :--- |
| `create_room` | Client ➔ Server | `{ hostName, avatar, settings }` | Creates room, sets creator as host |
| `join_room` | Client ➔ Server | `{ roomId, playerName, avatar }` | Joins existing room via ID or code |
| `quick_join` | Client ➔ Server | `{ playerName, avatar }` | Matches into public room or creates one |
| `start_game` | Client ➔ Server | `{}` | Host initiates match countdown |
| `update_settings` | Client ➔ Server | `{ settings }` | Host updates rounds, draw time, etc. |
| `word_chosen` | Client ➔ Server | `{ word }` | Drawer selects word choice |
| `canvas_action` | Client ⇄ Server | `{ type, stroke, point, color }` | Broadcasts stroke or flood fill |
| `canvas_clear` | Client ⇄ Server | `{}` | Drawer clears entire canvas |
| `draw_undo` | Client ⇄ Server | `{}` | Drawer undos last stroke |
| `chat_message` | Client ➔ Server | `{ text }` | Player sends guess or message |
| `vote_kick` | Client ➔ Server | `{ targetId }` | Player casts votekick ballot |
| `host_kick` | Client ➔ Server | `{ targetId, isBan }` | Host kicks/bans player |
| `game_state` | Server ➔ Client | `GameStatePayload` | Current round, drawer, hint mask, time |
| `time_tick` | Server ➔ Client | `{ timeLeft }` | Real-time seconds countdown |
| `hint_update` | Server ➔ Client | `{ hintMask }` | Progressive blank reveal (`_ _ a _ _`) |
| `round_end` | Server ➔ Client | `{ word, scores }` | Round summary with revealed word |
| `game_over` | Server ➔ Client | `{ leaderboard, winner }` | Match completion and winner podium |

---

## 💻 Tech Stack

- **Frontend**:
  - React 18
  - TypeScript
  - Vite
  - Tailwind CSS
  - Lucide React Icons
  - HTML5 Canvas API (custom smoothed render engine)
  - Canvas Confetti
  - Web Audio API (native procedural synthesis)
- **Backend**:
  - Node.js (v20+)
  - Express
  - Socket.IO (WebSockets with binary/JSON support)
  - TypeScript (ESNext / NodeNext modules)
- **Deployment & DevOps**:
  - Render / Railway / Docker multi-stage build

---

## 🛠 Local Development & Setup Guide

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (tested on v20 and v24)
- npm v9+

### 1. Clone the repository
```bash
git clone https://github.com/your-username/skribbl-clone.git
cd skribbl-clone
```

### 2. Install dependencies
```bash
# Install root, server, and client dependencies in one command
npm run install:all
```

### 3. Run in Development Mode
To run both backend server and Vite frontend concurrently with hot-reloading:
```bash
npm run dev
```
- Frontend dev server: `http://localhost:5173`
- Backend WebSocket server: `http://localhost:3001`

### 4. Build and Run Unified Production Server
```bash
# Build both client and server TypeScript
npm run build

# Start the unified production server
npm start
```
Visit `http://localhost:3001` in your browser. Open multiple browser tabs (or incognito windows) to simulate real-time multiplayer drawing and guessing!

---

## 🚢 Deployment Guide (Render / Railway / Docker)

### Option 1: Render (Recommended 1-Click)
1. Fork or push this repository to GitHub.
2. Sign in to [Render.com](https://render.com) and click **New > Web Service**.
3. Connect your GitHub repository.
4. Set the following configuration:
   - **Environment**: `Node`
   - **Build Command**: `npm run install:all && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
5. Render will automatically expose the live URL with full WebSocket support enabled.

*(A `render.yaml` blueprint is also included in the repository for automated Infrastructure-as-Code setup).*

### Option 2: Railway
1. Sign in to [Railway.app](https://railway.app) and create a **New Project > Deploy from GitHub Repo**.
2. Railway detects the `Dockerfile` or `package.json` and provisions the container automatically with zero extra configuration.

### Option 3: Docker
```bash
# Build the Docker image
docker build -t skribbl-clone .

# Run the container
docker run -p 3001:3001 skribbl-clone
```
Visit `http://localhost:3001`.

---

## 📝 Code Walkthrough & Interview Readiness

When presenting this project during the technical interview, here is how each component connects:
1. **Starting Point**: `server/src/server.ts` boots Express and Socket.IO.
2. **State Hierarchy**: All connection events route to `server/src/sockets/socketHandler.ts`, which delegates room lookup to `RoomManager.ts`. Each `Room` holds a list of `Player` objects and drives a `Game` state machine.
3. **Canvas Flow**: `client/src/components/Game/Canvas.tsx` captures pointer events, normalizes `(x, y)` between $0.0$ and $1.0$, interpolates quadratic midpoints for anti-aliasing, and emits `canvas_action`. Other clients receive this event and paint onto their local canvas.
4. **Anti-Cheat Guess Isolation**: In `socketHandler.ts`, guesses matching the secret word are never broadcasted as plain text. Instead, a `guess_correct` event is triggered, and all subsequent chat messages from that player are directed exclusively to the "guessed chat" stream.

---

## 👤 Author
- **Divyanshu Pal**
- Submission for Full Stack Intern Technical Evaluation Task
- Date: October 2026
