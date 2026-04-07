
import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { AnalysisResult, ProblemCategory, FileData, ChatMessage } from "../types";

const API_KEY = process.env.API_KEY || '';

export const getGeminiResponse = async (
  prompt: string,
  history: ChatMessage[],
  file?: FileData
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `You are a world-class problem solver. 
  If this is the FIRST interaction, categorize the problem and provide a roadmap.
  If this is a FOLLOW-UP chat, address the user's specific questions while keeping the structured roadmap in mind.
  
  ALWAYS respond in the specified JSON format.
  - If you are just answering a question in chat, put your answer in the "summary" field and keep "solutionSteps" as they were or update them if the solution has changed.
  - needsClarification should only be true if you absolutely cannot provide a solution yet.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: "Current category of the problem.",
      },
      summary: {
        type: Type.STRING,
        description: "Your main response or answer to the user's query.",
      },
      needsClarification: {
        type: Type.BOOLEAN,
        description: "True if more information is needed.",
      },
      clarificationQuestions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      solutionSteps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["title", "description"],
        },
      },
      estimatedDifficulty: { type: Type.STRING },
      estimatedTime: { type: Type.STRING },
    },
    required: ["category", "summary", "needsClarification", "estimatedDifficulty", "estimatedTime"],
  };

  const currentParts: any[] = [{ text: prompt }];
  if (file) {
    currentParts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.base64,
      },
    });
  }

  // Map history to Gemini format
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [
      { text: msg.text },
      ...(msg.file ? [{ inlineData: { data: msg.file.base64, mimeType: msg.file.mimeType } }] : [])
    ]
  }));

  // Add the current prompt
  contents.push({
    role: 'user',
    parts: currentParts
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents as any,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
      },
    });

    return JSON.parse(response.text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
