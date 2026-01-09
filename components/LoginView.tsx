import React, { useState } from 'react';
import { 
  Sparkles, 
  Fingerprint, 
  Zap, 
  ShieldCheck, 
  Loader2, 
  Cpu,
  Orbit,
  ArrowRight
} from 'lucide-react';
import { User } from '../types';

interface LoginViewProps {
  onLogin: (user: User, remember: boolean) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSync = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsSyncing(true);
    
    // Simulate neural synchronization delay
    setTimeout(() => {
      const mockUser: User = {
        id: 'u1',
        username: username.toLowerCase().replace(/\s+/g, '_'),
        avatar: `https://picsum.photos/seed/${username}/150/150`,
        meritScore: 1240,
        followersCount: 128
      };
      onLogin(mockUser, rememberMe);
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#010101]">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] merit-gradient opacity-10 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500 opacity-5 blur-[100px] rounded-full animate-pulse-soft" />
      </div>

      <div className="relative w-full max-w-md animate-spring">
        <div className="glass rounded-[3.5rem] p-10 border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 merit-gradient" />
          
          <div className="flex flex-col items-center mb-12">
            <div className="w-20 h-20 merit-gradient rounded-[2rem] flex items-center justify-center text-white shadow-2xl mb-8 group-hover:rotate-12 transition-transform duration-700">
              <Sparkles size={40} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter mb-2">Stud</h1>
            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.4em]">Merit Mesh Node Access</p>
          </div>

          <form onSubmit={handleSync} className="space-y-8">
            <div className="relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 block px-2">Neural Identity (@)</label>
              <div className="glass rounded-2xl p-0.5 border-white/5 focus-within:border-indigo-500/50 transition-all">
                <div className="bg-[#030303]/50 rounded-[14px] flex items-center px-5">
                  <Fingerprint size={18} className="text-slate-600 mr-4" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="enter_node_handle"
                    className="w-full bg-transparent border-none focus:ring-0 py-5 font-mono text-lg font-bold text-white placeholder-slate-800"
                    disabled={isSyncing}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <button 
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center space-x-3 group cursor-pointer"
              >
                <div className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center ${rememberMe ? 'bg-indigo-500 border-indigo-500' : 'border-white/10 bg-white/5 group-hover:border-white/20'}`}>
                  {rememberMe && <ShieldCheck size={12} className="text-white" />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-200 transition-colors">Remember my Signal</span>
              </button>
            </div>

            <button 
              type="submit"
              disabled={isSyncing || !username.trim()}
              className="w-full py-6 merit-gradient rounded-[2rem] text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center space-x-3 active:scale-95 group"
            >
              {isSyncing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Synchronizing...</span>
                </>
              ) : (
                <>
                  <span>Initialize Node Access</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-12 flex flex-col items-center space-y-4 opacity-30">
            <div className="flex space-x-4">
               <Cpu size={16} />
               <Orbit size={16} />
               <Zap size={16} />
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.5em]">Quantum Encrypted Layer 3</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;