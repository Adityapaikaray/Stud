
import React, { useState, useEffect, useMemo, useCallback, Fragment, useRef } from 'react';
import { 
  Compass, 
  Sparkles, 
  Bell, 
  User as UserIcon, 
  Search,
  Zap,
  Flame,
  Star,
  Moon,
  Sun,
  Clapperboard,
  Plus,
  MessageCircle,
  LayoutGrid,
  Download,
  Orbit,
  Play
} from 'lucide-react';
import { Post, User, FeedType, Notification, Reel, Story } from './types';
import PostCard from './components/PostCard';
import NotificationPanel from './components/NotificationPanel';
import ReelFeed from './components/ReelFeed';
import CreateModal from './components/CreateModal';
import ProfileView from './components/ProfileView';
import ChatView from './components/ChatView';
import StoryBar from './components/StoryBar';
import IdentityModal from './components/IdentityModal';
import DiscoveryView from './components/DiscoveryView';

// Mock Data
const MOCK_USER: User = {
  id: 'u1',
  username: 'innovator_alex',
  avatar: 'https://picsum.photos/seed/alex/150/150',
  meritScore: 1240,
  followersCount: 128
};

const MOCK_STORIES: Story[] = [
  {
    id: 's1',
    author: { id: 'u10', username: 'zen_architect', avatar: 'https://picsum.photos/seed/zen/100/100', meritScore: 1500 },
    mediaUrl: 'https://picsum.photos/seed/s1/400/800',
    type: 'image',
    timestamp: new Date(),
    isSeen: false,
    isHighMerit: true
  },
  {
    id: 's2',
    author: { id: 'u11', username: 'neuro_traveler', avatar: 'https://picsum.photos/seed/neuro/100/100', meritScore: 800 },
    mediaUrl: 'https://picsum.photos/seed/s2/400/800',
    type: 'image',
    timestamp: new Date(),
    isSeen: false
  },
  {
    id: 's3',
    author: { id: 'u12', username: 'data_druid', avatar: 'https://picsum.photos/seed/data/100/100', meritScore: 2100 },
    mediaUrl: 'https://picsum.photos/seed/s3/400/800',
    type: 'image',
    timestamp: new Date(),
    isSeen: true,
    isHighMerit: true
  }
];

const INITIAL_REELS: Reel[] = [
  {
    id: 'r1',
    isReel: true,
    author: {
      id: 'u20',
      username: 'quantum_coder',
      avatar: 'https://picsum.photos/seed/quantum/100/100',
      meritScore: 890
    },
    content: "Neural architecture exploration. The buttery smoothness of data flow.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://picsum.photos/seed/r1/300/500",
    timestamp: new Date(),
    upvotes: 1200,
    downvotes: 45,
    views: 15400,
    comments: []
  },
  {
    id: 'r2',
    isReel: true,
    author: {
      id: 'u10',
      username: 'zen_architect',
      avatar: 'https://picsum.photos/seed/zen/100/100',
      meritScore: 1500
    },
    content: "Designing for the void. Minimalist spaces in digital realms.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl: "https://picsum.photos/seed/r2/300/500",
    timestamp: new Date(),
    upvotes: 3400,
    downvotes: 12,
    views: 42000,
    comments: []
  },
  {
    id: 'r3',
    isReel: true,
    author: {
      id: 'u11',
      username: 'neuro_traveler',
      avatar: 'https://picsum.photos/seed/neuro/100/100',
      meritScore: 800
    },
    content: "Travel through the optic nerve.",
    videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnailUrl: "https://picsum.photos/seed/r3/300/500",
    timestamp: new Date(),
    upvotes: 850,
    downvotes: 2,
    views: 5200,
    comments: []
  }
];

