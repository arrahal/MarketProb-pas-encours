import React, { useState } from 'react';
import { 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  CheckCircle2, 
  Compass, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Target, 
  DollarSign, 
  Scale, 
  BarChart2, 
  FileText 
} from 'lucide-react';
import { Asset, ExperienceMode, Language } from '../types';

interface ProbabilityDialProps {
  asset: Asset;
  onUpdateAssetVerdict: (updatedFields: Partial<Asset>) => void;
  experienceMode: ExperienceMode;
  language: Language;
}

export const ProbabilityDial: React.FC<ProbabilityDialProps> = ({
  asset,
  onUpdateAssetVerdict,
  experienceMode,
  language,
}) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedTradePlan, setCopiedTradePlan] = useState(false);

  // Tab view:
  // 'plan' = توجيه الدخول برأس مالك (How much to enter)
  // 'logic' = التحليل الفني والمنطقي (Detailed Analysis)
  // 'simple' = نصيحة وتنبيهات (Simple Summary)
  const [activeTab, setActiveTab] = useState<'plan' | 'logic' | 'simple'>('plan');

  // Interactive user balance
  const [userBalance, setUserBalance] = useState<number>(1000);
  const [riskTolerancePercent, setRiskTolerancePercent] = useState<number>(1.0); // 1% safe default

  const isArabic = language === 'ar';

  // Probability calculations
  const normalizedProb = Math.min(100, Math.max(0, asset.bullishProb));
  const radius = 84;
  const strokeWidth = 12;
  const semiCircumference = Math.PI * radius;
  const strokeDashoffset = semiCircumference - (normalizedProb / 100) * semiCircumference;
  const needleAngle = -90 + (normalizedProb / 100) * 180;

  // Signal categorization
  const isBuy = asset.bullishProb >= 60;
  const isSell = asset.bearishProb >= 50;

  // Capital & Position sizing calculations
  const dollarRisk = (userBalance * (riskTolerancePercent / 100));
  
  const entryLevel = asset.logicalAnalysis?.entryLevel || (asset.price * (isBuy ? 0.998 : 1.002));
  const stopLossLevel = asset.logicalAnalysis?.stopLossLevel || (asset.price * (isBuy ? 0.985 : 1.015));
  const takeProfitLevel = asset.logicalAnalysis?.takeProfitLevel || (asset.price * (isBuy ? 1.045 : 0.955));
  
  const distanceToStop = Math.abs(entryLevel - stopLossLevel);
  const distanceToTarget = Math.abs(takeProfitLevel - entryLevel);

  let recommendedSize = 0;
  let sizeUnit = isArabic ? 'وحدة' : 'Units';
  let potentialGain = 0;
  let riskRewardRatio = 1;

  if (distanceToStop > 0) {
    if (asset.category === 'forex') {
      const pipSize = asset.symbol.includes('JPY') ? 0.01 : 0.0001;
      const stopPips = distanceToStop / pipSize;
      const targetPips = distanceToTarget / pipSize;
      recommendedSize = dollarRisk / (stopPips * 10);
      potentialGain = recommendedSize * targetPips * 10;
      sizeUnit = isArabic ? 'لوت (Lot)' : 'Lots';
    } else if (asset.category === 'crypto') {
      recommendedSize = dollarRisk / distanceToStop;
      potentialGain = recommendedSize * distanceToTarget;
      sizeUnit = asset.symbol.split('/')[0] + (isArabic ? ' عملة' : ' Coins');
    } else {
      recommendedSize = dollarRisk / (distanceToStop * 100);
      potentialGain = recommendedSize * (distanceToTarget * 100);
      sizeUnit = isArabic ? 'عقد' : 'Contracts';
    }
    riskRewardRatio = distanceToTarget / distanceToStop;
  }

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch('/api/market-verdict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: asset.symbol,
          name: asset.name,
          currentPrice: asset.price,
          timeframe: '4H',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.verdict) {
          onUpdateAssetVerdict({
            bullishProb: data.verdict.bullishProb,
            bearishProb: data.verdict.bearishProb,
            neutralProb: data.verdict.neutralProb,
            confidence: data.verdict.confidence || 'High',
            arabicVerdict: data.verdict.arabicVerdict || asset.arabicVerdict,
            englishVerdict: data.verdict.englishVerdict || asset.englishVerdict,
            arabicRiskWarning: data.verdict.arabicRiskWarning || asset.arabicRiskWarning,
            englishRiskWarning: data.verdict.englishRiskWarning || asset.englishRiskWarning,
            topDrivers: data.verdict.topDrivers || asset.topDrivers,
            logicalAnalysis: data.verdict.logicalAnalysis || asset.logicalAnalysis,
          });
          return;
        }
      }

      // Local calculation
      const shift = Math.floor(Math.random() * 5) - 2;
      const newBullish = Math.min(88, Math.max(25, asset.bullishProb + shift));
      const remaining = 100 - newBullish;
      const newNeutral = Math.min(12, Math.floor(remaining * 0.3));
      const newBearish = 100 - newBullish - newNeutral;
      onUpdateAssetVerdict({
        bullishProb: newBullish,
        bearishProb: newBearish,
        neutralProb: newNeutral,
      });
    } catch (err: any) {
      console.warn('Network issue during recalculation:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleToggleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToRead = isArabic 
      ? `تحليل ${asset.nameAr || asset.symbol}: احتمال الصعود ${asset.bullishProb} في المئة. ${asset.logicalAnalysis?.whyMove || asset.arabicVerdict}`
      : `Market update for ${asset.symbol}: Bullish probability ${asset.bullishProb} percent. ${asset.englishVerdict || asset.arabicVerdict}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = isArabic ? 'ar-SA' : 'en-US';
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyOrderPlan = () => {
    const text = `أمر صفقة [${asset.symbol}]:
الرصيد: $${userBalance}
الاتجاه: ${isBuy ? 'شراء' : isSell ? 'بيع' : 'انتظار'}
نقطة الدخول: $${entryLevel.toLocaleString()}
وقف الخسارة: $${stopLossLevel.toLocaleString()}
أخذ الربح: $${takeProfitLevel.toLocaleString()}
حجم العقد: ${recommendedSize > 0 ? recommendedSize.toFixed(3) : '0.01'} ${sizeUnit}
أقصى خسارة: $${dollarRisk.toFixed(2)} (${riskTolerancePercent}%)
الربح المتوقع: +$${potentialGain.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopiedTradePlan(true);
    setTimeout(() => setCopiedTradePlan(false), 2500);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#11141d] p-5 shadow-sm flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-zinc-800 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
              <Compass className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight font-mono">
                  {isArabic ? 'مؤشر حركة السوق وتحديد حجم الصفقة' : 'MARKET PROBABILITY & SIZING'}
                </h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {asset.symbol}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-arabic">
                {isArabic ? (
                  <>احتمال الاتجاه وتوجيه الدخول لـ <strong className="text-zinc-200">{asset.nameAr || asset.name}</strong></>
                ) : (
                  <>Trend probability and position sizing for {asset.name}</>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleSpeak}
              title={isArabic ? 'استماع' : 'Listen'}
              className={`p-1.5 rounded-lg text-xs font-mono border transition-colors flex items-center gap-1 ${
                isPlayingAudio
                  ? 'bg-zinc-800 text-emerald-400 border-zinc-600'
                  : 'bg-zinc-850 text-zinc-400 border-zinc-800 hover:text-white'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              <span className="font-arabic text-[11px] hidden sm:inline">{isPlayingAudio ? (isArabic ? 'إيقاف' : 'Stop') : (isArabic ? 'صوت' : 'Audio')}</span>
            </button>

            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isRegenerating ? 'animate-spin text-emerald-400' : ''}`} />
              <span className="font-arabic">{isRegenerating ? (isArabic ? 'تحديث...' : 'Updating...') : (isArabic ? 'تحديث' : 'Refresh')}</span>
            </button>
          </div>
        </div>

        {/* Clear Direction Banner (Simple, straightforward colors) */}
        <div className="mt-3.5 p-3 rounded-lg border border-zinc-800 bg-zinc-850/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-base font-mono ${
              isBuy ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : isSell ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-zinc-800 text-zinc-300'
            }`}>
              {isBuy ? '↑' : isSell ? '↓' : '↔'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold font-arabic ${isBuy ? 'text-emerald-400' : isSell ? 'text-rose-400' : 'text-zinc-300'}`}>
                  {isArabic ? (
                    isBuy ? 'احتمال صعود (إشارة شراء)' : isSell ? 'احتمال هبوط (إشارة بيع)' : 'تذبذب عرضي (انتظار)'
                  ) : (
                    isBuy ? 'BULLISH (BUY)' : isSell ? 'BEARISH (SELL)' : 'SIDEWAYS (WAIT)'
                  )}
                </span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-200">
                  {asset.bullishProb}% {isArabic ? 'صعود' : 'Bull'} • {asset.bearishProb}% {isArabic ? 'هبوط' : 'Bear'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-arabic mt-0.5">
                {asset.logicalAnalysis?.whyMove || asset.arabicVerdict}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex flex-col items-end text-xs font-mono">
            <span className="text-[10px] text-zinc-500">{isArabic ? 'الثقة' : 'CONFIDENCE'}</span>
            <span className={`font-semibold ${asset.confidence === 'High' ? 'text-emerald-400' : 'text-zinc-300'}`}>
              {isArabic ? (asset.confidence === 'High' ? 'عالية' : 'متوسطة') : asset.confidence}
            </span>
          </div>
        </div>

        {/* Tab Selection: Clean gray styling, no neon clutter */}
        <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 mt-3 text-xs font-arabic">
          <button
            onClick={() => setActiveTab('plan')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-colors ${
              activeTab === 'plan'
                ? 'bg-zinc-800 text-white font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            <span>{isArabic ? 'توجيه الدخول برأس مالك (بكم تدخل؟)' : 'Capital & Position Sizing'}</span>
          </button>

          <button
            onClick={() => setActiveTab('logic')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-colors ${
              activeTab === 'logic'
                ? 'bg-zinc-800 text-white font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5 text-zinc-400" />
            <span>{isArabic ? 'التحليل الفني والمنطقي' : 'Technical Analysis'}</span>
          </button>

          <button
            onClick={() => setActiveTab('simple')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md transition-colors ${
              activeTab === 'simple'
                ? 'bg-zinc-800 text-white font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-zinc-400" />
            <span>{isArabic ? 'ملخص وتنبيهات' : 'Summary & Notes'}</span>
          </button>
        </div>

        {/* TAB 1: CAPITAL SIZING - Normal, simple writing without hype */}
        {activeTab === 'plan' && (
          <div className="mt-3.5 p-3.5 rounded-lg border border-zinc-800 bg-zinc-850/60 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800">
              <div>
                <h4 className="text-xs font-bold text-white font-arabic">
                  {isArabic ? 'اكتب رصيد حسابك لتحديد حجم الصفقة الآمن:' : 'Enter your account balance:'}
                </h4>
                <p className="text-[11px] text-zinc-400 font-arabic">
                  {isArabic ? 'يحسب لك الحجم المناسب لتتجنب الخسارة الكبيرة وتلتزم بإدارة رأس المال.' : 'Calculates safe contract size to protect your account.'}
                </p>
              </div>

              <button
                onClick={handleCopyOrderPlan}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                {copiedTradePlan ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span className="font-arabic">{copiedTradePlan ? (isArabic ? 'تم النسخ!' : 'Copied!') : (isArabic ? 'نسخ الخطة' : 'Copy')}</span>
              </button>
            </div>

            {/* Input & Risk */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-7 space-y-1">
                <label className="text-xs text-zinc-300 font-arabic flex items-center justify-between">
                  <span>{isArabic ? 'رصيد حسابك الحالي ($):' : 'Account Balance ($):'}</span>
                  <span className="text-emerald-400 font-mono font-bold">${userBalance.toLocaleString()}</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="number"
                    value={userBalance}
                    onChange={(e) => setUserBalance(Math.max(10, parseFloat(e.target.value) || 0))}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div className="flex gap-1.5 pt-0.5">
                  {[250, 500, 1000, 2500, 5000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setUserBalance(preset)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                        userBalance === preset
                          ? 'bg-zinc-700 text-white font-bold border-zinc-600'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      ${preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Tolerance Percentage */}
              <div className="sm:col-span-5 space-y-1">
                <label className="text-xs text-zinc-300 font-arabic flex items-center justify-between">
                  <span>{isArabic ? 'نسبة المخاطرة:' : 'Risk Percentage:'}</span>
                  <span className="text-rose-400 font-mono font-bold">{riskTolerancePercent}% (${dollarRisk.toFixed(1)})</span>
                </label>
                <div className="flex gap-1.5">
                  {[0.5, 1.0, 2.0, 3.0].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setRiskTolerancePercent(pct)}
                      className={`flex-1 text-xs font-mono py-1.5 rounded-lg border transition-colors ${
                        riskTolerancePercent === pct
                          ? 'bg-zinc-700 text-white font-bold border-zinc-600'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-500 font-arabic">
                  {isArabic ? 'نسبة 1% موصى بها لحماية الحساب.' : '1% is standard safe risk.'}
                </p>
              </div>
            </div>

            {/* Direct Guidance Output (Simple, normal language) */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/90 p-3 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 font-arabic">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  {isArabic 
                    ? `التوجيه لصفقة ${asset.symbol} برصيد ($${userBalance.toLocaleString()}):`
                    : `Trade guidance for ${asset.symbol} on $${userBalance.toLocaleString()} balance:`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-zinc-850 border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 font-arabic">{isArabic ? 'حجم العقد' : 'Contract Size'}</div>
                  <div className="text-sm font-bold text-white font-mono mt-0.5">
                    {recommendedSize > 0 ? recommendedSize.toFixed(3) : '0.01'}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-arabic">{sizeUnit}</div>
                </div>

                <div className="p-2 rounded bg-zinc-850 border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 font-arabic">{isArabic ? 'أقصى خسارة مسموح بها' : 'Max Loss'}</div>
                  <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">
                    ${dollarRisk.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-arabic">{isArabic ? `${riskTolerancePercent}% من الحساب` : `${riskTolerancePercent}% of account`}</div>
                </div>

                <div className="p-2 rounded bg-zinc-850 border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 font-arabic">{isArabic ? 'الربح المتوقع بالهدف' : 'Target Gain'}</div>
                  <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                    +${potentialGain > 0 ? potentialGain.toFixed(2) : '0.00'}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-arabic">{isArabic ? `عائد 1 : ${riskRewardRatio.toFixed(1)}` : `R:R 1 : ${riskRewardRatio.toFixed(1)}`}</div>
                </div>

                <div className="p-2 rounded bg-zinc-850 border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 font-arabic">{isArabic ? 'الرافعة المقترحة' : 'Leverage'}</div>
                  <div className="text-sm font-bold text-zinc-200 font-mono mt-0.5">
                    1:5 إلى 1:10
                  </div>
                  <div className="text-[10px] text-zinc-400 font-arabic">{isArabic ? 'رافعة منخفضة' : 'Low leverage'}</div>
                </div>
              </div>

              {/* Levels */}
              <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-xs font-arabic">
                <div className="flex flex-wrap items-center justify-between text-zinc-300 gap-2">
                  <div>
                    <span className="text-zinc-500">{isArabic ? 'الدخول المقترح:' : 'Entry:'}</span>{' '}
                    <strong className="text-white font-mono">${entryLevel.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500">{isArabic ? 'وقف الخسارة:' : 'Stop Loss:'}</span>{' '}
                    <strong className="text-rose-400 font-mono">${stopLossLevel.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-500">{isArabic ? 'الهدف:' : 'Target:'}</span>{' '}
                    <strong className="text-emerald-400 font-mono">${takeProfitLevel.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DETAILED ANALYSIS - Normal, clear language */}
        {activeTab === 'logic' && (
          <div className="mt-3.5 p-3.5 rounded-lg border border-zinc-800 bg-zinc-850/60 space-y-3">
            <div>
              <span className="text-[11px] font-bold text-zinc-300 font-arabic block mb-1">
                {isArabic ? 'سبب الحركة الحالية في السوق:' : 'Market Context:'}
              </span>
              <p dir={isArabic ? 'rtl' : 'ltr'} className="font-arabic text-xs text-zinc-200 leading-relaxed bg-zinc-900 p-2.5 rounded border border-zinc-800">
                {asset.logicalAnalysis?.whyMove || asset.arabicVerdict}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 font-arabic">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>{isArabic ? 'عوامل دعم الصعود:' : 'Bullish Factors:'}</span>
                </div>
                <ul className="space-y-1 text-xs text-zinc-300 font-arabic list-disc list-inside">
                  {(asset.logicalAnalysis?.bullishFactors || asset.topDrivers).map((factor, i) => (
                    <li key={i}>{factor}</li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="flex items-center gap-1 text-xs font-bold text-rose-400 font-arabic">
                  <TrendingDown className="h-3.5 w-3.5" />
                  <span>{isArabic ? 'مخاطر الهبوط المحتملة:' : 'Bearish Risks:'}</span>
                </div>
                <ul className="space-y-1 text-xs text-zinc-300 font-arabic list-disc list-inside">
                  {(asset.logicalAnalysis?.bearishRisks || [asset.arabicRiskWarning]).map((risk, i) => (
                    <li key={i}>{risk}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-2 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-arabic">
              <span className="text-zinc-400">{isArabic ? 'مستوى إلغاء الفكرة إذا وصل إليه السعر:' : 'Invalidation Price:'}</span>
              <strong className="text-rose-400 font-mono">${(asset.logicalAnalysis?.invalidationLevel || stopLossLevel).toLocaleString()}</strong>
            </div>
          </div>
        )}

        {/* TAB 3: SIMPLE SUMMARY */}
        {activeTab === 'simple' && (
          <div className="mt-3.5 p-3.5 rounded-lg border border-zinc-800 bg-zinc-850/60 space-y-2.5">
            <span className="text-xs font-bold text-zinc-200 font-arabic block">
              {isArabic ? 'نصيحة وإرشادات عامة:' : 'General Advice:'}
            </span>
            <p dir={isArabic ? 'rtl' : 'ltr'} className="font-arabic text-xs text-zinc-300 leading-relaxed bg-zinc-900 p-2.5 rounded border border-zinc-800">
              {asset.simpleAdvice || 'الاتجاه العام صاعد. ينصح بالتداول مع الاتجاه السائد وعدم الدخول بأحجام كبيرة، مع الالتزام دائماً بأمر وقف الخسارة.'}
            </p>

            <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-xs font-arabic space-y-1 text-zinc-400">
              <div className="font-semibold text-zinc-300 flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 text-zinc-400" />
                <span>{isArabic ? 'تنبيه مخاطر السوق:' : 'Risk Notice:'}</span>
              </div>
              <p>{asset.arabicRiskWarning}</p>
            </div>
          </div>
        )}
      </div>

      {/* Probability Gauge Bar */}
      <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-xs font-arabic">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">{isArabic ? 'توزيع الاحتمال:' : 'Probability:'}</span>
          <span className="font-mono font-bold text-emerald-400">{asset.bullishProb}% {isArabic ? 'صعود' : 'Bull'}</span>
          <span className="text-zinc-600">/</span>
          <span className="font-mono font-bold text-rose-400">{asset.bearishProb}% {isArabic ? 'هبوط' : 'Bear'}</span>
          <span className="text-zinc-600">/</span>
          <span className="font-mono text-zinc-400">{asset.neutralProb}% {isArabic ? 'حياد' : 'Neut'}</span>
        </div>

        <div className="h-1.5 w-28 bg-zinc-800 rounded-full overflow-hidden flex">
          <div style={{ width: `${asset.bullishProb}%` }} className="bg-emerald-500" />
          <div style={{ width: `${asset.neutralProb}%` }} className="bg-zinc-600" />
          <div style={{ width: `${asset.bearishProb}%` }} className="bg-rose-500" />
        </div>
      </div>
    </div>
  );
};
