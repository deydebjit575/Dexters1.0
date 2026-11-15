import React, { useState, useEffect } from 'react';
import {
  GitFork,
  Plus,
  Play,
  RotateCcw,
  Sparkles,
  Share2,
  Trash2,
  Edit2,
  Check,
  ChevronRight,
  ArrowRight,
  BookOpen,
  X,
  Layers,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function InteractiveStoryView() {
  const { activeUniverse, showToast } = useAuth();
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [mode, setMode] = useState('editor'); // 'editor' | 'play'

  // Editor states
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [nodeTitle, setNodeTitle] = useState('');
  const [nodeContent, setNodeContent] = useState('');
  const [choices, setChoices] = useState([]);

  // Reader mode playthrough states
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [playHistory, setPlayHistory] = useState([]);

  // Modals
  const [showNewStoryModal, setShowNewStoryModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSynopsis, setNewSynopsis] = useState('');

  const loadData = async () => {
    if (!activeUniverse) return;
    try {
      const data = await api.getBranchingStories(activeUniverse.id);
      setStories(data);
      if (data.length > 0) {
        selectStory(data[0]);
      } else {
        setActiveStory(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeUniverse) loadData();
  }, [activeUniverse]);

  const selectStory = (story) => {
    setActiveStory(story);
    const startId = story.startNodeId || story.nodes?.[0]?.id || null;
    setSelectedNodeId(startId);
    setCurrentNodeId(startId);
    setPlayHistory([]);

    const startNode = story.nodes?.find(n => n.id === startId);
    if (startNode) {
      setNodeTitle(startNode.title);
      setNodeContent(startNode.content);
      setChoices(startNode.choices || []);
    }
  };

  const handleSelectNode = (node) => {
    setSelectedNodeId(node.id);
    setNodeTitle(node.title);
    setNodeContent(node.content);
    setChoices(node.choices || []);
  };

  const handleSaveCurrentNode = async () => {
    if (!activeStory || !selectedNodeId) return;
    try {
      const updatedNodes = (activeStory.nodes || []).map(n => {
        if (n.id === selectedNodeId) {
          return {
            ...n,
            title: nodeTitle,
            content: nodeContent,
            choices,
          };
        }
        return n;
      });

      const updated = await api.updateBranchingStory(activeStory.id, {
        nodes: updatedNodes,
      });

      setActiveStory(updated);
      setStories(stories.map(s => s.id === updated.id ? updated : s));
      showToast('Story node saved.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddNewNode = async () => {
    if (!activeStory) return;
    const newId = `node_${Date.now().toString().slice(-6)}`;
    const newNode = {
      id: newId,
      title: `Branch Point ${activeStory.nodes.length + 1}`,
      content: 'A new narrative crossroads opens before the protagonist...',
      choices: [],
    };

    const updatedNodes = [...activeStory.nodes, newNode];
    try {
      const updated = await api.updateBranchingStory(activeStory.id, {
        nodes: updatedNodes,
      });
      setActiveStory(updated);
      handleSelectNode(newNode);
      showToast('New story branch node created.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddChoice = () => {
    const otherNodes = (activeStory.nodes || []).filter(n => n.id !== selectedNodeId);
    const defaultTarget = otherNodes[0]?.id || selectedNodeId;
    setChoices([
      ...choices,
      {
        text: 'New choice option...',
        targetNodeId: defaultTarget,
      }
    ]);
  };

  const handleChoiceTextChange = (idx, text) => {
    const updated = [...choices];
    updated[idx].text = text;
    setChoices(updated);
  };

  const handleChoiceTargetChange = (idx, targetNodeId) => {
    const updated = [...choices];
    updated[idx].targetNodeId = targetNodeId;
    setChoices(updated);
  };

  const handleDeleteChoice = (idx) => {
    setChoices(choices.filter((_, i) => i !== idx));
  };

  // Playthrough reader actions
  const handleReaderChoice = (targetNodeId, choiceText) => {
    const targetNode = activeStory.nodes.find(n => n.id === targetNodeId);
    if (!targetNode) return;

    setPlayHistory([...playHistory, { nodeId: currentNodeId, choice: choiceText }]);
    setCurrentNodeId(targetNodeId);

    // If reached an ending (no choices)
    if (!targetNode.choices || targetNode.choices.length === 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
  };

  const handleRestartReader = () => {
    const startId = activeStory.startNodeId || activeStory.nodes?.[0]?.id;
    setCurrentNodeId(startId);
    setPlayHistory([]);
  };

  const handlePublishToCommunity = async () => {
    if (!activeStory) return;
    try {
      await api.publishPost({
        type: 'branching',
        itemId: activeStory.id,
        title: activeStory.title,
        summary: activeStory.synopsis || 'An interactive branching narrative created on StoryVerse.',
        genre: activeUniverse.genre,
        tags: [activeUniverse.genre, 'Interactive Fiction', 'Branching Story'],
      });
      showToast('Published to Community Discovery!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const created = await api.createBranchingStory({
        universeId: activeUniverse.id,
        title: newTitle.trim(),
        synopsis: newSynopsis.trim(),
      });
      setStories([created, ...stories]);
      setShowNewStoryModal(false);
      setNewTitle('');
      setNewSynopsis('');
      selectStory(created);
      showToast('Interactive branching story initialized!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const currentPlayNode = activeStory?.nodes?.find(n => n.id === currentNodeId);

  if (!activeUniverse) {
    return (
      <div className="p-12 text-center glass-panel rounded-3xl">
        <GitFork className="w-12 h-12 text-primary mx-auto mb-3" />
        <h2 className="text-xl font-bold">Please Select an Active Universe</h2>
        <p className="text-xs text-gray-500 mt-1">
          Select a universe to construct decision-based branching narratives.
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
              <GitFork className="w-7 h-7 text-primary" />
              <span>Interactive Story Builder</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
              {activeUniverse.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Design choose-your-own-path branching narratives with multi-ending decision trees.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {activeStory && (
            <>
              <button
                onClick={handlePublishToCommunity}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Publish Story</span>
              </button>

              <button
                onClick={() => setMode(mode === 'editor' ? 'play' : 'editor')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === 'play'
                    ? 'bg-amberGold text-white shadow-glow-amber'
                    : 'bg-emeraldGreen text-white shadow-glow-emerald'
                }`}
              >
                {mode === 'play' ? (
                  <>
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Back to Flow Editor</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Preview as Reader</span>
                  </>
                )}
              </button>
            </>
          )}

          <button
            onClick={() => setShowNewStoryModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-glow-primary transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Narrative</span>
          </button>
        </div>
      </div>

      {/* Story Selector Bar */}
      {stories.length > 0 && (
        <div className="glass-panel p-3 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <select
              value={activeStory?.id || ''}
              onChange={(e) => {
                const found = stories.find(s => s.id === e.target.value);
                if (found) selectStory(found);
              }}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none"
            >
              {stories.map(s => (
                <option key={s.id} value={s.id}>{s.title} ({s.nodesCount} Nodes)</option>
              ))}
            </select>
          </div>

          <div className="text-xs text-gray-400">
            {activeStory?.nodes?.length || 0} story nodes &bull; {(activeStory?.nodes || []).filter(n => !n.choices || n.choices.length === 0).length} ending resolutions
          </div>
        </div>
      )}

      {/* MODE 1: FLOW & NODE EDITOR */}
      {mode === 'editor' && activeStory && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual Node Flow Canvas (2 Columns) */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <GitFork className="w-4 h-4 text-primary" />
                <span>Branching Narrative Map & Flow</span>
              </div>
              <button
                onClick={handleAddNewNode}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Node</span>
              </button>
            </div>

            {/* SVG Visual Flow Graph */}
            <div className="w-full h-[400px] rounded-2xl bg-[#0F111E] border border-white/10 relative overflow-hidden flex items-center justify-center p-4">
              <svg className="w-full h-full" viewBox="0 0 640 360">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#7549E8" />
                  </marker>
                </defs>

                {/* Render Directed Decision Edges */}
                {activeStory.nodes?.map((node, sIdx) => {
                  const x1 = 80 + (sIdx % 4) * 150;
                  const y1 = 70 + Math.floor(sIdx / 4) * 140;

                  return (node.choices || []).map((ch, cIdx) => {
                    const tIdx = activeStory.nodes.findIndex(n => n.id === ch.targetNodeId);
                    if (tIdx === -1) return null;
                    const x2 = 80 + (tIdx % 4) * 150;
                    const y2 = 70 + Math.floor(tIdx / 4) * 140;

                    return (
                      <line
                        key={`${node.id}-${cIdx}`}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#7549E8"
                        strokeWidth="2"
                        markerEnd="url(#arrow)"
                        opacity="0.6"
                      />
                    );
                  });
                })}

                {/* Render Story Nodes */}
                {activeStory.nodes?.map((node, idx) => {
                  const x = 80 + (idx % 4) * 150;
                  const y = 70 + Math.floor(idx / 4) * 140;
                  const isSelected = selectedNodeId === node.id;
                  const isEnding = !node.choices || node.choices.length === 0;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${x}, ${y})`}
                      onClick={() => handleSelectNode(node)}
                      className="cursor-pointer group"
                    >
                      <rect
                        x="-55"
                        y="-30"
                        width="110"
                        height="60"
                        rx="16"
                        fill={isEnding ? '#1A2C24' : isSelected ? '#2E1E5C' : '#171727'}
                        stroke={isEnding ? '#27B887' : isSelected ? '#7549E8' : '#3E3E5B'}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        className="group-hover:stroke-primary transition-all"
                        style={{ filter: isSelected ? 'drop-shadow(0 0 10px #7549E8)' : undefined }}
                      />
                      <text textAnchor="middle" dy="-8" fill="#ffffff" fontSize="9" fontWeight="bold">
                        {node.title.length > 15 ? node.title.slice(0, 13) + '..' : node.title}
                      </text>
                      <text textAnchor="middle" dy="12" fill={isEnding ? '#27B887' : '#20A5D8'} fontSize="8" fontWeight="600">
                        {isEnding ? 'Resolution Ending' : `${node.choices?.length || 0} Reader Choices`}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-500 mt-3">
              <span>Click node box to edit content and branch choices &bull; Green indicates ending resolution</span>
            </div>
          </div>

          {/* Node Editor Form (Right Column) */}
          <div className="glass-panel p-6 rounded-3xl border border-gray-200 dark:border-gray-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Edit Story Node</h3>
              <button
                onClick={handleSaveCurrentNode}
                className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-glow-primary transition-all"
              >
                Save Node
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Node Title / Milestone
              </label>
              <input
                type="text"
                value={nodeTitle}
                onChange={(e) => setNodeTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Story Text / Reader Scene
              </label>
              <textarea
                rows={5}
                value={nodeContent}
                onChange={(e) => setNodeContent(e.target.value)}
                placeholder="Narrative prose presented to the reader at this branch point..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-serif leading-relaxed"
              />
            </div>

            {/* Choices list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Reader Decisions ({choices.length})
                </label>
                <button
                  onClick={handleAddChoice}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Decision</span>
                </button>
              </div>

              {choices.length === 0 ? (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-[11px] text-emerald-800 dark:text-emerald-300">
                  This node has zero outbound choices and acts as a narrative ending / resolution.
                </div>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {choices.map((ch, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-700 dark:text-gray-300 text-[11px]">
                          Choice #{idx + 1}
                        </span>
                        <button
                          onClick={() => handleDeleteChoice(idx)}
                          className="text-gray-400 hover:text-rose-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <input
                        type="text"
                        value={ch.text}
                        onChange={(e) => handleChoiceTextChange(idx, e.target.value)}
                        placeholder="Choice text displayed to reader..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs"
                      />

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 uppercase font-semibold">Leads to:</span>
                        <select
                          value={ch.targetNodeId}
                          onChange={(e) => handleChoiceTargetChange(idx, e.target.value)}
                          className="flex-1 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs font-medium"
                        >
                          {(activeStory.nodes || []).map(n => (
                            <option key={n.id} value={n.id}>{n.title}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: PLAY / PREVIEW AS READER */}
      {mode === 'play' && activeStory && currentPlayNode && (
        <div className="max-w-3xl mx-auto glass-panel p-8 sm:p-12 rounded-3xl border border-primary/20 shadow-2xl space-y-8 animate-fade-in">
          {/* Reader Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-primary">
                Interactive Reader Mode
              </span>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-gray-900 dark:text-white">
                {currentPlayNode.title}
              </h2>
            </div>
            <button
              onClick={handleRestartReader}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-xs font-bold text-gray-700 dark:text-gray-300 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start Over</span>
            </button>
          </div>

          {/* Reader Narrative Body */}
          <div className="prose dark:prose-invert max-w-none font-serif text-base sm:text-lg leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-line">
            {currentPlayNode.content}
          </div>

          {/* Choices or Ending Badge */}
          {currentPlayNode.choices && currentPlayNode.choices.length > 0 ? (
            <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">
                What do you decide?
              </span>
              {currentPlayNode.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => handleReaderChoice(choice.targetNodeId, choice.text)}
                  className="w-full p-4 rounded-2xl bg-white dark:bg-darkCard hover:bg-primary/5 dark:hover:bg-primary/10 border-2 border-gray-200 dark:border-gray-700 hover:border-primary text-left text-sm font-bold text-gray-800 dark:text-gray-100 shadow-sm transition-all flex items-center justify-between group"
                >
                  <span>{choice.text}</span>
                  <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          ) : (
            <div className="pt-8 border-t border-gray-100 dark:border-gray-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Narrative Resolution Reached</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                You have reached one of the alternative endings created for this interactive story.
              </p>
              <button
                onClick={handleRestartReader}
                className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow-glow-primary"
              >
                Play Again & Choose Another Path
              </button>
            </div>
          )}
        </div>
      )}

      {/* NEW STORY MODAL */}
      {showNewStoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#171727] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setShowNewStoryModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">New Branching Narrative</h3>
            <p className="text-xs text-gray-500 mb-6">Create a decision-based story in {activeUniverse.name}</p>

            <form onSubmit={handleCreateStory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Infiltration of the Moon Vault"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Premise / Reader Hook
                </label>
                <textarea
                  rows={3}
                  value={newSynopsis}
                  onChange={(e) => setNewSynopsis(e.target.value)}
                  placeholder="Lead your protagonist through dangerous crossroads with multiple resolutions..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowNewStoryModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-glow-primary"
                >
                  Initialize Flow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
