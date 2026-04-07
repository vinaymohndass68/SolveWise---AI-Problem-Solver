
import React from 'react';
import { SavedAnalysis, ProblemCategory } from '../types';

interface SavedHistoryProps {
  items: SavedAnalysis[];
  onSelect: (item: SavedAnalysis) => void;
  onDelete: (id: string) => void;
}

const SavedHistory: React.FC<SavedHistoryProps> = ({ items, onSelect, onDelete }) => {
  if (items.length === 0) return null;

  const getCategoryIcon = (category: ProblemCategory) => {
    switch (category) {
      case ProblemCategory.TECHNICAL: return '💻';
      case ProblemCategory.INTERPERSONAL: return '🤝';
      case ProblemCategory.LOGICAL: return '🧠';
      case ProblemCategory.CREATIVE: return '🎨';
      case ProblemCategory.BUSINESS: return '💼';
      case ProblemCategory.PERSONAL: return '🧘';
      default: return '✨';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <h3 className="text-xl font-bold text-slate-900">Recent Solutions</h3>
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{items.length} Saved</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div 
            key={item.id}
            className="group relative bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer overflow-hidden"
            onClick={() => onSelect(item)}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center text-2xl transition-colors">
                {getCategoryIcon(item.analysis.category)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                  {item.analysis.category}
                </p>
                <h4 className="text-slate-900 font-bold truncate pr-6">{item.title}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(item.timestamp).toLocaleDateString(undefined, { 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedHistory;
