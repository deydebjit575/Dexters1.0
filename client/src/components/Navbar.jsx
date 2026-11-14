import React, { useState } from 'react';
import { Sparkles, Moon, Sun, Menu, X, ArrowRight, BookOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenAuth, onNavigate }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Home', target: 'hero' },
    { label: 'Features', target: 'features' },
    { label: 'Explore', target: 'explore' },
    { label: 'Pricing', target: 'pricing' },
    { label: 'About', target: 'about' },
  ];

  const handleScrollTo = (target) => {
    setMobileOpen(false);
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
    <nav className="fixed top-0 left-0 right-0 z-40 glass-nav transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleScrollTo('hero')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-electric flex items-center justify-center text-white shadow-glow-primary group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary via-electric to-amberGold bg-clip-text text-transparent">
                STORYVERSE
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                AI
              </span>
            </div>
            <div className="text-[10px] font-semibold text-gray-500 tracking-wider uppercase hidden sm:block">
              Imagine &bull; Create &bull; Build
            </div>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600 dark:text-gray-300">
          {navLinks.map((link) => (
            <button
              key={link.target}
              onClick={() => handleScrollTo(link.target)}
              className="hover:text-primary dark:hover:text-primary-400 transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right CTA Area */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            title="Toggle Dark / Light Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amberGold" /> : <Moon className="w-4 h-4 text-primary" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-sm shadow-glow-primary transition-all"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-primary transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-sm shadow-glow-primary hover:scale-[1.02] transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-600 dark:text-gray-300"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amberGold" /> : <Moon className="w-5 h-5 text-primary" />}
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl text-gray-700 dark:text-gray-200"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div className="md:hidden glass-panel border-b border-gray-200 dark:border-gray-800 px-6 py-5 space-y-4 animate-fade-in">
          {navLinks.map((link) => (
            <button
              key={link.target}
              onClick={() => handleScrollTo(link.target)}
              className="block w-full text-left py-2 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:text-primary"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onNavigate('dashboard');
                }}
                className="w-full py-3 rounded-xl bg-primary text-white text-center font-bold text-sm"
              >
                Enter Workspace
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenAuth('login');
                  }}
                  className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-800 dark:text-gray-200"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenAuth('register');
                  }}
                  className="w-full py-2.5 rounded-xl bg-primary text-white font-bold text-sm"
                >
                  Get Started Free
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
