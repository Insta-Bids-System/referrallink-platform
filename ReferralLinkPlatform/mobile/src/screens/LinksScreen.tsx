import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Searchbar,
  FAB,
  Chip,
  IconButton,
  Surface,
  Badge,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { referralApi } from '../services/referral.api';

interface ReferralLink {
  id: string;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  conversions: number;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  tags?: string[];
}

export const LinksScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  const { data: links, refetch } = useQuery<ReferralLink[]>({
    queryKey: ['userLinks', filter],
    queryFn: () => referralApi.getUserLinks({ filter }),
  });

  const filteredLinks = links?.filter(link => {
    if (searchQuery) {
      return link.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
             link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderLink = ({ item }: { item: ReferralLink }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('LinkDetails' as any, { linkId: item.id })}
    >
      <Card style={styles.linkCard}>
        <Card.Content>
          <View style={styles.linkHeader}>
            <View style={styles.linkInfo}>
              <Text style={styles.shortCode}>/{item.shortCode}</Text>
              <Text style={styles.url} numberOfLines={1}>
                {item.originalUrl}
              </Text>
            </View>
            {item.isActive ? (
              <Badge style={styles.activeBadge}>Active</Badge>
            ) : (
              <Badge style={styles.expiredBadge}>Expired</Badge>
            )}
          </View>
          
          <View style={styles.stats}>
            <View style={styles.stat}>
              <IconButton icon="mouse" size={16} />
              <Text>{item.clicks} clicks</Text>
            </View>
            <View style={styles.stat}>
              <IconButton icon="check-circle" size={16} />
              <Text>{item.conversions} conversions</Text>
            </View>
            <View style={styles.stat}>
              <IconButton icon="calendar" size={16} />
              <Text>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          </View>

          {item.tags && item.tags.length > 0 && (
            <View style={styles.tags}>
              {item.tags.map(tag => (
                <Chip key={tag} style={styles.tag} textStyle={styles.tagText}>
                  {tag}
                </Chip>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <Searchbar
          placeholder="Search links..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <View style={styles.filters}>
          <Chip
            selected={filter === 'all'}
            onPress={() => setFilter('all')}
            style={styles.filterChip}
          >
            All
          </Chip>
          <Chip
            selected={filter === 'active'}
            onPress={() => setFilter('active')}
            style={styles.filterChip}
          >
            Active
          </Chip>
          <Chip
            selected={filter === 'expired'}
            onPress={() => setFilter('expired')}
            style={styles.filterChip}
          >
            Expired
          </Chip>
        </View>
      </Surface>

      <FlatList
        data={filteredLinks}
        renderItem={renderLink}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Title style={styles.emptyTitle}>No links yet</Title>
              <Text style={styles.emptyText}>
                Create your first referral link to get started
              </Text>
            </Card.Content>
          </Card>
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateLink' as any)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    elevation: 2,
  },
  searchbar: {
    marginBottom: 12,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
  },
  linkCard: {
    marginBottom: 12,
  },
  linkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  linkInfo: {
    flex: 1,
  },
  shortCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  url: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  activeBadge: {
    backgroundColor: '#4caf50',
  },
  expiredBadge: {
    backgroundColor: '#f44336',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  tag: {
    marginRight: 4,
    marginBottom: 4,
    height: 24,
  },
  tagText: {
    fontSize: 12,
  },
  emptyCard: {
    margin: 32,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});