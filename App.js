import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL =
  'https://valorant-api.com/v1/agents?isPlayableCharacter=true&language=tr-TR';

export default function App() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  const loadAgents = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }
      const json = await response.json();
      setAgents(Array.isArray(json.data) ? json.data : []);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Image
        source={{ uri: item.displayIcon }}
        style={styles.icon}
        resizeMode="cover"
      />
      <Text style={styles.name} numberOfLines={1}>
        {item.displayName}
      </Text>
      {item.role ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.role.displayName}</Text>
        </View>
      ) : null}
    </View>
  );

  // Tam liste (agents) korunur; ekranda yalnızca filtrelenmiş liste gösterilir.
  const query = search.trim().toLowerCase();
  const filteredAgents = query
    ? agents.filter((agent) =>
        (agent.displayName || '').toLowerCase().includes(query)
      )
    : agents;

  let content;
  if (loading) {
    content = (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ff4655" />
        <Text style={styles.info}>Ajanlar yükleniyor...</Text>
      </View>
    );
  } else if (error) {
    content = (
      <View style={styles.center}>
        <Text style={styles.errorText}>Bağlantı hatası oluştu.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadAgents}>
          <Text style={styles.retryText}>Tekrar dene</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    content = (
      <View style={styles.listWrapper}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Ajan ara..."
            placeholderTextColor="#6b7c8c"
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
        <FlatList
          data={filteredAgents}
          keyExtractor={(item) => item.uuid}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            query ? <Text style={styles.emptyText}>Ajan bulunamadı</Text> : null
          }
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Valorant Ajanları</Text>
      </View>
      {content}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1923',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2a3643',
  },
  title: {
    color: '#ece8e1',
    fontSize: 26,
    fontWeight: '800',
  },
  listWrapper: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  searchInput: {
    backgroundColor: '#1b2733',
    color: '#ece8e1',
    borderWidth: 1,
    borderColor: '#2a3643',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  emptyText: {
    color: '#9fb0bf',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b2733',
    borderRadius: 12,
    padding: 10,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2a3643',
  },
  name: {
    flex: 1,
    color: '#ece8e1',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 14,
  },
  badge: {
    backgroundColor: '#ff4655',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  info: {
    color: '#9fb0bf',
    marginTop: 12,
    fontSize: 15,
  },
  errorText: {
    color: '#ece8e1',
    fontSize: 17,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#ff4655',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
