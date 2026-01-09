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
  Zap,
  Copy,
  Check,
  Play,
  X,
  Repeat
} from 'lucide-react';
import { getPersonalizedStrategy } from '../services/geminiService';

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
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>(post.comments || []);
  
  const [showMusicSuggestions, setShowMusicSuggestions] = useState(false);
  const [suggestedSongs, setSuggestedSongs] = useState<string[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [attachedSong, setAttachedSong] = useState<string | undefined>(post.song);
  
  const menuRef = useRef<HTMLDivElement>(null);
  
  const isAuthor = currentUser?.id === post.author.id;
  const isHighQuality = post.aiBadge?.label.includes('High') || post.author.meritScore > 1000;

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

  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => {
      setLinkCopied(false);
      setShowMenu(false);
    }, 2000);
  };

  const handleFetchMusicSuggestions = async () => {
    setLoadingSongs(true);
    setShowMenu(false);
    setShowMusicSuggestions(true);
    try {
      const strategy = await getPersonalizedStrategy(post.author.username, post.content);
      setSuggestedSongs(strategy.songs || ["Neural Pulse", "Data Stream", "Synth Voyager"]);
    } catch (e) {
      setSuggestedSongs(["Ethereal Drift", "Cyber Pulse", "Neon Horizons"]);
    }
    setLoadingSongs(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Stud Post by @${post.author.username}`,
          text: post.content.substring(0, 100),
          url: `${window.location.origin}/post/${post.id}`,
        });
        setShowMenu(false);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
    if (!isSaved) {
      setShowSavedFeedback(true);
      setTimeout(() => setShowSavedFeedback(false), 2000);
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
    <div className={`glass rounded-[2.5rem] overflow-hidden group relative flex flex-col transition-all duration-700 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] ${isHighQuality ? 'ring-1 ring-white/15' : 'border-white/5'}`}>
      
      {isHighQuality && (
        <div className="absolute -inset-4 merit-gradient opacity-[0.03] blur-3xl pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-1000" />
      )}

      {(post.imageUrl || post.videoUrl) && (
        <div className="relative aspect-video w-full overflow-hidden bg-black/40">
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {post.videoUrl ? (
            <video 
              src={post.videoUrl} 
              className="w-full h-full object-cover max-h-[700px]"
              autoPlay 
              muted 
              loop 
              playsInline 
            />
          ) : (
            <img 
              src={post.imageUrl} 
              alt="Stud Visual" 
              className="w-full h-full object-cover max-h-[700px] transition-transform duration-[2s] group-hover:scale-[1.03]" 
            />
          )}
          
          <div className="absolute top-6 left-6 z-20 flex flex-col space-y-3">
             <div className="flex items-center space-x-3">
                <div 
                  onClick={() => onNavigateToProfile?.(post.author)}
                  className="relative cursor-pointer transition-all hover:scale-110 active:scale-90"
                >
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.username} 
                      className="w-10 h-10 rounded-2xl object-cover ring-2 ring-white/10 shadow-2xl" 
                    />
                    {isHighQuality && (
                      <div className="absolute -bottom-1 -right-1 merit-gradient rounded-lg p-0.5 border border-black shadow-lg">
                        <ShieldCheck className="text-white w-2.5 h-2.5" />
                      </div>
                    )}
                </div>
                <div 
                  onClick={() => onNavigateToProfile?.(post.author)}
                  className="bg-black/40 backdrop-blur-2xl px-4 py-2 rounded-2xl border border-white/10 cursor-pointer hover:bg-black/60 transition-all"
                >
                    <h3 className="font-bold text-white text-xs tracking-tight">@{post.author.username}</h3>
                </div>
             </div>
          </div>

          <div className="absolute bottom-6 left-6 z-20 flex space-x-2">
            {attachedSong && (
              <div className="bg-black/40 backdrop-blur-2xl px-4 py-2 rounded-2xl border border-white/10 flex items-center space-x-2 animate-float">
                <Music size={12} className="text-white shrink-0" />
                <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest whitespace-nowrap max-w-[120px] overflow-hidden">
                  {attachedSong}
                </span>
                {isAuthor && (
                  <button onClick={() => setAttachedSong(undefined)} className="hover:text-red-400 ml-1">
                    <X size={10} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-8 sm:p-10 flex flex-col">
        {/* Interaction Bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleUpvote}
                className={`transition-all active:scale-125 ${voteStatus === 'up' ? 'text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]' : 'text-app-muted hover:text-white'}`}
              >
                <Heart 
                  fill={voteStatus === 'up' ? 'currentColor' : 'none'} 
                  className={`w-6 h-6 ${isHeartPopping ? 'animate-bounce' : ''}`}
                />
              </button>
              <span className={`text-sm font-black tabular-nums ${voteStatus === 'up' ? 'text-white' : 'text-app-muted'}`}>
                {(post.upvotes - post.downvotes + (voteStatus === 'up' ? 1 : voteStatus === 'down' ? -1 : 0)).toLocaleString()}
              </span>
              <button 
                onClick={handleDownvote}
                className={`transition-all active:scale-125 ${voteStatus === 'down' ? 'text-indigo-400' : 'text-app-muted hover:text-white'}`}
              >
                <HeartCrack fill={voteStatus === 'down' ? 'currentColor' : 'none'} className="w-6 h-6" />
              </button>
            </div>
            
            <button 
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center space-x-2 transition-all active:scale-110 ${showComments ? 'text-app-accent' : 'text-app-muted hover:text-white'}`}
            >
              <MessageSquare className="w-6 h-6" />
              <span className="text-sm font-black">{localComments.length}</span>
            </button>

            <button 
              onClick={() => setIsReposted(!isReposted)}
              className={`flex items-center space-x-2 transition-all active:rotate-180 ${isReposted ? 'text-emerald-400' : 'text-app-muted hover:text-white'}`}
            >
              <Repeat className="w-6 h-6" />
              <span className="text-sm font-black">{isReposted ? 1 : 0}</span>
            </button>

            <div className="flex items-center space-x-5 border-l border-white/5 pl-5">
              <button 
                onClick={handleNativeShare}
                className="text-app-muted hover:text-indigo-400 transition-all active:scale-110 group/share relative"
              >
                <Share2 className="w-6 h-6" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg opacity-0 group-hover/share:opacity-100 transition-opacity pointer-events-none border border-white/10 text-white">Broadcast</span>
              </button>

              <button 
                onClick={toggleSave}
                className={`transition-all active:scale-110 group/save relative ${isSaved ? 'text-app-accent drop-shadow-[0_0_8px_rgba(255,0,128,0.4)]' : 'text-app-muted hover:text-white'}`}
              >
                <Bookmark className="w-6 h-6" fill={isSaved ? 'currentColor' : 'none'} />
                {showSavedFeedback && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-app-accent text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg animate-spring border border-white/10 text-white whitespace-nowrap">Saved to Archive</span>
                )}
                {!showSavedFeedback && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg opacity-0 group-hover/save:opacity-100 transition-opacity pointer-events-none border border-white/10 text-white whitespace-nowrap">
                    {isSaved ? 'Archived' : 'Archive'}
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-5">
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="text-app-muted hover:text-white transition-all p-1"
              >
                <MoreVertical className="w-6 h-6" />
              </button>
              {showMenu && (
                <div className="absolute right-0 bottom-full mb-4 w-60 glass rounded-[2rem] border border-white/10 shadow-2xl z-50 overflow-hidden animate-spring p-2">
                   {/* Copy link in menu */}
                   <button 
                    onClick={handleCopyLink}
                    className="w-full px-5 py-4 flex items-center justify-between text-[10px] font-black text-app-text hover:bg-white/10 rounded-2xl transition-all uppercase tracking-widest"
                   >
                     <div className="flex items-center space-x-3">
                       {linkCopied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-slate-400" />}
                       <span>{linkCopied ? 'Link Secured' : 'Clone Freq'}</span>
                     </div>
                   </button>

                   {/* Archive (Download) in Menu */}
                   <button 
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full px-5 py-4 flex items-center space-x-3 text-[10px] font-black text-app-text hover:bg-white/10 rounded-2xl transition-all uppercase tracking-widest"
                   >
                     {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} className="text-app-accent" />}
                     <span>Synthesize local copy</span>
                   </button>
                   
                   {/* Music Suggestion in Menu */}
                   <button 
                    onClick={handleFetchMusicSuggestions}
                    className="w-full px-5 py-4 flex items-center space-x-3 text-[10px] font-black text-app-text hover:bg-white/10 rounded-2xl transition-all uppercase tracking-widest"
                   >
                     <Music size={16} className="text-pink-500" />
                     <span>Suggest Sonic Pair</span>
                   </button>

                   {/* Analytics in Menu (Author only) */}
                   {isAuthor && (
                     <button 
                      onClick={() => { setShowAnalytics(!showAnalytics); setShowMenu(false); }}
                      className="w-full px-5 py-4 flex items-center space-x-3 text-[10px] font-black text-app-text hover:bg-white/10 rounded-2xl transition-all uppercase tracking-widest"
                     >
                       <BarChart2 size={16} className="text-indigo-400" />
                       <span>Pulse Data</span>
                     </button>
                   )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-2">
          <p className={`text-app-text text-[15px] sm:text-[17px] font-medium leading-[1.6] tracking-tight transition-all duration-500 ${isExpanded ? '' : 'line-clamp-3'}`}>
            {post.content}
          </p>
          {post.content.length > 140 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 flex items-center space-x-2 text-[10px] font-black text-app-accent uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
            >
              <span>{isExpanded ? 'Collapse' : 'Decompress Signal'}</span>
              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>

        {showMusicSuggestions && (
          <div className="mt-8 p-6 glass rounded-3xl border border-pink-500/20 animate-spring relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 merit-gradient opacity-10 blur-2xl -mr-12 -mt-12" />
            <div className="flex items-center justify-between mb-4">
               <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-400">Sonic Matches</h4>
               <button onClick={() => setShowMusicSuggestions(false)} className="text-slate-500 hover:text-white">
                 <X size={14} />
               </button>
            </div>
            {loadingSongs ? (
              <div className="flex justify-center py-4"><Loader2 size={24} className="animate-spin text-pink-500" /></div>
            ) : (
              <div className="space-y-2">
                {suggestedSongs.map((song, i) => (
                  <button 
                    key={i}
                    onClick={() => { setAttachedSong(song); setShowMusicSuggestions(false); }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-pink-500/30 hover:bg-pink-500/5 transition-all group/song"
                  >
                    <div className="flex items-center space-x-4">
                       <Play size={10} fill="currentColor" className="text-pink-400" />
                       <span className="text-xs font-bold text-slate-200">{song}</span>
                    </div>
                    {isAuthor && <span className="text-[8px] font-black uppercase text-pink-500 opacity-0 group-hover/song:opacity-100 transition-opacity">Select</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {!showComments && !showMusicSuggestions && post.aiBadge && (
          <div className="mt-8 flex items-center space-x-3 p-4 rounded-3xl bg-white/[0.02] border border-white/5 group-hover:border-white/10 transition-colors">
             <div className="p-2 bg-indigo-500/10 rounded-xl">
               <Sparkles className="text-indigo-400 animate-pulse w-4 h-4" />
             </div>
             <div>
               <p className="text-[10px] text-app-text font-black tracking-widest uppercase">
                 {post.aiBadge.label}
               </p>
               <p className="text-[9px] text-app-muted font-medium mt-0.5">{post.aiBadge.description}</p>
             </div>
          </div>
        )}

        {showComments && (
          <div className="mt-10 pt-10 border-t border-white/5 animate-spring">
            <div className="flex items-center space-x-4 mb-8 bg-white/[0.02] rounded-[2rem] p-2 border border-white/5">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share perspective..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-app-text px-4 placeholder-app-muted"
                onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
              />
              <button 
                onClick={handlePostComment}
                className="p-3.5 merit-gradient text-white rounded-2xl shadow-xl hover:scale-105 active:scale-90 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6 max-h-[350px] overflow-y-auto no-scrollbar pr-2">
              {localComments.length > 0 ? localComments.map((comment) => (
                <div key={comment.id} className="flex space-x-4 animate-spring">
                  <img 
                    onClick={() => onNavigateToProfile?.(comment.author)}
                    src={comment.author.avatar} 
                    className="w-10 h-10 rounded-2xl object-cover border border-white/10 cursor-pointer hover:scale-110 transition-transform" 
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span 
                        onClick={() => onNavigateToProfile?.(comment.author)}
                        className="text-[11px] font-black text-indigo-400 cursor-pointer hover:text-white transition-colors"
                      >
                        @{comment.author.username}
                      </span>
                    </div>
                    <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                      <p className="text-sm text-app-text leading-relaxed">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center opacity-30">
                  <p className="text-[10px] font-black uppercase tracking-widest">Awaiting interaction</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showAnalytics && isAuthor && (
        <div className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-3xl p-10 flex flex-col animate-spring">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h4 className="text-xl font-black tracking-tight flex items-center space-x-3">
                <Zap size={24} className="text-app-accent animate-pulse" />
                <span>Signal Analytics</span>
              </h4>
              <p className="text-[10px] text-app-muted font-black uppercase tracking-[0.3em] mt-1">Real-time Node Propagation</p>
            </div>
            <button 
              onClick={() => setShowAnalytics(false)} 
              className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all"
            >
              <ChevronDown size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="glass p-6 rounded-3xl border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Impressions</p>
              <div className="flex items-center space-x-3">
                <Eye size={20} className="text-indigo-400" />
                <span className="text-2xl font-black">{(post.views || 1242).toLocaleString()}</span>
              </div>
            </div>
            <div className="glass p-6 rounded-3xl border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Merit Velocity</p>
              <div className="flex items-center space-x-3">
                <TrendingIcon size={20} className="text-emerald-400" />
                <span className="text-2xl font-black">+{post.upvotes}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;