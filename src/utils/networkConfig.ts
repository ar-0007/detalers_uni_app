// Network Configuration Helper
// This file helps manage different IP addresses for development

export interface NetworkConfig {
  baseUrl: string;
  description: string;
  priority: number;
}

// Get current network IP addresses for development
export const getNetworkConfigs = (): NetworkConfig[] => {
  return [
    {
      baseUrl: 'http://localhost:4000/api',
      description: 'USB Physical Device/ADB Port Forward (Highest Priority)',
      priority: 1
    },
    {
      baseUrl: 'http://192.168.137.1:4000/api',
      description: 'Mobile Hotspot/Tethering Network (Working)',
      priority: 2
    },
    {
      baseUrl: 'http://192.168.100.8:4000/api',
      description: 'Wi-Fi Network (Working)',
      priority: 3
    },
    {
      baseUrl: 'http://10.0.2.2:4000/api',
      description: 'Android Emulator (Fallback)',
      priority: 4
    },
    {
      baseUrl: 'http://192.168.10.10:4000/api',
      description: 'Original Configuration (Fallback)',
      priority: 5
    }
  ];
};

// Test network connectivity to a given URL
export const testNetworkConnectivity = async (baseUrl: string): Promise<boolean> => {
  try {
    // Remove /api from baseUrl for health check since health endpoint is at root
    const healthUrl = baseUrl.replace('/api', '') + '/health';
    
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced timeout
    
    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    clearTimeout(timeoutId);
    
    const isOk = response.ok;
    if (isOk) {
      console.log(`✅ Network test successful for ${baseUrl}`);
    } else {
      console.log(`❌ Network test failed for ${baseUrl}: HTTP ${response.status}`);
    }
    return isOk;
  } catch (error) {
    const errorMsg = error instanceof Error ? 
      (error.name === 'AbortError' ? 'Request timeout' : error.message) 
      : String(error);
    console.log(`❌ Network test failed for ${baseUrl}: ${errorMsg}`);
    return false;
  }
};

// Get the best available network configuration
export const getBestNetworkConfig = async (): Promise<string> => {
  const configs = getNetworkConfigs();
  
  for (const config of configs) {
    const isAvailable = await testNetworkConnectivity(config.baseUrl);
    if (isAvailable) {
      console.log(`✅ Using network config: ${config.description} (${config.baseUrl})`);
      return config.baseUrl;
    }
  }
  
  // Fallback to first option if none work with bounds checking
  if (!Array.isArray(configs) || configs.length === 0) {
    console.error('networkConfig - No network configurations available');
    throw new Error('No network configurations found');
  }
  
  const fallbackConfig = configs[0];
  if (!fallbackConfig || !fallbackConfig.baseUrl) {
    console.error('networkConfig - Invalid fallback configuration:', fallbackConfig);
    throw new Error('Invalid fallback network configuration');
  }
  
  console.log('⚠️ No network configs responded, using default');
  return fallbackConfig.baseUrl;
};

// Retry network detection helper
export const retryNetworkDetection = async (): Promise<string> => {
  console.log('🔄 Retrying network detection...');
  try {
    const bestConfig = await getBestNetworkConfig();
    console.log('✅ Network detection retry successful:', bestConfig);
    return bestConfig;
  } catch (error) {
    console.error('❌ Network detection retry failed:', error);
    throw error;
  }
};

// Network diagnostics helper
export const logNetworkDiagnostics = () => {
  console.log('🔍 Network Configuration Diagnostics:');
  console.log('Available network options:');
  
  getNetworkConfigs().forEach((config, index) => {
    console.log(`${index + 1}. ${config.description}: ${config.baseUrl}`);
  });
  
  console.log('\n💡 Troubleshooting tips:');
  console.log('• Ensure backend server is running: npm start (in backend folder)');
  console.log('• Check if device is on the same network as development machine');
  console.log('• For Android emulator, use computer\'s IP address');
  console.log('• For iOS simulator, use localhost');
  console.log('• Verify firewall is not blocking connections');
  console.log('• Check if backend server is using the correct port (default: 4000)');
};