export const GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17";
export const LOCAL_STORAGE_KEY_FOOD_ENTRIES = "nutrisnap_food_entries";

export const GEMINI_API_REQUEST_PROMPT = `
You are a highly precise food nutrition analysis API. Your SOLE function is to analyze the food item(s) in the provided image and return a single, valid JSON object.
ABSOLUTELY NO other text, explanations, apologies, or conversational elements are permitted in your response.
The response MUST BE a single, minified, valid JSON object.

The JSON object MUST conform to the following structure:
{
  "foodName": "string", // Name of the food (e.g., "Chicken Salad")
  "calories": number,   // Total estimated calories (kcal)
  "fat": number,        // Total estimated fat (grams)
  "sugar": number,      // Total estimated sugar (grams)
  "components": [       // Array of food components. Empty array ([]) if not applicable.
    {
      "name": "string", // Name of the component (e.g., "Grilled Chicken")
      "calories": number // Estimated calories for this component
    }
    // ... more components if applicable
  ]
}

Key requirements for the JSON:
1.  All keys and string values MUST be enclosed in double quotes (e.g., "foodName").
2.  Numeric values should be numbers, not strings (e.g., 250, not "250").
3.  No trailing commas in objects or arrays.
4.  The entire response MUST be only this JSON object.

Example of a valid response with components:
{
  "foodName": "Fruit Salad with Yogurt",
  "calories": 250,
  "fat": 5,
  "sugar": 30,
  "components": [
    {"name": "Apple slices", "calories": 80},
    {"name": "Banana slices", "calories": 90},
    {"name": "Yogurt", "calories": 60},
    {"name": "Berries", "calories": 20}
  ]
}

Example of a response for a known food with no identifiable components:
{
  "foodName": "Plain Rice",
  "calories": 205,
  "fat": 0.4,
  "sugar": 0.1,
  "components": []
}

If you CANNOT confidently identify the food or its nutritional values from the image, you MUST return EXACTLY this JSON object:
{
  "foodName": "Unknown Food",
  "calories": 0,
  "fat": 0,
  "sugar": 0,
  "components": []
}

Remember: Your entire output must be ONLY the JSON object specified. No extra text.
`.trim();

export const MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024; // 1MB
export const IMAGE_COMPRESSION_QUALITY = 0.7;
export const IMAGE_MAX_DIMENSION = 800; // pixels for larger dimension
export const THUMBNAIL_MAX_DIMENSION = 200; // pixels for thumbnail in history