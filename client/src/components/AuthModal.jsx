import React, { useState } from 'react';
import { X, Sparkles, Lock, Mail, User, KeyRound, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, initialTab = 'login', onSuccess }) {
  const { login, register, showToast } = useAuth();
  const [tab, setTab] = useState(initialTab); // 'login' | 'register' | 'forgot'
  const [name, setName] = useState('');
  const [penName, setPenName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  if (!isOpen) return null;

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await login('demo@storyverse.ai', 'storyverse123');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(email, password);
        if (onSuccess) onSuccess();
        onClose();
      } else if (tab === 'register') {
        if (!name.trim()) throw new Error('Please enter your full name.');
        await register(name, email, password, penName);
        if (onSuccess) onSuccess();
        onClose();
      } else if (tab === 'forgot') {
        const res = await api.forgotPassword(email);
        setForgotSent(true);
        showToast(res.message, 'success');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-[#171727] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-electric flex items-center justify-center text-white mx-auto mb-3 shadow-glow-primary">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            {tab === 'login' && 'Welcome Back'}
            {tab === 'register' && 'Begin Your Journey'}
            {tab === 'forgot' && 'Account Recovery'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {tab === 'login' && 'Enter your coordinates to access your universes.'}
            {tab === 'register' && 'Claim your creator realm and 150 starter AI credits.'}
            {tab === 'forgot' && 'We’ll dispatch a secure recovery transmission to your email.'}
          </p>
        </div>

        {/* Demo Fast Login Pill */}
        {tab === 'login' && (
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mb-5 py-2.5 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary dark:text-primary-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span>⚡ Instant Demo Access (Preloaded Universes)</span>
          </button>
        )}

        {/* Mode Switch Tabs */}
        {tab !== 'forgot' && (
          <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800/60 p-1 mb-6">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-white dark:bg-darkCard text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-white dark:bg-darkCard text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Elena Rostova"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Pen Name / Creator Handle (Optional)
                </label>
                <div className="relative">
                  <Sparkles className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={penName}
                    onChange={(e) => setPenName(e.target.value)}
                    placeholder="Archivist Elena"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@storyverse.ai"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          {tab !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Password *
                </label>
                {tab === 'login' && (
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-[11px] font-semibold text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-darkCard text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {forgotSent && tab === 'forgot' && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs">
              Recovery link dispatched! Please inspect your email inbox.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-sm shadow-glow-primary hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                Processing...
              </span>
            ) : (
              <>
                <span>
                  {tab === 'login' && 'Log In to Workspace'}
                  {tab === 'register' && 'Create Creator Account'}
                  {tab === 'forgot' && 'Send Recovery Transmission'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {tab === 'forgot' && (
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setTab('login');
                setForgotSent(false);
              }}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Back to Log In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
