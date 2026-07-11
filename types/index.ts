export type TemplateId = 'cinematic' | 'product' | 'minimalist' | 'vibrant';

export interface SubTask {
  id: string;
  prompt: string;
  template: TemplateId;
}

export interface GeneratedImage {
  id: string;
  url: string;          // base64 or blob URL
  subTask: SubTask;
  selected: boolean;
}

export interface VideoResult {
  id: string;
  sourceImageId: string;
  url: string;
  caption: string;
  conversationHistory: { role: 'user' | 'model'; content: string }[];
}
