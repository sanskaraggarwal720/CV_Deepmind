import { GeneratedImage, VideoResult } from '../types';

export const VIDEO_MODELS = [
  { name: 'gemini-3.5-flash', displayName: 'gemini-3.5-flash' },
  { name: 'gemini-2.5-flash', displayName: 'gemini-2.5-flash' },
];

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

function buildVideoPrompt(image: GeneratedImage, instruction?: string): string {
  const base = `Animate this image into a short cinematic video. Style: ${image.subTask.template}. Original prompt: "${image.subTask.prompt}".`;
  return instruction ? `${base} Edit instruction: ${instruction}` : base;
}

export async function generateVideo(
  image: GeneratedImage,
  apiKey: string,
  model: string = VIDEO_MODELS[0].name
): Promise<VideoResult> {
  const prompt = buildVideoPrompt(image);

  const res = await fetch(`${BASE_URL}/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: image.url } },
            { text: prompt },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    throw new Error(`Omni Flash error ${res.status}: ${errBody}`);
  }

  const json = await res.json();

  // Omni Flash may return a video blob URL, a job ID, or inline video data
  const parts = json.candidates?.[0]?.content?.parts ?? [];
  const videoPart = parts.find(
    (p: any) => p.inlineData?.mimeType?.startsWith('video/') || p.fileData
  );
  const textPart = parts.find((p: any) => p.text);

  const videoUrl = videoPart?.inlineData?.data
    ? `data:video/mp4;base64,${videoPart.inlineData.data}`
    : videoPart?.fileData?.fileUri ?? json.id ?? '';

  return {
    id: json.id ?? Date.now().toString(),
    sourceImageId: image.id,
    url: videoUrl,
    caption: textPart?.text ?? `${image.subTask.template} cinematic video`,
    conversationHistory: [
      { role: 'user', content: prompt },
      { role: 'model', content: textPart?.text ?? '' },
    ],
  };
}

export async function editVideo(
  videoResult: VideoResult,
  editInstruction: string,
  image: GeneratedImage,
  apiKey: string,
  model: string = VIDEO_MODELS[0].name
): Promise<VideoResult> {
  // One edit turn — pass full conversation history for context
  const history = videoResult.conversationHistory.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }));

  const editPrompt = `Edit the video: ${editInstruction}`;

  const res = await fetch(`${BASE_URL}/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [
        ...history,
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: image.url } },
            { text: editPrompt },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    throw new Error(`Omni Flash edit error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const parts = json.candidates?.[0]?.content?.parts ?? [];
  const videoPart = parts.find(
    (p: any) => p.inlineData?.mimeType?.startsWith('video/') || p.fileData
  );
  const textPart = parts.find((p: any) => p.text);

  const videoUrl = videoPart?.inlineData?.data
    ? `data:video/mp4;base64,${videoPart.inlineData.data}`
    : videoPart?.fileData?.fileUri ?? videoResult.url;

  return {
    ...videoResult,
    url: videoUrl,
    caption: textPart?.text ?? videoResult.caption,
    conversationHistory: [
      ...videoResult.conversationHistory,
      { role: 'user', content: editPrompt },
      { role: 'model', content: textPart?.text ?? '' },
    ],
  };
}
