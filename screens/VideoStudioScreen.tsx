import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { generateVideo, editVideo } from '../lib/omniFlash';
import { VideoResult } from '../types';
import VideoPlayer from '../components/VideoPlayer';
import SkeletonShimmer from '../components/SkeletonShimmer';
import { RootStackParamList } from './types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'VideoStudio'>;
type Route = RouteProp<RootStackParamList, 'VideoStudio'>;

export default function VideoStudioScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { selectedImage } = route.params;

  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [editInstruction, setEditInstruction] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editHistory, setEditHistory] = useState<string[]>([]);
  const [hasEdited, setHasEdited] = useState(false);

  useEffect(() => {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
    generateVideo(selectedImage, apiKey)
      .then(setVideoResult)
      .catch(() => {})
      .finally(() => setIsGenerating(false));
  }, []);

  const handleEdit = async () => {
    if (!videoResult || !editInstruction.trim() || hasEdited) return;
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
    setIsEditing(true);
    try {
      const updated = await editVideo(videoResult, editInstruction.trim(), selectedImage, apiKey);
      setVideoResult(updated);
      setEditHistory((prev) => [...prev, editInstruction.trim()]);
      setEditInstruction('');
      setHasEdited(true); // only 1 edit turn per plan
    } catch {}
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Video Studio</Text>
        </View>

        {/* Video or shimmer */}
        {isGenerating ? (
          <View style={styles.shimmerWrap}>
            <SkeletonShimmer height={220} borderRadius={16} />
            <Text style={styles.generatingLabel}>Generating video...</Text>
          </View>
        ) : videoResult?.url ? (
          <VideoPlayer uri={videoResult.url} />
        ) : (
          <View style={styles.errorPlaceholder}>
            <Text style={styles.errorText}>Video generation failed. Please try again.</Text>
          </View>
        )}

        {/* AI-generated caption */}
        {videoResult && (
          <Text style={styles.caption}>{videoResult.caption}</Text>
        )}

        {/* Edit chips */}
        {editHistory.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.editChips}>
            {editHistory.map((e, i) => (
              <View key={i} style={styles.editChip}>
                <Text style={styles.editChipText}>{e}</Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Conversational edit input — only 1 turn allowed per plan */}
        {!hasEdited && videoResult && (
          <View style={styles.editRow}>
            <TextInput
              style={styles.editInput}
              value={editInstruction}
              onChangeText={setEditInstruction}
              placeholder="Refine your video... (e.g. make it slower)"
              placeholderTextColor="#8A8A94"
              editable={!isEditing}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!editInstruction.trim() || isEditing) && styles.sendBtnDisabled]}
              onPress={handleEdit}
              disabled={!editInstruction.trim() || isEditing}
            >
              {isEditing ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.sendBtnText}>→</Text>}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Use This CTA */}
      {videoResult && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.useBtn}
            onPress={() => navigation.navigate('PostComposer', { videoResult })}
          >
            <Text style={styles.useBtnText}>Use This →</Text>
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
  shimmerWrap: { marginBottom: 16 },
  generatingLabel: { color: '#3DDC97', fontSize: 13, marginTop: 8, textAlign: 'center' },
  caption: { color: '#8A8A94', fontSize: 13, marginTop: 12, marginBottom: 16 },
  editChips: { marginBottom: 16 },
  editChip: { backgroundColor: '#17171D', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginRight: 8 },
  editChipText: { color: '#8A8A94', fontSize: 13 },
  editRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#17171D', borderRadius: 12, padding: 4 },
  editInput: { flex: 1, color: '#F5F5F7', fontSize: 15, paddingHorizontal: 12, paddingVertical: 8 },
  sendBtn: { backgroundColor: '#7C5CFF', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  errorPlaceholder: { backgroundColor: '#17171D', height: 220, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#FF5C5C', fontSize: 15, textAlign: 'center', paddingHorizontal: 24 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, backgroundColor: '#0B0B0F', borderTopWidth: 1, borderTopColor: '#17171D' },
  useBtn: { backgroundColor: '#7C5CFF', borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  useBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
