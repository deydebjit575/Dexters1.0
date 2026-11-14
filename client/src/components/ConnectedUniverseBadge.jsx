import React, { useState } from 'react';
import { Sparkles, Globe, Users, MapPin, Clock, ShieldCheck, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ConnectedUniverseBadge() {
  const { activeUniverse } = useAuth();
  const [showDrawer, setShowDrawer] = useState(false);

  if (!activeUniverse) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-medium">
        <Sparkles className="w-3.5 h-3.5" />
        <span>No Active Universe Selected</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowDrawer(true)}
        className="group flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/15 dark:bg-primary/20 dark:hover:bg-primary/25 border border-primary/25 transition-all text-xs font-semibold text-primary dark:text-primary-300 shadow-sm"
        title="View Connected Universe Engine Canon Memory"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <div className="flex items-center gap-1.5 truncate max-w-[200px]">
          <Globe className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{activeUniverse.name}</span>
        </div>
        <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-primary/20">
          {activeUniverse.genre}
        </span>
      </button>

      {/* Drawer / Modal showing Universe Canon Memory */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#171727] rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowDrawer(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{activeUniverse.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold uppercase bg-primary/10 text-primary">
                    {activeUniverse.genre}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{activeUniverse.tagline || 'Connected Universe Context Active'}</p>
              </div>
            </div>

            <div className="bg-primary-50 dark:bg-primary-950/40 p-4 rounded-xl border border-primary-100 dark:border-primary-900/50 mb-5">
              <div className="flex items-center gap-2 text-xs font-bold text-primary dark:text-primary-300 uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Connected Universe Engine Status: Synchronized</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Every character, location, historical timeline event, and metaphysical rule established in this universe is synthesized automatically into the Story Studio, Dialogue Generator, and Interactive Branching Narratives.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-center">
                <Users className="w-4 h-4 text-electric mx-auto mb-1" />
                <div className="text-lg font-extrabold text-gray-900 dark:text-white">{activeUniverse.counts?.characters ?? '-'}</div>
                <div className="text-[11px] text-gray-500">Characters</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-center">
                <MapPin className="w-4 h-4 text-emeraldGreen mx-auto mb-1" />
                <div className="text-lg font-extrabold text-gray-900 dark:text-white">{activeUniverse.counts?.locations ?? '-'}</div>
                <div className="text-[11px] text-gray-500">Locations</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-center">
                <Clock className="w-4 h-4 text-amberGold mx-auto mb-1" />
                <div className="text-lg font-extrabold text-gray-900 dark:text-white">{activeUniverse.counts?.timelines ?? '-'}</div>
                <div className="text-[11px] text-gray-500">Timeline Eras</div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-center">
                <Sparkles className="w-4 h-4 text-primary mx-auto mb-1" />
                <div className="text-lg font-extrabold text-gray-900 dark:text-white">{activeUniverse.counts?.stories ?? '-'}</div>
                <div className="text-[11px] text-gray-500">Stories</div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-1">Cosmology & World Overview</h4>
                <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                  {activeUniverse.description || 'No description provided.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-gray-700 dark:text-gray-300 mb-1">Magic / Technological Laws</h4>
                <p className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                  {activeUniverse.magicRules || 'Standard scientific and elemental laws apply.'}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDrawer(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                Close Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
