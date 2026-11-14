import express from 'express';
import { db } from '../db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// List timeline events for universe
router.get('/', optionalAuth, (req, res) => {
  const { universeId } = req.query;
  if (!universeId) return res.status(400).json({ error: 'universeId query parameter required.' });

  const events = db.find('timelines', t => t.universeId === universeId)
    .sort((a, b) => (a.orderYear || 0) - (b.orderYear || 0));

  res.json(events);
});

// Create timeline event
router.post('/', requireAuth, (req, res) => {
  try {
    const {
      universeId,
      title,
      era,
      orderYear,
      yearDisplay,
      description,
      significance,
      relatedCharacterIds,
      relatedLocationIds,
    } = req.body;

    if (!universeId || !title) {
      return res.status(400).json({ error: 'Universe ID and event title are required.' });
    }

    const universe = db.findById('universes', universeId);
    if (!universe) return res.status(404).json({ error: 'Associated universe not found.' });

    // Conflict detection: verify characters exist
    let conflictWarning = null;
    const charIds = Array.isArray(relatedCharacterIds) ? relatedCharacterIds : [];
    if (charIds.length > 0) {
      const charNames = charIds.map(id => db.findById('characters', id)?.name).filter(Boolean);
      if (charNames.length !== charIds.length) {
        conflictWarning = 'One or more referenced characters could not be located in canon archives.';
      }
    }

    const newEvent = db.insert('timelines', {
      universeId,
      userId: req.user.id,
      title: title.trim(),
      era: era?.trim() || 'Current Era',
      orderYear: Number(orderYear) || 0,
      yearDisplay: yearDisplay?.trim() || `${orderYear || 0} AE`,
      description: description?.trim() || '',
      significance: significance?.trim() || '',
      relatedCharacterIds: charIds,
      relatedLocationIds: Array.isArray(relatedLocationIds) ? relatedLocationIds : [],
      conflictWarning,
    });

    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create timeline event.' });
  }
});

// Update timeline event
router.put('/:id', requireAuth, (req, res) => {
  const event = db.findById('timelines', req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found.' });

  const updated = db.update('timelines', event.id, req.body);
  res.json(updated);
});

// Delete timeline event
router.delete('/:id', requireAuth, (req, res) => {
  const event = db.findById('timelines', req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found.' });

  db.delete('timelines', event.id);
  res.json({ message: 'Timeline event deleted successfully.' });
});

export default router;
