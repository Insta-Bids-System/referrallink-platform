import React from 'react';
import { View, ScrollView, StyleSheet, Share } from 'react-native';
import { Card, Title, Text, Button, IconButton, Surface } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';

export const LinkDetailsScreen = ({ route, navigation }: any) => {
  const { linkId } = route.params;
  
  // Mock data - replace with actual API call
  const link = {
    id: linkId,
    shortCode: 'abc123',
    originalUrl: 'https://example.com/product',
    shortUrl: 'https://link.app/abc123',
    clicks: 42,
    conversions: 5,
    conversionRate: 11.9,
    createdAt: new Date().toISOString(),
  };

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(link.shortUrl);
    // Show toast or snackbar
  };

  const shareLink = async () => {
    try {
      await Share.share({
        message: `Check this out: ${link.shortUrl}`,
        url: link.shortUrl,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Link Details</Title>
          
          <Surface style={styles.urlContainer}>
            <Text style={styles.shortUrl}>{link.shortUrl}</Text>
            <View style={styles.actions}>
              <IconButton icon="content-copy" onPress={copyToClipboard} />
              <IconButton icon="share-variant" onPress={shareLink} />
            </View>
          </Surface>

          <Text style={styles.label}>Destination:</Text>
          <Text style={styles.value}>{link.originalUrl}</Text>

          <Text style={styles.label}>Created:</Text>
          <Text style={styles.value}>
            {new Date(link.createdAt).toLocaleDateString()}
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Performance</Title>
          
          <View style={styles.statsGrid}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{link.clicks}</Text>
              <Text style={styles.statLabel}>Total Clicks</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{link.conversions}</Text>
              <Text style={styles.statLabel}>Conversions</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{link.conversionRate}%</Text>
              <Text style={styles.statLabel}>Conversion Rate</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Button mode="contained" onPress={shareLink} style={styles.button}>
            Share Link
          </Button>
          <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
            Back to Links
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  urlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginVertical: 16,
    elevation: 1,
  },
  shortUrl: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  button: {
    marginTop: 12,
  },
});