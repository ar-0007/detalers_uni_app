import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useTheme } from '../../contexts/ThemeContext';

interface SubscriptionStatusProps {
  showDetails?: boolean;
  onUpgradePress?: () => void;
  style?: any;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  showDetails = true,
  onUpgradePress,
  style,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const {
    hasActiveSubscription,
    subscriptionStatus,
    isExpiringSoon,
    subscription,
  } = useSubscription();

  const styles = StyleSheet.create({
    container: {
      padding: 12,
      borderRadius: 8,
      marginVertical: 4,
    },
    activeContainer: {
      backgroundColor: colors.success + '20',
      borderColor: colors.success,
      borderWidth: 1,
    },
    expiringSoonContainer: {
      backgroundColor: colors.warning + '20',
      borderColor: colors.warning,
      borderWidth: 1,
    },
    inactiveContainer: {
      backgroundColor: colors.error + '20',
      borderColor: colors.error,
      borderWidth: 1,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    activeText: {
      color: colors.success,
    },
    warningText: {
      color: colors.warning,
    },
    errorText: {
      color: colors.error,
    },
    detailText: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    upgradeButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    upgradeButtonText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: '600',
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginLeft: 8,
    },
    activeBadge: {
      backgroundColor: colors.success,
    },
    warningBadge: {
      backgroundColor: colors.warning,
    },
    inactiveBadge: {
      backgroundColor: colors.error,
    },
    badgeText: {
      color: colors.background,
      fontSize: 10,
      fontWeight: '600',
    },
  });

  const getContainerStyle = () => {
    if (hasActiveSubscription) {
      return isExpiringSoon ? styles.expiringSoonContainer : styles.activeContainer;
    }
    return styles.inactiveContainer;
  };

  const getStatusTextStyle = () => {
    if (hasActiveSubscription) {
      return isExpiringSoon ? styles.warningText : styles.activeText;
    }
    return styles.errorText;
  };

  const getBadgeStyle = () => {
    if (hasActiveSubscription) {
      return isExpiringSoon ? styles.warningBadge : styles.activeBadge;
    }
    return styles.inactiveBadge;
  };

  const getStatusText = () => {
    if (!hasActiveSubscription) {
      return 'No Active Subscription';
    }
    
    if (isExpiringSoon) {
      const daysRemaining = subscriptionStatus.daysRemaining || 0;
      return `Expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`;
    }
    
    return `${subscriptionStatus.type} Subscription Active`;
  };

  const getBadgeText = () => {
    if (hasActiveSubscription) {
      return isExpiringSoon ? 'EXPIRING' : 'PREMIUM';
    }
    return 'FREE';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={[styles.container, getContainerStyle(), style]}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <View style={styles.row}>
            <Text style={[styles.statusText, getStatusTextStyle()]}>
              {getStatusText()}
            </Text>
            <View style={[styles.badge, getBadgeStyle()]}>
              <Text style={styles.badgeText}>{getBadgeText()}</Text>
            </View>
          </View>
          
          {showDetails && subscription && (
            <Text style={styles.detailText}>
              {hasActiveSubscription
                ? `Valid until ${formatDate(subscription.end_date)}`
                : 'Upgrade to access all premium content'
              }
            </Text>
          )}
        </View>
        
        {!hasActiveSubscription && onUpgradePress && (
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgradePress}>
            <Text style={styles.upgradeButtonText}>Upgrade</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default SubscriptionStatus;