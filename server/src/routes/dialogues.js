import express from 'express';
import { db } from '../db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// List dialogues
router.get('/', optionalAuth, (req, res) => {
  const { universeId } = req.query;
  let list = [];
  if (universeId) {
    list = db.find('dialogues', d => d.universeId === universeId);
  } else if (req.user) {
    list = db.find('dialogues', d => d.userId === req.user.id);
  }
  res.json(list);
});

// Single dialogue
router.get('/:id', optionalAuth, (req, res) => {
  const dialogue = db.findById('dialogues', req.params.id);
  if (!dialogue) return res.status(404).json({ error: 'Dialogue not found.' });

  // Enrich with character details
  const enrichedCharacters = (dialogue.characterIds || []).map(id => db.findById('characters', id)).filter(Boolean);
  const location = dialogue.settingLocationId ? db.findById('locations', dialogue.settingLocationId) : null;

  res.json({
    ...dialogue,
    characterDetails: enrichedCharacters,
    location,
  });
});

// Create dialogue script
router.post('/', requireAuth, (req, res) => {
  try {
    const { universeId, title, settingLocationId, tone, characterIds, lines, notes } = req.body;
    if (!universeId || !title) {
      return res.status(400).json({ error: 'Universe ID and dialogue title are required.' });
    }

    const newDialogue = db.insert('dialogues', {
      universeId,
      userId: req.user.id,
      title: title.trim(),
      settingLocationId: settingLocationId || null,
      tone: tone || 'Dramatic',
      characterIds: Array.isArray(characterIds) ? characterIds : [],
      lines: Array.isArray(lines) ? lines : [],
      notes: notes?.trim() || '',
    });

    res.status(201).json(newDialogue);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create dialogue.' });
  }
});

// Update dialogue script
router.put('/:id', requireAuth, (req, res) => {
  const dialogue = db.findById('dialogues', req.params.id);
  if (!dialogue) return res.status(404).json({ error: 'Dialogue not found.' });

  const updated = db.update('dialogues', dialogue.id, req.body);
  res.json(updated);
});

// Delete dialogue
router.delete('/:id', requireAuth, (req, res) => {
  const dialogue = db.findById('dialogues', req.params.id);
  if (!dialogue) return res.status(404).json({ error: 'Dialogue not found.' });

  db.delete('dialogues', dialogue.id);
  res.json({ message: 'Dialogue deleted successfully.' });
});

export default router;
