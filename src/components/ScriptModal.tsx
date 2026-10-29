'use client';

import React, { useState, useEffect } from 'react';
import { ScriptDraftResult } from '../types';
import { generateScriptFromTranscript } from '../services/api';
import { X, Sparkles, Copy, Check, Clock, FileText, Video, Radio, Flame } from 'lucide-react';

interface ScriptModalProps {
  transcriptId: string;
  transcriptTitle: string;
  initialNotes?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ScriptModal: React.FC<ScriptModalProps> = ({
  transcriptId,
  transcriptTitle,
  initialNotes = '',
  isOpen,
  onClose,
}) => {
  const [format, setFormat] = useState<'SHORT' | 'LONG'>('SHORT');
  const [creatorNotes, setCreatorNotes] = useState<string>(initialNotes);
  const [loading, setLoading] = useState<boolean>(false);
  const [scriptResult, setScriptResult] = useState<ScriptDraftResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialNotes) {
      setCreatorNotes(initialNotes);
    }
  }, [initialNotes]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await generateScriptFromTranscript(transcriptId, format, creatorNotes);
      setScriptResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to generate script draft.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyScript = () => {
    if (!scriptResult) return;
    navigator.clipboard.writeText(scriptResult.scriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0e121d] border border-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border-pink-500/20">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-gray-800/80 flex items-center justify-between bg-[#111624]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Script Studio Generator</span>
                <span className="text-[10px] bg-pink-500/10 text-pink-300 border border-pink-500/25 px-2 py-0.5 rounded-full font-semibold">
                  Gemini AI
                </span>
              </h3>
              <p className="text-[11px] text-gray-400 truncate max-w-sm sm:max-w-md">
                {transcriptTitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-gray-300">
          {!scriptResult ? (
            <div className="space-y-4">
              {/* Format Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Choose Target Video Format:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormat('SHORT')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      format === 'SHORT'
                        ? 'bg-pink-500/15 border-pink-500/50 text-white shadow-sm'
                        : 'bg-[#121622] border-gray-800 hover:border-gray-700 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold mb-1 text-pink-300 text-sm">
                      <Flame className="w-4 h-4" />
                      <span>30–60s Short / Reel</span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      3 viral hooks, high retention pacing, B-roll markers & strong CTA. (140-160 words)
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormat('LONG')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      format === 'LONG'
                        ? 'bg-pink-500/15 border-pink-500/50 text-white shadow-sm'
                        : 'bg-[#121622] border-gray-800 hover:border-gray-700 text-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold mb-1 text-pink-300 text-sm">
                      <Video className="w-4 h-4" />
                      <span>3–5 min YouTube Video</span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Chapter markers, 3-act narrative arc, retention resets & viewer question. (600-750 words)
                    </p>
                  </button>
                </div>
              </div>

              {/* Creator Direction / Focus Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Optional Creator Angle / Notes:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Focus on Rohit Sharma's captaincy or WPL purse balance..."
                  value={creatorNotes}
                  onChange={(e) => setCreatorNotes(e.target.value)}
                  className="w-full bg-[#121622] border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-pink-400 transition-colors"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs">
                  {error}
                </div>
              )}

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-500/20 disabled:opacity-60 active:scale-95"
              >
                {loading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-white" />
                    <span>Gemini is Crafting Your {format === 'SHORT' ? 'Short' : 'Breakdown'} Script...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate {format === 'SHORT' ? '30–60s Short' : '3–5 Min Breakdown'} Script ⚡</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Output Stats Bar */}
              <div className="flex items-center justify-between bg-[#121622] p-3 rounded-xl border border-gray-800 text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-pink-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{scriptResult.estimatedDuration}</span>
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="flex items-center gap-1 text-gray-300">
                    <FileText className="w-3.5 h-3.5" />
                    <span>{scriptResult.wordCount} words</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setScriptResult(null)}
                    className="text-[11px] text-gray-400 hover:text-white px-2 py-1 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Regenerate
                  </button>
                  <button
                    onClick={handleCopyScript}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-500/20 text-pink-300 border border-pink-500/40 hover:bg-pink-500 hover:text-white font-semibold text-xs transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied Script!' : 'Copy Script'}</span>
                  </button>
                </div>
              </div>

              {/* Viral Hooks (for Shorts) */}
              {scriptResult.hookOptions && scriptResult.hookOptions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-pink-400" />
                    <span>Viral Hook Variations:</span>
                  </h4>
                  <div className="space-y-1.5">
                    {scriptResult.hookOptions.map((h) => (
                      <div
                        key={h.id}
                        className="p-2.5 rounded-xl bg-[#121622] border border-gray-800/80 flex items-start gap-2.5 text-xs"
                      >
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-pink-500/10 text-pink-300 font-bold border border-pink-500/20 shrink-0">
                          {h.type}
                        </span>
                        <p className="text-gray-200 font-medium">{h.hook}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Script Body */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-gray-300">Spoken Script:</h4>
                <div className="p-3.5 rounded-xl bg-[#090c14] border border-gray-800 font-sans text-xs sm:text-sm text-gray-200 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">
                  {scriptResult.scriptText}
                </div>
              </div>

              {/* Visual Production Notes / Cues */}
              {scriptResult.visualNotes && scriptResult.visualNotes.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-gray-400">B-Roll & Visual Direction:</h4>
                  <div className="space-y-1">
                    {scriptResult.visualNotes.map((note, idx) => (
                      <p key={idx} className="text-[11px] text-gray-400 bg-[#121622]/60 px-2.5 py-1.5 rounded-lg border border-gray-800/50">
                        {note}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Chapter Markers (for Long form) */}
              {scriptResult.chapterMarkers && scriptResult.chapterMarkers.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-gray-400">Chapter Markers:</h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {scriptResult.chapterMarkers.map((c, idx) => (
                      <div key={idx} className="text-[11px] bg-[#121622] p-2 rounded-lg border border-gray-800 flex items-center gap-2">
                        <span className="text-pink-400 font-mono font-bold">{c.timestamp}</span>
                        <span className="text-gray-300 truncate">{c.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
