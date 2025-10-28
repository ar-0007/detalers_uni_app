import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { checkAuthStatus } from '../store/actions/authActions';
import { MainTabParamList } from './types';

// Screens
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';

// Main App Screens (to be created)
import DashboardScreen from '../screens/main/DashboardScreen';
import CoursesScreen from '../screens/main/CoursesScreen';
import MentorshipScreen from '../screens/main/MentorshipScreen';
import CalendarScreen from '../screens/main/CalendarScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import CheckoutScreen from '../screens/main/CheckoutScreen';
import MentorshipCheckoutScreen from '../screens/main/MentorshipCheckoutScreen';
import CoursePlayerScreen from '../screens/main/CoursePlayerScreen';

// Navigation Types
export type { RootStackParamList, MainTabParamList } from './types';

import { RootStackParamList } from './types';
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);

  // Check authentication status on app startup
  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  const handleSplashComplete = () => {
    setIsLoading(false);
    setShowWelcome(true);
  };

  const handleGetStarted = () => {
    setShowWelcome(false);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {isLoading ? (
          <Stack.Screen 
            name="Splash" 
            component={() => <SplashScreen onAnimationComplete={handleSplashComplete} />} 
          />
        ) : showWelcome ? (
          <Stack.Screen 
            name="Welcome" 
            component={() => <WelcomeScreen onGetStarted={handleGetStarted} />} 
          />
        ) : !isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen 
              name="Checkout" 
              component={CheckoutScreen}
              options={{
                presentation: 'modal',
                headerShown: true,
                headerTitle: 'Checkout',
                headerBackTitle: 'Back'
              }}
            />
            <Stack.Screen 
              name="MentorshipCheckout" 
              component={MentorshipCheckoutScreen}
              options={{
                presentation: 'modal',
                headerShown: false,
                headerBackTitle: 'Back'
              }}
            />
            <Stack.Screen 
              name="CoursePlayer" 
              component={CoursePlayerScreen}
              options={{
                headerShown: false,
                animation: 'slide_from_right'
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Main Tab Navigator
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from '../components/navigation/CustomTabBar';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
      />
      <Tab.Screen 
        name="Courses" 
        component={CoursesScreen}
      />
      <Tab.Screen 
        name="Mentorship" 
        component={MentorshipScreen}
      />
      <Tab.Screen 
        name="Calendar"
        component={CalendarScreen}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;