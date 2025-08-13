import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  Button,
  Surface,
  TextInput,
  SegmentedButtons,
  Card,
  Chip,
  ProgressBar,
  Snackbar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import ContactSelector from '../components/ContactSelector';
import { useAuthStore } from '../stores/authStore';
import { useReferralStore } from '../stores/referralStore';
import { referralApi } from '../services/referral.api';

interface Contact {
  id: string;
  name: string;
  phoneNumbers?: Array<{ number?: string; label?: string }>;
  emails?: Array<{ email?: string; label?: string }>;
}

interface ShareResult {
  contactId: string;
  name: string;
  status: 'success' | 'failed';
  error?: string;
}

export const BulkShareScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { currentLink } = useReferralStore();
  
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  const [shareMethod, setShareMethod] = useState<'sms' | 'email' | 'whatsapp'>('sms');
  const [customMessage, setCustomMessage] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareProgress, setShareProgress] = useState(0);
  const [shareResults, setShareResults] = useState<ShareResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleContactsSelected = (contacts: Contact[]) => {
    setSelectedContacts(contacts);
  };

  const getDefaultMessage = () => {
    const linkUrl = currentLink?.shortUrl || 'https://instabids.ai/referral';
    return `Hey! Check out this amazing opportunity at InstaBids. I've been using it and thought you might be interested too!\n\n${linkUrl}\n\nLet me know if you have any questions!`;
  };

  const validateContacts = (): boolean => {
    if (selectedContacts.length === 0) {
      Alert.alert('No Contacts', 'Please select at least one contact to share with.');
      return false;
    }

    if (shareMethod === 'sms' || shareMethod === 'whatsapp') {
      const contactsWithPhone = selectedContacts.filter(c => c.phoneNumbers?.length);
      if (contactsWithPhone.length === 0) {
        Alert.alert('No Phone Numbers', 'Selected contacts don\'t have phone numbers for SMS/WhatsApp sharing.');
        return false;
      }
    }

    if (shareMethod === 'email') {
      const contactsWithEmail = selectedContacts.filter(c => c.emails?.length);
      if (contactsWithEmail.length === 0) {
        Alert.alert('No Email Addresses', 'Selected contacts don\'t have email addresses for email sharing.');
        return false;
      }
    }

    return true;
  };

  const handleBulkShare = async () => {
    if (!validateContacts()) return;
    
    if (!currentLink) {
      Alert.alert('No Link', 'Please create a referral link first.');
      navigation.navigate('CreateLink' as never);
      return;
    }

    Alert.alert(
      'Confirm Sharing',
      `Share your referral link with ${selectedContacts.length} contact${selectedContacts.length !== 1 ? 's' : ''} via ${shareMethod.toUpperCase()}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: performBulkShare },
      ]
    );
  };

  const performBulkShare = async () => {
    setIsSharing(true);
    setShareProgress(0);
    setShareResults([]);
    
    const message = customMessage || getDefaultMessage();
    const results: ShareResult[] = [];
    
    for (let i = 0; i < selectedContacts.length; i++) {
      const contact = selectedContacts[i];
      setShareProgress((i + 1) / selectedContacts.length);
      
      try {
        // Get contact method based on share type
        let recipient = '';
        if (shareMethod === 'sms' || shareMethod === 'whatsapp') {
          recipient = contact.phoneNumbers?.[0]?.number || '';
        } else if (shareMethod === 'email') {
          recipient = contact.emails?.[0]?.email || '';
        }
        
        if (!recipient) {
          results.push({
            contactId: contact.id,
            name: contact.name,
            status: 'failed',
            error: 'No contact method available',
          });
          continue;
        }
        
        // Send via API (you'll need to implement this endpoint)
        await referralApi.shareLink({
          linkId: currentLink.id,
          method: shareMethod,
          recipient,
          message,
          contactName: contact.name,
        });
        
        results.push({
          contactId: contact.id,
          name: contact.name,
          status: 'success',
        });
      } catch (error) {
        console.error(`Failed to share with ${contact.name}:`, error);
        results.push({
          contactId: contact.id,
          name: contact.name,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setShareResults(results);
    setIsSharing(false);
    setShowResults(true);
    
    const successCount = results.filter(r => r.status === 'success').length;
    const failCount = results.filter(r => r.status === 'failed').length;
    
    setSnackbarMessage(
      `Shared with ${successCount} contact${successCount !== 1 ? 's' : ''}${failCount > 0 ? `, ${failCount} failed` : ''}`
    );
    setSnackbarVisible(true);
  };

  const renderResults = () => {
    if (!showResults || shareResults.length === 0) return null;
    
    const successResults = shareResults.filter(r => r.status === 'success');
    const failedResults = shareResults.filter(r => r.status === 'failed');
    
    return (
      <Card style={styles.resultsCard}>
        <Card.Title title="Share Results" />
        <Card.Content>
          {successResults.length > 0 && (
            <View style={styles.resultSection}>
              <Text style={styles.resultSectionTitle}>✅ Successful ({successResults.length})</Text>
              <View style={styles.chipContainer}>
                {successResults.map(result => (
                  <Chip
                    key={result.contactId}
                    mode="flat"
                    style={[styles.resultChip, styles.successChip]}
                  >
                    {result.name}
                  </Chip>
                ))}
              </View>
            </View>
          )}
          
          {failedResults.length > 0 && (
            <View style={styles.resultSection}>
              <Text style={styles.resultSectionTitle}>❌ Failed ({failedResults.length})</Text>
              <View style={styles.chipContainer}>
                {failedResults.map(result => (
                  <Chip
                    key={result.contactId}
                    mode="flat"
                    style={[styles.resultChip, styles.failedChip]}
                  >
                    {result.name}
                  </Chip>
                ))}
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.methodSelector}>
          <Text style={styles.sectionTitle}>Share Method</Text>
          <SegmentedButtons
            value={shareMethod}
            onValueChange={value => setShareMethod(value as 'sms' | 'email' | 'whatsapp')}
            buttons={[
              { value: 'sms', label: 'SMS', icon: 'message-text' },
              { value: 'email', label: 'Email', icon: 'email' },
              { value: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
            ]}
          />
        </Surface>

        <Surface style={styles.messageSection}>
          <Text style={styles.sectionTitle}>Message</Text>
          <TextInput
            mode="outlined"
            label="Custom Message (Optional)"
            placeholder={getDefaultMessage()}
            value={customMessage}
            onChangeText={setCustomMessage}
            multiline
            numberOfLines={6}
            style={styles.messageInput}
          />
          <Text style={styles.helperText}>
            Leave empty to use the default message
          </Text>
        </Surface>

        <Surface style={styles.contactsSection}>
          <Text style={styles.sectionTitle}>Select Contacts</Text>
          <ContactSelector
            onContactsSelected={handleContactsSelected}
            maxSelections={50}
          />
        </Surface>

        {selectedContacts.length > 0 && (
          <Surface style={styles.selectedSection}>
            <Text style={styles.selectedText}>
              {selectedContacts.length} contact{selectedContacts.length !== 1 ? 's' : ''} selected
            </Text>
            <Button
              mode="contained"
              onPress={handleBulkShare}
              loading={isSharing}
              disabled={isSharing}
              icon="share-variant"
              style={styles.shareButton}
            >
              {isSharing ? 'Sharing...' : 'Share Now'}
            </Button>
          </Surface>
        )}

        {isSharing && (
          <Surface style={styles.progressSection}>
            <Text style={styles.progressText}>
              Sharing with contacts... {Math.round(shareProgress * 100)}%
            </Text>
            <ProgressBar progress={shareProgress} style={styles.progressBar} />
          </Surface>
        )}

        {renderResults()}
      </ScrollView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={4000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  methodSelector: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  messageSection: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  messageInput: {
    backgroundColor: 'white',
    minHeight: 120,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  contactsSection: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    minHeight: 400,
  },
  selectedSection: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 16,
    marginBottom: 12,
    color: '#333',
  },
  shareButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
  },
  progressSection: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  resultsCard: {
    marginBottom: 16,
  },
  resultSection: {
    marginBottom: 16,
  },
  resultSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resultChip: {
    marginBottom: 4,
  },
  successChip: {
    backgroundColor: '#E8F5E9',
  },
  failedChip: {
    backgroundColor: '#FFEBEE',
  },
});

export default BulkShareScreen;