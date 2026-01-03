
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Download
} from 'lucide-react';
import { Post, User, FeedType, Notification, Reel, Story } from './types';
import PostCard from './components/PostCard';
import NotificationPanel from './components/NotificationPanel';
import ReelFeed from './components/ReelFeed';
import CreateModal from './components/CreateModal';
import ProfileView from './components/ProfileView';
import ChatView from './components/ChatView';
import StoryBar from './components/StoryBar';

// Mock Data
const MOCK_USER: User = {
  id: 'u1',
  username: 'innovator_alex',
  avatar: 'https://picsum.photos/seed/alex/150/150',
  meritScore: 450,
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
    videoUrl: "https://v1.pexels.com/video-files/5199624/5199624-uhd_2560_1440_25fps.mp4",
    timestamp: new Date(),
    upvotes: 1200,
    downvotes: 45,
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
    content: "True value in social media comes from the quality of the signal, not the volume of the noise. Let the best ideas thrive on merit alone.",
    timestamp: new Date(Date.now() - 3600000),
    upvotes: 452,
    downvotes: 12,
    aiBadge: {
      label: "High Signal",
      color: "cyan",
      description: "Exceptional conceptual depth."
    },
    comments: [],
    imageUrl: "https://picsum.photos/seed/prism/800/600"
  },
  {
    id: 'p2',
    author: {
      id: 'u3',
      username: 'aesthetic_lab',
      avatar: 'https://picsum.photos/seed/lab/150/150',
      meritScore: 680
    },
    content: "Design is not just what it looks like; it's how it moves. Fluidity is the soul of interaction.",
    timestamp: new Date(Date.now() - 7200000),
    upvotes: 215,
    downvotes: 3,
    imageUrl: "https://picsum.photos/seed/design/800/600",
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

const App: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [reels, setReels] = useState<Reel[]>(INITIAL_REELS);
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [activeFeed, setActiveFeed] = useState<FeedType>(FeedType.DISCOVERY);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('light-mode', theme === 'light');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const changeFeed = useCallback((feed: FeedType) => {
    if (activeFeed === feed) return;
    setIsSyncing(true);
    setActiveFeed(feed);
    setTimeout(() => setIsSyncing(false), 700);
  }, [activeFeed]);

  const handlePostCreated = useCallback((newPost: Post) => {
    if (newPost.isReel && newPost.videoUrl) {
      setReels(prev => [newPost as Reel, ...prev]);
    } else {
      setPosts(prev => [newPost, ...prev]);
    }
    changeFeed(newPost.isReel ? FeedType.REELS : FeedType.DISCOVERY);
    setIsCreateModalOpen(false);
  }, [changeFeed]);

  const handleUpvote = (id: string) => setPosts(prev => prev.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
  const handleDownvote = (id: string) => setPosts(prev => prev.map(p => p.id === id ? { ...p, downvotes: p.downvotes + 1 } : p));

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const sortedPosts = useMemo(() => {
    const p = [...posts];
    return p.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [posts]);

  const handleInstallApp = () => {
    alert("Stud is a PWA. To 'download' it, use the 'Add to Home Screen' option in your browser menu.");
  };

  const renderContent = () => {
    if (isSyncing) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] animate-pulse">
                <div className="w-16 h-16 rounded-3xl merit-gradient animate-spin-slow blur-sm opacity-50"></div>
                <p className="mt-8 text-[10px] font-black uppercase tracking-[0.5em] text-app-muted">Recalibrating...</p>
            </div>
        );
    }

    switch (activeFeed) {
      case FeedType.REELS:
        return <div className="animate-fluid-in"><ReelFeed reels={reels} onUpvote={handleUpvote} onDownvote={handleDownvote} /></div>;
      case FeedType.PROFILE:
        return <ProfileView user={MOCK_USER} posts={posts} onUpvote={handleUpvote} onDownvote={handleDownvote} />;
      case FeedType.MESSAGES:
        return <ChatView currentUser={MOCK_USER} />;
      default:
        return (
          <div className="space-y-8 sm:space-y-12 pb-32">
            {sortedPosts.map((post, index) => (
              <div 
                key={post.id} 
                className={`relative animate-fluid-in`}
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <PostCard post={post} onUpvote={handleUpvote} onDownvote={handleDownvote} currentUser={MOCK_USER} />
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen pb-32 lg:pb-0 relative text-app-text">
      {/* Navigation Bar */}
      <nav className="glass sticky top-0 z-50 border-b border-white/5 shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => changeFeed(FeedType.DISCOVERY)}>
              <div className="w-10 h-10 sm:w-11 sm:h-11 merit-gradient rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:rotate-12 transition-all duration-700">
                <Sparkles size={20} className="sm:size-24" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-black tracking-tighter leading-none">Stud</h1>
                <span className="text-[9px] text-app-muted font-bold uppercase tracking-[0.2em]">Prism Network</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={toggleTheme}
              className="p-2.5 sm:p-3 rounded-2xl bg-white/5 text-app-muted hover:text-white transition-all active:scale-90"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="flex items-center space-x-2 sm:space-x-3 pl-3 border-l border-white/5">
              <button onClick={() => setIsNotificationsOpen(true)} className="relative p-2.5 sm:p-3 text-app-muted hover:text-white transition-all group active:scale-90">
                <Bell size={22} />
                {unreadCount > 0 && <span className="absolute top-2 right-2 w-4 h-4 merit-gradient rounded-full border-2 border-app-bg flex items-center justify-center text-[8px] font-black text-white shadow-lg">{unreadCount}</span>}
              </button>
              
              <button 
                onClick={() => changeFeed(FeedType.PROFILE)}
                className={`p-0.5 rounded-2xl transition-all active:scale-90 ${activeFeed === FeedType.PROFILE ? 'ring-4 ring-indigo-500/30' : 'grayscale hover:grayscale-0'}`}
              >
                <img src={MOCK_USER.avatar} className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-white/10 shadow-lg" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Story Section - Positioned At the Absolute Top on Mobile/Desktop for Discovery */}
      {activeFeed === FeedType.DISCOVERY && !isSyncing && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
          <StoryBar 
            stories={stories} 
            currentUser={MOCK_USER} 
            onAddStory={() => setIsCreateModalOpen(true)} 
            onViewStory={(s) => setStories(prev => prev.map(item => item.id === s.id ? { ...item, isSeen: true } : item))} 
          />
        </div>
      )}

      {/* Main Grid Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-12">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-32 h-fit space-y-8">
            <div className="glass rounded-[2.5rem] p-8 space-y-4 shadow-xl">
              <h3 className="text-[10px] font-black text-app-muted uppercase tracking-[0.4em] px-4 mb-4">Signal Hub</h3>
              {[
                { type: FeedType.DISCOVERY, icon: Compass, label: 'Feed' },
                { type: FeedType.REELS, icon: Clapperboard, label: 'Visuals' },
                { type: FeedType.MESSAGES, icon: MessageCircle, label: 'Signals' },
              ].map((item) => (
                <button 
                  key={item.label}
                  onClick={() => changeFeed(item.type)}
                  className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all group ${activeFeed === item.type ? `merit-gradient text-white shadow-xl` : 'text-app-muted hover:bg-white/5 hover:text-app-text'}`}
                >
                  <div className="flex items-center space-x-4">
                    <item.icon size={20} className={activeFeed === item.type ? 'text-white' : 'text-indigo-500/60'} />
                    <span className="font-black text-[11px] uppercase tracking-[0.1em]">{item.label}</span>
                  </div>
                </button>
              ))}

              <div className="pt-8 mt-8 border-t border-white/5">
                <button 
                  onClick={handleInstallApp}
                  className="w-full flex items-center justify-center space-x-3 px-6 py-4 rounded-2xl bg-white/5 border border-white/5 text-app-muted hover:text-white hover:bg-white/10 transition-all group"
                >
                  <Download size={18} className="group-hover:translate-y-1 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Download Platform</span>
                </button>
              </div>
            </div>
        </aside>

        <main className={`col-span-1 ${activeFeed === FeedType.MESSAGES ? 'lg:col-span-9' : 'lg:col-span-6'}`}>
          {renderContent()}
        </main>

        {/* Hot Signals - Desktop Only */}
        {activeFeed !== FeedType.MESSAGES && activeFeed !== FeedType.PROFILE && (
          <aside className="hidden lg:block lg:col-span-3 sticky top-32 h-fit">
            <div className="glass rounded-[2.5rem] p-10 border-white/5 shadow-xl relative overflow-hidden group hover-lift">
              <h3 className="font-black mb-8 flex items-center space-x-3 uppercase text-[10px] tracking-[0.3em]">
                <Flame size={22} className="text-pink-500" />
                <span>Trending</span>
              </h3>
              <div className="space-y-6">
                {['#NeuralArt', '#PrismUI', '#StudNetwork'].map((tag, i) => (
                  <div key={tag} className="group cursor-pointer flex items-center justify-between">
                    <p className="text-[11px] font-black group-hover:text-app-accent transition-colors tracking-tight uppercase">{tag}</p>
                    <div className="text-[8px] font-black text-app-accent bg-white/5 px-2 py-1 rounded-lg">HOT</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Full-Width Mobile Bottom Nav */}
      <nav className="lg:hidden glass fixed bottom-0 left-0 right-0 h-24 sm:h-28 rounded-t-[3rem] border-t border-white/10 shadow-3xl flex items-center justify-around px-2 z-[60] backdrop-blur-3xl">
        <button 
          onClick={() => changeFeed(FeedType.DISCOVERY)}
          className={`p-3 sm:p-4 rounded-2xl transition-all btn-active ${activeFeed === FeedType.DISCOVERY ? 'text-app-accent scale-110' : 'text-app-muted'}`}
        >
          <Compass size={28} />
        </button>
        <button 
          onClick={() => changeFeed(FeedType.REELS)}
          className={`p-3 sm:p-4 rounded-2xl transition-all btn-active ${activeFeed === FeedType.REELS ? 'text-app-accent scale-110' : 'text-app-muted'}`}
        >
          <Clapperboard size={28} />
        </button>
        
        <div className="relative -mt-12 sm:-mt-16">
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-16 h-16 sm:w-20 sm:h-20 merit-gradient rounded-[1.8rem] sm:rounded-[2.2rem] flex items-center justify-center text-white shadow-[0_15px_30px_rgba(255,0,128,0.3)] border-4 border-app-bg active:scale-90 transition-all cursor-pointer hover:rotate-90 duration-700"
          >
             {/* Fixed: Replaced responsive size prop with Tailwind classes */}
             <Plus strokeWidth={3} className="w-9 h-9 sm:w-11 sm:h-11" />
          </button>
        </div>

        <button 
          className="p-3 sm:p-4 rounded-2xl transition-all text-app-muted btn-active"
        >
          <Search size={28} />
        </button>
        
        <button 
          onClick={() => changeFeed(FeedType.MESSAGES)}
          className={`p-3 sm:p-4 rounded-2xl transition-all btn-active ${activeFeed === FeedType.MESSAGES ? 'text-app-accent scale-110' : 'text-app-muted'}`}
        >
          <MessageCircle size={28} />
        </button>
      </nav>

      <NotificationPanel 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onAction={() => {}} 
      />

      <CreateModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={MOCK_USER}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default App;
