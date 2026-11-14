import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Plus,
  Sparkles,
  Users,
  MapPin,
  Smile,
  Copy,
  Trash2,
  Save,
  Check,
  RefreshCw,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function DialogueGeneratorView() {
  const { activeUniverse, showToast, updateCreditsLocally } = useAuth();
  const [dialogues, setDialogues] = useState([]);
  const [activeDialogue, setActiveDialogue] = useState(null);
  const [universeCharacters, setUniverseCharacters] = useState([]);
  const [universeLocations, setUniverseLocations] = useState([]);

  // Form & generation configuration
  const [selectedCharIds, setSelectedCharIds] = useState([]);
  const [selectedLocId, setSelectedLocId] = useState('');
  const [tone, setTone] = useState('Tense & Philosophical');
  const [topic, setTopic] = useState('A secret pact regarding the broken seal');
  const [isGenerating, setIsGenerating] = useState(false);
  const [sceneTitle, setSceneTitle] = useState('New Dialogue Scene');
  const [scriptLines, setScriptLines] = useState([]);

  const loadData = async () => {
    if (!activeUniverse) return;
    try {
      const chars = await api.getCharacters(activeUniverse.id);
      setUniverseCharacters(chars);
      if (chars.length >= 2 && selectedCharIds.length === 0) {
        setSelectedCharIds([chars[0].id, chars[1].id]);
      }

      const locs = await api.getLocations(activeUniverse.id);
      setUniverseLocations(locs);
      if (locs.length > 0 && !selectedLocId) setSelectedLocId(locs[0].id);

      const dList = await api.getDialogues(activeUniverse.id);
      setDialogues(dList);
      if (dList.length > 0) {
        selectDialogue(dList[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeUniverse) loadData();
  }, [activeUniverse]);

  const selectDialogue = (d) => {
    setActiveDialogue(d);
    setSceneTitle(d.title);
    setSelectedCharIds(d.characterIds || []);
    setSelectedLocId(d.settingLocationId || '');
    setTone(d.tone || 'Dramatic');
    setScriptLines(d.lines || []);
  };

  const handleGenerateDialogue = async () => {
    if (!activeUniverse || selectedCharIds.length < 2) {
      showToast('Select at least 2 characters for dialogue generation.', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await api.generateDialogue({
        universeId: activeUniverse.id,
        characterIds: selectedCharIds,
        settingLocationId: selectedLocId,
        tone,
        topic,
      });

      if (res.lines && res.lines.length > 0) {
        setScriptLines(res.lines);
      }

      if (res.remainingCredits !== undefined) updateCreditsLocally(res.remainingCredits);
      showToast(`Dialogue script generated! (${res.model})`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDialogue = async () => {
    if (!activeUniverse) return;
    try {
      if (activeDialogue) {
        const updated = await api.updateDialogue(activeDialogue.id, {
          title: sceneTitle,
          settingLocationId: selectedLocId,
          tone,
          characterIds: selectedCharIds,
          lines: scriptLines,
        });
        setDialogues(dialogues.map(d => d.id === updated.id ? updated : d));
        showToast('Dialogue script saved.', 'success');
      } else {
        const created = await api.createDialogue({
          universeId: activeUniverse.id,
          title: sceneTitle || 'Untitled Scene',
          settingLocationId: selectedLocId,
          tone,
          characterIds: selectedCharIds,
          lines: scriptLines,
        });
        setDialogues([created, ...dialogues]);
        setActiveDialogue(created);
        showToast('New dialogue scene saved to canon!', 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleLineTextChange = (idx, text) => {
    const updated = [...scriptLines];
    updated[idx].text = text;
    setScriptLines(updated);
  };

  const handleLineEmotionChange = (idx, emotion) => {
    const updated = [...scriptLines];
    updated[idx].emotion = emotion;
    setScriptLines(updated);
  };

  const handleDeleteLine = (idx) => {
    setScriptLines(scriptLines.filter((_, i) => i !== idx));
  };

  const handleAddManualLine = () => {
    if (selectedCharIds.length === 0) return;
    const char = universeCharacters.find(c => c.id === selectedCharIds[0]);
    setScriptLines([
      ...scriptLines,
      {
        characterId: char?.id || 'char_manual',
        characterName: char?.name || 'Speaker',
        avatar: char?.avatar || '',
        emotion: 'Neutral',
        stageDirection: 'stepping forward',
        text: 'New line of dialogue...',
      }
    ]);
  };

  const handleCopyScript = () => {
    const scriptText = scriptLines
      .map(l => `${l.characterName} (${l.emotion}) [${l.stageDirection}]:\n"${l.text}"`)
      .join('\n\n');
    navigator.clipboard.writeText(scriptText);
    showToast('Script copied to clipboard!', 'success');
  };

  const handleDeleteDialogue = async (id) => {
    if (!window.confirm('Delete this dialogue scene?')) return;
    try {
      await api.deleteDialogue(id);
      const remaining = dialogues.filter(d => d.id !== id);
      setDialogues(remaining);
      if (activeDialogue?.id === id) {
        if (remaining.length > 0) selectDialogue(remaining[0]);
        else {
          setActiveDialogue(null);
          setScriptLines([]);
        }
      }
      showToast('Scene deleted.', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (!activeUniverse) {
    return (
      <div className="p-12 text-center glass-panel rounded-3xl">
        <MessageSquare className="w-12 h-12 text-primary mx-auto mb-3" />
        <h2 className="text-xl font-bold">Please Select an Active Universe</h2>
        <p className="text-xs text-gray-500 mt-1">
          Select a universe to generate authentic conversations between its established characters.
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
              <MessageSquare className="w-7 h-7 text-primary" />
              <span>Dialogue Generator</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
              {activeUniverse.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Simulate dynamic arguments, secret parleys, and emotional confrontations reflecting character psychology.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {scriptLines.length > 0 && (
            <button
              onClick={handleCopyScript}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Script</span>
            </button>
          )}
          <button
            onClick={handleSaveDialogue}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-glow-primary transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Scene</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Layout: Scene Config (Left/Top) & Script Workspace (Right/Bottom) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CONFIGURATION PANEL (1 Column) */}
        <div className="glass-panel p-6 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Scene Parameters</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Scene Title
            </label>
            <input
              type="text"
              value={sceneTitle}
              onChange={(e) => setSceneTitle(e.target.value)}
              placeholder="e.g. Confrontation at the Glass Tree"
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Character Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Select Participating Characters (Min 2)
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {universeCharacters.map(char => {
                const isSelected = selectedCharIds.includes(char.id);
                return (
                  <div
                    key={char.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCharIds(selectedCharIds.filter(id => id !== char.id));
                      } else {
                        setSelectedCharIds([...selectedCharIds, char.id]);
                      }
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary font-bold'
                        : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <img src={char.avatar} alt={char.name} className="w-6 h-6 rounded-lg object-cover" />
                      <span className="truncate">{char.name}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Setting Location
            </label>
            <select
              value={selectedLocId}
              onChange={(e) => setSelectedLocId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">No specific location</option>
              {universeLocations.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.type})</option>
              ))}
            </select>
          </div>

          {/* Emotional Tone */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Emotional Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="Tense & Philosophical">Tense & Philosophical</option>
              <option value="High Stakes Heated Argument">High Stakes Heated Argument</option>
              <option value="Conspiratorial & Secretive">Conspiratorial & Secretive</option>
              <option value="Witty & Sarcastic Banter">Witty & Sarcastic Banter</option>
              <option value="Melancholic & Tragic">Melancholic & Tragic</option>
              <option value="Romantic & Tender">Romantic & Tender</option>
            </select>
          </div>

          {/* Topic / Dramatic Conflict */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Dramatic Conflict / Topic
            </label>
            <textarea
              rows={2}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Selyse urges Valen to stop relying on the corrupting crystal shard..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <button
            onClick={handleGenerateDialogue}
            disabled={isGenerating || selectedCharIds.length < 2}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-electric text-white font-bold text-xs shadow-glow-primary hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Scene...</span>
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Simulate Dialogue</span>
              </>
            )}
          </button>

          {/* Saved Scenes List */}
          {dialogues.length > 0 && (
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Saved Scenes ({dialogues.length})
              </span>
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {dialogues.map(d => (
                  <div
                    key={d.id}
                    onClick={() => selectDialogue(d)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                      activeDialogue?.id === d.id
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <span className="truncate">{d.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDialogue(d.id);
                      }}
                      className="text-gray-400 hover:text-rose-500 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SCRIPT WORKSPACE (2 Columns) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-6 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white font-serif">{sceneTitle}</h3>
                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                  <span>Tone: {tone}</span>
                  <span>&bull;</span>
                  <span>{scriptLines.length} Spoken Turns</span>
                </div>
              </div>
              <button
                onClick={handleAddManualLine}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-primary transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Turn</span>
              </button>
            </div>

            {/* Script Lines Stream */}
            {scriptLines.length === 0 ? (
              <div className="py-24 text-center text-xs text-gray-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>No dialogue lines yet. Configure participants and click "Simulate Dialogue"!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
                {scriptLines.map((line, idx) => {
                  const char = universeCharacters.find(c => c.id === line.characterId);
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-gray-50/70 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2 group"
                    >
                      {/* Character Info Bar */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={line.avatar || char?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={line.characterName}
                            className="w-7 h-7 rounded-lg object-cover ring-1 ring-primary/30"
                          />
                          <span className="text-xs font-bold text-gray-900 dark:text-white">
                            {line.characterName}
                          </span>
                          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {line.emotion}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteLine(idx)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-rose-500 p-1 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Stage Direction */}
                      {line.stageDirection && (
                        <div className="text-[11px] font-mono italic text-gray-400 pl-2 border-l-2 border-primary/40">
                          [{line.stageDirection}]
                        </div>
                      )}

                      {/* Spoken Text (Editable) */}
                      <textarea
                        rows={2}
                        value={line.text}
                        onChange={(e) => handleLineTextChange(idx, e.target.value)}
                        className="w-full p-2 rounded-xl bg-white dark:bg-darkCard border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary font-serif leading-relaxed"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
