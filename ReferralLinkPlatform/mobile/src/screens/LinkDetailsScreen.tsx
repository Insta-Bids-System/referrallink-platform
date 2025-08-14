import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, Share } from 'react-native';
import { Card, Title, Text, Button, IconButton, Surface, Snackbar } from 'react-native-paper';
import * as Clipboard from 'expo-clipboard';
import { useReferralStore } from '../stores/referralStore';
import { referralApi } from '../services/referral.api';

export const LinkDetailsScreen = ({ route, navigation }: any) => {
  const { linkId, linkData, newLink } = route.params;
  const { currentLink } = useReferralStore();
  const [link, setLink] = useState(linkData || currentLink || null);
  const [loading, setLoading] = useState(!link);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  useEffect(() => {
    // If we don't have link data, fetch it
    if (!link && linkId) {
      fetchLinkDetails();
    }
  }, [linkId]);

  const fetchLinkDetails = async () => {
    try {
      const details = await referralApi.getLinkDetails(linkId);
      setLink(details);
    } catch (error) {
      console.error('Error fetching link details:', error);
      // Use fallback data if fetch fails
      setLink({
        id: linkId,
        shortCode: 'loading',
        url: 'https://referrallink-platform-production.up.railway.app/r/loading',
        destinationUrl: 'https://instabids.ai',
        clicks: 0,
        conversions: 0,
        createdAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  // Build the full URL if not present
  const shortUrl = link?.url || link?.shortUrl || 
    (link?.shortCode ? `https://referrallink-platform-production.up.railway.app/r/${link.shortCode}` : '');

  const copyToClipboard = async () => {
    if (shortUrl) {
      await Clipboard.setStringAsync(shortUrl);
      setSnackbarMessage('Link copied to clipboard!');
      setSnackbarVisible(true);
    }
  };

  const shareLink = async () => {
    try {
      await Share.share({
        message: `Check out this amazing opportunity at InstaBids!\n\n${shortUrl}`,
        url: shortUrl,
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Loading link details...</Text>
      </View>
    );
  }

  if (!link) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>Link not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Link Details</Title>
          
          {newLink && (
            <Surface style={styles.successBanner}>
              <Text style={styles.successText}>✅ Link created successfully!</Text>
            </Surface>
          )}
          
          <Surface style={styles.urlContainer}>
            <Text style={styles.shortUrl}>{shortUrl}</Text>
            <View style={styles.actions}>
              <IconButton icon="content-copy" onPress={copyToClipboard} />
              <IconButton icon="share-variant" onPress={shareLink} />
            </View>
          </Surface>

          <Text style={styles.label}>Destination:</Text>
          <Text style={styles.value}>{link.destinationUrl || link.originalUrl || 'https://instabids.ai'}</Text>

          {link.customMessage && (
            <>
              <Text style={styles.label}>Custom Message:</Text>
              <Text style={styles.value}>{link.customMessage}</Text>
            </>
          )}

          <Text style={styles.label}>Created:</Text>
          <Text style={styles.value}>
            {new Date(link.createdAt).toLocaleDateString()}
          </Text>
          
          {link.expiresAt && (
            <>
              <Text style={styles.label}>Expires:</Text>
              <Text style={styles.value}>
                {new Date(link.expiresAt).toLocaleDateString()}
              </Text>
            </>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Performance</Title>
          
          <View style={styles.statsGrid}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{link.statistics?.totalClicks || link.clicks || 0}</Text>
              <Text style={styles.statLabel}>Total Clicks</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{link.statistics?.conversions || link.conversions || 0}</Text>
              <Text style={styles.statLabel}>Conversions</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>
                {link.statistics?.conversionRate || link.conversionRate || 0}%
              </Text>
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
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}>
        {snackbarMessage}
      </Snackbar>
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBanner: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    marginVertical: 12,
  },
  successText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});