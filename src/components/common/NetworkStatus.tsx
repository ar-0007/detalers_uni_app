import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getCurrentApiUrl } from '../../services/api';
import { logNetworkDiagnostics, retryNetworkDetection, testNetworkConnectivity } from '../../utils/networkConfig';

interface NetworkStatusProps {
  showDetails?: boolean;
  onNetworkChange?: (isConnected: boolean) => void;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ 
  showDetails = false, 
  onNetworkChange 
}) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [isRetrying, setIsRetrying] = useState(false);

  const checkConnection = async () => {
    try {
      const url = getCurrentApiUrl();
      const connected = await testNetworkConnectivity(url);
      setIsConnected(connected);
      setCurrentUrl(url);
      onNetworkChange?.(connected);
    } catch (error) {
      console.error('Error checking connection:', error);
      setIsConnected(false);
      onNetworkChange?.(false);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      console.log('🔄 User initiated network retry...');
      await retryNetworkDetection();
      await checkConnection();
      
      if (isConnected) {
        Alert.alert(
          'Network Status',
          'Successfully connected to the server!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Network Issue',
          'Still unable to connect to the server. Please check your network connection and ensure the backend server is running.',
          [
            { text: 'Show Diagnostics', onPress: () => logNetworkDiagnostics() },
            { text: 'OK' }
          ]
        );
      }
    } catch (error) {
      console.error('Error during retry:', error);
      Alert.alert(
        'Network Error',
        'Failed to retry network detection. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (!showDetails && isConnected !== false) {
    return null; // Only show when there's an issue and showDetails is false
  }

  const getStatusColor = () => {
    if (isConnected === null) return '#FFA500'; // Orange for loading
    return isConnected ? '#4CAF50' : '#F44336'; // Green for connected, red for disconnected
  };

  const getStatusText = () => {
    if (isConnected === null) return 'Checking connection...';
    return isConnected ? 'Connected' : 'Connection Failed';
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusRow}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>
      
      {showDetails && (
        <Text style={styles.urlText}>Server: {currentUrl}</Text>
      )}
      
      {isConnected === false && (
        <TouchableOpacity 
          style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]} 
          onPress={handleRetry}
          disabled={isRetrying}
        >
          <Text style={styles.retryButtonText}>
            {isRetrying ? 'Retrying...' : 'Retry Connection'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  urlText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  retryButtonDisabled: {
    backgroundColor: '#ccc',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default NetworkStatus;