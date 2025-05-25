import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { GEMINI_MODEL_NAME, GEMINI_API_REQUEST_PROMPT } from '../constants';
import { NutritionData, FoodComponent } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API Key not found. Please set process.env.API_KEY. Analysis will not work.");
}
// Initialize GoogleGenAI with API Key
const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" });

export const analyzeFoodImage = async (
  base64ImageData: string,
  mimeType: string
): Promise<NutritionData> => {
  if (!API_KEY) {
     throw new Error("Gemini API Key is not configured. Cannot analyze image.");
  }
  try {
    const imagePart: Part = {
      inlineData: {
        data: base64ImageData.split(',')[1], // Remove the "data:image/jpeg;base64," part
        mimeType: mimeType,
      },
    };

    const textPart: Part = {
      text: GEMINI_API_REQUEST_PROMPT,
    };
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_MODEL_NAME,
        contents: [{ parts: [imagePart, textPart] }],
        config: {
            responseMimeType: "application/json",
        }
    });

    let jsonStr = response.text.trim();
    // Remove markdown fences if present
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as Partial<NutritionData>; // Use Partial for initial parsing

    // Basic validation of the parsed data structure
    if (
      typeof parsedData.foodName !== 'string' ||
      typeof parsedData.calories !== 'number' ||
      typeof parsedData.fat !== 'number' ||
      typeof parsedData.sugar !== 'number'
    ) {
      console.error("Parsed data does not match base NutritionData structure:", parsedData);
      throw new Error("Received malformed nutrition data from API.");
    }

    // Validate and default components
    let components: FoodComponent[] = [];
    if (Array.isArray(parsedData.components)) {
      components = parsedData.components.filter(
        (comp: any): comp is FoodComponent => 
          comp && typeof comp.name === 'string' && typeof comp.calories === 'number'
      );
    } else if (parsedData.components !== undefined) {
      // If components key exists but is not an array, log warning and use empty array
      console.warn("Components data is malformed, expected an array. Defaulting to empty.", parsedData.components);
    }
    
    return {
        foodName: parsedData.foodName,
        calories: parsedData.calories,
        fat: parsedData.fat,
        sugar: parsedData.sugar,
        components: components,
    };

  } catch (error) {
    console.error("Error analyzing food image with Gemini:", error);
    let errorMessage = "Failed to analyze image. Please try again.";
    if (error instanceof Error) {
        errorMessage = error.message;
        if (error.message.includes("API key not valid")) {
            errorMessage = "Invalid API Key. Please check your configuration.";
        }
    }
    // Fallback to a default "unknown" structure on error, including empty components
    return {
        foodName: 'Unknown Food',
        calories: 0,
        fat: 0,
        sugar: 0,
        components: []
    };
    // throw new Error(`API Error: ${errorMessage}`); // Option to rethrow
  }
};