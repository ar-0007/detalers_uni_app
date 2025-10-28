import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useStripe, useConfirmPayment } from '@stripe/stripe-react-native';
import { RootState } from '../../store';
import { guestCoursePurchaseAPI } from '../../services/api';
import GlassCard from '../../components/common/GlassCard';
import Button from '../../components/common/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { RootStackParamList } from '../../navigation/types';
import { useCustomDialog } from '../../hooks/useCustomDialog';

type CheckoutScreenRouteProp = RouteProp<RootStackParamList, 'Checkout'>;

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<CheckoutScreenRouteProp>();
  const { purchaseId } = route.params;
  
  console.log('CheckoutScreen mounted with purchaseId:', purchaseId);
  
  const theme = useSelector((state: RootState) => state.theme.theme);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSheetReady, setPaymentSheetReady] = useState(false);
  const { showDialog, DialogComponent } = useCustomDialog();

  useEffect(() => {
    fetchPurchaseDetails();
  }, [purchaseId]);

  useEffect(() => {
    if (purchase && !paymentSheetReady) {
      initializePaymentSheet();
    }
  }, [purchase]);

  const fetchPurchaseDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching purchase details for ID:', purchaseId);
      const response = await guestCoursePurchaseAPI.getGuestCoursePurchaseById(purchaseId);
      console.log('Purchase details response:', response);
      
      if (response.success) {
        setPurchase(response.data);
        console.log('Purchase details loaded:', response.data);
      } else {
        console.error('Failed to fetch purchase details:', response);
        throw new Error(response.message || 'Failed to fetch purchase details');
      }
    } catch (error: any) {
      console.error('Error fetching purchase details:', error);
      showDialog({
        title: 'Error',
        message: 'Failed to load purchase details. Please try again.',
        buttons: [
          {
            text: 'Go Back',
            onPress: () => navigation.goBack()
          },
          {
            text: 'Retry',
            onPress: () => fetchPurchaseDetails()
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
      const paymentIntentResponse = await guestCoursePurchaseAPI.createPaymentIntent(purchaseId);
      
      if (!paymentIntentResponse.success) {
        throw new Error(paymentIntentResponse.message || 'Failed to create payment intent');
      }

      const { client_secret } = paymentIntentResponse.data;

      // Initialize payment sheet
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Detailers University',
        paymentIntentClientSecret: client_secret,
        defaultBillingDetails: {
          name: purchase?.customer_name,
          email: purchase?.customer_email,
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
        buttons: [{ text: 'OK' }]
      });
    }
  };

  const handlePayment = async () => {
    if (!paymentSheetReady) {
      showDialog({
        title: 'Error',
        message: 'Payment is not ready yet. Please wait.',
        buttons: [{ text: 'OK' }]
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
        message: 'Your course has been purchased successfully. You can now access it from your courses.',
        buttons: [
          {
            text: 'Go to My Courses',
            onPress: () => {
              navigation.goBack();
            }
          }
        ]
      });
    } catch (error: any) {
      console.error('Payment error:', error);
      showDialog({
        title: 'Payment Failed',
        message: error.message || 'Payment processing failed. Please try again.',
        buttons: [{ text: 'OK' }]
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading checkout...</Text>
      </View>
    );
  }

  if (!purchase) {
    return (
      <View style={[styles.container, styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <Icon name="error" size={64} color={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.text }]}>Purchase not found</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Checkout</Text>
      </View>

      <GlassCard style={styles.courseCard}>
        <View style={styles.courseInfo}>
          {purchase.course.image_url && (
            <Image 
              source={{ uri: purchase.course.image_url }} 
              style={styles.courseImage} 
            />
          )}
          <View style={styles.courseDetails}>
            <Text style={[styles.courseTitle, { color: theme.colors.text }]}>
              {purchase.course.title}
            </Text>
            <Text style={[styles.courseInstructor, { color: theme.colors.textSecondary }]}>
              by {purchase.course.instructor?.first_name} {purchase.course.instructor?.last_name}
            </Text>
            <Text style={[styles.coursePrice, { color: theme.colors.primary }]}>
              ${purchase.course_price}
            </Text>
          </View>
        </View>
      </GlassCard>

      <GlassCard style={styles.customerCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Customer Information</Text>
        <View style={styles.customerInfo}>
          <Text style={[styles.customerDetail, { color: theme.colors.textSecondary }]}>
            Name: {purchase.customer_name}
          </Text>
          <Text style={[styles.customerDetail, { color: theme.colors.textSecondary }]}>
            Email: {purchase.customer_email}
          </Text>
          {purchase.customer_phone && (
            <Text style={[styles.customerDetail, { color: theme.colors.textSecondary }]}>
              Phone: {purchase.customer_phone}
            </Text>
          )}
        </View>
      </GlassCard>

      <GlassCard style={styles.paymentCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Secure Payment</Text>
        
        <View style={styles.paymentInfo}>
          <Icon name="security" size={24} color={theme.colors.primary} />
          <Text style={[styles.paymentInfoText, { color: theme.colors.textSecondary }]}>
            Powered by Stripe - Your payment information is secure and encrypted
          </Text>
        </View>

        <Button
          title={paymentLoading ? 'Processing...' : `Pay $${purchase.course_price}`}
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

      <View style={styles.footer}>
        <Text style={[styles.totalText, { color: theme.colors.text }]}>
          Total: ${purchase.course_price}
        </Text>
        <Text style={[styles.noteText, { color: theme.colors.textSecondary }]}>
          You will receive course access immediately after payment confirmation.
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  courseCard: {
    margin: 20,
    marginTop: 0,
  },
  courseInfo: {
    flexDirection: 'row',
    padding: 16,
  },
  courseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  courseDetails: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  courseInstructor: {
    fontSize: 14,
    marginBottom: 8,
  },
  coursePrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  customerCard: {
    margin: 20,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  customerInfo: {
    padding: 16,
    paddingTop: 0,
  },
  customerDetail: {
    fontSize: 14,
    marginBottom: 4,
  },
  paymentCard: {
    margin: 20,
    marginTop: 0,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  paymentInfoText: {
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  payButton: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  loadingPayment: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 16,
  },
  loadingPaymentText: {
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default CheckoutScreen;