const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    author: {
      id: 'u2',
      username: 'deep_thinker',
      avatar: 'https://picsum.photos/seed/thinker/150/150',
      meritScore: 1240
    },
    content: "True value in social media comes from the quality of the signal, not the volume of the noise. Let the best ideas thrive on merit alone. High signal content should propagate effortlessly.",
    timestamp: new Date(Date.now() - 3600000),
    upvotes: 452,
    downvotes: 12,
    views: 2840,
    aiBadge: {
      label: "Signal Peak",
      color: "cyan",
      description: "Exceptional depth and clarity detected."
    },
    comments: [],
    imageUrl: "https://picsum.photos/seed/prism/1000/1000"
  },
  {
    id: 'p2',
    author: {
      id: 'u3',
      username: 'aesthetic_lab',
      avatar: 'https://picsum.photos/seed/lab/150/150',
      meritScore: 680
    },
    content: "Design is not just what it looks like; it's how it moves. Fluidity is the soul of interaction in the modern meritocracy.",
    timestamp: new Date(Date.now() - 7200000),
    upvotes: 215,
    downvotes: 3,
    views: 1120,
    imageUrl: "https://picsum.photos/seed/design/1000/1000",
    comments: []
  }
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    type: 'FOLLOW_REQUEST',
    actor: { id: 'u20', username: 'quantum_coder', avatar: 'https://picsum.photos/seed/quantum/100/100', meritScore: 890 },
    timestamp: new Date(Date.now() - 300000),
    read: false,
    status: 'PENDING'
  }
];

const SignalSeparator: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`relative flex items-center justify-center w-full py-1.5 ${className}`}>
    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    <div className="mx-4 w-0.5 h-0.5 rounded-full bg-indigo-500/30 blur-[0.5px] animate-pulse" />
    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/10 to-transparent" />
  </div>
);

