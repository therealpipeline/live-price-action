export interface MarketAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  prevPrice: number;
  change: number;
  changePercent: number;
  unit: string;
  category: 'commodity' | 'index' | 'stock';
  sparkline: number[];
  description: string;
  lastUpdated: string;
}

export interface IPOCompany {
  name: string;
  symbol: string;
  exchange: string;
  priceRange: string;
  shares: string;
  expectedDate: string;
  status: 'Anticipated' | 'Filed' | 'Upcoming' | 'Recent';
  aiSentiment: string;
  description: string;
}

export interface MarketNewsItem {
  title: string;
  source: string;
  age: string;
  summary: string;
  category: string;
}

export interface Citation {
  title: string;
  url: string;
}

export interface MarketQueryResponse {
  success: boolean;
  simulated: boolean;
  answer: string;
  citations: Citation[];
}
