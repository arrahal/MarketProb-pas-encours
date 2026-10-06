import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Copy, 
  Check, 
  CloudUpload, 
  ShieldCheck 
} from 'lucide-react';
import { Asset, ExperienceMode, Language } from '../types';
import { useAuth } from '../context/AuthContext';

interface PositionCalculatorProps {
  currentAsset: Asset;
  experienceMode: ExperienceMode;
  language: Language;
}

export const PositionCalculator: React.FC<PositionCalculatorProps> = ({ 
  currentAsset,
  experienceMode,
  language,
}) => {
  const { user, saveTradeSetup } = useAuth();
  const isArabic = language === 'ar';

  const [calcTab, setCalcTab] = useState<'simple' | 'advanced'>(
    experienceMode === 'beginner' ? 'simple' : 'advanced'
  );

  const [accountBalance, setAccountBalance] = useState<number>(1000);
  const [riskPercent, setRiskPercent] = useState<number>(1.0);
  const [entryPrice, setEntryPrice] = useState<number>(currentAsset.price);
  const [stopLossPrice, setStopLossPrice] = useState<number>(
    currentAsset.price * (currentAsset.bullishProb >= 50 ? 0.985 : 1.015)
  );
  const [takeProfitPrice, setTakeProfitPrice] = useState<number>(
    currentAsset.price * (currentAsset.bullishProb >= 50 ? 1.04 : 0.96)
  );
  const [copied, setCopied] = useState(false);
  const [savedCloud, setSavedCloud] = useState(false);

  useEffect(() => {
    setEntryPrice(currentAsset.price);
    const slFactor = currentAsset.bullishProb >= 50 ? 0.985 : 1.015;
    const tpFactor = currentAsset.bullishProb >= 50 ? 1.045 : 0.955;
    setStopLossPrice(parseFloat((currentAsset.price * slFactor).toFixed(4)));
    setTakeProfitPrice(parseFloat((currentAsset.price * tpFactor).toFixed(4)));
  }, [currentAsset.id, currentAsset.price, currentAsset.bullishProb]);

  const dollarRisk = (accountBalance * (riskPercent / 100));
  const priceDistanceToStop = Math.abs(entryPrice - stopLossPrice);
  const priceDistanceToTarget = Math.abs(takeProfitPrice - entryPrice);

  let recommendedPositionSize = 0;
  let formattedSizeUnit = isArabic ? 'وحدة' : 'Units';
  let potentialProfit = 0;
  let riskRewardRatio = 0;

  if (priceDistanceToStop > 0) {
    if (currentAsset.category === 'forex') {
      const pipSize = currentAsset.symbol.includes('JPY') ? 0.01 : 0.0001;
      const stopPips = priceDistanceToStop / pipSize;
      const targetPips = priceDistanceToTarget / pipSize;
      const pipValuePerLot = 10;
      recommendedPositionSize = dollarRisk / (stopPips * pipValuePerLot);
      potentialProfit = (recommendedPositionSize * targetPips * pipValuePerLot);
      formattedSizeUnit = isArabic ? 'لوت (Lot)' : 'Lots (FX)';
    } else if (currentAsset.category === 'crypto') {
      recommendedPositionSize = dollarRisk / priceDistanceToStop;
      potentialProfit = recommendedPositionSize * priceDistanceToTarget;
      formattedSizeUnit = currentAsset.symbol.split('/')[0] + (isArabic ? ' عملة' : ' Coins');
    } else {
      recommendedPositionSize = dollarRisk / (priceDistanceToStop * 100);
      potentialProfit = recommendedPositionSize * (priceDistanceToTarget * 100);
      formattedSizeUnit = isArabic ? 'عقد' : 'Contracts';
    }

    riskRewardRatio = priceDistanceToTarget / priceDistanceToStop;
  }

  const handleCopyParams = () => {
    const text = `أمر صفقة [${currentAsset.symbol}]: الدخول: $${entryPrice} | وقف الخسارة: $${stopLossPrice} | الهدف: $${takeProfitPrice} | الحجم: ${recommendedPositionSize.toFixed(3)} ${formattedSizeUnit} | الخسارة المحسوبة: $${dollarRisk.toFixed(2)} (${riskPercent}%)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#11141d] p-5 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-zinc-800 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300">
              <Calculator className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight font-mono">
                  {isArabic ? 'حاسبة إدارة المخاطر وحجم العقد' : 'POSITION SIZING CALCULATOR'}
                </h3>
              </div>
              <p className="text-[11px] text-zinc-400 font-arabic">
                {isArabic ? (
                  <>حساب الحجم المناسب لحماية رأس المال في صفقة <span className="text-zinc-200 font-mono font-bold">{currentAsset.symbol}</span></>
                ) : (
                  <>Calculate safe trade size for {currentAsset.symbol}</>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-xs font-arabic">
              <button
                onClick={() => setCalcTab('simple')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  calcTab === 'simple'
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isArabic ? 'مبسط' : 'Simple'}
              </button>
              <button
                onClick={() => setCalcTab('advanced')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  calcTab === 'advanced'
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isArabic ? 'متقدم' : 'Advanced'}
              </button>
            </div>

            {user && (
              <button
                onClick={async () => {
                  await saveTradeSetup({
                    symbol: currentAsset.symbol,
                    entryPrice,
                    stopLossPrice,
                    takeProfitPrice,
                    lotSize: recommendedPositionSize,
                    dollarRisk,
                    riskRewardRatio,
                  });
                  setSavedCloud(true);
                  setTimeout(() => setSavedCloud(false), 2000);
                }}
                title={isArabic ? 'حفظ الخطة سحابياً' : 'Save Plan'}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 transition-colors"
              >
                {savedCloud ? <Check className="h-3 w-3 text-emerald-400" /> : <CloudUpload className="h-3 w-3 text-zinc-400" />}
                <span className="font-arabic">{savedCloud ? (isArabic ? 'تم الحفظ' : 'Saved') : (isArabic ? 'حفظ' : 'Save')}</span>
              </button>
            )}

            <button
              onClick={handleCopyParams}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono text-zinc-300 bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 transition-colors"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span className="font-arabic">{copied ? (isArabic ? 'تم النسخ' : 'Copied') : (isArabic ? 'نسخ' : 'Copy')}</span>
            </button>
          </div>
        </div>

        {/* Inputs */}
        {calcTab === 'simple' ? (
          <div className="space-y-3 my-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-300 font-arabic flex items-center justify-between">
                  <span>{isArabic ? 'رصيد حسابك ($):' : 'Account Balance ($):'}</span>
                  <span className="text-emerald-400 font-mono font-bold">${accountBalance}</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="number"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(Math.max(10, parseFloat(e.target.value) || 0))}
                    className="w-full bg-zinc-900 border border-zinc-750 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-zinc-500"
                  />
                </div>
                <div className="flex gap-1.5 pt-0.5">
                  {[500, 1000, 5000, 10000].map((b) => (
                    <button
                      key={b}
                      onClick={() => setAccountBalance(b)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                        accountBalance === b
                          ? 'bg-zinc-700 text-white font-bold border-zinc-600'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      ${b}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-300 font-arabic flex items-center justify-between">
                  <span>{isArabic ? 'نسبة المخاطرة:' : 'Risk Percentage:'}</span>
                  <span className="text-rose-400 font-mono font-bold">${dollarRisk.toFixed(1)} {isArabic ? 'مخاطرة' : 'Risk'}</span>
                </label>
                <div className="flex gap-1.5">
                  {[0.5, 1.0, 2.0, 3.0].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRiskPercent(r)}
                      className={`flex-1 text-xs font-mono py-1.5 rounded-lg border transition-colors ${
                        riskPercent === r
                          ? 'bg-zinc-700 text-white font-bold border-zinc-600'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                      }`}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-zinc-500 font-arabic">
                  {isArabic ? 'نسبة 1% موصى بها لحماية الحساب من أي تراجع مفاجئ.' : '1% is standard safe risk.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-3.5">
            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-mono">Balance ($)</label>
              <input
                type="number"
                value={accountBalance}
                onChange={(e) => setAccountBalance(Math.max(10, parseFloat(e.target.value) || 0))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-zinc-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-mono">Risk (%)</label>
              <input
                type="number"
                step="0.1"
                value={riskPercent}
                onChange={(e) => setRiskPercent(Math.max(0.1, parseFloat(e.target.value) || 0))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-zinc-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-mono">Entry ($)</label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-zinc-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-400 font-mono">Stop Loss ($)</label>
              <input
                type="number"
                step="any"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* Output Guidance Box */}
      <div className="space-y-2.5 mt-3 pt-3 border-t border-zinc-800">
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-zinc-200 font-arabic block">
              {isArabic ? `توجيه الدخول لصفقة ${currentAsset.symbol} برصيد $${accountBalance.toLocaleString()}:` : `Trade Guidance for ${currentAsset.symbol}:`}
            </span>
            <p className="text-[11px] text-zinc-300 font-arabic mt-0.5">
              {isArabic 
                ? `ادخل بـ ${recommendedPositionSize > 0 ? recommendedPositionSize.toFixed(3) : '0.01'} ${formattedSizeUnit}، لتكون أقصى خسارة $${dollarRisk.toFixed(1)} فقط، والربح المتوقع +$${potentialProfit > 0 ? potentialProfit.toFixed(1) : '0.00'}.`
                : `Enter with ${recommendedPositionSize > 0 ? recommendedPositionSize.toFixed(3) : '0.01'} ${formattedSizeUnit}, risking $${dollarRisk.toFixed(1)} for +$${potentialProfit > 0 ? potentialProfit.toFixed(1) : '0.00'} profit.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 rounded bg-zinc-850 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 font-arabic">{isArabic ? 'الحجم المناسب' : 'Size'}</div>
            <div className="text-sm font-bold text-white font-mono mt-0.5">
              {recommendedPositionSize > 0 ? recommendedPositionSize.toFixed(3) : '0.00'}
            </div>
            <div className="text-[10px] text-zinc-400 font-arabic">{formattedSizeUnit}</div>
          </div>

          <div className="p-2 rounded bg-zinc-850 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 font-arabic">{isArabic ? 'أقصى خسارة' : 'Max Risk'}</div>
            <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">
              ${dollarRisk.toFixed(2)}
            </div>
            <div className="text-[10px] text-zinc-400 font-arabic">{isArabic ? `${riskPercent}% من الحساب` : `${riskPercent}%`}</div>
          </div>

          <div className="p-2 rounded bg-zinc-850 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 font-arabic">{isArabic ? 'الربح المتوقع' : 'Target Profit'}</div>
            <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
              +${potentialProfit > 0 ? potentialProfit.toFixed(2) : '0.00'}
            </div>
            <div className="text-[10px] text-zinc-400 font-arabic">{isArabic ? `عائد 1 : ${riskRewardRatio.toFixed(1)}` : `1 : ${riskRewardRatio.toFixed(1)}`}</div>
          </div>

          <div className="p-2 rounded bg-zinc-850 border border-zinc-800">
            <div className="text-[10px] text-zinc-400 font-arabic">{isArabic ? 'إدارة المخاطر' : 'Capital Safety'}</div>
            <div className="text-xs font-bold text-zinc-200 font-arabic flex items-center justify-center gap-1 mt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>{isArabic ? 'التزام بالوقف' : 'Disciplined'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
