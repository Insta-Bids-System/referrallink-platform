import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Text, Button, List, Avatar } from 'react-native-paper';
import { useAuthStore } from '../stores/authStore';

export const ProfileScreen = () => {
  const { user, logout } = useAuthStore();

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Avatar.Text 
              size={80} 
              label={user?.firstName?.[0] || 'U'} 
            />
            <Title style={styles.name}>
              {user?.firstName} {user?.lastName}
            </Title>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <List.Item
            title="Account Settings"
            left={props => <List.Icon {...props} icon="account-cog" />}
            onPress={() => {}}
          />
          <List.Item
            title="Notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            onPress={() => {}}
          />
          <List.Item
            title="Help & Support"
            left={props => <List.Icon {...props} icon="help-circle" />}
            onPress={() => {}}
          />
          <List.Item
            title="About"
            left={props => <List.Icon {...props} icon="information" />}
            onPress={() => {}}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Button 
            mode="contained" 
            onPress={logout}
            style={styles.logoutButton}
          >
            Logout
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
  header: {
    alignItems: 'center',
    padding: 16,
  },
  name: {
    marginTop: 16,
    fontSize: 24,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    marginTop: 8,
  },
});