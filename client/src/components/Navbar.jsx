import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  LogOut,
  Compass,
  Users,
  Feather,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenAuth, onNavigate }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreDropdown, setExploreDropdown] = useState(false);

  const handleScrollTo = (target) => {
    setMobileOpen(false);
    setExploreDropdown(false);
    if (onNavigate) {
      onNavigate(target);
      return;
    }
    const el = document.getElementById(target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0C0A1A]/80 border-b border-white/10 transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo matching the uploaded screenshot */}
        <div
          onClick={() => handleScrollTo('hero')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          {/* Glowing Purple Book Icon with Stars */}
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7549E8] via-[#8B5CF6] to-[#A855F7] p-0.5 shadow-[0_0_20px_rgba(117,73,232,0.6)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#130F26] rounded-[10px] flex items-center justify-center text-white">
                <BookOpen className="w-5 h-5 text-[#C084FC]" />
              </div>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
          </div>

          <div className="flex items-center">
            <span className="font-extrabold text-xl text-white tracking-tight">
              StoryVerse
            </span>
            <span className="font-extrabold text-xl text-[#20A5D8] ml-1 bg-gradient-to-r from-[#20A5D8] to-[#38BDF8] bg-clip-text text-transparent">
              AI
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => handleScrollTo('hero')}
            className="text-white relative font-semibold transition-colors group py-1"
          >
            <span>Home</span>
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#20A5D8] to-[#7549E8] rounded-full shadow-[0_0_8px_#20A5D8]" />
          </button>

          <button
            onClick={() => handleScrollTo('features')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Features
          </button>

          {/* Explore Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExploreDropdown(!exploreDropdown)}
              className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
            >
              <span>Explore</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${exploreDropdown ? 'rotate-180' : ''}`} />
            </button>

            {exploreDropdown && (
              <div className="absolute left-0 mt-3 w-56 rounded-2xl bg-[#130F26]/95 backdrop-blur-xl border border-white/10 p-2 shadow-2xl z-50 animate-fade-in text-xs">
                <button
                  onClick={() => handleScrollTo('explore')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-200 hover:bg-white/10 hover:text-primary transition-all text-left"
                >
                  <Compass className="w-4 h-4 text-[#20A5D8]" />
                  <span>The Lost Kingdom (Fantasy)</span>
                </button>
                <button
                  onClick={() => handleScrollTo('explore')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-200 hover:bg-white/10 hover:text-primary transition-all text-left"
                >
                  <Users className="w-4 h-4 text-[#A855F7]" />
                  <span>Cyber Nova (Sci-Fi)</span>
                </button>
                <button
                  onClick={() => handleScrollTo('explore')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-200 hover:bg-white/10 hover:text-primary transition-all text-left"
                >
                  <Feather className="w-4 h-4 text-emerald-400" />
                  <span>Mystic Realms (Adventure)</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleScrollTo('pricing')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Pricing
          </button>

          <button
            onClick={() => handleScrollTo('about')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            About
          </button>
        </div>

        {/* Right CTA Area */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-white/15 text-gray-300 hover:text-white hover:bg-white/10 transition-all"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-300" />}
          </button>

          {user ? (
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-[#7549E8] via-[#8B5CF6] to-[#A855F7] text-white font-bold text-xs shadow-[0_0_20px_rgba(117,73,232,0.5)] hover:scale-105 transition-all"
            >
              <span>Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              {/* Login Pill Button */}
              <button
                onClick={() => onOpenAuth('login')}
                className="px-5 py-2 rounded-full border border-white/20 text-white font-medium text-xs hover:bg-white/10 transition-all"
              >
                Login
              </button>

              {/* Glowing Get Started Button */}
              <button
                onClick={() => onOpenAuth('register')}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-[#8A4BF3] to-[#A855F7] text-white font-bold text-xs shadow-[0_0_20px_rgba(138,75,243,0.5)] hover:scale-105 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </button>
            </>
          )}
        </div>

        {/* Mobile Burger */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-white/15 text-gray-300"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-300" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-white"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0C0A1A]/95 border-b border-white/10 px-6 py-5 space-y-3 animate-fade-in text-sm font-semibold">
          <button
            onClick={() => handleScrollTo('hero')}
            className="block w-full text-left py-2 text-white"
          >
            Home
          </button>
          <button
            onClick={() => handleScrollTo('features')}
            className="block w-full text-left py-2 text-gray-300 hover:text-white"
          >
            Features
          </button>
          <button
            onClick={() => handleScrollTo('explore')}
            className="block w-full text-left py-2 text-gray-300 hover:text-white"
          >
            Explore Universes
          </button>
          <button
            onClick={() => handleScrollTo('pricing')}
            className="block w-full text-left py-2 text-gray-300 hover:text-white"
          >
            Pricing
          </button>
          <button
            onClick={() => handleScrollTo('about')}
            className="block w-full text-left py-2 text-gray-300 hover:text-white"
          >
            About
          </button>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onNavigate('dashboard');
                }}
                className="w-full py-2.5 rounded-full bg-primary text-white text-center font-bold text-xs"
              >
                Go to Workspace
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full py-2 rounded-full border border-white/20 text-white text-xs font-bold"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full py-2 rounded-full bg-gradient-to-r from-[#8A4BF3] to-[#A855F7] text-white text-xs font-bold"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
