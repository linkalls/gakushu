import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { useTemplate } from '../../src/contexts';

export default function TemplatesScreen() {
  const {
    publicTemplates,
    templates,
    loading,
    fetchPublicTemplates,
    fetchTemplates,
    downloadTemplate,
  } = useTemplate();

  const [showPublic, setShowPublic] = useState(true);

  useEffect(() => {
    if (showPublic) {
      fetchPublicTemplates();
    } else {
      fetchTemplates();
    }
  }, [showPublic]);

  const handleDownload = async (id: number) => {
    try {
      await downloadTemplate(id);
      alert('テンプレートをダウンロードしました！');
    } catch (error) {
      alert('ダウンロードに失敗しました');
    }
  };

  const currentTemplates = showPublic ? publicTemplates : templates;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>カスタムテンプレート</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, showPublic && styles.activeToggle]}
          onPress={() => setShowPublic(true)}
        >
          <Text style={[styles.toggleText, showPublic && styles.activeToggleText]}>
            公開テンプレート
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, !showPublic && styles.activeToggle]}
          onPress={() => setShowPublic(false)}
        >
          <Text style={[styles.toggleText, !showPublic && styles.activeToggleText]}>
            マイテンプレート
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentTemplates}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.templateCard}>
            <Text style={styles.templateName}>{item.name}</Text>
            
            <View style={styles.templatePreview}>
              <Text style={styles.previewLabel}>フロント:</Text>
              <Text style={styles.previewText} numberOfLines={2}>
                {item.frontTemplate}
              </Text>
            </View>

            <View style={styles.templatePreview}>
              <Text style={styles.previewLabel}>バック:</Text>
              <Text style={styles.previewText} numberOfLines={2}>
                {item.backTemplate}
              </Text>
            </View>

            {showPublic && (
              <View style={styles.stats}>
                <Text style={styles.statText}>
                  ⬇️ {item.downloadCount} ダウンロード
                </Text>
              </View>
            )}

            {showPublic && (
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => handleDownload(item.id)}
              >
                <Text style={styles.buttonText}>ダウンロード</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        refreshing={loading}
        onRefresh={() => {
          if (showPublic) {
            fetchPublicTemplates();
          } else {
            fetchTemplates();
          }
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
  toggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
  },
  activeToggle: {
    borderBottomColor: '#007AFF',
  },
  toggleText: {
    fontSize: 14,
    color: '#666',
  },
  activeToggleText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  templateCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 8,
  },
  templateName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  templatePreview: {
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
  },
  stats: {
    marginBottom: 12,
  },
  statText: {
    fontSize: 12,
    color: '#888',
  },
  downloadButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
