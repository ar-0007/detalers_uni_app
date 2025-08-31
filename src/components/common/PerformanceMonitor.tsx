import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { PerformanceMonitor as PerfMonitor, FPSMonitor } from '../../utils/performance';
import { useRenderPerformance } from '../../hooks/usePerformance';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const PerformanceMonitorComponent: React.FC<PerformanceMonitorProps> = React.memo(({
  enabled = __DEV__,
  position = 'top-right'
}) => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [fps, setFps] = useState(0);
  const [stats, setStats] = useState<Record<string, any>>({});
  
  const { renderCount } = useRenderPerformance('PerformanceMonitor');

  // Memoize position styles
  const positionStyle = useMemo(() => {
    const baseStyle = {
      position: 'absolute' as const,
      zIndex: 9999,
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyle, top: 50, left: 10 };
      case 'top-right':
        return { ...baseStyle, top: 50, right: 10 };
      case 'bottom-left':
        return { ...baseStyle, bottom: 100, left: 10 };
      case 'bottom-right':
        return { ...baseStyle, bottom: 100, right: 10 };
      default:
        return { ...baseStyle, top: 50, right: 10 };
    }
  }, [position]);

  // Memoize container styles
  const containerStyle = useMemo(() => [
    styles.container,
    positionStyle,
    { backgroundColor: theme.colors.surface }
  ], [positionStyle, theme.colors.surface]);

  const modalStyle = useMemo(() => [
    styles.modal,
    { backgroundColor: theme.colors.background }
  ], [theme.colors.background]);

  useEffect(() => {
    if (!enabled) return;

    // Start FPS monitoring
    FPSMonitor.start();

    const interval = setInterval(() => {
      setFps(FPSMonitor.getAverageFPS());
      setStats(PerfMonitor.getAllStats());
    }, 1000);

    return () => {
      clearInterval(interval);
      FPSMonitor.stop();
    };
  }, [enabled]);

  const handleToggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleClearStats = () => {
    PerfMonitor.clearMeasurements();
    setStats({});
  };

  const formatNumber = (num: number): string => {
    return num.toFixed(1);
  };

  const getFPSColor = (fps: number): string => {
    if (fps >= 55) return theme.colors.success;
    if (fps >= 30) return theme.colors.warning;
    return theme.colors.error;
  };

  if (!enabled) return null;

  return (
    <>
      <View style={containerStyle}>
        <TouchableOpacity
          style={styles.trigger}
          onPress={() => setIsVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.fpsContainer}>
            <Text style={[styles.fpsText, { color: getFPSColor(fps) }]}>
              {formatNumber(fps)}
            </Text>
            <Text style={[styles.fpsLabel, { color: theme.colors.textSecondary }]}>
              FPS
            </Text>
          </View>
          <Icon name="analytics" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={modalStyle}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Performance Monitor
              </Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={handleClearStats}
                  style={[styles.actionButton, { backgroundColor: theme.colors.warning + '20' }]}
                >
                  <Icon name="clear" size={20} color={theme.colors.warning} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsVisible(false)}
                  style={[styles.actionButton, { backgroundColor: theme.colors.error + '20' }]}
                >
                  <Icon name="close" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* FPS Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Frame Rate
                </Text>
                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                    Current FPS:
                  </Text>
                  <Text style={[styles.metricValue, { color: getFPSColor(fps) }]}>
                    {formatNumber(fps)}
                  </Text>
                </View>
                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                    Target FPS:
                  </Text>
                  <Text style={[styles.metricValue, { color: theme.colors.success }]}>
                    60.0
                  </Text>
                </View>
              </View>

              {/* Render Count Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Component Renders
                </Text>
                <View style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                    Monitor Renders:
                  </Text>
                  <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
                    {renderCount}
                  </Text>
                </View>
              </View>

              {/* Performance Stats Section */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  Performance Measurements
                </Text>
                {Object.keys(stats).length === 0 ? (
                  <Text style={[styles.noDataText, { color: theme.colors.textSecondary }]}>
                    No performance data available
                  </Text>
                ) : (
                  Object.entries(stats).map(([name, data]) => (
                    <View key={name} style={styles.statItem}>
                      <Text style={[styles.statName, { color: theme.colors.text }]}>
                        {name}
                      </Text>
                      <View style={styles.statDetails}>
                        <View style={styles.statRow}>
                          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                            Count:
                          </Text>
                          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                            {data.count}
                          </Text>
                        </View>
                        <View style={styles.statRow}>
                          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                            Avg:
                          </Text>
                          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                            {data.average}ms
                          </Text>
                        </View>
                        <View style={styles.statRow}>
                          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                            Min/Max:
                          </Text>
                          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                            {data.min}ms / {data.max}ms
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>

              {/* Memory Section (if available) */}
              {__DEV__ && (performance as any).memory && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Memory Usage
                  </Text>
                  <View style={styles.metricRow}>
                    <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                      Used:
                    </Text>
                    <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
                      {((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
                      Total:
                    </Text>
                    <Text style={[styles.metricValue, { color: theme.colors.primary }]}>
                      {((performance as any).memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 6,
  },
  fpsContainer: {
    alignItems: 'center',
  },
  fpsText: {
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 16,
  },
  fpsLabel: {
    fontSize: 10,
    lineHeight: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  statItem: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  statName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  statDetails: {
    gap: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default PerformanceMonitorComponent;