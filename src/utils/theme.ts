import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Enhanced Brand Colors - Modern Orange/Black Palette
export const brandColors = {
  primary: '#FF6B35', // Vibrant Orange
  secondary: '#1A1A1A', // Deep Black
  accent: '#FF8C42', // Light Orange
  tertiary: '#FFA500', // Golden Orange
  quaternary: '#FFB84D', // Soft Orange
  
  // Gradient variations
  gradient: {
    primary: ['#FF6B35', '#FF8C42'],
    secondary: ['#1A1A1A', '#2D2D2D'],
    accent: ['#FF8C42', '#FFA500'],
    glass: ['rgba(255, 107, 53, 0.1)', 'rgba(255, 140, 66, 0.1)'],
  },
  
  // Status colors
  success: '#00D4AA', // Modern Green
  warning: '#FFB84D', // Modern Yellow
  error: '#FF6B6B', // Modern Red
  info: '#4ECDC4', // Modern Cyan
  
  // Additional colors for variety
  purple: '#A78BFA', // Modern Purple
  pink: '#FF6B9D', // Modern Pink
  blue: '#6FB3E3', // Modern Blue
  teal: '#B1C4D3', // Modern Teal
};

// Enhanced Light Theme - Modern Design
export const lightTheme = {
  colors: {
    // Primary brand colors
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    accent: brandColors.accent,
    tertiary: brandColors.tertiary,
    quaternary: brandColors.quaternary,
    
    // Background colors
    background: '#FAFAFA',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardBackground: '#FFFFFF',
    glass: 'rgba(255, 255, 255, 0.9)',
    glassDark: 'rgba(255, 255, 255, 0.7)',
    
    // Text colors
    text: '#1A1A1A',
    textSecondary: '#666666',
    textTertiary: '#999999',
    textInverse: '#FFFFFF',
    
    // Border and divider colors
    border: '#F0F0F0',
    divider: '#E8E8E8',
    borderLight: '#F5F5F5',
    
    // Status colors
    success: brandColors.success,
    warning: brandColors.warning,
    error: brandColors.error,
    info: brandColors.info,
    
    // Additional colors
    purple: brandColors.purple,
    pink: brandColors.pink,
    blue: brandColors.blue,
    teal: brandColors.teal,
    
    // Overlay and shadow
    overlay: 'rgba(0, 0, 0, 0.3)',
    shadow: 'rgba(0, 0, 0, 0.08)',
    shadowStrong: 'rgba(0, 0, 0, 0.15)',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  
  borderRadius: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    round: 50,
    pill: 999,
  },
  
  typography: {
    // Headings
    h1: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: 'bold' as const,
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 26,
    },
    body1: {
      fontSize: 16,
      fontWeight: 'normal' as const,
      lineHeight: 24,
    },
    body2: {
      fontSize: 14,
      fontWeight: 'normal' as const,
      lineHeight: 20,
    },
    body3: {
      fontSize: 12,
      fontWeight: 'normal' as const,
      lineHeight: 16,
    },
    
    // Special text
    caption: {
      fontSize: 12,
      fontWeight: 'normal' as const,
      lineHeight: 16,
    },
    overline: {
      fontSize: 10,
      fontWeight: '500' as const,
      lineHeight: 14,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    
    // Button text
    button: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
    },
    buttonLarge: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
  },
  
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    extraLarge: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
    // Special shadows for cards
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    cardHover: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 6,
    },
  },
  
  // Animation configurations
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
  
  dimensions: {
    width,
    height,
    // Common component sizes
    tabBarHeight: 90,
    headerHeight: 60,
    buttonHeight: 48,
    inputHeight: 48,
    cardPadding: 16,
  },
};

// Enhanced Dark Theme - Modern Design
export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    // Background colors
    background: '#0A0A0A',
    surface: '#1A1A1A',
    card: '#2A2A2A',
    cardBackground: '#2A2A2A',
    glass: 'rgba(42, 42, 42, 0.9)',
    glassDark: 'rgba(42, 42, 42, 0.7)',
    
    // Text colors
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',
    textInverse: '#1A1A1A',
    
    // Border and divider colors
    border: '#3A3A3A',
    divider: '#2A2A2A',
    borderLight: '#2A2A2A',
    
    // Overlay and shadow
    overlay: 'rgba(0, 0, 0, 0.7)',
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowStrong: 'rgba(0, 0, 0, 0.5)',
  },
  shadows: {
    ...lightTheme.shadows,
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 3,
    },
    cardHover: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 6,
    },
  },
};

export type Theme = typeof lightTheme;
export type ThemeColors = typeof lightTheme.colors;
export type ThemeTypography = typeof lightTheme.typography;
export type ThemeShadows = typeof lightTheme.shadows;