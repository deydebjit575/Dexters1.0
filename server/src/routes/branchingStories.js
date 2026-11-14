import express from 'express';
import { db } from '../db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// List interactive branching stories
router.get('/', optionalAuth, (req, res) => {
  const { universeId } = req.query;
  let list = [];
  if (universeId) {
    list = db.find('branchingStories', b => b.universeId === universeId);
  } else if (req.user) {
    list = db.find('branchingStories', b => b.userId === req.user.id);
  } else {
    list = db.find('branchingStories', b => b.isPublic);
  }

  const enriched = list.map(b => ({
    ...b,
    nodesCount: b.nodes?.length || 0,
    endingsCount: (b.nodes || []).filter(n => !n.choices || n.choices.length === 0).length,
  }));

  res.json(enriched);
});

// Single branching story
router.get('/:id', optionalAuth, (req, res) => {
  const item = db.findById('branchingStories', req.params.id);
  if (!item) return res.status(404).json({ error: 'Interactive story not found.' });
  res.json(item);
});

// Create branching story
router.post('/', requireAuth, (req, res) => {
  try {
    const { universeId, title, synopsis, isPublic, nodes, startNodeId } = req.body;
    if (!universeId || !title) {
      return res.status(400).json({ error: 'Universe ID and title are required.' });
    }

    const defaultNodes = nodes && nodes.length > 0 ? nodes : [
      {
        id: 'node_start',
        title: 'The Crossroads',
        content: 'You stand at the boundary stone between two warring realms. The midnight fog clings to the jagged stones. A sound echoes from the shadowed thicket.',
        choices: [
          { text: 'Draw your blade and investigate the thicket', targetNodeId: 'node_thicket' },
          { text: 'Conceal yourself in the ditch and watch the path', targetNodeId: 'node_stealth' }
        ]
      },
      {
        id: 'node_thicket',
        title: 'Ambush in the Mist',
        content: 'You leap into the thicket, blade ready. A rogue courier falls backward, clutching a sealed scroll emblazoned with royal wax!',
        choices: [
          { text: 'Demand to know who dispatched the scroll', targetNodeId: 'node_parley' },
          { text: 'Seize the scroll and sprint into the darkness', targetNodeId: 'node_escape' }
        ]
      },
      {
        id: 'node_stealth',
        title: 'The Silent Observer',
        content: 'From the tall grass, you observe three riders in black plate armor galloping past, their lances tipped with cold blue sorcery.',
        choices: [
          { text: 'Follow the horse tracks toward the mountain fortress', targetNodeId: 'node_parley' },
          { text: 'Turn back toward the sanctuary to warn the council', targetNodeId: 'node_escape' }
        ]
      },
      {
        id: 'node_parley',
        title: 'The Secret Dispatched (Resolution A)',
        content: 'You uncover a conspiracy that threatens both kingdoms. With this knowledge in hand, the fate of the war rests on your next decision.',
        choices: []
      },
      {
        id: 'node_escape',
        title: 'Fugitive into the Sunrise (Resolution B)',
        content: 'You slip past the perimeter guards as dawn breaks over the mountain range. You are alive, but the realm is already falling into chaos.',
        choices: []
      }
    ];

    const newBranching = db.insert('branchingStories', {
      universeId,
      userId: req.user.id,
      title: title.trim(),
      synopsis: synopsis?.trim() || '',
      isPublic: Boolean(isPublic),
      startNodeId: startNodeId || 'node_start',
      nodes: defaultNodes,
    });

    res.status(201).json(newBranching);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create interactive story.' });
  }
});

// Update branching story (nodes, structure, title)
router.put('/:id', requireAuth, (req, res) => {
  const item = db.findById('branchingStories', req.params.id);
  if (!item) return res.status(404).json({ error: 'Interactive story not found.' });

  const updated = db.update('branchingStories', item.id, req.body);
  res.json(updated);
});

// Delete branching story
router.delete('/:id', requireAuth, (req, res) => {
  const item = db.findById('branchingStories', req.params.id);
  if (!item) return res.status(404).json({ error: 'Interactive story not found.' });

  db.delete('branchingStories', item.id);
  res.json({ message: 'Interactive story deleted.' });
});

export default router;
