import React, { useState, useEffect } from 'react';
import {
  Clock,
  Plus,
  Sparkles,
  AlertTriangle,
  Calendar,
  Users,
  MapPin,
  Trash2,
  CheckCircle2,
  Filter,
  X,
  Wand2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function TimelineManagerView() {
  const { activeUniverse, showToast, updateCreditsLocally } = useAuth();
  const [events, setEvents] = useState([]);
  const [universeCharacters, setUniverseCharacters] = useState([]);
  const [universeLocations, setUniverseLocations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterEra, setFilterEra] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [era, setEra] = useState('Current Era');
  const [orderYear, setOrderYear] = useState(0);
  const [yearDisplay, setYearDisplay] = useState('');
  const [description, setDescription] = useState('');
  const [significance, setSignificance] = useState('');
  const [selectedCharIds, setSelectedCharIds] = useState([]);
  const [selectedLocIds, setSelectedLocIds] = useState([]);

  const loadData = async () => {
    if (!activeUniverse) return;
    try {
      const eList = await api.getTimelines(activeUniverse.id);
      setEvents(eList);

      const chars = await api.getCharacters(activeUniverse.id);
      setUniverseCharacters(chars);

      const locs = await api.getLocations(activeUniverse.id);
      setUniverseLocations(locs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeUniverse) loadData();
  }, [activeUniverse]);

  const eras = ['all', ...Array.from(new Set(events.map(e => e.era).filter(Boolean)))];

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Event title is required.', 'error');
      return;
    }

    try {
      const created = await api.createTimeline({
        universeId: activeUniverse.id,
        title: title.trim(),
        era,
        orderYear: Number(orderYear),
        yearDisplay: yearDisplay || `${orderYear} AE`,
        description,
        significance,
        relatedCharacterIds: selectedCharIds,
        relatedLocationIds: selectedLocIds,
      });

      const updated = [...events, created].sort((a, b) => (a.orderYear || 0) - (b.orderYear || 0));
      setEvents(updated);
      setShowAddModal(false);
      resetForm();
      showToast('Historical event recorded in timeline!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const resetForm = () => {
    setTitle('');
    setEra('Current Era');
    setOrderYear(0);
    setYearDisplay('');
    setDescription('');
    setSignificance('');
    setSelectedCharIds([]);
    setSelectedLocIds([]);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this historical event from canon?')) return;
    try {
      await api.deleteTimeline(id);
      setEvents(events.filter(e => e.id !== id));
      showToast('Event removed.', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAIGenerateTimeline = async () => {
    if (!activeUniverse) return;
    setIsGenerating(true);
    try {
      const res = await api.brainstorm({
        prompt: `Generate 3 major historical turning points for ${activeUniverse.name} in chronological order`,
        category: 'Timeline Generation',
        universeId: activeUniverse.id,
      });

      if (res.ideas && res.ideas.length > 0) {
        // Create generated events in sequence
        const newEvents = [];
        for (let i = 0; i < res.ideas.length; i++) {
          const item = res.ideas[i];
          const year = (events.length + i + 1) * 100;
          const created = await api.createTimeline({
            universeId: activeUniverse.id,
            title: item.headline,
            era: 'Mythic Era',
            orderYear: year,
            yearDisplay: `Year ${year} of the Sundering`,
            description: item.concept,
            significance: 'Synthesized by AI Timeline Strategist',
            relatedCharacterIds: universeCharacters.slice(0, 1).map(c => c.id),
            relatedLocationIds: universeLocations.slice(0, 1).map(l => l.id),
          });
          newEvents.push(created);
        }

        const updated = [...events, ...newEvents].sort((a, b) => (a.orderYear || 0) - (b.orderYear || 0));
        setEvents(updated);
      }

      if (res.remainingCredits !== undefined) updateCreditsLocally(res.remainingCredits);
      showToast('Timeline milestones generated and synchronized!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredEvents = filterEra === 'all'
    ? events
    : events.filter(e => e.era?.toLowerCase() === filterEra.toLowerCase());

  if (!activeUniverse) {
    return (
      <div className="p-12 text-center glass-panel rounded-3xl">
        <Clock className="w-12 h-12 text-primary mx-auto mb-3" />
        <h2 className="text-xl font-bold">Please Select an Active Universe</h2>
        <p className="text-xs text-gray-500 mt-1">
          Select or establish a universe to manage its historical chronology.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
              <Clock className="w-7 h-7 text-primary" />
              <span>Timeline Manager</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
              {activeUniverse.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Organize historical epochs, cataclysms, and detect temporal inconsistencies.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleAIGenerateTimeline}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/30 text-primary dark:text-primary-300 font-bold text-xs hover:bg-primary/10 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>{isGenerating ? 'Synthesizing...' : 'AI Timeline Generator'}</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-glow-primary transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Era Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="text-xs font-bold text-gray-500 uppercase mr-1">Filter Era:</span>
        {eras.map(e => (
          <button
            key={e}
            onClick={() => setFilterEra(e)}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterEra === e
                ? 'bg-primary text-white shadow-sm'
                : 'glass-panel text-gray-600 dark:text-gray-300 hover:bg-gray-100'
            }`}
          >
            {e === 'all' ? 'All Eras' : e}
          </button>
        ))}
      </div>

      {/* Chronological Timeline Stream */}
      {filteredEvents.length === 0 ? (
        <div className="p-16 text-center glass-panel rounded-3xl">
          <Calendar className="w-12 h-12 text-primary mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No Historical Events Recorded</h3>
          <p className="text-xs text-gray-500 mb-6">Record major wars, celestial alignments, or let the AI draft eras.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-glow-primary"
          >
            Record First Event
          </button>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-10 space-y-8 before:absolute before:left-3 sm:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-electric before:to-amberGold">
          {filteredEvents.map((evt, idx) => (
            <div key={evt.id} className="relative group animate-fade-in">
              {/* Timeline Bullet Node */}
              <div className="absolute -left-6 sm:-left-10 top-4 w-6 h-6 rounded-full bg-white dark:bg-darkCard border-4 border-primary flex items-center justify-center shadow-md group-hover:scale-125 transition-transform">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>

              {/* Event Card */}
              <div className="glass-panel p-6 rounded-3xl border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                      {evt.era}
                    </span>
                    <span className="text-xs font-mono font-bold text-electric">
                      {evt.yearDisplay || `${evt.orderYear} AE`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {evt.conflictWarning ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Continuity Warning</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emeraldGreen">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Canon Aligned</span>
                      </span>
                    )}
                    <button
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="text-gray-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {evt.title}
                </h3>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {evt.description}
                </p>

                {evt.significance && (
                  <div className="text-xs text-primary dark:text-primary-300 bg-primary/5 dark:bg-primary-950/30 p-2.5 rounded-xl border border-primary/15 mb-4">
                    <strong>Significance:</strong> {evt.significance}
                  </div>
                )}

                {/* Linked Entities Pills */}
                <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-xs">
                  {/* Related Characters */}
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-electric" />
                    <span className="text-gray-400 text-[11px]">Witnesses:</span>
                    {(evt.relatedCharacterIds || []).length > 0 ? (
                      (evt.relatedCharacterIds || []).map(id => {
                        const c = universeCharacters.find(ch => ch.id === id);
                        return (
                          <span key={id} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {c?.name || 'Character'}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-gray-400 text-[11px]">None tagged</span>
                    )}
                  </div>

                  {/* Related Locations */}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emeraldGreen" />
                    <span className="text-gray-400 text-[11px]">Location:</span>
                    {(evt.relatedLocationIds || []).length > 0 ? (
                      (evt.relatedLocationIds || []).map(id => {
                        const l = universeLocations.find(loc => loc.id === id);
                        return (
                          <span key={id} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            {l?.name || 'Location'}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-gray-400 text-[11px]">Universal</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD HISTORICAL EVENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#171727] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Add Historical Event</h3>
            <p className="text-xs text-gray-500 mb-6">Anchor an event in {activeUniverse.name}'s chronology</p>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Great Celestial Sundering"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Era / Age
                  </label>
                  <input
                    type="text"
                    value={era}
                    onChange={(e) => setEra(e.target.value)}
                    placeholder="e.g. Age of Fractures"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Numerical Year (For Sorting)
                  </label>
                  <input
                    type="number"
                    value={orderYear}
                    onChange={(e) => setOrderYear(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Display Label
                  </label>
                  <input
                    type="text"
                    value={yearDisplay}
                    onChange={(e) => setYearDisplay(e.target.value)}
                    placeholder="e.g. 3000 BS"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description of the Event
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail what occurred, factions involved, and immediate aftermath..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Historical Significance / Canon Impact
                </label>
                <input
                  type="text"
                  value={significance}
                  onChange={(e) => setSignificance(e.target.value)}
                  placeholder="e.g. Origin of wild aether magic; created the Vitreous Blight"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-glow-primary"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
