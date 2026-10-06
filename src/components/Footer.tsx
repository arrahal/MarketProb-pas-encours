import React from 'react';
import { 
  TrendingUp, 
  ShieldAlert, 
  Lock, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Language } from '../types';
import { RISK_DISCLAIMER_AR, RISK_DISCLAIMER_EN } from '../data/marketData';

interface FooterProps {
  onOpenBrokerModal: () => void;
  language?: Language;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBrokerModal, language = 'ar' }) => {
  const isArabic = language === 'ar';

  return (
    <footer className="border-t border-zinc-800 bg-[#0d1117] text-zinc-400 mt-10 pb-10">
      {/* Broker Partnership Banner */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="max-w-2xl space-y-1">
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase">
              {isArabic ? 'وسطاء التداول المعتمدون' : 'VERIFIED BROKERS'}
            </span>
            <h3 className="text-base font-bold text-white font-arabic">
              {isArabic ? 'تداول مع وسطاء موثوقين بفروق أسعار تبدأ من 0.0 وسحب سريع' : 'Trade with Raw Spread & Verified Regulated Brokers'}
            </h3>
            <p className="text-xs text-zinc-400 font-arabic">
              {isArabic 
                ? 'فروق أسعار منخفضة جداً مع حسابات بنكية مفصولة وخيارات سحب وإيداع متنوعة.'
                : 'Ultra-low spreads with segregated accounts and fast deposit/withdrawal methods.'}
            </p>
          </div>

          <button
            onClick={onOpenBrokerModal}
            className="w-full sm:w-auto px-5 py-2 rounded-lg text-xs font-bold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center justify-center gap-1.5 font-arabic shrink-0"
          >
            <span>{isArabic ? 'مقارنة الوسطاء' : 'Compare Brokers'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-zinc-800/80">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 text-xs font-arabic">
          {/* Col 1: Brand */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-zinc-800 flex items-center justify-center text-emerald-400 border border-zinc-700">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-bold text-white font-mono">
                Market<span className="text-emerald-400">Prob</span>
              </span>
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              {isArabic ? 'منصة متخصصة في تحليل حركة الأسواق المالية وحساب حجم الصفقات وإدارة المخاطر للمتداولين.' : 'Market analytics and capital risk management platform for active traders.'}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500">
              <Lock className="h-3 w-3 text-zinc-400" />
              <span>SSL 256-bit Encrypted</span>
            </div>
          </div>

          {/* Col 2: Modules */}
          <div className="space-y-1.5">
            <h4 className="text-zinc-200 font-bold uppercase text-[11px]">
              {isArabic ? 'أقسام المنصة' : 'Platform Tools'}
            </h4>
            <ul className="space-y-1 text-zinc-400 text-[11px]">
              <li>{isArabic ? 'مؤشر حركة السوق وتوجيه الدخول' : 'Market Probability Engine'}</li>
              <li>{isArabic ? 'موجز الأخبار والمفكرة الاقتصادية' : 'Financial News Radar'}</li>
              <li>{isArabic ? 'الرسم البياني المباشر' : 'Live TradingView Charts'}</li>
              <li>{isArabic ? 'حاسبة حجم الصفقة وإدارة رأس المال' : 'Position Sizing Calculator'}</li>
            </ul>
          </div>

          {/* Col 3: Markets */}
          <div className="space-y-1.5">
            <h4 className="text-zinc-200 font-bold uppercase text-[11px]">
              {isArabic ? 'الأسواق المدعومة' : 'Supported Markets'}
            </h4>
            <ul className="space-y-1 text-zinc-400 font-mono text-[11px]">
              <li>BTC/USD • ETH/USD • SOL/USD</li>
              <li>EUR/USD • GBP/USD • USD/JPY</li>
              <li>Gold (XAU/USD) • Crude Oil (WTI)</li>
            </ul>
          </div>

          {/* Col 4: Principles / Security */}
          <div className="space-y-1.5">
            <h4 className="text-zinc-200 font-bold uppercase text-[11px]">
              {isArabic ? 'معايير إدارة المخاطر' : 'Risk Management Rules'}
            </h4>
            <ul className="space-y-1 text-zinc-400 text-[11px]">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                <span>{isArabic ? 'تحديد وقف الخسارة قبل الدخول' : 'Define Stop Loss before entry'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                <span>{isArabic ? 'المخاطرة بنسبة 1% فقط من الرصيد' : 'Risk maximum 1% per trade'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                <span>{isArabic ? 'تجنب الروافع المالية المفرطة' : 'Avoid excessive leverage'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 space-y-2 text-[11px] text-zinc-400 font-arabic leading-relaxed">
          <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
            <span>{isArabic ? 'إخلاء المسؤولية القانونية وتحذير المخاطر:' : 'LEGAL RISK DISCLAIMER'}</span>
          </div>
          <p className="text-zinc-400 text-justify">
            {isArabic ? RISK_DISCLAIMER_AR : RISK_DISCLAIMER_EN}
          </p>
          <p className="text-zinc-500 font-mono text-[10px] pt-1">
            © {new Date().getFullYear()} MarketProb. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
