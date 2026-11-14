import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  MapPin,
  Sparkles,
  Wand2,
  Globe,
  Shield,
  Layers,
  Link as LinkIcon,
  Trash2,
  Edit2,
  Check,
  X,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function WorldBuilderView() {
  const { activeUniverse, showToast, updateCreditsLocally } = useAuth();
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeTab, setActiveTab] = useState('map'); // 'map' | 'list' | 'rules'
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectSource, setConnectSource] = useState(null);

  // Universe edit state
  const [magicRules, setMagicRules] = useState('');
  const [techLevel, setTechLevel] = useState('');
  const [cosmology, setCosmology] = useState('');
  const [savingRules, setSavingRules] = useState(false);

  // New location form state
  const [locName, setLocName] = useState('');
  const [locType, setLocType] = useState('kingdom');
  const [locDesc, setLocDesc] = useState('');
  const [locClimate, setLocClimate] = useState('');
  const [locPolitics, setLocPolitics] = useState('');
  const [locCulture, setLocCulture] = useState('');
  const [locDefense, setLocDefense] = useState('');
  const [locCoords, setLocCoords] = useState({ x: 300, y: 150 });

  const loadLocations = async () => {
    if (!activeUniverse) return;
    try {
      setLoading(true);
      const data = await api.getLocations(activeUniverse.id);
      setLocations(data);
      if (data.length > 0 && !selectedLocation) {
        setSelectedLocation(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeUniverse) {
      setMagicRules(activeUniverse.magicRules || '');
      setTechLevel(activeUniverse.techLevel || '');
      setCosmology(activeUniverse.cosmology || '');
      loadLocations();
    }
  }, [activeUniverse]);

  const handleSaveWorldRules = async (e) => {
    e.preventDefault();
    if (!activeUniverse) return;
    setSavingRules(true);
    try {
      await api.updateUniverse(activeUniverse.id, {
        magicRules,
        techLevel,
        cosmology,
      });
      activeUniverse.magicRules = magicRules;
      activeUniverse.techLevel = techLevel;
      activeUniverse.cosmology = cosmology;
      showToast('World rules and cosmological laws updated.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingRules(false);
    }
  };

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    if (!locName.trim()) {
      showToast('Location name is required.', 'error');
      return;
    }

    try {
      const created = await api.createLocation({
        universeId: activeUniverse.id,
        name: locName.trim(),
        type: locType,
        description: locDesc,
        climate: locClimate,
        politicalSystem: locPolitics,
        culture: locCulture,
        defense: locDefense,
        coordinates: locCoords,
      });

      setLocations([...locations, created]);
      setSelectedLocation(created);
      setShowAddModal(false);
      resetLocForm();
      showToast(`Location "${created.name}" plotted on map!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const resetLocForm = () => {
    setLocName('');
    setLocType('kingdom');
    setLocDesc('');
    setLocClimate('');
    setLocPolitics('');
    setLocCulture('');
    setLocDefense('');
    setLocCoords({
      x: 100 + Math.floor(Math.random() * 500),
      y: 80 + Math.floor(Math.random() * 220),
    });
  };

  const handleDeleteLocation = async (id, name) => {
    if (!window.confirm(`Delete location "${name}"?`)) return;
    try {
      await api.deleteLocation(id);
      const remaining = locations.filter(l => l.id !== id);
      setLocations(remaining);
      if (selectedLocation?.id === id) setSelectedLocation(remaining[0] || null);
      showToast(`Location "${name}" removed.`, 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleConnectLocations = async (targetId) => {
    if (!connectSource || connectSource === targetId) {
      setConnectSource(targetId);
      showToast('Select a second location to establish route/leyline.', 'info');
      return;
    }

    try {
      await api.connectLocations({
        sourceLocationId: connectSource,
        targetLocationId: targetId,
      });
      showToast('Route established between locations!', 'success');
      setConnectSource(null);
      await loadLocations();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleMapCanvasClick = (e) => {
    // Allows user to click on canvas to set coordinates for new location
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 700);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 400);
    setLocCoords({ x, y });
  };

  if (!activeUniverse) {
    return (
      <div className="p-12 text-center glass-panel rounded-3xl">
        <Compass className="w-12 h-12 text-primary mx-auto mb-3" />
        <h2 className="text-xl font-bold">Please Select an Active Universe</h2>
        <p className="text-xs text-gray-500 mt-1">
          Select or establish a universe to design its geography, kingdoms, and magic systems.
        </p>
      </div>
    );
  }

  const typeColors = {
    kingdom: '#7549E8',
    city: '#20A5D8',
    planet: '#F3A64A',
    ruins: '#E53E3E',
    sanctuary: '#27B887',
    realm: '#805AD5',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
              <Compass className="w-7 h-7 text-primary" />
              <span>World Builder</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
              {activeUniverse.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Construct civilizations, cartographic geography, cultures, and metaphysical rules.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              resetLocForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-glow-primary transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Plot Location</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800/60 p-1 w-fit">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'map'
              ? 'bg-white dark:bg-darkCard text-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Interactive Visual Map ({locations.length})
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'list'
              ? 'bg-white dark:bg-darkCard text-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Civilizations & Locations Directory
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'rules'
              ? 'bg-white dark:bg-darkCard text-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Metaphysical Rules & Technology
        </button>
      </div>

      {/* TAB 1: INTERACTIVE VISUAL MAP */}
      {activeTab === 'map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Canvas */}
          <div className="lg:col-span-2 glass-panel p-4 rounded-3xl relative border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Cartographic Coordinate Grid (700 &times; 400)</span>
              </div>
              {connectSource ? (
                <div className="flex items-center gap-2 text-xs font-bold text-amber-500 animate-pulse">
                  <span>Routing from node: {locations.find(l => l.id === connectSource)?.name}</span>
                  <button onClick={() => setConnectSource(null)} className="underline text-[11px]">Cancel</button>
                </div>
              ) : (
                <div className="text-[11px] text-gray-400">Click node to inspect &bull; Double-click to link routes</div>
              )}
            </div>

            {/* Interactive SVG Canvas */}
            <div
              onClick={handleMapCanvasClick}
              className="w-full h-[420px] rounded-2xl bg-[#0F111E] border border-white/10 relative overflow-hidden cursor-crosshair select-none"
            >
              {/* Grid Background Pattern */}
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: 'radial-gradient(#7549E8 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />

              <svg className="w-full h-full" viewBox="0 0 700 400">
                {/* Connection lines between locations */}
                {locations.map(loc =>
                  (loc.connections || []).map(targetId => {
                    const target = locations.find(l => l.id === targetId);
                    if (!target) return null;
                    const x1 = loc.coordinates?.x ?? 200;
                    const y1 = loc.coordinates?.y ?? 150;
                    const x2 = target.coordinates?.x ?? 300;
                    const y2 = target.coordinates?.y ?? 200;
                    return (
                      <line
                        key={`${loc.id}-${targetId}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#7549E8"
                        strokeWidth="2"
                        strokeDasharray="4 3"
                        opacity="0.6"
                      />
                    );
                  })
                )}

                {/* Location Nodes */}
                {locations.map(loc => {
                  const isSelected = selectedLocation?.id === loc.id;
                  const isSource = connectSource === loc.id;
                  const color = typeColors[loc.type] || '#7549E8';
                  const cx = loc.coordinates?.x ?? 250;
                  const cy = loc.coordinates?.y ?? 180;

                  return (
                    <g
                      key={loc.id}
                      transform={`translate(${cx}, ${cy})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLocation(loc);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleConnectLocations(loc.id);
                      }}
                      className="cursor-pointer group"
                    >
                      {/* Outer pulse ring if selected */}
                      {isSelected && (
                        <circle
                          r="28"
                          fill="none"
                          stroke={color}
                          strokeWidth="2"
                          opacity="0.7"
                          className="animate-ping"
                        />
                      )}

                      {/* Main Node */}
                      <circle
                        r={isSelected || isSource ? 22 : 18}
                        fill={color}
                        stroke="#ffffff"
                        strokeWidth={isSelected ? 3 : 2}
                        style={{ filter: `drop-shadow(0 0 8px ${color}88)` }}
                        className="transition-all duration-200 group-hover:scale-110"
                      />

                      {/* Icon initials */}
                      <text
                        textAnchor="middle"
                        dy="4"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        pointerEvents="none"
                      >
                        {loc.name.charAt(0).toUpperCase()}
                      </text>

                      {/* Label under node */}
                      <text
                        textAnchor="middle"
                        dy="34"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="bold"
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                        pointerEvents="none"
                      >
                        {loc.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Map Legend */}
            <div className="flex flex-wrap items-center gap-3 mt-3 px-2 text-[11px] text-gray-500">
              <span className="font-bold text-gray-700 dark:text-gray-300">Biomes / Types:</span>
              {Object.entries(typeColors).map(([t, c]) => (
                <div key={t} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                  <span className="capitalize">{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Location Inspector Panel (Right) */}
          <div className="glass-panel p-6 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
            {selectedLocation ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: typeColors[selectedLocation.type] || '#7549E8' }}
                  >
                    {selectedLocation.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleConnectLocations(selectedLocation.id)}
                      className="p-1.5 rounded-lg text-primary hover:bg-primary/10 text-xs font-semibold flex items-center gap-1"
                      title="Link route to another location"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(selectedLocation.id, selectedLocation.name)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedLocation.name}
                  </h3>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Coordinates: ({selectedLocation.coordinates?.x ?? 0}, {selectedLocation.coordinates?.y ?? 0})
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-800/40 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                  {selectedLocation.description || 'No description provided.'}
                </p>

                <div className="space-y-2.5 text-xs">
                  {selectedLocation.climate && (
                    <div>
                      <span className="font-bold text-gray-700 dark:text-gray-300 block mb-0.5">Climate & Terrain</span>
                      <span className="text-gray-500 dark:text-gray-400">{selectedLocation.climate}</span>
                    </div>
                  )}

                  {selectedLocation.politicalSystem && (
                    <div>
                      <span className="font-bold text-gray-700 dark:text-gray-300 block mb-0.5">Political Regime</span>
                      <span className="text-gray-500 dark:text-gray-400">{selectedLocation.politicalSystem}</span>
                    </div>
                  )}

                  {selectedLocation.culture && (
                    <div>
                      <span className="font-bold text-gray-700 dark:text-gray-300 block mb-0.5">Culture & Traditions</span>
                      <span className="text-gray-500 dark:text-gray-400">{selectedLocation.culture}</span>
                    </div>
                  )}

                  {selectedLocation.defense && (
                    <div>
                      <span className="font-bold text-gray-700 dark:text-gray-300 block mb-0.5">Defenses & Armaments</span>
                      <span className="text-gray-500 dark:text-gray-400">{selectedLocation.defense}</span>
                    </div>
                  )}

                  <div>
                    <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1">
                      Connected Routes ({selectedLocation.connections?.length || 0})
                    </span>
                    {(selectedLocation.connections || []).length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {selectedLocation.connections.map(targetId => {
                          const t = locations.find(l => l.id === targetId);
                          return (
                            <span key={targetId} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                              {t?.name || targetId}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400">Isolated location; no trade or military paths linked.</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-gray-400">
                <Compass className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <span>Select a plotted location node to inspect details.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LOCATIONS LIST DIRECTORY */}
      {activeTab === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map(loc => (
            <div
              key={loc.id}
              className="p-6 rounded-3xl glass-panel border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: typeColors[loc.type] || '#7549E8' }}
                  >
                    {loc.type}
                  </span>
                  <button
                    onClick={() => handleDeleteLocation(loc.id, loc.name)}
                    className="text-gray-400 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{loc.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">
                  {loc.description || 'No description recorded.'}
                </p>

                <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                  {loc.politicalSystem && (
                    <div className="truncate"><strong className="text-gray-800 dark:text-gray-200">Politics:</strong> {loc.politicalSystem}</div>
                  )}
                  {loc.climate && (
                    <div className="truncate"><strong className="text-gray-800 dark:text-gray-200">Climate:</strong> {loc.climate}</div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-400">
                <span>{(loc.connections || []).length} connected paths</span>
                <button
                  onClick={() => {
                    setSelectedLocation(loc);
                    setActiveTab('map');
                  }}
                  className="font-bold text-primary hover:underline"
                >
                  View on Map &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: METAPHYSICAL LAWS & TECHNOLOGY PARADIGMS */}
      {activeTab === 'rules' && (
        <form onSubmit={handleSaveWorldRules} className="max-w-3xl glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Metaphysical Laws & Technological Rules
              </h3>
              <p className="text-xs text-gray-500">
                These rules are permanently injected into every AI Story Studio prompt to maintain narrative continuity.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Cosmology & Planetary Structure
            </label>
            <textarea
              rows={3}
              value={cosmology}
              onChange={(e) => setCosmology(e.target.value)}
              placeholder="e.g. Orbit of twin fractured moons Selene and Umbra; void entities whisper between star constellations..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Magic / Supernatural Laws & Casting Limits
            </label>
            <textarea
              rows={3}
              value={magicRules}
              onChange={(e) => setMagicRules(e.target.value)}
              placeholder="e.g. Aetheric Resonance requires lunar crystal attunement. Overuse causes crystallization of the veins (Vitreous Blight)..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Technology Paradigm & Machinery
            </label>
            <textarea
              rows={3}
              value={techLevel}
              onChange={(e) => setTechLevel(e.target.value)}
              placeholder="e.g. Runepunk brass clockwork with aether skyships and heavy trench barricades..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="submit"
              disabled={savingRules}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-glow-primary transition-all disabled:opacity-50"
            >
              {savingRules ? 'Updating Laws...' : 'Save World Laws'}
            </button>
          </div>
        </form>
      )}

      {/* PLOT NEW LOCATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-white dark:bg-[#171727] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Plot Location or Civilization</h3>
            <p className="text-xs text-gray-500 mb-6">Position on map coordinates ({locCoords.x}, {locCoords.y})</p>

            <form onSubmit={handleCreateLocation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={locName}
                    onChange={(e) => setLocName(e.target.value)}
                    placeholder="e.g. Citadel of Dawn"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Location Type
                  </label>
                  <select
                    value={locType}
                    onChange={(e) => setLocType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="kingdom">Kingdom</option>
                    <option value="city">City / Metropolis</option>
                    <option value="planet">Planet / Moon</option>
                    <option value="ruins">Ancient Ruins</option>
                    <option value="sanctuary">Sanctuary / Haven</option>
                    <option value="realm">Other Realm</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description & Geography
                </label>
                <textarea
                  rows={2}
                  value={locDesc}
                  onChange={(e) => setLocDesc(e.target.value)}
                  placeholder="Describe landscape, architectural marvels, natural defenses..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Political Regime / Government
                  </label>
                  <input
                    type="text"
                    value={locPolitics}
                    onChange={(e) => setLocPolitics(e.target.value)}
                    placeholder="e.g. Elected Council of Sun-Keepers"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Climate & Atmosphere
                  </label>
                  <input
                    type="text"
                    value={locClimate}
                    onChange={(e) => setLocClimate(e.target.value)}
                    placeholder="e.g. Frigid alpine with crystalline fog"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Culture & Traditions
                  </label>
                  <input
                    type="text"
                    value={locCulture}
                    onChange={(e) => setLocCulture(e.target.value)}
                    placeholder="e.g. Solar harmony hymnody, glass-blowing guilds"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Defenses & Fortifications
                  </label>
                  <input
                    type="text"
                    value={locDefense}
                    onChange={(e) => setLocDefense(e.target.value)}
                    placeholder="e.g. Prismatic wall of light, Solar Dragoons"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
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
                  Plot on Map
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
