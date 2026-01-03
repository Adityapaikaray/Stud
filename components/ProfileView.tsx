import React, { useState, useMemo, useEffect } from 'react';
import { User, Post } from '../types';
import PostCard from './PostCard';
import { getPersonalizedStrategy } from '../services/geminiService';
import { 
  Award, 
  Zap, 
  ShieldCheck, 
  Grid, 
  List, 
  Settings, 
  Share2, 
  TrendingUp,
  Sparkles,
  Hexagon,
  Users,
  UserPlus,
  BarChart3,
  LineChart,
  PieChart,
  Target,
  Music,
  Lightbulb,
  ArrowUpRight,
  Loader2,
  FileJson,
  Download,
  Play,
  Activity,
  Waves,
  UserCheck,
  Eye,
  ArrowUp,
  BarChart2,
  Repeat
} from 'lucide-react';

interface ProfileViewProps {
  user: User;
  currentUser: User;
  posts: Post[];
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onOpenIdentityEdit?: () => void;
  // Added onNavigateToProfile prop to allow navigation from post cards within profile view
  onNavigateToProfile?: (user: User) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, currentUser, posts, onUpvote, onDownvote, onOpenIdentityEdit, onNavigateToProfile }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'reposts' | 'analytics'>('content');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [strategy, setStrategy] = useState<{ ideas: string[], songs: string[] } | null>(null);
  const [loadingStrategy, setLoadingStrategy] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [chartData, setChartData] = useState<number[]>(Array.from({length: 20}, () => Math.random() * 40 + 10));
  
  const isOwnProfile = user.id === currentUser.id;

  const userPosts = useMemo(() => {
    return posts.filter(p => p.author.id === user.id).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [posts, user.id]);

  // Mock reposts for demonstration: showing posts from other authors as if the user reposted them
  const repostedPosts = useMemo(() => {
    return posts.filter(p => p.author.id !== user.id).slice(0, 3);
  }, [posts, user.id]);

  useEffect(() => {
    if (activeTab === 'analytics' && !strategy && isOwnProfile) {
      loadStrategy();
    }
  }, [activeTab, isOwnProfile]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      const interval = setInterval(() => {
        setChartData(prev => [...prev.slice(1), Math.random() * 40 + 10]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  const loadStrategy = async () => {
    setLoadingStrategy(true);
    const contentSum = userPosts.slice(0, 3).map(p => p.content).join(" ");
    const res = await getPersonalizedStrategy(user.username, contentSum);
    setStrategy(res);
    setLoadingStrategy(false);
  };

  const handleExportData = () => {
    setIsExporting(true);
    const exportData = {
      profile: user,
      activity: {
        totalPosts: userPosts.length,
        posts: userPosts.map(p => ({
          id: p.id,
          content: p.content,
          timestamp: p.timestamp,
          upvotes: p.upvotes,
          meritBadge: p.aiBadge?.label
        }))
      },
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stud-signal-report-${user.username}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setTimeout(() => setIsExporting(false), 1000);
  };

  const meritTier = Math.floor(user.meritScore / 100) + 1;
  const totalInteractions = userPosts.reduce((acc, p) => acc + p.upvotes + p.comments.length, 0);
  const totalViews = userPosts.reduce((acc, p) => acc + (p.views || Math.floor(Math.random() * 1000 + 500)), 0);

  const generatePath = (data: number[]) => {
    const width = 100;
    const height = 40;
    const step = width / (data.length - 1);
    return data.map((val, i) => `${i === 0 ? 'M' : 'L'}${i * step},${height - val}`).join(' ');
  };

  return (
    <div className="animate-fluid-in space-y-12 pb-32">
      {/* Profile Header */}
      <div className="glass rounded-[3rem] p-10 relative overflow-hidden border-white/5 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-32 merit-gradient opacity-10" />
        <div className="relative flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-10">
          <div className="relative">
            <div className="w-32 h-32 rounded-[2.5rem] p-1 merit-gradient shadow-2xl">
              <img src={user.avatar} className="w-full h-full rounded-[2.2rem] object-cover border-4 border-[var(--app-bg)]" alt={user.username} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-indigo-500 p-2.5 rounded-2xl border-4 border-[var(--app-bg)] shadow-xl"><Hexagon size={20} className="text-white fill-current" /></div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-4xl font-black tracking-tighter">@{user.username}</h2>
                <div className="flex items-center justify-center md:justify-start space-x-3 mt-2">
                  <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Node Synchronizer Lv.{meritTier}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">{userPosts.length} Transmissions</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-6 md:mt-0">
                {isOwnProfile ? (
                  <>
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-all border border-white/5"><Settings size={20} /></button>
                    <button 
                      onClick={onOpenIdentityEdit}
                      className="px-6 py-3 merit-gradient text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all"
                    >
                      Edit Identity
                    </button>
                  </>
                ) : (
                  <>
                    <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-all border border-white/5"><Share2 size={20} /></button>
                    <button 
                      onClick={() => setIsFollowed(!isFollowed)}
                      className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all flex items-center space-x-2 ${isFollowed ? 'bg-white/10 text-emerald-400' : 'merit-gradient text-white'}`}
                    >
                      {isFollowed ? <UserCheck size={16} /> : <UserPlus size={16} />}
                      <span>{isFollowed ? 'Synchronized' : 'Synchronize'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center space-x-4 md:space-x-8 overflow-x-auto no-scrollbar px-4">
        <button 
          onClick={() => setActiveTab('content')}
          className={`flex-shrink-0 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all ${activeTab === 'content' ? 'bg-indigo-500 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Transmissions
        </button>
        <button 
          onClick={() => setActiveTab('reposts')}
          className={`flex-shrink-0 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center space-x-2 ${activeTab === 'reposts' ? 'bg-emerald-500 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Repeat size={14} className={activeTab === 'reposts' ? 'text-white' : 'text-slate-500'} />
          <span>Reposts</span>
        </button>
        {isOwnProfile && (
            <button 
                onClick={() => setActiveTab('analytics')}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all ${activeTab === 'analytics' ? 'bg-amber-500 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Analytics
            </button>
        )}
      </div>

      {activeTab === 'content' || activeTab === 'reposts' ? (
        <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">
              {activeTab === 'content' ? 'Broadcasting Logs' : 'Echoed Frequencies'}
            </h3>
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}><Grid size={18} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}><List size={18} /></button>
            </div>
          </div>

          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 gap-6' : 'grid-cols-1 gap-8'}`}>
            {(activeTab === 'content' ? userPosts : repostedPosts).length > 0 ? (
                (activeTab === 'content' ? userPosts : repostedPosts).map(post => (
                    viewMode === 'grid' ? (
                        <div key={post.id} className="aspect-square glass rounded-[2rem] overflow-hidden group cursor-pointer border-white/5 shadow-lg relative">
                        {post.imageUrl || post.videoUrl ? (
                            <img src={post.imageUrl || 'https://picsum.photos/400/400'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                            <div className="p-6 h-full flex flex-col justify-between"><p className="text-xs font-medium text-slate-300 line-clamp-4">{post.content}</p><Sparkles size={16} className="text-indigo-500" /></div>
                        )}
                        {activeTab === 'reposts' && (
                          <div className="absolute top-3 left-3 bg-emerald-500/80 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
                            <Repeat size={12} className="text-white" />
                          </div>
                        )}
                        </div>
                    ) : (
                        <div key={post.id} className="relative">
                          {activeTab === 'reposts' && (
                            <div className="mb-4 ml-10 flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 opacity-60">
                              <Repeat size={14} />
                              <span>Echoed by @{user.username}</span>
                            </div>
                          )}
                          {/* Fixed: Pass onNavigateToProfile destructured from props */}
                          <PostCard post={post} onUpvote={onUpvote} onDownvote={onDownvote} currentUser={currentUser} onNavigateToProfile={onNavigateToProfile} />
                        </div>
                    )
                ))
            ) : (
                <div className="col-span-full py-20 flex flex-col items-center opacity-30">
                    <Zap size={40} className="mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">
                      {activeTab === 'content' ? 'No Transmissions Logged' : 'No Echoed Signals'}
                    </p>
                </div>
            )}
          </div>
        </div>
      ) : (
        isOwnProfile && (
            <div className="space-y-10 animate-fluid-in">
              <div className="glass rounded-[3rem] p-10 border-indigo-500/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 merit-gradient opacity-10 blur-[100px] -mr-32 -mt-32" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 space-y-6 md:space-y-0">
                   <div className="flex items-center space-x-4">
                      <div className="p-4 bg-indigo-500/10 rounded-3xl border border-indigo-500/20">
                        <Activity className="text-indigo-400 animate-pulse" size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black tracking-tight">Real-time Signal Flow</h3>
                        <p className="text-[10px] text-app-muted font-black uppercase tracking-widest mt-1">Live Feed Intensity • Level 4 Synchronization</p>
                      </div>
                   </div>
                   <div className="flex items-center space-x-3 bg-white/5 p-2 rounded-2xl border border-white/5">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest">System Active</span>
                   </div>
                </div>

                <div className="h-64 relative glass rounded-[2.5rem] border-white/5 p-6 overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <path 
                      d={generatePath(chartData)} 
                      fill="none" 
                      stroke="url(#graph-gradient)" 
                      strokeWidth="1.5"
                      className="transition-all duration-1000 ease-in-out"
                    />
                    <defs>
                      <linearGradient id="graph-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ff0080" />
                        <stop offset="100%" stopColor="#00dfd8" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-x-0 bottom-4 px-8 flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
                    <span>-24h Epoch</span>
                    <span>Current Signal</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                   {[
                     { label: 'Live Impressions', value: totalViews, icon: Eye, color: 'text-indigo-400' },
                     { label: 'Signal Magnitude', value: totalInteractions, icon: Zap, color: 'text-amber-400' },
                     { label: 'Network Spread', value: '84.2%', icon: Waves, color: 'text-pink-400' },
                     { label: 'Merit Gain', value: '+124', icon: ArrowUp, color: 'text-emerald-400' },
                   ].map((stat, i) => (
                     <div key={i} className="glass p-6 rounded-2xl border-white/5 hover:border-white/10 transition-all group">
                        <stat.icon size={18} className={`${stat.color} mb-4 group-hover:scale-125 transition-transform`} />
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                        <p className="text-xl font-black">{stat.value.toLocaleString()}</p>
                     </div>
                   ))}
                </div>
              </div>

            <div className="space-y-8">
                <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                    <Sparkles size={18} />
                    </div>
                    <div>
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-app-text">Neural Strategy Forecast</h3>
                    <p className="text-[10px] text-app-muted font-bold uppercase tracking-widest mt-0.5">Gemini Powered Insights</p>
                    </div>
                </div>
                {loadingStrategy && <Loader2 size={20} className="animate-spin text-app-accent" />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass rounded-[2.5rem] p-8 space-y-6 border-white/5 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 merit-gradient opacity-5 blur-3xl -mr-16 -mt-16 group-hover:opacity-10 transition-opacity" />
                    <div className="flex items-center space-x-3">
                    <Music size={20} className="text-pink-500" />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-app-text">Sonic Frequencies</h4>
                    </div>

                    <div className="space-y-4">
                    {loadingStrategy ? (
                        [1, 2, 3].map(i => <div key={i} className="h-16 w-full bg-white/5 rounded-2xl animate-pulse" />)
                    ) : strategy?.songs.map((song, i) => (
                        <div 
                        key={i} 
                        className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-pink-500/30 hover:bg-white/10 transition-all group/song"
                        >
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 relative overflow-hidden">
                            <Play size={14} fill="currentColor" />
                            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent animate-pulse" />
                            </div>
                            <div>
                            <p className="text-xs font-black text-app-text tracking-tight">{song}</p>
                            <p className="text-[9px] text-app-muted font-bold uppercase tracking-widest mt-1">Trending Magnitude: High</p>
                            </div>
                        </div>
                        <button className="p-2 text-app-muted hover:text-pink-500 transition-colors opacity-0 group-hover/song:opacity-100 transform translate-x-4 group-hover/song:translate-x-0 transition-all duration-300">
                            <ArrowUpRight size={16} />
                        </button>
                        </div>
                    ))}
                    </div>
                </div>

                <div className="glass rounded-[2.5rem] p-8 space-y-6 border-white/5 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 opacity-5 blur-3xl -mr-16 -mt-16 group-hover:opacity-10 transition-opacity" />
                    <div className="flex items-center space-x-3">
                    <Activity size={20} className="text-indigo-400" />
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-app-text">Content Vectors</h4>
                    </div>

                    <div className="space-y-4">
                    {loadingStrategy ? (
                        [1, 2, 3].map(i => <div key={i} className="h-20 w-full bg-white/5 rounded-2xl animate-pulse" />)
                    ) : strategy?.ideas.map((idea, i) => (
                        <div 
                        key={i} 
                        className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 hover:border-indigo-500/30 hover:bg-indigo-500/10 transition-all group/idea"
                        >
                        <div className="flex items-start justify-between">
                            <div className="space-y-3 flex-1">
                            <p className="text-xs font-medium text-app-text leading-relaxed tracking-tight">{idea}</p>
                            <div className="flex items-center space-x-2">
                                <span className="text-[8px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md uppercase tracking-widest">Merit Suggestion</span>
                                <span className="text-[8px] font-black text-app-muted uppercase tracking-widest">Level 4 Node</span>
                            </div>
                            </div>
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 opacity-0 group-hover/idea:opacity-100 transition-opacity">
                            <Target size={14} />
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>
                </div>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border-amber-500/20 bg-amber-500/5 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 shadow-2xl">
                <div className="flex items-center space-x-5">
                    <div className="p-4 bg-amber-500/10 rounded-3xl text-amber-500">
                    <FileJson size={32} />
                    </div>
                    <div>
                    <h4 className="text-lg font-black tracking-tight text-app-text">Merit Signal Report</h4>
                    <p className="text-xs text-app-muted">Download your network frequency and activity logs as JSON.</p>
                    </div>
                </div>
                <button 
                    onClick={handleExportData}
                    disabled={isExporting}
                    className="px-8 py-4 merit-gradient text-white rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all btn-active flex items-center space-x-3 disabled:opacity-50"
                >
                    {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    <span>{isExporting ? 'Synthesizing...' : 'Download Report'}</span>
                </button>
            </div>
            </div>
        )
      )}
    </div>
  );
};

export default ProfileView;