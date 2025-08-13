import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  Checkbox,
  List,
  Divider,
  Avatar,
  Button,
  Chip,
  Surface,
} from 'react-native-paper';
import * as Contacts from 'expo-contacts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Contact {
  id: string;
  name: string;
  phoneNumbers?: Array<{ number?: string; label?: string }>;
  emails?: Array<{ email?: string; label?: string }>;
  image?: { uri: string };
}

interface ContactSelectorProps {
  onContactsSelected: (contacts: Contact[]) => void;
  maxSelections?: number;
}

export const ContactSelector: React.FC<ContactSelectorProps> = ({
  onContactsSelected,
  maxSelections,
}) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    requestContactsPermission();
  }, []);

  useEffect(() => {
    filterContacts();
  }, [searchQuery, contacts]);

  const requestContactsPermission = async () => {
    setLoading(true);
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status === 'granted') {
        loadContacts();
      } else {
        Alert.alert(
          'Permission Required',
          'Please grant contacts permission to share referral links with friends.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Contacts.requestPermissionsAsync() },
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting contacts permission:', error);
      Alert.alert('Error', 'Failed to request contacts permission');
    } finally {
      setLoading(false);
    }
  };

  const loadContacts = async () => {
    setLoading(true);
    try {
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.Name,
          Contacts.Fields.PhoneNumbers,
          Contacts.Fields.Emails,
          Contacts.Fields.Image,
        ],
        sort: Contacts.SortTypes.FirstName,
      });

      const formattedContacts = data
        .filter(contact => contact.name && (contact.phoneNumbers?.length || contact.emails?.length))
        .map(contact => ({
          id: contact.id || Math.random().toString(),
          name: contact.name || 'Unknown',
          phoneNumbers: contact.phoneNumbers,
          emails: contact.emails,
          image: contact.imageAvailable ? contact.image : undefined,
        }));

      setContacts(formattedContacts);
      setFilteredContacts(formattedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const filterContacts = () => {
    if (!searchQuery.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = contacts.filter(contact => {
      const nameMatch = contact.name.toLowerCase().includes(query);
      const phoneMatch = contact.phoneNumbers?.some(phone =>
        phone.number?.includes(query)
      );
      const emailMatch = contact.emails?.some(email =>
        email.email?.toLowerCase().includes(query)
      );
      return nameMatch || phoneMatch || emailMatch;
    });

    setFilteredContacts(filtered);
  };

  const toggleContactSelection = (contactId: string) => {
    const newSelection = new Set(selectedContacts);
    
    if (newSelection.has(contactId)) {
      newSelection.delete(contactId);
    } else {
      if (maxSelections && newSelection.size >= maxSelections) {
        Alert.alert(
          'Selection Limit',
          `You can only select up to ${maxSelections} contacts at a time.`
        );
        return;
      }
      newSelection.add(contactId);
    }
    
    setSelectedContacts(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      const allIds = filteredContacts
        .slice(0, maxSelections || filteredContacts.length)
        .map(c => c.id);
      setSelectedContacts(new Set(allIds));
    }
  };

  const handleConfirmSelection = () => {
    const selected = contacts.filter(contact => selectedContacts.has(contact.id));
    onContactsSelected(selected);
  };

  const getContactInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return parts[0][0] + parts[parts.length - 1][0];
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getContactInfo = (contact: Contact) => {
    const phone = contact.phoneNumbers?.[0]?.number;
    const email = contact.emails?.[0]?.email;
    return phone || email || 'No contact info';
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      onPress={() => toggleContactSelection(item.id)}
      activeOpacity={0.7}
    >
      <List.Item
        title={item.name}
        description={getContactInfo(item)}
        left={() => (
          <View style={styles.contactLeft}>
            <Checkbox
              status={selectedContacts.has(item.id) ? 'checked' : 'unchecked'}
              onPress={() => toggleContactSelection(item.id)}
            />
            {item.image ? (
              <Avatar.Image size={40} source={{ uri: item.image.uri }} />
            ) : (
              <Avatar.Text size={40} label={getContactInitials(item.name)} />
            )}
          </View>
        )}
        right={() => (
          <View style={styles.contactRight}>
            {item.phoneNumbers?.length ? (
              <Icon name="phone" size={20} color="#666" />
            ) : null}
            {item.emails?.length ? (
              <Icon name="email" size={20} color="#666" style={{ marginLeft: 8 }} />
            ) : null}
          </View>
        )}
      />
      <Divider />
    </TouchableOpacity>
  );

  if (!hasPermission && !loading) {
    return (
      <View style={styles.permissionContainer}>
        <Icon name="contacts" size={64} color="#666" />
        <Text style={styles.permissionText}>
          Contact permission is required to share referral links
        </Text>
        <Button mode="contained" onPress={requestContactsPermission}>
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        
        <View style={styles.headerActions}>
          <Button
            mode="text"
            onPress={handleSelectAll}
            disabled={filteredContacts.length === 0}
          >
            {selectedContacts.size === filteredContacts.length ? 'Deselect All' : 'Select All'}
          </Button>
          
          {selectedContacts.size > 0 && (
            <Chip mode="flat" style={styles.selectionChip}>
              {selectedContacts.size} selected
            </Chip>
          )}
        </View>
      </Surface>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading contacts...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={filteredContacts}
            renderItem={renderContact}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="account-off" size={48} color="#999" />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No contacts found' : 'No contacts available'}
                </Text>
              </View>
            }
          />

          {selectedContacts.size > 0 && (
            <Surface style={styles.footer}>
              <Button
                mode="contained"
                onPress={handleConfirmSelection}
                icon="share-variant"
                style={styles.confirmButton}
              >
                Share with {selectedContacts.size} Contact{selectedContacts.size !== 1 ? 's' : ''}
              </Button>
            </Surface>
          )}
        </>
      )}
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
    backgroundColor: 'white',
    elevation: 2,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionChip: {
    backgroundColor: '#2196F3',
  },
  listContainer: {
    flexGrow: 1,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 8,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    elevation: 4,
  },
  confirmButton: {
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 24,
  },
});

export default ContactSelector;