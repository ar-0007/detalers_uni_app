import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updateUser } from '../../store/slices/authSlice';
import { updateUserProfile } from '../../store/actions/userActions';
import Button from '../common/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCustomDialog } from '../../hooks/useCustomDialog';

interface FirstTimeProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const FirstTimeProfileModal: React.FC<FirstTimeProfileModalProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => (state.theme as { theme: any }).theme);
  const { user } = useSelector((state: RootState) => state.auth);
  const { updateLoading } = useSelector((state: RootState) => state.user);
  const { showDialog, DialogComponent } = useCustomDialog();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

  const handleUpdateProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      showDialog({
        title: 'Error',
        message: 'Please enter both first name and last name',
        type: 'error'
      });
      return;
    }

    try {
      const profileData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        isFirstLogin: false,
      };

      await dispatch(updateUserProfile(profileData) as any);
      
      // Update local state
      const localUpdateData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        isFirstLogin: false
      };
      
      dispatch(updateUser(localUpdateData));
      
      showDialog({
        title: 'Success',
        message: 'Profile setup completed successfully!',
        type: 'success',
        buttons: [{
          text: 'OK',
          onPress: onClose
        }]
      });
    } catch (error) {
      console.error('Profile setup error:', error);
      showDialog({
        title: 'Error',
        message: 'Failed to setup profile. Please try again.',
        type: 'error',
        buttons: [{
          text: 'OK',
          onPress: () => {}
        }]
      });
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {}}
    >
      <KeyboardAvoidingView 
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <Icon name="person-add" size={32} color={theme.colors.primary} />
            <Text style={[styles.title, { color: theme.colors.text }]}>Complete Your Profile</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Please update your profile information to continue
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>First Name *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  color: theme.colors.text 
                }]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Last Name *</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                  color: theme.colors.text 
                }]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>


          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={updateLoading ? "Setting up..." : "Complete Setup"}
              onPress={handleUpdateProfile}
              disabled={updateLoading}
              style={styles.updateButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
      <DialogComponent />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: 'center' as const,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  buttonContainer: {
    gap: 12,
  },
  updateButton: {
    borderRadius: 12,
  },
});

export default FirstTimeProfileModal;