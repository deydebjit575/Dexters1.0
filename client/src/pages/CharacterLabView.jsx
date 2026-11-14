import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Sparkles,
  Wand2,
  Heart,
  Swords,
  ShieldAlert,
  GitBranch,
  Trash2,
  Edit2,
  X,
  Check,
  Search,
  Share2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function CharacterLabView() {
  const { activeUniverse, showToast, updateCreditsLocally } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [activeTab, setActiveTab] = useState('roster'); // 'roster' | 'relMap'
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRelModal, setShowRelModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Form states
  const [charName, setCharName] = useState('');
  const [charRole, setCharRole] = useState('Protagonist');
  const [charSpecies, setCharSpecies] = useState('Human');
  const [charAge, setCharAge] = useState(25);
  const [charAvatar, setCharAvatar] = useState('');
  const [charTraits, setCharTraits] = useState('');
  const [charBio, setCharBio] = useState('');
  const [charAbilities, setCharAbilities] = useState('');
  const [charMotivations, setCharMotivations] = useState('');
  const [charStrengths, setCharStrengths] = useState('');
  const [charWeaknesses, setCharWeaknesses] = useState('');
  const [charArc, setCharArc] = useState('');

  // Relationship modal states
  const [relSourceId, setRelSourceId] = useState('');
  const [relTargetId, setRelTargetId] = useState('');
  const [relType, setRelType] = useState('ally');
  const [relDesc, setRelDesc] = useState('');

  const loadData = async () => {
    if (!activeUniverse) return;
    try {
      const charData = await api.getCharacters(activeUniverse.id);
      setCharacters(charData);
      if (charData.length > 0 && !selectedChar) setSelectedChar(charData[0]);

      const relData = await api.getRelationships(activeUniverse.id);
      setRelationships(relData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeUniverse) loadData();
  }, [activeUniverse]);

  const handleAiGenerate = async () => {
    if (!activeUniverse) return;
    setIsAiGenerating(true);
    try {
      const prompt = charName
        ? `Character name: ${charName}. Role: ${charRole}`
        : `Role: ${charRole}. Species: ${charSpecies}`;

      const res = await api.generateCharacter({
        prompt,
        universeId: activeUniverse.id,
      });

      if (res.parsed) {
        const c = res.parsed;
        setCharName(c.name || charName);
        setCharRole(c.role || charRole);
        setCharSpecies(c.species || charSpecies);
        setCharAge(c.age || 28);
        setCharTraits(Array.isArray(c.personalityTraits) ? c.personalityTraits.join(', ') : '');
        setCharBio(c.biography || '');
        setCharAbilities(Array.isArray(c.abilities) ? c.abilities.join(', ') : '');
        setCharMotivations(c.motivations || '');
        setCharStrengths(c.strengths || '');
        setCharWeaknesses(c.weaknesses || '');
        setCharArc(c.characterArc || '');
      }

      if (res.remainingCredits !== undefined) {
        updateCreditsLocally(res.remainingCredits);
      }
      showToast(`AI Character generated! (${res.model})`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleCreateCharacter = async (e) => {
    e.preventDefault();
    if (!charName.trim()) {
      showToast('Character name is required.', 'error');
      return;
    }

    try {
      const created = await api.createCharacter({
        universeId: activeUniverse.id,
        name: charName.trim(),
        role: charRole,
        species: charSpecies,
        age: Number(charAge),
        avatar: charAvatar.trim() || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(charName)}`,
        personalityTraits: charTraits.split(',').map(s => s.trim()).filter(Boolean),
        biography: charBio,
        abilities: charAbilities.split(',').map(s => s.trim()).filter(Boolean),
        motivations: charMotivations,
        strengths: charStrengths,
        weaknesses: charWeaknesses,
        characterArc: charArc,
      });

      setCharacters([...characters, created]);
      setSelectedChar(created);
      setShowAddModal(false);
      resetCharForm();
      showToast(`Character "${created.name}" welcomed to canon!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const resetCharForm = () => {
    setCharName('');
    setCharRole('Protagonist');
    setCharSpecies('Human');
    setCharAge(25);
    setCharAvatar('');
    setCharTraits('');
    setCharBio('');
    setCharAbilities('');
    setCharMotivations('');
    setCharStrengths('');
    setCharWeaknesses('');
    setCharArc('');
  };

  const handleDeleteCharacter = async (id, name) => {
    if (!window.confirm(`Permanently remove "${name}" from canon?`)) return;
    try {
      await api.deleteCharacter(id);
      const remaining = characters.filter(c => c.id !== id);
      setCharacters(remaining);
      if (selectedChar?.id === id) setSelectedChar(remaining[0] || null);
      setRelationships(relationships.filter(r => r.sourceId !== id && r.targetId !== id));
      showToast(`Character "${name}" removed.`, 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateRelationship = async (e) => {
    e.preventDefault();
    if (!relSourceId || !relTargetId) {
      showToast('Select both characters for relationship.', 'error');
      return;
    }
    if (relSourceId === relTargetId) {
      showToast('Cannot link character to themselves.', 'error');
      return;
    }

    try {
      const created = await api.createRelationship({
        universeId: activeUniverse.id,
        sourceId: relSourceId,
        targetId: relTargetId,
        relationType: relType,
        description: relDesc,
      });

      setRelationships([...relationships, created]);
      setShowRelModal(false);
      setRelDesc('');
      showToast('Character relationship established!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteRelationship = async (relId) => {
    try {
      await api.deleteRelationship(relId);
      setRelationships(relationships.filter(r => r.id !== relId));
      showToast('Relationship removed.', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filteredCharacters = characters.filter(c =>
    !searchQuery ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.species.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const relationColorMap = {
    ally: '#27B887',
    rival: '#F3A64A',
    family: '#7549E8',
    nemesis: '#E53E3E',
    romantic: '#ED64A6',
    mentor: '#20A5D8',
    complex: '#805AD5',
  };

  if (!activeUniverse) {
    return (
      <div className="p-12 text-center glass-panel rounded-3xl">
        <Users className="w-12 h-12 text-primary mx-auto mb-3" />
        <h2 className="text-xl font-bold">Please Select an Active Universe</h2>
        <p className="text-xs text-gray-500 mt-1">
          Select or establish a universe to populate its cast of characters.
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
              <Users className="w-7 h-7 text-primary" />
              <span>Character Lab</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
              {activeUniverse.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Forge complex protagonists, antagonists, psychological arcs, and relational ties.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              if (characters.length < 2) {
                showToast('Create at least 2 characters to link relationships.', 'warning');
                return;
              }
              setRelSourceId(characters[0].id);
              setRelTargetId(characters[1].id);
              setShowRelModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary/30 text-primary dark:text-primary-300 font-bold text-xs hover:bg-primary/10 transition-all"
          >
            <GitBranch className="w-4 h-4" />
            <span>Add Relationship</span>
          </button>
          <button
            onClick={() => {
              resetCharForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-glow-primary transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Spawn Character</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800/60 p-1">
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'roster'
                ? 'bg-white dark:bg-darkCard text-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Character Profiles ({characters.length})
          </button>
          <button
            onClick={() => setActiveTab('relMap')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'relMap'
                ? 'bg-white dark:bg-darkCard text-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            Visual Relationship Map ({relationships.length})
          </button>
        </div>

        {activeTab === 'roster' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, role, traits..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        )}
      </div>

      {/* TAB 1: CHARACTER ROSTER CARDS */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCharacters.map(char => {
            const charRels = relationships.filter(r => r.sourceId === char.id || r.targetId === char.id);
            return (
              <div
                key={char.id}
                className="p-6 rounded-3xl glass-panel border border-gray-200 dark:border-gray-800 hover:border-primary/50 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Avatar and Main Identifiers */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={char.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={char.name}
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary/30 shadow-md"
                      />
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                          {char.name}
                        </h3>
                        <div className="text-xs font-semibold text-primary dark:text-primary-400 mt-0.5">
                          {char.role}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {char.species} &bull; Age {char.age}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCharacter(char.id, char.name)}
                      className="text-gray-400 hover:text-rose-500 p-1"
                      title="Delete character"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Personality Traits Tags */}
                  {(char.personalityTraits || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {char.personalityTraits.map((trait, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/15"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bio */}
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed mb-4 bg-gray-50 dark:bg-gray-800/30 p-2.5 rounded-xl">
                    {char.biography || 'No biography recorded.'}
                  </p>

                  {/* Abilities and Goals */}
                  <div className="space-y-2 text-xs">
                    {char.motivations && (
                      <div>
                        <span className="font-bold text-gray-700 dark:text-gray-300 block mb-0.5">Core Drive & Goal:</span>
                        <span className="text-gray-500 dark:text-gray-400">{char.motivations}</span>
                      </div>
                    )}

                    {(char.abilities || []).length > 0 && (
                      <div>
                        <span className="font-bold text-gray-700 dark:text-gray-300 block mb-0.5">Skills & Abilities:</span>
                        <span className="text-gray-500 dark:text-gray-400">{char.abilities.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Relationships Count Footer */}
                <div className="pt-3 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                  <div className="flex items-center gap-1 text-primary font-bold">
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>{charRels.length} Relationships</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('relMap')}
                    className="hover:underline font-semibold text-gray-500 hover:text-primary"
                  >
                    View Map &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: VISUAL CHARACTER RELATIONSHIP MAP */}
      {activeTab === 'relMap' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Graph View */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-primary" />
                <span>Inter-Character Dynamics Graph</span>
              </div>
              <div className="text-[11px] text-gray-400">Hover links to view relational descriptions</div>
            </div>

            {/* SVG Visual Relationship Graph */}
            <div className="w-full h-[400px] rounded-2xl bg-[#0F111E] border border-white/10 relative overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 600 360">
                {/* Render Relationship Lines */}
                {relationships.map(rel => {
                  const sIdx = characters.findIndex(c => c.id === rel.sourceId);
                  const tIdx = characters.findIndex(c => c.id === rel.targetId);
                  if (sIdx === -1 || tIdx === -1) return null;

                  const sAngle = (sIdx / (characters.length || 1)) * 2 * Math.PI;
                  const tAngle = (tIdx / (characters.length || 1)) * 2 * Math.PI;
                  const radius = 130;
                  const x1 = 300 + radius * Math.cos(sAngle);
                  const y1 = 180 + radius * Math.sin(sAngle);
                  const x2 = 300 + radius * Math.cos(tAngle);
                  const y2 = 180 + radius * Math.sin(tAngle);

                  const color = relationColorMap[rel.relationType] || '#7549E8';

                  return (
                    <g key={rel.id} className="group">
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={color}
                        strokeWidth="2.5"
                        strokeDasharray={rel.relationType === 'rival' || rel.relationType === 'nemesis' ? '4 3' : undefined}
                        opacity="0.8"
                        className="transition-all hover:stroke-width-4"
                      />
                      {/* Midpoint Label */}
                      <text
                        x={(x1 + x2) / 2}
                        y={(y1 + y2) / 2}
                        textAnchor="middle"
                        dy="-4"
                        fill={color}
                        fontSize="9"
                        fontWeight="bold"
                        className="bg-black/80 px-1"
                      >
                        {rel.relationType.toUpperCase()}
                      </text>
                    </g>
                  );
                })}

                {/* Render Character Circular Nodes */}
                {characters.map((char, i) => {
                  const angle = (i / (characters.length || 1)) * 2 * Math.PI;
                  const radius = 130;
                  const cx = 300 + radius * Math.cos(angle);
                  const cy = 180 + radius * Math.sin(angle);
                  const isSelected = selectedChar?.id === char.id;

                  return (
                    <g
                      key={char.id}
                      transform={`translate(${cx}, ${cy})`}
                      onClick={() => setSelectedChar(char)}
                      className="cursor-pointer group"
                    >
                      <circle
                        r={isSelected ? 26 : 22}
                        fill="#1E1B38"
                        stroke={isSelected ? '#7549E8' : '#ffffff'}
                        strokeWidth="2.5"
                        className="group-hover:scale-110 transition-transform"
                        style={{ filter: isSelected ? 'drop-shadow(0 0 10px #7549E8)' : undefined }}
                      />
                      <text
                        textAnchor="middle"
                        dy="4"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        pointerEvents="none"
                      >
                        {char.name.charAt(0)}
                      </text>
                      <text
                        textAnchor="middle"
                        dy="36"
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                        pointerEvents="none"
                      >
                        {char.name.split(' ')[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Relationship Legend */}
            <div className="flex flex-wrap items-center gap-3 mt-4 text-[11px] text-gray-500">
              <span className="font-bold text-gray-700 dark:text-gray-300">Relationship Types:</span>
              {Object.entries(relationColorMap).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className="capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Relationship Details List for Selected Character */}
          <div className="glass-panel p-6 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
            {selectedChar ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <img
                    src={selectedChar.avatar}
                    alt={selectedChar.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-primary/30"
                  />
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">{selectedChar.name}</h3>
                    <p className="text-xs text-primary">{selectedChar.role}</p>
                  </div>
                </div>

                <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Active Connections ({relationships.filter(r => r.sourceId === selectedChar.id || r.targetId === selectedChar.id).length})
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {relationships
                    .filter(r => r.sourceId === selectedChar.id || r.targetId === selectedChar.id)
                    .map(rel => {
                      const otherId = rel.sourceId === selectedChar.id ? rel.targetId : rel.sourceId;
                      const otherChar = characters.find(c => c.id === otherId);
                      const color = relationColorMap[rel.relationType] || '#7549E8';

                      return (
                        <div
                          key={rel.id}
                          className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-gray-900 dark:text-white">
                              {otherChar?.name || 'Unknown'}
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase text-white"
                                style={{ backgroundColor: color }}
                              >
                                {rel.relationType}
                              </span>
                              <button
                                onClick={() => handleDeleteRelationship(rel.id)}
                                className="text-gray-400 hover:text-rose-500"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-relaxed">
                            {rel.description || 'No description provided.'}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-gray-400">
                Select a character to view their relational network.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SPAWN CHARACTER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#171727] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Spawn Character</h3>
            <p className="text-xs text-gray-500 mb-6">Create or AI-generate a character for {activeUniverse.name}</p>

            {/* AI Generator Button */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary-50 to-electric-50 dark:from-primary-950/40 dark:to-electric-950/40 border border-primary-100 dark:border-primary-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Wand2 className="w-5 h-5 text-primary animate-pulse" />
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">AI Character Architect</div>
                  <div className="text-[11px] text-gray-600 dark:text-gray-300">Automatically creates psychological traits, backstory, and motivations.</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={isAiGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-semibold shadow-glow-primary transition-all disabled:opacity-50"
              >
                {isAiGenerating ? 'Generating...' : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Generate</span>
                  </>
                )}
              </button>
            </div>

            <form onSubmit={handleCreateCharacter} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={charName}
                    onChange={(e) => setCharName(e.target.value)}
                    placeholder="e.g. Prince Valen Shadowthorn"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Narrative Role
                  </label>
                  <input
                    type="text"
                    value={charRole}
                    onChange={(e) => setCharRole(e.target.value)}
                    placeholder="e.g. Protagonist / Exiled Heir"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Species / Race
                  </label>
                  <input
                    type="text"
                    value={charSpecies}
                    onChange={(e) => setCharSpecies(e.target.value)}
                    placeholder="e.g. Human (Aether-Touched)"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={charAge}
                    onChange={(e) => setCharAge(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Avatar Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={charAvatar}
                    onChange={(e) => setCharAvatar(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Personality Traits (Comma-separated)
                </label>
                <input
                  type="text"
                  value={charTraits}
                  onChange={(e) => setCharTraits(e.target.value)}
                  placeholder="e.g. Brooding, Tactical, Deeply loyal, Haunted by prophecy"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Backstory & Biography
                </label>
                <textarea
                  rows={2}
                  value={charBio}
                  onChange={(e) => setCharBio(e.target.value)}
                  placeholder="Exiled prince whose kingdom was destroyed; bonded with a forbidden moon shard..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Core Motivations & Goals
                  </label>
                  <input
                    type="text"
                    value={charMotivations}
                    onChange={(e) => setCharMotivations(e.target.value)}
                    placeholder="e.g. Reclaim the Sunken Spires without succumbing to the Blight"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Skills & Supernatural Abilities
                  </label>
                  <input
                    type="text"
                    value={charAbilities}
                    onChange={(e) => setCharAbilities(e.target.value)}
                    placeholder="e.g. Umbral blade manifestation, Leyline sensing"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Strengths
                  </label>
                  <input
                    type="text"
                    value={charStrengths}
                    onChange={(e) => setCharStrengths(e.target.value)}
                    placeholder="e.g. Peerless swordsman, unbreakable will"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Weaknesses / Wounds
                  </label>
                  <input
                    type="text"
                    value={charWeaknesses}
                    onChange={(e) => setCharWeaknesses(e.target.value)}
                    placeholder="e.g. Crystal agony, struggles to trust allies"
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
                  Save Character
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RELATIONSHIP MODAL */}
      {showRelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#171727] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setShowRelModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Establish Relationship</h3>
            <p className="text-xs text-gray-500 mb-6">Link two characters with emotional and narrative dynamics</p>

            <form onSubmit={handleCreateRelationship} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Source Character
                </label>
                <select
                  value={relSourceId}
                  onChange={(e) => setRelSourceId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {characters.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Target Character
                </label>
                <select
                  value={relTargetId}
                  onChange={(e) => setRelTargetId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {characters.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Relationship Type
                </label>
                <select
                  value={relType}
                  onChange={(e) => setRelType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="ally">Ally / Friendship (Green)</option>
                  <option value="rival">Rivalry (Amber)</option>
                  <option value="family">Family / Blood Tie (Purple)</option>
                  <option value="nemesis">Nemesis / Mortal Enemy (Red)</option>
                  <option value="romantic">Romantic (Pink)</option>
                  <option value="mentor">Mentor & Protégé (Blue)</option>
                  <option value="complex">Complex / Uneasy Truce (Violet)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Dynamic Description
                </label>
                <textarea
                  rows={2}
                  value={relDesc}
                  onChange={(e) => setRelDesc(e.target.value)}
                  placeholder="e.g. Bound by stolen royal codices; Selyse guides Valen's blight while he protects her..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowRelModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-glow-primary"
                >
                  Establish Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
