
import React, { useState } from 'react';

interface ClarificationChatProps {
  questions: string[];
  onResponse: (responses: Record<string, string>) => void;
  isLoading: boolean;
}

const ClarificationChat: React.FC<ClarificationChatProps> = ({ questions, onResponse, isLoading }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleChange = (question: string, val: string) => {
    setAnswers(prev => ({ ...prev, [question]: val }));
  };

  const isComplete = questions.every(q => answers[q]?.trim().length > 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Wait! I need a few more details</h2>
          <p className="text-sm text-slate-500">To give you the best advice, please answer these questions:</p>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((question, idx) => (
          <div key={idx} className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block">
              {idx + 1}. {question}
            </label>
            <input
              type="text"
              value={answers[question] || ''}
              onChange={(e) => handleChange(question, e.target.value)}
              placeholder="Your answer..."
              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => onResponse(answers)}
          disabled={!isComplete || isLoading}
          className={`px-8 py-3 rounded-xl font-bold transition-all shadow-md ${
            !isComplete || isLoading
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
          }`}
        >
          {isLoading ? 'Processing...' : 'Continue Analysis'}
        </button>
      </div>
    </div>
  );
};

export default ClarificationChat;
