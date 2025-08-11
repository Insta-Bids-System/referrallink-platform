import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  TextInput,
  Chip,
  ActivityIndicator,
  RadioButton,
  IconButton,
  Snackbar,
  FAB,
  Portal,
  Modal,
  List,
  Divider,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';

interface GeneratedMessage {
  id: string;
  content: string;
  platform: string;
  score: number;
  reasoning?: string;
}

interface WritingStyle {
  tone: string;
  emojiUsage: string;
  personality: string;
}

export const AIMessageScreen = () => {
  const navigation = useNavigation();
  const { user, token } = useAuthStore();
  
  // State
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [messages, setMessages] = useState<GeneratedMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<string>('');
  const [writingStyle, setWritingStyle] = useState<WritingStyle | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form inputs
  const [platform, setPlatform] = useState('sms');
  const [recipientName, setRecipientName] = useState('');
  const [customContext, setCustomContext] = useState('');
  const [samplePosts, setSamplePosts] = useState('');
  
  const platforms = [
    { label: 'SMS', value: 'sms', icon: 'message-text' },
    { label: 'Email', value: 'email', icon: 'email' },
    { label: 'WhatsApp', value: 'whatsapp', icon: 'whatsapp' },
    { label: 'Facebook', value: 'facebook', icon: 'facebook' },
    { label: 'Twitter', value: 'twitter', icon: 'twitter' },
    { label: 'LinkedIn', value: 'linkedin', icon: 'linkedin' },
  ];

  // Load writing style on mount
  useEffect(() => {
    loadWritingStyle();
  }, []);

  const loadWritingStyle = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/ai/writing-style', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setWritingStyle(data.style);
      }
    } catch (error) {
      console.log('No writing style found yet');
    }
  };

  const analyzeWritingStyle = async () => {
    if (!samplePosts.trim()) {
      showSnackbar('Please provide some sample text to analyze');
      return;
    }

    setAnalyzing(true);
    try {
      // Split sample posts by new lines and create post objects
      const posts = samplePosts.split('\n').filter(p => p.trim()).map(content => ({
        content,
        platform: 'facebook', // Default platform
      }));

      const response = await fetch('http://localhost:5000/api/ai/analyze-style', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ posts }),
      });

      if (response.ok) {
        const data = await response.json();
        setWritingStyle(data.style);
        showSnackbar('Writing style analyzed successfully!');
        setSamplePosts(''); // Clear the input
      } else {
        showSnackbar('Failed to analyze writing style');
      }
    } catch (error) {
      console.error('Error analyzing style:', error);
      showSnackbar('Error analyzing writing style');
    } finally {
      setAnalyzing(false);
    }
  };

  const generateMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/ai/generate-messages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          recipientName,
          customContext,
          count: 5,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        if (data.messages.length > 0) {
          setSelectedMessage(data.messages[0].id);
        }
      } else {
        showSnackbar('Failed to generate messages');
      }
    } catch (error) {
      console.error('Error generating messages:', error);
      showSnackbar('Error generating messages');
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (content: string) => {
    Clipboard.setString(content);
    showSnackbar('Message copied to clipboard!');
  };

  const shareMessage = async (content: string) => {
    try {
      await Share.share({
        message: content,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const saveSelection = async (message: GeneratedMessage, selected: boolean) => {
    try {
      await fetch('http://localhost:5000/api/ai/save-selection', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: message.id,
          message,
          selected,
        }),
      });
    } catch (error) {
      console.error('Error saving selection:', error);
    }
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const selectedMessageContent = messages.find(m => m.id === selectedMessage);

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Writing Style Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerRow}>
              <Title>Your Writing Style</Title>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => setModalVisible(true)}
              />
            </View>
            
            {writingStyle ? (
              <View>
                <Text>Tone: {writingStyle.tone}</Text>
                <Text>Emoji Usage: {writingStyle.emojiUsage}</Text>
                <Text style={styles.personality}>{writingStyle.personality}</Text>
              </View>
            ) : (
              <View>
                <Text style={styles.noStyle}>No writing style analyzed yet</Text>
                <Button 
                  mode="outlined" 
                  onPress={() => setModalVisible(true)}
                  style={styles.analyzeButton}
                >
                  Analyze Your Style
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Message Generation Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Generate AI Messages</Title>
            
            {/* Platform Selection */}
            <Text style={styles.label}>Select Platform:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.platformRow}>
                {platforms.map(p => (
                  <Chip
                    key={p.value}
                    selected={platform === p.value}
                    onPress={() => setPlatform(p.value)}
                    style={styles.platformChip}
                    icon={p.icon}
                  >
                    {p.label}
                  </Chip>
                ))}
              </View>
            </ScrollView>

            {/* Optional Fields */}
            <TextInput
              label="Recipient Name (Optional)"
              value={recipientName}
              onChangeText={setRecipientName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Additional Context (Optional)"
              value={customContext}
              onChangeText={setCustomContext}
              mode="outlined"
              multiline
              numberOfLines={2}
              placeholder="e.g., 'They love online shopping and deals'"
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={generateMessages}
              loading={loading}
              disabled={loading}
              style={styles.generateButton}
              icon="creation"
            >
              Generate Messages
            </Button>
          </Card.Content>
        </Card>

        {/* Generated Messages */}
        {messages.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Select Your Message</Title>
              
              {messages.map((message) => (
                <View key={message.id}>
                  <List.Item
                    title={() => (
                      <Text style={styles.messageText}>{message.content}</Text>
                    )}
                    description={() => (
                      <View style={styles.messageFooter}>
                        <Chip compact style={styles.scoreChip}>
                          Score: {message.score}%
                        </Chip>
                        {message.reasoning && (
                          <Text style={styles.reasoning}>{message.reasoning}</Text>
                        )}
                      </View>
                    )}
                    left={() => (
                      <RadioButton
                        value={message.id}
                        status={selectedMessage === message.id ? 'checked' : 'unchecked'}
                        onPress={() => {
                          setSelectedMessage(message.id);
                          saveSelection(message, true);
                        }}
                      />
                    )}
                    style={[
                      styles.messageItem,
                      selectedMessage === message.id && styles.selectedMessage
                    ]}
                  />
                  <Divider />
                </View>
              ))}

              {/* Action Buttons */}
              {selectedMessageContent && (
                <View style={styles.actionRow}>
                  <Button
                    mode="outlined"
                    onPress={() => copyMessage(selectedMessageContent.content)}
                    icon="content-copy"
                    style={styles.actionButton}
                  >
                    Copy
                  </Button>
                  <Button
                    mode="contained"
                    onPress={() => shareMessage(selectedMessageContent.content)}
                    icon="share"
                    style={styles.actionButton}
                  >
                    Share
                  </Button>
                </View>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Writing Style Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <Title>Analyze Your Writing Style</Title>
          <Text style={styles.modalText}>
            Paste some of your social media posts or messages below (one per line):
          </Text>
          
          <TextInput
            label="Sample Posts"
            value={samplePosts}
            onChangeText={setSamplePosts}
            mode="outlined"
            multiline
            numberOfLines={6}
            placeholder="Just launched my new project! So excited to share this with everyone 🚀

Been working on something amazing lately. Can't wait to reveal it!

Check out this incredible platform I discovered..."
            style={styles.modalInput}
          />

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setModalVisible(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={() => {
                analyzeWritingStyle();
                setModalVisible(false);
              }}
              loading={analyzing}
              disabled={analyzing || !samplePosts.trim()}
              style={styles.modalButton}
            >
              Analyze
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  personality: {
    fontStyle: 'italic',
    marginTop: 8,
    color: '#666',
  },
  noStyle: {
    color: '#999',
    marginVertical: 8,
  },
  analyzeButton: {
    marginTop: 8,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  platformRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  platformChip: {
    marginRight: 8,
  },
  input: {
    marginTop: 12,
  },
  generateButton: {
    marginTop: 16,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageFooter: {
    marginTop: 8,
  },
  scoreChip: {
    marginTop: 4,
  },
  reasoning: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  messageItem: {
    paddingVertical: 8,
  },
  selectedMessage: {
    backgroundColor: '#e3f2fd',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalText: {
    marginVertical: 12,
    color: '#666',
  },
  modalInput: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    marginLeft: 8,
  },
});