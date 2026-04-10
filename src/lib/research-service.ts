import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getGeminiModel = (modelName: string = "gemini-2.0-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};

export interface ResearchStepData {
  type: 'decomposition' | 'search' | 'reasoning' | 'retrieval' | 'summary';
  content: string;
  metadata?: any;
  tokenUsage?: number;
  cost?: number;
}

// Mock research simulation for UI demonstration
export async function simulateResearch(query: string, onStep: (step: ResearchStepData) => void) {
  // 1. Decomposition
  onStep({
    type: 'decomposition',
    content: `Breaking down query: "${query}"\n\n1. Identify core concepts.\n2. Search for recent developments.\n3. Synthesize findings.`,
    tokenUsage: 150,
    cost: 0.00015
  });
  await new Promise(r => setTimeout(r, 1500));

  // 2. Search/Retrieval
  onStep({
    type: 'retrieval',
    content: "Searching knowledge base and external sources...",
    metadata: { sources: ["Source A", "Source B", "Source C"] },
    tokenUsage: 450,
    cost: 0.00045
  });
  await new Promise(r => setTimeout(r, 2000));

  // 3. Reasoning
  onStep({
    type: 'reasoning',
    content: "Analyzing retrieved data for patterns and contradictions. Applying memory constraints (Max 2K tokens).",
    tokenUsage: 800,
    cost: 0.0008
  });
  await new Promise(r => setTimeout(r, 2500));

  // 4. Summary
  onStep({
    type: 'summary',
    content: "Final synthesis complete. Based on the research, the key findings are...",
    tokenUsage: 300,
    cost: 0.0003
  });
}
