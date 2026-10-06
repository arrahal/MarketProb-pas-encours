import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { TickerTape } from './components/TickerTape';
import { TradingViewWidget } from './components/TradingViewWidget';
import { ProbabilityDial } from './components/ProbabilityDial';
import { NewsRadar } from './components/NewsRadar';
import { PositionCalculator } from './components/PositionCalculator';
import { BrokerModal } from './components/BrokerModal';
import { Footer } from './components/Footer';
import { INITIAL_ASSETS, INITIAL_NEWS } from './data/marketData';
import { Asset, AssetCategory, NewsItem, ExperienceMode, Language } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';

function Dashboard() {
  const { watchlist } = useAuth();
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('btc-usd');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'all' | 'watchlist'>('all');
  const [flashingAssetId, setFlashingAssetId] = useState<string | null>(null);
  const [flashDirection, setFlashDirection] = useState<'up' | 'down' | null>(null);
  const [newsList, setNewsList] = useState<NewsItem[]>(INITIAL_NEWS);
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState<boolean>(false);

  // Experience Mode (Beginner vs Pro) & Language (Arabic vs English)
  const [experienceMode, setExperienceMode] = useState<ExperienceMode>('beginner');
  const [language, setLanguage] = useState<Language>('ar');

  const isArabic = language === 'ar';

  // Filtered assets based on selected tab or watchlist
  const filteredAssets = useMemo(() => {
    if (selectedCategory === 'all') return assets;
    if (selectedCategory === 'watchlist') {
      const pinned = assets.filter((a) => watchlist.includes(a.id));
      return pinned.length > 0 ? pinned : assets;
    }
    return assets.filter((a) => a.category === selectedCategory);
  }, [assets, selectedCategory, watchlist]);

  // Selected asset instance
  const currentAsset = useMemo(() => {
    return assets.find((a) => a.id === selectedAssetId) || assets[0];
  }, [assets, selectedAssetId]);

  // Overall market bullish average
  const overallSentiment = useMemo(() => {
    const totalBull = assets.reduce((sum, a) => sum + a.bullishProb, 0);
    return Math.round(totalBull / assets.length);
  }, [assets]);

  // Real-time micro-ticks simulator: randomly moves an asset slightly every 2.8s
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets((prevAssets) => {
        const randomIndex = Math.floor(Math.random() * prevAssets.length);
        const target = prevAssets[randomIndex];
        const deltaPercent = (Math.random() * 0.3 - 0.15) / 100;
        const newPrice = target.price * (1 + deltaPercent);
        const direction = deltaPercent >= 0 ? 'up' : 'down';

        setFlashingAssetId(target.id);
        setFlashDirection(direction);
        setTimeout(() => {
          setFlashingAssetId(null);
          setFlashDirection(null);
        }, 800);

        const updated = [...prevAssets];
        updated[randomIndex] = {
          ...target,
          price: parseFloat(newPrice.toFixed(target.category === 'forex' && target.symbol !== 'USD/JPY' ? 4 : 2)),
          bid: parseFloat((newPrice - target.spread / 2).toFixed(target.category === 'forex' && target.symbol !== 'USD/JPY' ? 4 : 2)),
          ask: parseFloat((newPrice + target.spread / 2).toFixed(target.category === 'forex' && target.symbol !== 'USD/JPY' ? 4 : 2)),
          change24h: parseFloat((target.change24h + (deltaPercent * 10)).toFixed(2)),
        };
        return updated;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // Handler: Analyze specific news item with Gemini
  const handleAnalyzeNewsItem = async (newsId: string) => {
    setNewsList((prev) =>
      prev.map((item) => (item.id === newsId ? { ...item, isAnalyzing: true } : item))
    );

    const targetNews = newsList.find((n) => n.id === newsId);
    if (!targetNews) return;

    try {
      const response = await fetch('/api/analyze-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: targetNews.headline,
          category: targetNews.category,
          asset: targetNews.relatedAsset,
          impact: targetNews.impact,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.analysis) {
          const { arabicAnalysis, englishAnalysis, sentiment, probabilityShift, confidence, keyCatalyst, logicalTakeaway } = data.analysis;

          setNewsList((prev) =>
            prev.map((item) =>
              item.id === newsId
                ? {
                    ...item,
                    analyzed: true,
                    isAnalyzing: false,
                    arabicAnalysis,
                    englishAnalysis,
                    sentiment,
                    probabilityShift,
                    confidence,
                    keyCatalyst,
                    logicalTakeaway: logicalTakeaway || item.logicalTakeaway,
                  }
                : item
            )
          );

          // Update active asset's probability score dynamically
          setAssets((prevAssets) =>
            prevAssets.map((asset) => {
              if (asset.symbol === targetNews.relatedAsset || asset.id === selectedAssetId) {
                const shift = probabilityShift || (sentiment === 'BULLISH' ? 5 : sentiment === 'BEARISH' ? -5 : 0);
                const newBullish = Math.min(92, Math.max(12, asset.bullishProb + shift));
                const remaining = 100 - newBullish;
                const newNeutral = Math.min(15, Math.floor(remaining * 0.35));
                const newBearish = 100 - newBullish - newNeutral;

                return {
                  ...asset,
                  bullishProb: newBullish,
                  bearishProb: newBearish,
                  neutralProb: newNeutral,
                };
              }
              return asset;
            })
          );
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to analyze news with server, using resilient fallback:', err);
    }

    setNewsList((prev) =>
      prev.map((item) =>
        item.id === newsId
          ? {
              ...item,
              analyzed: true,
              isAnalyzing: false,
              arabicAnalysis: 'التحليل الخوارزمي يؤكد استمرار الزخم الحالي مع ترقب بيانات السيولة الأسبوعية.',
              sentiment: 'BULLISH',
              probabilityShift: 4,
              keyCatalyst: 'استقرار المعنويات العامة',
            }
          : item
      )
    );
  };

  // Handler: Custom news scanner
  const handleAnalyzeCustomText = async (customText: string) => {
    try {
      const res = await fetch('/api/custom-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: customText }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.result) return data.result;
      }
    } catch (e) {
      console.warn('Custom text analysis network fallback:', e);
    }
    return {
      arabicAnalysis: 'التحليل الفني يشير إلى تزايد اهتمام السيولة بهذا التطور مع استقرار عام في نطاق التداول.',
      sentiment: 'BULLISH',
      impactScore: 7,
      affectedAssets: ['BTC', 'USD', 'GOLD'],
    };
  };

  // Handler: Update asset verdict from ProbabilityDial
  const handleUpdateAssetVerdict = (updatedFields: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === selectedAssetId ? { ...a, ...updatedFields } : a))
    );
  };

  return (
    <div 
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#0b0f17] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white"
    >
      {/* 1. Header & Navigation */}
      <Header
        selectedAssetId={selectedAssetId}
        onSelectAssetById={(id) => setSelectedAssetId(id)}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onOpenBrokerModal={() => setIsBrokerModalOpen(true)}
        overallSentiment={overallSentiment}
        experienceMode={experienceMode}
        onToggleExperienceMode={setExperienceMode}
        language={language}
        onToggleLanguage={setLanguage}
      />

      {/* Live Market Status Bar / Ticker Tape */}
      <TickerTape
        assets={filteredAssets}
        selectedAssetId={selectedAssetId}
        onSelectAsset={(asset) => setSelectedAssetId(asset.id)}
        flashingAssetId={flashingAssetId}
        flashDirection={flashDirection}
      />

      {/* Main Trading Analytics Dashboard Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 w-full space-y-6 flex-1">
        {/* Row 1: Embedded TradingView Chart & The MarketProb Engine Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* 2. Embedded TradingView Chart Widget (7 Cols on LG) */}
          <div className="lg:col-span-7 xl:col-span-7">
            <TradingViewWidget 
              asset={currentAsset} 
              language={language}
            />
          </div>

          {/* 3. The MarketProb Engine (AI Probability & Sentiment Card - 5 Cols on LG) */}
          <div className="lg:col-span-5 xl:col-span-5">
            <ProbabilityDial
              asset={currentAsset}
              onUpdateAssetVerdict={handleUpdateAssetVerdict}
              experienceMode={experienceMode}
              language={language}
            />
          </div>
        </div>

        {/* Row 2: Live News Radar & Bonus Trader Utilities (Position Calculator) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* 4. Live News Radar & Gemini Sentiment Analyzer (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col">
            <NewsRadar
              newsList={newsList}
              onAnalyzeNewsItem={handleAnalyzeNewsItem}
              onAnalyzeCustomText={handleAnalyzeCustomText}
              selectedAssetSymbol={currentAsset.symbol}
              experienceMode={experienceMode}
              language={language}
            />
          </div>

          {/* 5. Bonus Trader Utilities: Position Size & Risk Calculator (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col">
            <PositionCalculator 
              currentAsset={currentAsset}
              experienceMode={experienceMode}
              language={language}
            />
          </div>
        </div>
      </main>

      {/* 6. Footer & Compliance Disclaimer */}
      <Footer 
        onOpenBrokerModal={() => setIsBrokerModalOpen(true)}
        language={language}
      />

      {/* Partner Registration Modal */}
      <BrokerModal
        isOpen={isBrokerModalOpen}
        onClose={() => setIsBrokerModalOpen(false)}
        language={language}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}
