import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Globe,
  Compass,
  Users,
  Feather,
  GitFork,
  Clock,
  ShieldCheck,
  Check,
  Star,
  ChevronDown,
  Play,
  Share2,
  Lock,
  Layers,
  Zap,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';

export default function LandingPage({ onEnterApp }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('register');
  const [activeUniverseTab, setActiveUniverseTab] = useState('aethelgard');
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);
  const [legalModal, setLegalModal] = useState(null); // 'terms' | 'privacy'

  const handleOpenAuth = (tab = 'register') => {
    setAuthTab(tab);
    setAuthModalOpen(true);
  };

  const faqs = [
    {
      q: 'What is the "Connected Universe Engine" and how does it work?',
      a: 'Unlike generic story generators that produce isolated stories, StoryVerse AI interconnects every character, kingdom, timeline era, and magical law into one shared relational database. When writing a chapter in the Story Studio or generating dialogue, the AI automatically retrieves this context so your lore remains 100% consistent and contradiction-free.',
    },
    {
      q: 'Can I use my own Gemini or OpenAI API keys?',
      a: 'Yes! StoryVerse AI comes equipped with our proprietary Contextual Story Engine out of the box in Demo Mode. If you prefer live LLM generation, you can input your own Google Gemini or OpenAI API key in Account Settings to enjoy unlimited live completions.',
    },
    {
      q: 'Can I export my finished stories to PDF and DOCX?',
      a: 'Yes. StoryVerse AI supports clean exports to formatted Microsoft Word (.docx/.doc), Markdown (.md), JSON lore archives, and print-ready PDF layouts.',
    },
    {
      q: 'How do interactive branching stories work?',
      a: 'With our node-based story builder, you create decision points where readers choose paths. You can preview the choices as an interactive reader game or publish it for the StoryVerse community to play.',
    },
    {
      q: 'Are my fictional universes private or public?',
      a: 'You have complete control. All projects are private by default. You can choose to publish any story, universe, or interactive playthrough to the public Community Discovery tab at any time.',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas dark:bg-darkCanvas text-brandText dark:text-darkText transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar onOpenAuth={handleOpenAuth} onNavigate={(tab) => {
        if (tab === 'dashboard') onEnterApp();
      }} />

      {/* HERO SECTION */}
      <section id="hero" className="relative pt-36 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        {/* Ambient Gradient Blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 dark:bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-electric/15 dark:bg-electric/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-amberGold/10 dark:bg-amberGold/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-primary/20 text-xs font-bold text-primary dark:text-primary-300 mb-8 shadow-sm animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span>Introducing the Connected Universe Engine</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-gray-500 font-medium">SaaS 2.0</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.15] mb-6">
            Your Imagination Deserves Its{' '}
            <span className="bg-gradient-to-r from-primary via-electric to-amberGold bg-clip-text text-transparent">
              Own Universe.
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
            Create interconnected worlds, unforgettable characters and immersive stories with the power of AI. One unified workspace where lore, timelines, and narratives never contradict.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => handleOpenAuth('register')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-primary via-primary-600 to-electric hover:from-primary-600 hover:to-electric text-white font-extrabold text-base shadow-glow-primary hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
            >
              <span>Start Creating Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel hover:bg-white dark:hover:bg-darkCard font-bold text-base text-gray-700 dark:text-gray-200 transition-all flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-800"
            >
              <Compass className="w-5 h-5 text-electric" />
              <span>Explore Features</span>
            </button>
          </div>

          {/* Storytelling-Themed Visual Showcase: Interconnected Universe Hub */}
          <div className="relative max-w-5xl mx-auto rounded-3xl p-2 sm:p-4 glass-panel border border-primary/20 shadow-2xl overflow-hidden group">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#121224] to-[#1E1B38] p-6 sm:p-10 text-left border border-white/10">
              {/* Header Bar of the Showcase */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono text-gray-400">storyverse://workspace/aethelgard-prime</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-[11px] font-bold text-primary-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Connected Universe Engine Active</span>
                </div>
              </div>

              {/* Visual Multi-Layer Nodes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {/* Node 1: World Lore */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-2.5 mb-3 text-primary-300">
                    <Globe className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">World Realm</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Aethelgard High Realm</h3>
                  <p className="text-xs text-gray-300 line-clamp-3 mb-4">
                    Fractured twin moons Selene and Umbra bleed volatile aether crystals into mortal leylines.
                  </p>
                  <div className="flex items-center gap-1.5 text-[11px] text-primary-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Aether Resonance Law Verified</span>
                  </div>
                </div>

                {/* Node 2: Interconnected Characters */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-electric/50 transition-all">
                  <div className="flex items-center gap-2.5 mb-3 text-electric">
                    <Users className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Linked Characters</span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                      alt="Prince Valen"
                      className="w-9 h-9 rounded-xl object-cover ring-2 ring-electric/40"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">Prince Valen</h4>
                      <span className="text-[10px] text-gray-400">Umbra Shard Host &bull; Protagonist</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-300 line-clamp-2 mb-3">
                    Bears crystalline Vitreous Blight on left arm; allied with High Archivist Selyse.
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-electric font-semibold">
                    <span>Active in 4 Chapters & 3 Dialogues</span>
                  </div>
                </div>

                {/* Node 3: AI Story Studio Synthesis */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-amberGold/50 transition-all">
                  <div className="flex items-center gap-2.5 mb-3 text-amberGold">
                    <Feather className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">AI Story Synthesis</span>
                  </div>
                  <div className="text-xs font-mono text-gray-300 bg-black/40 p-3 rounded-xl border border-white/5 mb-3 leading-relaxed">
                    "Valen drew the umbral blade. The resonance hummed in harmony with the lunar tides of Thalor..."
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
                    <span>Auto-Saved 2s ago</span>
                    <span className="text-emerald-400 font-bold">100% Canon Match</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM FEATURES SECTION */}
      <section id="features" className="py-24 border-t border-gray-100 dark:border-gray-800/80 bg-white/50 dark:bg-darkCard/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
              Core Creative Architecture
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Everything You Need to Build Endless Universes
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              A cohesive suite of intelligent creative tools, completely interconnected by our unified universe graph.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl glass-panel hover:border-primary/40 hover:shadow-glow-primary transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Connected Universe Engine</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Our core differentiator. Define your magic systems, technological paradigms, factions, and cosmological laws once—and watch them automatically permeate every story, character arc, and dialogue.
              </p>
              <div className="text-xs font-bold text-primary flex items-center gap-1">
                <span>Relational Knowledge System</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl glass-panel hover:border-electric/40 hover:shadow-glow-electric transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-electric/10 text-electric flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">World Builder & Interactive Map</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Design kingdoms, cities, planets, and civilizations. Define cultures, political regimes, and defense systems with an interactive drag-and-drop map to link borders and trading routes.
              </p>
              <div className="text-xs font-bold text-electric flex items-center gap-1">
                <span>Interactive Visual Geography</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl glass-panel hover:border-amberGold/40 hover:shadow-glow-amber transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amberGold/10 text-amberGold flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Character Lab & Relationship Graph</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Craft multi-dimensional protagonists, mentors, and rivals. Track personality traits, motivations, psychological wounds, and explore visual relationship networks spanning family, rivals, and alliances.
              </p>
              <div className="text-xs font-bold text-amberGold flex items-center gap-1">
                <span>Multi-Character Psychology</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl glass-panel hover:border-primary/40 hover:shadow-glow-primary transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
                <Feather className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Story Studio & Creative Copilot</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Write chapter-by-chapter with an AI novelist that strictly respects your established lore. Autosave drafts, adjust writing tones, inject organic plot twists, and export to DOCX or PDF.
              </p>
              <div className="text-xs font-bold text-primary flex items-center gap-1">
                <span>Autosave & Full Export</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl glass-panel hover:border-emeraldGreen/40 hover:shadow-glow-emerald transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emeraldGreen/10 text-emeraldGreen flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Timeline Manager & Paradox Auditor</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Arrange historical events chronologically across fictional eras. Connect events to character lifespans and locations, with an automated continuity auditor that warns you of paradoxical discrepancies.
              </p>
              <div className="text-xs font-bold text-emeraldGreen flex items-center gap-1">
                <span>Chronological Inconsistency Guard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl glass-panel hover:border-electric/40 hover:shadow-glow-electric transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-electric/10 text-electric flex items-center justify-center font-bold mb-6 group-hover:scale-110 transition-transform">
                <GitFork className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Interactive Branching Narratives</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Build decision-based gamebooks with branching choice nodes and alternative endings. Test your interactive narratives directly in an immersive player preview mode and publish them for the community.
              </p>
              <div className="text-xs font-bold text-electric flex items-center gap-1">
                <span>Visual Flow & Reader Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS (3 Simple Steps) */}
      <section className="py-24 border-t border-gray-100 dark:border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
              Effortless Creative Workflow
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              How It Works: From Concept to Universe
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              Three simple steps to transform your raw imagination into an interconnected creative franchise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl glass-panel relative border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-lg mb-6 shadow-glow-primary">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Architect Your Universe Lore</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Choose your genre paradigm—high fantasy, cyberpunk sci-fi, mythology, or dystopian. Establish the physical and metaphysical rules of magic or science.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl glass-panel relative border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 rounded-2xl bg-electric text-white flex items-center justify-center font-black text-lg mb-6 shadow-glow-electric">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Populate Characters & Map</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Generate or handcraft compelling characters with clear goals, flaws, and relationship ties. Plot out cities, kingdoms, and historical era milestones on the timeline.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl glass-panel relative border border-gray-200 dark:border-gray-800">
              <div className="w-12 h-12 rounded-2xl bg-amberGold text-white flex items-center justify-center font-black text-lg mb-6 shadow-glow-amber">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Unleash Stories & Choices</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Use the AI Story Studio to write chapter-by-chapter epics, simulate realistic character dialogues, or construct interactive branching gamebooks with multiple endings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EXAMPLE FICTIONAL UNIVERSES */}
      <section id="explore" className="py-24 border-t border-gray-100 dark:border-gray-800/80 bg-white/50 dark:bg-darkCard/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
              Preloaded Creative Canvases
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Explore Example Fictional Universes
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              Immerse yourself in rich, ready-to-write universes preloaded with established characters, locations, and storylines.
            </p>
          </div>

          {/* Universe Tabs */}
          <div className="flex justify-center gap-3 mb-10">
            <button
              onClick={() => setActiveUniverseTab('aethelgard')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeUniverseTab === 'aethelgard'
                  ? 'bg-primary text-white shadow-glow-primary'
                  : 'glass-panel text-gray-600 dark:text-gray-300'
              }`}
            >
              The Shattered Realm of Aethelgard (High Fantasy)
            </button>
            <button
              onClick={() => setActiveUniverseTab('cyberia')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeUniverseTab === 'cyberia'
                  ? 'bg-electric text-white shadow-glow-electric'
                  : 'glass-panel text-gray-600 dark:text-gray-300'
              }`}
            >
              Neo-Cyberia 2184: The Sub-Grid (Cyberpunk Sci-Fi)
            </button>
          </div>

          {/* Showcase Card */}
          {activeUniverseTab === 'aethelgard' ? (
            <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-primary/20 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-4 inline-block">
                  High Fantasy Canon
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
                  The Shattered Realm of Aethelgard
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                  Three millennia ago, the Twin Moons fractured in orbit. Shards of luminescent aether-glass fell across the continents, giving birth to volatile runic sorcery, floating crystal spires, and deadly vitreous blights.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-700 dark:text-gray-200">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span>Key Characters: Prince Valen Shadowthorn, High Archivist Selyse, Korath</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-700 dark:text-gray-200">
                    <span className="w-2 h-2 rounded-full bg-electric" />
                    <span>Prime Locations: Citadel of Dawn, Sunken Spires of Thalor, Frostfall Peak</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-700 dark:text-gray-200">
                    <span className="w-2 h-2 rounded-full bg-amberGold" />
                    <span>Magic Law: Aetheric Resonance — casting demands spirit heat</span>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-glow-primary transition-all flex items-center gap-2"
                >
                  <span>Enter Aethelgard Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-900 to-indigo-950 p-6 text-white border border-white/10 shadow-inner">
                <div className="text-xs font-mono text-purple-300 mb-2">// Active Story: Echoes of the Fractured Moon</div>
                <h4 className="text-lg font-bold mb-3 font-serif">Chapter 1: The Vitreous Oath</h4>
                <p className="text-xs text-gray-300 leading-relaxed font-serif italic mb-4">
                  "The wind sweeping through the Whispering Hollows tasted of ozone and pulverized silver. Valen adjusted the heavy vambrace over his left arm, grimacing as the dark crystalline tendrils pulsed beneath his skin..."
                </p>
                <div className="flex items-center justify-between text-[11px] text-purple-300 pt-4 border-t border-white/10">
                  <span>3 Interlinked Characters</span>
                  <span>4 Recorded Eras</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-electric/20 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-electric/10 text-electric border border-electric/20 mb-4 inline-block">
                  Cyberpunk Sci-Fi Canon
                </span>
                <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">
                  Neo-Cyberia 2184: The Sub-Grid
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                  A three-hundred-level vertical arcology built over flooded northern ruins. Humanity shares neural subnetworks with emergent synthetic quantum intelligences while megacorps monopolize cortical stacks.
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-700 dark:text-gray-200">
                    <span className="w-2 h-2 rounded-full bg-electric" />
                    <span>Key Characters: Kaelen Voss (Neural Hacker), Mara Jin (Street Ronin)</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-700 dark:text-gray-200">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span>Prime Locations: District 0 Skyline Monolith, Neon Alley Level -04</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-700 dark:text-gray-200">
                    <span className="w-2 h-2 rounded-full bg-amberGold" />
                    <span>Tech Law: Neural Synchronicity — 80%+ triggers lethal neural bleed</span>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="px-6 py-3 rounded-xl bg-electric hover:bg-electric-600 text-white font-bold text-xs shadow-glow-electric transition-all flex items-center gap-2"
                >
                  <span>Enter Neo-Cyberia Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden bg-gradient-to-tr from-cyan-950 to-slate-900 p-6 text-white border border-white/10 shadow-inner">
                <div className="text-xs font-mono text-cyan-300 mb-2">// Active Story: The Zero-Day Infiltration</div>
                <h4 className="text-lg font-bold mb-3 font-mono">Mission Log: Level -04 Breach</h4>
                <p className="text-xs text-gray-300 leading-relaxed font-mono mb-4">
                  "Synthetic acid rain washed the neon billboards of Level -04. Kaelen jacked his neural bus directly into the optical feed, his thermal heatsinks humming as the security firewalls crumbled into telemetry noise..."
                </p>
                <div className="flex items-center justify-between text-[11px] text-cyan-300 pt-4 border-t border-white/10">
                  <span>2 Augmentation Profiles</span>
                  <span>1 Neural Protocol Law</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CREATOR TESTIMONIALS (Clearly marked illustrative as required) */}
      <section className="py-24 border-t border-gray-100 dark:border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
              Creator Community Voices
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-2">
              Loved by Authors & Worldbuilders
            </h2>
            <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold mt-2">
              Note: Illustrative user testimonials representing creator feedback
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl glass-panel border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amberGold mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amberGold" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic mb-6">
                  "StoryVerse AI solved the biggest issue I faced with other tools: continuity. When I write chapter 8, the AI remembers that Korath lost his left shoulder plate in chapter 2. It’s like having an encyclopedic continuity editor sitting right beside me."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                  alt="Aria Chen"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold">Aria Chen</h4>
                  <p className="text-[11px] text-gray-500">Fantasy Novelist & Worldbuilder</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl glass-panel border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amberGold mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amberGold" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic mb-6">
                  "The Dialogue Generator alone is worth the subscription. Selecting two characters with opposing moral codes and a tense location produces realistic debates that feel authentically drawn from their backstories."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                  alt="Marcus Brody"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold">Marcus Brody</h4>
                  <p className="text-[11px] text-gray-500">Narrative Game Designer</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl glass-panel border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amberGold mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amberGold" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic mb-6">
                  "Building branching storylines with the Interactive Story node editor is so intuitive. We plotted a 12-branch sci-fi gamebook in one weekend and published it directly to our reader community."
                </p>
              </div>
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
                  alt="Devon Vance"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-xs font-bold">Devon Vance</h4>
                  <p className="text-[11px] text-gray-500">Interactive Fiction Author</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING PLANS */}
      <section id="pricing" className="py-24 border-t border-gray-100 dark:border-gray-800/80 bg-white/50 dark:bg-darkCard/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
              Transparent SaaS Pricing
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Designed for Solo Authors & Creative Studios
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              Start free today. Scale up as your fictional multiverse expands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* Plan 1: Explorer */}
            <div className="p-8 rounded-3xl glass-panel border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Explorer</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold">₹0</span>
                  <span className="text-xs text-gray-500">/ forever free</span>
                </div>
                <p className="text-xs text-gray-500 mb-6">
                  Perfect for hobbyists and students taking their first steps in worldbuilding.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-emeraldGreen flex-shrink-0" />
                    <span>150 Starter AI Credits</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-emeraldGreen flex-shrink-0" />
                    <span>Up to 3 Fictional Universes</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-emeraldGreen flex-shrink-0" />
                    <span>Basic Character Lab & Profiles</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-emeraldGreen flex-shrink-0" />
                    <span>AI Story Studio & Drafts</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-emeraldGreen flex-shrink-0" />
                    <span>Community Access & Publishing</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleOpenAuth('register')}
                className="w-full py-3 rounded-xl border border-gray-300 dark:border-gray-700 font-bold text-xs hover:border-primary hover:text-primary transition-all"
              >
                Get Started Free
              </button>
            </div>

            {/* Plan 2: Creator (Highlighted) */}
            <div className="p-8 rounded-3xl glass-panel border-2 border-primary shadow-glow-primary relative flex flex-col justify-between">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-[10px] font-extrabold uppercase tracking-widest shadow-md">
                Most Popular for Novelists
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Creator</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold text-primary">₹299</span>
                  <span className="text-xs text-gray-500">/ month</span>
                </div>
                <p className="text-xs text-gray-500 mb-6">
                  For serious authors, novelists, and screenwriters creating expansive universes.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>1,000 AI Credits per month</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Unlimited Universes & Characters</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Advanced World Builder with Map Links</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Visual Character Relationship Graphs</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Dialogue Generator & Script Workspace</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Interactive Branching Story Builder</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>Full Exports (DOCX, PDF, Markdown)</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleOpenAuth('register')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-extrabold text-xs shadow-glow-primary transition-all"
              >
                Upgrade to Creator
              </button>
            </div>

            {/* Plan 3: Studio */}
            <div className="p-8 rounded-3xl glass-panel border border-gray-200 dark:border-gray-800 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-electric mb-2">Studio</div>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-extrabold">₹999</span>
                  <span className="text-xs text-gray-500">/ month</span>
                </div>
                <p className="text-xs text-gray-500 mb-6">
                  For creative teams, game studios, writing rooms, and production houses.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-electric flex-shrink-0" />
                    <span>5,000 AI Credits per month</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-electric flex-shrink-0" />
                    <span>All Creator Features Included</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-electric flex-shrink-0" />
                    <span>Multi-Creator Collaborative Workspaces</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-electric flex-shrink-0" />
                    <span>Custom LLM API Key Integration</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-electric flex-shrink-0" />
                    <span>Timeline Paradox & Continuity Auditor</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-electric flex-shrink-0" />
                    <span>Priority Fast-Lane Generation & Support</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleOpenAuth('register')}
                className="w-full py-3 rounded-xl border border-electric text-electric hover:bg-electric hover:text-white font-bold text-xs transition-all"
              >
                Choose Studio
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-24 border-t border-gray-100 dark:border-gray-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Everything you need to know about the Connected Universe Engine and platform policies.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl glass-panel border border-gray-200 dark:border-gray-800 overflow-hidden"
              >
                <button
                  onClick={() => setFaqOpenIndex(faqOpenIndex === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-gray-900 dark:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-primary transition-transform duration-200 flex-shrink-0 ${
                      faqOpenIndex === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {faqOpenIndex === idx && (
                  <div className="px-5 pb-5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="about" className="py-16 border-t border-gray-200 dark:border-gray-800/80 bg-white/80 dark:bg-[#0E0E18]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-electric flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-lg bg-gradient-to-r from-primary to-electric bg-clip-text text-transparent">
                  STORYVERSE AI
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                "Imagine Worlds. Create Stories. Build Universes."
                The intelligent world-building and narrative platform for creative authors and visionaries.
              </p>
              <div className="text-[11px] text-gray-400">
                &copy; {new Date().getFullYear()} StoryVerse AI Inc. All rights reserved.
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-4">
                Platform
              </h4>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                <li><a href="#features" className="hover:text-primary">Connected Universe Engine</a></li>
                <li><a href="#features" className="hover:text-primary">World Builder & Maps</a></li>
                <li><a href="#features" className="hover:text-primary">Character Lab</a></li>
                <li><a href="#features" className="hover:text-primary">AI Story Studio</a></li>
                <li><a href="#features" className="hover:text-primary">Interactive Stories</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-4">
                Community & Showcase
              </h4>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                <li><a href="#explore" className="hover:text-primary">The Shattered Realm</a></li>
                <li><a href="#explore" className="hover:text-primary">Neo-Cyberia 2184</a></li>
                <li><button onClick={() => handleOpenAuth('login')} className="hover:text-primary">Creator Profiles</button></li>
                <li><button onClick={() => handleOpenAuth('login')} className="hover:text-primary">Public Stories Feed</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 mb-4">
                Legal & Governance
              </h4>
              <ul className="space-y-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
                <li>
                  <button onClick={() => setLegalModal('terms')} className="hover:text-primary text-left">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => setLegalModal('privacy')} className="hover:text-primary text-left">
                    Privacy Policy & IP Rights
                  </button>
                </li>
                <li>
                  <span className="text-[11px] text-gray-400">
                    Creators retain 100% intellectual property ownership of all generated universe lore.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialTab={authTab}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={onEnterApp}
      />

      {/* Legal Modal (Terms / Privacy) */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#171727] rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold mb-3">
              {legalModal === 'terms' ? 'Terms of Service' : 'Privacy Policy & Intellectual Property'}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              {legalModal === 'terms'
                ? 'Welcome to StoryVerse AI. By utilizing our platform, you agree to create respectful, original content. You retain 100% ownership of your universes, characters, and storylines. We never use your private lore to train public models without your explicit consent.'
                : 'Your privacy is paramount. All universe details, drafts, and characters remain strictly confidential and bound to your encrypted account session. You have the right to export or permanently purge your account at any time.'}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setLegalModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-primary text-white"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
