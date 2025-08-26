import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Button from '../common/Button';
import { mentorshipAPI, Instructor } from '../../services/api';
import { useCustomDialog } from '../../hooks/useCustomDialog';

interface MentorshipBookingModalProps {
  visible: boolean;
  onClose: () => void;
  onBookingSuccess: () => void;
}

const MentorshipBookingModal: React.FC<MentorshipBookingModalProps> = ({
  visible,
  onClose,
  onBookingSuccess,
}) => {
  const theme = useSelector((state: RootState) => state.theme.theme);
  const user = useSelector((state: RootState) => state.auth.user);
  const userProfile = useSelector((state: RootState) => state.user.profile);
  const { showDialog, DialogComponent } = useCustomDialog();
  
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [message, setMessage] = useState('');
  const [preferredTopics, setPreferredTopics] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingInstructors, setLoadingInstructors] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchInstructors();
      // Auto-populate user information
      if (user) {
        setCustomerName(`${user.firstName} ${user.lastName}`);
        setCustomerEmail(user.email);
      }
      if (userProfile && 'phone' in userProfile) {
        setCustomerPhone(userProfile.phone as string);
      }
    }
  }, [visible, user, userProfile]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      setSelectedInstructor(null);
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setSelectedDate(new Date());
      setSelectedTime(new Date());
      setMessage('');
      setPreferredTopics('');
    }
  }, [visible]);

  const fetchInstructors = async () => {
    setLoadingInstructors(true);
    try {
      const response = await mentorshipAPI.getAllInstructors();
      if (response.success && response.data) {
        setInstructors(response.data);
      } else {
        showDialog({
          title: 'Error',
          message: 'Failed to load instructors',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching instructors:', error);
      showDialog({
        title: 'Error',
        message: 'Failed to load instructors',
        type: 'error'
      });
    } finally {
      setLoadingInstructors(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setSelectedTime(selectedTime);
    }
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const formatTime = (date: Date) => {
    return date.toTimeString().slice(0, 5); // HH:MM format
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedInstructor) {
      showDialog({
        title: 'Validation Error',
        message: 'Please select an instructor',
        type: 'error'
      });
      return;
    }

    if (!customerName.trim()) {
      showDialog({
        title: 'Validation Error',
        message: 'Please enter your name',
        type: 'error'
      });
      return;
    }

    if (!customerEmail.trim()) {
      showDialog({
        title: 'Validation Error',
        message: 'Please enter your email',
        type: 'error'
      });
      return;
    }

    // Date validation - ensure it's not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);
    
    if (selectedDateOnly < today) {
      showDialog({
        title: 'Validation Error',
        message: 'Please select a future date',
        type: 'error'
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      showDialog({
        title: 'Validation Error',
        message: 'Please enter a valid email address',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        instructorId: selectedInstructor.instructor_id,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || undefined,
        preferredDate: formatDate(selectedDate),
        preferredTime: formatTime(selectedTime),
        message: message.trim() || undefined,
        preferredTopics: preferredTopics.trim() ? preferredTopics.split(',').map(t => t.trim()) : undefined,
      };

      const response = await mentorshipAPI.createBooking(bookingData);
      
      if (response.success) {
        showDialog({
          title: 'Success',
          message: 'Your mentorship session has been booked successfully! You will receive a confirmation email shortly.',
          type: 'success',
          buttons: [
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                onClose();
                onBookingSuccess();
              }
            }
          ]
        });
      } else {
        showDialog({
          title: 'Booking Failed',
          message: response.error?.message || 'Failed to create booking',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      showDialog({
        title: 'Error',
        message: 'Failed to create booking. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedInstructor(null);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setSelectedDate(new Date());
    setSelectedTime(new Date());
    setShowDatePicker(false);
    setShowTimePicker(false);
    setMessage('');
    setPreferredTopics('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Book Mentorship Session
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: theme.colors.primary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Instructor Selection */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Select Instructor
              </Text>
              {loadingInstructors ? (
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                  Loading instructors...
                </Text>
              ) : (
                <View style={styles.instructorGrid}>
                  {instructors.map((instructor) => (
                    <TouchableOpacity
                      key={instructor.instructor_id}
                      style={[
                        styles.instructorCard,
                        {
                          backgroundColor: selectedInstructor?.instructor_id === instructor.instructor_id
                            ? theme.colors.primary
                            : theme.colors.card,
                          borderColor: theme.colors.border,
                        },
                      ]}
                      onPress={() => setSelectedInstructor(instructor)}
                    >
                      <Text
                        style={[
                          styles.instructorName,
                          {
                            color: selectedInstructor?.instructor_id === instructor.instructor_id
                              ? theme.colors.background
                              : theme.colors.text,
                          },
                        ]}
                      >
                        {instructor.first_name} {instructor.last_name}
                      </Text>
                      <Text
                        style={[
                          styles.instructorRate,
                          {
                            color: selectedInstructor?.instructor_id === instructor.instructor_id
                              ? theme.colors.background
                              : theme.colors.textSecondary,
                          },
                        ]}
                      >
                        ${instructor.hourly_rate}/hour
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Customer Information */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Your Information
              </Text>
              
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                placeholder="Full Name *"
                placeholderTextColor={theme.colors.textSecondary}
                value={customerName}
                onChangeText={setCustomerName}
              />
              
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                placeholder="Email Address *"
                placeholderTextColor={theme.colors.textSecondary}
                value={customerEmail}
                onChangeText={setCustomerEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                placeholder="Phone Number (Optional)"
                placeholderTextColor={theme.colors.textSecondary}
                value={customerPhone}
                onChangeText={setCustomerPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Session Details */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Session Details
              </Text>
              
              {/* Date Picker */}
              <TouchableOpacity
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    justifyContent: 'center',
                  },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text
                  style={[
                    {
                      color: selectedDate ? theme.colors.text : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {selectedDate ? formatDate(selectedDate) : 'Select Date *'}
                </Text>
              </TouchableOpacity>
              
              {/* Time Picker */}
              <TouchableOpacity
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    justifyContent: 'center',
                  },
                ]}
                onPress={() => setShowTimePicker(true)}
              >
                <Text
                  style={[
                    {
                      color: selectedTime ? theme.colors.text : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {selectedTime ? formatTime(selectedTime) : 'Select Time *'}
                </Text>
              </TouchableOpacity>
              
              {/* Date Picker Modal */}
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
              
              {/* Time Picker Modal */}
              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime || new Date()}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                />
              )}
              
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                placeholder="Preferred Topics (comma-separated)"
                placeholderTextColor={theme.colors.textSecondary}
                value={preferredTopics}
                onChangeText={setPreferredTopics}
              />
              
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                placeholder="Additional Message (Optional)"
                placeholderTextColor={theme.colors.textSecondary}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title={loading ? 'Booking...' : 'Book Session'}
                onPress={handleSubmit}
                disabled={loading}
                style={styles.submitButton}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
      <DialogComponent />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  loadingText: {
    textAlign: 'center',
    padding: 20,
  },
  instructorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  instructorCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  instructorRate: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    minHeight: 100,
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  submitButton: {
    marginTop: 0,
  },
});

export default MentorshipBookingModal;