import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  ShieldCheck, 
  Check, 
  Copy, 
  Building2
} from 'lucide-react';
import { BROKER_PARTNERS } from '../data/marketData';
import { Language } from '../types';

interface BrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
}

export const BrokerModal: React.FC<BrokerModalProps> = ({ 
  isOpen, 
  onClose, 
  language = 'ar' 
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const isArabic = language === 'ar';

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        dir={isArabic ? 'rtl' : 'ltr'}
        className="relative w-full max-w-3xl rounded-xl border border-zinc-800 bg-[#0f141c] p-6 shadow-xl max-h-[90vh] flex flex-col font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700">
              <Building2 className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-arabic">
                  {isArabic ? 'الوسطاء ومنصات التداول المعتمدة' : 'Verified Broker Partners'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {isArabic ? 'تراخيص معتمدة' : 'REGULATED'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-arabic mt-0.5">
                {isArabic 
                  ? 'روابط التسجيل مع الوسطاء الموثوقين بفروق أسعار خام وسحب فوري للأموال'
                  : 'Official partner links with raw spreads and fast execution'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Brokers List */}
        <div className="space-y-3.5 my-4 overflow-y-auto pr-1 flex-1">
          {BROKER_PARTNERS.map((broker) => (
            <div
              key={broker.id}
              className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4 hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white font-mono">{broker.name}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700">
                      {broker.badge}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-arabic mt-0.5">{broker.tagline}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(broker.promoCode)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
                  >
                    {copiedCode === broker.promoCode ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                    <span>{isArabic ? 'كود:' : 'Code:'} <strong className="text-zinc-200">{broker.promoCode}</strong></span>
                  </button>

                  <a
                    href={broker.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-950 bg-emerald-400 hover:bg-emerald-300 transition-colors font-arabic"
                  >
                    <span>{isArabic ? 'فتح حساب' : 'Open Account'}</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                  </a>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 px-3 rounded-lg bg-zinc-950/70 border border-zinc-800 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 block font-arabic">{isArabic ? 'أقل إيداع' : 'Min Deposit'}</span>
                  <span className="text-zinc-200 font-bold">{broker.minDeposit}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block font-arabic">{isArabic ? 'أقصى رافعة' : 'Max Leverage'}</span>
                  <span className="text-zinc-200 font-bold">{broker.maxLeverage}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block font-arabic">{isArabic ? 'فارق النقاط (سبريد)' : 'Spread'}</span>
                  <span className="text-emerald-400 font-bold">{broker.spread}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block font-arabic">{isArabic ? 'التراخيص' : 'Regulation'}</span>
                  <span className="text-zinc-300 font-bold">{broker.regulation}</span>
                </div>
              </div>

              {/* Key Features */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {broker.features.map((feature, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] text-zinc-300 flex items-center gap-1 bg-zinc-850 px-2 py-0.5 rounded border border-zinc-800 font-arabic"
                  >
                    <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                    <span>{feature}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between font-arabic">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              {isArabic 
                ? 'إفصاح الشراكة: قد يحصل الموقع على عمولة إحالة من الوسيط دون أي تكلفة إضافية عليك.'
                : 'Affiliate Disclosure: MarketProb may receive partner referral fees at no extra cost to you.'}
            </span>
          </span>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white px-2 py-1 rounded transition-colors text-xs"
          >
            {isArabic ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
