import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useStripe } from '@stripe/stripe-react-native';
import { RootState } from '../../store';
import { RootStackParamList } from '../../navigation/types';
import { mentorshipAPI } from '../../services/api';
import { useCustomDialog } from '../../hooks/useCustomDialog';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';

type MentorshipCheckoutScreenRouteProp = RouteProp<RootStackParamList, 'MentorshipCheckout'>;

const MentorshipCheckoutScreen: React.FC = () => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const route = useRoute<MentorshipCheckoutScreenRouteProp>();
  const navigation = useNavigation();
  const { bookingId } = route.params;
  const { showDialog, DialogComponent } = useCustomDialog();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSheetReady, setPaymentSheetReady] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, []);

  useEffect(() => {
    if (booking && !paymentSheetReady) {
      initializePaymentSheet();
    }
  }, [booking]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await mentorshipAPI.getBookingById(bookingId);
      
      if (response.success) {
        setBooking(response.data);
      } else {
        showDialog({
          title: 'Error',
          message: 'Failed to load booking details',
          type: 'error',
          buttons: [
            {
              text: 'Go Back',
              onPress: () => navigation.goBack()
            }
          ]
        });
      }
    } catch (error: any) {
      console.error('Error fetching booking:', error);
      showDialog({
        title: 'Error',
        message: 'Failed to load booking details',
        type: 'error',
        buttons: [
          {
            text: 'Go Back',
            onPress: () => navigation.goBack()
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const initializePaymentSheet = async () => {
    try {
      // Create payment intent
      const paymentIntentResponse = await mentorshipAPI.createPaymentIntent(bookingId);
      
      if (!paymentIntentResponse.success) {
        throw new Error(paymentIntentResponse.message || 'Failed to create payment intent');
      }
      
      const { client_secret } = paymentIntentResponse.data;
      
      // Initialize payment sheet
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'E-Learning App',
        paymentIntentClientSecret: client_secret,
        defaultBillingDetails: {
          name: booking.customer_name,
          email: booking.customer_email,
        },
      });
      
      if (error) {
        console.error('Payment sheet initialization error:', error);
        throw new Error(error.message);
      }
      
      setPaymentSheetReady(true);
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      showDialog({
        title: 'Payment Setup Failed',
        message: error.message || 'Failed to initialize payment. Please try again.',
        type: 'error'
      });
    }
  };

  const handlePayment = async () => {
    if (!paymentSheetReady) {
      showDialog({
        title: 'Payment Not Ready',
        message: 'Payment is not ready yet. Please wait.',
        type: 'error'
      });
      return;
    }

    setPaymentLoading(true);
    try {
      const { error } = await presentPaymentSheet();
      
      if (error) {
        if (error.code === 'Canceled') {
          // User canceled payment
          return;
        }
        throw new Error(error.message);
      }
      
      // Payment successful
      showDialog({
        title: 'Payment Successful!',
        message: 'Your mentorship session has been confirmed. You will receive a confirmation email shortly.',
        type: 'success',
        buttons: [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('MentorshipScreen' as never);
            }
          }
        ]
      });
    } catch (error: any) {
      console.error('Payment error:', error);
      showDialog({
        title: 'Payment Failed',
        message: error.message || 'Payment processing failed. Please try again.',
        type: 'error'
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading checkout...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          Booking not found
        </Text>
      </View>
    );
  }

  const totalCost = booking.instructor?.hourly_rate * (booking.session_duration || 1);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Mentorship Checkout</Text>
      </View>

      {/* Booking Details */}
      <GlassCard style={styles.bookingCard}>
        <View style={styles.bookingInfo}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Session Details</Text>
          <Text style={[styles.instructorName, { color: theme.colors.text }]}>
            {booking.instructor?.first_name} {booking.instructor?.last_name}
          </Text>
          <Text style={[styles.sessionDetails, { color: theme.colors.textSecondary }]}>
            Date: {booking.preferred_date}
          </Text>
          <Text style={[styles.sessionDetails, { color: theme.colors.textSecondary }]}>
            Time: {booking.preferred_time}
          </Text>
          <Text style={[styles.sessionDetails, { color: theme.colors.textSecondary }]}>
            Duration: {booking.session_duration || 1} hour(s)
          </Text>
          <Text style={[styles.sessionPrice, { color: theme.colors.primary }]}>
            ${totalCost?.toFixed(2)}
          </Text>
        </View>
      </GlassCard>

      {/* Customer Information */}
      <GlassCard style={styles.customerCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Customer Information</Text>
        <View style={styles.customerInfo}>
          <Text style={[styles.customerDetail, { color: theme.colors.textSecondary }]}>
            Name: {booking.customer_name}
          </Text>
          <Text style={[styles.customerDetail, { color: theme.colors.textSecondary }]}>
            Email: {booking.customer_email}
          </Text>
          {booking.customer_phone && (
            <Text style={[styles.customerDetail, { color: theme.colors.textSecondary }]}>
              Phone: {booking.customer_phone}
            </Text>
          )}
        </View>
      </GlassCard>

      {/* Payment */}
      <GlassCard style={styles.paymentCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Secure Payment</Text>
        
        <View style={styles.paymentInfo}>
          <Icon name="security" size={24} color={theme.colors.primary} />
          <Text style={[styles.paymentInfoText, { color: theme.colors.textSecondary }]}>
            Powered by Stripe - Your payment information is secure and encrypted
          </Text>
        </View>

        <Button
          title={paymentLoading ? 'Processing...' : `Pay $${totalCost?.toFixed(2)}`}
          onPress={handlePayment}
          disabled={paymentLoading || !paymentSheetReady}
          style={{
            ...styles.payButton,
            opacity: (!paymentSheetReady || paymentLoading) ? 0.6 : 1,
          }}
          loading={paymentLoading}
        />
        
        {!paymentSheetReady && (
          <View style={styles.loadingPayment}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={[styles.loadingPaymentText, { color: theme.colors.textSecondary }]}>
              Setting up secure payment...
            </Text>
          </View>
        )}
      </GlassCard>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.totalText, { color: theme.colors.text }]}>
          Total: ${totalCost?.toFixed(2)}
        </Text>
        <Text style={[styles.noteText, { color: theme.colors.textSecondary }]}>
          You will receive session details immediately after payment confirmation.
        </Text>
      </View>
      
      <DialogComponent />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  bookingCard: {
    margin: 16,
  },
  bookingInfo: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructorName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  sessionDetails: {
    fontSize: 16,
    marginBottom: 4,
  },
  sessionPrice: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  customerCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  customerInfo: {
    padding: 16,
  },
  customerDetail: {
    fontSize: 16,
    marginBottom: 8,
  },
  paymentCard: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
  },
  paymentInfoText: {
    marginLeft: 12,
    fontSize: 14,
    flex: 1,
  },
  payButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  loadingPayment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingPaymentText: {
    marginLeft: 8,
    fontSize: 14,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MentorshipCheckoutScreen;