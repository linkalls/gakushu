import { View, Text, StyleSheet } from 'react-native';

interface StatsCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: string;
}

export function StatsCard({ title, value, subtitle, color = '#007AFF' }: StatsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    textAlign: 'center',
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
