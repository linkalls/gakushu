import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/contexts/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563eb',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Anki Alternative',
            headerShown: true,
          }} 
        />
        <Stack.Screen 
          name="decks" 
          options={{ title: 'デッキ' }} 
        />
        <Stack.Screen 
          name="study" 
          options={{ title: '学習' }} 
        />
      </Stack>
    </ThemeProvider>
  );
}
