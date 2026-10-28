'use client';

import React from 'react';
import { Search, Star, Youtube, Instagram, MessageSquare, Globe, Newspaper, X, LayoutGrid, List } from 'lucide-react';

interface PlatformFilterProps {
  currentPlatform: string;
  onSelectPlatform: (platform: string) => void;
  isSavedOnly: boolean;
  onToggleSavedOnly: () => void;
  isPriorityOnly: boolean;
  onTogglePriorityOnly: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isCompactView: boolean;
  onToggleCompactView: () => void;
}

export const PlatformFilter: React.FC<PlatformFilterProps> = ({
  currentPlatform,
  onSelectPlatform,
  isSavedOnly,
  onToggleSavedOnly,
  isPriorityOnly,
  onTogglePriorityOnly,
  searchQuery,
  onSearchChange,
  isCompactView,
  onToggleCompactView,
}) => {
  const platforms: { id: string; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'ALL', label: 'All', icon: <Globe className="w-3.5 h-3.5" />, color: 'text-gray-300' },
    { id: 'YOUTUBE', label: 'YouTube', icon: <Youtube className="w-3.5 h-3.5" />, color: 'text-red-400' },
    { id: 'INSTAGRAM', label: 'Instagram', icon: <Instagram className="w-3.5 h-3.5" />, color: 'text-pink-400' },
    { id: 'REDDIT', label: 'Reddit', icon: <MessageSquare className="w-3.5 h-3.5" />, color: 'text-orange-400' },
    { id: 'GOOGLE', label: 'Google', icon: <Newspaper className="w-3.5 h-3.5" />, color: 'text-blue-400' },
    { id: 'RSS_NEWS', label: 'Outlets', icon: <Globe className="w-3.5 h-3.5" />, color: 'text-emerald-400' },
  ];

  return (
    <div className="space-y-3 mb-5">
      {/* Search Input Bar with View Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search topics, teams, players..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#0f131f]/90 border border-gray-800 rounded-xl pl-9 pr-9 py-2.5 text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400/40 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Switcher (Compact vs Detailed Cards) */}
        <button
          onClick={onToggleCompactView}
          title={isCompactView ? 'Switch to Detailed View' : 'Switch to Compact Skim View'}
          className="p-2.5 rounded-xl bg-[#0f131f]/90 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition-colors shrink-0 active:scale-95"
        >
          {isCompactView ? <LayoutGrid className="w-4 h-4 text-pink-400" /> : <List className="w-4 h-4" />}
        </button>
      </div>

      {/* Platform & Source Pills */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1">
        <div className="flex items-center gap-1.5 shrink-0">
          {platforms.map((p) => {
            const isActive = currentPlatform === p.id && !isSavedOnly;
            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelectPlatform(p.id);
                  if (isSavedOnly) onToggleSavedOnly();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 active:scale-95 border ${
                  isActive
                    ? 'bg-pink-500/15 text-pink-200 font-semibold border-pink-400/40 shadow-sm'
                    : 'bg-[#0f131f]/80 hover:bg-gray-850 text-gray-400 border-gray-800/80'
                }`}
              >
                <span className={p.color}>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Priority & Saved Quick Toggles */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Priority Creators Only Toggle */}
          <button
            onClick={onTogglePriorityOnly}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border whitespace-nowrap transition-all active:scale-95 ${
              isPriorityOnly
                ? 'bg-pink-500/20 text-pink-200 border-pink-400/60 font-semibold'
                : 'bg-[#0f131f]/80 text-gray-400 border-gray-800/80 hover:text-gray-300'
            }`}
          >
            <span>★ Priority Creators</span>
          </button>

          {/* Saved Vault Toggle */}
          <button
            onClick={onToggleSavedOnly}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border active:scale-95 ${
              isSavedOnly
                ? 'bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-200 border-pink-400/50 shadow-sm shadow-pink-500/10'
                : 'bg-[#0f131f]/80 hover:bg-gray-850 text-gray-400 border-gray-800/80'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isSavedOnly ? 'fill-pink-400 text-pink-400' : 'text-pink-400'}`} />
            <span>Vault</span>
          </button>
        </div>
      </div>
    </div>
  );
};
