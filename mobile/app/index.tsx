import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '../src/contexts/ThemeContext';

export default function HomeScreen() {
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { title: 'デッキ', icon: '📚', href: '/decks' },
    { title: '学習', icon: '✏️', href: '/study' },
    { title: '参照', icon: '🔍', href: '/browse' },
    { title: '統計', icon: '📊', href: '/stats' },
    { title: 'インポート', icon: '📥', href: '/import' },
    { title: '設定', icon: '⚙️', href: '/settings' },
  ];

  return (
    <ScrollView 
      style={[
        styles.container,
        isDark && styles.containerDark
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.textDark]}>
          Anki Alternative
        </Text>
        <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
          間隔反復学習システム
        </Text>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
          <Text style={styles.themeButtonText}>
            {isDark ? '☀️ ライト' : '🌙 ダーク'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href as any} asChild>
            <TouchableOpacity 
              style={[
                styles.card,
                isDark && styles.cardDark
              ]}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={[styles.cardTitle, isDark && styles.textDark]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  subtitleDark: {
    color: '#9ca3af',
  },
  textDark: {
    color: '#f9fafb',
  },
  themeButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  themeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1f2937',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
  },
});
