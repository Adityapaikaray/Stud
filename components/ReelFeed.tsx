
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Heart, 
  HeartCrack, 
  MessageSquare, 
  Share2, 
  Music, 
  UserPlus,
  ArrowDown,
  Sparkles,
  Zap
} from 'lucide-react';
import { Reel, User } from '../types';

interface ReelFeedProps {
  reels: Reel[];
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
}

const ReelFeed: React.FC<ReelFeedProps> = ({ reels, onUpvote, onDownvote }) => {
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Simple "algorithm": Prioritize reels that share badges or merit levels close to liked user content
  // Here we just sort them to ensure a fresh experience
  const suggestedReels = useMemo(() => {
    return [...reels].sort((a, b) => b.author.meritScore - a.author.meritScore);
  }, [reels]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const height = e.currentTarget.clientHeight;
    const index = Math.round(scrollTop / height);
    if (index !== activeReelIndex) {
      setActiveReelIndex(index);
    }
  };

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="h-[calc(100vh-140px)] w-full max-w-lg mx-auto snap-y snap-mandatory overflow-y-auto no-scrollbar rounded-[3rem] border border-white/5 bg-black"
    >
      {suggestedReels.length > 0 ? (
        suggestedReels.map((reel, idx) => (
          <ReelItem 
            key={reel.id} 
            reel={reel} 
            isActive={idx === activeReelIndex}
            onUpvote={onUpvote}
            onDownvote={onDownvote}
          />
        ))
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-slate-500">
          <Zap size={40} className="mb-4 animate-pulse" />
          <p className="font-black uppercase tracking-widest text-xs">Awaiting Video Signals</p>
        </div>
      )}
    </div>
  );
};

interface ReelItemProps {
  reel: Reel;
  isActive: boolean;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
}

const ReelItem: React.FC<ReelItemProps> = ({ reel, isActive, onUpvote, onDownvote }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [voted, setVoted] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch(() => {});
    } else {
      videoRef.current?.pause();
      if (videoRef.current) videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  return (
    <div className="relative h-full w-full snap-start flex flex-col group">
      <video
        ref={videoRef}
        src={reel.videoUrl}
        className="h-full w-full object-cover"
        loop
        muted={!isActive}
        playsInline
      />

      {/* Overlay UI */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-32 flex flex-col items-center space-y-6 pointer-events-auto z-20">
        <div className="flex flex-col items-center">
          <button 
            onClick={() => {
              setVoted(voted === 'up' ? null : 'up');
              onUpvote(reel.id);
            }}
            className={`p-3 rounded-full backdrop-blur-md transition-all active:scale-75 ${voted === 'up' ? 'bg-pink-500 text-white' : 'bg-white/10 text-white'}`}
          >
            <Heart size={28} fill={voted === 'up' ? 'currentColor' : 'none'} />
          </button>
          <span className="text-white text-[10px] font-bold mt-1 shadow-sm">{(reel.upvotes - reel.downvotes).toLocaleString()}</span>
        </div>

        <button 
          onClick={() => {
            setVoted(voted === 'down' ? null : 'down');
            onDownvote(reel.id);
          }}
          className={`p-3 rounded-full backdrop-blur-md transition-all active:scale-75 ${voted === 'down' ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white'}`}
        >
          <HeartCrack size={28} fill={voted === 'down' ? 'currentColor' : 'none'} />
        </button>

        <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white">
          <MessageSquare size={26} />
        </button>

        <button className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white">
          <Share2 size={26} />
        </button>

        <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden animate-spin-slow p-1">
          <img src={reel.author.avatar} className="w-full h-full rounded-full object-cover" />
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-6 left-6 right-16 pointer-events-auto z-20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="relative">
            <img src={reel.author.avatar} className="w-10 h-10 rounded-xl border border-white/20" />
            <div className="absolute -bottom-1 -right-1 bg-indigo-500 p-0.5 rounded-lg border-2 border-black">
              <Zap size={10} className="text-white" />
            </div>
          </div>
          <div>
            <h3 className="text-white font-black text-sm">@{reel.author.username}</h3>
            <div className="flex items-center text-xs text-indigo-400 font-black uppercase tracking-widest">
              <Sparkles size={10} className="mr-1" />
              <span>Signal Node Lv.{Math.floor(reel.author.meritScore / 200) + 1}</span>
            </div>
          </div>
          <button className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-colors">
            Follow
          </button>
        </div>

        <p className="text-white/90 text-sm font-medium leading-relaxed line-clamp-2 mb-4 tracking-tight">
          {reel.content}
        </p>

        <div className="flex items-center space-x-2 text-white/60">
          <Music size={14} className="animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest truncate">Lumina Original Audio • High Signal Frequency</span>
        </div>
      </div>

      {/* AI Quality Indicator */}
      {reel.aiBadge && (
        <div className="absolute top-6 right-6 px-3 py-1 bg-white/10 backdrop-blur-xl border border-white/10 rounded-lg text-[8px] font-black text-white uppercase tracking-widest">
          AI {reel.aiBadge.label} Signal
        </div>
      )}
    </div>
  );
};

export default ReelFeed;
