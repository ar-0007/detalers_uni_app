import React from 'react';
import { Text, TextStyle, TextProps } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { createTextStyle } from '../../utils/themeHelpers';

interface ThemedTextProps extends TextProps {
  variant?: keyof RootState['theme']['theme']['typography'];
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'success' | 'warning' | 'error' | 'info';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right' | 'justify';
  style?: TextStyle;
}

const ThemedText: React.FC<ThemedTextProps> = ({
  children,
  variant = 'body1',
  color = 'primary',
  weight,
  align = 'left',
  style,
  ...props
}) => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  const getTextStyle = (): TextStyle => {
    const baseStyle = createTextStyle(theme, variant);
    
    // Color mapping
    const colorMap = {
      primary: theme.colors.text,
      secondary: theme.colors.textSecondary,
      tertiary: theme.colors.textTertiary,
      inverse: theme.colors.textInverse,
      success: theme.colors.success,
      warning: theme.colors.warning,
      error: theme.colors.error,
      info: theme.colors.info,
    };

    // Weight mapping
    const weightMap = {
      normal: 'normal',
      medium: '500',
      semibold: '600',
      bold: 'bold',
    };

    return {
      ...baseStyle,
      color: colorMap[color],
      fontWeight: weight ? weightMap[weight] : baseStyle.fontWeight,
      textAlign: align,
    };
  };

  return (
    <Text style={[getTextStyle(), style]} {...props}>
      {children}
    </Text>
  );
};

// Convenience components for common text variants
export const Heading1: React.FC<Omit<ThemedTextProps, 'variant'>> = (props) => (
  <ThemedText variant="h1" {...props} />
);

export const Heading2: React.FC<Omit<ThemedTextProps, 'variant'>> = (props) => (
  <ThemedText variant="h2" {...props} />
);

export const Heading3: React.FC<Omit<ThemedTextProps, 'variant'>> = (props) => (
  <ThemedText variant="h3" {...props} />
);

export const Heading4: React.FC<Omit<ThemedTextProps, 'variant'>> = (props) => (
  <ThemedText variant="h4" {...props} />
);

export const Heading5: React.FC<Omit<ThemedTextProps, 'variant'>> = (props) => (
  <ThemedText variant="h5" {...props} />
);

export const Body1: React.FC<Omit<ThemedTextProps, 'variant'>> = (props) => (
  <ThemedText variant="body1" {...props} />
);

export const Body2: React.FC<Omit<ThemedTextProps, 'variant'>> = (props) => (
  <ThemedText variant="body2" {...props} />
);

export const Caption: React.FC<Omit<ThemedTextProps, 'variant'>> = (props) => (
  <ThemedText variant="caption" {...props} />
);

export const ButtonText: React.FC<Omit<ThemedTextProps, 'variant'>> = (props) => (
  <ThemedText variant="button" {...props} />
);

export default ThemedText; 