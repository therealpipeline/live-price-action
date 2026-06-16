import React from 'react';
import { MarketNewsItem } from '../types';
import { Newspaper, ArrowUpRight, TrendingUp } from 'lucide-react';

interface NewsPanelProps {
  news: MarketNewsItem[];
  loading: boolean;
  onSelectHeadline: (headline: string) => void;
}

export default function NewsPanel({ news, loading, onSelectHeadline }: NewsPanelProps) {
  const getCategoryColor = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'gold':
        return 'bg-amber-950/60 text-[#D4AF37] border-amber-800/50';
      case 'silver':
        return 'bg-slate-800 text-slate-300 border-slate-700';
      case 'oil':
        return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50';
      case 'ipo':
        return 'bg-blue-950/60 text-blue-400 border-blue-800/50';
      default:
        return 'bg-purple-950/60 text-purple-400 border-purple-800/50';
    }
  };

  return (
    <div className="card-bg rounded-2xl p-5 h-full flex flex-col relative overflow-hidden" id="news-intelligence-panel">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/50">
        <h2 className="text-sm font-display font-bold tracking-wider text-[#D4AF37] uppercase flex items-center gap-2">
          <Newspaper className="w-4 h-4" />
          News & Market Intelligence
        </h2>
        {news.length > 0 && (
          <span className="text-[10px] bg-slate-930 text-emerald-400 border border-emerald-500/10 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
            <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping"></span> Live Web Sync
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 gap-2 text-slate-500 text-xs">
          <div className="w-5 h-5 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin"></div>
          <span className="font-mono">Syncing global financial press...</span>
        </div>
      ) : news.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-500 text-xs text-center border border-dashed border-slate-800 rounded-lg p-5">
          <TrendingUp className="w-8 h-8 text-slate-600 mb-2 stroke-[1.5]" />
          <p className="font-sans">No global news reports loaded yet.</p>
          <p className="font-mono text-[10px] mt-1 text-[#D4AF37]/60">Trigger a manual terminal search or refresh.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[360px] md:max-h-none">
          {news.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onSelectHeadline(item.title)}
              className="group card-bg hover:border-[#D4AF37]/35 rounded-lg p-3 transition-all duration-200 cursor-pointer flex flex-col gap-2 relative overflow-hidden"
              title="Click to analyze with Gemini"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border ${getCategoryColor(item.category)}`}>
                  {item.category || 'Market'}
                </span>
                <span className="text-[9px] text-slate-500 font-mono">{item.age}</span>
              </div>

              <h3 className="text-xs md:text-sm font-display font-medium text-slate-100 group-hover:text-[#D4AF37] leading-tight transition-colors duration-150 flex items-start justify-between gap-1.5 mt-0.5">
                <span>{item.title}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
              </h3>

              <p className="text-[11px] text-slate-400 font-sans line-clamp-2">
                {item.summary}
              </p>

              <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-900/60 mt-1">
                <span>Source: {item.source}</span>
                <span className="text-[#D4AF37]/40 group-hover:text-[#D4AF37]/90 transition-colors">Query with Gemini →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-[9px] font-mono text-slate-500 mt-4 border-t border-slate-800/40 pt-2 text-right">
        * Select any report headline to execute deep audit models.
      </div>
    </div>
  );
}
