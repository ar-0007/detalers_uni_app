import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Badge as BadgeType, BadgeType as BadgeEnum } from '../../services/badgeService';

interface BadgeProps {
  badge: BadgeType;
  size?: 'small' | 'medium' | 'large';
  showIcon?: boolean;
  showLabel?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Badge: React.FC<BadgeProps> = ({
  badge,
  size = 'medium',
  showIcon = true,
  showLabel = true,
  style,
  textStyle,
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          text: styles.smallText,
          icon: styles.smallIcon,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          text: styles.largeText,
          icon: styles.largeIcon,
        };
      default:
        return {
          container: styles.mediumContainer,
          text: styles.mediumText,
          icon: styles.mediumIcon,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const backgroundColor = badge.color;
  const textColor = getContrastColor(badge.color);

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        { backgroundColor },
        style,
      ]}
    >
      {showIcon && (
        <Text style={[sizeStyles.icon, { color: textColor }]}>
          {badge.icon}
        </Text>
      )}
      {showLabel && (
        <Text
          style={[
            styles.text,
            sizeStyles.text,
            { color: textColor },
            textStyle,
          ]}
          numberOfLines={1}
        >
          {badge.label}
        </Text>
      )}
    </View>
  );
};

// Helper function to determine text color based on background
const getContrastColor = (backgroundColor: string): string => {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  // Small size styles
  smallContainer: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  smallText: {
    fontSize: 10,
    lineHeight: 12,
  },
  smallIcon: {
    fontSize: 10,
    marginRight: 2,
  },
  // Medium size styles
  mediumContainer: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  mediumText: {
    fontSize: 12,
    lineHeight: 14,
  },
  mediumIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  // Large size styles
  largeContainer: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  largeText: {
    fontSize: 14,
    lineHeight: 16,
  },
  largeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
});

// Badge variants for common use cases
export const PremiumBadge: React.FC<Omit<BadgeProps, 'badge'>> = (props) => {
  const badge: BadgeType = {
    type: BadgeEnum.PREMIUM_MEMBER,
    label: 'Premium',
    color: '#FFD700',
    icon: '✨',
    description: 'Premium Member'
  };
  
  return <Badge badge={badge} {...props} />;
};

export const RegularBadge: React.FC<Omit<BadgeProps, 'badge'>> = (props) => {
  const badge: BadgeType = {
    type: BadgeEnum.REGULAR_USER,
    label: 'Regular',
    color: '#6B7280',
    icon: '👤',
    description: 'Regular User'
  };
  
  return <Badge badge={badge} {...props} />;
};

export const AdminBadge: React.FC<Omit<BadgeProps, 'badge'>> = (props) => {
  const badge: BadgeType = {
    type: BadgeEnum.ADMIN,
    label: 'Admin',
    color: '#DC2626',
    icon: '👑',
    description: 'Administrator'
  };
  
  return <Badge badge={badge} {...props} />;
};

export default Badge;