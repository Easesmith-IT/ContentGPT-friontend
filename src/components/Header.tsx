'use client';

import React, { useState } from 'react';
import { RefreshCw, Trash2, Sparkles, Radio, Users, Menu, X } from 'lucide-react';
import { StorageStats } from '../types';

interface HeaderProps {
  stats: StorageStats | null;
  isScraping: boolean;
  onScrape: () => void;
  onPurge: () => void;
  onOpenChannels: () => void;
  activeView: 'feed' | 'transcribe';
  onSelectView: (view: 'feed' | 'transcribe') => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  isScraping,
  onScrape,
  onPurge,
  onOpenChannels,
  activeView,
  onSelectView,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="border-b border-gray-800/80 bg-[#0c0f18]/85 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 md:py-3.5">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-400 to-pink-300 flex items-center justify-center shadow-lg shadow-pink-500/25 shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">NISHIGPT</h1>
                <span className="text-[10px] bg-pink-500/10 text-pink-300 border border-pink-500/25 px-2 py-0.5 rounded-full font-semibold">
                  Studio
                </span>
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-pink-400 animate-pulse" />
                <span>Auto-Scrapes: <strong>09:00 AM & 08:00 PM</strong> • 14-day auto-purge</span>
              </p>
            </div>
          </div>

          {/* Main Studio Navigation Modes (Feed Radar vs Transcript Lab) */}
          <div className="hidden sm:flex items-center gap-1 bg-[#090c14] p-1 rounded-xl border border-gray-800 text-xs shadow-inner">
            <button
              onClick={() => onSelectView('feed')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeView === 'feed'
                  ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30 font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Feed Radar</span>
            </button>
            <button
              onClick={() => onSelectView('transcribe')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeView === 'transcribe'
                  ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30 font-semibold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Transcript Lab ⚡</span>
            </button>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {stats && (
              <div className="flex items-center gap-2 text-xs bg-gray-900/90 border border-gray-800/90 px-3 py-1.5 rounded-xl text-gray-300">
                <span>Total: <strong className="text-white">{stats.totalItems}</strong></span>
                <span className="text-gray-700">|</span>
                <span className="text-pink-300">★ Saved: <strong>{stats.savedItems}</strong></span>
                <span className="text-gray-700">|</span>
                <span className="text-gray-400">Unsaved: {stats.unsavedItems}</span>
              </div>
            )}

            {/* Channels Button */}
            <button
              onClick={onOpenChannels}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-850 border border-gray-800 text-gray-200 text-xs font-medium rounded-xl transition-colors active:scale-95"
            >
              <Users className="w-3.5 h-3.5 text-pink-400" />
              <span>Priority Creators ({stats?.priorityChannelsCount || 0})</span>
            </button>

            {/* Purge Button */}
            <button
              onClick={onPurge}
              title="Purge unsaved feeds older than 14 days"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/30 hover:bg-red-900/50 border border-red-800/40 text-red-300 text-xs font-medium rounded-xl transition-colors active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Purge Unsaved</span>
            </button>

            {/* Scrape Now Button (Baby Pink Primary) */}
            <button
              onClick={onScrape}
              disabled={isScraping}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 ${
                isScraping
                  ? 'bg-pink-900/60 text-pink-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white shadow-pink-500/25'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
              <span>{isScraping ? 'Scraping...' : 'Scrape Now'}</span>
            </button>
          </div>

          {/* Mobile Right Quick Action & Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onScrape}
              disabled={isScraping}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm active:scale-95 ${
                isScraping
                  ? 'bg-pink-900/60 text-pink-200'
                  : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
              <span>{isScraping ? 'Scraping' : 'Scrape'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-white bg-gray-900 border border-gray-800 rounded-xl active:scale-95"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-800 space-y-2.5 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-900/80 p-2.5 rounded-xl border border-gray-800">
              <span>Auto-Scrapes: <strong>9 AM & 8 PM</strong></span>
              <span className="text-pink-300">★ Saved: {stats?.savedItems || 0}</span>
              <span>Total: {stats?.totalItems || 0}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  onOpenChannels();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-gray-900 border border-gray-800 rounded-xl text-xs font-medium text-gray-200 active:bg-gray-800"
              >
                <Users className="w-3.5 h-3.5 text-pink-400" />
                <span>Priority Channels ({stats?.priorityChannelsCount || 0})</span>
              </button>

              <button
                onClick={() => {
                  onPurge();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-red-950/40 border border-red-800/40 rounded-xl text-xs font-medium text-red-300 active:bg-red-900/50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge Unsaved</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
