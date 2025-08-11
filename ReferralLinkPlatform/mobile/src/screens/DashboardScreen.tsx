import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Surface,
  IconButton,
  ProgressBar,
  Chip,
  FAB,
} from 'react-native-paper';
import { ChartComponent } from '../components/ChartComponent';
import { Dimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../services/analytics.api';
import { referralApi } from '../services/referral.api';
import { useAuthStore } from '../stores/authStore';

const screenWidth = Dimensions.get('window').width;

interface UserStats {
  totalSent: number;
  totalClicks: number;
  conversions: number;
  conversionRate: number;
  chartData?: {
    labels?: string[];
    clicks?: number[];
    conversions?: number[];
    datasets?: Array<{
      data: number[];
    }>;
  };
}

interface ReferralLink {
  id: string;
  title?: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  conversions: number;
}

export const DashboardScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const { data: stats, refetch: refetchStats } = useQuery<UserStats>({
    queryKey: ['userStats'],
    queryFn: analyticsApi.getUserStats,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: recentLinks } = useQuery<ReferralLink[]>({
    queryKey: ['recentLinks'],
    queryFn: () => referralApi.getUserLinks({ limit: 5 }),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchStats();
    setRefreshing(false);
  };

  const chartData = {
    labels: stats?.chartData?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    clicks: stats?.chartData?.clicks || [0, 0, 0, 0, 0, 0, 0],
    conversions: stats?.chartData?.conversions || [0, 0, 0, 0, 0, 0, 0],
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <Title>Welcome back, {user?.firstName}!</Title>
            <Paragraph>Your referral campaign is performing well</Paragraph>
          </Card.Content>
        </Card>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Surface style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.totalSent || 0}</Text>
            <Text style={styles.statLabel}>Links Sent</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.totalClicks || 0}</Text>
            <Text style={styles.statLabel}>Total Clicks</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.conversions || 0}</Text>
            <Text style={styles.statLabel}>Conversions</Text>
          </Surface>
          <Surface style={styles.statCard}>
            <Text style={styles.statValue}>
              {stats?.conversionRate || 0}%
            </Text>
            <Text style={styles.statLabel}>Conv. Rate</Text>
          </Surface>
        </View>

        {/* Performance Chart */}
        <Card style={styles.chartCard}>
          <Card.Content>
            <Title>Weekly Performance</Title>
            <ChartComponent data={chartData} />
            <View style={styles.legendContainer}>
              <Chip textStyle={{ color: '#8641f4' }} style={{ marginHorizontal: 8 }}>
                Clicks
              </Chip>
              <Chip textStyle={{ color: '#22c55e' }} style={{ marginHorizontal: 8 }}>
                Conversions
              </Chip>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Links */}
        <Card style={styles.recentLinksCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Title>Recent Links</Title>
              <Button
                mode="text"
                onPress={() => navigation.navigate('MyLinks')}
              >
                View All
              </Button>
            </View>
            {recentLinks?.map((link) => (
              <TouchableOpacity
                key={link.id}
                onPress={() =>
                  navigation.navigate('LinkDetails', { linkId: link.id })
                }
              >
                <Surface style={styles.linkItem}>
                  <View style={styles.linkInfo}>
                    <Text style={styles.linkCode}>/{link.shortCode}</Text>
                    <Text style={styles.linkStats}>
                      {link.clicks} clicks • {link.conversions} conversions
                    </Text>
                  </View>
                  <IconButton icon="chevron-right" size={20} />
                </Surface>
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <Card.Content>
            <Title>Quick Actions</Title>
            <View style={styles.actionsGrid}>
              <Button
                mode="contained"
                icon="link-plus"
                onPress={() => navigation.navigate('CreateLink')}
                style={styles.actionButton}
              >
                New Link
              </Button>
              <Button
                mode="contained"
                icon="send"
                onPress={() => navigation.navigate('SendReferral')}
                style={styles.actionButton}
              >
                Send Referral
              </Button>
              <Button
                mode="contained"
                icon="contacts"
                onPress={() => navigation.navigate('Contacts')}
                style={styles.actionButton}
              >
                Import Contacts
              </Button>
              <Button
                mode="contained"
                icon="chart-line"
                onPress={() => navigation.navigate('Analytics')}
                style={styles.actionButton}
              >
                View Analytics
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateLink')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcomeCard: {
    margin: 16,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  chartCard: {
    margin: 16,
    elevation: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  recentLinksCard: {
    margin: 16,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 1,
  },
  linkInfo: {
    flex: 1,
  },
  linkCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  linkStats: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionsCard: {
    margin: 16,
    marginBottom: 80,
    elevation: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    margin: 6,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
});