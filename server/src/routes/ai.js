import express from 'express';
import { db } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import {
  assembleUniverseContext,
  generateWorldLore,
  generateCharacter,
  generateStoryChapter,
  continueStory,
  generateDialogue,
  generatePlotTwists,
  checkStoryContinuity,
  brainstormIdeas,
} from '../aiEngine.js';

const router = express.Router();

// Helper to check credits, deduct, and log
function handleCreditDeduction(user, cost, actionType, universeId, promptPreview, model) {
  if (user.credits < cost) {
    throw new Error(`Insufficient AI credits (${user.credits} remaining, requires ${cost}). Please upgrade your plan or wait for credit refresh.`);
  }

  const updatedCredits = user.credits - cost;
  db.update('users', user.id, { credits: updatedCredits });

  const log = db.insert('aiUsageLogs', {
    userId: user.id,
    universeId: universeId || null,
    actionType,
    promptPreview: (promptPreview || '').slice(0, 150),
    tokens: cost * 40,
    creditsDeducted: cost,
    model: model || 'StoryVerse AI Engine',
  });

  return { remainingCredits: updatedCredits, log };
}

// 1. World Lore Generator
router.post('/world-lore', requireAuth, async (req, res) => {
  try {
    const { prompt, genre, universeId } = req.body;
    const user = db.findById('users', req.user.id);
    const universeContext = universeId ? assembleUniverseContext(universeId, user.id) : null;

    const result = await generateWorldLore({
      prompt,
      genre,
      userApiKey: user.apiKey,
      universeContext,
    });

    const cost = result.creditsDeducted || 10;
    const { remainingCredits } = handleCreditDeduction(user, cost, 'World Generation', universeId, prompt, result.model);

    res.json({
      ...result,
      remainingCredits,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 2. Character Generator
router.post('/character', requireAuth, async (req, res) => {
  try {
    const { prompt, universeId } = req.body;
    const user = db.findById('users', req.user.id);
    const universeContext = universeId ? assembleUniverseContext(universeId, user.id) : null;

    const result = await generateCharacter({
      prompt,
      universeContext,
      userApiKey: user.apiKey,
    });

    const cost = result.creditsDeducted || 10;
    const { remainingCredits } = handleCreditDeduction(user, cost, 'Character Creation', universeId, prompt, result.model);

    res.json({
      ...result,
      remainingCredits,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 3. Chapter Writer
router.post('/chapter', requireAuth, async (req, res) => {
  try {
    const { prompt, storyTitle, universeId, chapterNumber, tone, genre } = req.body;
    const user = db.findById('users', req.user.id);
    const universeContext = universeId ? assembleUniverseContext(universeId, user.id) : null;

    const result = await generateStoryChapter({
      prompt,
      storyTitle,
      universeContext,
      chapterNumber,
      tone,
      genre,
      userApiKey: user.apiKey,
    });

    const cost = result.creditsDeducted || 15;
    const { remainingCredits } = handleCreditDeduction(user, cost, 'Chapter Generation', universeId, prompt, result.model);

    res.json({
      ...result,
      remainingCredits,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Continue Story
router.post('/continue', requireAuth, async (req, res) => {
  try {
    const { existingContent, prompt, universeId } = req.body;
    const user = db.findById('users', req.user.id);
    const universeContext = universeId ? assembleUniverseContext(universeId, user.id) : null;

    const result = await continueStory({
      existingContent,
      prompt,
      universeContext,
      userApiKey: user.apiKey,
    });

    const cost = result.creditsDeducted || 10;
    const { remainingCredits } = handleCreditDeduction(user, cost, 'Story Continuation', universeId, prompt, result.model);

    res.json({
      ...result,
      remainingCredits,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. Dialogue Generator
router.post('/dialogue', requireAuth, async (req, res) => {
  try {
    const { characterIds, settingLocationId, tone, topic, universeId } = req.body;
    const user = db.findById('users', req.user.id);
    const universeContext = universeId ? assembleUniverseContext(universeId, user.id) : null;

    const selectedChars = (characterIds || []).map(id => db.findById('characters', id)).filter(Boolean);
    const loc = settingLocationId ? db.findById('locations', settingLocationId) : null;

    const result = await generateDialogue({
      characters: selectedChars,
      settingLocation: loc,
      tone: tone || 'Dramatic',
      topic: topic || 'A fateful decision',
      universeContext,
      userApiKey: user.apiKey,
    });

    const cost = result.creditsDeducted || 12;
    const { remainingCredits } = handleCreditDeduction(user, cost, 'Dialogue Generation', universeId, topic, result.model);

    res.json({
      ...result,
      remainingCredits,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Plot Twists
router.post('/plot-twist', requireAuth, async (req, res) => {
  try {
    const { universeId, storySummary } = req.body;
    const user = db.findById('users', req.user.id);
    const universeContext = universeId ? assembleUniverseContext(universeId, user.id) : null;

    const result = await generatePlotTwists({
      universeContext,
      storySummary,
      userApiKey: user.apiKey,
    });

    const cost = 8;
    const { remainingCredits } = handleCreditDeduction(user, cost, 'Plot Twist Engine', universeId, storySummary, result.model);

    res.json({
      ...result,
      remainingCredits,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Continuity Checker
router.post('/continuity-check', requireAuth, async (req, res) => {
  try {
    const { universeId, textToCheck } = req.body;
    const user = db.findById('users', req.user.id);
    const universeContext = universeId ? assembleUniverseContext(universeId, user.id) : null;

    const result = await checkStoryContinuity({
      textToCheck,
      universeContext,
      userApiKey: user.apiKey,
    });

    const cost = 10;
    const { remainingCredits } = handleCreditDeduction(user, cost, 'Continuity Audit', universeId, textToCheck?.slice(0, 100), result.model);

    res.json({
      ...result,
      remainingCredits,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 8. Brainstorm Assistant
router.post('/brainstorm', requireAuth, async (req, res) => {
  try {
    const { prompt, category, universeId } = req.body;
    const user = db.findById('users', req.user.id);
    const universeContext = universeId ? assembleUniverseContext(universeId, user.id) : null;

    const result = await brainstormIdeas({
      prompt,
      category,
      universeContext,
      userApiKey: user.apiKey,
    });

    const cost = 8;
    const { remainingCredits } = handleCreditDeduction(user, cost, 'Brainstorming', universeId, prompt, result.model);

    res.json({
      ...result,
      remainingCredits,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// AI Usage History
router.get('/usage-history', requireAuth, (req, res) => {
  const logs = db.find('aiUsageLogs', l => l.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(logs);
});

export default router;
