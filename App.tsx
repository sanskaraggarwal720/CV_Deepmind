import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';
import LocalLLM from './components/LocalLLM';

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-noir">
      <LocalLLM />
      <StatusBar style="light" />
    </SafeAreaView>
  );
}
