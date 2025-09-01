import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { mentorshipAPI, subscriptionBenefitsAPI, Instructor, MentorshipSlot, MentorshipEligibility } from '../../services/api';
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

  // Form state
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<MentorshipSlot | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [message, setMessage] = useState('');
  const [preferredTopics, setPreferredTopics] = useState('');

  // Date/Time picker state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [filteredSlots, setFilteredSlots] = useState<MentorshipSlot[]>([]);
  const [showAllSlots, setShowAllSlots] = useState(false);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Data states
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<MentorshipSlot[]>([]);
  const [eligibility, setEligibility] = useState<MentorshipEligibility | null>(null);
  const [isFreeMember, setIsFreeMember] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchInstructors();
      checkMentorshipEligibility();
      // Auto-populate user information
      if (user) {
        setCustomerName(`${user.firstName} ${user.lastName}`);
        setCustomerEmail(user.email);
      }
      if (userProfile && 'phone' in userProfile && typeof userProfile.phone === 'string') {
        setCustomerPhone(userProfile.phone || '');
      }
    }
  }, [visible, user, userProfile]);

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
    } catch (error: any) {
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

  const fetchAvailableSlots = async (instructorId: string) => {
    setLoadingSlots(true);
    setAvailableSlots([]);
    setSelectedSlot(null);
    setFilteredSlots([]);
    
    try {
      const response = await mentorshipAPI.getAvailableSlots(instructorId);
      if (response.success && response.data) {
        // Filter slots to show only future dates and available slots
        const now = new Date();
        const futureSlots = response.data.filter(slot => {
          const slotDateTime = new Date(slot.start_time);
          return slotDateTime > now && !slot.is_booked;
        });
        setAvailableSlots(futureSlots);
        filterSlotsByDateTime(futureSlots, selectedDate, selectedTime);
        
        if (futureSlots.length === 0) {
          showDialog({
            title: 'No Available Slots',
            message: 'This instructor has no available time slots. Please try another instructor or check back later.',
            type: 'info'
          });
        }
      } else {
        showDialog({
          title: 'Error',
          message: 'Failed to load available time slots',
          type: 'error'
        });
      }
    } catch (error: any) {
      console.error('Error fetching slots:', error);
      showDialog({
        title: 'Error',
        message: 'Failed to load available time slots',
        type: 'error'
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  const checkMentorshipEligibility = async () => {
    if (!user) {
      setIsFreeMember(false);
      return;
    }

    setCheckingEligibility(true);
    try {
      const response = await subscriptionBenefitsAPI.checkMentorshipEligibility();
      if (response.success && response.data) {
        setEligibility(response.data);
        setIsFreeMember(response.data.is_eligible);
      } else {
        setIsFreeMember(false);
        setEligibility(null);
      }
    } catch (error: any) {
      console.error('Error checking mentorship eligibility:', error);
      setIsFreeMember(false);
      setEligibility(null);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleInstructorSelect = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    fetchAvailableSlots(instructor.instructor_id);
  };

  const filterSlotsByDateTime = (slots: MentorshipSlot[], date: Date, time: Date) => {
    if (showAllSlots) {
      setFilteredSlots(slots);
      return;
    }

    const selectedDateStr = date.toISOString().split('T')[0];
    const selectedHour = time.getHours();
    
    // Filter slots within 2 hours of selected time on selected date
    const filtered = slots.filter(slot => {
      const slotDate = new Date(slot.start_time);
      const slotDateStr = slotDate.toISOString().split('T')[0];
      const slotHour = slotDate.getHours();
      
      // Same date and within 2 hours of selected time
      return slotDateStr === selectedDateStr && 
             Math.abs(slotHour - selectedHour) <= 2;
    });
    
    setFilteredSlots(filtered);
  };

  const handleDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      if (availableSlots.length > 0) {
        filterSlotsByDateTime(availableSlots, date, selectedTime);
      }
    }
  };

  const handleTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
      if (availableSlots.length > 0) {
        filterSlotsByDateTime(availableSlots, selectedDate, time);
      }
    }
  };

  const toggleShowAllSlots = () => {
    setShowAllSlots(!showAllSlots);
    if (availableSlots.length > 0) {
      filterSlotsByDateTime(availableSlots, selectedDate, selectedTime);
    }
  };

  const formatSlotTime = (slot: MentorshipSlot) => {
    const startDate = new Date(slot.start_time);
    const endDate = new Date(slot.end_time);
    
    return {
      date: startDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: `${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
      fullDate: startDate.toLocaleDateString(),
    };
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

    if (!selectedSlot) {
      showDialog({
        title: 'Validation Error',
        message: 'Please select an available time slot',
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
      let response;
      
      // Check if user is eligible for free booking and wants to use it
      if (isFreeMember && eligibility?.is_eligible) {
        // Use free booking with selected slot
        response = await subscriptionBenefitsAPI.createFreeMentorshipBooking({
          slot_id: selectedSlot.slot_id
        });
        
        console.log('Free booking API response:', response);
        
        if (response.success) {
          showDialog({
            title: 'Success',
            message: 'Your free mentorship session has been booked successfully! You will receive a confirmation email shortly.',
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
          // If free booking fails, show error but don't fall back
          console.error('Free booking failed with response:', response);
          showDialog({
            title: 'Free Booking Failed',
            message: response.error?.message || 'Failed to create free booking. Please try again or contact support.',
            type: 'error'
          });
        }
      } else {
        // Use regular paid booking
        const slotStartTime = new Date(selectedSlot.start_time);
        const bookingData = {
          instructorId: selectedInstructor.instructor_id,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          customerPhone: customerPhone.trim() || undefined,
          preferredDate: slotStartTime.toISOString().split('T')[0],
          preferredTime: slotStartTime.toTimeString().substring(0, 5),
          message: message.trim() || undefined,
          preferredTopics: preferredTopics.trim() ? preferredTopics.split(',').map(t => t.trim()) : undefined,
        };

        response = await mentorshipAPI.createBooking(bookingData);
        
        console.log('Booking API response:', response);
        
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
          console.error('Booking failed with response:', response);
          showDialog({
            title: 'Booking Failed',
            message: response.error?.message || 'Failed to create booking. Please try again.',
            type: 'error'
          });
        }
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      
      // Check if this is a network error or unexpected error
      let errorMessage = 'Failed to create booking. Please check your internet connection and try again.';
      
      if (error?.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showDialog({
        title: 'Booking Error',
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedInstructor(null);
    setSelectedSlot(null);
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setMessage('');
    setPreferredTopics('');
    setAvailableSlots([]);
    setEligibility(null);
    setIsFreeMember(false);
    setCheckingEligibility(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
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
          {/* Membership Benefits */}
          {user && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Membership Benefits</Text>
              {checkingEligibility ? (
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Checking eligibility...</Text>
              ) : isFreeMember && eligibility?.is_eligible ? (
                <View style={[styles.benefitCard, { backgroundColor: theme.colors.success + '20', borderColor: theme.colors.success }]}>
                  <Text style={[styles.benefitTitle, { color: theme.colors.success }]}>🎉 Free Session Available!</Text>
                  <Text style={[styles.benefitText, { color: theme.colors.text }]}>
                    You have {eligibility.remaining_free_bookings} free mentorship session{eligibility.remaining_free_bookings !== 1 ? 's' : ''} remaining this month.
                  </Text>
                </View>
              ) : eligibility && !eligibility.is_eligible ? (
                <View style={[styles.benefitCard, { backgroundColor: theme.colors.warning + '20', borderColor: theme.colors.warning }]}>
                  <Text style={[styles.benefitTitle, { color: theme.colors.warning }]}>No Free Sessions Available</Text>
                  <Text style={[styles.benefitText, { color: theme.colors.text }]}>
                    {eligibility.reason || 'You have used all your free sessions for this month.'}
                  </Text>
                  {eligibility.next_reset_date && (
                    <Text style={[styles.benefitSubtext, { color: theme.colors.textSecondary }]}>
                      Next free session available: {new Date(eligibility.next_reset_date).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              ) : (
                <View style={[styles.benefitCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                  <Text style={[styles.benefitTitle, { color: theme.colors.text }]}>Regular Booking</Text>
                  <Text style={[styles.benefitText, { color: theme.colors.textSecondary }]}>Standard pricing applies for this session.</Text>
                </View>
              )}
            </View>
          )}

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
                    onPress={() => handleInstructorSelect(instructor)}
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

          {/* Date and Time Picker */}
          {selectedInstructor && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                Preferred Date & Time
              </Text>
              
              <View style={styles.dateTimeContainer}>
                <TouchableOpacity
                  style={[styles.dateTimeButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.dateTimeButtonText, { color: theme.colors.text }]}>
                    📅 {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.dateTimeButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={[styles.dateTimeButtonText, { color: theme.colors.text }]}>
                    🕐 {selectedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity
                style={[styles.toggleButton, { backgroundColor: showAllSlots ? theme.colors.primary : theme.colors.card, borderColor: theme.colors.border }]}
                onPress={toggleShowAllSlots}
              >
                <Text style={[styles.toggleButtonText, { color: showAllSlots ? theme.colors.background : theme.colors.text }]}>
                  {showAllSlots ? 'Show Filtered Slots' : 'Show All Available Slots'}
                </Text>
              </TouchableOpacity>
              
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
              
              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                />
              )}
            </View>
          )}

          {/* Available Time Slots */}
          {selectedInstructor && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {showAllSlots ? 'All Available Slots' : `Slots around ${selectedTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} on ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
              </Text>
              {loadingSlots ? (
                <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
                  Loading available slots...
                </Text>
              ) : (showAllSlots ? availableSlots : filteredSlots).length > 0 ? (
                <View style={styles.slotsGrid}>
                  {(showAllSlots ? availableSlots : filteredSlots).map((slot) => {
                    const slotTime = formatSlotTime(slot);
                    return (
                      <TouchableOpacity
                        key={slot.slot_id}
                        style={[
                          styles.slotCard,
                          {
                            backgroundColor: selectedSlot?.slot_id === slot.slot_id
                              ? theme.colors.primary
                              : theme.colors.card,
                            borderColor: theme.colors.border,
                          },
                        ]}
                        onPress={() => setSelectedSlot(slot)}
                      >
                        <Text
                          style={[
                            styles.slotDate,
                            {
                              color: selectedSlot?.slot_id === slot.slot_id
                                ? theme.colors.background
                                : theme.colors.text,
                            },
                          ]}
                        >
                          {slotTime.date}
                        </Text>
                        <Text
                          style={[
                            styles.slotTime,
                            {
                              color: selectedSlot?.slot_id === slot.slot_id
                                ? theme.colors.background
                                : theme.colors.textSecondary,
                            },
                          ]}
                        >
                          {slotTime.time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <Text style={[styles.noSlotsText, { color: theme.colors.textSecondary }]}>
                  No available time slots for this instructor.
                </Text>
              )}
            </View>
          )}

          {/* Customer Information */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Your Information
            </Text>
            
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="Full Name"
              placeholderTextColor={theme.colors.textSecondary}
              value={customerName}
              onChangeText={setCustomerName}
            />
            
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="Email Address"
              placeholderTextColor={theme.colors.textSecondary}
              value={customerEmail}
              onChangeText={setCustomerEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
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
            
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="Preferred topics or areas of focus (Optional)"
              placeholderTextColor={theme.colors.textSecondary}
              value={preferredTopics}
              onChangeText={setPreferredTopics}
              multiline
              numberOfLines={3}
            />
            
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.colors.card, color: theme.colors.text, borderColor: theme.colors.border }]}
              placeholder="Additional message or questions (Optional)"
              placeholderTextColor={theme.colors.textSecondary}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Book Button */}
          <TouchableOpacity
            style={[
              styles.bookButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: loading || !selectedInstructor || !selectedSlot ? 0.6 : 1,
              },
            ]}
            onPress={handleSubmit}
            disabled={loading || !selectedInstructor || !selectedSlot}
          >
            <Text style={[styles.bookButtonText, { color: theme.colors.background }]}>
              {loading ? 'Booking...' : isFreeMember && eligibility?.is_eligible ? 'Book Free Session' : 'Book Session'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <DialogComponent />
    </Modal>
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
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
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
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  benefitCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 14,
    marginBottom: 4,
  },
  benefitSubtext: {
    fontSize: 12,
  },
  instructorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  instructorCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  instructorName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  instructorRate: {
    fontSize: 12,
    textAlign: 'center',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slotCard: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  slotDate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  slotTime: {
    fontSize: 12,
  },
  noSlotsText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  bookButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateTimeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  dateTimeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  toggleButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MentorshipBookingModal;