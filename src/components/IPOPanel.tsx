import React from 'react';
import { IPOCompany } from '../types';
import { Milestone, BadgeAlert, Coins, Sparkles, Building2 } from 'lucide-react';

interface IPOPanelProps {
  ipos: IPOCompany[];
  loading: boolean;
  onSelectCompany: (q: string) => void;
}

export default function IPOPanel({ ipos, loading, onSelectCompany }: IPOPanelProps) {
  const getStatusBadge = (status: IPOCompany['status']) => {
    switch (status) {
      case 'Recent':
        return 'bg-emerald-950/70 text-emerald-400 border-emerald-500/20';
      case 'Upcoming':
        return 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20';
      case 'Filed':
        return 'bg-blue-950/60 text-blue-400 border-blue-900/30';
      case 'Anticipated':
        return 'bg-purple-950/60 text-purple-400 border-purple-900/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="card-bg rounded-2xl p-5 flex flex-col h-full relative overflow-hidden" id="ipo-intelligence-panel">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/50">
        <h2 className="text-sm font-display font-bold tracking-wider text-[#D4AF37] uppercase flex items-center gap-2">
          <Milestone className="w-4 h-4" />
          IPO Pipeline & Filings
        </h2>
        <span className="text-[10px] font-mono text-slate-400">June 2026 Schedule</span>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 gap-2 text-slate-500 text-xs">
          <div className="w-5 h-5 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin"></div>
          <span className="font-mono">Connecting SEC database...</span>
        </div>
      ) : ipos.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-10 text-slate-500 text-xs font-mono">
          No IPO prospectus loaded.
        </div>
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto max-h-[420px] pr-1">
          {ipos.map((company, index) => (
            <div
              key={index}
              className="card-bg rounded-xl p-4 hover:border-[#D4AF37]/35 transition-all duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-display font-medium text-slate-100 flex items-center gap-1.5 flex-wrap">
                      {company.name}
                      <span className="text-[10px] font-mono bg-slate-900 text-[#D4AF37]/80 px-1.5 py-0.2 px-1 rounded">
                        {company.symbol}
                      </span>
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">{company.exchange}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full border ${getStatusBadge(company.status)}`}>
                    {company.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3.5 border-t border-b border-slate-900/80 py-2.5 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 uppercase block text-[9px] tracking-wider mb-0.5">Price Range</span>
                  <span className="text-slate-200 font-semibold">{company.priceRange}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase block text-[9px] tracking-wider mb-0.5">Offer Volume</span>
                  <span className="text-slate-200 font-semibold">{company.shares} {company.shares !== "N/A" ? 'Shares' : ''}</span>
                </div>
                <div className="col-span-2 pt-1.5 mt-1 border-t border-slate-900/30">
                  <span className="text-slate-500 uppercase block text-[9px] tracking-wider mb-0.5">Listing Date</span>
                  <span className="text-[#D4AF37] font-semibold">{company.expectedDate}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-3 font-sans leading-relaxed">
                {company.description}
              </p>

              {/* AI Sentiment Box */}
              <div 
                onClick={() => onSelectCompany(`Analyze the IPO potential of ${company.name} (${company.symbol}) and its competitive moat`)}
                className="mt-3 bg-[#D4AF37]/5 hover:bg-[#D4AF37]/10 border border-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all rounded-lg p-2.5 flex items-start gap-2 cursor-pointer group"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                <div className="text-[10px] leading-relaxed">
                  <span className="font-mono text-[#D4AF37] font-semibold uppercase tracking-wider block mb-0.5 text-[8.5px]">Gemini Prospectus Sentiment:</span>
                  <p className="text-slate-300 font-sans group-hover:text-slate-200">{company.aiSentiment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-[9px] font-mono text-slate-500 mt-4 border-t border-slate-800/40 pt-2 text-center">
        * Estimates retrieved from SEC Form S-1 filings. Click prospectus logs for details.
      </div>
    </div>
  );
}
