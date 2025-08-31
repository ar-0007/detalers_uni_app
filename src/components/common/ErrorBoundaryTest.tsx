import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ScreenErrorBoundary from './ScreenErrorBoundary';
import { ErrorCategory } from '../../utils/errorReporting';

// Component that throws different types of errors for testing
const ErrorThrower: React.FC<{ errorType: string }> = ({ errorType }) => {
  const throwError = () => {
    switch (errorType) {
      case 'render':
        throw new Error('Render error: Component failed to render properly');
      case 'network':
        throw new Error('Network error: Failed to fetch data from server');
      case 'validation':
        throw new Error('Validation error: Invalid input provided');
      case 'authentication':
        throw new Error('Authentication error: Token expired or invalid');
      case 'payment':
        throw new Error('Payment error: Stripe payment processing failed');
      case 'navigation':
        throw new Error('Navigation error: Failed to navigate to screen');
      case 'media':
        throw new Error('Media error: Video playback failed');
      case 'async':
        // Simulate async error
        setTimeout(() => {
          throw new Error('Async error: Delayed operation failed');
        }, 100);
        return <Text>Async error will be thrown in 100ms...</Text>;
      case 'null':
        // Simulate null reference error
        const nullObject: any = null;
        return <Text>{nullObject.property}</Text>;
      case 'undefined':
        // Simulate undefined property access
        const undefinedObject: any = {};
        return <Text>{undefinedObject.nonExistent.property}</Text>;
      default:
        throw new Error('Unknown error: Something unexpected happened');
    }
  };

  // Throw error during render
  throwError();
  
  return <Text>This should not render</Text>;
};

// Main test component
const ErrorBoundaryTest: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const [selectedError, setSelectedError] = useState<string | null>(null);
  const [testKey, setTestKey] = useState(0);

  const errorTypes = [
    { key: 'render', label: 'Render Error', icon: 'error', description: 'Component rendering failure' },
    { key: 'network', label: 'Network Error', icon: 'wifi-off', description: 'Network connectivity issue' },
    { key: 'validation', label: 'Validation Error', icon: 'warning', description: 'Input validation failure' },
    { key: 'authentication', label: 'Auth Error', icon: 'lock', description: 'Authentication failure' },
    { key: 'payment', label: 'Payment Error', icon: 'payment', description: 'Payment processing error' },
    { key: 'navigation', label: 'Navigation Error', icon: 'navigation', description: 'Screen navigation failure' },
    { key: 'media', label: 'Media Error', icon: 'play-circle-outline', description: 'Media playback error' },
    { key: 'null', label: 'Null Reference', icon: 'help-outline', description: 'Null object access' },
    { key: 'undefined', label: 'Undefined Property', icon: 'help-outline', description: 'Undefined property access' },
    { key: 'async', label: 'Async Error', icon: 'schedule', description: 'Asynchronous operation error' },
  ];

  const handleErrorTest = (errorType: string) => {
    Alert.alert(
      'Test Error Boundary',
      `This will trigger a ${errorType} error. The error boundary should catch it and display a fallback UI.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Trigger Error',
          style: 'destructive',
          onPress: () => {
            setSelectedError(errorType);
            setTestKey(prev => prev + 1);
          },
        },
      ]
    );
  };

  const resetTest = () => {
    setSelectedError(null);
    setTestKey(prev => prev + 1);
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <Icon name="bug-report" size={32} color={theme.colors.primary} />
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Error Boundary Test
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Test different error scenarios to see how error boundaries handle them
        </Text>
      </View>

      {/* Error Test Area */}
      <View style={[styles.testArea, { backgroundColor: theme.colors.surface, ...theme.shadows.medium }]}>
        <Text style={[styles.testTitle, { color: theme.colors.text }]}>
          Error Test Area
        </Text>
        
        <ScreenErrorBoundary 
          screenName="ErrorBoundaryTest"
          resetKeys={[testKey]}
        >
          {selectedError ? (
            <ErrorThrower errorType={selectedError} />
          ) : (
            <View style={styles.noErrorState}>
              <Icon name="check-circle" size={48} color={theme.colors.success} />
              <Text style={[styles.noErrorText, { color: theme.colors.textSecondary }]}>
                No errors - Select a test below
              </Text>
            </View>
          )}
        </ScreenErrorBoundary>
      </View>

      {/* Error Type Buttons */}
      <View style={styles.buttonsContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Error Types to Test
        </Text>
        
        {errorTypes.map((errorType) => (
          <TouchableOpacity
            key={errorType.key}
            style={[
              styles.errorButton,
              { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                ...theme.shadows.small 
              }
            ]}
            onPress={() => handleErrorTest(errorType.key)}
            activeOpacity={0.7}
          >
            <View style={styles.errorButtonContent}>
              <Icon name={errorType.icon} size={24} color={theme.colors.primary} />
              <View style={styles.errorButtonText}>
                <Text style={[styles.errorButtonTitle, { color: theme.colors.text }]}>
                  {errorType.label}
                </Text>
                <Text style={[styles.errorButtonDescription, { color: theme.colors.textSecondary }]}>
                  {errorType.description}
                </Text>
              </View>
              <Icon name="chevron-right" size={20} color={theme.colors.textTertiary} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Reset Button */}
      {selectedError && (
        <TouchableOpacity
          style={[
            styles.resetButton,
            { backgroundColor: theme.colors.primary, ...theme.shadows.small }
          ]}
          onPress={resetTest}
          activeOpacity={0.8}
        >
          <Icon name="refresh" size={20} color="#FFFFFF" style={styles.resetButtonIcon} />
          <Text style={[styles.resetButtonText, { color: '#FFFFFF' }]}>
            Reset Test
          </Text>
        </TouchableOpacity>
      )}

      {/* Instructions */}
      <View style={[styles.instructions, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <Text style={[styles.instructionsTitle, { color: theme.colors.text }]}>
          How to Test:
        </Text>
        <Text style={[styles.instructionsText, { color: theme.colors.textSecondary }]}>
          1. Tap any error type button above{"\n"}
          2. Confirm the error trigger{"\n"}
          3. Observe the error boundary fallback UI{"\n"}
          4. Use "Try Again" or "Go Back" in the error UI{"\n"}
          5. Check console logs for error details
        </Text>
      </View>
    </ScrollView>
  );
};

export default ErrorBoundaryTest;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  testArea: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    minHeight: 120,
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  noErrorState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  noErrorText: {
    fontSize: 14,
    marginTop: 8,
  },
  buttonsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  errorButton: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  errorButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  errorButtonText: {
    flex: 1,
    marginLeft: 12,
  },
  errorButtonTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  errorButtonDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  resetButtonIcon: {
    marginRight: 8,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 12,
    lineHeight: 18,
  },
});