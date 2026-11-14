import express from 'express';
import { db } from '../db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// List stories
router.get('/', optionalAuth, (req, res) => {
  const { universeId } = req.query;
  let list = [];
  if (universeId) {
    list = db.find('stories', s => s.universeId === universeId);
  } else if (req.user) {
    list = db.find('stories', s => s.userId === req.user.id);
  } else {
    list = db.find('stories', s => s.isPublic);
  }

  // Attach chapters count & word count
  const enriched = list.map(s => {
    const chapters = db.find('chapters', c => c.storyId === s.id);
    const totalWords = chapters.reduce((acc, c) => acc + (c.wordCount || 0), 0);
    return {
      ...s,
      chaptersCount: chapters.length,
      totalWordCount: totalWords,
    };
  });

  res.json(enriched);
});

// Single story with chapters
router.get('/:id', optionalAuth, (req, res) => {
  const story = db.findById('stories', req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found.' });

  const chapters = db.find('chapters', c => c.storyId === story.id)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  const universe = db.findById('universes', story.universeId);

  res.json({
    ...story,
    universeName: universe?.name || 'Unknown Universe',
    chapters,
  });
});

// Create story
router.post('/', requireAuth, (req, res) => {
  try {
    const { universeId, title, synopsis, genre, tone, targetWordCount, status, isPublic } = req.body;
    if (!universeId || !title) {
      return res.status(400).json({ error: 'Universe ID and story title are required.' });
    }

    const newStory = db.insert('stories', {
      universeId,
      userId: req.user.id,
      title: title.trim(),
      synopsis: synopsis?.trim() || '',
      genre: genre || 'fantasy',
      tone: tone?.trim() || 'Epic',
      targetWordCount: Number(targetWordCount) || 50000,
      status: status || 'draft',
      isPublic: Boolean(isPublic),
      likes: 0,
      views: 0,
      bookmarks: 0,
    });

    // Automatically create Chapter 1 draft
    const ch1 = db.insert('chapters', {
      storyId: newStory.id,
      universeId,
      userId: req.user.id,
      chapterNumber: 1,
      title: 'Chapter 1: The Beginning',
      content: '',
      wordCount: 0,
      summary: '',
      autoSavedAt: new Date().toISOString(),
    });

    res.status(201).json({ ...newStory, chapters: [ch1] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create story.' });
  }
});

// Update story
router.put('/:id', requireAuth, (req, res) => {
  const story = db.findById('stories', req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found.' });
  if (story.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized to edit this story.' });

  const updated = db.update('stories', story.id, req.body);
  res.json(updated);
});

// Delete story
router.delete('/:id', requireAuth, (req, res) => {
  const story = db.findById('stories', req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found.' });
  if (story.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized to delete this story.' });

  db.delete('stories', story.id);
  db.data.chapters = db.data.chapters.filter(c => c.storyId !== story.id);
  db.save();

  res.json({ message: 'Story and chapters deleted successfully.' });
});

// --- CHAPTERS ENDPOINTS ---

// List chapters of a story
router.get('/:storyId/chapters', optionalAuth, (req, res) => {
  const chapters = db.find('chapters', c => c.storyId === req.params.storyId)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);
  res.json(chapters);
});

// Add chapter to story
router.post('/:storyId/chapters', requireAuth, (req, res) => {
  try {
    const { storyId } = req.params;
    const story = db.findById('stories', storyId);
    if (!story) return res.status(404).json({ error: 'Story not found.' });

    const existingChapters = db.find('chapters', c => c.storyId === storyId);
    const nextNum = existingChapters.length + 1;

    const { title, content, summary } = req.body;
    const words = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;

    const newChapter = db.insert('chapters', {
      storyId,
      universeId: story.universeId,
      userId: req.user.id,
      chapterNumber: nextNum,
      title: title?.trim() || `Chapter ${nextNum}`,
      content: content || '',
      wordCount: words,
      summary: summary?.trim() || '',
      autoSavedAt: new Date().toISOString(),
    });

    res.status(201).json(newChapter);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create chapter.' });
  }
});

// Update / Autosave Chapter
router.put('/:storyId/chapters/:chapterId', requireAuth, (req, res) => {
  const { chapterId } = req.params;
  const chapter = db.findById('chapters', chapterId);
  if (!chapter) return res.status(404).json({ error: 'Chapter not found.' });

  const { title, content, summary, chapterNumber } = req.body;
  const updates = { autoSavedAt: new Date().toISOString() };

  if (title !== undefined) updates.title = title.trim();
  if (content !== undefined) {
    updates.content = content;
    updates.wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  }
  if (summary !== undefined) updates.summary = summary.trim();
  if (chapterNumber !== undefined) updates.chapterNumber = Number(chapterNumber);

  const updated = db.update('chapters', chapterId, updates);
  res.json(updated);
});

// Delete chapter
router.delete('/:storyId/chapters/:chapterId', requireAuth, (req, res) => {
  const { chapterId } = req.params;
  const chapter = db.findById('chapters', chapterId);
  if (!chapter) return res.status(404).json({ error: 'Chapter not found.' });

  db.delete('chapters', chapterId);
  res.json({ message: 'Chapter deleted.' });
});

export default router;
