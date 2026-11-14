import React, { useState, useEffect } from 'react';
import {
  Globe,
  Users,
  Feather,
  Zap,
  Plus,
  ArrowRight,
  Compass,
  MessageSquare,
  Clock,
  GitFork,
  Sparkles,
  BookOpen,
  Share2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import CreateUniverseModal from '../components/CreateUniverseModal';

export default function DashboardOverview({ onNavigate }) {
  const { user, activeUniverse, universes, selectUniverse } = useAuth();
  const [stats, setStats] = useState({ universesCount: 0, charactersCount: 0, storiesCount: 0 });
  const [recentStories, setRecentStories] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const meRes = await api.getMe();
        if (meRes.stats) setStats(meRes.stats);

        const storiesRes = await api.getStories();
        setRecentStories(storiesRes.slice(0, 4));

        const logsRes = await api.getAiHistory();
        setRecentLogs(logsRes.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  const creditPercentage = Math.min(100, Math.round(((user?.credits ?? 0) / (user?.maxCredits || 150)) * 100));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-primary via-primary-700 to-electric text-white shadow-premium-lg relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[11px] font-bold tracking-wider uppercase mb-3 text-white/90">
              <Sparkles className="w-3.5 h-3.5" />
              <span>StoryVerse Central Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Welcome back, {user?.name || 'Creator'}!
            </h1>
            <p className="text-sm text-white/80 leading-relaxed">
              Your connected universe engine is primed. Dive into your characters, write new chapters, or expand your world geography.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-primary font-bold text-xs shadow-lg hover:bg-gray-50 hover:scale-[1.02] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Universe</span>
            </button>
            <button
              onClick={() => onNavigate('story-studio')}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs backdrop-blur-sm transition-all"
            >
              <Feather className="w-4 h-4" />
              <span>Open Story Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* METRIC STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Universes Card */}
        <div
          onClick={() => onNavigate('universes')}
          className="p-6 rounded-3xl glass-panel hover:border-primary/40 hover:shadow-glow-primary transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
              &rarr;
            </span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
            {stats.universesCount}
          </div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Total Universes
          </div>
        </div>

        {/* Characters Card */}
        <div
          onClick={() => onNavigate('characters')}
          className="p-6 rounded-3xl glass-panel hover:border-electric/40 hover:shadow-glow-electric transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-electric/10 text-electric flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-electric group-hover:translate-x-1 transition-transform">
              &rarr;
            </span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
            {stats.charactersCount}
          </div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Total Characters
          </div>
        </div>

        {/* Stories Card */}
        <div
          onClick={() => onNavigate('story-studio')}
          className="p-6 rounded-3xl glass-panel hover:border-amberGold/40 hover:shadow-glow-amber transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-amberGold/10 text-amberGold flex items-center justify-center group-hover:scale-110 transition-transform">
              <Feather className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-amberGold group-hover:translate-x-1 transition-transform">
              &rarr;
            </span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
            {stats.storiesCount}
          </div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Stories & Epics
          </div>
        </div>

        {/* AI Usage / Credits Card */}
        <div
          onClick={() => onNavigate('subscription')}
          className="p-6 rounded-3xl glass-panel hover:border-emeraldGreen/40 hover:shadow-glow-emerald transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emeraldGreen/10 text-emeraldGreen flex items-center justify-center group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emeraldGreen/15 text-emeraldGreen">
              {user?.plan || 'Free'}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {user?.credits ?? 0}
            </span>
            <span className="text-xs font-semibold text-gray-400">
              / {user?.maxCredits ?? 150}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emeraldGreen h-full rounded-full transition-all duration-500"
              style={{ width: `${creditPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* ACTIVE UNIVERSE SPOTLIGHT */}
      {activeUniverse && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-primary/25 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 dark:border-gray-800 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold text-primary dark:text-primary-300 uppercase tracking-wider">
                  Active Universe Spotlight
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-primary/10 text-primary">
                  {activeUniverse.genre}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {activeUniverse.name}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activeUniverse.tagline || 'Connected lore engine active for this realm.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('world-builder')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-electric" />
                <span>World Map</span>
              </button>
              <button
                onClick={() => onNavigate('characters')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-all flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-amberGold" />
                <span>Characters</span>
              </button>
              <button
                onClick={() => onNavigate('story-studio')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white shadow-glow-primary hover:bg-primary-600 transition-all flex items-center gap-1.5"
              >
                <Feather className="w-3.5 h-3.5" />
                <span>Write Story</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span>Cosmology & Factions</span>
              </h4>
              <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                {activeUniverse.description || 'No description established.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amberGold" />
                <span>Magic & Metaphysics</span>
              </h4>
              <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                {activeUniverse.magicRules || 'Standard elemental or scientific laws.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emeraldGreen" />
                <span>Canon Synchronicity</span>
              </h4>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Interconnected</span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Zero contradictions detected across active characters and timeline eras.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* QUICK WORKSPACE LAUNCHPADS */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
          Quick Creative Workspaces
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate('characters')}
            className="p-4 rounded-2xl glass-panel hover:border-electric/50 text-center hover:scale-[1.02] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-electric/10 text-electric flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Spawn Character</div>
            <div className="text-[10px] text-gray-400">Bio & Relations</div>
          </button>

          <button
            onClick={() => onNavigate('world-builder')}
            className="p-4 rounded-2xl glass-panel hover:border-primary/50 text-center hover:scale-[1.02] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Plot Location</div>
            <div className="text-[10px] text-gray-400">Map & Politics</div>
          </button>

          <button
            onClick={() => onNavigate('dialogues')}
            className="p-4 rounded-2xl glass-panel hover:border-amberGold/50 text-center hover:scale-[1.02] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amberGold/10 text-amberGold flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Simulate Dialogue</div>
            <div className="text-[10px] text-gray-400">Character Script</div>
          </button>

          <button
            onClick={() => onNavigate('timelines')}
            className="p-4 rounded-2xl glass-panel hover:border-emeraldGreen/50 text-center hover:scale-[1.02] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-emeraldGreen/10 text-emeraldGreen flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Timeline Era</div>
            <div className="text-[10px] text-gray-400">Chronology</div>
          </button>

          <button
            onClick={() => onNavigate('branching')}
            className="p-4 rounded-2xl glass-panel hover:border-electric/50 text-center hover:scale-[1.02] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-electric/10 text-electric flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <GitFork className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Branching Choice</div>
            <div className="text-[10px] text-gray-400">Decision Nodes</div>
          </button>

          <button
            onClick={() => onNavigate('community')}
            className="p-4 rounded-2xl glass-panel hover:border-primary/50 text-center hover:scale-[1.02] transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Share2 className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Community</div>
            <div className="text-[10px] text-gray-400">Discover Lore</div>
          </button>
        </div>
      </div>

      {/* TWO COLUMN SECTION: RECENT PROJECTS & CREATIVE ACTIVITY LOG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Stories & Drafts */}
        <div className="p-6 rounded-3xl glass-panel border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>Recent Stories & Drafts</span>
            </h3>
            <button
              onClick={() => onNavigate('story-studio')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentStories.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
              No stories created yet. Start your first epic in the AI Story Studio!
            </div>
          ) : (
            <div className="space-y-3">
              {recentStories.map((story) => (
                <div
                  key={story.id}
                  onClick={() => onNavigate('story-studio')}
                  className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 hover:bg-primary/5 dark:hover:bg-primary/10 border border-gray-100 dark:border-gray-800 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">{story.title}</h4>
                    <p className="text-[11px] text-gray-500 line-clamp-1">{story.synopsis || 'No synopsis added.'}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
                      {story.genre}
                    </span>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {story.totalWordCount || 0} words
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent AI Creative Activity */}
        <div className="p-6 rounded-3xl glass-panel border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amberGold" />
              <span>Recent Creative Activity</span>
            </h3>
            <button
              onClick={() => onNavigate('settings')}
              className="text-xs font-bold text-primary hover:underline"
            >
              Usage Log
            </button>
          </div>

          {recentLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
              Your AI generation log is clear. Generate your first character or chapter!
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs"
                >
                  <div className="max-w-[70%]">
                    <div className="font-bold text-gray-800 dark:text-gray-200">{log.actionType}</div>
                    <div className="text-[11px] text-gray-400 truncate">{log.promptPreview}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-extrabold text-primary">-{log.creditsDeducted} cr</span>
                    <div className="text-[10px] text-gray-400">{new Date(log.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateUniverseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(uni) => selectUniverse(uni)}
      />
    </div>
  );
}
