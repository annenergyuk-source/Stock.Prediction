import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Activity, Search, Globe, LayoutDashboard, BarChart2, 
  Layers, Terminal, ChevronDown, Bell, Settings, ArrowUpRight, ArrowDownRight,
  Database, ShieldAlert, Cpu, Menu, X, Languages, AlertTriangle, TrendingUp, TrendingDown, Minus
} from 'lucide-react';

// Mock data for the sidebar lists
const STOCKS = [
  { symbol: 'RELIANCE', name: 'Reliance Ind.', price: 2954.20, change: 1.24, vol: '6.4M' },
  { symbol: 'TCS', name: 'Tata Consultancy', price: 3845.10, change: -0.45, vol: '2.1M' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1645.80, change: 0.89, vol: '12.3M' },
  { symbol: 'INFY', name: 'Infosys', price: 1489.25, change: -1.12, vol: '4.5M' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', price: 984.50, change: 2.34, vol: '8.9M' },
  { symbol: 'SBIN', name: 'State Bank of India', price: 765.40, change: 0.15, vol: '9.2M' },
];

const IPOS = [
  { symbol: 'BAJAJHOUS', name: 'Bajaj Housing', price: 150.00, change: 135.4, vol: '45.2M' },
  { symbol: 'SWIGGY', name: 'Swiggy Limited', price: 390.00, change: 12.5, vol: '18.1M' },
  { symbol: 'HYUNDAI', name: 'Hyundai Motor', price: 1960.00, change: -4.2, vol: '6.8M' },
];

// Generates realistic-looking mock chart data based on price and trend
const generateMockChartData = (basePrice, isPositive) => {
  let currentPrice = basePrice;
  const data = [];
  const now = new Date();
  for (let i = 60; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    const drift = isPositive ? 0.0005 : -0.0005;
    const volatility = 0.002;
    const change = currentPrice * (drift + (Math.random() - 0.5) * volatility);
    currentPrice += change;
    
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      price: Number(currentPrice.toFixed(2)),
    });
  }
  return data;
};

