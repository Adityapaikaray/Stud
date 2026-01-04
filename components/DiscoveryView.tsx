import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Play, 
  Image as ImageIcon, 
  X, 
  Flame, 
  Layers, 
  Cpu, 
  Palette, 
  Globe, 
  Radio,
  Dna,
  Binary,
  ArrowUpRight
} from 'lucide-react';
import { Post, Reel, User } from '../types';

interface DiscoveryViewProps {
  posts: Post[];
  reels: Reel[];
  onNavigateToProfile: (user: User) => void;
}

const INTEREST_CATEGORIES = [
  { name: "All Signals", icon: Radio },
  { name: "Neural Art", icon: Sparkles },
  { name: "Cyber Tech", icon: Cpu },
  { name: "Logic Nodes", icon: Binary },
  { name: "Biotech", icon: Dna },
  { name: "Architecture", icon: Layers },
  { name: "Digital Canvas", icon: Palette },
  { name: "Global Mesh", icon: Globe },
];

const DiscoveryView: React.FC<DiscoveryViewProps> = ({ posts, reels, onNavigateToProfile }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>("All Signals");

  // Mix and prioritize content based on simulated "interest"
  const discoveryContent = useMemo(() => {
    const all = [...posts, ...reels];
    // Simple mock interest shuffle
    return all.sort((a, b) => {
      const aScore = a.upvotes + (a.isReel ? 500 : 0) + (a.aiBadge ? 1000 : 0);
      const bScore = b.upvotes + (b.isReel ? 500 : 0) + (b.aiBadge ? 1000 : 0);
      return bScore - aScore;
    });
  }, [posts, reels]);

  const filteredContent = useMemo(() => {
    let result = discoveryContent;
    if (searchQuery) {
      result = result.filter(item => 
        item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory !== "All Signals") {
      result = result.filter(item => 
        item.content.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (item.aiBadge && item.aiBadge.label.toLowerCase().includes(selectedCategory.toLowerCase()))
      );
    }
    return result;
  }, [discoveryContent, searchQuery, selectedCategory]);

  return (
    <div className="animate-fluid-in space-y-8 pb-40">
      {/* Immersive Search Header */}
      <div className="sticky top-0 z-50 bg-app-bg/60 backdrop-blur-3xl pt-2 pb-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative group mb-8">
            <div className="absolute -inset-1 merit-gradient opacity-10 blur-2xl group-focus-within:opacity-30 transition-opacity rounded-[2.5rem]" />
            <div className="relative glass rounded-[2.2rem] border-white/10 flex items-center px-8 py-5 shadow-2xl">
              <Search className="text-indigo-400 mr-5" size={24} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Scan the merit mesh for frequencies..." 
                className="bg-transparent border-none focus:ring-0 w-full text-xl font-medium text-app-text placeholder-slate-700"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-all"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Neural Interest Selector */}
          <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar pb-2">
            {INTEREST_CATEGORIES.map(cat => (
              <button 
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex-shrink-0 flex items-center space-x-2.5 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  selectedCategory === cat.name 
                    ? 'merit-gradient text-white border-transparent shadow-lg shadow-indigo-500/20' 
                    : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/10 hover:text-slate-300'
                }`}
              >
                <cat.icon size={14} className={selectedCategory === cat.name ? 'text-white' : 'text-indigo-400/50'} />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-12">
        {/* Trending Pulse Section (Before search filter is applied) */}
        {!searchQuery && selectedCategory === "All Signals" && (
          <div className="space-y-6 animate-fluid-in">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Flame className="text-rose-500 animate-pulse" size={20} />
                    <span className="absolute -top-3 -right-3 text-lg animate-bounce">📈</span>
                  </div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">Trending Magnitude</h3>
               </div>
               <div className="flex items-center space-x-3">
                 <div className="flex -space-x-1.5 overflow-hidden">
                   {[1,2,3].map(i => (
                     <div key={i} className="inline-block h-5 w-5 rounded-full ring-2 ring-app-bg bg-white/10 border border-white/10" />
                   ))}
                 </div>
                 <span className="text-[9px] font-black text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-lg border border-indigo-400/20">High Activity Nodes</span>
               </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reels.slice(0, 2).map(reel => (
                <div 
                  key={reel.id} 
                  className="relative h-80 glass rounded-[2.5rem] overflow-hidden border-white/10 shadow-2xl group cursor-pointer"
                  onClick={() => onNavigateToProfile(reel.author)}
                >
                   <img src={reel.thumbnailUrl} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                   <div className="absolute top-4 left-4">
                      <div className="p-3 bg-indigo-500/20 backdrop-blur-xl border border-white/10 rounded-2xl text-white group-hover:bg-indigo-500 transition-colors">
                        <Play size={18} fill="currentColor" />
                      </div>
                   </div>
                   <div className="absolute top-4 right-4 bg-emerald-500/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center space-x-1.5 group-hover:bg-emerald-500/40 transition-all">
                      <TrendingUp size={12} className="text-emerald-400" />
                      <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Growing</span>
                   </div>
                   <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center space-x-3 mb-3">
                        <img src={reel.author.avatar} className="w-8 h-8 rounded-xl border border-white/20 shadow-lg" />
                        <span className="text-[10px] font-black text-white drop-shadow-md">@{reel.author.username}</span>
                      </div>
                      <p className="text-sm font-bold text-white line-clamp-2 leading-tight drop-shadow-md">
                        {reel.content}
                      </p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discovery Feed Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">
              {searchQuery ? `Signals Matching "${searchQuery}"` : "Personalized Frequency Feed"}
            </h3>
            <div className="flex items-center space-x-2">
              <Zap size={14} className="text-amber-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Discovery</span>
            </div>
          </div>

          <div className="columns-2 md:columns-3 gap-5 space-y-5">
            {filteredContent.length > 0 ? filteredContent.map((item, idx) => (
              <div 
                key={item.id}
                onClick={() => onNavigateToProfile(item.author)}
                className="break-inside-avoid relative glass rounded-[2.2rem] overflow-hidden group cursor-pointer border-white/5 shadow-xl transition-all hover:translate-y-[-8px] hover:shadow-[0_25px_50px_rgba(0,0,0,0.5)]"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Visual Layer */}
                <div className="relative">
                  {item.videoUrl ? (
                    <div className="relative">
                      <img 
                        src={item.thumbnailUrl || 'https://picsum.photos/seed/vid/400/600'} 
                        className="w-full h-auto object-cover min-h-[120px]" 
                        alt="Reel"
                      />
                      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-xl p-2.5 rounded-2xl border border-white/10">
                        <Flame size={14} className="text-rose-500" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <img 
                        src={item.imageUrl || 'https://picsum.photos/seed/post/400/400'} 
                        className="w-full h-auto object-cover min-h-[120px]" 
                        alt="Post"
                      />
                      {item.aiBadge && (
                         <div className="absolute top-4 right-4 bg-indigo-500/30 backdrop-blur-xl p-2.5 rounded-2xl border border-white/10">
                           <Sparkles size={14} className="text-indigo-400" />
                         </div>
                      )}
                    </div>
                  )}
                  
                  {/* Info Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <img src={item.author.avatar} className="w-8 h-8 rounded-xl border border-white/20" alt={item.author.username} />
                      <span className="text-[10px] font-black text-white">@{item.author.username}</span>
                    </div>
                    <p className="text-[11px] text-white/80 line-clamp-3 leading-relaxed tracking-tight">
                      {item.content}
                    </p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-2">
                        <Zap size={12} className="text-amber-400" />
                        <span className="text-[10px] font-black text-white/60">{(item.upvotes + item.views).toLocaleString()}</span>
                      </div>
                      <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest px-2 py-1 bg-white/10 rounded-lg backdrop-blur-md">
                        {item.isReel ? "Visual" : "Signal"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Minimal Footer (Always Visible) */}
                {!item.imageUrl && !item.videoUrl && (
                  <div className="p-6">
                    <p className="text-xs font-medium text-slate-300 line-clamp-3 mb-4">{item.content}</p>
                    <div className="flex items-center space-x-2">
                      <img src={item.author.avatar} className="w-5 h-5 rounded-lg border border-white/10" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">@{item.author.username}</span>
                    </div>
                  </div>
                )}
              </div>
            )) : (
              <div className="col-span-full py-40 flex flex-col items-center justify-center opacity-30 text-center">
                <div className="w-24 h-24 rounded-[2.5rem] merit-gradient animate-pulse flex items-center justify-center mb-8">
                  <Search size={40} className="text-white" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-[0.4em]">Node Not Found</h3>
                <p className="text-sm mt-3 font-medium">No signals matching your current synchronization frequency.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryView;