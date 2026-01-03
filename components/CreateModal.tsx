
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { User, Post } from '../types';
import CreatePost from './CreatePost';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onPostCreated: (post: Post) => void;
}

const CreateModal: React.FC<CreateModalProps> = ({ isOpen, onClose, currentUser, onPostCreated }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative w-full max-w-2xl transform transition-all animate-fluid-in duration-700"
      >
        <div className="absolute -top-16 right-0">
          <button 
            onClick={onClose}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90"
          >
            <X size={28} />
          </button>
        </div>
        
        <CreatePost 
          currentUser={currentUser} 
          onPostCreated={onPostCreated} 
        />
        
        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">
            Syncing with the Merit Mesh Node Network
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateModal;
