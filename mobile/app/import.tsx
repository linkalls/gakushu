import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';

export default function ImportScreen() {
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <Text style={[styles.text, isDark && styles.textDark]}>
        インポート画面（開発中）
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  text: {
    fontSize: 16,
    color: '#1f2937',
  },
  textDark: {
    color: '#f9fafb',
  },
});
