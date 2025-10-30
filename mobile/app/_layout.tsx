import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { AppProvider } from '../src/contexts/AppContext';
import { StudyProvider } from '../src/contexts/StudyContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppProvider>
        <StudyProvider>
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
            <Stack.Screen 
              name="browse" 
              options={{ title: '参照' }} 
            />
            <Stack.Screen 
              name="stats" 
              options={{ title: '統計' }} 
            />
            <Stack.Screen 
              name="import" 
              options={{ title: 'インポート' }} 
            />
            <Stack.Screen 
              name="settings" 
              options={{ title: '設定' }} 
            />
          </Stack>
        </StudyProvider>
      </AppProvider>
    </ThemeProvider>
  );
}
