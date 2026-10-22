# Skribbl Clone

A full-stack, real-time multiplayer drawing and guessing game built with React, TypeScript, Node.js, Express, Socket.IO, and HTML Canvas.

## Features

- Multiplayer rooms with room codes and invite links
- Real-time synchronized drawing, undo, clear, and late-join canvas history
- Word selection, timed rounds, chat guesses, hints, scoring, and leaderboard
- Player avatars, moderation tools, and a podium at game end

## Requirements

- Node.js 20 or newer
- npm

## Run locally

From the project root, install dependencies:

```powershell
npm run install:all
```

Start the client and server together:

```powershell
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite client connects to the development server on port 3001. Keep the terminal running while you play. Open a second tab or browser window to try multiplayer.

## Build and run production mode locally

```powershell
npm run build
npm start
```

Open [http://localhost:3001](http://localhost:3001).

## Deploy on Render

The repository includes a `render.yaml` blueprint. You can also create a Render **Web Service** connected to the GitHub repository with:

- Build command: `npm run install:all && npm run build`
- Start command: `npm start`
- Runtime: Node

The service serves the built client and Socket.IO from one Node process. Use the public URL assigned by Render after deployment. Do not put `localhost` in production settings.

## Environment files and secrets

This project does not currently require API keys or other secret values to run. The optional client setting `VITE_SERVER_URL` can point to a separately hosted Socket.IO server; leave it unset for the local and same-origin defaults. `.env.example` contains only a blank template.

Put any future private values in a local `.env` file (or an appropriately encrypted `.enc` file), and keep the encryption key separate from the encrypted file. `.gitignore` excludes `.env` files and `.enc` files. Never put real secrets in `.env.example`, source code, or a public repository. If a secret is ever committed, revoke or rotate it; removing the file alone does not erase it from Git history.

## Project layout

- `client/` — React and Vite application
- `server/` — Express, Socket.IO, game state, and room management
- `render.yaml` — Render service configuration
- `Dockerfile` — Docker build and runtime configuration
