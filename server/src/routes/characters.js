import express from 'express';
import { db } from '../db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// List characters (by universeId or user)
router.get('/', optionalAuth, (req, res) => {
  const { universeId } = req.query;
  if (!universeId) {
    const list = req.user ? db.find('characters', c => c.userId === req.user.id) : [];
    return res.json(list);
  }

  const list = db.find('characters', c => c.universeId === universeId);
  res.json(list);
});

// Single character
router.get('/:id', optionalAuth, (req, res) => {
  const char = db.findById('characters', req.params.id);
  if (!char) return res.status(404).json({ error: 'Character not found.' });

  // Get relationships for this character
  const rels = db.find('relationships', r => r.sourceId === char.id || r.targetId === char.id);
  res.json({ ...char, relationships: rels });
});

// Create character
router.post('/', requireAuth, (req, res) => {
  try {
    const {
      universeId,
      name,
      role,
      species,
      age,
      avatar,
      personalityTraits,
      biography,
      abilities,
      motivations,
      strengths,
      weaknesses,
      characterArc,
      status
    } = req.body;

    if (!universeId || !name) {
      return res.status(400).json({ error: 'Universe ID and character name are required.' });
    }

    const universe = db.findById('universes', universeId);
    if (!universe) return res.status(404).json({ error: 'Associated universe not found.' });

    const newChar = db.insert('characters', {
      universeId,
      userId: req.user.id,
      name: name.trim(),
      role: role?.trim() || 'Protagonist',
      species: species?.trim() || 'Human',
      age: Number(age) || 25,
      avatar: avatar?.trim() || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      personalityTraits: Array.isArray(personalityTraits) ? personalityTraits : (personalityTraits ? personalityTraits.split(',').map(s => s.trim()) : []),
      biography: biography?.trim() || '',
      abilities: Array.isArray(abilities) ? abilities : (abilities ? abilities.split(',').map(s => s.trim()) : []),
      motivations: motivations?.trim() || '',
      strengths: strengths?.trim() || '',
      weaknesses: weaknesses?.trim() || '',
      characterArc: characterArc?.trim() || '',
      status: status || 'active',
    });

    res.status(201).json(newChar);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create character.' });
  }
});

// Update character
router.put('/:id', requireAuth, (req, res) => {
  const char = db.findById('characters', req.params.id);
  if (!char) return res.status(404).json({ error: 'Character not found.' });

  const updated = db.update('characters', char.id, req.body);
  res.json(updated);
});

// Delete character
router.delete('/:id', requireAuth, (req, res) => {
  const char = db.findById('characters', req.params.id);
  if (!char) return res.status(404).json({ error: 'Character not found.' });

  db.delete('characters', char.id);
  // Clean relationships
  db.data.relationships = db.data.relationships.filter(r => r.sourceId !== char.id && r.targetId !== char.id);
  db.save();

  res.json({ message: 'Character deleted successfully.' });
});

// --- RELATIONSHIPS ENDPOINTS ---

// List relationships for universe
router.get('/meta/relationships', optionalAuth, (req, res) => {
  const { universeId } = req.query;
  if (!universeId) return res.status(400).json({ error: 'universeId query parameter required.' });

  const rels = db.find('relationships', r => r.universeId === universeId);
  res.json(rels);
});

// Create relationship
router.post('/meta/relationships', requireAuth, (req, res) => {
  try {
    const { universeId, sourceId, targetId, relationType, description, strength } = req.body;
    if (!universeId || !sourceId || !targetId || !relationType) {
      return res.status(400).json({ error: 'universeId, sourceId, targetId, and relationType are required.' });
    }

    const rel = db.insert('relationships', {
      universeId,
      sourceId,
      targetId,
      relationType, // 'ally' | 'rival' | 'family' | 'mentor' | 'nemesis' | 'romantic' | 'complex'
      description: description?.trim() || '',
      strength: Number(strength) || 75,
    });

    res.status(201).json(rel);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create character relationship.' });
  }
});

// Delete relationship
router.delete('/meta/relationships/:id', requireAuth, (req, res) => {
  const deleted = db.delete('relationships', req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Relationship not found.' });
  res.json({ message: 'Relationship removed.' });
});

export default router;
