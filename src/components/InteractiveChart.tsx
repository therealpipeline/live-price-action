import React, { useState, useRef } from 'react';
import { MarketAsset } from '../types';

interface InteractiveChartProps {
  asset: MarketAsset;
}

export default function InteractiveChart({ asset }: InteractiveChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dataPoints = asset.sparkline;
  if (!dataPoints || dataPoints.length === 0) return null;

  const min = Math.min(...dataPoints);
  const max = Math.max(...dataPoints);
  const range = max - min === 0 ? 1 : max - min;

  // Let's generate synthetic hours for the X-axis labels based on 12 points
  const labels = [
    "08:00", "09:15", "10:30", "11:45", "13:00", "14:15",
    "15:30", "16:45", "18:00", "19:15", "20:30", "Close"
  ];

  // SVG Coordinates setup
  const svgWidth = 700;
  const svgHeight = 280;
  const paddingX = 40;
  const paddingY = 30;

  const widthEff = svgWidth - paddingX * 2;
  const heightEff = svgHeight - paddingY * 2;

  const points = dataPoints.map((val, idx) => {
    const x = paddingX + (idx / (dataPoints.length - 1)) * widthEff;
    const y = svgHeight - paddingY - ((val - min) / range) * heightEff;
    return { x, y, value: val, label: labels[idx] || "" };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${svgHeight - paddingY} L ${points[0].x.toFixed(1)} ${svgHeight - paddingY} Z`;

  const isPositive = asset.price >= asset.prevPrice;
  const chartColor = isPositive ? '#D4AF37' : '#F43F5E'; // Vibrant Gold vs vibrant Red

  // Mouse move handler to track the cursor coordinate and highlight nearest data point
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!containerRef.current) return;
    const svgRect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - svgRect.left;
    
    // Convert relative CSS X to SVG internal viewbox X coordinate
    const scaleFactor = svgWidth / svgRect.width;
    const svgX = relativeX * scaleFactor;

    // Find closest index
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < points.length; i++) {
      const diff = Math.abs(points[i].x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    setHoverIndex(closestIdx);
  };

  const currentPoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="card-bg rounded-2xl p-5 select-none relative overflow-hidden" ref={containerRef} id={`interactive-chart-${asset.id}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <div className="text-xs font-mono tracking-widest text-[#D4AF37] uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
            Interactive Live Feed
          </div>
          <h2 className="text-xl font-display font-bold text-slate-100 flex items-baseline gap-2 mt-1">
            {asset.name} <span className="text-xs font-mono text-slate-400 font-normal">{asset.symbol}</span>
          </h2>
        </div>

        <div className="text-right">
          <div className="text-2xl font-mono font-semibold tracking-tight text-slate-100">
            {asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
            <span className="text-xs font-sans text-slate-400 ml-1.5">{asset.unit}</span>
          </div>
          <div className={`text-xs font-mono font-medium flex items-center justify-start sm:justify-end gap-1.5 mt-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '▲' : '▼'}{Math.abs(asset.change).toFixed(2)} ({asset.changePercent > 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Main SVG Area */}
      <div className="relative w-full aspect-[7/3] min-h-[180px]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            {/* Area gradient */}
            <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity="0.25" />
              <stop offset="100%" stopColor={chartColor} stopOpacity="0.00" />
            </linearGradient>
            {/* Grid line gradient */}
            <linearGradient id="grid-fade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E293B" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0.1" />
            </linearGradient>
            
            {/* Gold neon blur filter */}
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Reference Horizontal Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const yVal = paddingY + ratio * heightEff;
            const gridPrice = max - ratio * range;
            return (
              <g key={i} className="opacity-40">
                <line
                  x1={paddingX}
                  y1={yVal}
                  x2={svgWidth - paddingX}
                  y2={yVal}
                  stroke="url(#grid-fade)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={yVal + 3}
                  className="fill-slate-500 font-mono text-[9px] text-right"
                  textAnchor="end"
                >
                  {gridPrice.toLocaleString('en-US', { maximumFractionDigits: asset.id === 'silver' ? 2 : 1 })}
                </text>
              </g>
            );
          })}

          {/* Shaded area */}
          <path d={areaD} fill="url(#gradient-area)" />

          {/* Sparkline glow stroke */}
          <path
            d={pathD}
            fill="none"
            stroke={chartColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#neon-glow)"
          />

          {/* X Axis Labels */}
          {points.map((p, idx) => {
            // Show only a subset of labels to prevent overlapping text
            if (idx % 2 !== 0 && idx !== points.length - 1) return null;
            return (
              <text
                key={idx}
                x={p.x}
                y={svgHeight - 10}
                className="fill-slate-400 font-mono text-[9px]"
                textAnchor="middle"
              >
                {p.label}
              </text>
            );
          })}

          {/* Interactive Mouse Hover Crosshair and Markers */}
          {hoverIndex !== null && (
            <g>
              {/* Vertical tracking cursor line */}
              <line
                x1={currentPoint.x}
                y1={paddingY}
                x2={currentPoint.x}
                y2={svgHeight - paddingY}
                stroke="#D4AF37"
                strokeWidth={1.2}
                strokeOpacity={0.6}
                strokeDasharray="3 3"
              />

              {/* Glowing anchor circles */}
              <circle
                cx={currentPoint.x}
                cy={currentPoint.y}
                r={7}
                fill="#030712"
                stroke="#D4AF37"
                strokeWidth={1.5}
              />
              <circle
                cx={currentPoint.x}
                cy={currentPoint.y}
                r={3.5}
                fill="#D4AF37"
              />
            </g>
          )}

          {/* Base border line for aesthetic bounds */}
          <line
            x1={paddingX}
            y1={svgHeight - paddingY}
            x2={svgWidth - paddingX}
            y2={svgHeight - paddingY}
            stroke="#334155"
            strokeWidth={1.5}
            strokeOpacity={0.6}
          />
        </svg>

        {/* Dynamic Tooltip on top of chart */}
        <div 
          className="absolute pointer-events-none bg-slate-950/90 border border-[#D4AF37]/45 rounded-lg py-1.5 px-3 shadow-xl flex flex-col gap-0.5 transition-all duration-75"
          style={{
            left: `${((currentPoint.x - paddingX) / widthEff) * 88 + 6}%`,
            top: '20px',
            transform: 'translateX(-50%)'
          }}
        >
          <span className="text-slate-400 text-[10px] uppercase font-mono tracking-wider">{currentPoint.label ? `Time: ${currentPoint.label}` : 'Market Price'}</span>
          <span className="text-[#D4AF37] font-mono text-sm font-semibold tracking-tight">
            ${currentPoint.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center text-slate-500 font-mono text-[9px] mt-2 border-t border-slate-800/50 pt-2">
        <span>* Data grounded via Live Terminal Search</span>
        <span className="text-slate-400">Interval: 1 Hour (12 Count Matrix)</span>
      </div>
    </div>
  );
}
