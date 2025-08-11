import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  HelperText,
  Switch,
  Text,
  Chip,
  IconButton,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { referralApi } from '../services/referral.api';
import { useAuthStore } from '../stores/authStore';

export const CreateLinkScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customMessage: '',
    trackClicks: true,
    enableQR: true,
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<any>({});

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Links now automatically use instabids.ai and expire in 10 days
      const response = await referralApi.createLink({
        customMessage: formData.customMessage,
        trackClicks: formData.trackClicks,
        enableQR: formData.enableQR,
        tags: formData.tags,
        // URL and expiration are now handled by the backend
      });
      
      navigation.navigate('LinkDetails' as any, { 
        linkId: response.id,
        newLink: true 
      });
    } catch (error) {
      console.error('Error creating link:', error);
      setErrors({ submit: 'Failed to create link. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag),
    });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Create Referral Link for Instabids.ai</Title>
            
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>🔗 Your link will direct to: instabids.ai</Text>
              <Text style={styles.infoText}>⏱️ Auto-expires in: 10 days</Text>
            </View>

            <TextInput
              label="Custom Message (Optional)"
              value={formData.customMessage}
              onChangeText={(text) => setFormData({ ...formData, customMessage: text })}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Add a personal message for recipients..."
              style={styles.input}
            />

            <View style={styles.switchRow}>
              <Text>Track Clicks</Text>
              <Switch
                value={formData.trackClicks}
                onValueChange={(value) => setFormData({ ...formData, trackClicks: value })}
              />
            </View>

            <View style={styles.switchRow}>
              <Text>Generate QR Code</Text>
              <Switch
                value={formData.enableQR}
                onValueChange={(value) => setFormData({ ...formData, enableQR: value })}
              />
            </View>

            <View style={styles.tagSection}>
              <Text>Tags</Text>
              <View style={styles.tagInput}>
                <TextInput
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="Add tag..."
                  mode="outlined"
                  dense
                  style={{ flex: 1 }}
                  onSubmitEditing={addTag}
                />
                <IconButton icon="plus" onPress={addTag} />
              </View>
              <View style={styles.tagList}>
                {formData.tags.map((tag) => (
                  <Chip
                    key={tag}
                    onClose={() => removeTag(tag)}
                    style={styles.tag}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            </View>

            {errors.submit && (
              <HelperText type="error" visible={true}>
                {errors.submit}
              </HelperText>
            )}

            <View style={styles.buttonRow}>
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.button}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.button}
              >
                Create Link
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
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
  input: {
    marginBottom: 8,
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 4,
  },
  row: {
    marginVertical: 16,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tagSection: {
    marginVertical: 16,
  },
  tagInput: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});