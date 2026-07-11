import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Check } from 'lucide-react-native';
import { RootStackParamList } from './types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'PostComposer'>;
type Route = RouteProp<RootStackParamList, 'PostComposer'>;

type Platform = 'Instagram' | 'TikTok' | 'X' | 'LinkedIn';
const PLATFORMS: Platform[] = ['Instagram', 'TikTok', 'X', 'LinkedIn'];

export default function PostComposerScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { videoResult } = route.params;

  const [caption, setCaption] = useState(videoResult.caption);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<Platform>>(new Set(['Instagram']));
  const [isPosting, setIsPosting] = useState(false);
  const [posted, setPosted] = useState(false);
  const successScale = useRef(new Animated.Value(0)).current;

  const togglePlatform = (p: Platform) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
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
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Post Your Content</Text>
        </View>

        {/* Video thumbnail placeholder */}
        <View style={styles.thumbnailCard}>
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.thumbnailIcon}>▶</Text>
          </View>
        </View>

        {/* Caption */}
        <View style={styles.captionCard}>
          <TextInput
            style={styles.captionInput}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={2200}
            placeholderTextColor="#8A8A94"
          />
          <Text style={styles.charCount}>{caption.length} / 2200</Text>
        </View>

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

        {/* Post CTA */}
        <TouchableOpacity
          style={[styles.postBtn, (selectedPlatforms.size === 0 || isPosting) && styles.postBtnDisabled]}
          onPress={handlePost}
          disabled={selectedPlatforms.size === 0 || isPosting}
        >
          <Text style={styles.postBtnText}>{isPosting ? 'Posting...' : 'Post Now'}</Text>
        </TouchableOpacity>
        <Text style={styles.demoNote}>This is a demo simulation — post dispatch is not live.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B0B0F' },
  scroll: { padding: 20, paddingBottom: 60 },
  header: { marginBottom: 20 },
  back: { color: '#8A8A94', fontSize: 15, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#F5F5F7' },
  thumbnailCard: { backgroundColor: '#17171D', borderRadius: 16, overflow: 'hidden', marginBottom: 20 },
  thumbnailPlaceholder: { height: 180, alignItems: 'center', justifyContent: 'center' },
  thumbnailIcon: { fontSize: 32, color: '#7C5CFF' },
  captionCard: { backgroundColor: '#17171D', borderRadius: 16, padding: 16, marginBottom: 24 },
  captionInput: { color: '#F5F5F7', fontSize: 15, minHeight: 80, textAlignVertical: 'top' },
  charCount: { color: '#8A8A94', fontSize: 13, textAlign: 'right', marginTop: 8 },
  sectionHeader: { fontSize: 18, fontWeight: '600', color: '#8A8A94', marginBottom: 12 },
  chipsRow: { marginBottom: 32 },
  chip: { backgroundColor: '#17171D', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, borderWidth: 1, borderColor: '#3D3D50' },
  chipSelected: { backgroundColor: '#7C5CFF', borderColor: '#7C5CFF' },
  chipText: { color: '#8A8A94', fontSize: 15 },
  chipTextSelected: { color: '#fff' },
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
