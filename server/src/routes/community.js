import express from 'express';
import { db } from '../db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Explore community feed
router.get('/feed', optionalAuth, (req, res) => {
  const { genre, type, search } = req.query;

  let posts = [...db.data.communityPosts];

  if (genre && genre !== 'all') {
    posts = posts.filter(p => p.genre?.toLowerCase() === genre.toLowerCase());
  }

  if (type && type !== 'all') {
    posts = posts.filter(p => p.type === type);
  }

  if (search) {
    const q = search.toLowerCase();
    posts = posts.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.summary?.toLowerCase().includes(q) ||
      p.authorName?.toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(posts);
});

// Like / Upvote post
router.post('/posts/:id/like', requireAuth, (req, res) => {
  const post = db.findById('communityPosts', req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });

  const updated = db.update('communityPosts', post.id, { likes: (post.likes || 0) + 1 });
  res.json({ likes: updated.likes });
});

// Bookmark post
router.post('/posts/:id/bookmark', requireAuth, (req, res) => {
  const post = db.findById('communityPosts', req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found.' });

  const updated = db.update('communityPosts', post.id, { bookmarks: (post.bookmarks || 0) + 1 });
  res.json({ bookmarks: updated.bookmarks });
});

// Publish project to community
router.post('/publish', requireAuth, (req, res) => {
  try {
    const { type, itemId, title, summary, genre, tags } = req.body;
    if (!type || !itemId || !title) {
      return res.status(400).json({ error: 'Type, itemId, and title are required.' });
    }

    const user = db.findById('users', req.user.id);

    // Mark entity as public
    if (type === 'universe') db.update('universes', itemId, { isPublic: true });
    if (type === 'story') db.update('stories', itemId, { isPublic: true });
    if (type === 'branching') db.update('branchingStories', itemId, { isPublic: true });

    const newPost = db.insert('communityPosts', {
      userId: user.id,
      authorName: user.penName || user.name,
      authorAvatar: user.avatar,
      type,
      itemId,
      title: title.trim(),
      summary: summary?.trim() || '',
      genre: genre || 'fantasy',
      likes: 1,
      bookmarks: 0,
      views: 1,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : ['StoryVerse']),
    });

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish to community.' });
  }
});

// Public creator profile
router.get('/creators/:userId', optionalAuth, (req, res) => {
  const user = db.findById('users', req.params.userId);
  if (!user) return res.status(404).json({ error: 'Creator not found.' });

  const { passwordHash: _, apiKey: __, ...safeUser } = user;
  const publicUniverses = db.find('universes', u => u.userId === user.id && u.isPublic);
  const publicStories = db.find('stories', s => s.userId === user.id && s.isPublic);
  const posts = db.find('communityPosts', p => p.userId === user.id);

  res.json({
    creator: safeUser,
    publishedUniverses: publicUniverses,
    publishedStories: publicStories,
    posts,
  });
});

export default router;
