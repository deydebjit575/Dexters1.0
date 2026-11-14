import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import AppLayout from './components/AppLayout';
import DashboardOverview from './pages/DashboardOverview';
import UniversesView from './pages/UniversesView';
import WorldBuilderView from './pages/WorldBuilderView';
import CharacterLabView from './pages/CharacterLabView';
import StoryStudioView from './pages/StoryStudioView';
import DialogueGeneratorView from './pages/DialogueGeneratorView';
import TimelineManagerView from './pages/TimelineManagerView';
import InteractiveStoryView from './pages/InteractiveStoryView';
import CommunityView from './pages/CommunityView';
import SubscriptionView from './pages/SubscriptionView';
import SettingsView from './pages/SettingsView';
import NotificationToast from './components/NotificationToast';

function MainApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-darkCanvas flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-electric flex items-center justify-center text-white shadow-glow-primary animate-bounce mb-4">
          <span className="font-black text-xl">S</span>
        </div>
        <div className="text-sm font-bold text-gray-800 dark:text-gray-200">
          Loading StoryVerse AI...
        </div>
        <div className="text-xs text-gray-400 mt-1">
          Synchronizing Connected Universe Engine
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LandingPage onEnterApp={() => setActiveTab('dashboard')} />
        <NotificationToast />
      </>
    );
  }

  return (
    <AppLayout activeTab={activeTab} onSelectTab={setActiveTab}>
      {activeTab === 'dashboard' && <DashboardOverview onNavigate={setActiveTab} />}
      {activeTab === 'universes' && <UniversesView onNavigate={setActiveTab} />}
      {activeTab === 'world-builder' && <WorldBuilderView />}
      {activeTab === 'characters' && <CharacterLabView />}
      {activeTab === 'story-studio' && <StoryStudioView />}
      {activeTab === 'dialogues' && <DialogueGeneratorView />}
      {activeTab === 'timelines' && <TimelineManagerView />}
      {activeTab === 'branching' && <InteractiveStoryView />}
      {activeTab === 'community' && <CommunityView />}
      {activeTab === 'subscription' && <SubscriptionView />}
      {activeTab === 'settings' && <SettingsView />}
      <NotificationToast />
    </AppLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
