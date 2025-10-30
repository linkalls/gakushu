import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useTheme } from '../src/contexts/ThemeContext';
import { useApp } from '../src/contexts/AppContext';
import type { Deck } from '../src/contexts/AppContext';

export default function DecksScreen() {
  const { isDark } = useTheme();
  const { decks, setDecks, isLoading, setIsLoading, setError } = useApp();

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/decks');
      const data = await response.json();
      setDecks(data);
    } catch (error) {
      setError('デッキの取得に失敗しました');
      console.error('Failed to fetch decks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDeckItem = ({ item }: { item: Deck }) => (
    <TouchableOpacity 
      style={[styles.deckCard, isDark && styles.deckCardDark]}
    >
      <View style={styles.deckHeader}>
        <Text style={[styles.deckName, isDark && styles.textDark]}>
          {item.name}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>復習待ち</Text>
        </View>
      </View>
      {item.description && (
        <Text style={[styles.deckDescription, isDark && styles.descriptionDark]}>
          {item.description}
        </Text>
      )}
      <View style={styles.deckStats}>
        <Text style={[styles.statText, isDark && styles.statTextDark]}>
          カード: 0
        </Text>
        <Text style={[styles.statText, isDark && styles.statTextDark]}>
          新規: 0
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <FlatList
        data={decks}
        renderItem={renderDeckItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isDark && styles.textDark]}>
              デッキがありません
            </Text>
          </View>
        }
      />
    </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  listContent: {
    padding: 16,
  },
  deckCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deckCardDark: {
    backgroundColor: '#1f2937',
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deckName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  textDark: {
    color: '#f9fafb',
  },
  badge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  deckDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  descriptionDark: {
    color: '#9ca3af',
  },
  deckStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statText: {
    fontSize: 14,
    color: '#6b7280',
  },
  statTextDark: {
    color: '#9ca3af',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
});
