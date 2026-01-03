
import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Send, Sparkles, Loader2, X, Wand2, Video, Download, Film, AlertCircle, Music, Play } from 'lucide-react';
import { analyzePostQuality, enhanceImageWithAI, generateVideoWithAI, getPersonalizedStrategy } from '../services/geminiService';
import { Post, User } from '../types';

interface CreatePostProps {
  currentUser: User;
  onPostCreated: (post: Post) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [showEditInput, setShowEditInput] = useState(false);
  const [postType, setPostType] = useState<'post' | 'reel'>('post');
  const [selectedSong, setSelectedSong] = useState<string | null>(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [suggestedSongs, setSuggestedSongs] = useState<string[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showMusicPicker && suggestedSongs.length === 0) {
      fetchMusicSuggestions();
    }
  }, [showMusicPicker]);

  const fetchMusicSuggestions = async () => {
    setLoadingSongs(true);
    try {
      const strategy = await getPersonalizedStrategy(currentUser.username, content || "high tech aesthetic");
      setSuggestedSongs(strategy.songs);
    } catch (e) {
      setSuggestedSongs(["Ethereal Drift", "Cyber Pulse", "Neon Horizons"]);
    }
    setLoadingSongs(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video');
      const reader = new FileReader();
      reader.onloadend = () => {
        setMedia({ url: reader.result as string, type: isVideo ? 'video' : 'image' });
        if (isVideo) setPostType('reel');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRefineImage = async () => {
    if (!media || media.type !== 'image' || !editPrompt) return;
    setIsProcessing(true);
    const result = await enhanceImageWithAI(media.url, editPrompt);
    if (result) {
      setMedia({ url: result, type: 'image' });
      setEditPrompt('');
      setShowEditInput(false);
    }
    setIsProcessing(false);
  };

  const handleGenerateVideo = async () => {
    if (!content.trim()) return;
    
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
      }
    }

    setIsProcessing(true);
    try {
      const videoUrl = await generateVideoWithAI(content);
      setMedia({ url: videoUrl, type: 'video' });
      setPostType('reel');
    } catch (e) {
      alert("Failed to generate video. Ensure you have selected a valid paid API key for Veo.");
    }
    setIsProcessing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!media) return;

    setIsProcessing(true);
    const aiAnalysis = await analyzePostQuality(content);

    // FIX: Added 'views' property to meet 'Post' interface requirements
    const newPost: Post = {
      id: Math.random().toString(36).substring(7),
      author: currentUser,
      content,
      imageUrl: media?.type === 'image' ? media.url : undefined,
      videoUrl: media?.type === 'video' ? media.url : undefined,
      timestamp: new Date(),
      upvotes: 0,
      downvotes: 0,
      views: 0,
      isReel: postType === 'reel',
      song: selectedSong || undefined,
      aiBadge: aiAnalysis ? {
        label: aiAnalysis.label,
        color: aiAnalysis.color,
        description: aiAnalysis.description
      } : undefined,
      comments: []
    };

    onPostCreated(newPost);
    setContent('');
    setMedia(null);
    setSelectedSong(null);
    setPostType('post');
    setIsProcessing(false);
  };

  return (
    <div className="glass rounded-[2.5rem] p-8 border-indigo-500/20 shadow-2xl relative overflow-hidden group">
      <div className="flex items-center space-x-4 mb-6">
        <button 
          onClick={() => setPostType('post')}
          className={`flex-1 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${postType === 'post' ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg' : 'bg-slate-900/50 text-slate-500 border-white/5'}`}
        >
          Signal Post
        </button>
        <button 
          onClick={() => setPostType('reel')}
          className={`flex-1 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${postType === 'reel' ? 'bg-pink-500 text-white border-pink-500 shadow-lg' : 'bg-slate-900/50 text-slate-500 border-white/5'}`}
        >
          Visual Reel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative shrink-0 hidden sm:block">
            <img src={currentUser.avatar} alt="Profile" className="w-14 h-14 rounded-2xl border-2 border-slate-700/50 shadow-lg object-cover" />
            <div className="absolute -bottom-1 -right-1 bg-indigo-500 p-0.5 rounded-lg border-2 border-[#020617]">
              <Sparkles size={12} className="text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={postType === 'reel' ? "Describe your video frequency..." : "Broadcast high-signal ideas with a visual..."}
              className="w-full bg-transparent border-none focus:ring-0 text-xl font-medium text-slate-100 placeholder-slate-600 resize-none min-h-[100px]"
            />
            
            {selectedSong && (
              <div className="mb-4 inline-flex items-center space-x-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                <Music size={14} className="text-indigo-400 animate-pulse" />
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{selectedSong}</span>
                <button onClick={() => setSelectedSong(null)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </div>
            )}
            
            {media ? (
              <div className="relative mt-4 inline-block group/media w-full sm:w-auto">
                {media.type === 'image' ? (
                  <img src={media.url} alt="Preview" className="max-h-72 w-full sm:w-auto rounded-3xl border border-slate-700 shadow-2xl object-cover" />
                ) : (
                  <video src={media.url} controls className="max-h-72 w-full sm:w-auto rounded-3xl border border-slate-700 shadow-2xl" />
                )}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button type="button" onClick={() => setMedia(null)} className="p-2 bg-black/60 backdrop-blur-md rounded-xl text-white hover:bg-red-600 transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {media.type === 'image' && !showEditInput && (
                  <button 
                    type="button"
                    onClick={() => setShowEditInput(true)}
                    className="absolute bottom-4 left-4 px-4 py-2 bg-indigo-600 rounded-xl text-xs font-black text-white flex items-center space-x-2 shadow-xl hover:bg-indigo-500 transition-colors"
                  >
                    <Wand2 size={14} />
                    <span>REFINE WITH AI</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="mt-4 p-8 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-slate-500 space-y-3 bg-white/5 group-hover:border-indigo-500/30 transition-all">
                <AlertCircle size={32} strokeWidth={1.5} className="text-indigo-400/50" />
                <p className="text-xs font-black uppercase tracking-widest text-center">Visual Signal Required</p>
                <p className="text-[10px] text-slate-600 text-center max-w-[200px]">Lumina is a multi-modal network. Every insight must be accompanied by a visual.</p>
              </div>
            )}

            {showMusicPicker && (
              <div className="mt-6 p-6 glass rounded-[2rem] border border-indigo-500/20 animate-fluid-in">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-app-text">Neural Sonic Suggestions</h4>
                  <button type="button" onClick={() => setShowMusicPicker(false)}><X size={16} className="text-app-muted" /></button>
                </div>
                {loadingSongs ? (
                  <div className="flex justify-center py-4"><Loader2 size={24} className="animate-spin text-app-accent" /></div>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {suggestedSongs.map((song, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => { setSelectedSong(song); setShowMusicPicker(false); }}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all text-left"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><Play size={10} fill="currentColor" /></div>
                          <span className="text-xs font-medium text-app-text">{song}</span>
                        </div>
                        <Sparkles size={12} className="text-indigo-400 opacity-40" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800/50">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-3 rounded-2xl border transition-all ${media ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-slate-900/50 text-slate-400 hover:text-indigo-400 border-slate-800'}`}
                  title="Upload Visual"
                >
                  <ImageIcon size={22} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowMusicPicker(!showMusicPicker)}
                  className={`p-3 rounded-2xl border transition-all ${selectedSong ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-900/50 text-slate-400 hover:text-amber-400 border-slate-800'}`}
                  title="Select Sonic Frequency"
                >
                  <Music size={22} />
                </button>
                <button
                  type="button"
                  onClick={handleGenerateVideo}
                  disabled={isProcessing || !content.trim()}
                  className="p-3 bg-slate-900/50 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-2xl border border-slate-800 transition-all disabled:opacity-30"
                  title="AI Video Synthesis"
                >
                  <Film size={22} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
              </div>

              <div className="flex items-center space-x-4">
                <button
                  type="submit"
                  disabled={isProcessing || !media}
                  className={`px-8 py-3.5 rounded-3xl font-black text-white flex items-center space-x-3 disabled:opacity-30 shadow-xl transition-all ${!media ? 'grayscale cursor-not-allowed' : (postType === 'reel' ? 'bg-gradient-to-r from-pink-500 to-rose-500 scale-105' : 'merit-gradient scale-105')}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span className="uppercase text-[10px] tracking-widest font-black">Processing...</span>
                    </>
                  ) : (
                    <>
                      <span className="uppercase text-[10px] font-black tracking-widest">Broadcast</span>
                      <Send size={20} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
