import express from 'express';
import { db } from '../db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// List locations
router.get('/', optionalAuth, (req, res) => {
  const { universeId } = req.query;
  if (!universeId) {
    const list = req.user ? db.find('locations', l => l.userId === req.user.id) : [];
    return res.json(list);
  }
  const list = db.find('locations', l => l.universeId === universeId);
  res.json(list);
});

// Single location
router.get('/:id', optionalAuth, (req, res) => {
  const loc = db.findById('locations', req.params.id);
  if (!loc) return res.status(404).json({ error: 'Location not found.' });
  res.json(loc);
});

// Create location
router.post('/', requireAuth, (req, res) => {
  try {
    const {
      universeId,
      name,
      type,
      coordinates,
      description,
      climate,
      politicalSystem,
      culture,
      defense,
      connections
    } = req.body;

    if (!universeId || !name) {
      return res.status(400).json({ error: 'Universe ID and location name are required.' });
    }

    const universe = db.findById('universes', universeId);
    if (!universe) return res.status(404).json({ error: 'Associated universe not found.' });

    // Existing locations count to place default coords if not provided
    const existing = db.find('locations', l => l.universeId === universeId);
    const defaultCoords = coordinates || {
      x: 150 + (existing.length % 4) * 200,
      y: 120 + Math.floor(existing.length / 4) * 160
    };

    const newLoc = db.insert('locations', {
      universeId,
      userId: req.user.id,
      name: name.trim(),
      type: type || 'kingdom', // 'kingdom' | 'city' | 'planet' | 'ruins' | 'sanctuary' | 'realm'
      coordinates: defaultCoords,
      description: description?.trim() || '',
      climate: climate?.trim() || '',
      politicalSystem: politicalSystem?.trim() || '',
      culture: culture?.trim() || '',
      defense: defense?.trim() || '',
      connections: Array.isArray(connections) ? connections : [],
    });

    res.status(201).json(newLoc);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create location.' });
  }
});

// Update location
router.put('/:id', requireAuth, (req, res) => {
  const loc = db.findById('locations', req.params.id);
  if (!loc) return res.status(404).json({ error: 'Location not found.' });

  const updated = db.update('locations', loc.id, req.body);
  res.json(updated);
});

// Connect two locations
router.post('/connect', requireAuth, (req, res) => {
  const { sourceLocationId, targetLocationId } = req.body;
  if (!sourceLocationId || !targetLocationId) {
    return res.status(400).json({ error: 'Both sourceLocationId and targetLocationId are required.' });
  }

  const sLoc = db.findById('locations', sourceLocationId);
  const tLoc = db.findById('locations', targetLocationId);
  if (!sLoc || !tLoc) return res.status(404).json({ error: 'Location(s) not found.' });

  const sConns = new Set(sLoc.connections || []);
  sConns.add(targetLocationId);
  db.update('locations', sLoc.id, { connections: Array.from(sConns) });

  const tConns = new Set(tLoc.connections || []);
  tConns.add(sourceLocationId);
  db.update('locations', tLoc.id, { connections: Array.from(tConns) });

  res.json({ message: 'Locations connected successfully.', source: sLoc, target: tLoc });
});

// Delete location
router.delete('/:id', requireAuth, (req, res) => {
  const loc = db.findById('locations', req.params.id);
  if (!loc) return res.status(404).json({ error: 'Location not found.' });

  const locId = loc.id;
  db.delete('locations', locId);

  // Remove connections from other locations
  db.data.locations.forEach(l => {
    if (l.connections && l.connections.includes(locId)) {
      l.connections = l.connections.filter(id => id !== locId);
    }
  });
  db.save();

  res.json({ message: 'Location deleted successfully.' });
});

export default router;
