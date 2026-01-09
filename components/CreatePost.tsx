
import React, { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Send, 
  Sparkles, 
  Loader2, 
  X, 
  Wand2, 
  Film, 
  AlertCircle, 
  Music, 
  Play, 
  ChevronRight,
  Palette,
  Eraser,
  Camera
} from 'lucide-react';
import { analyzePostQuality, enhanceImageWithAI, generateVideoWithAI, getPersonalizedStrategy } from '../services/geminiService';
import { Post, User } from '../types';

interface CreatePostProps {
  currentUser: User;
  onPostCreated: (post: Post) => void;
}

const PRESETS = [
  { label: "Retro Synth", prompt: "Apply a 1980s retro synthwave aesthetic with neon colors and subtle grain." },
  { label: "Noir Tech", prompt: "Convert to a high-contrast black and white cinematic noir style with sharp details." },
  { label: "Remove Noise", prompt: "Remove distracting background elements and people, keeping only the main subject clear." },
  { label: "Cyberpunk", prompt: "Add futuristic holographic elements and cyberpunk blue/pink lighting." },
];

const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<{ url: string, type: 'image' | 'video' } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [showNeuralLab, setShowNeuralLab] = useState(false);
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

  const handleRefineImage = async (customPrompt?: string) => {
    const promptToUse = customPrompt || editPrompt;
    if (!media || media.type !== 'image' || !promptToUse) return;
    
    setIsProcessing(true);
    const result = await enhanceImageWithAI(media.url, promptToUse);
    if (result) {
      setMedia({ url: result, type: 'image' });
      setEditPrompt('');
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
    <div className="glass rounded-[3rem] p-10 border-white/5 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden group transition-all duration-500 hover:border-white/10">
      <div className="flex items-center space-x-4 mb-8">
        <button 
          onClick={() => setPostType('post')}
          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${postType === 'post' ? 'merit-gradient text-white border-transparent shadow-[0_0_20px_rgba(255,0,128,0.3)]' : 'bg-white/5 text-slate-500 border-white/5 hover:text-slate-300'}`}
        >
          Signal Post
        </button>
        <button 
          onClick={() => setPostType('reel')}
          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${postType === 'reel' ? 'bg-indigo-500 text-white border-transparent shadow-[0_0_20px_rgba(99,102,241,0.3)]' : 'bg-white/5 text-slate-500 border-white/5 hover:text-slate-300'}`}
        >
          Visual Reel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="flex flex-col space-y-6">
          <div className="flex items-start space-x-6">
            <div className="relative shrink-0">
              <img src={currentUser.avatar} alt="Profile" className="w-16 h-16 rounded-2xl border border-white/10 shadow-xl object-cover" />
              <div className="absolute -bottom-1 -right-1 bg-indigo-500 p-1 rounded-lg border-2 border-[var(--app-bg)] shadow-lg">
                <Sparkles size={12} className="text-white" />
              </div>
            </div>
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={postType === 'reel' ? "Describe your video frequency..." : "Broadcast high-signal ideas..."}
              className="flex-1 bg-transparent border-none focus:ring-0 text-2xl font-semibold text-white placeholder-slate-700 resize-none min-h-[120px] pt-2"
            />
          </div>
          
          {selectedSong && (
            <div className="inline-flex items-center space-x-3 self-start px-5 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl animate-spring">
              <Music size={14} className="text-indigo-400 animate-pulse" />
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">{selectedSong}</span>
              <button onClick={() => setSelectedSong(null)} className="text-slate-500 hover:text-white transition-colors ml-2">
                <X size={14} />
              </button>
            </div>
          )}
          
          {media ? (
            <div className="relative group/media w-full animate-spring">
              {media.type === 'image' ? (
                <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                  <img src={media.url} alt="Preview" className="w-full max-h-[500px] object-cover transition-transform duration-[2s] group-hover/media:scale-[1.02]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity" />
                  
                  {/* Neural Lab Trigger Overlay */}
                  {!showNeuralLab && (
                    <button 
                      type="button"
                      onClick={() => setShowNeuralLab(true)}
                      className="absolute bottom-6 left-6 px-6 py-3.5 bg-white/10 backdrop-blur-2xl rounded-2xl text-[10px] font-black text-white flex items-center space-x-3 shadow-2xl border border-white/20 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-all group/lab"
                    >
                      <Wand2 size={16} className="text-indigo-400 group-hover/lab:rotate-12 transition-transform" />
                      <span>OPEN NEURAL LAB</span>
                    </button>
                  )}
                </div>
              ) : (
                <video src={media.url} controls className="w-full max-h-[500px] rounded-[2.5rem] border border-white/10 shadow-2xl" />
              )}
              
              <button type="button" onClick={() => { setMedia(null); setShowNeuralLab(false); }} className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-xl rounded-2xl text-white hover:bg-rose-600 transition-all active:scale-90 border border-white/10">
                <X size={20} />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 p-12 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600 space-y-4 bg-white/[0.02] hover:bg-white/[0.04] hover:border-indigo-500/30 transition-all cursor-pointer group/upload"
            >
              <div className="p-6 bg-indigo-500/5 rounded-[2rem] group-hover/upload:scale-110 transition-transform">
                <Camera size={40} strokeWidth={1.5} className="text-indigo-500/40" />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.3em]">Ingest Visual Signal</p>
                <p className="text-[9px] text-slate-600 mt-2 max-w-[240px] leading-relaxed uppercase tracking-widest font-bold">Lumina requires a multimodal anchor for every broadcast.</p>
              </div>
            </div>
          )}

          {/* Neural Lab Interface */}
          {showNeuralLab && media?.type === 'image' && (
            <div className="mt-6 p-8 glass rounded-[2.5rem] border-indigo-500/30 bg-indigo-500/[0.03] animate-spring">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-indigo-500/10 rounded-xl">
                    <Palette size={20} className="text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-white">Neural Lab</h4>
                    <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-widest mt-1">Powered by Gemini 2.5 Flash Image</p>
                  </div>
                </div>
                <button type="button" onClick={() => setShowNeuralLab(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleRefineImage(preset.prompt)}
                    disabled={isProcessing}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all text-left group/preset disabled:opacity-50"
                  >
                    <p className="text-[10px] font-black text-white uppercase tracking-widest group-hover/preset:text-indigo-400 transition-colors">{preset.label}</p>
                    <p className="text-[8px] text-slate-500 mt-1 line-clamp-1">{preset.prompt}</p>
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="glass rounded-2xl p-0.5 border-white/10 focus-within:border-indigo-500/50 transition-all bg-[#030303]">
                  <div className="flex items-center px-4">
                    <Eraser size={18} className="text-slate-600 mr-4" />
                    <input 
                      type="text" 
                      value={editPrompt}
                      onChange={(e) => setEditPrompt(e.target.value)}
                      placeholder="e.g. 'Add a retro glitch filter' or 'Convert to watercolor'..."
                      className="w-full bg-transparent border-none focus:ring-0 py-5 text-sm font-medium text-white placeholder-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => handleRefineImage()}
                      disabled={isProcessing || !editPrompt.trim()}
                      className="p-3 bg-indigo-500 text-white rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                    >
                      {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showMusicPicker && (
            <div className="mt-6 p-8 glass rounded-[2.5rem] border-white/5 animate-spring">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Sonic Selection</h4>
                <button type="button" onClick={() => setShowMusicPicker(false)}><X size={16} className="text-slate-500 hover:text-white" /></button>
              </div>
              {loadingSongs ? (
                <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin text-indigo-500" /></div>
              ) : (
                <div className="space-y-2">
                  {suggestedSongs.map((song, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setSelectedSong(song); setShowMusicPicker(false); }}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all text-left group/song"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover/song:scale-110 transition-transform"><Play size={12} fill="currentColor" /></div>
                        <span className="text-xs font-bold text-white">{song}</span>
                      </div>
                      <Sparkles size={14} className="text-indigo-400 opacity-40 group-hover/song:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-10 pt-8 border-t border-white/5">
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-[1.5rem] border transition-all active:scale-90 ${media ? 'bg-indigo-500 text-white border-transparent shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-slate-500 hover:text-white border-white/5 hover:bg-white/10'}`}
                title="Upload Visual"
              >
                <ImageIcon size={24} />
              </button>
              <button
                type="button"
                onClick={() => setShowMusicPicker(!showMusicPicker)}
                className={`p-4 rounded-[1.5rem] border transition-all active:scale-90 ${selectedSong ? 'merit-gradient text-white border-transparent shadow-lg shadow-pink-500/20' : 'bg-white/5 text-slate-500 hover:text-white border-white/5 hover:bg-white/10'}`}
                title="Select Sonic Frequency"
              >
                <Music size={24} />
              </button>
              <button
                type="button"
                onClick={handleGenerateVideo}
                disabled={isProcessing || !content.trim()}
                className="p-4 bg-white/5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-[1.5rem] border border-white/5 transition-all active:scale-90 disabled:opacity-30"
                title="AI Video Synthesis"
              >
                <Film size={24} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*" />
            </div>

            <button
              type="submit"
              disabled={isProcessing || !media}
              className={`px-10 py-4 rounded-[1.8rem] font-black text-white flex items-center space-x-4 disabled:opacity-30 shadow-2xl transition-all active:scale-95 ${!media ? 'grayscale cursor-not-allowed bg-white/5' : 'merit-gradient hover:scale-105'}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span className="uppercase text-[11px] tracking-[0.2em]">Processing</span>
                </>
              ) : (
                <>
                  <span className="uppercase text-[11px] tracking-[0.2em]">Broadcast Signal</span>
                  <Send size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
