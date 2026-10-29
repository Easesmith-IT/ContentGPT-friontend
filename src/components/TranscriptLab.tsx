'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TranscriptItem } from '../types';
import {
  transcribeLink,
  uploadAndTranscribeMedia,
  fetchTranscripts,
  fetchTranscriptById,
  toggleSaveTranscript,
  deleteTranscript,
  translateTranscriptApi,
} from '../services/api';
import { ScriptModal } from './ScriptModal';
import {
  Youtube,
  Instagram,
  Sparkles,
  Link as LinkIcon,
  Upload,
  Copy,
  Check,
  Download,
  Star,
  ExternalLink,
  Trash2,
  Clock,
  FileText,
  Quote,
  Flame,
  ArrowRight,
  RefreshCw,
  Search,
  Languages,
  Play,
  PlayCircle,
} from 'lucide-react';

interface TranscriptLabProps {
  initialUrl?: string;
  onClearInitialUrl?: () => void;
}

export const TranscriptLab: React.FC<TranscriptLabProps> = ({
  initialUrl,
  onClearInitialUrl,
}) => {
  const [urlInput, setUrlInput] = useState<string>(initialUrl || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTranscript, setActiveTranscript] = useState<TranscriptItem | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Settings & Toggles
  const [showTimestamps, setShowTimestamps] = useState<boolean>(true);
  const [activeLanguage, setActiveLanguage] = useState<'english' | 'hinglish' | 'original'>('english');
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'angles'>('transcript');
  const [copied, setCopied] = useState<boolean>(false);

  // Script Studio Bridge
  const [scriptModalOpen, setScriptModalOpen] = useState<boolean>(false);
  const [scriptNotes, setScriptNotes] = useState<string>('');

  // Media Player Toggle
  const [showPlayer, setShowPlayer] = useState<boolean>(false);

  // Upload Fallback Modal
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  // History Library
  const [history, setHistory] = useState<TranscriptItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historySearch, setHistorySearch] = useState<string>('');

  // AI Translation State
  const [translating, setTranslating] = useState<boolean>(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Check if a language text needs Gemini translation
  const needsTranslation = (lang: 'english' | 'hinglish', item: TranscriptItem | null): boolean => {
    if (!item) return false;
    const orig = item.cleanText?.original || '';
    const hasDevanagari = /[\u0900-\u097F]/.test(orig);
    if (!hasDevanagari) return false;

    if (lang === 'english') {
      const eng = item.cleanText?.english || '';
      if (!eng || eng === orig || /[\u0900-\u097F]/.test(eng)) return true;
      if (item.segments && item.segments.length > 0) {
        return item.segments.some((s) => !s.textEnglish || /[\u0900-\u097F]/.test(s.textEnglish));
      }
      return false;
    }
    if (lang === 'hinglish') {
      const hing = item.cleanText?.hinglish || '';
      if (!hing || hing === orig || /[\u0900-\u097F]/.test(hing)) return true;
      if (item.segments && item.segments.length > 0) {
        return item.segments.some((s) => !s.textHinglish || /[\u0900-\u097F]/.test(s.textHinglish));
      }
      return false;
    }
    return false;
  };

  // Perform translation with Gemini
  const handleTranslateWithGemini = async (targetLang?: 'english' | 'hinglish') => {
    if (!activeTranscript) return;
    try {
      setTranslating(true);
      showToast('Translating with Gemini 3.5 Flash...', 'info');
      const updated = await translateTranscriptApi(activeTranscript._id);
      setActiveTranscript(updated);
      setHistory((prev) => prev.map((h) => (h._id === updated._id ? updated : h)));
      showToast('Successfully translated with Gemini!', 'success');
      if (targetLang) setActiveLanguage(targetLang);
    } catch (err: any) {
      showToast(err.message || 'Translation failed', 'error');
    } finally {
      setTranslating(false);
    }
  };

  // Handle switching language tab with auto-translation if needed
  const handleLanguageSelect = async (lang: 'english' | 'hinglish' | 'original') => {
    setActiveLanguage(lang);
    if (lang !== 'original' && needsTranslation(lang, activeTranscript) && !translating) {
      await handleTranslateWithGemini(lang);
    }
  };

  // Load past transcripts
  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await fetchTranscripts({ limit: 12, search: historySearch.trim() || undefined });
      setHistory(res.items);
    } catch {
      // Backend may be starting
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [historySearch]);

  const lastProcessedUrlRef = useRef<string>('');

  // If initialUrl is passed from FeedCard "⚡ Transcribe", auto-populate and run
  useEffect(() => {
    const target = (initialUrl || '').trim();
    if (!target) {
      lastProcessedUrlRef.current = '';
      return;
    }
    if (target !== lastProcessedUrlRef.current) {
      lastProcessedUrlRef.current = target;
      setUrlInput(target);
      handleTranscribe(target);
      if (onClearInitialUrl) onClearInitialUrl();
    }
  }, [initialUrl]);

  // Handle URL Transcription
  const handleTranscribe = async (overrideUrl?: string) => {
    const targetUrl = (overrideUrl || urlInput).trim();
    if (!targetUrl) {
      showToast('Please enter a YouTube or Instagram video link.', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await transcribeLink(targetUrl);

      if (res.requiresUploadFallback) {
        showToast(res.message || 'Direct cloud fetch restricted. Please upload file.', 'info');
        setUploadModalOpen(true);
        return;
      }

      if (res.success && res.data) {
        setActiveTranscript(res.data);
        showToast(res.message || 'Transcription complete!', 'success');
        loadHistory();
      } else {
        showToast(res.error || 'Could not transcribe video.', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Transcription failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle File Upload Fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('mediaFile', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
    formData.append('sourceUrl', urlInput || 'file://uploaded');

    try {
      setUploading(true);
      const data = await uploadAndTranscribeMedia(formData);
      setActiveTranscript(data);
      setUploadModalOpen(false);
      showToast('Successfully transcribed uploaded media!', 'success');
      loadHistory();
    } catch (err: any) {
      showToast(err.message || 'Upload transcription failed.', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Toggle Save to Vault
  const handleToggleSave = async () => {
    if (!activeTranscript) return;
    try {
      const updated = await toggleSaveTranscript(activeTranscript._id, !activeTranscript.isSaved);
      setActiveTranscript(updated);
      showToast(updated.isSaved ? '★ Saved to Vault!' : 'Removed from Vault.', 'success');
      loadHistory();
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Copy active text with or without timestamps
  const handleCopyText = () => {
    if (!activeTranscript) return;

    let textToCopy = '';
    const cleanEng = activeTranscript.cleanText.english && !/[\u0900-\u097F]/.test(activeTranscript.cleanText.english) ? activeTranscript.cleanText.english : '';
    const cleanHing = activeTranscript.cleanText.hinglish && !/[\u0900-\u097F]/.test(activeTranscript.cleanText.hinglish) ? activeTranscript.cleanText.hinglish : '';

    if (showTimestamps && activeTranscript.segments && activeTranscript.segments.length > 0) {
      textToCopy = activeTranscript.segments
        .map((s) => {
          let lineText = s.textOriginal;
          if (activeLanguage === 'english') {
            lineText = s.textEnglish && !/[\u0900-\u097F]/.test(s.textEnglish) ? s.textEnglish : (cleanEng || s.textOriginal);
          } else if (activeLanguage === 'hinglish') {
            lineText = s.textHinglish && !/[\u0900-\u097F]/.test(s.textHinglish) ? s.textHinglish : (cleanHing || s.textOriginal);
          }
          return `[${s.timestamp}] ${lineText}`;
        })
        .join('\n');
    } else {
      if (activeLanguage === 'english') textToCopy = cleanEng || activeTranscript.cleanText.original;
      else if (activeLanguage === 'hinglish') textToCopy = cleanHing || activeTranscript.cleanText.original;
      else textToCopy = activeTranscript.cleanText.original;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Copied to clipboard!', 'success');
  };

  // Export as .TXT
  const handleExportTxt = () => {
    if (!activeTranscript) return;
    const cleanEng = activeTranscript.cleanText.english && !/[\u0900-\u097F]/.test(activeTranscript.cleanText.english) ? activeTranscript.cleanText.english : '';
    const cleanHing = activeTranscript.cleanText.hinglish && !/[\u0900-\u097F]/.test(activeTranscript.cleanText.hinglish) ? activeTranscript.cleanText.hinglish : '';

    let content = `Title: ${activeTranscript.title}\nCreator: ${activeTranscript.creatorName}\nLanguage: ${activeLanguage.toUpperCase()}\nSource: ${activeTranscript.sourceUrl}\n\n`;
    if (showTimestamps && activeTranscript.segments && activeTranscript.segments.length > 0) {
      content += activeTranscript.segments
        .map((s) => {
          let lineText = s.textOriginal;
          if (activeLanguage === 'english') {
            lineText = s.textEnglish && !/[\u0900-\u097F]/.test(s.textEnglish) ? s.textEnglish : (cleanEng || s.textOriginal);
          } else if (activeLanguage === 'hinglish') {
            lineText = s.textHinglish && !/[\u0900-\u097F]/.test(s.textHinglish) ? s.textHinglish : (cleanHing || s.textOriginal);
          }
          return `[${s.timestamp}] ${lineText}`;
        })
        .join('\n');
    } else {
      const text =
        activeLanguage === 'english'
          ? cleanEng || activeTranscript.cleanText.original
          : activeLanguage === 'hinglish'
          ? cleanHing || activeTranscript.cleanText.original
          : activeTranscript.cleanText.original;
      content += text;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTranscript.title.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}_${activeLanguage}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Detect URL platform type
  const isYouTube = urlInput.includes('youtube.com') || urlInput.includes('youtu.be');
  const isInstagram = urlInput.includes('instagram.com');

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between shadow-lg transition-all border animate-fade-in ${
            feedback.type === 'error'
              ? 'bg-red-950/80 border-red-800 text-red-200'
              : feedback.type === 'info'
              ? 'bg-pink-950/80 border-pink-700 text-pink-200'
              : 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
          }`}
        >
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Main Link Input Card */}
      <div className="p-4 sm:p-6 rounded-2xl bg-[#0f131f]/90 border border-gray-800/90 shadow-xl space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Video-to-Text Transcript Lab
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            Paste any YouTube video/Shorts or Instagram Reel link to extract timestamped transcripts, clean creator text, and AI script soundbites.
          </p>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-400">
              {isYouTube ? (
                <Youtube className="w-4 h-4 text-red-400" />
              ) : isInstagram ? (
                <Instagram className="w-4 h-4 text-pink-400" />
              ) : (
                <LinkIcon className="w-4 h-4" />
              )}
            </div>

            <input
              type="text"
              placeholder="Paste YouTube or Instagram link (e.g. https://youtube.com/shorts/... or https://instagram.com/reel/...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTranscribe()}
              className="w-full bg-[#0a0d14] border border-gray-800 rounded-xl pl-10 pr-24 py-3 text-xs sm:text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400/40 transition-all shadow-inner"
            />

            {/* Quick Paste Button */}
            <button
              type="button"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  if (text) setUrlInput(text.trim());
                } catch {
                  // Clipboard permission not granted
                }
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 px-2.5 py-1 rounded-lg transition-colors active:scale-95"
            >
              Paste
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTranscribe()}
              disabled={loading || !urlInput.trim()}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-500/25 disabled:opacity-60 active:scale-95 whitespace-nowrap"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Transcribing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Transcribe Video ⚡</span>
                </>
              )}
            </button>

            {/* Upload Fallback Shortcut */}
            <button
              onClick={() => setUploadModalOpen(true)}
              title="Upload Audio/Video File directly"
              className="p-3 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white transition-colors active:scale-95"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Fallback Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0e121d] border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border-pink-500/20">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-pink-400" />
                <span>{isYouTube ? 'Direct Audio/Video Upload' : 'Transcribe Instagram Reel or Media File'}</span>
              </h3>
              <button
                onClick={() => setUploadModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 text-base leading-none"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-200/90 leading-relaxed">
              {isYouTube ? (
                <>
                  <strong className="text-pink-300">YouTube Cloud Fetch Notice:</strong> This video could not be fetched via public captions or cloud player. You can drop the video/audio file below for instant Gemini 3.5 Flash transcription.
                </>
              ) : (
                <>
                  <strong className="text-pink-300">Why Instagram links challenge cloud servers:</strong> Meta strictly blocks unauthenticated data-center IPs from downloading Reels. You have two ultra-fast solutions:
                </>
              )}
            </div>

            {/* Method 1: Drop Video/Audio */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-pink-500/20 text-pink-400 text-[11px] font-bold flex items-center justify-center">1</span>
                Drop Video / Audio (Instant Gemini Transcription):
              </span>
              <label className="border-2 border-dashed border-gray-800 hover:border-pink-500/50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-[#0a0d14]/50 group">
                <Upload className="w-8 h-8 text-gray-500 group-hover:text-pink-400 transition-colors" />
                <span className="text-xs font-semibold text-gray-300 group-hover:text-white">
                  {uploading ? 'Processing with Gemini 3.5 Flash...' : 'Click or drop video/audio here (.mp4, .mov, .mp3)'}
                </span>
                <span className="text-[10px] text-gray-500">Fast 1-tap processing up to 50MB</span>
                <input
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Quick helper tip */}
            <div className="pt-2 border-t border-gray-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-gray-400">
              <div className="flex items-center gap-1">
                <span>Need the Reel file?</span>
                <a
                  href={`https://fastdl.app/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-400 hover:underline flex items-center gap-0.5"
                >
                  Save at FastDL <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <span className="text-gray-500">or add INSTAGRAM_SESSION_ID to .env</span>
            </div>
          </div>
        </div>
      )}

      {/* Active Transcript Result Card */}
      {activeTranscript && (
        <div className="rounded-2xl bg-[#0f131f]/95 border border-pink-500/30 shadow-2xl overflow-hidden space-y-4 animate-fade-in">
          {/* Header Info Banner */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-500/10 via-[#111624] to-[#0f131f] border-b border-gray-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              {activeTranscript.thumbnailUrl ? (
                <img
                  src={activeTranscript.thumbnailUrl}
                  alt={activeTranscript.title}
                  className="w-16 h-12 rounded-lg object-cover border border-gray-800 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                    {activeTranscript.sourcePlatform}
                  </span>
                  <span className="text-xs text-gray-400">{activeTranscript.creatorName}</span>
                  {activeTranscript.durationSeconds !== undefined && activeTranscript.durationSeconds > 0 && (
                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Clock className="w-3 h-3 text-pink-400" />
                      <span>{Math.floor(activeTranscript.durationSeconds / 60)}m {activeTranscript.durationSeconds % 60}s</span>
                    </span>
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-xl">
                  {activeTranscript.title}
                </h3>
              </div>
            </div>

            {/* Primary Action: Draft Script in Studio + Watch Video Toggle */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
              {activeTranscript.sourcePlatform === 'YOUTUBE' && activeTranscript.videoId && (
                <button
                  type="button"
                  onClick={() => setShowPlayer(!showPlayer)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    showPlayer
                      ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                      : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                  }`}
                  title="Toggle Embedded Video Player"
                >
                  <Play className="w-3.5 h-3.5 text-pink-400" />
                  <span>{showPlayer ? 'Hide Video' : 'Watch Video'}</span>
                </button>
              )}

              <button
                onClick={handleToggleSave}
                className={`p-2.5 rounded-xl border transition-colors ${
                  activeTranscript.isSaved
                    ? 'bg-pink-500/20 text-pink-300 border-pink-500/40'
                    : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                }`}
                title="Save to Vault"
              >
                <Star className={`w-4 h-4 ${activeTranscript.isSaved ? 'fill-pink-400 text-pink-400' : ''}`} />
              </button>

              <button
                onClick={() => {
                  setScriptNotes('');
                  setScriptModalOpen(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-pink-500/20 active:scale-95"
              >
                <span>Draft Script in Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Embedded Video Player (if toggled) */}
          {showPlayer && activeTranscript.sourcePlatform === 'YOUTUBE' && activeTranscript.videoId && (
            <div className="px-4 sm:px-5 pt-1 animate-fade-in">
              <div className="relative aspect-video max-w-2xl mx-auto rounded-2xl overflow-hidden border border-gray-800 shadow-2xl bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeTranscript.videoId}?autoplay=1`}
                  title={activeTranscript.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Controls Bar: Timestamps ON/OFF + Language Switcher + Copy/Export */}
          <div className="px-4 sm:px-5 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* View Mode Tabs (Transcript vs Summary vs Angles) */}
            <div className="flex items-center gap-1 bg-[#0a0d14] p-1 rounded-xl border border-gray-800">
              <button
                onClick={() => setActiveTab('transcript')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'transcript'
                    ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Full Transcript
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'summary'
                    ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Key Takeaways ({activeTranscript.summary?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('angles')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'angles'
                    ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Debate Angles
              </button>
            </div>

            {/* Customization Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Timestamp Toggle (ON / OFF) */}
              <button
                type="button"
                onClick={() => setShowTimestamps(!showTimestamps)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                  showTimestamps
                    ? 'bg-pink-500/15 text-pink-300 border-pink-500/40'
                    : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                }`}
                title="Toggle line timestamps"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Timestamps: {showTimestamps ? 'ON' : 'OFF'}</span>
              </button>

              {/* Language Switcher (English / Hinglish / Original) */}
              <div className="flex items-center gap-1 bg-[#0a0d14] p-1 rounded-xl border border-gray-800 text-xs">
                <Languages className="w-3.5 h-3.5 text-gray-400 ml-1.5" />
                <button
                  type="button"
                  onClick={() => handleLanguageSelect('english')}
                  className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                    activeLanguage === 'english'
                      ? 'bg-pink-500/20 text-pink-300 font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {translating && activeLanguage === 'english' && (
                    <RefreshCw className="w-2.5 h-2.5 animate-spin text-pink-400" />
                  )}
                  <span>English</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageSelect('hinglish')}
                  className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                    activeLanguage === 'hinglish'
                      ? 'bg-pink-500/20 text-pink-300 font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {translating && activeLanguage === 'hinglish' && (
                    <RefreshCw className="w-2.5 h-2.5 animate-spin text-pink-400" />
                  )}
                  <span>Hinglish</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageSelect('original')}
                  className={`px-2 py-1 rounded-lg transition-colors ${
                    activeLanguage === 'original'
                      ? 'bg-pink-500/20 text-pink-300 font-bold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Original
                </button>
              </div>

              {/* Force AI Translation Button */}
              <button
                type="button"
                onClick={() => handleTranslateWithGemini()}
                disabled={translating}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-semibold bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border-pink-500/30 transition-colors disabled:opacity-50 active:scale-95"
                title="Translate transcript into English and Roman Hinglish with Gemini 3.5 Flash"
              >
                <Sparkles className={`w-3.5 h-3.5 text-pink-400 ${translating ? 'animate-spin' : ''}`} />
                <span>{translating ? 'Translating...' : 'AI Translate'}</span>
              </button>

              {/* Copy & Export */}
              <button
                onClick={handleCopyText}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white font-medium transition-colors active:scale-95"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-pink-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleExportTxt}
                className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white transition-colors"
                title="Download as .TXT"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Tab Content Display */}
          <div className="px-4 sm:px-5 pb-5">
            {activeTab === 'transcript' && (
              <div className="p-4 rounded-2xl bg-[#090c14] border border-gray-800/80 max-h-[500px] overflow-y-auto space-y-2 text-xs sm:text-sm text-gray-200 leading-relaxed font-sans">
                {translating ? (
                  <div className="py-12 px-4 text-center space-y-3">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-pink-400" />
                    <p className="text-sm font-bold text-white">Translating with Gemini 3.5 Flash...</p>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      Translating Hindi audio transcript to natural English and Roman-alphabet Hinglish.
                    </p>
                  </div>
                ) : showTimestamps && activeTranscript.segments && activeTranscript.segments.length > 0 ? (
                  activeTranscript.segments.map((seg, idx) => {
                    let text = seg.textOriginal;
                    if (activeLanguage === 'english') {
                      text = seg.textEnglish && !/[\u0900-\u097F]/.test(seg.textEnglish)
                        ? seg.textEnglish
                        : (activeTranscript.cleanText.english && !/[\u0900-\u097F]/.test(activeTranscript.cleanText.english)
                           ? activeTranscript.cleanText.english
                           : seg.textOriginal);
                    } else if (activeLanguage === 'hinglish') {
                      text = seg.textHinglish && !/[\u0900-\u097F]/.test(seg.textHinglish)
                        ? seg.textHinglish
                        : (activeTranscript.cleanText.hinglish && !/[\u0900-\u097F]/.test(activeTranscript.cleanText.hinglish)
                           ? activeTranscript.cleanText.hinglish
                           : seg.textOriginal);
                    }

                    return (
                      <div key={idx} className="flex items-start gap-2.5 py-1 hover:bg-[#121622]/50 px-2 rounded-lg transition-colors group">
                        <button
                          type="button"
                          onClick={() => {
                            if (activeTranscript.sourcePlatform === 'YOUTUBE' && activeTranscript.videoId) {
                              window.open(`https://www.youtube.com/watch?v=${activeTranscript.videoId}&t=${Math.floor(seg.start)}s`, '_blank');
                            }
                          }}
                          title="Click to jump to this moment in video ↗"
                          className="font-mono text-pink-400 group-hover:text-pink-300 text-xs shrink-0 select-none bg-pink-500/10 hover:bg-pink-500/20 px-1.5 py-0.5 rounded border border-pink-500/20 cursor-pointer flex items-center gap-1 transition-colors"
                        >
                          <Clock className="w-3 h-3 text-pink-400" />
                          <span>{seg.timestamp}</span>
                        </button>
                        <p className="flex-1 text-gray-300">{text}</p>
                      </div>
                    );
                  })
                ) : (
                  <div>
                    {activeLanguage === 'hinglish' && (!activeTranscript.cleanText.hinglish || /[\u0900-\u097F]/.test(activeTranscript.cleanText.hinglish)) ? (
                      <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/30 text-center space-y-2.5 my-2">
                        <p className="text-pink-300 font-semibold text-xs sm:text-sm">
                          Roman Hinglish translation is not ready yet.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleTranslateWithGemini('hinglish')}
                          className="px-3.5 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow active:scale-95 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Generate Roman Hinglish with Gemini</span>
                        </button>
                      </div>
                    ) : activeLanguage === 'english' && (!activeTranscript.cleanText.english || /[\u0900-\u097F]/.test(activeTranscript.cleanText.english)) ? (
                      <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/30 text-center space-y-2.5 my-2">
                        <p className="text-pink-300 font-semibold text-xs sm:text-sm">
                          English translation is not ready yet.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleTranslateWithGemini('english')}
                          className="px-3.5 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow active:scale-95 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Translate to English with Gemini</span>
                        </button>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed text-gray-300">
                        {activeLanguage === 'english'
                          ? activeTranscript.cleanText.english || activeTranscript.cleanText.original
                          : activeLanguage === 'hinglish'
                          ? activeTranscript.cleanText.hinglish || activeTranscript.cleanText.original
                          : activeTranscript.cleanText.original}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'summary' && (
              <div className="space-y-4">
                {/* Key Takeaways */}
                <div className="p-4 rounded-2xl bg-[#090c14] border border-gray-800 space-y-2.5">
                  <h4 className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Executive Takeaways:</span>
                  </h4>
                  <ul className="space-y-2">
                    {activeTranscript.summary.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-200">
                        <span className="text-pink-400 font-bold">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Direct Quotes */}
                {activeTranscript.keyQuotes && activeTranscript.keyQuotes.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#090c14] border border-gray-800 space-y-2.5">
                    <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5 text-pink-400" />
                      <span>Quotable Soundbites:</span>
                    </h4>
                    <div className="space-y-2">
                      {activeTranscript.keyQuotes.map((q, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-[#121622] border-l-2 border-pink-400 text-xs sm:text-sm text-gray-200 flex items-start justify-between gap-3">
                          <p className="italic flex-1">"{q}"</p>
                          <button
                            type="button"
                            onClick={() => {
                              setScriptNotes(`Focus around this quote from ${activeTranscript.creatorName}: "${q}"`);
                              setScriptModalOpen(true);
                            }}
                            className="text-[11px] font-bold text-pink-400 hover:text-pink-300 shrink-0 bg-pink-500/10 hover:bg-pink-500/20 px-2 py-1 rounded-lg border border-pink-500/20 transition-colors"
                          >
                            + Draft Script ↗
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'angles' && (
              <div className="p-4 rounded-2xl bg-[#090c14] border border-gray-800 space-y-3">
                <h4 className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>Contrarian & Viral Script Angles:</span>
                </h4>
                <div className="space-y-2">
                  {activeTranscript.suggestedAngles?.map((angle, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#121622] border border-gray-800 text-xs sm:text-sm text-gray-200 flex items-center justify-between gap-3"
                    >
                      <span className="flex-1">{angle}</span>
                      <button
                        onClick={() => {
                          setScriptNotes(`Angle / hook: ${angle}`);
                          setScriptModalOpen(true);
                        }}
                        className="text-[11px] text-pink-400 hover:text-pink-300 font-bold shrink-0 bg-pink-500/10 hover:bg-pink-500/20 px-2.5 py-1 rounded-lg border border-pink-500/20 transition-colors"
                      >
                        + Draft Script ↗
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Script Generation Modal */}
      {activeTranscript && (
        <ScriptModal
          transcriptId={activeTranscript._id}
          transcriptTitle={activeTranscript.title}
          initialNotes={scriptNotes}
          isOpen={scriptModalOpen}
          onClose={() => {
            setScriptModalOpen(false);
            setScriptNotes('');
          }}
        />
      )}

      {/* Historical Transcripts Library */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Transcription Library
            </h3>
            <span className="text-[10px] bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
              {history.length} saved
            </span>
          </div>

          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search past transcripts..."
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full bg-[#0a0d14] border border-gray-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-pink-400"
            />
          </div>
        </div>

        {historyLoading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading library...</div>
        ) : history.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500 border border-gray-800/80 rounded-2xl bg-[#0f131f]/40">
            No previous transcripts found. Paste a YouTube or Instagram link above to begin!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {history.map((item) => (
              <div
                key={item._id}
                onClick={async () => {
                  setActiveTranscript(item);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  try {
                    const full = await fetchTranscriptById(item._id);
                    if (full) setActiveTranscript(full);
                  } catch {
                    // Keep list item if fetch fails
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  activeTranscript?._id === item._id
                    ? 'bg-pink-500/10 border-pink-500/40 shadow-sm'
                    : 'bg-[#0f131f]/80 hover:bg-[#121624] border-gray-800/80 hover:border-gray-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
                    <span className="font-semibold text-pink-400">{item.sourcePlatform}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-2 mb-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 truncate">{item.creatorName}</p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-800/60 text-xs">
                  <span className="text-[11px] text-pink-300 font-medium">Open Transcript ↗</span>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm('Delete this transcript?')) {
                        await deleteTranscript(item._id);
                        if (activeTranscript?._id === item._id) setActiveTranscript(null);
                        loadHistory();
                      }
                    }}
                    className="text-gray-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
