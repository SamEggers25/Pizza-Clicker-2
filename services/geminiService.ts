
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface LeaderboardEntry {
  name: string;
  score: number;
  region: string;
}

export async function fetchAILoaderboard(userScore: number, userName: string): Promise<LeaderboardEntry[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a list of 5 diverse, realistic-sounding top pizza chefs for a global clicker game leaderboard. 
      The current player is "${userName}" with ${userScore} pizzas. 
      Make 3 players have significantly higher scores (Quadrillions/Quintillions) and 2 players have scores slightly higher or lower than the current player.
      Include a regional emoji and city name for each. 
      Format the response as a JSON array of objects with "name", "score", and "region".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              score: { type: Type.NUMBER },
              region: { type: Type.STRING }
            },
            required: ["name", "score", "region"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to fetch AI leaderboard:", error);
    // Fallback data if API fails
    return [
      { name: "Napoli_Master_99", score: 5.2e18, region: "🇮🇹 Naples" },
      { name: "DeepDish_Dan", score: 1.1e15, region: "🇺🇸 Chicago" },
      { name: "xX_CrustLord_Xx", score: userScore * 1.5, region: "🇬🇧 London" },
      { name: "PizzaPrincess", score: userScore * 0.8, region: "🇯🇵 Tokyo" },
      { name: "The_Calzone_Zone", score: 9.9e21, region: "🇮🇹 Rome" }
    ];
  }
}
