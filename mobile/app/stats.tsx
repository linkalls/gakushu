import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';
import { useStudy } from '../src/contexts/StudyContext';

export default function StatsScreen() {
  const { isDark } = useTheme();
  const { getTodayStats } = useStudy();
  const stats = getTodayStats();

  const statCards = [
    { label: '今日の学習', value: stats.studied, color: '#2563eb' },
    { label: '正解', value: stats.correct, color: '#10b981' },
    { label: '正解率', value: `${Math.round(stats.accuracy)}%`, color: '#f59e0b' },
  ];

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.content}>
        <Text style={[styles.title, isDark && styles.textDark]}>
          学習統計
        </Text>

        <View style={styles.statsGrid}>
          {statCards.map((stat, index) => (
            <View 
              key={index}
              style={[styles.statCard, isDark && styles.statCardDark]}
            >
              <Text style={[styles.statLabel, isDark && styles.statLabelDark]}>
                {stat.label}
              </Text>
              <Text style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            週間レポート
          </Text>
          <Text style={[styles.sectionText, isDark && styles.sectionTextDark]}>
            今週の学習データはまだありません
          </Text>
        </View>

        <View style={[styles.section, isDark && styles.sectionDark]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            月間レポート
          </Text>
          <Text style={[styles.sectionText, isDark && styles.sectionTextDark]}>
            今月の学習データはまだありません
          </Text>
        </View>
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
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  textDark: {
    color: '#f9fafb',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardDark: {
    backgroundColor: '#1f2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  statLabelDark: {
    color: '#9ca3af',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionDark: {
    backgroundColor: '#1f2937',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  sectionTextDark: {
    color: '#9ca3af',
  },
});
