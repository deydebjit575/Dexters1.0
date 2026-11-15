import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  Key,
  Shield,
  Clock,
  Trash2,
  Save,
  Lock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function SettingsView() {
  const { user, showToast, updateProfileLocally, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'ai' | 'history' | 'security'

  // Profile Form
  const [name, setName] = useState('');
  const [penName, setPenName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');

  // AI Config Form
  const [apiKey, setApiKey] = useState('');
  const [preferredModel, setPreferredModel] = useState('auto');

  // Security Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // AI Usage Logs
  const [usageLogs, setUsageLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPenName(user.penName || '');
      setBio(user.bio || '');
      setAvatar(user.avatar || '');
      setApiKey(user.apiKey || '');
      setPreferredModel(user.preferredAIModel || 'auto');
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab]);

  const loadHistory = async () => {
    try {
      setLoadingLogs(true);
      const data = await api.getAiHistory();
      setUsageLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateProfile({
        name,
        penName,
        bio,
        avatar,
      });
      updateProfileLocally(res.user);
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAiConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateProfile({
        apiKey,
        preferredAIModel: preferredModel,
      });
      updateProfileLocally(res.user);
      showToast('AI engine settings configured.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('Both passwords required.', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      showToast('Password changed successfully.', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = prompt('Type DELETE to permanently destroy your account and all private universes:');
    if (confirmation !== 'DELETE') return;

    try {
      await api.deleteAccount();
      showToast('Account destroyed.', 'info');
      logout();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const isLiveLLM = Boolean(apiKey && (apiKey.startsWith('AIza') || apiKey.startsWith('sk-')));

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-primary" />
          <span>Settings & Account Hub</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your author credentials, custom LLM keys, and audit generation history.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800/60 p-1 w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'profile'
              ? 'bg-white dark:bg-darkCard text-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Creator Profile
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'ai'
              ? 'bg-white dark:bg-darkCard text-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>AI Engine Configuration</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'history'
              ? 'bg-white dark:bg-darkCard text-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Generation History
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'security'
              ? 'bg-white dark:bg-darkCard text-primary shadow-sm'
              : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
          }`}
        >
          Security & Privacy
        </button>
      </div>

      {/* TAB 1: PROFILE EDIT */}
      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-5 pb-6 border-b border-gray-100 dark:border-gray-800">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={name}
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-primary/30 shadow-md"
            />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{name || 'Your Name'}</h3>
              <p className="text-xs text-gray-400">{user?.email}</p>
              <div className="text-[11px] font-bold text-primary uppercase mt-1">
                Plan: {user?.plan || 'Explorer'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Pen Name / Author Alias
              </label>
              <input
                type="text"
                value={penName}
                onChange={(e) => setPenName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Avatar Image URL
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Author Biography
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other creators about your worlds, influences, and upcoming projects..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-glow-primary transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: AI ENGINE CONFIGURATION (Live LLM vs Demo Mode) */}
      {activeTab === 'ai' && (
        <form onSubmit={handleSaveAiConfig} className="glass-panel p-8 rounded-3xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  AI Model & API Key Integration
                </h3>
                <p className="text-xs text-gray-500">
                  Switch between built-in Contextual Engine (Demo Mode) and Live LLM APIs.
                </p>
              </div>
            </div>

            {isLiveLLM ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Live LLM Active</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600">
                <Sparkles className="w-4 h-4" />
                <span>Contextual Lore Engine (Demo Mode)</span>
              </span>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            <strong>System Architecture Note:</strong> When no API key is provided, StoryVerse executes in our high-fidelity Demo Mode, using our proprietary Contextual Lore Synthesizer. To connect directly to live Gemini or OpenAI models, paste your secret key below. Keys are stored encrypted and never leaked to frontend clients.
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Google Gemini / OpenAI API Key (Optional)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... or sk-..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <span className="text-[11px] text-gray-400 mt-1 block">
              Leave blank to keep using the built-in Contextual Universe Lore Engine.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Preferred Model Routing
            </label>
            <select
              value={preferredModel}
              onChange={(e) => setPreferredModel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none"
            >
              <option value="auto">Auto (Gemini 1.5/2.0 Flash / OpenAI GPT-4o-mini)</option>
              <option value="gemini">Google Gemini 1.5 Flash</option>
              <option value="openai">OpenAI GPT-4o-mini</option>
            </select>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-bold text-xs shadow-glow-primary transition-all disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Save AI Configuration'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: GENERATION HISTORY TABLE */}
      {activeTab === 'history' && (
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              AI Generation & Credit Audit Logs
            </h3>
            <span className="text-xs text-gray-400 font-mono">
              Total Recorded Generations: {usageLogs.length}
            </span>
          </div>

          {loadingLogs ? (
            <div className="py-16 text-center text-xs text-gray-400">Loading audit log...</div>
          ) : usageLogs.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-400">No generation history recorded yet.</div>
          ) : (
            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {usageLogs.map(log => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs"
                >
                  <div className="max-w-[70%]">
                    <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span>{log.actionType}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {log.model}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{log.promptPreview}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-primary">-{log.creditsDeducted} credits</span>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SECURITY & DANGER ZONE */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <form onSubmit={handleChangePassword} className="glass-panel p-8 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              <span>Change Password</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-xs text-gray-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-primary text-white font-bold text-xs shadow-glow-primary"
              >
                Update Password
              </button>
            </div>
          </form>

          {/* DANGER ZONE */}
          <div className="p-8 rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 space-y-4">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Danger Zone: Account & Universe Purge</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              Permanently delete your StoryVerse account, all associated fictional universes, characters, manuscripts, and generation logs. This action cannot be reversed.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
            >
              Permanently Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
