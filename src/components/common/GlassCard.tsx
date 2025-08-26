import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import LinearGradient from 'react-native-linear-gradient';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: boolean;
  colors?: string[];
}

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  gradient = true,
  colors,
}) => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  const defaultColors = theme.colors.background === '#FAFAFA'
    ? ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.6)']
    : ['rgba(42, 42, 42, 0.8)', 'rgba(42, 42, 42, 0.6)'];

  const cardColors = colors || defaultColors;

  return (
    <View style={[styles.container, style]}>
      {gradient ? (
        <LinearGradient
          colors={cardColors}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {children}
        </LinearGradient>
      ) : (
        <View style={[styles.plain, { backgroundColor: theme.colors.glass }]}>
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  gradient: {
    padding: 20,
    borderRadius: 20,
  },
  plain: {
    padding: 20,
    borderRadius: 20,
  },
});

export default GlassCard; 