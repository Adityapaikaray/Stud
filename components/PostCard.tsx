
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Post, Comment, User } from '../types';
import { 
  Heart, 
  HeartCrack,
  MessageSquare, 
  Share2, 
  Bookmark,
  Sparkles,
  ShieldCheck,
  TrendingUp as TrendingIcon,
  Download,
  Send,
  ChevronDown,
  ChevronUp,
  Loader2,
  MoreVertical,
  Music,
  BarChart2,
  Eye,
  Zap
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  currentUser?: User;
  onNavigateToProfile?: (user: User) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpvote, onDownvote, currentUser, onNavigateToProfile }) => {
  const [voteStatus, setVoteStatus] = useState<'up' | 'down' | null>(null);
  const [isHeartPopping, setIsHeartPopping] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>(post.comments || []);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const isAuthor = currentUser?.id === post.author.id;
  const isHighQuality = post.aiBadge?.label.includes('Signal');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpvote = useCallback(() => {
    if (voteStatus === 'up') {
      setVoteStatus(null);
    } else {
      setVoteStatus('up');
      setIsHeartPopping(true);
      setTimeout(() => setIsHeartPopping(false), 300);
      onUpvote(post.id);
    }
  }, [voteStatus, post.id, onUpvote]);

  const handleDownvote = useCallback(() => {
    if (voteStatus === 'down') {
      setVoteStatus(null);
    } else {
      setVoteStatus('down');
      onDownvote(post.id);
    }
  }, [voteStatus, post.id, onDownvote]);

  const handlePostComment = () => {
    if (!commentText.trim() || !currentUser) return;
    const newComment: Comment = {
      id: Math.random().toString(36).substring(7),
      author: currentUser,
      content: commentText,
      timestamp: new Date()
    };
    setLocalComments(prev => [newComment, ...prev]);
    setCommentText('');
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleProfileClick = () => {
    if (onNavigateToProfile) {
      onNavigateToProfile(post.author);
    }
  };

  const handleDownload = async () => {
    const url = post.imageUrl || post.videoUrl;
    if (!url) return;
    
    setIsDownloading(true);
    setShowMenu(false);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `stud-${post.author.username}-${post.id}.${post.videoUrl ? 'mp4' : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      window.open(url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`glass rounded-[2rem] sm:rounded-[2.8rem] overflow-hidden group relative flex flex-col hover-lift border-white/5 ${isHighQuality ? 'ring-1 ring-white/10' : ''}`}>
      {/* Media Content */}
      {(post.imageUrl || post.videoUrl) && (
        <div className="relative aspect-video sm:aspect-auto w-full overflow-hidden bg-black/20">
          {post.videoUrl ? (
            <video 
              src={post.videoUrl} 
              className="w-full h-full object-cover max-h-[640px]"
              autoPlay 
              muted 
              loop 
              playsInline 
            />
          ) : (
            <img 
              src={post.imageUrl} 
              alt="Stud Visual" 
              className="w-full h-full object-cover max-h-[640px] hover:scale-105 transition-transform duration-[1.5s]" 
            />
          )}
          
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex flex-col space-y-3">
             <div className="flex items-center space-x-3">
                <div 
                  onClick={handleProfileClick}
                  className="relative cursor-pointer transition-transform duration-500 hover:scale-110"
                >
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.username} 
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover border border-white/20 shadow-2xl" 
                    />
                    <div className="absolute -bottom-1 -right-1 merit-gradient rounded-lg p-0.5 border border-black shadow-lg">
                        <ShieldCheck className="text-white w-2 h-2 sm:w-2.5 sm:h-2.5" />
                    </div>
                </div>
                <div 
                  onClick={handleProfileClick}
                  className="bg-black/30 backdrop-blur-xl px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-white/10 cursor-pointer hover:bg-black/50 transition-colors"
                >
                    <h3 className="font-black text-white text-[10px] sm:text-[12px] tracking-tight">@{post.author.username}</h3>
                </div>
             </div>
             
             {post.song && (
                <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center space-x-2 w-fit max-w-[160px] overflow-hidden group/song">
                   <Music size={12} className="text-white animate-pulse shrink-0" />
                   <span className="text-[9px] font-black text-white/90 uppercase tracking-widest whitespace-nowrap overflow-hidden">
                     <span className="inline-block animate-marquee">{post.song}</span>
                   </span>
                </div>
             )}
          </div>

          {isAuthor && (
            <button 
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="absolute bottom-4 right-4 z-20 p-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl text-white hover:bg-indigo-500 transition-all active:scale-90 flex items-center space-x-2"
            >
              <BarChart2 size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest">Pulse</span>
            </button>
          )}
        </div>
      )}

      {/* Analytics Overlay */}
      {showAnalytics && isAuthor && (
        <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-2xl p-8 flex flex-col animate-in fade-in zoom-in-95 duration-300">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-app-accent flex items-center space-x-2">
              <Zap size={14} className="animate-pulse" />
              <span>Real-time Signal Analysis</span>
            </h4>
            <button onClick={() => setShowAnalytics(false)} className="text-slate-400 hover:text-white transition-colors">
              <ChevronDown size={24} />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="glass p-5 rounded-2xl border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Signal Views</p>
                <div className="flex items-center space-x-2">
                  <Eye size={14} className="text-indigo-400" />
                  <span className="text-xl font-black">{post.views?.toLocaleString() || '1,242'}</span>
                </div>
              </div>
              <div className="glass p-5 rounded-2xl border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Merit Boosts</p>
                <div className="flex items-center space-x-2">
                  <TrendingIcon size={14} className="text-emerald-400" />
                  <span className="text-xl font-black">{post.upvotes}</span>
                </div>
              </div>
            </div>

            <div className="relative h-40 w-full glass rounded-2xl border-white/5 p-4 overflow-hidden">
              <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" />
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path 
                  d="M0,35 Q10,10 20,30 T40,15 T60,25 T80,5 T100,20" 
                  fill="none" 
                  stroke="url(#gradient-pulse)" 
                  strokeWidth="2"
                  className="animate-dash"
                  strokeDasharray="200"
                  strokeDashoffset="200"
                />
                <defs>
                  <linearGradient id="gradient-pulse" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ff0080" />
                    <stop offset="100%" stopColor="#00dfd8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute bottom-2 left-4 text-[8px] font-black text-slate-600 uppercase tracking-widest">
                Last 24h Signal Propagation
              </div>
            </div>
          </div>
          
          <p className="mt-8 text-[9px] text-center text-slate-500 font-black uppercase tracking-widest">
            Data recalibrated every 5ms • High Fidelity Stream
          </p>
        </div>
      )}

      {/* Interactions & Text */}
      <div className="p-5 sm:p-10 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 sm:space-x-5">
            <div className="flex items-center bg-white/5 rounded-2xl p-1 sm:p-1.5 border border-white/5 shadow-inner backdrop-blur-md">
              <button 
                onClick={handleUpvote}
                className={`p-2 sm:p-3 rounded-xl transition-all btn-active ${voteStatus === 'up' ? 'text-white merit-gradient shadow-lg' : 'text-app-muted hover:text-white'}`}
              >
                <Heart 
                  fill={voteStatus === 'up' ? 'currentColor' : 'none'} 
                  className={`transition-transform duration-300 w-5 h-5 sm:w-6 sm:h-6 ${isHeartPopping ? 'scale-150' : 'scale-100'}`}
                />
              </button>
              <div className="px-2 sm:px-4">
                <span className="text-xs sm:text-sm font-black text-app-text tabular-nums">
                  {(post.upvotes - post.downvotes + (voteStatus === 'up' ? 1 : voteStatus === 'down' ? -1 : 0)).toLocaleString()}
                </span>
              </div>
              <button 
                onClick={handleDownvote}
                className={`p-2 sm:p-3 rounded-xl transition-all btn-active ${voteStatus === 'down' ? 'text-white bg-white/10 shadow-lg' : 'text-app-muted hover:text-white'}`}
              >
                <HeartCrack fill={voteStatus === 'down' ? 'currentColor' : 'none'} className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            
            <button 
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center space-x-2 px-4 py-2.5 sm:px-6 sm:py-4 rounded-2xl transition-all btn-active border ${showComments ? 'merit-gradient text-white border-transparent' : 'bg-white/5 text-app-muted border-white/5'}`}
            >
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[10px] sm:text-xs font-black">{localComments.length}</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button className="p-2 sm:p-3 rounded-xl bg-white/5 text-app-muted hover:text-white transition-all border border-white/5 btn-active">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button 
              onClick={handleSave}
              className={`p-2 sm:p-3 rounded-xl transition-all border btn-active ${isSaved ? 'bg-app-accent/20 text-app-accent border-app-accent/30' : 'bg-white/5 text-app-muted border-white/5 hover:text-white'}`}
              title={isSaved ? "Saved to your network" : "Save to network"}
            >
              <Bookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 sm:p-3 rounded-xl bg-white/5 text-app-muted hover:text-white transition-all border border-white/5 btn-active"
              >
                <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 bottom-full mb-4 w-40 sm:w-48 glass rounded-2xl border border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                   <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full px-4 py-3 sm:px-5 sm:py-4 flex items-center space-x-3 text-[10px] sm:text-xs font-black text-app-text hover:bg-white/10 transition-colors uppercase tracking-[0.1em]"
                   >
                     {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} className="text-app-accent" />}
                     <span>Download</span>
                   </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Caption with Toggle Logic */}
        <div className="px-1 sm:px-2">
          <p className={`text-app-text text-[14px] sm:text-[16px] font-medium leading-relaxed tracking-tight transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
            {post.content}
          </p>
          {post.content.length > 100 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 sm:mt-4 flex items-center space-x-1.5 text-[10px] sm:text-[11px] font-black text-app-accent uppercase tracking-[0.15em] hover:opacity-70 transition-opacity active:scale-95"
            >
              <span>{isExpanded ? 'Show Less' : 'Read More'}</span>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>

        {/* AI Badge */}
        {!showComments && (
          <div className={`mt-6 sm:mt-10 flex items-center space-x-3 p-3 sm:p-4 rounded-2xl ${isHighQuality ? 'bg-white/5 border-white/10 border' : 'bg-white/5'}`}>
             <Sparkles className="text-app-accent animate-pulse w-3.5 h-3.5 sm:w-4 sm:h-4" />
             <p className="text-[9px] sm:text-[10px] text-app-muted font-black tracking-[0.2em] uppercase">
               {post.aiBadge?.label || 'Calibrating merit...'}
             </p>
          </div>
        )}

        {/* Comments Section */}
        {showComments && (
          <div className="mt-8 sm:mt-10 border-t border-white/5 pt-6 sm:pt-8 animate-fluid-in">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8 bg-white/5 rounded-3xl p-1.5 sm:p-2 border border-white/5">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share perspective..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-xs sm:text-sm font-medium text-app-text px-3 sm:px-4 placeholder-app-muted"
                onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
              />
              <button 
                onClick={handlePostComment}
                className="p-2.5 sm:p-3.5 merit-gradient text-white rounded-2xl shadow-lg btn-active"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <div className="space-y-4 sm:space-y-6 max-h-[280px] sm:max-h-[320px] overflow-y-auto no-scrollbar pr-2">
              {localComments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 sm:space-x-4 animate-fluid-in">
                  <img 
                    onClick={() => onNavigateToProfile?.(comment.author)}
                    src={comment.author.avatar} 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl object-cover border border-white/5 cursor-pointer" 
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <span 
                        onClick={() => onNavigateToProfile?.(comment.author)}
                        className="text-[10px] sm:text-xs font-black text-app-accent cursor-pointer"
                      >
                        @{comment.author.username}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-app-text leading-relaxed bg-white/5 p-3 sm:p-4 rounded-2xl border border-white/5">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 8s linear infinite;
        }
        @keyframes dash {
          to { strokeDashoffset: 0; }
        }
        .animate-dash {
          animation: dash 3s ease-in-out forwards infinite alternate;
        }
      `}</style>
    </div>
  );
};

export default PostCard;
