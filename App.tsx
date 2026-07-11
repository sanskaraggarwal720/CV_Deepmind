import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './screens/HomeScreen';
import SupervisorScreen from './screens/SupervisorScreen';
import ImageGridScreen from './screens/ImageGridScreen';
import VideoStudioScreen from './screens/VideoStudioScreen';
import PostComposerScreen from './screens/PostComposerScreen';

import type { RootStackParamList } from './screens/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: { backgroundColor: '#0B0B0F' },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Supervisor" component={SupervisorScreen} />
          <Stack.Screen name="ImageGrid" component={ImageGridScreen} />
          <Stack.Screen name="VideoStudio" component={VideoStudioScreen} />
          <Stack.Screen name="PostComposer" component={PostComposerScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
