
import { GoogleGenAI, Type } from "@google/genai";

export const analyzePostQuality = async (content: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following social media post for quality, depth, and originality. 
      Decide if it deserves a special merit badge. 
      Return the analysis in JSON format.
      
      Post: "${content}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            color: { type: Type.STRING },
            description: { type: Type.STRING },
            score: { type: Type.NUMBER }
          },
          required: ["label", "color", "description", "score"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
};

export const getPersonalizedStrategy = async (username: string, pastContent: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User ${username} has been posting about: "${pastContent}". 
      Suggest 3 high-merit content ideas and 3 trending song themes that would fit their niche in a futurist, high-tech social network called Lumina.
      Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ideas: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            songs: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["ideas", "songs"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Strategy Engine Error:", error);
    return { ideas: ["Deep dive into Neural Ethics", "Visualizing 2050 architecture", "Meritocracy vs Attention Economy"], songs: ["Ethereal Pulse - SynthWave", "Cybernetic Dreams", "Digital Renaissance"] };
  }
};

export const enhanceImageWithAI = async (base64Image: string, prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Extract data and mimeType from base64 string
  const mimeTypeMatch = base64Image.match(/^data:([^;]+);base64,/);
  const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/png';
  const data = base64Image.replace(/^data:[^;]+;base64,/, '');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: `Precisely edit this image based on this instruction: ${prompt}. Maintain high visual quality. Return only the edited image.` },
        ],
      },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Enhancement Error:", error);
    return null;
  }
};

export const generateVideoWithAI = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Video Generation Error:", error);
    throw error;
  }
};
