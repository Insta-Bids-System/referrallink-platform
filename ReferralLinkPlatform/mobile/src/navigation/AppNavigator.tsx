import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../stores/authStore';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { LinksScreen } from '../screens/LinksScreen';
import { CreateLinkScreen } from '../screens/CreateLinkScreen';
import { LinkDetailsScreen } from '../screens/LinkDetailsScreen';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MaterialIcons } from '@expo/vector-icons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Login" 
      component={LoginScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName = 'home';
        
        if (route.name === 'Dashboard') {
          iconName = 'dashboard';
        } else if (route.name === 'Links') {
          iconName = 'link';
        } else if (route.name === 'Analytics') {
          iconName = 'analytics';
        } else if (route.name === 'Profile') {
          iconName = 'person';
        }
        
        return <MaterialIcons name={iconName as any} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Links" component={LinksScreen} />
    <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Main" 
      component={MainTabs} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="CreateLink" 
      component={CreateLinkScreen}
      options={{ title: 'Create Referral Link' }}
    />
    <Stack.Screen 
      name="LinkDetails" 
      component={LinkDetailsScreen}
      options={{ title: 'Link Details' }}
    />
    <Stack.Screen 
      name="MyLinks" 
      component={LinksScreen}
      options={{ title: 'My Links' }}
    />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  const { isAuthenticated } = useAuthStore();
  
  return isAuthenticated ? <MainStack /> : <AuthStack />;
};