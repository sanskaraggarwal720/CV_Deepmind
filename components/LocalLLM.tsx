import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { createLLM, GEMMA_4_E2B_IT } from 'react-native-litert-lm';
import Markdown from 'react-native-markdown-display';
import { Send, RotateCcw } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const llm = createLLM();

const STORAGE_KEY = 'gemma_chat_history';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

export default function LocalLLM() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);

  // Load persisted chat history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setMessages(JSON.parse(stored));
        }
      } catch {}
    }
    loadHistory();
  }, []);

  // Persist messages to AsyncStorage whenever they change
  useEffect(() => {
    if (messages.length === 0) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages)).catch(() => {});
  }, [messages]);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        setLoadingStatus('Checking for model...');

        // Simulate progress phases while the model loads.
        // react-native-litert-lm automatically caches the model locally after first download.
        const progressTimer = setInterval(() => {
          setDownloadProgress((prev) => {
            if (prev === null) return 5;
            if (prev >= 95) { clearInterval(progressTimer); return 95; }
            return prev + (prev < 50 ? 3 : 1); // faster at start, slows near end
          });
          setLoadingStatus((prev) => {
            if (prev === 'Checking for model...') return 'Downloading Gemma 4 (~2.5 GB)...';
            if (prev === 'Downloading Gemma 4 (~2.5 GB)...') return 'Downloading Gemma 4 (~2.5 GB)... This may take several minutes.';
            return prev;
          });
        }, 800);

        await llm.loadModel(GEMMA_4_E2B_IT);

        clearInterval(progressTimer);
        setDownloadProgress(100);
        setLoadingStatus('Model ready!');

        setTimeout(() => {
          setIsLoaded(true);
          setIsLoading(false);
        }, 500);
      } catch (e: any) {
        setError(e.message || 'Failed to load model');
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSend = () => {
    if (!prompt.trim() || !isLoaded || isGenerating) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: prompt.trim() };
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = { id: assistantMessageId, role: 'assistant', text: '' };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setPrompt('');
    setIsGenerating(true);
    setError(null);

    try {
      llm.sendMessageAsync(userMessage.text, (token: string, done: boolean) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, text: msg.text + token } : msg
          )
        );
        if (done) setIsGenerating(false);
      });
    } catch (e: any) {
      setError(e.message || 'Failed to generate response');
      setIsGenerating(false);
    }
  };

  const handleReset = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      llm.resetConversation();
      setMessages([]);
    } catch {}
  };

  return (
    <View className="flex-1 w-full bg-noir">
      {/* Header */}
      <View className="flex-row py-4 px-4 border-b border-surface/50 items-center justify-between">
        <View className="w-10" />
        <Text className="text-text-primary font-display text-18 font-semibold">Local Gemma</Text>
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center rounded-full"
          onPress={handleReset}
          disabled={isGenerating || isLoading || messages.length === 0}
        >
          <RotateCcw size={18} color={messages.length > 0 ? '#8A8A94' : '#3D3D45'} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center px-8">
          <ActivityIndicator size="large" color="#7C5CFF" />
          <Text className="text-text-primary mt-5 font-sans text-15 font-medium text-center">{loadingStatus}</Text>

          {downloadProgress !== null && (
            <View className="w-full mt-6">
              {/* Progress bar track */}
              <View className="w-full h-2 bg-surface rounded-full overflow-hidden">
                <View
                  className="h-2 bg-accent-violet rounded-full"
                  style={{ width: `${downloadProgress}%` }}
                />
              </View>
              <View className="flex-row justify-between mt-2">
                <Text className="text-text-muted font-sans text-13">{downloadProgress}%</Text>
                <Text className="text-text-muted font-sans text-13">First launch only</Text>
              </View>
            </View>
          )}
        </View>
      ) : isLoaded ? (
        <View className="flex-1 px-4">
          <ScrollView
            className="flex-1 py-4"
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.length === 0 && (
              <View className="flex-1 justify-center items-center mt-20">
                <Text className="text-text-muted text-15 font-sans">Send a message to start chatting.</Text>
              </View>
            )}

            {messages.map((msg) => (
              <View
                key={msg.id}
                className={`mb-4 max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-accent-violet self-end rounded-tr-sm'
                    : 'bg-surface self-start rounded-tl-sm'
                }`}
              >
                {msg.role === 'user' ? (
                  <Text className="text-white font-sans text-15">{msg.text}</Text>
                ) : (
                  <Markdown style={markdownStyles}>{msg.text}</Markdown>
                )}
              </View>
            ))}

            {isGenerating && (
              <View className="self-start mb-4 bg-surface rounded-2xl rounded-tl-sm px-4 py-3">
                <Text className="text-accent-violet font-sans">● ● ●</Text>
              </View>
            )}
          </ScrollView>

          <View className="flex-row items-end py-4 border-t border-surface/30">
            <TextInput
              className="flex-1 bg-surface text-text-primary rounded-2xl px-4 py-3 font-sans text-15 min-h-[48px] max-h-[120px]"
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Message Gemma..."
              placeholderTextColor="#8A8A94"
              multiline
              editable={!isGenerating}
              onSubmitEditing={handleSend}
            />
            <TouchableOpacity
              className={`ml-3 w-12 h-12 rounded-full items-center justify-center ${
                !prompt.trim() || isGenerating ? 'bg-surface opacity-50' : 'bg-accent-violet'
              }`}
              onPress={handleSend}
              disabled={isGenerating || !prompt.trim()}
            >
              <Send size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="flex-1 justify-center items-center px-8">
          <Text className="text-error font-sans text-15 text-center">Error: {error}</Text>
          <TouchableOpacity className="mt-4 bg-surface px-6 py-3 rounded-xl">
            <Text className="text-text-primary font-sans text-15">Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const markdownStyles = StyleSheet.create({
  body: {
    color: '#F5F5F7',
    fontFamily: 'Inter',
    fontSize: 15,
    lineHeight: 24,
  },
  code_inline: {
    backgroundColor: '#0B0B0F',
    color: '#3DDC97',
    paddingHorizontal: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  code_block: {
    backgroundColor: '#0B0B0F',
    color: '#3DDC97',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
    marginTop: 8,
    marginBottom: 8,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F5F5F7',
    marginBottom: 8,
    marginTop: 12,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F5F5F7',
    marginBottom: 8,
    marginTop: 12,
  },
  paragraph: {
    marginBottom: 8,
  },
  list_item: {
    marginBottom: 4,
  },
});
