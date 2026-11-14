import React, { useState } from 'react';
import { X, Sparkles, Wand2, Globe, Check } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CreateUniverseModal({ isOpen, onClose, onCreated }) {
  const { showToast, refreshUniverses, updateCreditsLocally } = useAuth();
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [genre, setGenre] = useState('fantasy');
  const [themeColor, setThemeColor] = useState('#7549E8');
  const [description, setDescription] = useState('');
  const [magicRules, setMagicRules] = useState('');
  const [techLevel, setTechLevel] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const genres = [
    { id: 'fantasy', label: 'Fantasy', color: '#7549E8' },
    { id: 'scifi', label: 'Science Fiction', color: '#20A5D8' },
    { id: 'mythology', label: 'Mythology', color: '#F3A64A' },
    { id: 'dystopian', label: 'Dystopian', color: '#27B887' },
    { id: 'historical', label: 'Historical', color: '#C05621' },
    { id: 'custom', label: 'Custom Universe', color: '#6B46C1' },
  ];

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    try {
      const prompt = name ? `Universe name: ${name}. Genre: ${genre}` : `Genre: ${genre}`;
      const res = await api.generateWorldLore({ prompt, genre });

      if (res.parsed) {
        setTagline(res.parsed.tagline || '');
        setDescription(res.parsed.description || '');
        setMagicRules(res.parsed.magicRules || '');
        setTechLevel(res.parsed.techLevel || '');
        if (!name) setName(`The Chronicles of ${genre.charAt(0).toUpperCase() + genre.slice(1)} Prime`);
      } else if (res.text) {
        setDescription(res.text.slice(0, 500));
      }

      if (res.remainingCredits !== undefined) {
        updateCreditsLocally(res.remainingCredits);
      }
      showToast(`AI World Lore synthesized! (${res.model})`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Universe name is required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await api.createUniverse({
        name,
        tagline,
        genre,
        themeColor,
        description,
        magicRules,
        techLevel,
        isPublic,
      });

      showToast(`Universe "${created.name}" forged!`, 'success');
      await refreshUniverses(created.id);
      if (onCreated) onCreated(created);
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#171727] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-inner">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Universe</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Establish the cosmological laws, cultures, and lore of your realm.</p>
          </div>
        </div>

        {/* AI Quick Generator Prompt Banner */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary-50 to-electric-50 dark:from-primary-950/40 dark:to-electric-950/40 border border-primary-100 dark:border-primary-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Wand2 className="w-5 h-5 text-primary animate-pulse" />
            <div>
              <div className="text-xs font-bold text-gray-900 dark:text-white">Need inspiration?</div>
              <div className="text-[11px] text-gray-600 dark:text-gray-300">Let the AI World Architect draft a lore foundation for you.</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-semibold shadow-glow-primary transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="flex items-center gap-1.5">
                <span className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                Architecting...
              </span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Auto-Architect</span>
              </>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Genre selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Select Genre Paradigm
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {genres.map(g => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => {
                    setGenre(g.id);
                    setThemeColor(g.color);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    genre === g.id
                      ? 'border-primary bg-primary/10 text-primary dark:text-primary-300 font-bold shadow-sm'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                    <span>{g.label}</span>
                  </div>
                  {genre === g.id && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Universe Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Shattered Spire of Val-Khor"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Tagline / Thematic Hook
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Where the twin moons bleed wild aether into mortal earth."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Cosmology & World Lore Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the environment, geography, ancient origins, or ongoing existential conflict..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Magic / Metaphysical System
              </label>
              <input
                type="text"
                value={magicRules}
                onChange={(e) => setMagicRules(e.target.value)}
                placeholder="e.g. Aetheric Resonance; casting demands soul heat"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Technology Paradigm
              </label>
              <input
                type="text"
                value={techLevel}
                onChange={(e) => setTechLevel(e.target.value)}
                placeholder="e.g. Runepunk brass clockwork & skyships"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="isPublic" className="text-xs text-gray-600 dark:text-gray-400">
              Make universe visible in Public Community showcase
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold shadow-glow-primary transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Forging Realm...' : 'Establish Universe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
