import { StyleSheet } from 'react-native';
import { lightTheme, darkTheme, Theme } from './theme';

// Theme helper functions
export const getTheme = (isDark: boolean): Theme => {
  return isDark ? darkTheme : lightTheme;
};

// Common style patterns
export const createCardStyle = (theme: Theme) => ({
  backgroundColor: theme.colors.card,
  borderRadius: theme.borderRadius.lg,
  padding: theme.spacing.md,
  ...theme.shadows.card,
});

export const createGlassStyle = (theme: Theme) => ({
  backgroundColor: theme.colors.glass,
  borderRadius: theme.borderRadius.lg,
  borderWidth: 1,
  borderColor: theme.colors.border,
  padding: theme.spacing.md,
});

export const createButtonStyle = (theme: Theme, variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
  const baseStyle = {
    height: theme.dimensions.buttonHeight,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: theme.spacing.lg,
    ...theme.typography.button,
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        backgroundColor: theme.colors.primary,
      };
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
      };
    case 'outline':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.colors.primary,
      };
    default:
      return baseStyle;
  }
};

export const createInputStyle = (theme: Theme) => ({
  height: theme.dimensions.inputHeight,
  backgroundColor: theme.colors.surface,
  borderRadius: theme.borderRadius.md,
  borderWidth: 1,
  borderColor: theme.colors.border,
  paddingHorizontal: theme.spacing.md,
  ...theme.typography.body1,
  color: theme.colors.text,
});

// Gradient helper
export const getGradientColors = (theme: Theme, type: 'primary' | 'secondary' | 'accent' = 'primary') => {
  const gradients = {
    primary: [theme.colors.primary, theme.colors.accent],
    secondary: [theme.colors.secondary, theme.colors.textSecondary],
    accent: [theme.colors.accent, theme.colors.tertiary],
  };
  return gradients[type];
};

// Animation helpers
export const getAnimationConfig = (theme: Theme, type: 'fast' | 'normal' | 'slow' = 'normal') => {
  return {
    duration: theme.animation.duration[type],
    easing: theme.animation.easing.easeInOut,
  };
};

// Responsive helpers
export const getResponsiveValue = (theme: Theme, mobile: number, tablet: number) => {
  const { width } = theme.dimensions;
  return width > 768 ? tablet : mobile;
};

// Spacing helpers
export const createSpacingStyle = (theme: Theme, direction: 'vertical' | 'horizontal' | 'all' = 'all', size: keyof Theme['spacing'] = 'md') => {
  const spacingValue = theme.spacing[size];
  
  switch (direction) {
    case 'vertical':
      return {
        paddingVertical: spacingValue,
      };
    case 'horizontal':
      return {
        paddingHorizontal: spacingValue,
      };
    case 'all':
      return {
        padding: spacingValue,
      };
    default:
      return {};
  }
};

// Text style helpers
export const createTextStyle = (theme: Theme, variant: keyof Theme['typography']) => {
  return {
    ...theme.typography[variant],
    color: theme.colors.text,
  };
};

export const createHeadingStyle = (theme: Theme, level: 1 | 2 | 3 | 4 | 5) => {
  const headingKey = `h${level}` as keyof Theme['typography'];
  return createTextStyle(theme, headingKey);
};

// Shadow helpers
export const createShadowStyle = (theme: Theme, size: keyof Theme['shadows'] = 'medium') => {
  return theme.shadows[size];
};

// Border radius helpers
export const createBorderRadiusStyle = (theme: Theme, size: keyof Theme['borderRadius'] = 'md') => {
  return {
    borderRadius: theme.borderRadius[size],
  };
};

// Color helpers
export const getContrastColor = (backgroundColor: string): string => {
  // Simple contrast calculation - in a real app, you might want a more sophisticated approach
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

// StyleSheet factory for theme-aware styles
export const createThemedStyleSheet = (theme: Theme, styles: any) => {
  return StyleSheet.create(styles);
};

// Common component styles
export const commonStyles = {
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  flex1: {
    flex: 1,
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
}; 