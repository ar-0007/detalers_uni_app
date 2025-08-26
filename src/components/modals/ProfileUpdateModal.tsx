import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { useTheme } from '../../contexts/ThemeContext';
import { updateUser } from '../../store/slices/authSlice';
import { updateUserProfile } from '../../store/actions/userActions';
import { userAPI, authAPI } from '../../services/api';
import Button from '../common/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCustomDialog } from '../../hooks/useCustomDialog';

interface ProfileUpdateModalProps {
  visible: boolean;
  onClose: () => void;
}

const ProfileUpdateModal: React.FC<ProfileUpdateModalProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { user, updateLoading } = useSelector((state: RootState) => state.user);
  const { showDialog, DialogComponent } = useCustomDialog();

  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = async () => {
    // Check if at least one field is being updated
    if (!firstName.trim() && !lastName.trim() && !newPassword) {
      showDialog({
        title: 'Error',
        message: 'Please update at least one field',
        type: 'error'
      });
      return;
    }

    // Validate password fields if password is being changed
    if (newPassword && newPassword !== confirmPassword) {
      showDialog({
        title: 'Error',
        message: 'Passwords do not match',
        type: 'error'
      });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      showDialog({
        title: 'Error',
        message: 'Password must be at least 6 characters long',
        type: 'error'
      });
      return;
    }

    if (newPassword && !currentPassword) {
      showDialog({
        title: 'Error',
        message: 'Current password is required to change password',
        type: 'error'
      });
      return;
    }

    try {
      let profileUpdated = false;
      let passwordUpdated = false;

      // Update profile information (firstName, lastName)
      if (firstName.trim() || lastName.trim()) {
        const profileData: any = {};

        if (firstName.trim()) {
          profileData.firstName = firstName.trim();
        }
        if (lastName.trim()) {
          profileData.lastName = lastName.trim();
        }

        await dispatch(updateUserProfile(profileData) as any);
        
        // Update local state with only the changed fields
        const localUpdateData: any = {};
        if (firstName.trim()) localUpdateData.firstName = firstName.trim();
        if (lastName.trim()) localUpdateData.lastName = lastName.trim();
        
        dispatch(updateUser(localUpdateData));
        profileUpdated = true;
      }

      // Update password separately if provided
      if (newPassword) {
        try {
          await authAPI.changePassword(currentPassword, newPassword);
          passwordUpdated = true;
        } catch (passwordError) {
          console.error('Password update error:', passwordError);
          showDialog({
            title: 'Password Update Failed',
            message: 'Failed to update password. Please check your current password and try again.',
            type: 'error'
          });
          passwordUpdated = false;
        }
      }
      
      if (profileUpdated || passwordUpdated) {
        let message = '';
        if (profileUpdated && passwordUpdated) {
          message = 'Profile and password updated successfully!';
        } else if (profileUpdated) {
          message = 'Profile updated successfully!';
        } else if (passwordUpdated) {
          message = 'Password updated successfully!';
        }
        
        showDialog({
          title: 'Success',
          message: message,
          type: 'success',
          onConfirm: () => {
            // Clear password fields for security
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            onClose();
          }
        });
      }
    } catch (error) {
      console.error('Profile update error:', error);
      showDialog({
        title: 'Error',
        message: 'Failed to update profile. Please try again.',
        type: 'error'
      });
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFirstName(user?.first_name || '');
    setLastName(user?.last_name || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modal, { backgroundColor: theme.colors.background }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: theme.colors.text }]}>Update Profile</Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                Update your profile information
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: theme.colors.text }]}>First Name</Text>
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
                <Text style={[styles.label, { color: theme.colors.text }]}>Last Name</Text>
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

              <View style={styles.passwordSection}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Change Password (Optional)</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Current Password</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                      color: theme.colors.text 
                    }]}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>New Password</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                      color: theme.colors.text 
                    }]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: theme.colors.text }]}>Confirm New Password</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: theme.colors.card,
                      borderColor: theme.colors.border,
                      color: theme.colors.text 
                    }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry
                  />
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title={updateLoading ? "Updating..." : "Update Profile"}
                onPress={handleUpdateProfile}
                disabled={updateLoading}
                style={styles.updateButton}
              />
            </View>
          </ScrollView>
        </View>
      </View>
      <DialogComponent />
    </Modal>
  );
};

const styles = {
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    borderRadius: 20,
    padding: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    alignItems: 'center',
    position: 'relative' as const,
  },
  closeButton: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center' as const,
    lineHeight: 22,
  },
  form: {
    padding: 24,
    paddingTop: 0,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 52,
  },
  passwordSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 0,
  },
  updateButton: {
    borderRadius: 12,
    minHeight: 52,
  },
};

export default ProfileUpdateModal;