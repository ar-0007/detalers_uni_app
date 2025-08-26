import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import ThemedText from '../../components/common/ThemedText';
import ThemedCard from '../../components/common/ThemedCard';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CalendarScreen: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const mockEvents = [
    {
      id: '1',
      title: 'Car Washing Workshop',
      time: '10:00 AM - 12:00 PM',
      type: 'workshop',
      instructor: 'John Smith',
    },
    {
      id: '2',
      title: 'Paint Correction Session',
      time: '2:00 PM - 4:00 PM',
      type: 'session',
      instructor: 'Sarah Johnson',
    },
  ];

  const renderEventCard = (event: any) => (
    <ThemedCard variant="glass" style={styles.eventCard}>
      <View style={styles.eventHeader}>
        <Icon name="event" size={24} color={theme.colors.primary} />
        <View style={styles.eventInfo}>
          <ThemedText variant="h5" color="primary" weight="semibold">
            {event.title}
          </ThemedText>
          <ThemedText variant="body2" color="secondary">
            {event.time}
          </ThemedText>
        </View>
      </View>
      <ThemedText variant="body2" color="secondary">
        Instructor: {event.instructor}
      </ThemedText>
    </ThemedCard>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <ThemedText variant="h3" color="primary" weight="bold">
              Calendar
            </ThemedText>
            <ThemedText variant="body1" color="secondary">
              Manage your learning schedule
            </ThemedText>
          </View>

          {/* Calendar Card */}
          <ThemedCard variant="glass" style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity>
                <Icon name="chevron-left" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
              
              <ThemedText variant="h4" color="primary" weight="semibold">
                {selectedDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </ThemedText>
              
              <TouchableOpacity>
                <Icon name="chevron-right" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarGrid}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                <View key={index} style={styles.dayHeader}>
                  <ThemedText variant="caption" color="secondary" align="center">
                    {day}
                  </ThemedText>
                </View>
              ))}
              
              {Array.from({ length: 35 }, (_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.calendarDay,
                    i === 15 && styles.selectedDay,
                  ]}
                  onPress={() => {}}
                >
                  <ThemedText
                    variant="body2"
                    color={i === 15 ? 'inverse' : 'primary'}
                    align="center"
                  >
                    {i + 1}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ThemedCard>

          {/* Events Section */}
          <View style={styles.eventsSection}>
            <ThemedText variant="h4" color="primary" weight="bold" style={styles.sectionTitle}>
              Today's Events
            </ThemedText>
            
            <View style={styles.eventsList}>
              {mockEvents.map(renderEventCard)}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <ThemedText variant="h4" color="primary" weight="bold" style={styles.sectionTitle}>
              Quick Actions
            </ThemedText>
            
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.quickActionCard}>
                <Icon name="add" size={24} color={theme.colors.primary} />
                <ThemedText variant="body2" color="primary" weight="semibold" align="center">
                  Add Event
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionCard}>
                <Icon name="schedule" size={24} color={theme.colors.success} />
                <ThemedText variant="body2" color="primary" weight="semibold" align="center">
                  View Schedule
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.quickActionCard}>
                <Icon name="notifications" size={24} color={theme.colors.warning} />
                <ThemedText variant="body2" color="primary" weight="semibold" align="center">
                  Reminders
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
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
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  calendarCard: {
    marginBottom: 32,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayHeader: {
    width: '14.28%',
    paddingVertical: 8,
    alignItems: 'center',
  },
  calendarDay: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  selectedDay: {
    backgroundColor: '#FF6B35',
  },
  eventsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  eventsList: {
    gap: 12,
  },
  eventCard: {
    marginBottom: 0,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventInfo: {
    marginLeft: 12,
    flex: 1,
  },
  quickActionsSection: {
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export default CalendarScreen; 