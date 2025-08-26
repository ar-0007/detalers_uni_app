/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { Provider } from 'react-redux';
import { StripeProvider } from '@stripe/stripe-react-native';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import ThemeProvider from './src/contexts/ThemeContext';
import { STRIPE_CONFIG } from './src/config/stripe';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <StripeProvider publishableKey={STRIPE_CONFIG.publishableKey}>
        <ThemeProvider>
          <StatusBar 
            barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
            backgroundColor={isDarkMode ? '#121212' : '#FFFFFF'}
          />
          <AppNavigator />
        </ThemeProvider>
      </StripeProvider>
    </Provider>
  );
}

export default App;
