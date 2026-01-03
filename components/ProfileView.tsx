
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
  Download
} from 'lucide-react';

interface ProfileViewProps {
  user: User;
  posts: Post[];
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
}

const SUGGESTED_FRIENDS = [
  { id: 's1', username: 'neuro_sculptor', avatar: 'https://picsum.photos/seed/neuro/100/100', mutuals: 12, merit: 1420 },
  { id: 's2', username: 'eco_architect', avatar: 'https://picsum.photos/seed/eco/100/100', mutuals: 8, merit: 980 },
  { id: 's3', username: 'cipher_punk', avatar: 'https://picsum.photos/seed/cipher/100/100', mutuals: 24, merit: 2100 },
];

const ProfileView: React.FC<ProfileViewProps> = ({ user, posts, onUpvote, onDownvote }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'analytics'>('content');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [strategy, setStrategy] = useState<{ ideas: string[], songs: string[] } | null>(null);
  const [loadingStrategy, setLoadingStrategy] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const userPosts = useMemo(() => {
    return posts.filter(p => p.author.id === user.id).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [posts, user.id]);

  useEffect(() => {
    if (activeTab === 'analytics' && !strategy) {
      loadStrategy();
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
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">{userPosts.length} Broadcats</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 mt-6 md:mt-0">
                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-all border border-white/5"><Settings size={20} /></button>
                <button className="px-6 py-3 merit-gradient text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl transition-all">Edit Identity</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center space-x-8">
        <button 
          onClick={() => setActiveTab('content')}
          className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all ${activeTab === 'content' ? 'bg-indigo-500 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Transmissions
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] transition-all ${activeTab === 'analytics' ? 'bg-amber-500 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Strategic Insights
        </button>
      </div>

      {activeTab === 'content' ? (
        <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500">Broadcasting Logs</h3>
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}><Grid size={18} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-indigo-500 text-white' : 'text-slate-500'}`}><List size={18} /></button>
            </div>
          </div>

          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 gap-6' : 'grid-cols-1 gap-8'}`}>
            {userPosts.map(post => (
              viewMode === 'grid' ? (
                <div key={post.id} className="aspect-square glass rounded-[2rem] overflow-hidden group cursor-pointer border-white/5 shadow-lg relative">
                  {post.imageUrl || post.videoUrl ? (
                    <img src={post.imageUrl || 'https://picsum.photos/400/400'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="p-6 h-full flex flex-col justify-between"><p className="text-xs font-medium text-slate-300 line-clamp-4">{post.content}</p><Sparkles size={16} className="text-indigo-500" /></div>
                  )}
                </div>
              ) : (
                <PostCard key={post.id} post={post} onUpvote={onUpvote} onDownvote={onDownvote} currentUser={user} />
              )
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-fluid-in">
          {/* Downloadable Report Action */}
          <div className="glass p-8 rounded-[2.5rem] border-amber-500/20 bg-amber-500/5 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 shadow-2xl">
             <div className="flex items-center space-x-5">
                <div className="p-4 bg-amber-500/10 rounded-3xl text-amber-500">
                   <FileJson size={32} />
                </div>
                <div>
                   <h4 className="text-lg font-black tracking-tight">Merit Signal Report</h4>
                   <p className="text-xs text-slate-500">Download your network frequency and activity logs as JSON.</p>
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

          {/* Real Analytics Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
              <div className="absolute -bottom-4 -right-4 text-indigo-500/10 group-hover:scale-125 transition-transform duration-1000"><BarChart3 size={120} /></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Network Reach</p>
              <h4 className="text-4xl font-black">1.2k</h4>
              <p className="text-[10px] text-slate-500 mt-2 flex items-center"><ArrowUpRight size={12} className="text-emerald-500 mr-1" /> +14% from last epoch</p>
            </div>
            
            <div className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
              <div className="absolute -bottom-4 -right-4 text-emerald-500/10 group-hover:scale-125 transition-transform duration-1000"><LineChart size={120} /></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Signal Interactions</p>
              <h4 className="text-4xl font-black">{totalInteractions}</h4>
              <p className="text-[10px] text-slate-500 mt-2 flex items-center"><ArrowUpRight size={12} className="text-emerald-500 mr-1" /> High Signal Quality</p>
            </div>

            <div className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
              <div className="absolute -bottom-4 -right-4 text-amber-500/10 group-hover:scale-125 transition-transform duration-1000"><Users size={120} /></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-2">Synchronized Nodes</p>
              <h4 className="text-4xl font-black">{user.followersCount || 428}</h4>
              <p className="text-[10px] text-slate-500 mt-2 flex items-center"><ArrowUpRight size={12} className="text-emerald-500 mr-1" /> Active connections</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
