
import { GoogleGenAI, Type } from "@google/genai";
import { User } from "../types";

// Mock global registry of existing nodes
const RESERVED_USERNAMES = [
  'deep_thinker',
  'aesthetic_lab',
  'quantum_coder',
  'zen_architect',
  'neuro_traveler',
  'data_druid',
  'logic_gate',
  'innovator_alex'
];

export const checkUsernameAvailability = async (username: string): Promise<{ available: boolean; reason?: string }> => {
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const normalized = username.toLowerCase().trim();
  if (normalized.length < 3) return { available: false, reason: 'Identifier too short' };
  if (RESERVED_USERNAMES.includes(normalized)) return { available: false, reason: 'Neural address already claimed' };
  
  return { available: true };
};

export const suggestUniqueHandles = async (baseName: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The username "${baseName}" is taken on our futurist social network "Stud". 
      Suggest 5 unique, cool, and high-tech alternatives that aren't in this list: ${RESERVED_USERNAMES.join(', ')}.
      Return as JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Handle Suggestion Error:", error);
    return [`${baseName}_node`, `prime_${baseName}`, `synapse_${baseName}`];
  }
};