const ReelRibbon: React.FC<{ reels: Reel[], onReelClick: (reel: Reel) => void }> = ({ reels, onReelClick }) => {
  return (
    <div className="w-full py-1">
      <div className="flex items-center justify-between px-2 mb-2">
         <span className="text-[9px] font-black uppercase tracking-[0.3em] text-app-muted">Following Signals</span>
         <span className="text-[8px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md uppercase tracking-widest">Live Reels</span>
      </div>
      <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar scroll-smooth px-1">
        {reels.map((reel) => (
          <div 
            key={reel.id} 
            onClick={() => onReelClick(reel)}
            className="flex-shrink-0 w-32 h-56 rounded-2xl glass border border-white/10 relative overflow-hidden group cursor-pointer active:scale-95 transition-all"
          >
            <video 
              src={reel.videoUrl} 
              poster={reel.thumbnailUrl}
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
              muted 
              loop 
              playsInline 
              preload="metadata"
              onMouseEnter={(e) => {
                const playPromise = e.currentTarget.play();
                if (playPromise !== undefined) {
                  playPromise.catch(() => {});
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 flex flex-col">
              <div className="flex items-center space-x-1.5 mb-1">
                <img src={reel.author.avatar} className="w-5 h-5 rounded-lg border border-white/20" />
                <span className="text-[9px] font-black text-white/90 truncate">@{reel.author.username}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Play size={8} fill="currentColor" className="text-white" />
                <span className="text-[8px] font-bold text-white/60">{(reel.views / 1000).toFixed(1)}k</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USER);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [reels, setReels] = useState<Reel[]>(INITIAL_REELS);
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [activeFeed, setActiveFeed] = useState<FeedType>(FeedType.DISCOVERY);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewedUser, setViewedUser] = useState<User>(MOCK_USER);

  useEffect(() => {
    document.body.classList.toggle('light-mode', theme === 'light');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const changeFeed = useCallback((feed: FeedType) => {
    if (activeFeed === feed && feed !== FeedType.PROFILE) return;
    setIsSyncing(true);
    setActiveFeed(feed);
    setTimeout(() => setIsSyncing(false), 500);
  }, [activeFeed]);

  const handleNavigateToProfile = useCallback((user: User) => {
    setViewedUser(user);
    setIsSyncing(true);
    setActiveFeed(FeedType.PROFILE);
    setTimeout(() => setIsSyncing(false), 500);
  }, []);

  const handleGoToMyProfile = useCallback(() => {
    setViewedUser(currentUser);
    changeFeed(FeedType.PROFILE);
  }, [changeFeed, currentUser]);

  const handleIdentityUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    if (viewedUser.id === updatedUser.id) setViewedUser(updatedUser);
  };

  const handlePostCreated = useCallback((newPost: Post) => {
    if (newPost.isReel && newPost.videoUrl) {
      setReels(prev => [newPost as Reel, ...prev]);
    } else {
      setPosts(prev => [newPost, ...prev]);
    }
    changeFeed(newPost.isReel ? FeedType.REELS : FeedType.DISCOVERY);
    setIsCreateModalOpen(false);
  }, [changeFeed]);

  const handleNotificationAction = useCallback((id: string, action: 'ACCEPT' | 'DECLINE' | 'READ') => {
    setNotifications(prev => {
      if (action === 'DECLINE') {
        return prev.filter(n => n.id !== id);
      }
      return prev.map(n => {
        if (n.id === id) {
          if (action === 'ACCEPT') {
            return { ...n, status: 'ACCEPTED', read: true };
          }
          if (action === 'READ') {
            return { ...n, read: true };
          }
        }
        return n;
      });
    });
    
    // If it was a follow request being accepted, we might want to update current user follower count
    if (action === 'ACCEPT') {
      const notif = notifications.find(n => n.id === id);
      if (notif?.type === 'FOLLOW_REQUEST') {
        setCurrentUser(prev => ({ ...prev, followersCount: (prev.followersCount || 0) + 1 }));
      }
    }
  }, [notifications]);

  const handleUpvote = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
  };
  const handleDownvote = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, downvotes: p.downvotes + 1 } : p));
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const renderContent = () => {
    if (isSyncing) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] animate-spring">
                <div className="w-20 h-20 rounded-[2.5rem] merit-gradient animate-spin shadow-[0_0_50px_rgba(255,0,128,0.3)]"></div>
                <p className="mt-10 text-[11px] font-black uppercase tracking-[0.6em] text-app-muted animate-pulse">Synchronizing</p>
            </div>
        );
    }

    switch (activeFeed) {
      case FeedType.REELS:
        return <div className="animate-spring"><ReelFeed reels={reels} onUpvote={handleUpvote} onDownvote={handleDownvote} onNavigateToProfile={handleNavigateToProfile} /></div>;
      case FeedType.PROFILE:
        return (
          <ProfileView 
            user={viewedUser} 
            currentUser={currentUser} 
            posts={[...posts, ...reels]} 
            onUpvote={handleUpvote} 
            onDownvote={handleDownvote} 
            onOpenIdentityEdit={() => setIsIdentityModalOpen(true)}
            onNavigateToProfile={handleNavigateToProfile}
          />
        );
      case FeedType.MESSAGES:
        return <ChatView currentUser={currentUser} onNavigateToProfile={handleNavigateToProfile} />;
      case FeedType.SEARCH:
        return (
          <DiscoveryView 
            posts={posts} 
            reels={reels} 
            onNavigateToProfile={handleNavigateToProfile} 
          />
        );
      default:
        return (
          <div className="space-y-3 pb-40">
            {posts.map((post, index) => (
              <Fragment key={post.id}>
                <div 
                  className="animate-spring"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <PostCard post={post} onUpvote={handleUpvote} onDownvote={handleDownvote} currentUser={currentUser} onNavigateToProfile={handleNavigateToProfile} />
                </div>
                {index < posts.length - 1 && (
                  <SignalSeparator className="opacity-30" />
                )}
              </Fragment>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen pb-32 lg:pb-0 relative text-app-text">
      <div className="fixed top-8 right-6 z-[95] flex items-center space-x-3 lg:hidden">
        <button 
          onClick={toggleTheme}
          className="p-3 rounded-2xl glass text-app-muted hover:text-white transition-all active:scale-90 shadow-2xl"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button 
          onClick={() => setIsNotificationsOpen(true)}
          className="p-3 rounded-2xl glass text-app-muted hover:text-white transition-all active:scale-90 shadow-2xl relative"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 merit-gradient rounded-full border-2 border-app-bg flex items-center justify-center text-[8px] font-black text-white">
              {unreadCount}
            </span>
          )}
        </button>
        <button 
          onClick={handleGoToMyProfile}
          className={`p-0.5 rounded-2xl transition-all shadow-2xl ${activeFeed === FeedType.PROFILE && viewedUser.id === currentUser.id ? 'ring-2 ring-indigo-500' : 'opacity-80'}`}
        >
          <img src={currentUser.avatar} className="w-10 h-10 rounded-2xl object-cover border border-white/10" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-12 lg:pt-20">
        <aside className="hidden lg:block lg:col-span-3 sticky top-20 h-fit space-y-8">
            <div className="px-6 mb-12">
              <div className="flex items-center space-x-5 group cursor-pointer" onClick={() => changeFeed(FeedType.DISCOVERY)}>
                <div className="w-14 h-14 merit-gradient rounded-[1.6rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-[15deg] transition-all duration-700 active:scale-90">
                  <Sparkles size={28} />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tighter leading-none">Stud</h1>
                  <p className="text-[10px] text-app-accent font-bold uppercase tracking-[0.4em] mt-1">Merit Node</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-[3rem] p-8 space-y-4 shadow-2xl">
              <h3 className="text-[10px] font-black text-app-muted uppercase tracking-[0.4em] px-6 mb-6">Navigation</h3>
              {[
                { type: FeedType.DISCOVERY, icon: Compass, label: 'Discover' },
                { type: FeedType.SEARCH, icon: Search, label: 'Explore' },
                { type: FeedType.REELS, icon: Clapperboard, label: 'Visuals' },
                { type: FeedType.MESSAGES, icon: MessageCircle, label: 'Signals' },
                { type: FeedType.PROFILE, icon: Orbit, label: 'Network', action: handleGoToMyProfile },
              ].map((item) => (
                <button 
                  key={item.label}
                  onClick={() => item.action ? item.action() : changeFeed(item.type)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all group ${activeFeed === item.type && (item.type !== FeedType.PROFILE || viewedUser.id === currentUser.id) ? `merit-gradient text-white shadow-[0_10px_30px_rgba(255,0,128,0.2)]` : 'text-app-muted hover:bg-white/[0.03] hover:text-app-text'}`}
                >
                  <div className="flex items-center space-x-5">
                    <item.icon size={22} className={activeFeed === item.type && (item.type !== FeedType.PROFILE || viewedUser.id === currentUser.id) ? 'text-white' : 'text-indigo-400/50 group-hover:text-indigo-400 transition-colors'} />
                    <span className="font-black text-[12px] uppercase tracking-widest">{item.label}</span>
                  </div>
                </button>
              ))}
            </div>
        </aside>

        <main className={`col-span-1 ${activeFeed === FeedType.MESSAGES ? 'lg:col-span-9' : (activeFeed === FeedType.SEARCH ? 'lg:col-span-9' : 'lg:col-span-6')}`}>
          {activeFeed === FeedType.DISCOVERY && !isSyncing && (
            <div className="space-y-0.5">
              <StoryBar 
                stories={stories} 
                currentUser={currentUser} 
                onAddStory={() => setIsCreateModalOpen(true)} 
                onViewStory={(s) => setStories(prev => prev.map(item => item.id === s.id ? { ...item, isSeen: true } : item))}
                onNavigateToProfile={handleNavigateToProfile}
              />
              <SignalSeparator className="opacity-20" />
              <ReelRibbon 
                reels={reels.filter(r => ['zen_architect', 'neuro_traveler', 'quantum_coder'].includes(r.author.username))} 
                onReelClick={() => changeFeed(FeedType.REELS)}
              />
              <SignalSeparator className="mt-0.5" />
            </div>
          )}
          {renderContent()}
        </main>

        {/* Fixed: Removed redundant FeedType.SEARCH check that caused unintentional comparison error */}
        {(activeFeed === FeedType.DISCOVERY || activeFeed === FeedType.PROFILE) && (
          <aside className="hidden lg:block lg:col-span-3 sticky top-20 h-fit space-y-8">
            <div className="glass rounded-[3rem] p-10 border-white/5 shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-32 h-32 merit-gradient opacity-10 blur-[100px] -mr-16 -mt-16" />
              <h3 className="font-black mb-10 flex items-center space-x-4 uppercase text-[10px] tracking-[0.4em]">
                <Flame size={24} className="text-rose-500 animate-pulse" />
                <span>Trending</span>
              </h3>
              <div className="space-y-8">
                {['#NeuralArt', '#PrismUI', '#Meritocracy'].map((tag) => (
                  <div key={tag} className="flex items-center justify-between group/tag cursor-pointer">
                    <p className="text-[12px] font-bold text-slate-400 group-hover/tag:text-white transition-colors">{tag}</p>
                    <span className="text-[8px] font-black text-app-accent bg-white/[0.05] px-2 py-1 rounded-lg">LIVE</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-[3rem] p-10 shadow-2xl border-white/5 hover-lift">
               <h3 className="font-black mb-8 flex items-center space-x-4 uppercase text-[10px] tracking-[0.4em]">
                <Zap size={24} className="text-amber-500" />
                <span>Leaderboard</span>
              </h3>
              <div className="space-y-6">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex items-center space-x-4 group cursor-pointer">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-black text-xs group-hover:bg-indigo-500 group-hover:text-white transition-all">{i}</div>
                      <div className="flex-1">
                        <p className="text-xs font-bold">@top_node_{i}</p>
                        <p className="text-[9px] text-app-muted font-black uppercase tracking-widest">Score: {5000 - i*1000}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      <nav className="lg:hidden glass fixed bottom-0 left-0 right-0 h-24 rounded-t-[3.5rem] border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] flex items-center justify-around px-4 z-[90] backdrop-blur-3xl">
        <button onClick={() => changeFeed(FeedType.DISCOVERY)} className={`p-4 rounded-2xl transition-all ${activeFeed === FeedType.DISCOVERY ? 'text-app-accent bg-white/[0.05] scale-110' : 'text-app-muted'}`}>
          <Compass size={28} />
        </button>
        <button onClick={() => changeFeed(FeedType.SEARCH)} className={`p-4 rounded-2xl transition-all ${activeFeed === FeedType.SEARCH ? 'text-app-accent bg-white/[0.05] scale-110' : 'text-app-muted'}`}>
          <Search size={28} />
        </button>
        <div className="relative -mt-12">
          <button onClick={() => setIsCreateModalOpen(true)} className="w-16 h-16 merit-gradient rounded-[1.8rem] flex items-center justify-center text-white shadow-2xl border-4 border-[#010101] active:scale-90 transition-all">
             <Plus strokeWidth={3} size={32} />
          </button>
        </div>
        <button onClick={() => changeFeed(FeedType.MESSAGES)} className={`p-4 rounded-2xl transition-all ${activeFeed === FeedType.MESSAGES ? 'text-app-accent bg-white/[0.05] scale-110' : 'text-app-muted'}`}>
          <MessageCircle size={28} />
        </button>
        <button onClick={() => changeFeed(FeedType.REELS)} className={`p-4 rounded-2xl transition-all ${activeFeed === FeedType.REELS ? 'text-app-accent bg-white/[0.05] scale-110' : 'text-app-muted'}`}>
          <Clapperboard size={28} />
        </button>
      </nav>

      <NotificationPanel 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
        notifications={notifications} 
        onAction={handleNotificationAction} 
        onNavigateToProfile={handleNavigateToProfile} 
      />
      <CreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} currentUser={currentUser} onPostCreated={handlePostCreated} />
      <IdentityModal 
        isOpen={isIdentityModalOpen} 
        onClose={() => setIsIdentityModalOpen(false)} 
        currentUser={currentUser} 
        onIdentityUpdate={handleIdentityUpdate} 
      />
    </div>
  );
};

export default App;
