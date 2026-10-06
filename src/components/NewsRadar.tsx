import React, { useState } from 'react';
import { 
  Radio, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Send, 
  Copy, 
  Check, 
  FileText,
  ShieldCheck,
  Building2,
  ChevronDown,
  ChevronUp,
  Target,
  Activity,
  Layers
} from 'lucide-react';
import { NewsItem, ExperienceMode, Language } from '../types';

interface NewsRadarProps {
  newsList: NewsItem[];
  onAnalyzeNewsItem: (newsId: string) => Promise<void>;
  onAnalyzeCustomText: (customText: string) => Promise<any>;
  selectedAssetSymbol: string;
  experienceMode: ExperienceMode;
  language: Language;
}

export const NewsRadar: React.FC<NewsRadarProps> = ({
  newsList,
  onAnalyzeNewsItem,
  onAnalyzeCustomText,
  selectedAssetSymbol,
  experienceMode,
  language,
}) => {
  const isArabic = language === 'ar';
  const [filter, setFilter] = useState<'ALL' | 'TIER1' | 'FED' | 'HIGH'>('ALL');
  const [customHeadline, setCustomHeadline] = useState('');
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
  const [customResult, setCustomResult] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(newsList[0]?.id || null);

  const filteredNews = newsList.filter((item) => {
    if (filter === 'HIGH') return item.impact === 'HIGH';
    if (filter === 'FED') return item.source.toLowerCase().includes('fed') || item.tag.toLowerCase().includes('فائدة') || item.tag.toLowerCase().includes('fomc') || item.tag.toLowerCase().includes('ecb');
    if (filter === 'TIER1') return item.source.toLowerCase().includes('bloomberg') || item.source.toLowerCase().includes('reuters') || item.source.toLowerCase().includes('financial times') || item.source.toLowerCase().includes('journal');
    return true;
  });

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHeadline.trim()) return;

    setIsSubmittingCustom(true);
    setCustomResult(null);

    try {
      const result = await onAnalyzeCustomText(customHeadline);
      setCustomResult(result);
    } catch (err: any) {
      console.warn('Custom analysis issue:', err);
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  const handleCopyNewsAnalysis = (item: NewsItem) => {
    const text = `خبر: ${item.headlineAr || item.headline}
المصدر المعتمد: ${item.source} (${item.sourceTier || 'Tier-1'})
التحليل المنطقي: ${item.arabicAnalysis || ''}
${item.logicalTakeaway ? `• الحدث: ${item.logicalTakeaway.whatHappened}\n• الأثر: ${item.logicalTakeaway.marketImpact}\n• التوجيه: ${item.logicalTakeaway.traderAction}` : ''}`;

    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#11141d] p-5 shadow-sm flex flex-col justify-between h-full font-sans">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-zinc-800 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700">
              <Radio className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight font-mono">
                  {isArabic ? 'موجز الأخبار وحركة الأسواق' : 'MARKET NEWS & MACRO RADAR'}
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>{isArabic ? 'مصادر موثوقة' : 'VERIFIED'}</span>
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-arabic">
                {isArabic ? 'أخبار من كبرى الوكالات الاقتصادية مع تحليل مالي مركز ومنطقي لحركة الأسعار' : 'Verified economic news with focused, logical market analysis'}
              </p>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs font-arabic">
            {(
              [
                { id: 'ALL', labelAr: 'الكل', labelEn: 'All' },
                { id: 'TIER1', labelAr: 'بلومبرغ ورويترز', labelEn: 'Tier-1 News' },
                { id: 'FED', labelAr: 'البنوك المركزية', labelEn: 'Central Banks' },
                { id: 'HIGH', labelAr: 'عالي الأهمية', labelEn: 'High Impact' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filter === cat.id
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isArabic ? cat.labelAr : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* News List with Verified Sources and Logical Breakdowns */}
        <div className="space-y-3.5 my-3.5 overflow-y-auto max-h-[480px] pr-1">
          {filteredNews.map((item) => {
            const isBullish = item.sentiment === 'BULLISH';
            const isBearish = item.sentiment === 'BEARISH';
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-lg border border-zinc-800 bg-zinc-850/60 hover:border-zinc-700 transition-colors overflow-hidden"
              >
                {/* News Header: Source Badge & Timestamp */}
                <div className="p-3.5 pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    {/* Verified Source Badge */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-750 text-xs font-mono text-zinc-200">
                        <Building2 className="h-3 w-3 text-emerald-400" />
                        <span className="font-bold text-white">{item.source}</span>
                      </div>

                      <span className="text-[10px] font-arabic px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-750 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                        <span>{item.sourceTier || (isArabic ? 'مصدر معتمد Tier-1' : 'Verified Tier-1')}</span>
                      </span>

                      <span className="text-zinc-700 hidden sm:inline">•</span>

                      <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        {item.timeAgo}
                      </span>
                    </div>

                    {/* Tag & Related Asset */}
                    <div className="flex items-center gap-1.5 text-xs font-mono">
                      <span className="text-[10px] px-1.5 py-0.5 rounded uppercase font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 font-arabic">
                        {item.tag}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {item.relatedAsset}
                      </span>
                    </div>
                  </div>

                  {/* Headlines: Arabic Primary + English Reference */}
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-100 leading-snug font-arabic">
                    {isArabic ? (item.headlineAr || item.headline) : item.headline}
                  </h4>
                  
                  {isArabic && item.headlineAr && (
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5 line-clamp-1" dir="ltr">
                      {item.headline}
                    </p>
                  )}
                </div>

                {/* Analysis / Breakdown Section */}
                {item.analyzed ? (
                  <div className="border-t border-zinc-800 bg-zinc-900/80 p-3.5 space-y-3">
                    {/* Sentiment & Probability shift bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-arabic">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                            isBullish
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                              : isBearish
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {isBullish ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                          <span>{isArabic ? (isBullish ? 'أثر صاعد (شراء)' : isBearish ? 'أثر هابط (بيع)' : 'أثر محايد') : item.sentiment}</span>
                        </span>

                        {item.probabilityShift && (
                          <span className="text-xs font-mono font-bold text-zinc-200">
                            {item.probabilityShift > 0 ? `+${item.probabilityShift}%` : `${item.probabilityShift}%`} {isArabic ? 'تأثير على الاحتمال' : 'Shift'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopyNewsAnalysis(item)}
                          title={isArabic ? 'نسخ التحليل' : 'Copy Analysis'}
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-arabic text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-750 transition-colors border border-zinc-700"
                        >
                          {copiedId === item.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          <span className="text-[11px]">{copiedId === item.id ? (isArabic ? 'تم النسخ' : 'Copied') : (isArabic ? 'نسخ' : 'Copy')}</span>
                        </button>

                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="p-1 rounded text-zinc-400 hover:text-white bg-zinc-800 transition-colors border border-zinc-700"
                          title={isExpanded ? 'طي التفاصيل' : 'عرض التفاصيل'}
                        >
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Concentrated Logical Analysis (تحليل مركز ومنطقي) */}
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 font-arabic">
                        <Activity className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{isArabic ? 'التحليل المنطقي والمركز للخبر:' : 'Focused Logical Impact:'}</span>
                      </div>

                      <p dir={isArabic ? 'rtl' : 'ltr'} className="font-arabic text-xs text-zinc-300 leading-relaxed">
                        {isArabic ? item.arabicAnalysis : (item.englishAnalysis || item.arabicAnalysis)}
                      </p>

                      {/* Structured Logical Takeaways (what happened, market impact, trader action) */}
                      {isExpanded && item.logicalTakeaway && (
                        <div className="pt-2 border-t border-zinc-800/80 space-y-2 text-xs font-arabic mt-2">
                          <div className="p-2 rounded bg-zinc-900 border border-zinc-800 space-y-0.5">
                            <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                              <span>📌</span>
                              <span>{isArabic ? 'ماذا حدث في الخبر بدقة؟' : 'Event Summary:'}</span>
                            </span>
                            <p className="text-zinc-200 text-xs">
                              {item.logicalTakeaway.whatHappened}
                            </p>
                          </div>

                          <div className="p-2 rounded bg-zinc-900 border border-zinc-800 space-y-0.5">
                            <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                              <span>📊</span>
                              <span>{isArabic ? 'الأثر المالي على الأسعار والسيولة:' : 'Price & Liquidity Impact:'}</span>
                            </span>
                            <p className="text-zinc-200 text-xs">
                              {item.logicalTakeaway.marketImpact}
                            </p>
                          </div>

                          <div className="p-2 rounded bg-zinc-900 border border-zinc-800 space-y-0.5">
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                              <Target className="h-3.5 w-3.5 text-emerald-400" />
                              <span>{isArabic ? 'التوجيه العملي المباشر للمتداول:' : 'Direct Trader Guidance:'}</span>
                            </span>
                            <p className="text-white text-xs font-medium">
                              {item.logicalTakeaway.traderAction}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-zinc-800 px-3.5 py-2 flex items-center justify-between bg-zinc-900/40">
                    <span className="text-[11px] text-zinc-400 font-arabic">
                      {isArabic ? 'انقر لاستخراج التحليل المنطقي لهذا الخبر' : 'Click to extract logical analysis'}
                    </span>
                    <button
                      onClick={() => onAnalyzeNewsItem(item.id)}
                      disabled={item.isAnalyzing}
                      className="px-3 py-1 rounded text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors disabled:opacity-50 font-arabic"
                    >
                      {item.isAnalyzing ? (isArabic ? 'جاري التحليل...' : 'Analyzing...') : (isArabic ? 'تحليل الخبر منطقياً' : 'Analyze News')}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Custom News Scanner with Source Prompt */}
      <div className="border-t border-zinc-800 pt-3 mt-auto">
        <form onSubmit={handleCustomSubmit} className="space-y-2">
          <label className="text-xs font-bold text-zinc-300 font-arabic flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-zinc-400" />
              <span>{isArabic ? 'فحص وتحليل أي خبر مالي من مصدرك الخاص:' : 'Analyze Any News Headline:'}</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-arabic">{isArabic ? 'تحليل منطقي فوري' : 'Instant logic'}</span>
          </label>

          <div className="flex gap-2">
            <input
              type="text"
              value={customHeadline}
              onChange={(e) => setCustomHeadline(e.target.value)}
              placeholder={isArabic ? "اكتب الخبر ومصدره، مثلاً: 'رويترز: الفيدرالي يتجه لخفض الفائدة 25 نقطة أساس'..." : "e.g. 'Reuters: Fed considers 25bps rate cut'..."}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 font-arabic"
            />
            <button
              type="submit"
              disabled={isSubmittingCustom || !customHeadline.trim()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white transition-colors flex items-center gap-1 disabled:opacity-50 whitespace-nowrap font-arabic shrink-0 border border-zinc-700"
            >
              {isSubmittingCustom ? (
                <span>{isArabic ? 'تحليل...' : '...'}</span>
              ) : (
                <>
                  <Send className="h-3 w-3" />
                  <span>{isArabic ? 'فحص' : 'Check'}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {customResult && (
          <div className="mt-2.5 p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-1.5 text-xs font-arabic">
            <div className="flex items-center justify-between text-zinc-300">
              <span className="font-bold flex items-center gap-1">
                <span>{isArabic ? 'الأثر المقدر:' : 'Impact:'}</span>
                <span className={customResult.sentiment === 'BULLISH' ? 'text-emerald-400 font-bold' : customResult.sentiment === 'BEARISH' ? 'text-rose-400 font-bold' : 'text-zinc-300'}>
                  {customResult.sentiment}
                </span>
              </span>
              <span className="text-[11px] font-mono text-zinc-400">
                {isArabic ? 'قوة الأثر:' : 'Score:'} {customResult.impactScore}/10
              </span>
            </div>
            <p dir={isArabic ? 'rtl' : 'ltr'} className="text-zinc-200 leading-relaxed">
              {customResult.arabicAnalysis}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
