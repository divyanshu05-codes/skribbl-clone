import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { registerSocketHandlers } from './sockets/socketHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// CORS configuration for Socket.io and Express
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingInterval: 10000,
  pingTimeout: 5000,
  maxHttpBufferSize: 1e7 // 10MB for fast canvas sync
});

app.use(cors());
app.use(express.json());

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'skribbl-clone-server',
    time: new Date().toISOString()
  });
});

// Register real-time Socket.IO event handlers
registerSocketHandlers(io);

// In production, serve the built Vite client from client/dist
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[Server] Serving static frontend from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send(`
      <div style="font-family: sans-serif; text-align: center; padding: 50px;">
        <h2>🎨 Skribbl Clone WebSocket & API Server Running</h2>
        <p>Port: ${PORT}</p>
        <p>Client build not found at <code>${clientDistPath}</code>. Run Vite client separately in development, or run <code>npm run build</code> for unified production build.</p>
      </div>
    `);
  });
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🎨 Skribbl Clone Server is running!`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`⚡ WebSocket Server ready for connections`);
  console.log(`===============================================`);
});
