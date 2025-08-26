import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { createButtonStyle, createTextStyle } from '../../utils/themeHelpers';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const ThemedButton: React.FC<ThemedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  const getButtonStyle = (): ViewStyle => {
    const baseStyle = createButtonStyle(theme, variant);
    
    // Size adjustments
    const sizeMap = {
      small: {
        height: theme.dimensions.buttonHeight - 8,
        paddingHorizontal: theme.spacing.md,
      },
      medium: {
        height: theme.dimensions.buttonHeight,
        paddingHorizontal: theme.spacing.lg,
      },
      large: {
        height: theme.dimensions.buttonHeight + 8,
        paddingHorizontal: theme.spacing.xl,
      },
    };

    const buttonStyle = {
      ...baseStyle,
      ...sizeMap[size],
      opacity: disabled ? 0.6 : 1,
    };

    // Variant-specific styles
    switch (variant) {
      case 'ghost':
        return {
          ...buttonStyle,
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      case 'outline':
        return {
          ...buttonStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: theme.colors.primary,
        };
      default:
        return buttonStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle = createTextStyle(theme, 'button');
    
    let textColor = theme.colors.textInverse;
    
    switch (variant) {
      case 'secondary':
      case 'outline':
      case 'ghost':
        textColor = theme.colors.primary;
        break;
      default:
        textColor = theme.colors.textInverse;
    }

    return {
      ...baseTextStyle,
      color: textColor,
      textAlign: 'center',
    };
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? theme.colors.textInverse : theme.colors.primary}
        />
      );
    }

    return (
      <>
        {icon && iconPosition === 'left' && icon}
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        {icon && iconPosition === 'right' && icon}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

export default ThemedButton; 