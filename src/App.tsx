import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  HelpCircle, 
  RefreshCw, 
  Globe, 
  Clock, 
  Milestone, 
  Newspaper, 
  Sparkles, 
  Database,
  Search,
  ChevronRight,
  TrendingDown,
  ArrowUpRight
} from 'lucide-react';

import Sparkline from './components/Sparkline';
import InteractiveChart from './components/InteractiveChart';
import NewsPanel from './components/NewsPanel';
import IPOPanel from './components/IPOPanel';
import AIAnalyst from './components/AIAnalyst';
import { MarketAsset, IPOCompany, MarketNewsItem, Citation } from './types';

export default function App() {
  // Global API states
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [ipos, setIpos] = useState<IPOCompany[]>([]);
  const [news, setNews] = useState<MarketNewsItem[]>([]);
  
  // Selection/Focus states
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
  const [activeTab, setActiveTab] = useState<'ai' | 'ipos' | 'news'>('ai');
  
  // Terminal activity states
  const [loadingData, setLoadingData] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  
  // AI Analyst state machine
  const [aiResponse, setAiResponse] = useState('');
  const [aiCitations, setAiCitations] = useState<Citation[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiIsSimulated, setAiIsSimulated] = useState(false);

  // UTC / Real-Time Clock
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial market data and IPO structures
  const fetchMarketData = async () => {
    setLoadingData(true);
    try {
      const response = await fetch('/api/market-data');
      const payload = await response.json();
      if (payload.success) {
        setAssets(payload.data);
        setIpos(payload.ipos);
        // Default select Gold spot on first load
        const goldAsset = payload.data.find((a: MarketAsset) => a.id === 'gold') || payload.data[0];
        setSelectedAsset(goldAsset);
      }
    } catch (err) {
      console.error("Failed loading base market datasets:", err);
    } finally {
      setLoadingData(false);
    }
  };

  // Fetch live market reports
  const fetchNewsReports = async () => {
    setLoadingNews(true);
    try {
      const response = await fetch('/api/market-news');
      const payload = await response.json();
      if (payload.success) {
        setNews(payload.news);
      }
    } catch (err) {
      console.error("Failed fetching trending research reports:", err);
    } finally {
      setLoadingNews(false);
    }
  };

  // Trigger Grounded Price update via Google Search
  const handlePollRefresh = async () => {
    setLoadingRefresh(true);
    try {
      const response = await fetch('/api/market-refresh', { method: 'POST' });
      const payload = await response.json();
      if (payload.success) {
        setAssets(payload.data);
        setIpos(payload.ipos);
        // Sync active focus data with updated price
        if (selectedAsset) {
          const fresh = payload.data.find((a: MarketAsset) => a.id === selectedAsset.id);
          if (fresh) setSelectedAsset(fresh);
        }
      }
    } catch (err) {
      console.error("Failed refreshing grounded parameters:", err);
    } finally {
      setLoadingRefresh(false);
    }
  };

  // Dispatch AI Analyst Query using Gemini Grounded search
  const handleSendAiQuery = async (queryText: string) => {
    setAiLoading(true);
    setActiveTab('ai'); // Always slide back to view results in tabs
    try {
      const response = await fetch('/api/market-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText })
      });
      const payload = await response.json();
      if (payload.success) {
        setAiResponse(payload.answer);
        setAiCitations(payload.citations || []);
        setAiIsSimulated(payload.simulated || false);
      }
    } catch (err) {
      console.error("AI Dispatch error:", err);
      setAiResponse("### Query Routing Exception\n\nFailed to dispatch search algorithms or reach the live Gemini endpoint. Please confirm network integrity.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    fetchNewsReports();
  }, []);

  const formatUTCTime = (dt: Date) => {
    return dt.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-[#D4AF37]/30 selection:text-white" id="aurum-root">
      
      {/* 🚀 Top Announcement/Marquee ticker */}
      <div className="bg-slate-900 border-b border-[#D4AF37]/15 py-1.5 overflow-hidden relative z-10 select-none">
        <div className="animate-ticker whitespace-nowrap flex gap-8 items-center cursor-default">
          {assets.map((asset, i) => {
            const isPos = asset.price >= asset.prevPrice;
            return (
              <span 
                key={`${asset.id}-${i}`}
                onClick={() => setSelectedAsset(asset)}
                className="inline-flex items-center gap-1.5 text-[10.5px] font-mono tracking-wider cursor-pointer hover:text-[#D4AF37] transition-all"
              >
                <span className="text-slate-400 font-bold uppercase">{asset.name}</span>
                <span className="text-slate-200 font-medium">${asset.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                <span className={`font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPos ? '▲' : '▼'}{Math.abs(asset.changePercent).toFixed(2)}%
                </span>
              </span>
            );
          })}
          {/* Loop duplicates for smooth infinite scrolling */}
          {assets.map((asset, i) => {
            const isPos = asset.price >= asset.prevPrice;
            return (
              <span 
                key={`${asset.id}-dup-${i}`}
                onClick={() => setSelectedAsset(asset)}
                className="inline-flex items-center gap-1.5 text-[10.5px] font-mono tracking-wider cursor-pointer hover:text-[#D4AF37] transition-all"
              >
                <span className="text-slate-400 font-bold uppercase">{asset.name}</span>
                <span className="text-slate-200 font-medium">${asset.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}</span>
                <span className={`font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPos ? '▲' : '▼'}{Math.abs(asset.changePercent).toFixed(2)}%
                </span>
              </span>
            );
          })}
        </div>
      </div>

      {/* 🛰️ Main Terminal Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 border-b border-[#D4AF37]/20 pb-4 pt-6 px-6 relative z-10 select-none">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tighter text-[#D4AF37] leading-none uppercase">
            AUREUS<span className="text-white opacity-90">TERMINAL</span>
          </h1>
          <p className="text-[10px] tracking-[0.3em] opacity-50 font-bold uppercase mt-1">Live Commodities & Global Equity Feed</p>
        </div>
        <div className="flex gap-8 items-center mt-4 sm:mt-0">
          <div className="text-right">
            <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest">Market Status</p>
            <p className="text-xs font-bold text-green-500 flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> OPEN
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest">Server Time</p>
            <p className="text-xs font-mono font-bold">{formatUTCTime(time).split(' ')[1] || '14:22:09'} UTC</p>
          </div>
        </div>
      </header>

      {/* 🔮 Dashboard Content Grid */}
      <main className="flex-1 p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 max-w-7xl mx-auto w-full">
        
        {/* LEFT COLUMN: Commodities / Stock cards & major chart (8 cols wide on lg) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Commodities & Index Matrix Header */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs uppercase font-mono tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
                Commodities & Market Indices Spot List
              </h2>
              {loadingData && <span className="text-[10px] font-mono text-slate-500 animate-pulse">Loading spot feeds...</span>}
            </div>

            {/* Assets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {loadingData ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-slate-900/20 border border-slate-850 h-24 rounded-xl animate-pulse flex flex-col p-4 justify-between">
                    <div className="h-3 bg-slate-800 rounded w-1/2"></div>
                    <div className="h-5 bg-slate-800 rounded w-3/4"></div>
                  </div>
                ))
              ) : (
                assets.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id;
                  const isPos = asset.price >= asset.prevPrice;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 select-none flex flex-col justify-between relative group ${
                        isSelected 
                          ? 'bg-[#D4AF37]/10 border-[#D4AF37] gold-border-glow shadow-md shadow-[#D4AF37]/5 scale-[1.01]' 
                          : 'card-bg hover:border-[#D4AF37]/40'
                      }`}
                    >
                      {/* Active Indicator Top Glow bar */}
                      {isSelected && (
                        <div className="absolute top-0 left-4 right-4 h-[1.5px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
                      )}

                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-slate-500 font-medium tracking-wider uppercase block">{asset.symbol}</span>
                          <span className="text-xs font-display font-bold text-slate-200 mt-0.5 block group-hover:text-[#D4AF37] transition-colors">{asset.name}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${isPos ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10' : 'bg-rose-950/40 text-rose-400 border border-rose-500/10'}`}>
                          {isPos ? '+' : ''}{asset.changePercent.toFixed(2)}%
                        </span>
                      </div>

                      <div className="flex items-end justify-between mt-4">
                        <div>
                          <span className="text-sm md:text-base font-mono font-semibold tracking-tight text-white block">
                            {asset.price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 3 })}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono block">{asset.unit}</span>
                        </div>
                        
                        <div className="opacity-80 group-hover:opacity-100 transition-opacity">
                          <Sparkline data={asset.sparkline} isPositive={isPos} width={80} height={24} />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Interactive Chart Section */}
          {selectedAsset && (
            <div className="transition-all duration-300">
              <InteractiveChart asset={selectedAsset} />
            </div>
          )}

          {/* Core Grounded Commodities Details Card */}
          {selectedAsset && (
            <div className="card-bg rounded-2xl p-5 text-xs select-none">
              <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px] uppercase tracking-wider mb-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" /> Core Asset Specifications & Macro Scope
              </div>
              <p className="text-slate-300 font-sans leading-relaxed">
                {selectedAsset.description} {selectedAsset.category === 'commodity' 
                  ? "Commodity pricing fluctuations respond heavily to sovereign central treasury interest rates, physical trade balance registers, and localized shipping energy tolls." 
                  : "Equity parameters are affected by aggregate quarterly earnings results and institutional macro liquidity factors."
                }
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-3 pt-2.5 border-t border-slate-900/80">
                <span>Last Grounded: {new Date(selectedAsset.lastUpdated).toLocaleTimeString()}</span>
                <span className="hover:text-[#D4AF37] cursor-pointer" onClick={() => handleSendAiQuery(`Provide a deep 3-stage macroeconomic brief on ${selectedAsset.name} (${selectedAsset.symbol})`)}>Query Strategist Moat →</span>
              </div>
            </div>
          )}

          {/* 🌟 Dual Bento Widgets: Sentiment Analysis & Live Pulse */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-bg rounded-2xl p-5 flex flex-col justify-between">
              <h3 className="text-[10px] font-bold tracking-widest uppercase opacity-60 mb-2 text-[#D4AF37]">Sentiment Analysis</h3>
              <div className="flex flex-col items-center justify-center py-2 flex-grow">
                <div className="relative w-28 h-14 overflow-hidden">
                  <div className="absolute top-0 w-28 h-28 border-[12px] border-slate-900 rounded-full"></div>
                  <div className="absolute top-0 w-28 h-28 border-[12px] border-t-[#D4AF37] border-l-[#D4AF37] rounded-full rotate-[65deg]"></div>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                    <p className="text-xl font-black leading-none text-white">78</p>
                    <p className="text-[8px] uppercase font-bold text-[#D4AF37] mt-0.5">Greed</p>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 mt-3 font-mono uppercase tracking-widest">Aggregate signals: BULLISH</p>
              </div>
            </div>

            <div className="card-bg rounded-2xl p-5 flex flex-col justify-between">
              <h3 className="text-[10px] font-bold tracking-widest uppercase opacity-60 mb-3 text-[#D4AF37]">Live Pulse</h3>
              <div className="space-y-3 flex-grow flex flex-col justify-center">
                <div className="border-l-2 border-[#D4AF37] pl-3">
                  <p className="text-[10.5px] leading-snug font-medium text-slate-200">FED signals potential pause on rate hikes in upcoming meet.</p>
                  <p className="text-[8px] opacity-40 uppercase font-mono tracking-wider mt-1">2m ago</p>
                </div>
                <div className="border-l-2 border-slate-800 pl-3">
                  <p className="text-[10.5px] leading-snug text-slate-400">GS raised standard commodities spot baseline target index vectors.</p>
                  <p className="text-[8px] opacity-40 uppercase font-mono tracking-wider mt-1">14m ago</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Tab lists for IPO, News and AI Chat Research (4 cols wide on lg) */}
        <div className="lg:col-span-4 flex flex-col min-h-[500px]">
          
          {/* Tab Selection Row */}
          <div className="bg-slate-900/50 p-1 border border-slate-800 rounded-lg flex items-center gap-1 mb-4 select-none">
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-md transition-all flex items-center justify-center gap-1 ${
                activeTab === 'ai' 
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-950/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Desk
            </button>
            <button
              onClick={() => setActiveTab('ipos')}
              className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-md transition-all flex items-center justify-center gap-1 ${
                activeTab === 'ipos' 
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-950/50'
              }`}
            >
              <Milestone className="w-3.5 h-3.5" />
              IPOs
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-md transition-all flex items-center justify-center gap-1 ${
                activeTab === 'news' 
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 font-bold' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-950/50'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              News
            </button>
          </div>

          {/* Conditional Component Mounting based on Active Tab */}
          <div className="flex-1 flex flex-col h-full min-h-0">
            {activeTab === 'ai' && (
              <AIAnalyst
                onSendMessage={handleSendAiQuery}
                response={aiResponse}
                citations={aiCitations}
                loading={aiLoading}
                isSimulated={aiIsSimulated}
                selectedAssetSymbol={selectedAsset?.symbol}
                onRefreshPrices={handlePollRefresh}
              />
            )}

            {activeTab === 'ipos' && (
              <IPOPanel
                ipos={ipos}
                loading={loadingData}
                onSelectCompany={handleSendAiQuery}
              />
            )}

            {activeTab === 'news' && (
              <NewsPanel
                news={news}
                loading={loadingNews}
                onSelectHeadline={handleSendAiQuery}
              />
            )}
          </div>

        </div>
      </main>

      {/* 💼 Footer Area */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-[10px] font-mono text-slate-600 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          Aurum Commodity & Stock Terminal — Protected by Sovereign Cryptography and Gemini Search Grounding.
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> SEC Database Server online
          </span>
          <span>•</span>
          <span>© 2026 Aurum Capital Alliance</span>
        </div>
      </footer>

    </div>
  );
}
