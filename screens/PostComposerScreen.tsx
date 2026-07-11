import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Animated, KeyboardAvoidingView, Platform, Keyboard, Pressable
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check } from 'lucide-react-native';
import { RootStackParamList } from './types';
import VideoPlayer from '../components/VideoPlayer';

type Nav = NativeStackNavigationProp<RootStackParamList, 'PostComposer'>;
type Route = RouteProp<RootStackParamList, 'PostComposer'>;

type PlatformType = 'Instagram' | 'TikTok' | 'X' | 'LinkedIn';
const PLATFORMS: PlatformType[] = ['Instagram', 'TikTok', 'X', 'LinkedIn'];

export default function PostComposerScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { videoResults } = route.params;

  const [captions, setCaptions] = useState<string[]>(
    videoResults.map(v => v.caption || '')
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<PlatformType>>(new Set(['Instagram']));
  const [isPosting, setIsPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const successScale = useRef(new Animated.Value(0)).current;

  const togglePlatform = (p: PlatformType) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const handleCaptionChange = (text: string, index: number) => {
    setCaptions(prev => {
      const next = [...prev];
      next[index] = text;
      return next;
    });
  };

  const handlePost = () => {
    if (selectedPlatforms.size === 0) return;
    setIsPosting(true);
    setTimeout(() => {
      setIsPosting(false);
      setPosted(true);
      Animated.spring(successScale, { toValue: 1, useNativeDriver: true, tension: 60 }).start();
    }, 1500);
  };

  if (posted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.checkCircle, { transform: [{ scale: successScale }] }]}>
            <Check size={48} color="#fff" strokeWidth={3} />
          </Animated.View>
          <Text style={styles.postedTitle}>Posted!</Text>
          <Text style={styles.postedSub}>
            {[...selectedPlatforms].join(' • ')}
          </Text>
          <Text style={styles.demoNote}>This is a demo simulation — post dispatch is not live.</Text>
          <TouchableOpacity
            style={styles.createAnotherBtn}
            onPress={() => navigation.popToTop()}
          >
            <Text style={styles.createAnotherText}>Create Another →</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.back}>← Back</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Post Your Content</Text>
              <Text style={styles.subtitle}>{videoResults.length} {videoResults.length === 1 ? 'video' : 'videos'} ready to publish</Text>
            </View>

            {/* Batch Video Feed */}
            {videoResults.map((videoResult, index) => (
              <View key={`feed-${index}`} style={styles.feedItem}>
                <View style={styles.thumbnailCard}>
                  <VideoPlayer uri={videoResult.url} />
                </View>
                
                <View style={styles.captionCard}>
                  <TextInput
                    style={styles.captionInput}
                    value={captions[index]}
                    onChangeText={(text) => handleCaptionChange(text, index)}
                    multiline
                    maxLength={2200}
                    placeholder={`Write a caption for video ${index + 1}...`}
                    placeholderTextColor="#8A8A94"
                  />
                  <Text style={styles.charCount}>{captions[index].length} / 2200</Text>
                </View>
              </View>
            ))}

            {/* Platform chips */}
            <Text style={styles.sectionHeader}>Platforms</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
              {PLATFORMS.map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.chip, selectedPlatforms.has(p) && styles.chipSelected]}
                  onPress={() => togglePlatform(p)}
                >
                  <Text style={[styles.chipText, selectedPlatforms.has(p) && styles.chipTextSelected]}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

          </ScrollView>

          {/* Post CTA */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.postBtn, (selectedPlatforms.size === 0 || isPosting) && styles.postBtnDisabled]}
              onPress={handlePost}
              disabled={selectedPlatforms.size === 0 || isPosting}
            >
              <Text style={styles.postBtnText}>{isPosting ? 'Posting...' : 'Post All Now'}</Text>
            </TouchableOpacity>
            <Text style={styles.demoNote}>This is a demo simulation — post dispatch is not live.</Text>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B0B0F' },
  scroll: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 20 },
  back: { color: '#8A8A94', fontSize: 15, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#F5F5F7' },
  subtitle: { fontSize: 15, color: '#8A8A94', marginTop: 4 },
  feedItem: { marginBottom: 32 },
  thumbnailCard: { backgroundColor: '#17171D', borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  captionCard: { backgroundColor: '#17171D', borderRadius: 16, padding: 16 },
  captionInput: { color: '#F5F5F7', fontSize: 15, minHeight: 80, textAlignVertical: 'top' },
  charCount: { color: '#8A8A94', fontSize: 13, textAlign: 'right', marginTop: 8 },
  sectionHeader: { fontSize: 18, fontWeight: '600', color: '#8A8A94', marginBottom: 12 },
  chipsRow: { marginBottom: 32 },
  chip: { backgroundColor: '#17171D', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: '#3D3D50' },
  chipSelected: { backgroundColor: '#7C5CFF', borderColor: '#7C5CFF' },
  chipText: { color: '#8A8A94', fontSize: 15 },
  chipTextSelected: { color: '#fff' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: Platform.OS === 'ios' ? 20 : 36, backgroundColor: '#0B0B0F', borderTopWidth: 1, borderTopColor: '#17171D' },
  postBtn: { backgroundColor: '#7C5CFF', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  postBtnDisabled: { opacity: 0.4 },
  postBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  demoNote: { color: '#8A8A94', fontSize: 13, textAlign: 'center' },
  // Success overlay
  successOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  checkCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#3DDC97', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  postedTitle: { fontSize: 28, fontWeight: 'bold', color: '#3DDC97', marginBottom: 8 },
  postedSub: { fontSize: 15, color: '#8A8A94', marginBottom: 24 },
  createAnotherBtn: { backgroundColor: '#7C5CFF', borderRadius: 12, paddingHorizontal: 32, paddingVertical: 14, marginTop: 8 },
  createAnotherText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
