import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { decomposeIntent } from '../lib/gemma';
import { SubTask } from '../types';
import { RootStackParamList } from './types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Supervisor'>;
type Route = RouteProp<RootStackParamList, 'Supervisor'>;

export default function SupervisorScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { userPrompt, selectedTemplates } = route.params;

  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const dotAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef<Animated.Value[]>([]).current;

  // Pulse animation for the thinking dot
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Decompose intent and stagger sub-task chips
  useEffect(() => {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
    decomposeIntent(userPrompt, selectedTemplates, apiKey).then((tasks) => {
      setSubTasks(tasks);
      tasks.forEach((_, i) => {
        itemAnims.push(new Animated.Value(0));
        setTimeout(() => {
          setVisibleCount((c) => c + 1);
          Animated.spring(itemAnims[i], { toValue: 1, useNativeDriver: true }).start();
        }, 150 * (i + 1));
      });

      // Auto-advance to image grid once all tasks are shown
      setTimeout(() => {
        navigation.replace('ImageGrid', { subTasks: tasks });
      }, 150 * tasks.length + 1200);
    });
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Radial violet glow — the one gradient in the app */}
      <View style={styles.glowContainer} pointerEvents="none">
        <View style={styles.glow} />
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.dotRow, { opacity: dotAnim }]}>
          <View style={styles.dot} />
        </Animated.View>

        <Text style={styles.title}>Gemma is thinking...</Text>
        <Text style={styles.subtitle}>Decomposing your intent into generation sub-tasks</Text>

        <View style={styles.chipList}>
          {subTasks.slice(0, visibleCount).map((task, i) => (
            <Animated.View
              key={task.id}
              style={[
                styles.taskChip,
                {
                  opacity: itemAnims[i] ?? 1,
                  transform: [{ translateY: (itemAnims[i] ?? new Animated.Value(1)).interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
                },
              ]}
            >
              <Text style={styles.taskChipText}>
                ✦ Generating {task.template} variant...
              </Text>
            </Animated.View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0B0B0F' },
  glowContainer: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
  glow: {
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#7C5CFF',
    opacity: 0.12,
    marginTop: -100,
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  dotRow: { marginBottom: 24 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#7C5CFF' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#F5F5F7', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#8A8A94', textAlign: 'center', marginBottom: 32 },
  chipList: { gap: 10, width: '100%' },
  taskChip: {
    backgroundColor: '#17171D',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#7C5CFF',
  },
  taskChipText: { color: '#F5F5F7', fontSize: 15 },
});
