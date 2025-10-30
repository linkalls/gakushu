import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useState, useEffect } from 'react';
import { useSharing } from '../../src/contexts';

export default function SharingScreen() {
  const { sharedDecks, loading, fetchPublicDecks, downloadDeck, likeDeck } = useSharing();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPublicDecks();
  }, []);

  const filteredDecks = sharedDecks.filter(deck =>
    deck.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = async (shareCode: string) => {
    try {
      await downloadDeck(shareCode);
      alert('デッキをダウンロードしました！');
    } catch (error) {
      alert('ダウンロードに失敗しました');
    }
  };

  const handleLike = async (deckId: number) => {
    try {
      await likeDeck(deckId);
    } catch (error) {
      alert('いいねに失敗しました');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>共有デッキ</Text>
      
      <TextInput
        style={styles.searchInput}
        placeholder="デッキを検索..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredDecks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.deckCard}>
            <Text style={styles.deckTitle}>{item.title}</Text>
            <Text style={styles.deckDescription}>{item.description}</Text>
            
            <View style={styles.stats}>
              <Text style={styles.statText}>
                ⬇️ {item.downloadCount} ダウンロード
              </Text>
              <Text style={styles.statText}>
                ❤️ {item.likeCount} いいね
              </Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => handleDownload(item.shareCode)}
              >
                <Text style={styles.buttonText}>ダウンロード</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.likeButton}
                onPress={() => handleLike(item.id)}
              >
                <Text style={styles.buttonText}>いいね</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshing={loading}
        onRefresh={fetchPublicDecks}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  deckCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  deckTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  deckDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statText: {
    fontSize: 12,
    color: '#888',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  downloadButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  likeButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
