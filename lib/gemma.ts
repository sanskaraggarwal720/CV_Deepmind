import { SubTask, TemplateId } from '../types';

export async function decomposeIntent(userPrompt: string, selectedTemplates: TemplateId[], apiKey: string): Promise<SubTask[]> {
  // Fallback to API since Expo Managed workflow blocks on-device MediaPipe native modules within a 15 min cap.
  const prompt = `Decompose this creative intent into ${selectedTemplates.length} image generation prompts, one per template style:
Templates: ${selectedTemplates.join(', ')}
Intent: ${userPrompt}

Return the response strictly as a JSON array of objects, where each object has:
- id: a unique string
- prompt: the generated prompt for the template
- template: the template name

Do not wrap in markdown or backticks.`;

  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    
    if (!res.ok) {
      throw new Error(`Gemma API spike failed: ${res.status} ${res.statusText}`);
    }
    
    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    const parsed = JSON.parse(text);
    return parsed;
  } catch (error) {
    console.error("Gemma API Error:", error);
    return [];
  }
}
