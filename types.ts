
export enum ProblemCategory {
  TECHNICAL = 'Technical',
  INTERPERSONAL = 'Interpersonal',
  LOGICAL = 'Logical/Math',
  CREATIVE = 'Creative',
  BUSINESS = 'Business/Strategy',
  PERSONAL = 'Personal/Life',
  OTHER = 'Other'
}

export interface SolutionStep {
  title: string;
  description: string;
  tips?: string[];
}

export interface AnalysisResult {
  category: ProblemCategory;
  summary: string;
  needsClarification: boolean;
  clarificationQuestions?: string[];
  solutionSteps?: SolutionStep[];
  estimatedDifficulty: 'Easy' | 'Medium' | 'Hard' | 'Complex';
  estimatedTime: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  file?: FileData;
}

export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}

export interface SavedAnalysis {
  id: string;
  timestamp: number;
  title: string;
  analysis: AnalysisResult;
  chatHistory: ChatMessage[];
}
