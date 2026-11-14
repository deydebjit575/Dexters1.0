import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import universeRoutes from './routes/universes.js';
import characterRoutes from './routes/characters.js';
import locationRoutes from './routes/locations.js';
import timelineRoutes from './routes/timelines.js';
import storyRoutes from './routes/stories.js';
import dialogueRoutes from './routes/dialogues.js';
import branchingRoutes from './routes/branchingStories.js';
import communityRoutes from './routes/community.js';
import subscriptionRoutes from './routes/subscription.js';
import aiRoutes from './routes/ai.js';
import exportRoutes from './routes/export.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api') && req.method !== 'OPTIONS') {
      console.log(`[${req.method}] ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/universes', universeRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/timelines', timelineRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/dialogues', dialogueRoutes);
app.use('/api/branching-stories', branchingRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/export', exportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'STORYVERSE AI',
    tagline: 'Imagine Worlds. Create Stories. Build Universes.',
    timestamp: new Date().toISOString(),
  });
});

// Serve static frontend build if present
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error occurred.' });
});

app.listen(PORT, () => {
  console.log(`🌌 STORYVERSE AI running on http://localhost:${PORT}`);
});

