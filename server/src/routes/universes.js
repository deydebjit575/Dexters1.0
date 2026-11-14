import express from 'express';
import { db } from '../db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// List universes
router.get('/', optionalAuth, (req, res) => {
  const userId = req.user?.id;
  const { filter } = req.query; // 'my' | 'public' | 'all'

  let list = [];
  if (filter === 'public') {
    list = db.find('universes', u => u.isPublic);
  } else if (userId) {
    list = db.find('universes', u => u.userId === userId || u.isPublic);
  } else {
    list = db.find('universes', u => u.isPublic);
  }

  // Attach quick counts
  const enriched = list.map(uni => {
    const charsCount = db.find('characters', c => c.universeId === uni.id).length;
    const locsCount = db.find('locations', l => l.universeId === uni.id).length;
    const storiesCount = db.find('stories', s => s.universeId === uni.id).length;
    const eventsCount = db.find('timelines', t => t.universeId === uni.id).length;
    return {
      ...uni,
      counts: {
        characters: charsCount,
        locations: locsCount,
        stories: storiesCount,
        timelines: eventsCount,
      }
    };
  });

  res.json(enriched);
});

// Single universe details
router.get('/:id', optionalAuth, (req, res) => {
  const uni = db.findById('universes', req.params.id);
  if (!uni) return res.status(404).json({ error: 'Universe not found.' });

  const charsCount = db.find('characters', c => c.universeId === uni.id).length;
  const locsCount = db.find('locations', l => l.universeId === uni.id).length;
  const storiesCount = db.find('stories', s => s.universeId === uni.id).length;
  const eventsCount = db.find('timelines', t => t.universeId === uni.id).length;

  res.json({
    ...uni,
    counts: {
      characters: charsCount,
      locations: locsCount,
      stories: storiesCount,
      timelines: eventsCount,
    }
  });
});

// Interconnected Graph representation for the Connected Universe Engine
router.get('/:id/graph', optionalAuth, (req, res) => {
  const uniId = req.params.id;
  const universe = db.findById('universes', uniId);
  if (!universe) return res.status(404).json({ error: 'Universe not found.' });

  const characters = db.find('characters', c => c.universeId === uniId);
  const locations = db.find('locations', l => l.universeId === uniId);
  const timelines = db.find('timelines', t => t.universeId === uniId);
  const relationships = db.find('relationships', r => r.universeId === uniId);

  // Build nodes
  const nodes = [
    { id: universe.id, label: universe.name, type: 'universe', color: '#7549E8', size: 30 },
    ...characters.map(c => ({ id: c.id, label: c.name, type: 'character', color: '#20A5D8', role: c.role, avatar: c.avatar, size: 22 })),
    ...locations.map(l => ({ id: l.id, label: l.name, type: 'location', color: '#27B887', locType: l.type, size: 20 })),
    ...timelines.map(t => ({ id: t.id, label: t.title, type: 'event', color: '#F3A64A', era: t.era, size: 16 })),
  ];

  // Build edges
  const links = [];

  // Characters to universe
  characters.forEach(c => {
    links.push({ source: universe.id, target: c.id, label: 'inhabits', type: 'universe_member' });
  });

  // Locations to universe
  locations.forEach(l => {
    links.push({ source: universe.id, target: l.id, label: 'contains', type: 'universe_location' });
  });

  // Inter-character relationships
  relationships.forEach(r => {
    links.push({
      source: r.sourceId,
      target: r.targetId,
      label: r.relationType,
      description: r.description,
      type: 'character_relation',
    });
  });

  // Location connections
  locations.forEach(l => {
    (l.connections || []).forEach(targetLocId => {
      links.push({
        source: l.id,
        target: targetLocId,
        label: 'route',
        type: 'location_path',
      });
    });
  });

  // Event connections to characters and locations
  timelines.forEach(t => {
    (t.relatedCharacterIds || []).forEach(cId => {
      links.push({ source: t.id, target: cId, label: 'participated in', type: 'event_character' });
    });
    (t.relatedLocationIds || []).forEach(lId => {
      links.push({ source: t.id, target: lId, label: 'occurred at', type: 'event_location' });
    });
  });

  res.json({ nodes, links });
});

// Create Universe
router.post('/', requireAuth, (req, res) => {
  try {
    const { name, tagline, genre, themeColor, description, magicRules, techLevel, cosmology, factions, isPublic } = req.body;
    if (!name) return res.status(400).json({ error: 'Universe name is required.' });

    // Enforce tier limit for Free Plan
    const userUniverses = db.find('universes', u => u.userId === req.user.id);
    if (req.user.plan === 'explorer' && userUniverses.length >= 3) {
      return res.status(403).json({
        error: 'Free Explorer plan is limited to 3 universes. Upgrade to Creator plan for unlimited universes.'
      });
    }

    const newUniverse = db.insert('universes', {
      userId: req.user.id,
      name: name.trim(),
      tagline: tagline?.trim() || '',
      genre: genre || 'fantasy',
      themeColor: themeColor || '#7549E8',
      description: description?.trim() || '',
      magicRules: magicRules?.trim() || '',
      techLevel: techLevel?.trim() || '',
      cosmology: cosmology?.trim() || '',
      factions: factions || [],
      isPublic: Boolean(isPublic),
      likes: 0,
      views: 0,
    });

    res.status(201).json(newUniverse);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create universe.' });
  }
});

// Update Universe
router.put('/:id', requireAuth, (req, res) => {
  const uni = db.findById('universes', req.params.id);
  if (!uni) return res.status(404).json({ error: 'Universe not found.' });
  if (uni.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized to edit this universe.' });

  const updated = db.update('universes', uni.id, req.body);
  res.json(updated);
});

// Delete Universe
router.delete('/:id', requireAuth, (req, res) => {
  const uni = db.findById('universes', req.params.id);
  if (!uni) return res.status(404).json({ error: 'Universe not found.' });
  if (uni.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized to delete this universe.' });

  const uniId = uni.id;
  db.delete('universes', uniId);

  // Cascade cleanup for linked entities
  ['characters', 'locations', 'relationships', 'timelines', 'stories', 'chapters', 'dialogues', 'branchingStories'].forEach(col => {
    db.data[col] = db.data[col].filter(item => item.universeId !== uniId);
  });
  db.save();

  res.json({ message: 'Universe and linked entities deleted successfully.' });
});

export default router;
