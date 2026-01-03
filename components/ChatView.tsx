
import React, { useState, useRef, useEffect } from 'react';
import { User, ChatRoom, Message } from '../types';
import { 
  Send, 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Image as ImageIcon, 
  Smile, 
  ArrowLeft,
  Circle,
  Zap,
  Sparkles
} from 'lucide-react';

interface ChatViewProps {
  currentUser: User;
  onNavigateToProfile?: (user: User) => void;
}

const MOCK_CHATS: ChatRoom[] = [
  {
    id: 'c1',
    participant: { id: 'u20', username: 'quantum_coder', avatar: 'https://picsum.photos/seed/quantum/100/100', meritScore: 890 },
    lastMessage: "The neural mesh looks stable.",
    unreadCount: 2,
    isOnline: true,
    messages: [
      { id: 'm1', senderId: 'u20', text: "Hey Alex, did you check the new synchronization protocols?", timestamp: new Date(Date.now() - 3600000), status: 'READ' },
      { id: 'm2', senderId: 'u1', text: "Just now! The latency reduction is incredible.", timestamp: new Date(Date.now() - 3000000), status: 'READ' },
      { id: 'm3', senderId: 'u20', text: "Agreed. The neural mesh looks stable.", timestamp: new Date(Date.now() - 600000), status: 'READ' },
    ]
  },
  {
    id: 'c2',
    participant: { id: 'u21', username: 'logic_gate', avatar: 'https://picsum.photos/seed/logic/100/100', meritScore: 1200 },
    lastMessage: "Check out this logic flow...",
    unreadCount: 0,
    isOnline: false,
    messages: []
  }
];

const ChatView: React.FC<ChatViewProps> = ({ currentUser, onNavigateToProfile }) => {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(MOCK_CHATS[0].id);
  const [inputMessage, setInputMessage] = useState('');
  const [chats, setChats] = useState<ChatRoom[]>(MOCK_CHATS);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChat = chats.find(c => c.id === selectedChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !selectedChatId) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substring(7),
      senderId: currentUser.id,
      text: inputMessage,
      timestamp: new Date(),
      status: 'SENT'
    };

    setChats(prev => prev.map(chat => 
      chat.id === selectedChatId 
        ? { ...chat, messages: [...chat.messages, newMessage], lastMessage: inputMessage } 
        : chat
    ));
    setInputMessage('');
  };

  const handleProfileClick = () => {
    if (selectedChat && onNavigateToProfile) {
      onNavigateToProfile(selectedChat.participant);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-160px)] md:h-[calc(100vh-220px)] glass rounded-[3rem] overflow-hidden border-white/5 shadow-2xl animate-fluid-in">
      {/* Sidebar - Chat List */}
      <div className={`w-full md:w-80 border-r border-white/5 flex flex-col ${selectedChatId && 'hidden md:flex'}`}>
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-black tracking-tighter mb-4">Signal Threads</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search nodes..." 
              className="w-full bg-slate-900/40 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              className={`p-4 flex items-center space-x-4 cursor-pointer transition-all border-b border-white/5 hover:bg-white/5 ${selectedChatId === chat.id ? 'bg-indigo-500/10' : ''}`}
            >
              <div className="relative">
                <img src={chat.participant.avatar} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt={chat.participant.username} />
                {chat.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0f172a] shadow-lg" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-black truncate">@{chat.participant.username}</h4>
                  <span className="text-[10px] text-slate-500 font-bold">12:45</span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{chat.lastMessage}</p>
              </div>
              {chat.unreadCount > 0 && (
                <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-black text-white">{chat.unreadCount}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col h-full ${!selectedChatId && 'hidden md:flex'}`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between glass sticky top-0 z-10">
              <div className="flex items-center space-x-4">
                <button onClick={() => setSelectedChatId(null)} className="md:hidden p-2 text-slate-400">
                  <ArrowLeft size={20} />
                </button>
                <div 
                  onClick={handleProfileClick}
                  className="relative cursor-pointer"
                >
                  <img src={selectedChat.participant.avatar} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt={selectedChat.participant.username} />
                  {selectedChat.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0f172a]" />
                  )}
                </div>
                <div 
                  onClick={handleProfileClick}
                  className="cursor-pointer"
                >
                  <h3 className="text-sm font-black hover:text-app-accent transition-colors">@{selectedChat.participant.username}</h3>
                  <div className="flex items-center space-x-2 text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
                    <Circle size={8} fill="currentColor" className={selectedChat.isOnline ? 'text-emerald-500' : 'text-slate-600'} />
                    <span>{selectedChat.isOnline ? 'Synchronized' : 'Offline'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 md:space-x-4 text-slate-400">
                <button className="p-2.5 hover:bg-white/5 rounded-xl transition-all"><Phone size={18} /></button>
                <button className="p-2.5 hover:bg-white/5 rounded-xl transition-all"><Video size={18} /></button>
                <button className="p-2.5 hover:bg-white/5 rounded-xl transition-all"><MoreVertical size={18} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
              <div className="flex justify-center mb-8">
                <span className="px-4 py-1.5 bg-slate-900/40 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest border border-white/5">
                  Synchronized on Mesh v2.4
                </span>
              </div>
              {selectedChat.messages.map((msg, i) => (
                <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-5 py-3.5 rounded-[1.8rem] shadow-xl ${
                    msg.senderId === currentUser.id 
                      ? 'merit-gradient text-white rounded-tr-none' 
                      : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <div className={`flex items-center justify-end space-x-1.5 mt-1 opacity-60`}>
                      <span className="text-[9px] font-bold uppercase">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.senderId === currentUser.id && (
                        <Zap size={10} fill="currentColor" className="text-white" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-6 border-t border-white/5">
              <div className="flex items-center space-x-4 bg-slate-900/40 rounded-[2rem] p-2 border border-white/5 shadow-inner">
                <button className="p-3 text-slate-500 hover:text-indigo-400 transition-colors">
                  <ImageIcon size={20} />
                </button>
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Propagate signal..." 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium py-3 text-slate-100"
                />
                <button className="p-3 text-slate-500 hover:text-indigo-400 transition-colors">
                  <Smile size={20} />
                </button>
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="w-12 h-12 merit-gradient rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-all disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="mt-4 flex items-center justify-center space-x-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                <Sparkles size={12} className="text-indigo-400" />
                <span>Encrypted Pulse Signal Active</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
            <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mb-6">
              <Zap size={40} className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-[0.2em] mb-2">Initialize Pulse</h3>
            <p className="text-sm max-w-xs leading-relaxed">Select a synchronized node from the sidebar to begin secure data propagation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatView;
