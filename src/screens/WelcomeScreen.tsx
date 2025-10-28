import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import ThemedText, { Heading1 } from '../components/common/ThemedText';
import ThemedButton from '../components/common/ThemedButton';
import ThemedCard from '../components/common/ThemedCard';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted }) => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.5)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered animation sequence
    Animated.sequence([
      // Logo animation
      Animated.parallel([
        Animated.spring(logoScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      // Content animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const logoRotation = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={theme.colors.primary}
        translucent
      />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.accent]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Floating Background Elements */}
      <View style={styles.floatingElements}>
        <Animated.View
          style={[
            styles.floatingCircle,
            {
              backgroundColor: theme.colors.glass,
              transform: [{ scale: scaleAnim }],
              top: '20%',
              left: '10%',
            },
          ]}
        />
        <Animated.View
          style={[
            styles.floatingCircle,
            {
              backgroundColor: theme.colors.glass,
              transform: [{ scale: scaleAnim }],
              top: '60%',
              right: '15%',
            },
          ]}
        />
        <Animated.View
          style={[
            styles.floatingCircle,
            {
              backgroundColor: theme.colors.glass,
              transform: [{ scale: scaleAnim }],
              bottom: '20%',
              left: '20%',
            },
          ]}
        />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { scale: logoScaleAnim },
                { rotate: logoRotation },
              ],
            },
          ]}
        >
          <ThemedCard variant="glass" style={styles.logoCard}>
            <Icon name="school" size={60} color={theme.colors.primary} />
          </ThemedCard>
        </Animated.View>

        {/* Text Content */}
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <ThemedText 
            variant="h1" 
            color="inverse" 
            align="center"
            style={styles.title}
          >
            Details University
          </ThemedText>
          
          <ThemedText
            variant="h4"
            color="inverse"
            align="center"
            style={styles.subtitle}
          >
            Master the Art of Car Detailing
          </ThemedText>
          
          <ThemedText
            variant="body1"
            color="inverse"
            align="center"
            style={styles.description}
          >
            Learn professional car detailing techniques from industry experts. 
            Start your journey to becoming a master detailer.
          </ThemedText>
        </Animated.View>

        {/* Features */}
        <Animated.View
          style={[
            styles.featuresContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <View style={styles.featureRow}>
            <View style={styles.featureItem}>
              <Icon name="auto-awesome" size={24} color={theme.colors.textInverse} />
              <ThemedText variant="caption" color="inverse" align="center">
                Expert Courses
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <Icon name="person" size={24} color={theme.colors.textInverse} />
              <ThemedText variant="caption" color="inverse" align="center">
                Mentorship
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <Icon name="calendar-today" size={24} color={theme.colors.textInverse} />
              <ThemedText variant="caption" color="inverse" align="center">
                Calendar
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        {/* Get Started Button */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideUpAnim }],
            },
          ]}
        >
          <ThemedButton
            title="Get Started"
            onPress={onGetStarted}
            variant="outline"
            size="large"
            style={styles.getStartedButton}
            textStyle={styles.buttonText}
            icon={<Icon name="arrow-forward" size={20} color={theme.colors.textInverse} />}
            iconPosition="right"
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  floatingCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    marginBottom: 48,
  },
  logoCard: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    marginBottom: 16,
    opacity: 0.9,
  },
  description: {
    opacity: 0.8,
    lineHeight: 24,
    maxWidth: 280,
  },
  featuresContainer: {
    marginBottom: 48,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 300,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 280,
  },
  getStartedButton: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default WelcomeScreen;