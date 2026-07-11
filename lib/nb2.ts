import { SubTask } from '../types';

const NB2_MODEL = 'gemini-3.1-flash-lite-image';

export async function generateImages(
  subTasks: SubTask[],
  apiKey: string
): Promise<{ subTask: SubTask; base64: string }[]> {
  // Cap at 4 parallel requests for quota safety
  const tasks = subTasks.slice(0, 4);
  const results = await Promise.all(tasks.map((task) => generateSingleImage(task, apiKey)));
  return results.filter((r): r is { subTask: SubTask; base64: string } => r !== null);
}

async function generateSingleImage(
  subTask: SubTask,
  apiKey: string
): Promise<{ subTask: SubTask; base64: string } | null> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${NB2_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: subTask.prompt }] }],
          generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
        }),
      }
    );
    if (!res.ok) {
      console.error(`NB2 Lite error for task ${subTask.id}: ${res.status}`);
      return null;
    }
    const json = await res.json();
    const parts = json.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith('image/'));
    if (!imagePart) return null;
    return { subTask, base64: imagePart.inlineData.data };
  } catch (e) {
    console.error('NB2 Lite fetch error:', e);
    return null;
  }
}
