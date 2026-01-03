import React, { Fragment } from 'react';
import { Story, User } from '../types';
import { Plus, Sparkles } from 'lucide-react';

interface StoryBarProps {
  stories: Story[];
  currentUser: User;
  onAddStory: () => void;
  onViewStory: (story: Story) => void;
  onNavigateToProfile?: (user: User) => void;
}

// Vertical Signal Thread helper - tightened even further
const VerticalSignal: React.FC = () => (
  <div className="flex flex-col items-center h-8 opacity-20 shrink-0 self-center mx-1">
    <div className="w-px flex-1 bg-gradient-to-b from-transparent via-white/40 to-transparent" />
    <div className="my-1 w-0.5 h-0.5 rounded-full bg-indigo-400 blur-[0.5px]" />
    <div className="w-px flex-1 bg-gradient-to-t from-transparent via-white/40 to-transparent" />
  </div>
);

const StoryBar: React.FC<StoryBarProps> = ({ stories, currentUser, onAddStory, onViewStory, onNavigateToProfile }) => {
  return (
    <div className="flex items-center py-1 px-1 overflow-x-auto no-scrollbar scroll-smooth">
      {/* Compact Add Story Bubble */}
      <div className="flex-shrink-0 flex flex-col items-center group cursor-pointer mr-2" onClick={onAddStory}>
        <div className="relative p-[3px]">
          <div className="relative w-16 h-16 bg-app-bg rounded-[1.8rem] p-[2px] border border-white/10 group-hover:border-indigo-500/50 transition-all duration-500">
             <img src={currentUser.avatar} className="w-full h-full object-cover rounded-[1.6rem] opacity-60 group-hover:opacity-100 transition-all duration-500" alt="Add Story" />
             <div className="absolute -bottom-1 -right-1 merit-gradient text-white p-1 rounded-lg border-2 border-app-bg shadow-xl group-hover:scale-110 transition-transform">
               <Plus size={14} strokeWidth={3} />
             </div>
          </div>
        </div>
      </div>

      {/* Synchronized Bubbles */}
      {stories.map((story, index) => (
        <Fragment key={story.id}>
          <VerticalSignal />
          <div className="flex-shrink-0 flex flex-col items-center group mx-2">
            <div 
              onClick={() => onViewStory(story)}
              className="relative p-[3px] cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              {/* Liquid Border Animation */}
              <div className={`absolute inset-0 rounded-[1.8rem] ${!story.isSeen ? 'merit-gradient animate-pulse-soft' : 'bg-white/10 opacity-30'} transition-all duration-500`}></div>
              
              <div className="relative w-16 h-16 bg-app-bg rounded-[1.6rem] p-[2px] z-10">
                <img 
                  src={story.author.avatar} 
                  className={`w-full h-full object-cover rounded-[1.4rem] transition-all duration-700 group-hover:scale-110 ${story.isSeen ? 'opacity-50 grayscale-[0.4]' : ''}`} 
                  alt={story.author.username} 
                />
                {story.isHighMerit && (
                  <div className="absolute -top-1 -right-1 merit-gradient p-1 rounded-lg border-2 border-app-bg shadow-lg">
                    <Sparkles size={10} className="text-white" />
                  </div>
                )}
              </div>
            </div>
            <span 
              onClick={() => onNavigateToProfile?.(story.author)}
              className={`text-[9px] font-black uppercase tracking-tight mt-1 transition-colors cursor-pointer hover:text-app-accent ${story.isSeen ? 'text-app-muted' : 'text-app-text'}`}
            >
              @{story.author.username.length > 8 ? story.author.username.substring(0, 7) + '..' : story.author.username}
            </span>
          </div>
        </Fragment>
      ))}
    </div>
  );
};

export default StoryBar;