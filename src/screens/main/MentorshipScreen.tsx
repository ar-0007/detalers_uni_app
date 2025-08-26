import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Button from '../../components/common/Button';
import { useCustomDialog } from '../../hooks/useCustomDialog';
import MentorshipBookingModal from '../../components/modals/MentorshipBookingModal';
import { mentorshipAPI, MentorshipBooking } from '../../services/api';

const MentorshipScreen: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const { showDialog, DialogComponent } = useCustomDialog();
  
  const [bookedSessions, setBookedSessions] = useState<MentorshipBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const response = await mentorshipAPI.getMyBookings();
      if (response.success && response.data) {
        setBookedSessions(response.data);
      } else {
        // If user is not authenticated or no bookings found, show empty state
        setBookedSessions([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Don't show error for unauthenticated users
      setBookedSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMyBookings();
    setRefreshing(false);
  };

  const handleBookingSuccess = () => {
    fetchMyBookings(); // Refresh the bookings list
  };

  const handleJoinMeeting = (booking: MentorshipBooking) => {
    if (booking.meeting_link) {
      showDialog({
        title: 'Join Meeting',
        message: `Opening meeting link for your session...`,
        type: 'info',
        buttons: [
          { text: 'Cancel' },
          { 
            text: 'Join', 
            onPress: () => {
              // In a real app, you would open the meeting link
              console.log('Opening meeting link:', booking.meeting_link);
            }
          },
        ]
      });
    } else {
      showDialog({
        title: 'Meeting Link Not Available',
        message: 'The meeting link will be provided once your session is approved by the instructor.',
        type: 'info'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return theme.colors.success;
      case 'pending':
        return theme.colors.warning || '#FFA500';
      case 'cancelled':
      case 'failed':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const renderBookedSession = (booking: MentorshipBooking) => (
    <View key={booking.booking_id} style={[styles.sessionCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.sessionHeader}>
        <Text style={[styles.sessionDate, { color: theme.colors.text }]}>
          {formatDate(booking.scheduled_date)} at {booking.scheduled_time}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.payment_status) }]}>
          <Text style={[styles.statusText, { color: theme.colors.background }]}>
            {booking.payment_status.toLowerCase()}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.customerName, { color: theme.colors.text }]}>
        Student: {booking.customer_name}
      </Text>
      <Text style={[styles.customerEmail, { color: theme.colors.textSecondary }]}>
        Email: {booking.customer_email}
      </Text>
      {booking.customer_phone && (
        <Text style={[styles.customerPhone, { color: theme.colors.textSecondary }]}>
          Phone: {booking.customer_phone}
        </Text>
      )}
      
      <Button
        title="Join Meeting"
        onPress={() => handleJoinMeeting(booking)}
        style={{ marginTop: 12 }}
        disabled={booking.payment_status.toLowerCase() !== 'paid'}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Book New Session */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Mentorship Sessions
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Book a one-on-one session with our expert mentors
          </Text>
          
          <Button
            title="Book New Session"
            onPress={() => setShowBookingModal(true)}
            style={styles.bookButton}
          />
        </View>

        {/* Booked Sessions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Your Sessions
          </Text>
          
          {loading ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                Loading your sessions...
              </Text>
            </View>
          ) : bookedSessions.length > 0 ? (
            bookedSessions.map(renderBookedSession)
          ) : (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                No booked sessions yet. Book your first session above!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      <MentorshipBookingModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onBookingSuccess={handleBookingSuccess}
      />
      
      <DialogComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  bookButton: {
    marginTop: 8,
  },
  sessionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  customerEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    marginBottom: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MentorshipScreen;