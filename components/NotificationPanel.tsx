
import React, { useEffect } from 'react';
import { 
  X, 
  ArrowBigUp, 
  MessageSquare, 
  Share2, 
  UserPlus, 
  Check, 
  Info,
  Clock,
  Sparkles,
  BellOff,
  ShieldAlert
} from 'lucide-react';
import { Notification, User } from '../types';

interface NotificationPanelProps {
  notifications: Notification[];
  isOpen: boolean;
  onClose: () => void;
  onAction: (id: string, action: 'ACCEPT' | 'DECLINE' | 'READ') => void;
  onNavigateToProfile?: (user: User) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  notifications, 
  isOpen, 
  onClose,
  onAction,
  onNavigateToProfile
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const renderIcon = (type: Notification['type'], content?: string) => {
    if (type === 'SYSTEM' && content?.toLowerCase().includes('security')) {
      return <ShieldAlert size={16} className="text-rose-500 animate-pulse" />;
    }
    
    switch (type) {
      case 'UPVOTE': return <ArrowBigUp size={16} className="text-indigo-400" fill="currentColor" />;
      case 'COMMENT': return <MessageSquare size={16} className="text-emerald-400" />;
      case 'SHARE': return <Share2 size={16} className="text-pink-400" />;
      case 'FOLLOW_REQUEST': return <UserPlus size={16} className="text-amber-400" />;
      case 'SYSTEM': return <Sparkles size={16} className="text-indigo-500" />;
      default: return <Info size={16} />;
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const handleActorClick = (e: React.MouseEvent, user?: User) => {
    if (user && onNavigateToProfile) {
      e.stopPropagation();
      onNavigateToProfile(user);
      onClose();
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[100] flex justify-end transition-opacity duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div 
        className={`relative w-full max-w-md h-full glass shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tighter">Signal Center</h2>
            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mt-1.5">Network Synchronization</p>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white/10 rounded-2xl transition-all text-slate-400 hover:text-white active:scale-90"
          >
            <X size={26} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40 text-center px-10">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <BellOff size={32} />
              </div>
              <p className="font-black uppercase tracking-[0.3em] text-xs">No signals received</p>
            </div>
          ) : (
            notifications.map((notif, idx) => (
              <div 
                key={notif.id}
                onClick={() => onAction(notif.id, 'READ')}
                className={`p-6 rounded-[1.8rem] border transition-all cursor-pointer group hover-lift animate-fluid-in ${notif.type === 'SYSTEM' && notif.content?.includes('Security') ? 'border-rose-500/20 bg-rose-500/5' : 'border-white/5'}`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-start space-x-5">
                  <div 
                    onClick={(e) => handleActorClick(e, notif.actor)}
                    className="relative shrink-0 cursor-pointer"
                  >
                    {notif.actor ? (
                      <img 
                        src={notif.actor.avatar} 
                        className="w-12 h-12 rounded-2xl object-cover border border-white/10 group-hover:scale-110 transition-transform duration-500"
                        alt={notif.actor.username}
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${notif.content?.includes('Security') ? 'bg-rose-500/10' : 'bg-indigo-500/10'}`}>
                        {notif.content?.includes('Security') ? <ShieldAlert size={24} className="text-rose-500" /> : <Sparkles size={24} className="text-indigo-400" />}
                      </div>
                    )}
                    <div className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-[var(--app-bg)] rounded-xl border border-white/10 shadow-xl">
                      {renderIcon(notif.type, notif.content)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-medium leading-[1.4] text-slate-200">
                        {notif.actor && (
                          <span 
                            onClick={(e) => handleActorClick(e, notif.actor)}
                            className="font-black mr-1.5 text-slate-100 hover:text-app-accent cursor-pointer"
                          >
                            @{notif.actor.username}
                          </span>
                        )}
                        <span className={`text-slate-400 ${notif.type === 'SYSTEM' && notif.content?.includes('Security') ? 'text-rose-300' : ''}`}>
                          {notif.type === 'UPVOTE' && 'boosted your signal'}
                          {notif.type === 'COMMENT' && 'shared a perspective'}
                          {notif.type === 'SHARE' && 'spread your insight'}
                          {notif.type === 'FOLLOW_REQUEST' && 'wants to synchronize'}
                          {notif.type === 'SYSTEM' && notif.content}
                        </span>
                      </p>
                      {!notif.read && <div className={`w-2.5 h-2.5 rounded-full shrink-0 ml-3 ${notif.type === 'SYSTEM' && notif.content?.includes('Security') ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`} />}
                    </div>
                    
                    {notif.type === 'COMMENT' && notif.content && (
                      <p className="text-xs text-slate-400 mt-3 bg-white/5 p-3 rounded-xl italic leading-relaxed border border-white/5">
                        "{notif.content}"
                      </p>
                    )}

                    <div className="flex items-center mt-4 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
                      <Clock size={12} className="mr-1.5" />
                      {getTimeAgo(notif.timestamp)}
                    </div>

                    {notif.type === 'FOLLOW_REQUEST' && notif.status === 'PENDING' && (
                      <div className="flex items-center space-x-3 mt-5">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction(notif.id, 'ACCEPT');
                          }}
                          className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center space-x-2"
                        >
                          <Check size={14} />
                          <span>Accept</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onAction(notif.id, 'DECLINE');
                          }}
                          className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-slate-400 rounded-[1rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                    
                    {notif.type === 'FOLLOW_REQUEST' && notif.status === 'ACCEPTED' && (
                      <div className="mt-5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/10 rounded-[1rem] text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] text-center">
                        Connection established
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-8 border-t border-white/5">
          <button 
            className="w-full py-4 bg-slate-900/50 hover:bg-slate-800 rounded-[1.8rem] text-[10px] font-black text-slate-400 hover:text-indigo-400 uppercase tracking-[0.3em] transition-all border border-white/5 shadow-inner active:scale-95"
            onClick={() => notifications.forEach(n => onAction(n.id, 'READ'))}
          >
            Mark all read
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
