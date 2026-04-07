
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProblemInput from './components/ProblemInput';
import SolutionViewer from './components/SolutionViewer';
import ClarificationChat from './components/ClarificationChat';
import SavedHistory from './components/SavedHistory';
import { getGeminiResponse } from './services/geminiService';
import { AnalysisResult, FileData, SavedAnalysis, ChatMessage } from './types';

const STORAGE_KEY = 'solvewise_pro_vault';

const App: React.FC = () => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [initialPrompt, setInitialPrompt] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setSavedAnalyses(JSON.parse(stored)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedAnalyses));
  }, [savedAnalyses]);

  const handleProblemSubmit = async (text: string, file?: FileData) => {
    setIsLoading(true);
    setError(null);
    setInitialPrompt(text);

    const firstMsg: ChatMessage = { 
      role: 'user', 
      text, 
      timestamp: Date.now(), 
      file 
    };

    try {
      const result = await getGeminiResponse(text, [], file);
      setAnalysis(result);
      setChatHistory([
        firstMsg,
        { role: 'model', text: result.summary, timestamp: Date.now() }
      ]);
    } catch (err) {
      setError('Analysis failed. Try describing your problem differently.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUp = async (text: string, file?: FileData) => {
    setIsLoading(true);
    setError(null);

    const userMsg: ChatMessage = { 
      role: 'user', 
      text: text || "Follow up question", 
      timestamp: Date.now(), 
      file 
    };
    
    // Add user message to UI immediately for better UX
    setChatHistory(prev => [...prev, userMsg]);

    try {
      const result = await getGeminiResponse(text, chatHistory, file);
      setAnalysis(result);
      setChatHistory(prev => [
        ...prev,
        { role: 'model', text: result.summary, timestamp: Date.now() }
      ]);
    } catch (err) {
      setError('Failed to process message.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClarification = async (responses: Record<string, string>) => {
    const formatted = Object.entries(responses).map(([q, a]) => `Q: ${q}\nA: ${a}`).join('\n');
    handleFollowUp(`Clarification details:\n${formatted}`);
  };

  const handleSave = () => {
    if (!analysis) return;
    const item: SavedAnalysis = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      title: initialPrompt.slice(0, 50) + '...',
      analysis,
      chatHistory
    };
    setSavedAnalyses(prev => [item, ...prev]);
  };

  const handleLoadSaved = (item: SavedAnalysis) => {
    setAnalysis(item.analysis);
    setChatHistory(item.chatHistory);
    setInitialPrompt(item.title);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => {
    setAnalysis(null);
    setChatHistory([]);
    setError(null);
    setInitialPrompt('');
  };

  const isSaved = savedAnalyses.some(s => s.timestamp === chatHistory[0]?.timestamp);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow max-w-4xl mx-auto px-4 py-12 w-full space-y-12">
        <section className="text-center space-y-4">
          <h2 className="text-4xl font-extrabold text-slate-900">
            {analysis ? 'Resolution Progress' : 'Problem Solver'}
          </h2>
          {!analysis && (
            <p className="text-slate-500 max-w-lg mx-auto">
              Tell me what's wrong, upload photos, and let's find a solution together.
            </p>
          )}
        </section>

        {!analysis && (
          <div className="space-y-16">
            <ProblemInput onSubmit={handleProblemSubmit} isLoading={isLoading} />
            <SavedHistory items={savedAnalyses} onSelect={handleLoadSaved} onDelete={(id) => setSavedAnalyses(s => s.filter(x => x.id !== id))} />
          </div>
        )}

        {error && <div className="p-4 bg-red-100 text-red-700 rounded-xl text-center">{error}</div>}

        {analysis && (
          <div className="space-y-8">
            <button onClick={reset} className="text-slate-400 hover:text-indigo-600 flex items-center gap-2 text-sm font-bold no-print">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              New Problem
            </button>

            {analysis.needsClarification ? (
              <ClarificationChat questions={analysis.clarificationQuestions || []} onResponse={handleClarification} isLoading={isLoading} />
            ) : (
              <SolutionViewer 
                analysis={analysis} 
                chatHistory={chatHistory} 
                onSave={handleSave} 
                isSaved={isSaved}
                onSendMessage={handleFollowUp}
                isLoading={isLoading}
              />
            )}
          </div>
        )}

        {isLoading && !analysis && (
          <div className="text-center space-y-4 py-12">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-400 font-medium">Synthesizing solution...</p>
          </div>
        )}
      </main>

      <footer className="py-6 bg-white border-t text-center text-xs text-slate-400 uppercase tracking-widest font-bold">
        SolveWise AI • Powered by Gemini
      </footer>
    </div>
  );
};

export default App;
