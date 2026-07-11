import { SubTask, TemplateId } from '../types';

// Try newest available models first, fall back to stable ones
const MODELS = [
  'gemini-3.1-flash-lite',    // fastest internal preview
  'gemini-3.5-flash',         // newer stable
  'gemini-2.5-flash-lite',    // lighter 2.5
  'gemini-2.0-flash',         // widely available fallback
];

async function callGemini(model: string, body: object, apiKey: string): Promise<Response> {
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(body),
  });
}

export async function decomposeIntent(
  userPrompt: string,
  selectedTemplates: TemplateId[],
  apiKey: string
): Promise<SubTask[]> {
  const prompt = `Decompose this creative intent into ${selectedTemplates.length} image generation prompts, one per template style:
Templates: ${selectedTemplates.join(', ')}
Intent: ${userPrompt}

Return the response strictly as a JSON array of objects, where each object has:
- id: a unique string
- prompt: the generated prompt for the template
- template: the template name

Do not wrap in markdown or backticks.`;

  const requestBody = { contents: [{ parts: [{ text: prompt }] }] };

  for (const model of MODELS) {
    try {
      const res = await callGemini(model, requestBody, apiKey);
      if (res.status === 404 || res.status === 403) {
        console.warn(`Model ${model} unavailable (${res.status}), trying next...`);
        continue;
      }
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        throw new Error(`Gemini API error ${res.status}: ${errBody}`);
      }
      const json = await res.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      // Strip markdown code fences if the model wraps the JSON
      const cleaned = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();
      console.log(`✓ decomposeIntent succeeded with model: ${model}`);
      return JSON.parse(cleaned);
    } catch (error) {
      console.error(`Gemini error with model ${model}:`, error);
    }
  }

  console.error('All Gemini models exhausted.');
  return [];
}
