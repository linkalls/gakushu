import { Text, View, StyleSheet } from 'react-native';
import { Link } from 'solito/link';

interface DeckCardProps {
  id: number;
  name: string;
  description: string;
  cardCount: number;
  dueCount: number;
}

export function DeckCard({ id, name, description, cardCount, dueCount }: DeckCardProps) {
  return (
    <Link href={`/deck/${id}`}>
      <View style={styles.card}>
        <Text style={styles.title}>{name}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
        <View style={styles.stats}>
          <Text style={styles.statText}>
            カード: {cardCount}
          </Text>
          <Text style={[styles.statText, styles.dueText]}>
            復習: {dueCount}
          </Text>
        </View>
      </View>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statText: {
    fontSize: 12,
    color: '#888',
  },
  dueText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
