import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';

export default function SettingsScreen() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={[styles.section, isDark && styles.sectionDark]}>
        <Text style={[styles.label, isDark && styles.textDark]}>
          ダークモード
        </Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
          thumbColor={isDark ? '#2563eb' : '#f9fafb'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sectionDark: {
    backgroundColor: '#1f2937',
  },
  label: {
    fontSize: 16,
    color: '#1f2937',
  },
  textDark: {
    color: '#f9fafb',
  },
});
