import React, { useState, useEffect } from 'react';
import {
  Share2,
  Heart,
  Bookmark,
  Search,
  Globe,
  Feather,
  GitFork,
  Sparkles,
  ExternalLink,
  User,
  Filter,
  Check,
  X,
  Copy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function CommunityView() {
  const { user, showToast } = useAuth();
  const [posts, setPosts] = useState([]);
  const [genre, setGenre] = useState('all');
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [shareModalPost, setShareModalPost] = useState(null);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const data = await api.getCommunityFeed({ genre, type, search });
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, [genre, type, search]);

  const handleLike = async (e, postId) => {
    e.stopPropagation();
    try {
      const res = await api.likePost(postId);
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: res.likes } : p));
      showToast('Liked post!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleBookmark = async (e, postId) => {
    e.stopPropagation();
    try {
      const res = await api.bookmarkPost(postId);
      setPosts(posts.map(p => p.id === postId ? { ...p, bookmarks: res.bookmarks } : p));
      showToast('Saved to your bookmarks!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenCreator = async (e, userId) => {
    e.stopPropagation();
    try {
      const data = await api.getCreatorProfile(userId);
      setSelectedCreator(data);
    } catch (err) {
      showToast('Creator profile not found.', 'error');
    }
  };

  const genres = ['all', 'fantasy', 'scifi', 'mythology', 'dystopian'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Share2 className="w-7 h-7 text-primary" />
            <span>Community & Discovery</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Explore sovereign universes, read creator stories, and play branching narratives.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {genres.map(g => (
            <button
              key={g}
              onClick={() => setGenre(g)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                genre === g
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {g === 'all' ? 'All Genres' : g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs font-semibold text-gray-800 dark:text-gray-200"
          >
            <option value="all">All Content</option>
            <option value="universe">Universes</option>
            <option value="story">Stories</option>
            <option value="branching">Branching Stories</option>
          </select>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lore, tags, creators..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="py-24 text-center text-xs text-gray-400">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
          <span>Discovering creative works...</span>
        </div>
      ) : posts.length === 0 ? (
        <div className="p-16 text-center glass-panel rounded-3xl">
          <Share2 className="w-12 h-12 text-primary mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No Works Found</h3>
          <p className="text-xs text-gray-500">Try adjusting your filters or publish your own universe!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <div
              key={post.id}
              className="p-6 rounded-3xl glass-panel border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Author row */}
                <div
                  onClick={(e) => handleOpenCreator(e, post.userId)}
                  className="flex items-center gap-2.5 mb-3 cursor-pointer group"
                >
                  <img
                    src={post.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={post.authorName}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-primary/30"
                  />
                  <div>
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">
                      {post.authorName}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Type Badge & Title */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-primary/10 text-primary">
                    {post.type}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-gray-400">
                    {post.genre}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 leading-snug">
                  {post.title}
                </h3>

                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed mb-4">
                  {post.summary}
                </p>

                {/* Tags */}
                {(post.tags || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {post.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => handleLike(e, post.id)}
                    className="flex items-center gap-1 hover:text-rose-500 transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{post.likes || 0}</span>
                  </button>
                  <button
                    onClick={(e) => handleBookmark(e, post.id)}
                    className="flex items-center gap-1 hover:text-amber-500 transition-colors"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>{post.bookmarks || 0}</span>
                  </button>
                </div>

                <button
                  onClick={() => setShareModalPost(post)}
                  className="flex items-center gap-1 text-primary hover:underline font-bold text-[11px]"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATOR PROFILE MODAL */}
      {selectedCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#171727] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCreator(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <img
                src={selectedCreator.creator.avatar}
                alt={selectedCreator.creator.name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-primary/20 shadow-md"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedCreator.creator.name}
                </h3>
                <p className="text-xs text-primary font-semibold">
                  {selectedCreator.creator.penName || 'Canon Creator'}
                </p>
                <div className="text-[11px] text-gray-400 mt-1">
                  Plan: <span className="uppercase font-bold text-emerald-500">{selectedCreator.creator.plan}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 mb-6">
              {selectedCreator.creator.bio || 'Worldbuilder exploring interconnected storylines on StoryVerse.'}
            </p>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Published Universes ({selectedCreator.publishedUniverses?.length || 0})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedCreator.publishedUniverses?.map(u => (
                  <div key={u.id} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 text-xs flex items-center justify-between">
                    <span className="font-bold">{u.name}</span>
                    <span className="text-[10px] uppercase font-bold text-primary">{u.genre}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHARE POST MODAL */}
      {shareModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#171727] rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setShareModalPost(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-1">Share Project</h3>
            <p className="text-xs text-gray-500 mb-4">Share "{shareModalPost.title}" with the multiverse</p>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs mb-4">
              <span className="truncate text-gray-500">https://storyverse.ai/lore/{shareModalPost.id}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://storyverse.ai/lore/${shareModalPost.id}`);
                  showToast('Public link copied to clipboard!', 'success');
                  setShareModalPost(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-primary text-white font-bold text-xs flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
