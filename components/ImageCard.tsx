import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { GeneratedImage } from '../types';
import SkeletonShimmer from './SkeletonShimmer';

interface ImageCardProps {
  image?: GeneratedImage;
  isLoading?: boolean;
  onPress?: (image: GeneratedImage) => void;
}

export default function ImageCard({ image, isLoading, onPress }: ImageCardProps) {
  if (isLoading || !image) {
    return <SkeletonShimmer height={180} borderRadius={16} />;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress?.(image)}
      style={[styles.card, image.selected && styles.cardSelected]}
    >
      <Image
        source={{ uri: `data:image/jpeg;base64,${image.url}` }}
        style={styles.image}
        resizeMode="cover"
      />
      {image.selected && (
        <View style={styles.badge}>
          <Check size={14} color="#fff" strokeWidth={3} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#17171D',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: '#7C5CFF',
  },
  image: {
    width: '100%',
    height: 180,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7C5CFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
