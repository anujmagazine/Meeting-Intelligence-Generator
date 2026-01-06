
import { GoogleGenAI, Type, GenerateContentParameters } from "@google/genai";
import { MeetingAnalysis } from "../types";

// Always use process.env.API_KEY directly for initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MEETING_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    date: { type: Type.STRING },
    summary: { type: Type.STRING },
    keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
    decisions: { type: Type.ARRAY, items: { type: Type.STRING } },
    actionItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          task: { type: Type.STRING },
          owner: { type: Type.STRING },
          priority: { type: Type.STRING },
        },
        required: ["task", "owner", "priority"],
      },
    },
    sentimentTimeline: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING },
          sentiment: { type: Type.NUMBER },
          label: { type: Type.STRING },
        },
        required: ["time", "sentiment", "label"],
      },
    },
    deepInsights: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          insight: { type: Type.STRING },
          evidence: { type: Type.STRING },
          significance: { type: Type.STRING },
        },
        required: ["category", "insight", "evidence", "significance"],
      },
    },
    unspokenDynamics: { type: Type.STRING },
    strategicAlignment: { type: Type.STRING },
  },
  required: ["title", "summary", "keyTakeaways", "decisions", "actionItems", "sentimentTimeline", "deepInsights", "unspokenDynamics", "strategicAlignment"],
};

export async function analyzeMeeting(input: string | { data: string; mimeType: string }): Promise<MeetingAnalysis> {
  const isAudio = typeof input !== 'string';
  
  const prompt = `Analyze this meeting content deeply. Provide a professional summary, key takeaways, decisions, and action items. 
  Crucially, look for "non-obvious" insights: identify hidden tensions, unspoken assumptions, power dynamics, creative breakthroughs that weren't fully explored, and strategic alignment with broader goals.
  
  For the sentiment timeline, map the meeting's emotional flow over 5-8 key segments. 
  For deep insights, focus on the psychological and organizational layers that aren't visible on the surface.`;

  const contents: any = isAudio 
    ? { parts: [{ inlineData: input }, { text: prompt }] }
    : { parts: [{ text: `Meeting Transcript: ${input}\n\n${prompt}` }] };

  // Generate analysis using gemini-3-flash-preview for meeting summarization task.
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: MEETING_ANALYSIS_SCHEMA,
    },
  });

  // Access the text property directly on the response object.
  if (!response.text) {
    throw new Error("Failed to get analysis from Gemini.");
  }

  return JSON.parse(response.text);
}
