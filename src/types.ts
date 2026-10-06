export type AssetCategory = 'crypto' | 'forex' | 'commodities';
export type ExperienceMode = 'beginner' | 'pro';
export type Language = 'ar' | 'en';

export interface LogicalAnalysis {
  whyMove: string;
  bullishFactors: string[];
  bearishRisks: string[];
  entryLevel: number;
  stopLossLevel: number;
  takeProfitLevel: number;
  invalidationLevel: number;
}

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  nameAr?: string;
  category: AssetCategory;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: string;
  tradingViewSymbol: string;
  bid: number;
  ask: number;
  spread: number;
  bullishProb: number;
  bearishProb: number;
  neutralProb: number;
  confidence: 'High' | 'Medium' | 'Low';
  actionSignal?: 'BUY' | 'SELL' | 'WAIT';
  simpleAdvice?: string;
  simpleAdviceEn?: string;
  arabicVerdict: string;
  englishVerdict?: string;
  arabicRiskWarning: string;
  englishRiskWarning?: string;
  topDrivers: string[];
  logicalAnalysis?: LogicalAnalysis;
}

export interface NewsItem {
  id: string;
  headline: string;
  headlineAr?: string;
  source: string;
  sourceTier?: string;
  timeAgo: string;
  category: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  tag: string;
  relatedAsset: string;
  analyzed?: boolean;
  isAnalyzing?: boolean;
  arabicAnalysis?: string;
  englishAnalysis?: string;
  sentiment?: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  probabilityShift?: number;
  confidence?: string;
  keyCatalyst?: string;
  logicalTakeaway?: {
    whatHappened: string;
    marketImpact: string;
    traderAction: string;
  };
}

export interface BrokerPartner {
  id: string;
  name: string;
  tagline: string;
  badge: string;
  minDeposit: string;
  maxLeverage: string;
  spread: string;
  regulation: string;
  affiliateUrl: string;
  promoCode: string;
  features: string[];
}
