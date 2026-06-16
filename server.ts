import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Standard data structure for market assets
interface MarketAsset {
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

// Initial robust market data for immediate high-density UI rendering
let marketDataCache: MarketAsset[] = [
  {
    id: "gold",
    name: "Gold Spot",
    symbol: "GC=F",
    price: 2355.80,
    prevPrice: 2341.20,
    change: 14.60,
    changePercent: 0.62,
    unit: "USD / t oz",
    category: "commodity",
    sparkline: [2338.5, 2341.2, 2339.8, 2343.4, 2346.1, 2342.9, 2348.0, 2350.5, 2349.2, 2352.0, 2354.1, 2355.8],
    description: "Physical gold spot price tracked in global Bullion and COMEX markets. Serves as the ultimate global safe-haven commodity.",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "silver",
    name: "Silver Spot",
    symbol: "SI=F",
    price: 29.45,
    prevPrice: 29.20,
    change: 0.25,
    changePercent: 0.86,
    unit: "USD / t oz",
    category: "commodity",
    sparkline: [28.90, 29.10, 29.05, 29.15, 29.30, 29.20, 29.25, 29.35, 29.41, 29.38, 29.42, 29.45],
    description: "Silver spot pricing driven by industrial manufacturing demand (electronics, photovolatics) and monetary hedge investment.",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "platinum",
    name: "Platinum",
    symbol: "PL=F",
    price: 991.20,
    prevPrice: 998.50,
    change: -7.30,
    changePercent: -0.73,
    unit: "USD / t oz",
    category: "commodity",
    sparkline: [1005.0, 1002.5, 1001.0, 998.5, 996.0, 999.0, 997.5, 993.4, 994.0, 991.5, 992.5, 991.2],
    description: "Platinum precious metal, utilized heavily in catalytic converters and jewelry, showing recent automotive supply shifts.",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "crude_oil",
    name: "Crude Oil (WTI)",
    symbol: "CL=F",
    price: 79.84,
    prevPrice: 78.50,
    change: 1.34,
    changePercent: 1.71,
    unit: "USD / bbl",
    category: "commodity",
    sparkline: [78.20, 78.50, 78.40, 78.90, 79.10, 78.80, 79.05, 79.30, 79.45, 79.60, 79.72, 79.84],
    description: "West Texas Intermediate Light Sweet Crude oil pricing. Driving force behind global energy costing and inflation indices.",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "natural_gas",
    name: "Natural Gas",
    symbol: "NG=F",
    price: 2.84,
    prevPrice: 2.91,
    change: -0.07,
    changePercent: -2.41,
    unit: "USD / MMBtu",
    category: "commodity",
    sparkline: [2.95, 2.91, 2.93, 2.90, 2.88, 2.89, 2.85, 2.87, 2.86, 2.83, 2.85, 2.84],
    description: "U.S. Natural Gas spot price at the Henry Hub in Louisiana, sensitive to weather seasonality and industrial power grid load.",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "copper",
    name: "Copper Spot",
    symbol: "HG=F",
    price: 4.580,
    prevPrice: 4.520,
    change: 0.060,
    changePercent: 1.33,
    unit: "USD / lb",
    category: "commodity",
    sparkline: [4.490, 4.520, 4.510, 4.530, 4.550, 4.542, 4.560, 4.575, 4.568, 4.585, 4.572, 4.580],
    description: "Doctor Copper - global economic diagnostic industrial metal, seeing immense demand in grid expansions and EV production.",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "sp500",
    name: "S&P 500 Index",
    symbol: "^GSPC",
    price: 5462.40,
    prevPrice: 5445.10,
    change: 17.30,
    changePercent: 0.32,
    unit: "Points",
    category: "index",
    sparkline: [5430.0, 5445.1, 5448.0, 5442.5, 5451.0, 5449.5, 5455.2, 5458.0, 5456.4, 5460.0, 5461.1, 5462.4],
    description: "Benchmark stock index tracking the market capitalization of 500 leading publicly traded American companies.",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "nasdaq100",
    name: "NASDAQ 100 Index",
    symbol: "^NDX",
    price: 19745.20,
    prevPrice: 19630.50,
    change: 114.70,
    changePercent: 0.58,
    unit: "Points",
    category: "index",
    sparkline: [19580.0, 19630.5, 19615.0, 19650.0, 19680.0, 19645.0, 19695.5, 19710.0, 19702.0, 19730.0, 19741.5, 19745.2],
    description: "Modified capitalization-weighted index featuring 100 of the largest non-financial technological titans on the NASDAQ.",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "aapl",
    name: "Apple Inc.",
    symbol: "AAPL",
    price: 216.75,
    prevPrice: 214.20,
    change: 2.55,
    changePercent: 1.19,
    unit: "USD / share",
    category: "stock",
    sparkline: [213.5, 214.2, 213.9, 214.8, 215.1, 214.6, 215.5, 215.9, 215.8, 216.2, 216.5, 216.75],
    description: "Technology pioneer designing consumer electronics, services, chips, and AI software integrations.",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "nvda",
    name: "NVIDIA Corp.",
    symbol: "NVDA",
    price: 129.40,
    prevPrice: 126.30,
    change: 3.10,
    changePercent: 2.45,
    unit: "USD / share",
    category: "stock",
    sparkline: [124.5, 126.3, 125.1, 127.0, 128.2, 127.6, 128.5, 128.9, 128.4, 129.1, 129.3, 129.4],
    description: "Leading designer of graphics processing units (GPUs) powering cloud AI computational clusters globally.",
    lastUpdated: new Date().toISOString()
  },
  {
    id: "msft",
    name: "Microsoft Corp.",
    symbol: "MSFT",
    price: 442.50,
    prevPrice: 444.80,
    change: -2.30,
    changePercent: -0.52,
    unit: "USD / share",
    category: "stock",
    sparkline: [446.0, 444.8, 445.5, 443.9, 444.2, 445.0, 443.5, 442.8, 443.1, 442.0, 442.3, 442.5],
    description: "Platform and productivity leader, deeply integrated into enterprise cloud infrastructure and retail software.",
    lastUpdated: new Date().toISOString()
  }
];

// High-fidelity IPO Data representation
interface IPOCompany {
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

let ipoDataCache: IPOCompany[] = [
  {
    name: "Databricks Inc.",
    symbol: "DBRX (Reserved)",
    exchange: "NASDAQ",
    priceRange: "$75.00 - $85.00 (Estimated)",
    shares: "45M",
    expectedDate: "Q3 2026 (Expected)",
    status: "Upcoming",
    aiSentiment: "High demand expected; enterprise database/AI governance lakehouse utility makes it a marquee tech listing.",
    description: "Universal Lakehouse platform architecture combining data warehouse analytical performance with data lake economical structure."
  },
  {
    name: "Stripe Inc.",
    symbol: "STRIP (Reserved)",
    exchange: "NYSE",
    priceRange: "$23.00 - $26.00 (Estimated)",
    shares: "120M",
    expectedDate: "H2 2026 (Anticipated)",
    status: "Anticipated",
    aiSentiment: "Exceptional interest; payment infrastructure engine handling significant global e-commerce and software invoice processing.",
    description: "FinTech api engine and financial services ledger empowering internet commercial transactions and corporate card routing."
  },
  {
    name: "Cerebras Systems",
    symbol: "CBRS",
    exchange: "NASDAQ",
    priceRange: "$28.00 - $32.00 (Expected)",
    shares: "15M",
    expectedDate: "June 25, 2026",
    status: "Upcoming",
    aiSentiment: "Strong niche interest; famous for the Wafer-Scale Engine chip designed exclusively for giant neural net deep learning.",
    description: "Advanced semiconductor engineering building world's tallest and largest microchips specifically tuned for heavy AI model pipelines."
  },
  {
    name: "Rubrik Inc.",
    symbol: "RBRK",
    exchange: "NYSE",
    priceRange: "$32.00 (Finalized)",
    shares: "23.5M",
    expectedDate: "Recently Listed",
    status: "Recent",
    aiSentiment: "Solid post-listing trading; zero-trust data security backing showing robust corporate cloud backup retention growth.",
    description: "Cybersecurity and zero-trust cloud data management standardizing backup recovery pipelines against active ransomware threats."
  },
  {
    name: "Waymo LLC",
    symbol: "WAYM (Anticipated)",
    exchange: "NASDAQ",
    priceRange: "Valuation target $45B+",
    shares: "N/A",
    expectedDate: "Late 2026",
    status: "Anticipated",
    aiSentiment: "Strategic breakout; autonomous driving pioneer owned by Alphabet, scaling commercial robotaxi circuits successfully.",
    description: "Autonomous vehicle design running driverless passenger networks in major metropolitan hubs across North America."
  }
];

// Lazy-initialized server-side Gemini AI Client
let aiClient: GoogleGenAI | null = null;

function getGeminiAI(): GoogleGenAI | null {
  if (aiClient) {
    return aiClient;
  }
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    console.warn("GEMINI_API_KEY is not defined in environments. Operating in simulated fallback mode.");
    return null;
  }
  try {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    console.log("Successfully initialized server-side GoogleGenAI client with Grounding options.");
    return aiClient;
  } catch (error) {
    console.error("Initialization error of GoogleGenAI SDK:", error);
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API 1: Fetch Current Market Data
  app.get("/api/market-data", (req, res) => {
    try {
      res.json({
        success: true,
        data: marketDataCache,
        ipos: ipoDataCache,
        lastGlobalUpdate: marketDataCache[0]?.lastUpdated
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API 2: Trigger Live Search Grounded Price Pull & Core News updates
  app.post("/api/market-refresh", async (req, res) => {
    console.log("Triggering market data refresh with Gemini Search Grounding...");
    const ai = getGeminiAI();

    if (!ai) {
      // If no API key, introduce realistic minor market fluctuations to simulate live data
      marketDataCache = marketDataCache.map(asset => {
        const volatility = asset.id === "gold" || asset.id === "silver" ? 0.003 : 0.012;
        const changeRatio = (Math.random() - 0.49) * 2 * volatility;
        const previousPrice = asset.price;
        const nextPrice = Number((previousPrice * (1 + changeRatio)).toFixed(2));
        const change = Number((nextPrice - asset.prevPrice).toFixed(2));
        const changePercent = Number(((change / asset.prevPrice) * 100).toFixed(2));
        const updatedSparkline = [...asset.sparkline.slice(1), nextPrice];

        return {
          ...asset,
          price: nextPrice,
          change,
          changePercent,
          sparkline: updatedSparkline,
          lastUpdated: new Date().toISOString()
        };
      });

      return res.json({
        success: true,
        simulated: true,
        data: marketDataCache,
        ipos: ipoDataCache,
        message: "Key not configured. Updated cache with high-fidelity simulated fluctuations.",
        lastGlobalUpdate: new Date().toISOString()
      });
    }

    try {
      // Request Gemini to search Google for the actual live prices of key commodities & indices
      const searchPrompt = `
        Search Google for the absolute latest live market prices of:
        - Gold spot price per troy ounce in USD
        - Silver spot price per troy ounce in USD
        - Crude Oil (WTI) price per barrel in USD
        - S&P 500 Index points
        - NASDAQ 100 Index points
        - Apple Inc. (AAPL) stock price in USD
        - NVIDIA (NVDA) stock price in USD
        
        Extract the current price, recent day's price change, and percent change for each. Include citations.
        Return your response in a serialized JSON array representing these assets, with the keys:
        'id' (one of: gold, silver, crude_oil, sp500, nasdaq100, aapl, nvda),
        'price' (number representing the latest price),
        'change' (number representing absolute dollar/point change),
        'changePercent' (number representing percentage level).
        
        Ensure formatting remains perfectly parseable JSON like:
        [{"id": "gold", "price": 2355.20, "change": 14.50, "changePercent": 0.62}]
        Provide only valid JSON. Do not wrap in markdown or backticks.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: searchPrompt,
        config: {
          systemInstruction: "You are a fast financial parser. Always retrieve real-time figures via Google Search and respond strictly in clean JSON arrays.",
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });

      const text = response.text || "[]";
      console.log("Raw Gemini JSON grounded output:", text);
      const parsedUpdates = JSON.parse(text);

      if (Array.isArray(parsedUpdates)) {
        marketDataCache = marketDataCache.map(asset => {
          const match = parsedUpdates.find((u: any) => u.id === asset.id);
          if (match && typeof match.price === "number") {
            const nextPrice = match.price;
            const updatedSparkline = [...asset.sparkline.slice(1), nextPrice];
            return {
              ...asset,
              prevPrice: asset.price,
              price: nextPrice,
              change: match.change || Number((nextPrice - asset.price).toFixed(2)),
              changePercent: match.changePercent || Number((((nextPrice - asset.price) / asset.price) * 100).toFixed(2)),
              sparkline: updatedSparkline,
              lastUpdated: new Date().toISOString()
            };
          }
          return asset;
        });
      }

      res.json({
        success: true,
        simulated: false,
        data: marketDataCache,
        ipos: ipoDataCache,
        lastGlobalUpdate: new Date().toISOString()
      });
    } catch (err: any) {
      console.error("Gemini Market Refresh search error, falling back to simulated:", err);
      // Fallback
      res.json({
        success: true,
        simulated: true,
        data: marketDataCache,
        ipos: ipoDataCache,
        error: err.message,
        lastGlobalUpdate: new Date().toISOString()
      });
    }
  });

  // API 3: Live Market Intelligence Query
  app.post("/api/market-query", async (req, res) => {
    const { query } = req.body;
    if (!query || query.trim() === "") {
      return res.status(400).json({ success: false, error: "Query is required" });
    }

    console.log(`Executing Gemini Intelligence query: "${query}"...`);
    const ai = getGeminiAI();

    if (!ai) {
      // Simulate answer if no API key
      const responseText = `### Aurum Terminal Analysis

*Status: Developer Sandbox Fallback*

In a live production environment, your query **"${query}"** would trigger deep Google Search Grounding to extract the absolute latest commodity and stock market details. 

Based on our recent internal June 2026 data:
- **Gold spot markets** are holding firm in the $2,350+ range, fueled by robust central-bank purchases and steady safe-haven treasury hedging.
- **Technology Listings**: Artificial Intelligence computational demand continues to fuel robust NASDAQ indexes with NVDA and tech-focused chips leading standard indices.
- **IPO Outlook**: High-profile technology enterprises (Cerebras Systems upcoming on June 25, Streak/Stripe and Databricks preparing) display solid interest, though public pricing remains sensitive to interest rate policy.

*Configure your GEMINI_API_KEY in the Secrets panel to unlock live, search-grounded market deep dives!*`;

      return res.json({
        success: true,
        simulated: true,
        answer: responseText,
        citations: [
          { title: "Gold Market Outlook", url: "https://finance.google.com" },
          { title: "IPOs Calendar 2026", url: "https://www.nasdaq.com" }
        ]
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze the following market inquiry clearly. Use Google Search to fetch up-to-the-minute details if it concerns commodity prices, news events, stock tickers, or company IPO listings. Answer concisely with clear headings and bulleted structures where appropriate. Query: ${query}`,
        config: {
          systemInstruction: "You are an elite, objective senior commodity strategist and financial analyst working at a sovereign terminal. Be precise, accurate to the exact dollar details retrieved, and avoid empty speculation. Highlight gold, silver, and central asset statistics if relevant.",
          tools: [{ googleSearch: {} }]
        }
      });

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const citations = groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        title: chunk.web?.title || "Market Source",
        url: chunk.web?.uri || "#"
      })).slice(0, 5) || [];

      res.json({
        success: true,
        simulated: false,
        answer: response.text,
        citations: citations
      });
    } catch (err: any) {
      console.error("Gemini market-query failed:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // API 4: Premium Financial News Grounded Search
  app.get("/api/market-news", async (req, res) => {
    console.log("Fetching latest news headlines via Gemini Search...");
    const ai = getGeminiAI();

    if (!ai) {
      const defaultNews = [
        {
          title: "Gold Holds Steady Near Historic Highs Amid Geopolitical Unrest",
          source: "Global Bullion Dispatch",
          age: "2h ago",
          summary: "Gold futures consolidated above $2,350 as buyers remain active despite high yield retention.",
          category: "gold"
        },
        {
          title: "Cerebras systems files updated prospectus targeting June IPO",
          source: "Tech Venture Daily",
          age: "4h ago",
          summary: "The wafer-scale artificial intelligence compute designer prepares pricing parameters between $28 and $32 per share.",
          category: "ipo"
        },
        {
          title: "Crude Oil rises 1.7% amidst energy inventory draws",
          source: "Energy Reports",
          age: "6h ago",
          summary: "WTI Crude contracts climbed near $80 after inventories contracted significantly more than expected by global analysts.",
          category: "oil"
        },
        {
          title: "Silver outpaces gold on robust photovoltaic manufacturing forecasts",
          source: "Industrial Resource Journal",
          age: "1d ago",
          summary: "Industrial demand pressures silver inventories down, lifting physical spot metal values over 3% this week.",
          category: "silver"
        }
      ];
      return res.json({ success: true, simulated: true, news: defaultNews });
    }

    try {
      const newsPrompt = `
        Search Google for the absolute latest (past 24-48 hours) commodity market news, gold pricing context, and stock/IPO notices.
        Return 4 distinct news items.
        Give me a structured JSON array with these keys:
        'title' (the news headline),
        'source' (publication name),
        'age' (relative time like '2h ago' or '1d ago'),
        'summary' (one brief sentence summary),
        'category' (one of: gold, silver, oil, ipo, stocks).
        Ensure it is strictly returned in a JSON format. No markdown or code block backticks.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: newsPrompt,
        config: {
          systemInstruction: "You are a financial news aggregator. Return the actual news headlines you retrieve from Google Search in a standard valid JSON array.",
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json"
        }
      });

      const newsList = JSON.parse(response.text || "[]");
      res.json({ success: true, simulated: false, news: newsList });
    } catch (err: any) {
      console.error("Failed fetching news via Gemini Search, returning static defaults:", err);
      // Return static fallback
      const fallbackNews = [
        {
          title: "Gold Holds Steady Near Historic Highs Amid Geopolitical Unrest",
          source: "Global Bullion Dispatch",
          age: "2h ago",
          summary: "Gold futures consolidated above $2,350 as buyers remain active despite high yield retention.",
          category: "gold"
        },
        {
          title: "Cerebras systems files updated prospectus targeting June IPO",
          source: "Tech Venture Daily",
          age: "4h ago",
          summary: "The wafer-scale artificial intelligence compute designer prepares pricing parameters between $28 and $32 per share.",
          category: "ipo"
        },
        {
          title: "Crude Oil rises 1.7% amidst energy inventory draws",
          source: "Energy Reports",
          age: "6h ago",
          summary: "WTI Crude contracts climbed near $80 after inventories contracted significantly more than expected by global analysts.",
          category: "oil"
        }
      ];
      res.json({ success: true, simulated: true, news: fallbackNews });
    }
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Aurum Terminal Server running at http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failure starting the full-stack server application:", error);
});
