import React from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  ExternalLink, 
  Flame,
  Radio,
  Zap,
  LogIn,
  LogOut,
  Bookmark,
  GraduationCap,
  SlidersHorizontal,
  Languages
} from 'lucide-react';
import { AssetCategory, ExperienceMode, Language } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  selectedAssetId: string;
  onSelectAssetById: (id: string) => void;
  selectedCategory: AssetCategory | 'all' | 'watchlist';
  onSelectCategory: (cat: AssetCategory | 'all' | 'watchlist') => void;
  onOpenBrokerModal: () => void;
  overallSentiment: number;
  experienceMode: ExperienceMode;
  onToggleExperienceMode: (mode: ExperienceMode) => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedAssetId,
  onSelectAssetById,
  selectedCategory,
  onSelectCategory,
  onOpenBrokerModal,
  overallSentiment,
  experienceMode,
  onToggleExperienceMode,
  language,
  onToggleLanguage,
}) => {
  const { user, signIn, signOut, watchlist } = useAuth();
  const isArabic = language === 'ar';

  const quickSwitchAssets = [
    { id: 'btc-usd', label: isArabic ? 'بيتكوين BTC' : 'BTC/USD', icon: '₿' },
    { id: 'eur-usd', label: isArabic ? 'اليورو EUR' : 'EUR/USD', icon: '€' },
    { id: 'xau-usd', label: isArabic ? 'الذهب Gold' : 'Gold (XAU)', icon: '🏆' },
  ];

  return (
    <header className="border-b border-zinc-800 bg-[#0d1117] sticky top-0 z-40">
      {/* Top minimal status bar */}
      <div className="border-b border-zinc-800/80 px-4 py-1 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {isArabic ? 'بيانات السوق المباشرة 24/7' : 'LIVE MARKET DATA 24/7'}
          </span>
          <span className="hidden md:inline-block text-zinc-700">|</span>
          <span className="hidden md:flex items-center gap-1 text-zinc-400">
            <Radio className="h-3 w-3 text-zinc-400" />
            {isArabic ? 'خوارزميات تحليل الأسواق والسيولة' : 'QUANTITATIVE MARKET TELEMETRY'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Flame className="h-3 w-3 text-zinc-400" />
            <span>{isArabic ? 'حالة التذبذب:' : 'VOLATILITY:'}</span>
            <span className="text-zinc-200 font-medium">{isArabic ? 'معتدل' : 'MODERATE'}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-zinc-400">
            <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
            <span>{isArabic ? 'تشفير آمن' : 'SECURE'}</span>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-zinc-800 border border-zinc-700 text-emerald-400">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white tracking-tight font-mono">
                Market<span className="text-emerald-400">Prob</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase">
                {experienceMode === 'beginner' ? (isArabic ? 'مبسط' : 'SIMPLE') : 'PRO'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-1 font-arabic">
              <span>{isArabic ? 'منصة احتمالات وحركة السوق' : 'Market Probability & Sizing'}</span>
              <span className="text-emerald-400 font-mono font-medium">({overallSentiment}% {isArabic ? 'صعود' : 'Bull'})</span>
            </p>
          </div>
        </div>

        {/* Center: Quick Switch Benchmarks + Categories */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Switch Shortcuts */}
          <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
            <div className="px-2 text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1 border-r border-zinc-800 mr-1">
              <Zap className="h-3 w-3 text-zinc-400" />
              <span className="hidden sm:inline">{isArabic ? 'سريع:' : 'QUICK:'}</span>
            </div>
            {quickSwitchAssets.map((asset) => {
              const isActive = selectedAssetId === asset.id;
              return (
                <button
                  key={asset.id}
                  onClick={() => onSelectAssetById(asset.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded-md transition-colors ${
                    isActive
                      ? 'bg-zinc-800 text-emerald-400 font-bold border border-zinc-700'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                >
                  <span className="text-[11px]">{asset.icon}</span>
                  <span>{asset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Category Filter Tabs */}
          <div className="hidden lg:flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs">
            {(
              [
                { id: 'all', labelAr: 'الكل', labelEn: 'All' },
                { id: 'crypto', labelAr: 'العملات الرقمية', labelEn: 'Crypto' },
                { id: 'forex', labelAr: 'الفوركس', labelEn: 'Forex' },
                { id: 'commodities', labelAr: 'السلع والذهب', labelEn: 'Commodities' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => onSelectCategory(tab.id)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  selectedCategory === tab.id
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isArabic ? tab.labelAr : tab.labelEn}
              </button>
            ))}

            <button
              onClick={() => onSelectCategory('watchlist')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                selectedCategory === 'watchlist'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Bookmark className="h-3 w-3" />
              <span>{isArabic ? 'المفضلة' : 'Watchlist'}</span>
              {watchlist.length > 0 && (
                <span className="text-[10px] font-mono px-1 rounded bg-zinc-800 text-zinc-300 font-bold">
                  {watchlist.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right: Mode Switcher (Simple vs Pro), Language, and Auth */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
            <button
              onClick={() => onToggleExperienceMode('beginner')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
                experienceMode === 'beginner'
                  ? 'bg-zinc-800 text-emerald-400 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title={isArabic ? 'عرض مبسط للمبتدئين' : 'Simple view'}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span className="font-arabic">{isArabic ? 'مبسط' : 'Simple'}</span>
            </button>

            <button
              onClick={() => onToggleExperienceMode('pro')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
                experienceMode === 'pro'
                  ? 'bg-zinc-800 text-white font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title={isArabic ? 'عرض تفصيلي للمحترفين' : 'Pro view'}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="font-arabic">{isArabic ? 'متقدم' : 'Pro'}</span>
            </button>
          </div>

          {/* Language Toggle */}
          <button
            onClick={() => onToggleLanguage(isArabic ? 'en' : 'ar')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-white transition-colors"
            title={isArabic ? 'Switch to English' : 'التحويل للعربية'}
          >
            <Languages className="h-3.5 w-3.5 text-zinc-400" />
            <span className="font-bold">{isArabic ? 'EN' : 'عربي'}</span>
          </button>

          {/* User Auth */}
          {user ? (
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-lg">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Trader'}
                  className="h-5 w-5 rounded-full"
                />
              ) : (
                <div className="h-5 w-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-xs">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'T'}
                </div>
              )}
              <span className="hidden sm:inline text-xs font-medium text-zinc-200 max-w-[80px] truncate">
                {user.displayName || 'User'}
              </span>
              <button
                onClick={signOut}
                title={isArabic ? 'تسجيل الخروج' : 'Sign Out'}
                className="p-1 text-zinc-400 hover:text-rose-400 transition-colors"
              >
                <LogOut className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={signIn}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
            >
              <LogIn className="h-3.5 w-3.5 text-zinc-400" />
              <span className="hidden sm:inline">{isArabic ? 'دخول' : 'Sign In'}</span>
            </button>
          )}

          {/* Broker Button */}
          <button
            onClick={onOpenBrokerModal}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors font-arabic"
          >
            <span>{isArabic ? 'فتح حساب' : 'Open Broker'}</span>
            <ExternalLink className="h-3 w-3 opacity-80" />
          </button>
        </div>
      </div>
    </header>
  );
};
