import { SubTask, TemplateId } from '../types';

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Default fallback chain if model list fetch fails
const DEFAULT_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
];

export interface GeminiModel {
  name: string;          // e.g. "models/gemini-2.0-flash"
  displayName: string;   // short name for UI, e.g. "gemini-2.0-flash"
}

/**
 * Fetches the list of models available for the given API key.
 * Filters to only text-generation capable models.
 */
export async function listModels(apiKey: string): Promise<GeminiModel[]> {
  try {
    const res = await fetch(`${API_BASE}/models?key=${apiKey}&pageSize=100`);
    if (!res.ok) throw new Error(`listModels failed: ${res.status}`);
    const json = await res.json();
    const models: any[] = json.models ?? [];
    return models
      .filter((m) => {
        // Only include models that support generateContent
        if (!m.supportedGenerationMethods?.includes('generateContent')) return false;
        // Filter out known broken models for this API key (404 errors)
        if (m.name.includes('gemini-2.5-flash')) return false;
        if (m.name.includes('gemini-2.0-flash')) return false;
        return true;
      })
      .map((m) => ({
        name: m.name.replace('models/', ''), // strip prefix for easier usage
        displayName: m.displayName || m.name.replace('models/', ''),
      }));
  } catch (e) {
    console.warn('listModels error, using defaults:', e);
    return DEFAULT_MODELS.map((d) => ({ name: `models/${d}`, displayName: d }));
  }
}

async function callGemini(model: string, body: object, apiKey: string): Promise<Response> {
  // model may come in as "models/gemini-2.0-flash" or just "gemini-2.0-flash"
  const modelId = model.startsWith('models/') ? model.replace('models/', '') : model;
  return fetch(`${API_BASE}/models/${modelId}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify(body),
  });
}

export async function decomposeIntent(
  userPrompt: string,
  selectedTemplates: TemplateId[],
  apiKey: string,
  preferredModel?: string
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

  // If a preferred model was chosen, try it first; then fall back to defaults
  const modelsToTry = preferredModel
    ? [preferredModel, ...DEFAULT_MODELS.filter((m) => m !== preferredModel)]
    : DEFAULT_MODELS;

  for (const model of modelsToTry) {
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
