import {
  GoogleGenerativeAI,
  SchemaType,
  type Schema,
} from "@google/generative-ai";
import {
  MEME_TEMPLATES,
  type MemeConcept,
} from "@/lib/meme-schema";
import { MEME_SYSTEM_PROMPT, MEME_USER_PROMPT } from "./prompt";

const responseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    concepts: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          template: {
            type: SchemaType.STRING,
            format: "enum",
            enum: [...MEME_TEMPLATES],
          },
          title: { type: SchemaType.STRING },
          captions: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
          humorStyle: { type: SchemaType.STRING },
          reasoning: { type: SchemaType.STRING },
          confidence: { type: SchemaType.NUMBER },
        },
        required: [
          "template",
          "title",
          "captions",
          "humorStyle",
          "reasoning",
          "confidence",
        ],
      },
    },
  },
  required: ["concepts"],
};

export async function generate(imageDataUrl: string): Promise<MemeConcept[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const match = imageDataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid image data URL");
  }
  const [, mimeType, base64] = match;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: MEME_SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
      temperature: 1.0,
    },
  });

  const result = await model.generateContent([
    { inlineData: { mimeType, data: base64 } },
    { text: MEME_USER_PROMPT },
  ]);

  const text = result.response.text();
  try {
    const parsed = JSON.parse(text) as { concepts?: MemeConcept[] };
    return parsed.concepts ?? [];
  } catch {
    throw new Error("Model returned invalid JSON");
  }
}
