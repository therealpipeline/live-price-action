import React, { useState } from 'react';
import { Send, Sparkles, RefreshCw, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { Citation } from '../types';

interface AIAnalystProps {
  onSendMessage: (msg: string) => Promise<void>;
  response: string;
  citations: Citation[];
  loading: boolean;
  isSimulated: boolean;
  selectedAssetSymbol?: string;
  onRefreshPrices: () => void;
}

export default function AIAnalyst({
  onSendMessage,
  response,
  citations,
  loading,
  isSimulated,
  selectedAssetSymbol,
  onRefreshPrices
}: AIAnalystProps) {
  const [queryInput, setQueryInput] = useState('');

  const presets = [
    { label: "Analyze Gold Demand", query: "What is holding up the Gold spot price today and what are central banks forecasting?" },
    { label: "Compare Silver Moat", query: "Analyze industrial silver demand benchmarks vs gold safe-haven values for 2026." },
    { label: "Semiconductor IPOs", query: "Provide a detailed intelligence report on upcoming AI hardware IPOs like Cerebras Systems." },
    { label: "Crude Oil Catalysts", query: "Why is crude oil charting higher this week?" },
    { label: "Tech Stock Audit", query: "Give me the latest live stock data of NVDA and AAPL with Google search grounding." }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim() === '' || loading) return;
    onSendMessage(queryInput);
    setQueryInput('');
  };

  const handlePresetClick = (q: string) => {
    if (loading) return;
    onSendMessage(q);
  };

  // Helper to parse simple markdown bolding, lists, and headings for terminal layout
  const renderFormattedResponse = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Heading level 3: ### Title
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-sm font-display font-bold text-[#D4AF37] tracking-wider uppercase mt-4 mb-2 border-b border-[#D4AF37]/15 pb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Heading level 2: ## Title
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-base font-display font-bold text-[#D4AF37] tracking-wide mt-5 mb-2.5">
            {line.replace('## ', '')}
          </h3>
        );
      }
      // List bullet point: - List item OR * List item
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const cleanContent = line.replace(/^[-*]\s+/, '');
        return (
          <li key={idx} className="text-xs text-slate-300 font-sans list-none pl-4 relative mb-1.5 before:content-[''] before:absolute before:left-1 before:top-2 before:w-1.5 before:h-1.5 before:bg-[#D4AF37] before:rounded-full">
            {parseBolding(cleanContent)}
          </li>
        );
      }
      // Empty line
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      // Ordinary paragraph
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed mb-2 font-sans">
          {parseBolding(line)}
        </p>
      );
    });
  };

  const parseBolding = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-[#D4AF37] font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="card-bg rounded-2xl p-5 flex flex-col h-full relative overflow-hidden" id="ai-intelligence-analyst">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/50 mb-4 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-ping"></div>
          <div>
            <h2 className="text-sm font-display font-bold tracking-wider text-slate-100 uppercase">
              Gemini sovereign AI Analyst
            </h2>
            <p className="text-[10px] text-[#D4AF37] uppercase font-mono tracking-widest mt-0.5">Google Search Grounded</p>
          </div>
        </div>

        <button
          onClick={onRefreshPrices}
          className="text-[10px] font-mono border border-[#D4AF37]/20 hover:border-[#D4AF37]/70 bg-slate-950/40 hover:bg-[#D4AF37]/10 text-slate-200 hover:text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all flex-shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-pulse" />
          Poll Price Grounds
        </button>
      </div>

      {/* Preset Query Tokens */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {presets.map((preset, index) => (
          <button
            key={index}
            onClick={() => handlePresetClick(preset.query)}
            disabled={loading}
            className="text-[10px] font-sans border border-slate-800 hover:border-[#D4AF37]/35 bg-slate-950/50 hover:bg-[#D4AF37]/5 text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer disabled:opacity-50"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Reply Container */}
      <div className="flex-1 overflow-y-auto max-h-[380px] bg-slate-950/60 rounded-xl border border-slate-900 p-4 space-y-3 scrollbar mb-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full py-12 gap-3 text-slate-500 font-mono text-xs">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-slate-800"></div>
              <div className="absolute top-0 left-0 w-10 h-10 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin"></div>
            </div>
            <span className="text-[#D4AF37] animate-pulse">Running Google Search Grounding...</span>
            <span className="text-[10px] text-slate-600 text-center px-4">Instructing Gemini to browse live commodities calendars, Nasdaq records, and gold charts...</span>
          </div>
        ) : response ? (
          <div>
            {isSimulated && (
              <div className="mb-4 bg-amber-950/20 border border-amber-950/60 rounded-lg p-2.5 text-[10px] text-amber-500/90 font-mono flex items-start gap-2 select-none">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">DEVELOPER MODE SENSING</span>: No API key identified. Running local simulated models with high-fidelity historical estimates. Set GEMINI_API_KEY in the Secrets panel to activate live web queries!
                </div>
              </div>
            )}
            <div className="prose prose-invert max-w-none text-xs">
              {renderFormattedResponse(response)}
            </div>

            {/* Citations section */}
            {citations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-900 flex flex-col gap-2">
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-[#D4AF37]" /> Sources & Grounding Citations:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {citations.map((cite, cIdx) => (
                    <a
                      key={cIdx}
                      href={cite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-mono border border-slate-800 hover:border-[#D4AF37]/30 bg-slate-900/60 text-[#D4AF37]/80 hover:text-white px-2 py-0.5 rounded transition-all flex items-center gap-1 hover:bg-[#D4AF37]/10"
                    >
                      {cite.title || 'Market Link'}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-10">
            <Sparkles className="w-10 h-10 text-slate-700 mb-3 stroke-[1.2] animate-pulse" />
            <p className="font-display font-medium text-slate-400 text-center mb-1">Interactive Macro Research Portal</p>
            <p className="font-sans text-slate-500 text-center max-w-xs leading-relaxed text-[10.5px]">
              Select a preset news trigger above, or enter any ticker or analysis inquiry below to query live world indices.
            </p>
          </div>
        )}
      </div>

      {/* Query input field */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder={selectedAssetSymbol ? `Inquire about ${selectedAssetSymbol} (e.g. historical Moat)...` : "Query any stock/commodity/IPO index..."}
          disabled={loading}
          className="flex-1 bg-slate-950 border border-slate-800 focus:border-[#D4AF37]/60 outline-none text-slate-200 text-xs px-3.5 py-3 rounded-lg placeholder-slate-600 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all font-mono"
        />
        <button
          type="submit"
          disabled={loading || queryInput.trim() === ''}
          className="bg-gradient-to-r from-amber-500 via-[#D4AF37] to-yellow-600 hover:brightness-110 px-4 py-3 rounded-lg text-slate-950 font-bold flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:brightness-100"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
