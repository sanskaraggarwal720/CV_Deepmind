import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Keyboard, Pressable, Platform
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { generateVideo } from '../lib/omniFlash';
import { listModels, GeminiModel } from '../lib/gemma';
import { VideoResult } from '../types';
import VideoPlayer from '../components/VideoPlayer';
import SkeletonShimmer from '../components/SkeletonShimmer';
import { RootStackParamList } from './types';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

type Nav = NativeStackNavigationProp<RootStackParamList, 'VideoStudio'>;
type Route = RouteProp<RootStackParamList, 'VideoStudio'>;

export default function VideoStudioScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { selectedImages } = route.params;

  // Batch states
  const [videoResults, setVideoResults] = useState<(VideoResult | null)[]>(
    Array(selectedImages.length).fill(null)
  );
  const [isGeneratingMap, setIsGeneratingMap] = useState<boolean[]>(
    Array(selectedImages.length).fill(false)
  );
  const [hasErrors, setHasErrors] = useState<boolean[]>(
    Array(selectedImages.length).fill(false)
  );
  const [hasStartedGeneration, setHasStartedGeneration] = useState(false);

  // Model selection state
  const [availableModels, setAvailableModels] = useState<GeminiModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
      const models = await listModels(apiKey);
      setAvailableModels(models);
      if (models.length > 0) {
        // Try to default to a standard flash model
        const flashModel = models.find(m => m.name.includes('-flash') && !m.name.includes('lite') && !m.name.includes('thinking'));
        const defaultModel = flashModel ? flashModel.name : models[0].name;
        setSelectedModel(defaultModel);
      }
      setIsLoadingModels(false);
    };
    fetchModels();
  }, []);

  const runBatchGeneration = (model: string) => {
    setHasStartedGeneration(true);
    setVideoResults(Array(selectedImages.length).fill(null));
    setIsGeneratingMap(Array(selectedImages.length).fill(true));
    setHasErrors(Array(selectedImages.length).fill(false));
    
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
    
    // Fan out generation for all selected images in parallel
    selectedImages.forEach((image, index) => {
      generateVideo(image, apiKey, model)
        .then((res) => {
          setVideoResults((prev) => {
            const next = [...prev];
            next[index] = res;
            return next;
          });
        })
        .catch((err) => {
          console.error(`Video generation failed for index ${index}:`, err);
          setHasErrors((prev) => {
            const next = [...prev];
            next[index] = true;
            return next;
          });
        })
        .finally(() => {
          setIsGeneratingMap((prev) => {
            const next = [...prev];
            next[index] = false;
            return next;
          });
        });
    });
  };

  const handleModelChange = (modelName: string) => {
    setSelectedModel(modelName);
    setIsDropdownOpen(false);
  };

  const handleUseAll = () => {
    const successfulVideos = videoResults.filter((v): v is VideoResult => v !== null);
    if (successfulVideos.length === 0) return;
    navigation.navigate('PostComposer', { videoResults: successfulVideos });
  };

  const activeModelDisplay = availableModels.find(m => m.name === selectedModel)?.displayName || 'Select a model';
  
  // Is ANY video currently generating?
  const isAnyGenerating = isGeneratingMap.some(Boolean);
  const successfulVideosCount = videoResults.filter(v => v !== null).length;

  return (
    <SafeAreaView style={styles.safe}>
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Video Studio</Text>
            <Text style={styles.subtitle}>Batch processing {selectedImages.length} {selectedImages.length === 1 ? 'video' : 'videos'}</Text>
          </View>

          {/* Model Selection Dropdown */}
          <View style={styles.dropdownContainer}>
            <TouchableOpacity 
              style={styles.dropdownHeader} 
              activeOpacity={0.8}
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {isLoadingModels ? (
                <ActivityIndicator size="small" color="#7C5CFF" />
              ) : (
                <Text style={styles.dropdownHeaderText}>{activeModelDisplay}</Text>
              )}
              {isDropdownOpen ? <ChevronUp color="#8A8A94" size={20} /> : <ChevronDown color="#8A8A94" size={20} />}
            </TouchableOpacity>
            
            {isDropdownOpen && !isLoadingModels && (
              <View style={styles.dropdownList}>
                {availableModels.map((model) => (
                  <TouchableOpacity
                    key={model.name}
                    style={[styles.dropdownItem, selectedModel === model.name && styles.dropdownItemSelected]}
                    onPress={() => handleModelChange(model.name)}
                  >
                    <Text style={[styles.dropdownItemText, selectedModel === model.name && styles.dropdownItemTextSelected]}>
                      {model.displayName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Batch Feed OR Generate Button */}
          {!hasStartedGeneration ? (
            <View style={styles.startGenerationContainer}>
              <Text style={styles.startGenerationText}>
                Ready to generate {selectedImages.length} {selectedImages.length === 1 ? 'video' : 'videos'}?
              </Text>
              <TouchableOpacity
                style={styles.generateBtn}
                onPress={() => runBatchGeneration(selectedModel)}
              >
                <Text style={styles.generateBtnText}>Start Generation →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            selectedImages.map((image, i) => {
              const isGenerating = isGeneratingMap[i];
              const hasError = hasErrors[i];
              const result = videoResults[i];

              return (
                <View key={`video-${i}`} style={styles.videoCard}>
                  {isGenerating ? (
                    <View style={styles.shimmerWrap}>
                      <SkeletonShimmer height={220} borderRadius={16} />
                      <Text style={styles.generatingLabel}>Generating video {i + 1}...</Text>
                    </View>
                  ) : hasError ? (
                    <View style={styles.errorPlaceholder}>
                      <Text style={styles.errorText}>Video generation failed. Please try a different model.</Text>
                      <TouchableOpacity
                        style={styles.retryBtn}
                        onPress={() => runBatchGeneration(selectedModel)}
                      >
                        <Text style={styles.retryBtnText}>Retry All</Text>
                      </TouchableOpacity>
                    </View>
                  ) : result?.url ? (
                    <VideoPlayer uri={result.url} />
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>
      </Pressable>

      {/* Use All CTA */}
      {successfulVideosCount > 0 && !isAnyGenerating && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.useBtn}
            onPress={handleUseAll}
          >
            <Text style={styles.useBtnText}>Use {successfulVideosCount} {successfulVideosCount === 1 ? 'Video' : 'Videos'} →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B0B0F' },
  scroll: { padding: 20, paddingBottom: 120 },
  header: { marginBottom: 16 },
  back: { color: '#8A8A94', fontSize: 15, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#F5F5F7' },
  subtitle: { fontSize: 15, color: '#8A8A94', marginTop: 4 },
  dropdownContainer: { marginBottom: 20, zIndex: 10 },
  dropdownHeader: {
    backgroundColor: '#17171D',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2A2A35',
  },
  dropdownHeaderText: { color: '#F5F5F7', fontSize: 15 },
  dropdownList: {
    backgroundColor: '#1C1C24',
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2A2A35',
  },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12 },
  dropdownItemSelected: { backgroundColor: '#2A2A35' },
  dropdownItemText: { color: '#8A8A94', fontSize: 15 },
  dropdownItemTextSelected: { color: '#F5F5F7', fontWeight: '600' },
  videoCard: { marginBottom: 24 },
  shimmerWrap: {},
  generatingLabel: { color: '#3DDC97', fontSize: 13, marginTop: 8, textAlign: 'center' },
  errorPlaceholder: { backgroundColor: '#17171D', height: 220, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#FF5C5C', fontSize: 15, textAlign: 'center', paddingHorizontal: 24, marginBottom: 12 },
  retryBtn: { backgroundColor: '#2A2A35', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  retryBtnText: { color: '#F5F5F7', fontSize: 13, fontWeight: '600' },
  startGenerationContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40, paddingHorizontal: 20 },
  startGenerationText: { color: '#8A8A94', fontSize: 16, marginBottom: 24, textAlign: 'center' },
  generateBtn: { backgroundColor: '#7C5CFF', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 16, width: '100%', alignItems: 'center' },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: Platform.OS === 'ios' ? 20 : 36, backgroundColor: '#0B0B0F', borderTopWidth: 1, borderTopColor: '#17171D' },
  useBtn: { backgroundColor: '#7C5CFF', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  useBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
