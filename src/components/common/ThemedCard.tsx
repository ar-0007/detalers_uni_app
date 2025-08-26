import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { createCardStyle, createShadowStyle } from '../../utils/themeHelpers';

interface ThemedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'glass' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'small' | 'medium' | 'large' | 'extra';
}

const ThemedCard: React.FC<ThemedCardProps> = ({
  children,
  style,
  variant = 'default',
  padding = 'medium',
  borderRadius = 'large',
}) => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  const getCardStyle = () => {
    const baseStyle = createCardStyle(theme);
    
    // Adjust padding based on prop
    const paddingMap = {
      none: 0,
      small: theme.spacing.sm,
      medium: theme.spacing.md,
      large: theme.spacing.lg,
    };
    
    // Adjust border radius based on prop
    const borderRadiusMap = {
      small: theme.borderRadius.sm,
      medium: theme.borderRadius.md,
      large: theme.borderRadius.lg,
      extra: theme.borderRadius.xl,
    };

    switch (variant) {
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.glass,
          borderWidth: 1,
          borderColor: theme.colors.border,
          padding: paddingMap[padding],
          borderRadius: borderRadiusMap[borderRadius],
        };
      case 'elevated':
        return {
          ...baseStyle,
          ...createShadowStyle(theme, 'large'),
          padding: paddingMap[padding],
          borderRadius: borderRadiusMap[borderRadius],
        };
      default:
        return {
          ...baseStyle,
          padding: paddingMap[padding],
          borderRadius: borderRadiusMap[borderRadius],
        };
    }
  };

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
};

export default ThemedCard; 