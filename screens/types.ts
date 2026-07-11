import { TemplateId, SubTask, GeneratedImage, VideoResult } from '../types';

export type RootStackParamList = {
  Home: undefined;
  Supervisor: {
    userPrompt: string;
    selectedTemplates: TemplateId[];
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
