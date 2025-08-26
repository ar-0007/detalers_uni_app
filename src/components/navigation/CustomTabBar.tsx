import React, { useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ThemedText from '../common/ThemedText';

const { width } = Dimensions.get('window');

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<TabBarProps> = ({ state, descriptors, navigation }) => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  
  // Animation values for each tab
  const tabAnimations = state.routes.map(() => ({
    scale: useRef(new Animated.Value(1)).current,
    opacity: useRef(new Animated.Value(0.6)).current,
    translateY: useRef(new Animated.Value(0)).current,
  }));

  // Background animation
  const backgroundScale = useRef(new Animated.Value(0)).current;
  const backgroundOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate background on mount
    Animated.parallel([
      Animated.spring(backgroundScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate active tab
    const activeIndex = state.index;
    tabAnimations.forEach((anim, index) => {
      if (index === activeIndex) {
        Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 1.1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(anim.translateY, {
            toValue: -8,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        Animated.parallel([
          Animated.spring(anim.scale, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(anim.opacity, {
            toValue: 0.6,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(anim.translateY, {
            toValue: 0,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });
  }, [state.index]);

  const tabConfig = [
    { name: 'Dashboard', icon: 'home', label: 'Home' },
    { name: 'Courses', icon: 'school', label: 'Courses' },
    { name: 'Mentorship', icon: 'group', label: 'Mentor' },
    { name: 'Calendar', icon: 'graphic-eq', label: 'Podcast' },
    { name: 'Profile', icon: 'person', label: 'Profile' },
  ];

  const handleTabPress = (route: any, index: number) => {
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(route.name);
      
      // Enhanced animation sequence for pressed tab
      Animated.sequence([
        // Quick scale down
        Animated.timing(tabAnimations[index].scale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        // Scale up with bounce
        Animated.spring(tabAnimations[index].scale, {
          toValue: 1.1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        // Return to normal
        Animated.timing(tabAnimations[index].scale, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const renderTab = (route: any, index: number) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === index;
    const tabConfigItem = tabConfig.find(tab => tab.name === route.name);
    const anim = tabAnimations[index];

    return (
      <TouchableOpacity
        key={route.key}
        style={styles.tabButton}
        onPress={() => handleTabPress(route, index)}
        activeOpacity={0.9}
      >
        <Animated.View
          style={[
            styles.tabContent,
            {
              transform: [
                { scale: anim.scale },
                { translateY: anim.translateY },
              ],
              opacity: anim.opacity,
            },
          ]}
        >
          {isFocused ? (
            <View style={styles.activeTabContainer}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.accent]}
                style={styles.activeIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name={tabConfigItem?.icon} size={24} color={theme.colors.textInverse} />
              </LinearGradient>
              <ThemedText
                variant="caption"
                color="primary"
                weight="bold"
                align="center"
                style={styles.activeLabel}
              >
                {tabConfigItem?.label}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.inactiveTabContainer}>
              <View style={[styles.inactiveIconContainer, { backgroundColor: theme.colors.glass }]}>
                <Icon name={tabConfigItem?.icon} size={24} color={theme.colors.textSecondary} />
              </View>
              <ThemedText
                variant="caption"
                color="secondary"
                align="center"
                style={styles.inactiveLabel}
              >
                {tabConfigItem?.label}
              </ThemedText>
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Floating Background */}
      <Animated.View
        style={[
          styles.floatingBackground,
          {
            backgroundColor: theme.colors.surface,
            transform: [{ scale: backgroundScale }],
            opacity: backgroundOpacity,
          },
        ]}
      />
      
      {/* Tab Bar Content */}
      <View style={styles.tabBarContainer}>
        {state.routes.map(renderTab)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'transparent',
  },
  floatingBackground: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 80,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  tabBarContainer: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    paddingBottom: 32,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  activeTabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveTabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  inactiveIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  inactiveLabel: {
    fontSize: 11,
    marginTop: 2,
  },
});

export default CustomTabBar;