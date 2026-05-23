// Provider-agnostic public surface for meme generation.
// Callers import from `@/lib/ai`, never from a provider file directly.
// To swap providers, change the import below.

import type { MemeConcept } from "@/lib/meme-schema";
import { generate as openrouterGenerate } from "./openrouter";

export async function generateMemeConcepts(
  imageDataUrl: string,
): Promise<MemeConcept[]> {
  return openrouterGenerate(imageDataUrl);
}
