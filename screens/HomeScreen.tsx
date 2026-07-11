import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, ActivityIndicator, Keyboard, Pressable, KeyboardAvoidingView, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TemplateChip from '../components/TemplateChip';
import { TemplateId } from '../types';
import { RootStackParamList } from './types';
import { listModels, GeminiModel } from '../lib/gemma';
import { ChevronDown, ChevronUp } from 'lucide-react-native';

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
        setSelectedModel(models[0].name); // Select first model by default
      }
      setIsLoadingModels(false);
    };
    fetchModels();
  }, []);

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
      selectedModel,
    });
  };

  const activeModelDisplay = availableModels.find(m => m.name === selectedModel)?.displayName || 'Select a model';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss} accessible={false}>
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

            {/* Model Selection Dropdown */}
            <Text style={styles.sectionHeader}>Gemini Model</Text>
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
                      onPress={() => {
                        setSelectedModel(model.name);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, selectedModel === model.name && styles.dropdownItemTextSelected]}>
                        {model.displayName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
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
          </ScrollView>

          {/* Generate CTA Fixed at Bottom */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.generateBtn, !canGenerate && styles.generateBtnDisabled]}
              onPress={handleGenerate}
              disabled={!canGenerate}
              activeOpacity={0.8}
            >
              <Text style={styles.generateBtnText}>Generate Content →</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
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
  dropdownContainer: {
    marginBottom: 24,
    zIndex: 10,
  },
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
  dropdownHeaderText: {
    color: '#F5F5F7',
    fontSize: 15,
  },
  dropdownList: {
    backgroundColor: '#1C1C24',
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2A2A35',
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemSelected: {
    backgroundColor: '#2A2A35',
  },
  dropdownItemText: {
    color: '#8A8A94',
    fontSize: 15,
  },
  dropdownItemTextSelected: {
    color: '#F5F5F7',
    fontWeight: '600',
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
  bottomBar: { 
    padding: 20, 
    paddingBottom: Platform.OS === 'ios' ? 20 : 36, 
    backgroundColor: '#0B0B0F', 
    borderTopWidth: 1, 
    borderTopColor: '#17171D' 
  },
});
