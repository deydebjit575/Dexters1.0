import express from 'express';
import { db } from '../db.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Export story in different formats
router.get('/story/:id', optionalAuth, (req, res) => {
  const { format = 'markdown' } = req.query;
  const story = db.findById('stories', req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found.' });

  const universe = db.findById('universes', story.universeId);
  const chapters = db.find('chapters', c => c.storyId === story.id)
    .sort((a, b) => a.chapterNumber - b.chapterNumber);

  const author = db.findById('users', story.userId);
  const authorName = author?.penName || author?.name || 'Anonymous Author';

  if (format === 'markdown') {
    let md = `# ${story.title}\n\n`;
    md += `**Author:** ${authorName}\n`;
    md += `**Universe:** ${universe?.name || 'StoryVerse'}\n`;
    md += `**Genre:** ${story.genre} | **Tone:** ${story.tone}\n\n`;
    md += `### Synopsis\n${story.synopsis}\n\n---\n\n`;

    chapters.forEach(ch => {
      md += `## Chapter ${ch.chapterNumber}: ${ch.title}\n\n`;
      md += `${ch.content}\n\n---\n\n`;
    });

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(story.title)}.md"`);
    return res.send(md);
  }

  if (format === 'docx' || format === 'html') {
    // Generate styled HTML document compatible with MS Word (.doc) and print-to-PDF
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${story.title}</title>
  <style>
    body { font-family: 'Georgia', serif; line-height: 1.8; color: #1a1a2e; margin: 40px auto; max-width: 800px; padding: 20px; }
    h1 { font-family: 'Cinzel', serif; font-size: 32px; color: #7549E8; text-align: center; margin-bottom: 8px; }
    .meta { text-align: center; font-style: italic; color: #666; margin-bottom: 40px; }
    .synopsis { background: #f4f0fd; border-left: 4px solid #7549E8; padding: 16px; margin: 30px 0; border-radius: 4px; }
    h2 { font-size: 24px; color: #202033; margin-top: 50px; border-bottom: 1px solid #e2e2ec; padding-bottom: 8px; page-break-before: always; }
    p { margin-bottom: 18px; text-indent: 2em; }
    p:first-of-type { text-indent: 0; }
  </style>
</head>
<body>
  <h1>${story.title}</h1>
  <div class="meta">Written by ${authorName} &bull; Universe: ${universe?.name || 'StoryVerse'} &bull; ${story.genre.toUpperCase()}</div>
  <div class="synopsis"><strong>Synopsis:</strong> ${story.synopsis}</div>
`;

    chapters.forEach(ch => {
      html += `<h2>Chapter ${ch.chapterNumber}: ${ch.title}</h2>\n`;
      const paragraphs = ch.content.split(/\n\n+/).filter(Boolean);
      paragraphs.forEach(p => {
        html += `<p>${p.replace(/\n/g, '<br/>')}</p>\n`;
      });
    });

    html += `</body></html>`;

    if (format === 'docx') {
      res.setHeader('Content-Type', 'application/msword; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(story.title)}.doc"`);
    } else {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
    return res.send(html);
  }

  // Fallback JSON archive
  res.json({
    story,
    universe,
    author: authorName,
    chapters,
    exportedAt: new Date().toISOString(),
  });
});

export default router;
