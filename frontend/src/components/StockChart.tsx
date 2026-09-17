import React, { useState } from 'react';
import { CandleData } from '../types';
import { ChartSkeleton } from './LoadingStates';
import { Calendar, BarChart2, TrendingUp, TrendingDown } from 'lucide-react';

interface StockChartProps {
  symbol: string;
  data: CandleData[];
  currency: string;
  period: string;
  onPeriodChange: (period: string) => void;
  isLoading: boolean;
}

export const StockChart: React.FC<StockChartProps> = ({
  symbol,
  data,
  currency,
  period,
  onPeriodChange,
  isLoading,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<CandleData | null>(null);

  const periods = [
    { label: '1D', value: '1d' },
    { label: '5D', value: '5d' },
    { label: '1M', value: '1mo' },
    { label: '6M', value: '6mo' },
    { label: '1Y', value: '1y' },
    { label: '5Y', value: '5y' },
  ];

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/50 p-6 text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900/40">
        No historical price candle data available for {symbol} in the selected timeframe.
      </div>
    );
  }

  // Calculate high, low, first, last for SVG drawing
  const minPrice = Math.min(...data.map((d) => d.low));
  const maxPrice = Math.max(...data.map((d) => d.high));
  const priceRange = maxPrice - minPrice || 1;
  const isUpTrend = data[data.length - 1].close >= data[0].open;

  // Dimensions
  const width = 800;
  const height = 280;
  const padding = { top: 20, right: 30, bottom: 30, left: 60 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Generate SVG path points
  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * graphWidth;
    const y = padding.top + graphHeight - ((d.close - minPrice) / priceRange) * graphHeight;
    return { x, y, data: d };
  });

  const pathD = points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + graphHeight} L ${points[0].x} ${padding.top + graphHeight} Z`;

  const strokeColor = isUpTrend ? '#10b981' : '#ef4444';
  const activeDisplay = hoveredPoint || data[data.length - 1];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 dark:backdrop-blur-md">
      {/* Header with quick stats & time selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">{symbol}</h3>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {currency}
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {currency} {activeDisplay.close.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400">
              {hoveredPoint ? `Date: ${activeDisplay.date}` : `Latest Close`}
            </span>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-950">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => onPeriodChange(p.value)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                period === p.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive SVG Chart Canvas */}
      <div className="relative mt-5 h-[260px] w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full overflow-visible"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isUpTrend ? '#10b981' : '#ef4444'} stopOpacity="0.3" />
              <stop offset="100%" stopColor={isUpTrend ? '#10b981' : '#ef4444'} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padding.top + graphHeight * pct;
            const priceVal = maxPrice - pct * priceRange;
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  className="fill-slate-400 dark:fill-slate-500"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {priceVal.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Line Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive hover tracking */}
          {points.map((p, i) => (
            <rect
              key={i}
              x={p.x - graphWidth / (data.length * 2)}
              y={padding.top}
              width={graphWidth / data.length}
              height={graphHeight}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() => setHoveredPoint(p.data)}
            />
          ))}

          {hoveredPoint && (
            (() => {
              const activeP = points.find((p) => p.data.date === hoveredPoint.date);
              if (!activeP) return null;
              return (
                <g>
                  {/* Vertical Crosshair */}
                  <line
                    x1={activeP.x}
                    y1={padding.top}
                    x2={activeP.x}
                    y2={padding.top + graphHeight}
                    stroke="#3b82f6"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                  {/* Point Highlight */}
                  <circle
                    cx={activeP.x}
                    cy={activeP.y}
                    r="5"
                    fill="#3b82f6"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                </g>
              );
            })()
          )}
        </svg>
      </div>

      {/* OHLC Bar Metrics */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-slate-50 p-3 text-xs border border-slate-200 dark:bg-slate-950/80 dark:border-slate-800">
        <div>
          <span className="text-slate-400">Open:</span>{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">{activeDisplay.open.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-slate-400">High:</span>{' '}
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{activeDisplay.high.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-slate-400">Low:</span>{' '}
          <span className="font-semibold text-red-600 dark:text-red-400">{activeDisplay.low.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-slate-400">Volume:</span>{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">{activeDisplay.volume.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
