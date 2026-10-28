'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, Youtube, Instagram, Shield } from 'lucide-react';
import { MonitoredChannel } from '../types';

interface ChannelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: MonitoredChannel[];
  onAddChannel: (channel: Partial<MonitoredChannel>) => Promise<void>;
  onDeleteChannel: (id: string) => Promise<void>;
}

export const ChannelsModal: React.FC<ChannelsModalProps> = ({
  isOpen,
  onClose,
  channels,
  onAddChannel,
  onDeleteChannel,
}) => {
  const [platform, setPlatform] = useState<'YOUTUBE' | 'INSTAGRAM'>('YOUTUBE');
  const [channelName, setChannelName] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [priorityWeight, setPriorityWeight] = useState(2.5);
  const [autoTranscribe, setAutoTranscribe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim() || !channelUrl.trim()) {
      setError('Please provide both Channel Name and URL');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onAddChannel({
        platform,
        channelName: channelName.trim(),
        channelUrl: channelUrl.trim(),
        priorityWeight,
        autoTranscribe,
        category: 'sports',
      });
      setChannelName('');
      setChannelUrl('');
      setPriorityWeight(2.5);
      setAutoTranscribe(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add channel');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0f131f] border border-gray-800 rounded-t-3xl sm:rounded-2xl w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-pink-400" />
              <span>Priority Creators & Channels</span>
            </h2>
            <p className="text-[11px] text-gray-400">
              Feeds from these creators receive boosted priority
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-850 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Add Channel Form */}
          <form onSubmit={handleSubmit} className="bg-gray-900/90 border border-gray-800 p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-pink-400" />
              <span>Add Favorite Sports Creator</span>
            </h3>

            {error && (
              <div className="text-xs text-red-300 bg-red-950/40 border border-red-800/50 p-2.5 rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Platform Selector */}
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Platform</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPlatform('YOUTUBE')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
                      platform === 'YOUTUBE'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-gray-850 text-gray-400 border-gray-750'
                    }`}
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    <span>YouTube</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlatform('INSTAGRAM')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
                      platform === 'INSTAGRAM'
                        ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                        : 'bg-gray-850 text-gray-400 border-gray-750'
                    }`}
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Instagram</span>
                  </button>
                </div>
              </div>

              {/* Creator Name */}
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Creator / Channel Name</label>
                <input
                  type="text"
                  placeholder="e.g. Football Daily, ESPN FC"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="w-full bg-[#0a0d14] border border-gray-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-400"
                />
              </div>
            </div>

            {/* Channel URL */}
            <div>
              <label className="block text-[11px] text-gray-400 mb-1">Channel / Profile URL</label>
              <input
                type="url"
                placeholder={platform === 'YOUTUBE' ? 'https://www.youtube.com/@channel' : 'https://www.instagram.com/creator'}
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                className="w-full bg-[#0a0d14] border border-gray-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-pink-400"
              />
            </div>

            {/* Priority Weight & Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-gray-400">Priority Multiplier:</label>
                <select
                  value={priorityWeight}
                  onChange={(e) => setPriorityWeight(parseFloat(e.target.value))}
                  className="bg-[#0a0d14] border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
                >
                  <option value={1.5}>1.5x (Elevated)</option>
                  <option value={2.0}>2.0x (High Priority)</option>
                  <option value={2.5}>2.5x (Top Creator)</option>
                  <option value={3.0}>3.0x (VIP Priority)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white rounded-xl text-xs font-semibold shadow-md shadow-pink-500/25 transition-all"
              >
                {isSubmitting ? 'Registering...' : 'Register Channel'}
              </button>
            </div>
          </form>

          {/* List Existing Channels */}
          <div>
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2.5">
              Active Monitored Creators ({channels.length})
            </h3>
            <div className="space-y-2">
              {channels.map((ch) => (
                <div
                  key={ch._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-900/80 border border-gray-800/80"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        ch.platform === 'YOUTUBE' ? 'bg-red-500/10 text-red-400' : 'bg-pink-500/10 text-pink-400'
                      }`}
                    >
                      {ch.platform === 'YOUTUBE' ? <Youtube className="w-4 h-4" /> : <Instagram className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white truncate">{ch.channelName}</span>
                        <span className="text-[10px] font-bold text-pink-300 bg-pink-500/15 px-2 py-0.2 rounded-full border border-pink-500/25 shrink-0">
                          {ch.priorityWeight}x
                        </span>
                      </div>
                      <a
                        href={ch.channelUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-gray-400 hover:text-pink-300 truncate block max-w-xs transition-colors"
                      >
                        {ch.channelUrl}
                      </a>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteChannel(ch._id)}
                    className="p-2 text-gray-400 hover:text-red-400 rounded-xl hover:bg-gray-850 transition-colors shrink-0"
                    title="Remove channel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
