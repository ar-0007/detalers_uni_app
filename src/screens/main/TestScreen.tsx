import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import ThemedText from '../../components/common/ThemedText';
import ThemedCard from '../../components/common/ThemedCard';
import ThemedButton from '../../components/common/ThemedButton';
import ThemeToggle from '../../components/common/ThemeToggle';
import Icon from 'react-native-vector-icons/MaterialIcons';

const TestScreen: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <ThemedText variant="h2" color="primary" weight="bold">
            Design System Test
          </ThemedText>
          <ThemedText variant="body1" color="secondary">
            Testing all new components and theme
          </ThemedText>
        </View>

        {/* Theme Toggle */}
        <View style={styles.section}>
          <ThemedText variant="h4" color="primary" weight="bold" style={styles.sectionTitle}>
            Theme Toggle
          </ThemedText>
          <View style={styles.centerContent}>
            <ThemeToggle />
          </View>
        </View>

        {/* Typography Test */}
        <View style={styles.section}>
          <ThemedText variant="h4" color="primary" weight="bold" style={styles.sectionTitle}>
            Typography
          </ThemedText>
          <ThemedCard variant="glass" style={styles.testCard}>
            <ThemedText variant="h1" color="primary">Heading 1</ThemedText>
            <ThemedText variant="h2" color="primary">Heading 2</ThemedText>
            <ThemedText variant="h3" color="primary">Heading 3</ThemedText>
            <ThemedText variant="h4" color="primary">Heading 4</ThemedText>
            <ThemedText variant="h5" color="primary">Heading 5</ThemedText>
            <ThemedText variant="body1" color="primary">Body 1 Text</ThemedText>
            <ThemedText variant="body2" color="secondary">Body 2 Text</ThemedText>
            <ThemedText variant="caption" color="tertiary">Caption Text</ThemedText>
          </ThemedCard>
        </View>

        {/* Button Test */}
        <View style={styles.section}>
          <ThemedText variant="h4" color="primary" weight="bold" style={styles.sectionTitle}>
            Buttons
          </ThemedText>
          <View style={styles.buttonGrid}>
            <ThemedButton
              title="Primary Button"
              onPress={() => {}}
              variant="primary"
              style={styles.testButton}
            />
            <ThemedButton
              title="Secondary Button"
              onPress={() => {}}
              variant="secondary"
              style={styles.testButton}
            />
            <ThemedButton
              title="Outline Button"
              onPress={() => {}}
              variant="outline"
              style={styles.testButton}
            />
            <ThemedButton
              title="Ghost Button"
              onPress={() => {}}
              variant="ghost"
              style={styles.testButton}
            />
          </View>
        </View>

        {/* Card Test */}
        <View style={styles.section}>
          <ThemedText variant="h4" color="primary" weight="bold" style={styles.sectionTitle}>
            Cards
          </ThemedText>
          <View style={styles.cardGrid}>
            <ThemedCard variant="default" style={styles.testCard}>
              <ThemedText variant="h5" color="primary">Default Card</ThemedText>
              <ThemedText variant="body2" color="secondary">
                This is a default card with some content.
              </ThemedText>
            </ThemedCard>
            
            <ThemedCard variant="glass" style={styles.testCard}>
              <ThemedText variant="h5" color="primary">Glass Card</ThemedText>
              <ThemedText variant="body2" color="secondary">
                This is a glass card with transparency.
              </ThemedText>
            </ThemedCard>
            
            <ThemedCard variant="elevated" style={styles.testCard}>
              <ThemedText variant="h5" color="primary">Elevated Card</ThemedText>
              <ThemedText variant="body2" color="secondary">
                This is an elevated card with shadow.
              </ThemedText>
            </ThemedCard>
          </View>
        </View>

        {/* Color Test */}
        <View style={styles.section}>
          <ThemedText variant="h4" color="primary" weight="bold" style={styles.sectionTitle}>
            Colors
          </ThemedText>
          <View style={styles.colorGrid}>
            <View style={[styles.colorSwatch, { backgroundColor: theme.colors.primary }]}>
              <ThemedText variant="caption" color="inverse" align="center">Primary</ThemedText>
            </View>
            <View style={[styles.colorSwatch, { backgroundColor: theme.colors.accent }]}>
              <ThemedText variant="caption" color="inverse" align="center">Accent</ThemedText>
            </View>
            <View style={[styles.colorSwatch, { backgroundColor: theme.colors.success }]}>
              <ThemedText variant="caption" color="inverse" align="center">Success</ThemedText>
            </View>
            <View style={[styles.colorSwatch, { backgroundColor: theme.colors.warning }]}>
              <ThemedText variant="caption" color="inverse" align="center">Warning</ThemedText>
            </View>
            <View style={[styles.colorSwatch, { backgroundColor: theme.colors.error }]}>
              <ThemedText variant="caption" color="inverse" align="center">Error</ThemedText>
            </View>
            <View style={[styles.colorSwatch, { backgroundColor: theme.colors.info }]}>
              <ThemedText variant="caption" color="inverse" align="center">Info</ThemedText>
            </View>
          </View>
        </View>

        {/* Icon Test */}
        <View style={styles.section}>
          <ThemedText variant="h4" color="primary" weight="bold" style={styles.sectionTitle}>
            Icons
          </ThemedText>
          <View style={styles.iconGrid}>
            <View style={styles.iconItem}>
              <Icon name="home" size={32} color={theme.colors.primary} />
              <ThemedText variant="caption" color="secondary" align="center">Home</ThemedText>
            </View>
            <View style={styles.iconItem}>
              <Icon name="school" size={32} color={theme.colors.success} />
              <ThemedText variant="caption" color="secondary" align="center">School</ThemedText>
            </View>
            <View style={styles.iconItem}>
              <Icon name="person" size={32} color={theme.colors.info} />
              <ThemedText variant="caption" color="secondary" align="center">Person</ThemedText>
            </View>
            <View style={styles.iconItem}>
              <Icon name="calendar-today" size={32} color={theme.colors.warning} />
              <ThemedText variant="caption" color="secondary" align="center">Calendar</ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  centerContent: {
    alignItems: 'center',
  },
  buttonGrid: {
    gap: 12,
  },
  testButton: {
    marginBottom: 8,
  },
  cardGrid: {
    gap: 16,
  },
  testCard: {
    marginBottom: 0,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorSwatch: {
    width: 80,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconItem: {
    alignItems: 'center',
  },
});

export default TestScreen; 