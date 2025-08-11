import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac6',
    tertiary: '#f1c40f',
    error: '#f44336',
    background: '#f5f5f5',
    surface: '#ffffff',
    onSurface: '#333333',
    surfaceVariant: '#e8e8e8',
  },
  roundness: 8,
};