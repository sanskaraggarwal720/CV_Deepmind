import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import LocalLLM from './components/LocalLLM';

export default function App() {
  return (
    <View style={styles.container}>
      <LocalLLM />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
