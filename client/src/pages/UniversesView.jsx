import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  Search,
  Sparkles,
  Users,
  Compass,
  Feather,
  Clock,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Network,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import CreateUniverseModal from '../components/CreateUniverseModal';

export default function UniversesView({ onNavigate }) {
  const { universes, activeUniverse, selectUniverse, refreshUniverses, showToast } = useAuth();
  const [filterGenre, setFilterGenre] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [graphModalUni, setGraphModalUni] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [loadingGraph, setLoadingGraph] = useState(false);

  const genres = [
    { id: 'all', label: 'All Genres' },
    { id: 'fantasy', label: 'Fantasy' },
    { id: 'scifi', label: 'Sci-Fi' },
    { id: 'mythology', label: 'Mythology' },
    { id: 'dystopian', label: 'Dystopian' },
    { id: 'historical', label: 'Historical' },
  ];

  const filtered = universes.filter(uni => {
    const matchGenre = filterGenre === 'all' || uni.genre?.toLowerCase() === filterGenre.toLowerCase();
    const matchQuery = !searchQuery ||
      uni.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchGenre && matchQuery;
  });

  const handleDelete = async (e, uniId, uniName) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete "${uniName}" and all its linked entities?`)) {
      return;
    }
    try {
      await api.deleteUniverse(uniId);
      showToast(`Universe "${uniName}" deleted.`, 'info');
      await refreshUniverses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenGraph = async (e, uni) => {
    e.stopPropagation();
    setGraphModalUni(uni);
    setLoadingGraph(true);
    try {
      const data = await api.getUniverseGraph(uni.id);
      setGraphData(data);
    } catch (err) {
      showToast('Failed to load universe knowledge graph.', 'error');
    } finally {
      setLoadingGraph(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Globe className="w-7 h-7 text-primary" />
            <span>My Fictional Universes</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your sovereign narrative worlds and their connected canon systems.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-glow-primary transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Establish New Universe</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-3 rounded-2xl">
        {/* Genre Pill Filters */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {genres.map(g => (
            <button
              key={g.id}
              onClick={() => setFilterGenre(g.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterGenre === g.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search universes..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Universes Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center glass-panel rounded-3xl">
          <Globe className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-700 dark:text-gray-300 mb-1">No Universes Found</h3>
          <p className="text-xs text-gray-500 mb-4">Try clearing your search query or establish a brand new universe.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold"
          >
            Create Universe
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(uni => {
            const isActive = activeUniverse?.id === uni.id;
            return (
              <div
                key={uni.id}
                onClick={() => selectUniverse(uni)}
                className={`p-6 rounded-3xl glass-panel relative cursor-pointer transition-all duration-300 hover:scale-[1.01] flex flex-col justify-between ${
                  isActive
                    ? 'ring-2 ring-primary shadow-glow-primary'
                    : 'border border-gray-200 dark:border-gray-800 hover:border-primary/50'
                }`}
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                      {uni.genre}
                    </span>
                    {isActive ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emeraldGreen">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active Context</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-gray-400 hover:text-primary">
                        Click to Activate
                      </span>
                    )}
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 leading-snug">
                    {uni.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                    {uni.tagline || uni.description || 'No tagline recorded.'}
                  </p>

                  {/* Entity Counts Grid */}
                  <div className="grid grid-cols-4 gap-2 py-3 px-2 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 mb-4 text-center">
                    <div>
                      <div className="text-sm font-black text-electric">{uni.counts?.characters ?? 0}</div>
                      <div className="text-[9px] text-gray-400 font-semibold uppercase">Chars</div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-emeraldGreen">{uni.counts?.locations ?? 0}</div>
                      <div className="text-[9px] text-gray-400 font-semibold uppercase">Locs</div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-amberGold">{uni.counts?.timelines ?? 0}</div>
                      <div className="text-[9px] text-gray-400 font-semibold uppercase">Eras</div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-primary">{uni.counts?.stories ?? 0}</div>
                      <div className="text-[9px] text-gray-400 font-semibold uppercase">Stories</div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  <button
                    onClick={(e) => handleOpenGraph(e, uni)}
                    className="flex items-center gap-1.5 text-gray-500 hover:text-primary font-bold text-[11px] transition-colors"
                    title="Inspect Connected Universe Knowledge Graph"
                  >
                    <Network className="w-3.5 h-3.5" />
                    <span>Knowledge Graph</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(e, uni.id, uni.name)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                      title="Delete Universe"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CONNECTED KNOWLEDGE GRAPH MODAL */}
      {graphModalUni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-4xl bg-white dark:bg-[#171727] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                  <Network className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {graphModalUni.name} — Interconnected Knowledge Graph
                  </h3>
                  <p className="text-xs text-gray-500">
                    Live relational map linking characters, locations, events, and universe rules.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGraphModalUni(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                &times;
              </button>
            </div>

            {loadingGraph ? (
              <div className="py-20 text-center text-xs text-gray-400">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                <span>Assembling relational graph nodes...</span>
              </div>
            ) : graphData ? (
              <div className="space-y-6">
                {/* SVG Visual Node Map */}
                <div className="w-full h-80 rounded-2xl bg-gray-950 p-4 border border-white/10 relative overflow-hidden flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 600 300">
                    {/* Render Links */}
                    {graphData.links?.map((link, idx) => {
                      const sNode = graphData.nodes.find(n => n.id === link.source) || { id: link.source };
                      const tNode = graphData.nodes.find(n => n.id === link.target) || { id: link.target };
                      const sIdx = graphData.nodes.indexOf(sNode);
                      const tIdx = graphData.nodes.indexOf(tNode);
                      const x1 = 100 + (sIdx * 65) % 450;
                      const y1 = 70 + (sIdx * 45) % 180;
                      const x2 = 120 + (tIdx * 65) % 450;
                      const y2 = 80 + (tIdx * 45) % 180;

                      return (
                        <g key={idx}>
                          <line
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke="rgba(117, 73, 232, 0.4)"
                            strokeWidth="1.5"
                            strokeDasharray={link.type === 'location_path' ? '4,4' : undefined}
                          />
                        </g>
                      );
                    })}

                    {/* Central Universe Node */}
                    <g transform="translate(300, 150)">
                      <circle r="32" fill="#7549E8" className="node-glow-primary" opacity="0.9" />
                      <text textAnchor="middle" dy="4" fill="#fff" fontSize="10" fontWeight="bold">
                        Canon Core
                      </text>
                    </g>

                    {/* Entity Nodes */}
                    {graphData.nodes?.filter(n => n.type !== 'universe').map((node, i) => {
                      const angle = (i / (graphData.nodes.length - 1 || 1)) * 2 * Math.PI;
                      const radius = 105;
                      const cx = 300 + radius * Math.cos(angle);
                      const cy = 150 + radius * Math.sin(angle);

                      return (
                        <g key={node.id} transform={`translate(${cx}, ${cy})`}>
                          <circle
                            r="18"
                            fill={node.color || '#20A5D8'}
                            stroke="#fff"
                            strokeWidth="1.5"
                            className="cursor-pointer hover:scale-125 transition-transform"
                          />
                          <text textAnchor="middle" dy="28" fill="#e2e8f0" fontSize="9" fontWeight="600">
                            {node.label.length > 12 ? node.label.slice(0, 10) + '..' : node.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Entity legend table */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                    <span className="font-bold text-electric block mb-1">
                      Characters ({graphData.nodes?.filter(n => n.type === 'character').length})
                    </span>
                    <ul className="space-y-1 text-gray-500">
                      {graphData.nodes?.filter(n => n.type === 'character').map(c => (
                        <li key={c.id} className="truncate">&bull; {c.label} ({c.role || 'Member'})</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                    <span className="font-bold text-emeraldGreen block mb-1">
                      Locations ({graphData.nodes?.filter(n => n.type === 'location').length})
                    </span>
                    <ul className="space-y-1 text-gray-500">
                      {graphData.nodes?.filter(n => n.type === 'location').map(l => (
                        <li key={l.id} className="truncate">&bull; {l.label}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
                    <span className="font-bold text-amberGold block mb-1">
                      Historical Events ({graphData.nodes?.filter(n => n.type === 'event').length})
                    </span>
                    <ul className="space-y-1 text-gray-500">
                      {graphData.nodes?.filter(n => n.type === 'event').map(e => (
                        <li key={e.id} className="truncate">&bull; {e.label}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      <CreateUniverseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(uni) => selectUniverse(uni)}
      />
    </div>
  );
}
