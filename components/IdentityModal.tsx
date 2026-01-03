
import React, { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Loader2, Sparkles, Fingerprint, Zap } from 'lucide-react';
import { User } from '../types';
import { checkUsernameAvailability, suggestUniqueHandles } from '../services/userService';

interface IdentityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onIdentityUpdate: (updatedUser: User) => void;
}

const IdentityModal: React.FC<IdentityModalProps> = ({ isOpen, onClose, currentUser, onIdentityUpdate }) => {
  const [handle, setHandle] = useState(currentUser.username);
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (handle !== currentUser.username && handle.length >= 3) {
      const timer = setTimeout(async () => {
        setStatus('checking');
        const { available, reason } = await checkUsernameAvailability(handle);
        if (available) {
          setStatus('available');
          setError('');
          setSuggestions([]);
        } else {
          setStatus('taken');
          setError(reason || 'Identifier unavailable');
          fetchSuggestions();
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setStatus('idle');
      setError('');
    }
  }, [handle, currentUser.username]);

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    const res = await suggestUniqueHandles(handle);
    setSuggestions(res);
    setLoadingSuggestions(false);
  };

  const handleUpdate = async () => {
    if (status !== 'available' && handle !== currentUser.username) return;
    setIsUpdating(true);
    // Simulate API update
    await new Promise(resolve => setTimeout(resolve, 1000));
    onIdentityUpdate({ ...currentUser, username: handle });
    setIsUpdating(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl" onClick={onClose} />
      
      <div className="relative w-full max-w-lg glass rounded-[3rem] p-10 border-white/10 shadow-2xl animate-fluid-in">
        <div className="absolute top-0 left-0 w-full h-1 merit-gradient" />
        
        <div className="flex items-center space-x-4 mb-8">
          <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400">
            <Fingerprint size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight">Identity Node</h2>
            <p className="text-[10px] text-app-muted font-black uppercase tracking-[0.3em]">Unique Signal Registry</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Network Handle (@)</label>
            <div className={`relative transition-all duration-500 rounded-2xl p-0.5 ${
              status === 'available' ? 'bg-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 
              status === 'taken' ? 'bg-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]' : 
              'bg-white/10'
            }`}>
              <div className="bg-[#030303] rounded-[14px] flex items-center px-4">
                <span className="text-slate-500 font-black">@</span>
                <input 
                  type="text" 
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="enter_unique_handle"
                  className="w-full bg-transparent border-none focus:ring-0 py-4 font-mono text-lg font-bold text-white placeholder-slate-800"
                />
                <div className="flex items-center">
                  {status === 'checking' && <Loader2 size={20} className="animate-spin text-indigo-500" />}
                  {status === 'available' && <div className="text-emerald-500 bg-emerald-500/10 p-1.5 rounded-lg"><Check size={16} /></div>}
                  {status === 'taken' && <div className="text-rose-500 bg-rose-500/10 p-1.5 rounded-lg"><AlertCircle size={16} /></div>}
                </div>
              </div>
            </div>
            
            {status === 'taken' && (
              <p className="mt-3 text-[10px] font-black text-rose-400 uppercase tracking-widest flex items-center">
                <Zap size={12} className="mr-1.5" />
                {error}
              </p>
            )}
            {status === 'available' && (
              <p className="mt-3 text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center">
                <Check size={12} className="mr-1.5" />
                Signal Clear - Unique Node Found
              </p>
            )}
          </div>

          {suggestions.length > 0 && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles size={14} className="text-indigo-400" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI Suggested Hubs</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button 
                    key={s}
                    onClick={() => setHandle(s)}
                    className="px-4 py-2 bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/10 rounded-xl text-xs font-bold text-slate-300 transition-all"
                  >
                    @{s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-white/5">
            <button 
              onClick={handleUpdate}
              disabled={isUpdating || (status !== 'available' && handle !== currentUser.username) || handle.length < 3}
              className="w-full py-5 merit-gradient rounded-[1.8rem] text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center space-x-3 active:scale-95"
            >
              {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
              <span>{isUpdating ? 'Recalibrating Node...' : 'Synchronize Identity'}</span>
            </button>
            <button 
              onClick={onClose}
              className="w-full mt-4 py-4 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
            >
              Abort Signal Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdentityModal;
