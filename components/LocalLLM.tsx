import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { createLLM, GEMMA_3N_E2B_IT_INT4 } from 'react-native-litert-lm';

// Instantiate the LLM controller.
const llm = createLLM();

export default function LocalLLM() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the model on component mount (this will trigger a download if it's not cached locally)
  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        // We use the 1.3GB model (GEMMA_3N_E2B_IT_INT4) as it works better on standard emulators.
        // For the 2.5GB Gemma 4 E2B, you would change this to GEMMA_4_E2B_IT.
        await llm.loadModel(GEMMA_3N_E2B_IT_INT4);
        setIsLoaded(true);
      } catch (e: any) {
        setError(e.message || "Failed to load model");
      } finally {
        setIsLoading(false);
      }
    }
    
    load();
  }, []);

  const handleSend = () => {
    if (!prompt.trim() || !isLoaded) return;
    
    setResponse('');
    setIsGenerating(true);
    setError(null);
    
    try {
      llm.sendMessageAsync(prompt, (token: string, done: boolean) => {
        setResponse((prev) => prev + token);
        if (done) {
          setIsGenerating(false);
        }
      });
    } catch (e: any) {
      setError(e.message || "Failed to generate response");
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Local Gemma LLM Inference</Text>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Downloading & Loading Model...</Text>
          <Text style={styles.subtext}>(This might take a while depending on network speed)</Text>
        </View>
      ) : isLoaded ? (
        <View style={styles.chatContainer}>
          <ScrollView style={styles.responseArea}>
            <Text style={styles.responseText}>{response}</Text>
          </ScrollView>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Ask Gemma something..."
              editable={!isGenerating}
            />
            <Button 
              title={isGenerating ? "..." : "Send"} 
              onPress={handleSend} 
              disabled={isGenerating || !prompt.trim()} 
            />
          </View>
        </View>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: 16,
    backgroundColor: '#e6f7ff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  subtext: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  chatContainer: {
    flex: 1,
  },
  responseArea: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  responseText: {
    fontSize: 16,
    lineHeight: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});
