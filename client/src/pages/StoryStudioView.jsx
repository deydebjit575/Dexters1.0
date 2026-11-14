import React, { useState, useEffect, useRef } from 'react';
import {
  Feather,
  Plus,
  Sparkles,
  Wand2,
  Download,
  Save,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  FileText,
  ChevronRight,
  BookOpen,
  X,
  RefreshCw,
  Copy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function StoryStudioView() {
  const { activeUniverse, showToast, updateCreditsLocally } = useAuth();
  const [stories, setStories] = useState([]);
  const [activeStory, setActiveStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);

  // Editor states
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterContent, setChapterContent] = useState('');
  const [writingTone, setWritingTone] = useState('Epic & Atmospheric');
  const [autoSavedTime, setAutoSavedTime] = useState(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // AI Assistant states
  const [assistantTab, setAssistantTab] = useState('generate'); // 'generate' | 'twists' | 'continuity' | 'brainstorm'
  const [chapterPrompt, setChapterPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [twistResults, setTwistResults] = useState([]);
  const [continuityReport, setContinuityReport] = useState(null);
  const [brainstormResults, setBrainstormResults] = useState([]);

  // Modals
  const [showNewStoryModal, setShowNewStoryModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStorySynopsis, setNewStorySynopsis] = useState('');
  const [newStoryGenre, setNewStoryGenre] = useState('fantasy');

  const autoSaveTimerRef = useRef(null);

  // Load stories for universe
  const loadStories = async () => {
    if (!activeUniverse) return;
    try {
      const data = await api.getStories(activeUniverse.id);
      setStories(data);
      if (data.length > 0) {
        selectStory(data[0]);
      } else {
        setActiveStory(null);
        setChapters([]);
        setActiveChapter(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activeUniverse) loadStories();
  }, [activeUniverse]);

  const selectStory = async (story) => {
    setActiveStory(story);
    try {
      const chs = await api.getChapters(story.id);
      setChapters(chs);
      if (chs.length > 0) {
        selectChapter(chs[0]);
      } else {
        setActiveChapter(null);
        setChapterTitle('');
        setChapterContent('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectChapter = (ch) => {
    setActiveChapter(ch);
    setChapterTitle(ch.title || `Chapter ${ch.chapterNumber}`);
    setChapterContent(ch.content || '');
    setAutoSavedTime(ch.autoSavedAt ? new Date(ch.autoSavedAt).toLocaleTimeString() : 'Just now');
  };

  // Debounced Autosave
  const triggerAutosave = (newContent, newTitle) => {
    if (!activeStory || !activeChapter) return;
    setIsAutoSaving(true);

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        const updated = await api.updateChapter(activeStory.id, activeChapter.id, {
          title: newTitle !== undefined ? newTitle : chapterTitle,
          content: newContent !== undefined ? newContent : chapterContent,
        });

        // Update local list
        setChapters(prev => prev.map(c => c.id === updated.id ? updated : c));
        setAutoSavedTime(new Date().toLocaleTimeString());
      } catch (err) {
        console.error('Autosave error:', err);
      } finally {
        setIsAutoSaving(false);
      }
    }, 1200);
  };

  const handleContentChange = (e) => {
    const val = e.target.value;
    setChapterContent(val);
    triggerAutosave(val, chapterTitle);
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setChapterTitle(val);
    triggerAutosave(chapterContent, val);
  };

  const handleCreateNewChapter = async () => {
    if (!activeStory) return;
    try {
      const nextNum = chapters.length + 1;
      const newCh = await api.createChapter(activeStory.id, {
        title: `Chapter ${nextNum}: Untitled`,
        content: '',
      });
      setChapters([...chapters, newCh]);
      selectChapter(newCh);
      showToast(`Chapter ${nextNum} initialized.`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!newStoryTitle.trim()) {
      showToast('Story title is required.', 'error');
      return;
    }

    try {
      const created = await api.createStory({
        universeId: activeUniverse.id,
        title: newStoryTitle.trim(),
        synopsis: newStorySynopsis.trim(),
        genre: newStoryGenre,
        tone: writingTone,
      });

      setStories([created, ...stories]);
      setShowNewStoryModal(false);
      setNewStoryTitle('');
      setNewStorySynopsis('');
      selectStory(created);
      showToast(`Story "${created.title}" forged!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // AI Generation Handlers
  const handleGenerateChapter = async () => {
    if (!activeUniverse || !activeStory) return;
    setIsGenerating(true);
    try {
      const prompt = chapterPrompt || `Write Chapter ${activeChapter?.chapterNumber || 1} developing the central conflict.`;
      const res = await api.generateChapter({
        prompt,
        storyTitle: activeStory.title,
        universeId: activeUniverse.id,
        chapterNumber: activeChapter?.chapterNumber || 1,
        tone: writingTone,
        genre: activeStory.genre,
      });

      const newText = chapterContent ? `${chapterContent}\n\n${res.text}` : res.text;
      setChapterContent(newText);
      triggerAutosave(newText, chapterTitle);

      if (res.remainingCredits !== undefined) updateCreditsLocally(res.remainingCredits);
      showToast(`Chapter drafted using ${res.model}!`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinueStory = async () => {
    if (!activeUniverse || !activeStory) return;
    setIsGenerating(true);
    try {
      const res = await api.continueStory({
        existingContent: chapterContent,
        prompt: 'Continue the narrative seamlessly, introducing a sudden revelation or escalating physical tension.',
        universeId: activeUniverse.id,
      });

      const newText = `${chapterContent}\n\n${res.text}`;
      setChapterContent(newText);
      triggerAutosave(newText, chapterTitle);

      if (res.remainingCredits !== undefined) updateCreditsLocally(res.remainingCredits);
      showToast('Narrative continued seamlessly!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlotTwists = async () => {
    if (!activeUniverse || !activeStory) return;
    setIsGenerating(true);
    try {
      const res = await api.generatePlotTwist({
        universeId: activeUniverse.id,
        storySummary: activeStory.synopsis || chapterContent.slice(0, 300),
      });

      setTwistResults(res.twists || []);
      if (res.remainingCredits !== undefined) updateCreditsLocally(res.remainingCredits);
      showToast('Plot twists generated by narrative strategist!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContinuityCheck = async () => {
    if (!activeUniverse || !chapterContent.trim()) {
      showToast('Write or generate some chapter text first to audit continuity.', 'warning');
      return;
    }
    setIsGenerating(true);
    try {
      const res = await api.checkContinuity({
        universeId: activeUniverse.id,
        textToCheck: chapterContent,
      });

      setContinuityReport(res);
      if (res.remainingCredits !== undefined) updateCreditsLocally(res.remainingCredits);
      showToast('Canon continuity audit completed!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBrainstorm = async () => {
    if (!activeUniverse) return;
    setIsGenerating(true);
    try {
      const res = await api.brainstorm({
        prompt: 'Sub-plots, secret factions, and high-tension scenarios',
        category: 'Lore Expansion',
        universeId: activeUniverse.id,
      });

      setBrainstormResults(res.ideas || []);
      if (res.remainingCredits !== undefined) updateCreditsLocally(res.remainingCredits);
      showToast('Brainstorming session generated!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const wordCount = chapterContent ? chapterContent.trim().split(/\s+/).filter(Boolean).length : 0;
  const readingTimeMinutes = Math.ceil(wordCount / 200);

  if (!activeUniverse) {
    return (
      <div className="p-12 text-center glass-panel rounded-3xl">
        <Feather className="w-12 h-12 text-primary mx-auto mb-3" />
        <h2 className="text-xl font-bold">Please Select an Active Universe</h2>
        <p className="text-xs text-gray-500 mt-1">
          Select or establish a universe to write stories interconnected with its lore.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
              <Feather className="w-7 h-7 text-primary" />
              <span>AI Story Studio</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary">
              {activeUniverse.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Write immersive chapter-by-chapter manuscripts powered by your connected universe lore.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {activeStory && (
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <Download className="w-4 h-4 text-primary" />
              <span>Export Manuscript</span>
            </button>
          )}

          <button
            onClick={() => setShowNewStoryModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-glow-primary transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Story</span>
          </button>
        </div>
      </div>

      {/* Story & Chapter Selector Bar */}
      <div className="glass-panel p-3 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Story Selector Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
          <select
            value={activeStory?.id || ''}
            onChange={(e) => {
              const found = stories.find(s => s.id === e.target.value);
              if (found) selectStory(found);
            }}
            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none"
          >
            {stories.map(s => (
              <option key={s.id} value={s.id}>{s.title} ({s.genre})</option>
            ))}
          </select>
        </div>

        {/* Chapter Tabs */}
        {activeStory && (
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-1">
            {chapters.map(ch => (
              <button
                key={ch.id}
                onClick={() => selectChapter(ch)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeChapter?.id === ch.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                Ch. {ch.chapterNumber}
              </button>
            ))}
            <button
              onClick={handleCreateNewChapter}
              className="p-1.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-primary text-gray-400 hover:text-primary transition-all"
              title="Add Chapter"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* MAIN TWO-COLUMN STUDIO WORKSPACE */}
      {activeStory && activeChapter ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS: WRITING DESK */}
          <div className="lg:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
            {/* Editor Top Bar: Title & Autosave status */}
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-gray-800 gap-4">
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={handleTitleChange}
                  placeholder="Chapter Title..."
                  className="w-full text-xl sm:text-2xl font-bold bg-transparent border-none text-gray-900 dark:text-white focus:outline-none placeholder-gray-400 font-serif"
                />

                <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400 flex-shrink-0">
                  {isAutoSaving ? (
                    <span className="flex items-center gap-1 text-primary animate-pulse">
                      <Save className="w-3.5 h-3.5" />
                      <span>Saving...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-emeraldGreen">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Saved {autoSavedTime}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Writing Canvas Textarea */}
              <textarea
                rows={20}
                value={chapterContent}
                onChange={handleContentChange}
                placeholder="The wind sweeping through the shattered spires tasted of ozone... Begin typing your chapter or use the Creative Assistant panel on the right to draft from an outline."
                className="w-full p-2 bg-transparent text-gray-800 dark:text-gray-100 text-sm sm:text-base leading-relaxed resize-none focus:outline-none font-serif placeholder-gray-400"
              />
            </div>

            {/* Editor Bottom Stats Bar & Quick Actions */}
            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  {wordCount.toLocaleString()} words
                </span>
                <span>&bull;</span>
                <span>~{readingTimeMinutes} min read</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleContinueStory}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-300 font-bold text-xs transition-all disabled:opacity-50"
                  title="AI seamlessly writes the next dramatic beats from your last sentence"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>⚡ Continue Story</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: CREATIVE ASSISTANT PANEL */}
          <div className="glass-panel p-6 rounded-3xl border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Creative Assistant</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Canon Linked
                </span>
              </div>

              {/* Tone / Style Selector */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">
                  Narrative Tone & Voice
                </label>
                <select
                  value={writingTone}
                  onChange={(e) => setWritingTone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none"
                >
                  <option value="Epic & Atmospheric">Epic & Atmospheric</option>
                  <option value="Grimdark & Gritty">Grimdark & Gritty</option>
                  <option value="Whimsical & Mythic">Whimsical & Mythic</option>
                  <option value="Tense Psychological Thriller">Tense Psychological Thriller</option>
                  <option value="Cyber-Noir & Melancholic">Cyber-Noir & Melancholic</option>
                  <option value="Fast-Paced Action">Fast-Paced Action</option>
                </select>
              </div>

              {/* Assistant Tabs */}
              <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800/60 p-1">
                <button
                  onClick={() => setAssistantTab('generate')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    assistantTab === 'generate'
                      ? 'bg-white dark:bg-darkCard text-primary shadow-sm'
                      : 'text-gray-500'
                  }`}
                >
                  Draft
                </button>
                <button
                  onClick={() => setAssistantTab('twists')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    assistantTab === 'twists'
                      ? 'bg-white dark:bg-darkCard text-primary shadow-sm'
                      : 'text-gray-500'
                  }`}
                >
                  Plot Twists
                </button>
                <button
                  onClick={() => setAssistantTab('continuity')}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    assistantTab === 'continuity'
                      ? 'bg-white dark:bg-darkCard text-primary shadow-sm'
                      : 'text-gray-500'
                  }`}
                >
                  Continuity
                </button>
              </div>

              {/* TAB 1: DRAFT GENERATOR */}
              {assistantTab === 'generate' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Scene Objective / Outline
                    </label>
                    <textarea
                      rows={3}
                      value={chapterPrompt}
                      onChange={(e) => setChapterPrompt(e.target.value)}
                      placeholder="e.g. Valen and Selyse discover the moon seal is broken while dodging Hound patrols..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  <button
                    onClick={handleGenerateChapter}
                    disabled={isGenerating}
                    className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-glow-primary transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Synthesizing Lore...</span>
                      </span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Scene Draft</span>
                      </>
                    )}
                  </button>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-[11px] text-gray-500 space-y-1">
                    <div className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emeraldGreen" />
                      <span>Context Canon Rules Enforced</span>
                    </div>
                    <p>
                      The AI generator automatically injects the magic rules, character traits, and location climate of {activeUniverse.name}.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: PLOT TWISTS */}
              {assistantTab === 'twists' && (
                <div className="space-y-3">
                  <button
                    onClick={handlePlotTwists}
                    disabled={isGenerating}
                    className="w-full py-2.5 rounded-xl bg-amberGold hover:bg-amberGold-600 text-white font-bold text-xs shadow-glow-amber transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? 'Analyzing Lore...' : (
                      <>
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Generate Organic Plot Twists</span>
                      </>
                    )}
                  </button>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {twistResults.map((twist, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs"
                      >
                        <h4 className="font-bold text-amber-600 dark:text-amber-400 mb-0.5">{twist.title}</h4>
                        <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed mb-1.5">{twist.description}</p>
                        <button
                          onClick={() => {
                            const newText = `${chapterContent}\n\n[PLOT REVELATION: ${twist.title}]\n${twist.description}`;
                            setChapterContent(newText);
                            triggerAutosave(newText, chapterTitle);
                            showToast('Plot twist inserted into manuscript!', 'success');
                          }}
                          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Insert into Draft</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: CONTINUITY & PARADOX AUDITOR */}
              {assistantTab === 'continuity' && (
                <div className="space-y-3">
                  <button
                    onClick={handleContinuityCheck}
                    disabled={isGenerating}
                    className="w-full py-2.5 rounded-xl bg-emeraldGreen hover:bg-emeraldGreen-600 text-white font-bold text-xs shadow-glow-emerald transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? 'Auditing Canon...' : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Audit Story Continuity</span>
                      </>
                    )}
                  </button>

                  {continuityReport ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold">
                        <span>Overall Health</span>
                        <span>{continuityReport.overallHealth}</span>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {(continuityReport.reports || []).map((rep, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border text-[11px] leading-relaxed ${
                              rep.status === 'verified'
                                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                                : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300'
                            }`}
                          >
                            <span className="font-bold block mb-0.5">[{rep.category}]</span>
                            <span>{rep.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-500 text-center py-4">
                      Click audit to verify magic rules, travel times, and character lifespans.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-16 text-center glass-panel rounded-3xl">
          <BookOpen className="w-12 h-12 text-primary mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">No Story Selected</h3>
          <p className="text-xs text-gray-500 mb-6">Create your first story to launch the AI writing desk.</p>
          <button
            onClick={() => setShowNewStoryModal(true)}
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs shadow-glow-primary"
          >
            Create First Story
          </button>
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

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Create New Story</h3>
            <p className="text-xs text-gray-500 mb-6">Establish a new narrative arc in {activeUniverse.name}</p>

            <form onSubmit={handleCreateStory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Story Title *
                </label>
                <input
                  type="text"
                  required
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  placeholder="e.g. Echoes of the Fractured Moon"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Story Premise / Synopsis
                </label>
                <textarea
                  rows={3}
                  value={newStorySynopsis}
                  onChange={(e) => setNewStorySynopsis(e.target.value)}
                  placeholder="When the exiled prince discovers an ancient prophecy..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Genre
                </label>
                <select
                  value={newStoryGenre}
                  onChange={(e) => setNewStoryGenre(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="fantasy">High Fantasy</option>
                  <option value="scifi">Science Fiction</option>
                  <option value="mythology">Mythology</option>
                  <option value="dystopian">Dystopian</option>
                  <option value="historical">Historical</option>
                </select>
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
                  Launch Manuscript
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {showExportModal && activeStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-[#171727] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800">
            <button
              onClick={() => setShowExportModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Export Manuscript</h3>
            <p className="text-xs text-gray-500 mb-6">Download "{activeStory.title}" in your preferred format</p>

            <div className="space-y-3">
              <a
                href={`/api/export/story/${activeStory.id}?format=markdown`}
                download
                className="w-full p-4 rounded-2xl glass-panel hover:border-primary/50 flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    MD
                  </div>
                  <div className="text-left">
                    <div>Markdown Format (.md)</div>
                    <div className="text-[10px] text-gray-400 font-normal">Compatible with Obsidian, Notion, GitHub</div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-primary group-hover:translate-y-0.5 transition-transform" />
              </a>

              <a
                href={`/api/export/story/${activeStory.id}?format=docx`}
                download
                className="w-full p-4 rounded-2xl glass-panel hover:border-electric/50 flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-electric/10 text-electric flex items-center justify-center font-bold">
                    DOC
                  </div>
                  <div className="text-left">
                    <div>Microsoft Word Document (.doc/.docx)</div>
                    <div className="text-[10px] text-gray-400 font-normal">Pre-styled manuscript with page breaks</div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-electric group-hover:translate-y-0.5 transition-transform" />
              </a>

              <a
                href={`/api/export/story/${activeStory.id}?format=html`}
                target="_blank"
                rel="noreferrer"
                className="w-full p-4 rounded-2xl glass-panel hover:border-amberGold/50 flex items-center justify-between text-xs font-bold text-gray-800 dark:text-gray-200 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amberGold/10 text-amberGold flex items-center justify-center font-bold">
                    PDF
                  </div>
                  <div className="text-left">
                    <div>Printable Reader / PDF Layout</div>
                    <div className="text-[10px] text-gray-400 font-normal">Opens print-formatted reader in new tab</div>
                  </div>
                </div>
                <Download className="w-4 h-4 text-amberGold group-hover:translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
