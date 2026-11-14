import React, { useState } from 'react';
import {
  Sparkles,
  Rocket,
  Play,
  ArrowRight,
  Globe,
  Users,
  Feather,
  MessageSquare,
  Clock,
  GitFork,
  Star,
  Wand2,
  BookOpen,
  Check,
  ChevronDown,
  Compass,
  Share2,
  CheckCircle2,
  Send,
  X,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';

export default function LandingPage({ onEnterApp }) {
  const { showToast } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState('register');
  const [selectedUniverseModal, setSelectedUniverseModal] = useState(null);
  const [pricingModal, setPricingModal] = useState(false);
  const [howItWorksModal, setHowItWorksModal] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(6); // Default active: Connected Universe Engine
  const [legalModal, setLegalModal] = useState(null);

  const handleOpenAuth = (tab = 'register') => {
    setAuthTab(tab);
    setAuthModalOpen(true);
  };

  const handleSubscribeNewsletter = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    showToast('Welcome to the StoryVerse community! Transmission received.', 'success');
    setNewsletterEmail('');
  };

  // Feature Dock Items matching the exact screenshot
  const featureDockItems = [
    { id: 'world', label: 'World Builder', icon: Globe, color: '#A855F7' },
    { id: 'character', label: 'Character Lab', icon: Users, color: '#20A5D8' },
    { id: 'studio', label: 'AI Story Studio', icon: Feather, color: '#EC4899' },
    { id: 'dialogue', label: 'Dialogue Generator', icon: MessageSquare, color: '#38BDF8' },
    { id: 'timeline', label: 'Timeline Manager', icon: Clock, color: '#34D399' },
    { id: 'interactive', label: 'Interactive Stories', icon: GitFork, color: '#F59E0B' },
    {
      id: 'engine',
      label: 'Connected Universe Engine',
      icon: Star,
      color: '#FBBF24',
      highlight: true,
    },
  ];

  // Example Community Universes matching screenshot
  const communityUniverses = [
    {
      id: 'lost-kingdom',
      name: 'The Lost Kingdom',
      genre: 'Fantasy',
      views: '120k views',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
      description: 'A forgotten golden citadel surrounded by crystalline falls, ancient dragons, and lost sun stones.',
    },
    {
      id: 'cyber-nova',
      name: 'Cyber Nova',
      genre: 'Sci-Fi',
      views: '88k views',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&auto=format&fit=crop&q=80',
      description: 'Vertical neon arcology where neural hackers and rogue quantum AIs fight across the Sub-Grid.',
    },
    {
      id: 'mystic-realms',
      name: 'Mystic Realms',
      genre: 'Adventure',
      views: '74k views',
      image: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=500&auto=format&fit=crop&q=80',
      description: 'Ancient whispering redwood sanctuaries alive with spirits of fallen titans and hidden shrines.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0718] text-[#F3F4F8] font-sans relative overflow-x-hidden selection:bg-[#7549E8]/30 selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenAuth={handleOpenAuth} onNavigate={(tab) => {
        if (tab === 'dashboard') onEnterApp();
        if (tab === 'features') {
          const el = document.getElementById('features-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }
        if (tab === 'explore') {
          const el = document.getElementById('cards-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }
        if (tab === 'pricing') setPricingModal(true);
        if (tab === 'about') {
          const el = document.getElementById('footer-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }
      }} />

      {/* ============================================================ */}
      {/* HERO SECTION WITH FANTASY CASTLE & ADVENTURER BACKGROUND ART */}
      {/* ============================================================ */}
      <section
        id="hero"
        className="relative pt-24 pb-8 sm:pt-28 sm:pb-12 min-h-screen flex flex-col justify-between overflow-hidden"
        style={{
          backgroundImage: `url('/hero-art.jpg')`,
          backgroundPosition: 'right 25% top 15%',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Cinematic Translucent Gradient Overlay on Left to maximize text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080614] via-[#0A0819]/90 md:via-[#0A0819]/75 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080614] via-transparent to-transparent pointer-events-none" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-10 sm:pt-14">
          <div className="max-w-2xl lg:max-w-3xl space-y-6">
            {/* Top Badge matching screenshot */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1A1435]/80 backdrop-blur-md border border-[#8B5CF6]/40 text-[#D8B4FE] text-xs font-semibold shadow-[0_0_20px_rgba(139,92,246,0.3)] animate-fade-in">
              <Sparkles className="w-3.5 h-3.5 text-[#C084FC] animate-pulse" />
              <span>The Next-Gen AI Storytelling Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-black text-white leading-[1.08] tracking-tight">
              Your Imagination<br />
              Deserves Its Own{' '}
              <span className="bg-gradient-to-r from-[#20A5D8] via-[#B862F8] to-[#F472B6] bg-clip-text text-transparent">
                Universe.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-gray-200/90 font-normal leading-relaxed max-w-xl">
              Create interconnected worlds, unforgettable characters and immersive stories with the power of AI.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => handleOpenAuth('register')}
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#7549E8] via-[#8B5CF6] to-[#A855F7] text-white font-extrabold text-sm shadow-[0_0_30px_rgba(117,73,232,0.6)] hover:scale-105 hover:shadow-[0_0_40px_rgba(117,73,232,0.8)] transition-all flex items-center gap-2 group"
              >
                <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                <span>Start Creating</span>
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('cards-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3.5 rounded-full bg-[#130F26]/70 hover:bg-[#130F26]/90 border border-white/20 text-white font-bold text-sm backdrop-blur-md transition-all flex items-center gap-2 hover:border-white/40"
              >
                <Play className="w-4 h-4 fill-white text-white" />
                <span>Explore Features</span>
              </button>
            </div>
          </div>
        </div>

        {/* FLOATING FEATURE DOCK (Center Horizontal Capsule Bar) */}
        <div id="features-section" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full mt-12 sm:mt-16 mb-4">
          <div className="rounded-2xl sm:rounded-full bg-[#0D0A20]/80 backdrop-blur-xl border border-white/10 p-2 shadow-2xl flex items-center justify-between overflow-x-auto gap-2 no-scrollbar">
            {featureDockItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeFeatureIndex === index;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveFeatureIndex(index);
                    handleOpenAuth('login');
                  }}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                    item.highlight
                      ? 'bg-gradient-to-r from-[#7549E8]/30 to-[#F59E0B]/20 border border-[#F59E0B]/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : isActive
                      ? 'bg-white/15 text-white border border-white/20 shadow-md'
                      : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}25` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: item.color }} />
                  </div>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* THREE GLASSMORPHIC BOTTOM PANELS ROW (MATCHING SCREENSHOT)   */}
      {/* ============================================================ */}
      <section id="cards-section" className="relative z-10 py-6 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* ---------------------------------------------------- */}
          {/* PANEL 1: HOW IT WORKS?                              */}
          {/* ---------------------------------------------------- */}
          <div className="rounded-3xl bg-[#0F0B24]/90 backdrop-blur-xl border border-white/10 p-6 flex flex-col justify-between shadow-2xl hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-white tracking-tight">How It Works?</h3>
                <button
                  onClick={() => setHowItWorksModal(true)}
                  className="text-xs font-semibold text-[#A855F7] hover:text-[#C084FC] flex items-center gap-1 transition-colors"
                >
                  <span>View Process</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-6">
                Turn your ideas into epic stories in just 3 simple steps.
              </p>

              {/* 3 Circular Steps Connected with Dotted Flow */}
              <div className="flex items-center justify-between gap-2 pt-2">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="relative mb-3">
                    <div className="w-14 h-14 rounded-full bg-[#7549E8]/20 border border-[#7549E8] flex items-center justify-center text-white shadow-[0_0_15px_rgba(117,73,232,0.4)]">
                      <Wand2 className="w-6 h-6 text-[#C084FC]" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#7549E8] text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-[#0F0B24]">
                      1
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-200 leading-tight">
                    Create Your<br />Universe
                  </span>
                </div>

                {/* Connecting Dotted Arrow 1 */}
                <div className="text-gray-500 font-bold mb-6">&rarr;</div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="relative mb-3">
                    <div className="w-14 h-14 rounded-full bg-[#20A5D8]/20 border border-[#20A5D8] flex items-center justify-center text-white shadow-[0_0_15px_rgba(32,165,216,0.4)]">
                      <Users className="w-6 h-6 text-[#38BDF8]" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#20A5D8] text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-[#0F0B24]">
                      2
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-200 leading-tight">
                    Develop Your<br />Characters
                  </span>
                </div>

                {/* Connecting Dotted Arrow 2 */}
                <div className="text-gray-500 font-bold mb-6">&rarr;</div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="relative mb-3">
                    <div className="w-14 h-14 rounded-full bg-[#EC4899]/20 border border-[#EC4899] flex items-center justify-center text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]">
                      <BookOpen className="w-6 h-6 text-[#F472B6]" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#EC4899] text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-[#0F0B24]">
                      3
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-200 leading-tight">
                    Generate Your<br />Stories
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleOpenAuth('register')}
              className="mt-6 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all text-center"
            >
              Start 3-Step Wizard &rarr;
            </button>
          </div>

          {/* ---------------------------------------------------- */}
          {/* PANEL 2: EXPLORE OUR UNIVERSES                      */}
          {/* ---------------------------------------------------- */}
          <div className="rounded-3xl bg-[#0F0B24]/90 backdrop-blur-xl border border-white/10 p-6 flex flex-col justify-between shadow-2xl hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-white tracking-tight">Explore Our Universes</h3>
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="text-xs font-semibold text-[#A855F7] hover:text-[#C084FC] flex items-center gap-1 transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Discover amazing worlds created by our community.
              </p>

              {/* 3 Universe Mini Cards */}
              <div className="grid grid-cols-3 gap-3">
                {communityUniverses.map(uni => (
                  <div
                    key={uni.id}
                    onClick={() => setSelectedUniverseModal(uni)}
                    className="group relative rounded-2xl overflow-hidden border border-white/10 bg-[#161230] cursor-pointer hover:border-[#8B5CF6]/50 transition-all hover:scale-[1.02]"
                  >
                    <div className="h-20 w-full overflow-hidden relative">
                      <img
                        src={uni.image}
                        alt={uni.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#161230] via-transparent to-transparent" />
                    </div>
                    <div className="p-2.5">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-[#A855F7] transition-colors">
                        {uni.name}
                      </h4>
                      <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                        {uni.genre} &bull; {uni.views}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleOpenAuth('login')}
              className="mt-6 w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all text-center"
            >
              Browse 4,500+ Public Realmlists &rarr;
            </button>
          </div>

          {/* ---------------------------------------------------- */}
          {/* PANEL 3: SIMPLE & FLEXIBLE PRICING                  */}
          {/* ---------------------------------------------------- */}
          <div className="rounded-3xl bg-[#0F0B24]/90 backdrop-blur-xl border border-white/10 p-6 flex flex-col justify-between shadow-2xl hover:border-white/20 transition-all">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-white tracking-tight">Simple & Flexible Pricing</h3>
                <button
                  onClick={() => setPricingModal(true)}
                  className="text-xs font-semibold text-[#A855F7] hover:text-[#C084FC] flex items-center gap-1 transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Choose the plan that fits your creativity.
              </p>

              {/* 3 Pricing Columns */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {/* Explorer */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-gray-300">Explorer</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">Perfect for beginners</div>
                    <div className="text-sm font-extrabold text-white mt-2">Free</div>
                  </div>
                  <button
                    onClick={() => handleOpenAuth('register')}
                    className="mt-3 w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold transition-all"
                  >
                    Get Started
                  </button>
                </div>

                {/* Creator (Highlighted) */}
                <div className="p-3 rounded-2xl bg-gradient-to-b from-[#7549E8]/30 to-[#1F173D] border border-[#A855F7] text-center relative flex flex-col justify-between shadow-[0_0_15px_rgba(117,73,232,0.3)]">
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#F59E0B] text-black text-[8px] font-black uppercase tracking-wider shadow">
                    Most Popular
                  </span>
                  <div>
                    <div className="text-[11px] font-bold text-[#E9D5FF]">Creator</div>
                    <div className="text-[9px] text-gray-300 mt-0.5">For passionate writers</div>
                    <div className="text-sm font-extrabold text-white mt-2">
                      ₹299<span className="text-[9px] font-normal text-gray-400">/month</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenAuth('register')}
                    className="mt-3 w-full py-1.5 rounded-lg bg-gradient-to-r from-[#8A4BF3] to-[#A855F7] hover:from-[#9333EA] hover:to-[#B862F8] text-white text-[10px] font-bold shadow transition-all"
                  >
                    Subscribe
                  </button>
                </div>

                {/* Studio */}
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-gray-300">Studio</div>
                    <div className="text-[9px] text-gray-400 mt-0.5">For professional creators</div>
                    <div className="text-sm font-extrabold text-white mt-2">
                      ₹999<span className="text-[9px] font-normal text-gray-400">/month</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenAuth('register')}
                    className="mt-3 w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold transition-all"
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-gray-400 text-center mt-4">
              All plans include complete commercial usage rights &amp; lore retention.
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FOOTER BAR (MATCHING SCREENSHOT)                             */}
      {/* ============================================================ */}
      <footer id="footer-section" className="relative z-10 border-t border-white/10 bg-[#080614] py-8 mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left Community Notice */}
          <div className="text-center lg:text-left">
            <h4 className="text-xs font-bold text-white tracking-wide">
              Join the StoryVerse Community
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Be part of a growing community of dreamers and storytellers.
            </p>
          </div>

          {/* Center: Email Subscription Input Pill */}
          <form
            onSubmit={handleSubscribeNewsletter}
            className="flex items-center rounded-full bg-[#130F26] border border-white/15 p-1 w-full max-w-md shadow-inner"
          >
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              className="bg-transparent px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none flex-1"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-gradient-to-r from-[#7549E8] to-[#9333EA] text-white text-xs font-bold shadow-[0_0_15px_rgba(117,73,232,0.5)] hover:scale-105 transition-all"
            >
              Subscribe
            </button>
          </form>

          {/* Social Icons matching screenshot */}
          <div className="flex items-center gap-4 text-gray-400">
            {/* Discord */}
            <a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="Discord">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
            </a>
            {/* YouTube */}
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="YouTube">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            {/* GitHub */}
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="GitHub">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            {/* X / Twitter */}
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="X">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            {/* LinkedIn */}
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="LinkedIn">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>

          {/* Right Cursive Signature Slogan matching screenshot */}
          <div className="font-script text-xl sm:text-2xl text-purple-200/90 font-bold tracking-wide italic">
            Dream. Create. Explore.
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

      {/* Universe Preview Modal */}
      {selectedUniverseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#130F26] border border-white/10 p-6 shadow-2xl text-white">
            <button
              onClick={() => setSelectedUniverseModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={selectedUniverseModal.image}
              alt={selectedUniverseModal.name}
              className="w-full h-48 object-cover rounded-2xl mb-4"
            />
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#7549E8]/20 text-[#C084FC]">
                {selectedUniverseModal.genre}
              </span>
              <span className="text-xs text-gray-400">{selectedUniverseModal.views}</span>
            </div>
            <h3 className="text-xl font-bold mb-2">{selectedUniverseModal.name}</h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              {selectedUniverseModal.description}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedUniverseModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedUniverseModal(null);
                  handleOpenAuth('register');
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#7549E8] to-[#9333EA] text-white text-xs font-bold shadow-lg"
              >
                Enter Universe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Pricing Modal */}
      {pricingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-4xl rounded-3xl bg-[#130F26] border border-white/10 p-6 sm:p-8 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPricingModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-2xl font-bold text-center mb-2">Flexible Creator Plans</h3>
            <p className="text-xs text-gray-400 text-center mb-8">Scale your fictional multiverse with generous monthly AI credits.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-base mb-1">Explorer</h4>
                  <div className="text-3xl font-black mb-4">₹0</div>
                  <ul className="text-xs space-y-2 text-gray-300">
                    <li>✓ 150 AI Generation Credits</li>
                    <li>✓ Up to 3 Universes</li>
                    <li>✓ Standard Character Lab</li>
                    <li>✓ Community Discovery</li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setPricingModal(false);
                    handleOpenAuth('register');
                  }}
                  className="mt-6 w-full py-2.5 rounded-xl bg-white/10 font-bold text-xs hover:bg-white/20"
                >
                  Get Started Free
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#7549E8]/40 to-[#1F173D] border-2 border-[#A855F7] flex flex-col justify-between shadow-[0_0_25px_rgba(117,73,232,0.4)]">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#F59E0B] tracking-wider mb-1">Most Popular</div>
                  <h4 className="font-bold text-base mb-1">Creator</h4>
                  <div className="text-3xl font-black mb-4">₹299 <span className="text-xs font-normal text-gray-400">/mo</span></div>
                  <ul className="text-xs space-y-2 text-gray-200">
                    <li>✓ 1,000 AI Credits/month</li>
                    <li>✓ Unlimited Universes & Characters</li>
                    <li>✓ Visual Character Relationship Graph</li>
                    <li>✓ Interactive Branching Stories</li>
                    <li>✓ DOCX, PDF, and Markdown Exports</li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setPricingModal(false);
                    handleOpenAuth('register');
                  }}
                  className="mt-6 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8A4BF3] to-[#A855F7] font-bold text-xs text-white shadow-lg"
                >
                  Subscribe to Creator
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-base mb-1">Studio</h4>
                  <div className="text-3xl font-black mb-4">₹999 <span className="text-xs font-normal text-gray-400">/mo</span></div>
                  <ul className="text-xs space-y-2 text-gray-300">
                    <li>✓ 5,000 AI Credits/month</li>
                    <li>✓ Collaborative Workspaces</li>
                    <li>✓ Custom Gemini / OpenAI API Keys</li>
                    <li>✓ Timeline Paradox Auditor</li>
                    <li>✓ Priority Fast-Lane Generation</li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setPricingModal(false);
                    handleOpenAuth('register');
                  }}
                  className="mt-6 w-full py-2.5 rounded-xl bg-white/10 font-bold text-xs hover:bg-white/20"
                >
                  Choose Studio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How It Works Modal */}
      {howItWorksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#130F26] border border-white/10 p-6 sm:p-8 shadow-2xl text-white">
            <button
              onClick={() => setHowItWorksModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">The 3-Step Creative Process</h3>
            <div className="space-y-4 text-xs leading-relaxed text-gray-300">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <strong className="text-white block text-sm mb-1">1. Create Your Universe</strong>
                Establish your world's metaphysical laws, technology levels, celestial cosmology, and geographic landmarks.
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <strong className="text-white block text-sm mb-1">2. Develop Your Characters</strong>
                Craft protagonists, mentors, and rivals with motivations and visual relationship webs.
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <strong className="text-white block text-sm mb-1">3. Generate Your Stories</strong>
                Write chapters or build decision-based branching narratives that automatically adhere to your established canon.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
