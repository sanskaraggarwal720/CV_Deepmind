import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TemplateChip from '../components/TemplateChip';
import { TemplateId } from '../types';
import { RootStackParamList } from './types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const TEMPLATES: { label: string; value: TemplateId }[] = [
  { label: '🎬 Cinematic', value: 'cinematic' },
  { label: '📦 Product', value: 'product' },
  { label: '⬜ Minimalist', value: 'minimalist' },
  { label: '🌈 Vibrant', value: 'vibrant' },
];

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const [userPrompt, setUserPrompt] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState<TemplateId[]>(['cinematic']);

  const toggleTemplate = (value: TemplateId) => {
    setSelectedTemplates((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  const canGenerate = userPrompt.trim().length > 0 && selectedTemplates.length > 0;

  const handleGenerate = () => {
    navigation.navigate('Supervisor', {
      userPrompt: userPrompt.trim(),
      selectedTemplates,
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Content</Text>
        <Text style={styles.subtitle}>Describe your idea and pick a visual style</Text>

        {/* Prompt input */}
        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            value={userPrompt}
            onChangeText={setUserPrompt}
            placeholder="Describe your idea..."
            placeholderTextColor="#8A8A94"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Template chips */}
        <Text style={styles.sectionHeader}>Visual Style</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {TEMPLATES.map((t) => (
            <TemplateChip
              key={t.value}
              label={t.label}
              value={t.value}
              selected={selectedTemplates.includes(t.value)}
              onPress={toggleTemplate}
            />
          ))}
        </ScrollView>

        {/* Generate CTA */}
        <TouchableOpacity
          style={[styles.generateBtn, !canGenerate && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={!canGenerate}
          activeOpacity={0.8}
        >
          <Text style={styles.generateBtnText}>Generate Content →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B0B0F' },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#F5F5F7', marginTop: 8, marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#8A8A94', marginBottom: 24 },
  inputCard: {
    backgroundColor: '#17171D',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  input: {
    color: '#F5F5F7',
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8A8A94',
    marginBottom: 12,
  },
  chipsRow: { marginBottom: 32 },
  generateBtn: {
    backgroundColor: '#7C5CFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  generateBtnDisabled: { opacity: 0.4 },
  generateBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
