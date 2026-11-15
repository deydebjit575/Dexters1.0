import React, { useState } from 'react';
import {
  LayoutDashboard,
  Globe,
  Compass,
  Users,
  Feather,
  MessageSquare,
  Clock,
  GitFork,
  Share2,
  Settings,
  CreditCard,
  Plus,
  Sparkles,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ConnectedUniverseBadge from './ConnectedUniverseBadge';
import CreateUniverseModal from './CreateUniverseModal';

export default function AppLayout({ activeTab, onSelectTab, children }) {
  const { user, logout, activeUniverse, universes, selectUniverse } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [uniDropdownOpen, setUniDropdownOpen] = useState(false);
  const [showCreateUniModal, setShowCreateUniModal] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'universes', label: 'My Universes', icon: Globe },
    { id: 'world-builder', label: 'World Builder', icon: Compass },
    { id: 'characters', label: 'Character Lab', icon: Users },
    { id: 'story-studio', label: 'AI Story Studio', icon: Feather },
    { id: 'dialogues', label: 'Dialogue Generator', icon: MessageSquare },
    { id: 'timelines', label: 'Timeline Manager', icon: Clock },
    { id: 'branching', label: 'Interactive Stories', icon: GitFork },
    { id: 'community', label: 'Community', icon: Share2 },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
  ];

  const handleNavClick = (id) => {
    onSelectTab(id);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F8FC] dark:bg-[#0E0E18] text-[#202033] dark:text-[#F3F4F8] flex flex-col md:flex-row transition-colors duration-200">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 glass-panel border-r border-gray-100 dark:border-gray-800/80 p-4 fixed top-0 bottom-0 left-0 z-30">
        {/* Logo */}
        <div
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-3 px-2 py-3 mb-4 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-electric flex items-center justify-center text-white shadow-glow-primary group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-primary to-electric bg-clip-text text-transparent">
                STORYVERSE
              </span>
            </div>
            <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
              Universe Studio
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-glow-primary font-bold'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* AI Credits Pill in Sidebar */}
        <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
          <div
            onClick={() => handleNavClick('subscription')}
            className="p-3 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100/50 dark:from-primary-950/40 dark:to-primary-900/20 border border-primary-200/60 dark:border-primary-800/50 cursor-pointer hover:border-primary transition-all group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary dark:text-primary-300">
                <Zap className="w-3.5 h-3.5" />
                <span>AI Credits</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
                {user?.plan || 'Free'}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-xs mb-1.5">
              <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                {user?.credits ?? 0}
              </span>
              <span className="text-gray-500 text-[11px]">
                / {user?.maxCredits ?? 150} left
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, ((user?.credits ?? 0) / (user?.maxCredits || 150)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden glass-nav sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div
          onClick={() => handleNavClick('dashboard')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-electric flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-base bg-gradient-to-r from-primary to-electric bg-clip-text text-transparent">
            STORYVERSE
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ConnectedUniverseBadge />
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm">
          <div className="w-72 bg-white dark:bg-[#171727] h-full p-4 flex flex-col animate-slide-right">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-800">
              <span className="font-bold text-sm text-gray-900 dark:text-white">Menu Navigation</span>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* TOP NAVBAR (Desktop) */}
        <header className="hidden md:flex h-16 glass-nav sticky top-0 z-20 px-6 items-center justify-between">
          {/* Active Universe Selector & Creator */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setUniDropdownOpen(!uniDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-darkCard border border-gray-200 dark:border-gray-700 hover:border-primary text-xs font-semibold text-gray-800 dark:text-gray-200 shadow-sm transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span className="max-w-[160px] truncate">
                  {activeUniverse ? activeUniverse.name : 'Select Universe'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {uniDropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 glass-panel rounded-2xl p-2 shadow-2xl z-50 animate-fade-in">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Your Universes
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {universes.map((uni) => (
                      <button
                        key={uni.id}
                        onClick={() => {
                          selectUniverse(uni);
                          setUniDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-all ${
                          activeUniverse?.id === uni.id
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span className="truncate">{uni.name}</span>
                        <span className="text-[10px] uppercase font-bold text-gray-400">
                          {uni.genre}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => {
                        setUniDropdownOpen(false);
                        setShowCreateUniModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-primary hover:bg-primary/10 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Establish New Universe</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCreateUniModal(true)}
              className="p-1.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 hover:border-primary text-gray-500 hover:text-primary transition-all"
              title="Establish New Universe"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Connected Engine Live Badge */}
            <ConnectedUniverseBadge />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              title="Toggle Dark / Light Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amberGold" /> : <Moon className="w-4 h-4 text-primary" />}
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-primary/20"
                />
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                    {user?.name}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium">
                    {user?.penName || 'Creator'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 shadow-2xl z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                    <div className="text-xs font-bold text-gray-900 dark:text-white truncate">{user?.name}</div>
                    <div className="text-[11px] text-gray-400 truncate">{user?.email}</div>
                  </div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleNavClick('settings');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <Settings className="w-4 h-4 text-gray-400" />
                    <span>Account Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleNavClick('subscription');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    <span>Subscription Plan</span>
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Global Universe Creator Modal */}
      <CreateUniverseModal
        isOpen={showCreateUniModal}
        onClose={() => setShowCreateUniModal(false)}
        onCreated={(newUni) => selectUniverse(newUni)}
      />
    </div>
  );
}
