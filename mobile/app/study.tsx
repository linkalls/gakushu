import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useTheme } from '../src/contexts/ThemeContext';
import { useStudy } from '../src/contexts/StudyContext';

export default function StudyScreen() {
  const { isDark } = useTheme();
  const { currentSession, startSession, recordAnswer } = useStudy();
  const [showAnswer, setShowAnswer] = useState(false);

  const handleRate = (rating: number) => {
    recordAnswer(rating >= 3);
    setShowAnswer(false);
    // TODO: Load next card
  };

  if (!currentSession) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <View style={styles.centerContent}>
          <Text style={[styles.title, isDark && styles.textDark]}>
            学習セッション
          </Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            デッキを選択して学習を開始してください
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => startSession(1)}
          >
            <Text style={styles.startButtonText}>学習を開始</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.header}>
        <Text style={[styles.progressText, isDark && styles.textDark]}>
          学習済み: {currentSession.cardsStudied}
        </Text>
        <Text style={[styles.progressText, isDark && styles.textDark]}>
          正解率: {currentSession.cardsStudied > 0 
            ? Math.round((currentSession.correctAnswers / currentSession.cardsStudied) * 100) 
            : 0}%
        </Text>
      </View>

      <View style={styles.cardContainer}>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.cardText, isDark && styles.textDark]}>
            質問: サンプル問題
          </Text>
          {showAnswer && (
            <Text style={[styles.answerText, isDark && styles.answerTextDark]}>
              回答: サンプル回答
            </Text>
          )}
        </View>

        {!showAnswer ? (
          <TouchableOpacity
            style={styles.showButton}
            onPress={() => setShowAnswer(true)}
          >
            <Text style={styles.showButtonText}>答えを表示</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.ratingButtons}>
            <TouchableOpacity
              style={[styles.ratingButton, styles.againButton]}
              onPress={() => handleRate(1)}
            >
              <Text style={styles.ratingButtonText}>Again</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ratingButton, styles.hardButton]}
              onPress={() => handleRate(2)}
            >
              <Text style={styles.ratingButtonText}>Hard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ratingButton, styles.goodButton]}
              onPress={() => handleRate(3)}
            >
              <Text style={styles.ratingButtonText}>Good</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ratingButton, styles.easyButton]}
              onPress={() => handleRate(4)}
            >
              <Text style={styles.ratingButtonText}>Easy</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  textDark: {
    color: '#f9fafb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  subtitleDark: {
    color: '#9ca3af',
  },
  startButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  cardDark: {
    backgroundColor: '#1f2937',
  },
  cardText: {
    fontSize: 18,
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  answerText: {
    fontSize: 16,
    color: '#2563eb',
    textAlign: 'center',
  },
  answerTextDark: {
    color: '#60a5fa',
  },
  showButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  showButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  ratingButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  againButton: {
    backgroundColor: '#ef4444',
  },
  hardButton: {
    backgroundColor: '#f59e0b',
  },
  goodButton: {
    backgroundColor: '#10b981',
  },
  easyButton: {
    backgroundColor: '#3b82f6',
  },
  ratingButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
