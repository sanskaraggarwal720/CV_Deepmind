import { TemplateId, SubTask, GeneratedImage, VideoResult } from '../types';

export type RootStackParamList = {
  Home: undefined;
  Supervisor: {
    userPrompt: string;
    selectedTemplates: TemplateId[];
    selectedModel?: string; // The model selected by the user
  };
  ImageGrid: {
    subTasks: SubTask[];
  };
  VideoStudio: {
    selectedImage: GeneratedImage;
  };
  PostComposer: {
    videoResult: VideoResult;
  };
};
