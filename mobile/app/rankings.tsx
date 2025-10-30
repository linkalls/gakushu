import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useRanking } from '../../src/contexts';

type RankingType = 'reviews' | 'streak' | 'time';

export default function RankingsScreen() {
  const {
    globalRankings,
    streakRankings,
    studyTimeRankings,
    userRanking,
    loading,
    fetchGlobalRankings,
    fetchStreakRankings,
    fetchStudyTimeRankings,
  } = useRanking();

  const [selectedType, setSelectedType] = useState<RankingType>('reviews');

  useEffect(() => {
    fetchGlobalRankings();
    fetchStreakRankings();
    fetchStudyTimeRankings();
  }, []);

  const getCurrentRankings = () => {
    switch (selectedType) {
      case 'reviews':
        return globalRankings;
      case 'streak':
        return streakRankings;
      case 'time':
        return studyTimeRankings;
    }
  };

  const getStatValue = (item: any) => {
    switch (selectedType) {
      case 'reviews':
        return `${item.totalReviews} レビュー`;
      case 'streak':
        return `${item.currentStreak} 日連続`;
      case 'time':
        return `${Math.floor(item.totalStudyTime / 3600)} 時間`;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ランキング</Text>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedType === 'reviews' && styles.activeTab]}
          onPress={() => setSelectedType('reviews')}
        >
          <Text style={[styles.tabText, selectedType === 'reviews' && styles.activeTabText]}>
            レビュー数
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedType === 'streak' && styles.activeTab]}
          onPress={() => setSelectedType('streak')}
        >
          <Text style={[styles.tabText, selectedType === 'streak' && styles.activeTabText]}>
            連続日数
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedType === 'time' && styles.activeTab]}
          onPress={() => setSelectedType('time')}
        >
          <Text style={[styles.tabText, selectedType === 'time' && styles.activeTabText]}>
            学習時間
          </Text>
        </TouchableOpacity>
      </View>

      {userRanking && (
        <View style={styles.userCard}>
          <Text style={styles.userCardTitle}>あなたのランキング</Text>
          <View style={styles.userStats}>
            <Text style={styles.userStat}>
              📊 {userRanking.totalReviews} レビュー
            </Text>
            <Text style={styles.userStat}>
              🔥 {userRanking.currentStreak} 日連続
            </Text>
            <Text style={styles.userStat}>
              ⏱️ {Math.floor(userRanking.totalStudyTime / 3600)} 時間
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={getCurrentRankings()}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item, index }) => (
          <View style={styles.rankItem}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankNumber}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </Text>
            </View>
            
            <View style={styles.rankInfo}>
              <Text style={styles.userId}>User {item.userId.substring(0, 8)}</Text>
              <Text style={styles.rankStat}>{getStatValue(item)}</Text>
            </View>
          </View>
        )}
        refreshing={loading}
        onRefresh={() => {
          fetchGlobalRankings();
          fetchStreakRankings();
          fetchStudyTimeRankings();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  userCard: {
    backgroundColor: '#f0f8ff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  userCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  userStat: {
    fontSize: 12,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  rankBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  rankInfo: {
    flex: 1,
  },
  userId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rankStat: {
    fontSize: 14,
    color: '#666',
  },
});