export default function App() {
  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeAsset, setActiveAsset] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Crawler & Analysis State
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlerLogs, setCrawlerLogs] = useState([]);
  const [analysis, setAnalysis] = useState(null); // { prediction, reason, sentiment }
  const [error, setError] = useState(null);

  // Translation State
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedReason, setTranslatedReason] = useState(null);
  const [showHindi, setShowHindi] = useState(false);

  const logsEndRef = useRef(null);

  // Auto-scroll crawler logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [crawlerLogs]);

  const handleAssetSelect = async (asset) => {
    setIsSidebarOpen(false); // Close mobile sidebar
    setActiveAsset(asset);
    setChartData(generateMockChartData(asset.price, asset.change > 0));
    
    // Reset states
    setAnalysis(null);
    setError(null);
    setTranslatedReason(null);
    setShowHindi(false);
    setIsCrawling(true);
    setCrawlerLogs([`> Initializing connection to OmniTrade servers for ${asset.symbol}...`]);

    // Simulated Crawl Sequence
    const steps = [
      `> establishing deep web nodes... OK`,
      `> Scraping live X.com cashtags ($${asset.symbol})...`,
      `> Analyzing LinkedIn insider sentiment and executive movements...`,
      `> Scraping global financial news RSS feeds...`,
      `> Running NLP on Dark Web financial forums...`,
      `> Aggregating negative/positive keyword frequencies...`,
      `> Correlating data with technical indicators...`,
      `> Generating final predictive matrix...`
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
      setCrawlerLogs(prev => [...prev, steps[i]]);
    }

    await fetchAIAnalysis(asset);
  };

  const fetchAIAnalysis = async (asset) => {
    try {
      const apiKey = ""; // Handled seamlessly by Canvas environment
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: [{
          parts: [{ 
            text: `Act as an elite quantitative analyst. Analyze the Indian market asset: ${asset.name} (${asset.symbol}). 
            Based on current market conditions and hypothetical recent social media/news sentiment, provide a short-term prediction.
            Output your response strictly as JSON with the following structure:
            {
              "prediction": "A concise, 1-sentence predictive statement.",
              "reason": "A detailed, professional paragraph explaining the deep-web/social media sentiment and technical reasons driving this prediction.",
              "sentiment": "Must be exactly 'BULLISH', 'BEARISH', or 'NEUTRAL'"
            }`
          }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              prediction: { type: "STRING" },
              reason: { type: "STRING" },
              sentiment: { type: "STRING", enum: ["BULLISH", "BEARISH", "NEUTRAL"] }
            },
            required: ["prediction", "reason", "sentiment"]
          }
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        const jsonResult = JSON.parse(data.candidates[0].content.parts[0].text);
        setAnalysis(jsonResult);
      } else {
        throw new Error("Invalid response format from AI Engine.");
      }
    } catch (err) {
      console.error(err);
      setError("AI Engine failed to generate analysis. Please try again.");
    } finally {
      setIsCrawling(false);
    }
  };

  const handleTranslate = async () => {
    if (showHindi) {
      setShowHindi(false);
      return;
    }

    if (translatedReason) {
      setShowHindi(true);
      return;
    }

    setIsTranslating(true);
    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: [{
          parts: [{ text: `Translate the following highly technical financial analysis text into professional Hindi: "${analysis.reason}"` }]
        }]
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        setTranslatedReason(data.candidates[0].content.parts[0].text);
        setShowHindi(true);
      }
    } catch (err) {
      console.error(err);
      alert("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const getSentimentColors = (sentiment) => {
    switch(sentiment) {
      case 'BULLISH': return { border: 'border-[#089981]', bg: 'bg-[#089981]/10', text: 'text-[#089981]', icon: <TrendingUp className="w-6 h-6 text-[#089981]" /> };
      case 'BEARISH': return { border: 'border-[#F23645]', bg: 'bg-[#F23645]/10', text: 'text-[#F23645]', icon: <TrendingDown className="w-6 h-6 text-[#F23645]" /> };
      default: return { border: 'border-[#2962FF]', bg: 'bg-[#2962FF]/10', text: 'text-[#2962FF]', icon: <Minus className="w-6 h-6 text-[#2962FF]" /> };
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#131722] text-[#D1D4DC] font-sans overflow-hidden">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1E222D] border-r border-[#2A2E39] flex flex-col transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#2A2E39]">
          <div className="flex items-center">
            <Activity className="w-6 h-6 text-[#2962FF]" />
            <span className="ml-2 font-bold text-lg text-white tracking-wider">OmniTrade<span className="text-[#2962FF]">AI</span></span>
          </div>
          <button className="lg:hidden p-1 text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Market List */}
          <div className="py-4">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">NSE/BSE Top Watch</h3>
            <div className="space-y-1">
              {STOCKS.filter(s => s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(stock => (
                <AssetListItem key={stock.symbol} asset={stock} isActive={activeAsset?.symbol === stock.symbol} onClick={() => handleAssetSelect(stock)} />
              ))}
            </div>
            
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Recent IPOs</h3>
            <div className="space-y-1">
              {IPOS.filter(s => s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(ipo => (
                <AssetListItem key={ipo.symbol} asset={ipo} isActive={activeAsset?.symbol === ipo.symbol} isNew onClick={() => handleAssetSelect(ipo)} />
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Header */}
        <header className="h-16 flex-shrink-0 bg-[#1E222D] border-b border-[#2A2E39] flex items-center justify-between px-4">
          <div className="flex items-center flex-1">
            <button className="mr-4 lg:hidden text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#131722] text-[#D1D4DC] placeholder-gray-600 border border-[#2A2E39] rounded-md py-1.5 pl-9 pr-4 focus:outline-none focus:border-[#2962FF] transition-colors text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center px-2 py-1 bg-[#131722] rounded border border-[#2A2E39]">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#089981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#089981]"></span>
              </span>
              <span className="text-[10px] font-mono text-[#089981] uppercase tracking-wider">Nodes Active</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col p-3 gap-3">
          
          {!activeAsset ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-[#1E222D] rounded-lg border border-[#2A2E39]">
              <Globe className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg font-medium text-gray-400">Select an asset to initiate deep analysis</p>
              <p className="text-sm mt-2">Awaiting target selection...</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col lg:flex-row gap-3 min-h-0">
              
              {/* Left Column: Chart */}
              <div className="w-full lg:w-3/5 xl:w-2/3 bg-[#1E222D] rounded-lg border border-[#2A2E39] flex flex-col min-h-[400px] lg:min-h-0">
                {/* Chart Header */}
                <div className="px-4 py-3 border-b border-[#2A2E39] flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      {activeAsset.symbol}
                      <span className="text-[10px] px-1.5 py-0.5 bg-[#2A2E39] rounded text-gray-400 uppercase">NSE</span>
                    </h2>
                    <p className="text-sm text-gray-400">{activeAsset.name}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-mono ${activeAsset.change >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                      ₹{activeAsset.price.toFixed(2)}
                    </div>
                    <div className={`text-sm font-medium flex items-center justify-end ${activeAsset.change >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}`}>
                      {activeAsset.change >= 0 ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                      {Math.abs(activeAsset.change)}%
                    </div>
                  </div>
                </div>
                
                {/* Chart Area */}
                <div className="flex-1 p-2 relative min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={activeAsset.change >= 0 ? '#089981' : '#F23645'} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={activeAsset.change >= 0 ? '#089981' : '#F23645'} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2A2E39" vertical={false} />
                      <XAxis dataKey="time" stroke="#787B86" tick={{ fill: '#787B86', fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={30}/>
                      <YAxis domain={['dataMin', 'dataMax']} stroke="#787B86" tick={{ fill: '#787B86', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(val) => val.toFixed(0)}/>
                      <Tooltip contentStyle={{ backgroundColor: '#1E222D', borderColor: '#2A2E39', color: '#D1D4DC' }} itemStyle={{ color: activeAsset.change >= 0 ? '#089981' : '#F23645' }}/>
                      <Area type="monotone" dataKey="price" stroke={activeAsset.change >= 0 ? '#089981' : '#F23645'} strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" isAnimationActive={true}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="w-full lg:w-2/5 xl:w-1/3 flex flex-col gap-3 min-h-[500px] lg:min-h-0">
                
                {/* Terminal Section */}
                <div className="flex-shrink-0 h-48 bg-[#131722] rounded-lg border border-[#2A2E39] flex flex-col overflow-hidden relative font-mono shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                  <div className="bg-[#1E222D] border-b border-[#2A2E39] px-3 py-1.5 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#2962FF]" />
                    <span className="text-[10px] uppercase text-gray-400 tracking-widest">Deep Crawler Subsystem</span>
                  </div>
                  <div className="p-3 flex-1 overflow-y-auto text-xs text-[#089981] space-y-1.5 custom-scrollbar">
                    {crawlerLogs.map((log, idx) => (
                      <div key={idx} className="opacity-90">{log}</div>
                    ))}
                    {isCrawling && (
                      <div className="animate-pulse flex items-center">
                        <span className="mr-2">&gt;</span> <span className="w-2 h-4 bg-[#089981] inline-block"></span>
                      </div>
                    )}
                    <div ref={logsEndRef} />
                  </div>
                </div>

                {/* AI Results Section */}
                <div className="flex-1 bg-[#1E222D] rounded-lg border border-[#2A2E39] flex flex-col overflow-hidden relative">
                  <div className="bg-[#2A2E39]/30 border-b border-[#2A2E39] px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#2962FF]" />
                      <span className="text-xs font-semibold uppercase text-white tracking-wider">AI Insight Engine</span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                    {isCrawling ? (
                      <div className="flex-1 flex flex-col items-center justify-center opacity-60">
                        <Database className="w-10 h-10 mb-3 text-[#2962FF] animate-bounce" />
                        <span className="text-sm">Synthesizing data points...</span>
                      </div>
                    ) : error ? (
                      <div className="p-4 bg-red-900/20 border border-red-500/50 rounded flex flex-col items-center text-center">
                        <AlertTriangle className="w-8 h-8 text-red-500 mb-2" />
                        <span className="text-red-400 text-sm">{error}</span>
                      </div>
                    ) : analysis ? (
                      <div className="animate-fade-in flex flex-col h-full gap-4">
                        
                        {/* Highlighted PREDICTION Section */}
                        <div className={`p-4 rounded-lg border ${getSentimentColors(analysis.sentiment).border} ${getSentimentColors(analysis.sentiment).bg}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-white/70">Prediction</span>
                            <div className={`flex items-center gap-1 font-bold ${getSentimentColors(analysis.sentiment).text}`}>
                              {getSentimentColors(analysis.sentiment).icon}
                              {analysis.sentiment}
                            </div>
                          </div>
                          <p className="text-white font-medium leading-snug">
                            {analysis.prediction}
                          </p>
                        </div>

                        {/* Highlighted REASON Section */}
                        <div className="flex-1 flex flex-col p-4 rounded-lg bg-[#131722] border border-[#2A2E39]">
                          <div className="flex items-center justify-between mb-3 border-b border-[#2A2E39] pb-2">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Deep Analysis Reason</span>
                            
                            {/* Hindi Translation Toggle Button */}
                            <button 
                              onClick={handleTranslate}
                              disabled={isTranslating}
                              className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded transition-colors uppercase tracking-wider
                                ${showHindi 
                                  ? 'bg-[#2962FF] text-white border border-[#2962FF]' 
                                  : 'bg-[#1E222D] text-gray-400 border border-[#2A2E39] hover:bg-[#2A2E39] hover:text-white'
                                }
                                ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                            >
                              <Languages className="w-3.5 h-3.5" />
                              {isTranslating ? 'Translating...' : showHindi ? 'View English' : 'हिंदी अनुवाद'}
                            </button>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto text-sm text-gray-300 leading-relaxed space-y-3 custom-scrollbar">
                            {showHindi && translatedReason ? (
                              <p className="animate-fade-in">{translatedReason}</p>
                            ) : (
                              <p className="animate-fade-in">{analysis.reason}</p>
                            )}
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center opacity-30">
                         <span className="text-sm italic">Waiting for analysis trigger...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Embedded CSS for custom scrollbar, animations, etc. */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2A2E39;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3B4050;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

function AssetListItem({ asset, isActive, isNew, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`
        px-4 py-2 cursor-pointer transition-colors flex items-center justify-between group
        ${isActive ? 'bg-[#2962FF]/10 border-l-2 border-[#2962FF]' : 'border-l-2 border-transparent hover:bg-[#2A2E39]/40'}
      `}
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-semibold text-sm ${isActive ? 'text-[#2962FF]' : 'text-[#D1D4DC] group-hover:text-white'}`}>
            {asset.symbol}
          </span>
          {isNew && <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1 py-0.5 rounded uppercase">New</span>}
        </div>
        <span className="text-xs text-gray-500 truncate max-w-[120px]">{asset.name}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-sm font-mono text-[#D1D4DC]">₹{asset.price.toFixed(0)}</span>
        <span className={`text-xs font-mono ${asset.change >= 0 ? 'text-[#089981]' : 'text-[#F23645]'}`}>
          {asset.change > 0 ? '+' : ''}{asset.change}%
        </span>
      </div>
    </div>
  );
}