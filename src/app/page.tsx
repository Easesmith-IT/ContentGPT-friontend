'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { DaySelector } from '../components/DaySelector';
import { PlatformFilter } from '../components/PlatformFilter';
import { FeedCard } from '../components/FeedCard';
import { ChannelsModal } from '../components/ChannelsModal';
import { MobileBottomNav } from '../components/MobileBottomNav';
import {
  fetchFeeds,
  fetchAvailableDates,
  fetchStorageStats,
  toggleSaveFeed,
  triggerManualScrape,
  purgeUnsavedFeeds,
  fetchChannels,
  addMonitoredChannel,
  deleteMonitoredChannel,
} from '../services/api';
import { ResearchItem, AvailableDate, StorageStats, MonitoredChannel } from '../types';
import { Sparkles, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DashboardPage() {
  const [feeds, setFeeds] = useState<ResearchItem[]>([]);
  const [dates, setDates] = useState<AvailableDate[]>([]);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [channels, setChannels] = useState<MonitoredChannel[]>([]);

  // Filter States
  const [selectedDate, setSelectedDate] = useState<string>('ALL');
  const [currentPlatform, setCurrentPlatform] = useState<string>('ALL');
  const [isSavedOnly, setIsSavedOnly] = useState<boolean>(false);
  const [isPriorityOnly, setIsPriorityOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isCompactView, setIsCompactView] = useState<boolean>(false);

  // Status & UI States
  const [loading, setLoading] = useState<boolean>(true);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [channelsModalOpen, setChannelsModalOpen] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Load auxiliary data (dates, stats, channels)
  const loadMeta = useCallback(async () => {
    try {
      const [datesData, statsData, channelsData] = await Promise.all([
        fetchAvailableDates().catch(() => []),
        fetchStorageStats().catch(() => null),
        fetchChannels().catch(() => []),
      ]);
      setDates(datesData);
      setStats(statsData);
      setChannels(channelsData);
    } catch {
      // Backend may be starting up
    }
  }, []);

  // Load feeds based on active filters
  const loadFeeds = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchFeeds({
        date: selectedDate === 'ALL' ? undefined : selectedDate,
        platform: currentPlatform,
        isSaved: isSavedOnly ? true : undefined,
        priorityOnly: isPriorityOnly,
        search: searchQuery.trim() || undefined,
        page,
        limit: isCompactView ? 30 : 15,
      });

      setFeeds(res.items);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.total || 0);
    } catch (err: any) {
      console.error('Failed to load feeds:', err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, currentPlatform, isSavedOnly, isPriorityOnly, searchQuery, page, isCompactView]);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    loadFeeds();
  }, [loadFeeds]);

  // Handle Toggle Bookmark / Save
  const handleToggleSave = async (id: string, currentSaved: boolean) => {
    // Optimistic update
    setFeeds((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, isSaved: !currentSaved } : item
      )
    );

    try {
      const updated = await toggleSaveFeed(id, !currentSaved);
      showFeedback(
        updated.isSaved
          ? '★ Saved to Vault! Protected from 14-day auto-purge.'
          : 'Removed from Vault.'
      );
      loadMeta();
    } catch (err: any) {
      // Rollback
      setFeeds((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isSaved: currentSaved } : item
        )
      );
      showFeedback(err.message, 'error');
    }
  };

  // Handle Manual Scrape
  const handleScrape = async () => {
    try {
      setIsScraping(true);
      const result = await triggerManualScrape('MANUAL');
      showFeedback(`Scrape complete! Fetched ${result.totalFetched} items (${result.newItemsInserted} new).`);
      await Promise.all([loadFeeds(), loadMeta()]);
    } catch (err: any) {
      showFeedback(`Scrape failed: ${err.message}`, 'error');
    } finally {
      setIsScraping(false);
    }
  };

  // Handle Purge Unsaved Data (>14 days)
  const handlePurge = async () => {
    const confirm = window.confirm(
      'Are you sure you want to purge unsaved feeds older than 14 days? Feeds marked with ★ (Saved) will be permanently preserved.'
    );
    if (!confirm) return;

    try {
      const result = await purgeUnsavedFeeds(14);
      showFeedback(`Purged ${result.deletedCount} unsaved records older than 14 days.`);
      await Promise.all([loadFeeds(), loadMeta()]);
    } catch (err: any) {
      showFeedback(`Purge failed: ${err.message}`, 'error');
    }
  };

  // Handle Channel Add / Delete
  const handleAddChannel = async (channelData: Partial<MonitoredChannel>) => {
    await addMonitoredChannel(channelData);
    showFeedback('Priority channel registered successfully!');
    await loadMeta();
  };

  const handleDeleteChannel = async (id: string) => {
    await deleteMonitoredChannel(id);
    showFeedback('Channel removed from priority list.');
    await loadMeta();
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-gray-100 flex flex-col antialiased">
      {/* Top Header */}
      <Header
        stats={stats}
        isScraping={isScraping}
        onScrape={handleScrape}
        onPurge={handlePurge}
        onOpenChannels={() => setChannelsModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6">
        {/* Feedback Alert Toast */}
        {feedback && (
          <div
            className={`mb-4 sm:mb-5 p-3.5 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between transition-all shadow-lg shadow-pink-500/5 animate-in fade-in ${
              feedback.type === 'error'
                ? 'bg-red-950/80 border-red-800 text-red-200'
                : 'bg-pink-950/60 border-pink-500/40 text-pink-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 text-pink-400" />
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-gray-400 hover:text-white text-xs font-bold px-1.5 py-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* Day Selector (Scraping Date Navigation) */}
        <DaySelector
          dates={dates}
          selectedDate={selectedDate}
          onSelectDate={(d) => {
            setSelectedDate(d);
            setPage(1);
          }}
        />

        {/* Platform & Search Filter Bar */}
        <PlatformFilter
          currentPlatform={currentPlatform}
          onSelectPlatform={(p) => {
            setCurrentPlatform(p);
            setPage(1);
          }}
          isSavedOnly={isSavedOnly}
          onToggleSavedOnly={() => {
            setIsSavedOnly(!isSavedOnly);
            setPage(1);
          }}
          isPriorityOnly={isPriorityOnly}
          onTogglePriorityOnly={() => {
            setIsPriorityOnly(!isPriorityOnly);
            setPage(1);
          }}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setPage(1);
          }}
          isCompactView={isCompactView}
          onToggleCompactView={() => setIsCompactView(!isCompactView)}
        />

        {/* Results Counter & Skim Status */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3 px-1">
          <div>
            Showing <strong className="text-white">{feeds.length}</strong> of{' '}
            <strong className="text-white">{totalItems}</strong> stories
            {selectedDate !== 'ALL' && (
              <span className="text-pink-300 font-medium"> for {selectedDate}</span>
            )}
            {isSavedOnly && <span className="text-pink-300 font-medium"> (Saved Vault)</span>}
          </div>
          {totalPages > 1 && (
            <div>
              Page {page} of {totalPages}
            </div>
          )}
        </div>

        {/* Feed Cards Grid */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3 text-gray-500">
            <RefreshCw className="w-6 h-6 animate-spin text-pink-400" />
            <span className="text-xs">Loading sports intelligence feeds...</span>
          </div>
        ) : feeds.length > 0 ? (
          isCompactView ? (
            <div className="space-y-2 mb-8">
              {feeds.map((item) => (
                <FeedCard
                  key={item._id}
                  item={item}
                  isCompact={true}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 mb-8">
              {feeds.map((item) => (
                <FeedCard
                  key={item._id}
                  item={item}
                  isCompact={false}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )
        ) : (
          <div className="py-16 text-center border border-gray-800/80 rounded-3xl bg-[#0f131f]/60 p-6 sm:p-8">
            <AlertCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-gray-300 mb-1">No feed items found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
              {isSavedOnly
                ? 'You have not saved any items to your Vault yet. Click the "Save" star on any feed card to protect it from 14-day auto-purge.'
                : 'No stories match your current date or search filters. Try switching dates or run an immediate scrape.'}
            </p>
            {!isSavedOnly && (
              <button
                onClick={handleScrape}
                disabled={isScraping}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white rounded-xl text-xs font-semibold shadow-md shadow-pink-500/25 transition-all inline-flex items-center gap-2 active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
                <span>Run Scrape Pipeline Now</span>
              </button>
            )}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-800/60 mb-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400 font-medium px-3">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Thumb ergonomic for phones) */}
      <MobileBottomNav
        isSavedOnly={isSavedOnly}
        onToggleSaved={(saved) => {
          setIsSavedOnly(saved);
          setPage(1);
        }}
        onOpenChannels={() => setChannelsModalOpen(true)}
        onScrape={handleScrape}
        isScraping={isScraping}
        savedCount={stats?.savedItems || 0}
      />

      {/* Monitored Priority Channels Modal */}
      <ChannelsModal
        isOpen={channelsModalOpen}
        onClose={() => setChannelsModalOpen(false)}
        channels={channels}
        onAddChannel={handleAddChannel}
        onDeleteChannel={handleDeleteChannel}
      />
    </div>
  );
}
