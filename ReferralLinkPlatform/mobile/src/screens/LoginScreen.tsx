import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Card,
  TextInput,
  Button,
  Title,
  Text,
  HelperText,
} from 'react-native-paper';
import { useAuthStore } from '../stores/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LoginScreen = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // Debug function to clear stored token
  const clearStoredToken = async () => {
    try {
      await AsyncStorage.removeItem('accessToken');
      console.log('Token cleared from AsyncStorage');
      setError('Token cleared - please login again');
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>ReferralLink</Title>
            <Text style={styles.subtitle}>Sign in to continue</Text>
            
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />
            
            <HelperText type="error" visible={!!error}>
              {error}
            </HelperText>
            
            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Sign In
            </Button>
            
            <Button
              mode="text"
              onPress={() => console.log('Forgot password')}
              style={styles.textButton}
            >
              Forgot Password?
            </Button>
            
            {/* Debug button to clear token */}
            <Button 
              mode="text" 
              onPress={clearStoredToken}
              style={styles.textButton}
            >
              Clear Token (Debug)
            </Button>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 28,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 16,
    marginBottom: 8,
  },
  textButton: {
    marginTop: 8,
  },
});