
import React from 'react';
import { Story, User } from '../types';
import { Plus, Sparkles } from 'lucide-react';

interface StoryBarProps {
  stories: Story[];
  currentUser: User;
  onAddStory: () => void;
  onViewStory: (story: Story) => void;
}

const StoryBar: React.FC<StoryBarProps> = ({ stories, currentUser, onAddStory, onViewStory }) => {
  return (
    <div className="flex items-center space-x-4 sm:space-x-6 py-2 sm:py-4 px-1 overflow-x-auto no-scrollbar scroll-smooth">
      {/* Current User Create Story */}
      <div className="flex-shrink-0 flex flex-col items-center space-y-2 sm:space-y-3 group cursor-pointer" onClick={onAddStory}>
        <div className="relative btn-active">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.8rem] sm:rounded-[2rem] p-[2px] bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center group-hover:border-white/30 transition-all duration-700 overflow-hidden shadow-xl">
             <img src={currentUser.avatar} className="w-full h-full object-cover rounded-[1.6rem] sm:rounded-[1.8rem] opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all" alt="Add" />
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="merit-gradient text-white p-2.5 sm:p-3 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform">
                  {/* Fixed: Replaced responsive size prop with Tailwind classes */}
                  <Plus strokeWidth={3} className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
             </div>
          </div>
        </div>
        <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-app-muted group-hover:text-white transition-colors">Post</span>
      </div>

      {/* Stories List */}
      {stories.map((story) => (
        <div 
          key={story.id} 
          className="flex-shrink-0 flex flex-col items-center space-y-2 sm:space-y-3 group cursor-pointer" 
          onClick={() => onViewStory(story)}
        >
          <div className="relative p-[2px] sm:p-[3px] btn-active">
            {/* Animated Vibrant Border */}
            <div className={`absolute inset-0 rounded-[1.8rem] sm:rounded-[2rem] ${!story.isSeen ? 'merit-gradient' : 'bg-white/10 opacity-30'} transition-opacity`}></div>
            
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-app-bg rounded-[1.65rem] sm:rounded-[1.85rem] p-[2px] sm:p-[2.5px] z-10">
              <img 
                src={story.author.avatar} 
                className={`w-full h-full object-cover rounded-[1.5rem] sm:rounded-[1.7rem] transition-all duration-1000 group-hover:scale-110 ${story.isSeen ? 'opacity-70 grayscale-[0.2]' : ''}`} 
                alt={story.author.username} 
              />
              {story.isHighMerit && (
                <div className="absolute -top-1 -right-1 merit-gradient p-1 rounded-lg border-2 border-app-bg shadow-xl">
                  <Sparkles size={8} className="text-white" />
                </div>
              )}
            </div>
          </div>
          <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-tight transition-colors ${story.isSeen ? 'text-app-muted' : 'text-app-text'}`}>
            @{story.author.username.length > 9 ? story.author.username.substring(0, 7) + '..' : story.author.username}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StoryBar;
