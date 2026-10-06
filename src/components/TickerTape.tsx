import React from 'react';
import { ArrowUpRight, ArrowDownRight, Star } from 'lucide-react';
import { Asset } from '../types';
import { useAuth } from '../context/AuthContext';

interface TickerTapeProps {
  assets: Asset[];
  selectedAssetId: string;
  onSelectAsset: (asset: Asset) => void;
  flashingAssetId: string | null;
  flashDirection: 'up' | 'down' | null;
}

export const TickerTape: React.FC<TickerTapeProps> = ({
  assets,
  selectedAssetId,
  onSelectAsset,
  flashingAssetId,
  flashDirection,
}) => {
  const { isWatchlisted, toggleWatchlist } = useAuth();

  return (
    <div className="border-b border-zinc-800 bg-[#0d1117] overflow-x-auto py-2 px-4 scrollbar-none">
      <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
        <div className="text-[10px] font-mono uppercase text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          <span>MARKETS:</span>
        </div>

        {assets.map((asset) => {
          const isSelected = asset.id === selectedAssetId;
          const isFlashing = asset.id === flashingAssetId;
          const isPositive = asset.change24h >= 0;
          const pinned = isWatchlisted(asset.id);

          let formattedPrice: string;
          if (asset.category === 'forex' && asset.symbol !== 'USD/JPY') {
            formattedPrice = asset.price.toFixed(4);
          } else if (asset.price > 1000) {
            formattedPrice = asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          } else {
            formattedPrice = asset.price.toFixed(2);
          }

          return (
            <div
              key={asset.id}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors border ${
                isSelected
                  ? 'bg-zinc-800 border-zinc-650 text-white'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWatchlist(asset.id, asset.symbol, asset.category);
                }}
                title={pinned ? 'حذف من المفضلة' : 'إضافة للمفضلة'}
                className="p-0.5 rounded text-zinc-500 hover:text-amber-400 transition-colors"
              >
                <Star
                  className={`h-3 w-3 ${
                    pinned ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                  }`}
                />
              </button>

              <button
                onClick={() => onSelectAsset(asset)}
                className="flex items-center gap-2.5 text-left focus:outline-none"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white font-mono">{asset.symbol}</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {asset.spread > 0 ? `Spread ${asset.spread}` : ''}
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-xs font-mono font-medium ${
                      isFlashing && flashDirection === 'up'
                        ? 'text-emerald-400'
                        : isFlashing && flashDirection === 'down'
                        ? 'text-rose-400'
                        : 'text-zinc-200'
                    }`}
                  >
                    ${formattedPrice}
                  </div>

                  <div
                    className={`flex items-center justify-end text-[10px] font-mono ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? (
                      <ArrowUpRight className="h-3 w-3 inline" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 inline" />
                    )}
                    <span>{isPositive ? '+' : ''}{asset.change24h.toFixed(2)}%</span>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
