
import React, { useRef, useState } from 'react';
import { AnalysisResult, ProblemCategory, ChatMessage, FileData } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface SolutionViewerProps {
  analysis: AnalysisResult;
  chatHistory: ChatMessage[];
  onSave?: () => void;
  isSaved?: boolean;
  onSendMessage: (text: string, file?: FileData) => void;
  isLoading: boolean;
}

const SolutionViewer: React.FC<SolutionViewerProps> = ({ 
  analysis, 
  chatHistory, 
  onSave, 
  isSaved, 
  onSendMessage,
  isLoading 
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedFile({
        base64: (reader.result as string).split(',')[1],
        mimeType: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSend = () => {
    if (!chatInput.trim() && !selectedFile) return;
    onSendMessage(chatInput, selectedFile || undefined);
    setChatInput('');
    setSelectedFile(null);
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return;
    setIsExporting(true);

    try {
      const element = contentRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        // Ensure we capture all images
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('pdf-content');
          if (el) el.style.height = 'auto';
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`SolveWise_Resolution_${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to generate PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2 no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">!</div>
          <h2 className="text-2xl font-bold text-slate-900">Problem Resolved</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 transition-all"
          >
            {isExporting ? 'Exporting...' : 'Download Full PDF'}
          </button>

          {onSave && (
            <button
              onClick={onSave}
              disabled={isSaved}
              className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                isSaved ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {isSaved ? 'Saved' : 'Save Session'}
            </button>
          )}
        </div>
      </div>

      {/* Exportable Content Area */}
      <div id="pdf-content" ref={contentRef} className="space-y-8 bg-slate-50 p-6 rounded-3xl print:p-0 print:bg-white">
        
        {/* PDF Brand Header */}
        <div className="hidden print-only border-b-2 border-indigo-600 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-indigo-600">SolveWise Resolution Report</h1>
          <p className="text-slate-500 text-sm">Case Reference: {Date.now()} • {new Date().toLocaleString()}</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-xl">{getCategoryIcon(analysis.category)}</div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Category</p>
              <p className="font-bold text-slate-900">{analysis.category}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-xl">⚠️</div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Difficulty</p>
              <p className="font-bold text-slate-900">{analysis.estimatedDifficulty}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-xl">⏱️</div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Est. Time</p>
              <p className="font-bold text-slate-900">{analysis.estimatedTime}</p>
            </div>
          </div>
        </div>

        {/* Structured Roadmap */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Structured Roadmap
          </h3>

          <div className="space-y-10 relative">
            <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-slate-100 hidden sm:block"></div>
            {analysis.solutionSteps?.map((step, idx) => (
              <div key={idx} className="relative pl-0 sm:pl-10">
                <div className="absolute left-0 top-1.5 w-6 h-6 bg-white border-2 border-indigo-600 rounded-full z-10 hidden sm:flex items-center justify-center">
                   <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase mb-1 block">Step {idx + 1}</span>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h4>
                  <p className="text-slate-600 leading-relaxed mb-4">{step.description}</p>
                  {step.tips && (
                    <div className="flex flex-wrap gap-2">
                      {step.tips.map((tip, tIdx) => (
                        <span key={tIdx} className="text-xs bg-amber-50 text-amber-800 px-2 py-1 rounded border border-amber-100">💡 {tip}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat History & Images Section */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            Discussion & Evidence
          </h3>
          
          <div className="space-y-6">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                  {msg.file && (
                    <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
                      <img 
                        src={`data:${msg.file.mimeType};base64,${msg.file.base64}`} 
                        alt="Evidence" 
                        className="w-full max-h-64 object-contain bg-black/5" 
                      />
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  <span className="text-[10px] opacity-60 mt-2 block">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PDF Footer Disclaimer */}
        <div className="hidden print-only pt-8 text-center text-slate-400 text-xs italic border-t border-slate-100">
          SolveWise AI Analysis • Proprietary Solution Roadmap • Page 1
        </div>
      </div>

      {/* Persistent Chat Input (No-Print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-lg sticky bottom-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a follow-up question..."
              className="w-full h-24 p-4 pr-12 bg-slate-50 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <button 
                onClick={() => fileRef.current?.click()}
                className="p-2 text-slate-400 hover:text-indigo-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
              </button>
              <input type="file" ref={fileRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
          </div>

          {selectedFile && (
            <div className="text-xs bg-indigo-50 text-indigo-700 p-2 rounded flex items-center justify-between">
              <span>Attached: {selectedFile.name}</span>
              <button onClick={() => setSelectedFile(null)}>×</button>
            </div>
          )}

          <div className="flex justify-between items-center">
            <p className="text-[10px] text-slate-400 font-medium italic">Gemini is ready to help further.</p>
            <button
              onClick={handleSend}
              disabled={isLoading || (!chatInput.trim() && !selectedFile)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
            >
              {isLoading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionViewer;
