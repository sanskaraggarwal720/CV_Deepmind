import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { generateImages } from '../lib/nb2';
import { GeneratedImage } from '../types';
import ImageCard from '../components/ImageCard';
import { RootStackParamList } from './types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'ImageGrid'>;
type Route = RouteProp<RootStackParamList, 'ImageGrid'>;

export default function ImageGridScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { subTasks } = route.params;

  const [images, setImages] = useState<(GeneratedImage | null)[]>(
    subTasks.map(() => null)
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
    generateImages(subTasks, apiKey).then((results) => {
      const generated: GeneratedImage[] = results.map((r, i) => ({
        id: `img-${i}`,
        url: r.base64,
        subTask: r.subTask,
        selected: false,
      }));
      setImages(generated);
    });
  }, []);

  const toggleSelect = (image: GeneratedImage) => {
    setImages((prev) =>
      prev.map((img) =>
        img?.id === image.id ? { ...img, selected: !img.selected } : img
      )
    );
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(image.id)) next.delete(image.id);
      else next.add(image.id);
      return next;
    });
  };

  const selectedImages = images.filter(
    (img): img is GeneratedImage => img !== null && img.selected
  );

  const handleAnimate = () => {
    if (selectedImages.length === 0) return;
    navigation.navigate('VideoStudio', { selectedImage: selectedImages[0] });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Choose Your Images</Text>
        <Text style={styles.subtitle}>Select 1 or more to animate</Text>
      </View>

      <FlatList
        data={subTasks}
        numColumns={2}
        keyExtractor={(_, i) => `${i}`}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ index }) => {
          const img = images[index];
          return (
            <View style={styles.cell}>
              <ImageCard
                image={img ?? undefined}
                isLoading={img === null}
                onPress={toggleSelect}
              />
            </View>
          );
        }}
      />

      {selectedIds.size > 0 && (
        <View style={styles.bottomBar}>
          <Text style={styles.selectionCount}>{selectedIds.size} selected</Text>
          <TouchableOpacity style={styles.animateBtn} onPress={handleAnimate}>
            <Text style={styles.animateBtnText}>Animate Selected →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B0B0F' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  back: { color: '#8A8A94', fontSize: 15, marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#F5F5F7' },
  subtitle: { fontSize: 13, color: '#8A8A94', marginTop: 4 },
  grid: { padding: 12, paddingBottom: 100 },
  row: { justifyContent: 'space-between' },
  cell: { width: '48.5%', marginBottom: 12 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0B0B0F',
    borderTopWidth: 1,
    borderTopColor: '#17171D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 28,
  },
  selectionCount: { color: '#8A8A94', fontSize: 15 },
  animateBtn: { backgroundColor: '#7C5CFF', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  animateBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
