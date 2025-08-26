import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme } from '../../store/slices/themeSlice';
import Button from '../../components/common/Button';
import FirstTimeProfileModal from '../../components/modals/FirstTimeProfileModal';
import ProfileUpdateModal from '../../components/modals/ProfileUpdateModal';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCustomDialog } from '../../hooks/useCustomDialog';

const { width } = Dimensions.get('window');

const ProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const { user } = useSelector((state: RootState) => state.auth);
  const { showDialog, DialogComponent } = useCustomDialog();
  
  const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
  const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);

  // Check for first-time login
  useEffect(() => {
    if (user?.isFirstLogin) {
      setShowFirstTimeModal(true);
    }
  }, [user?.isFirstLogin]);

  const handleLogout = () => {
    showDialog({
      type: 'info',
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        { text: 'Cancel' },
        { text: 'Logout', onPress: () => dispatch(logout()) },
      ]
    });
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const headerStyle = {
    backgroundColor: theme.colors.primary,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: theme.spacing.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  };

  const profileImageStyle = {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.card,
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 4,
    borderColor: theme.colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  };

  const userNameStyle = {
    ...theme.typography.h3,
    color: theme.colors.background,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 4,
  };

  const userEmailStyle = {
    ...theme.typography.body1,
    color: theme.colors.background,
    textAlign: 'center',
    opacity: 0.9,
  };

  const contentStyle = {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  };

  const statsContainerStyle = {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.xl,
  };

  const statCardStyle = {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: theme.spacing.lg,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  };

  const statNumberStyle = {
    ...theme.typography.h4,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginBottom: 4,
  };

  const statLabelStyle = {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  };

  const sectionCardStyle = {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  };

  const sectionTitleStyle = {
    ...theme.typography.h5,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontWeight: '600',
  };

  const infoRowStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  };

  const infoLabelStyle = {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
  };

  const infoValueStyle = {
    ...theme.typography.body2,
    color: theme.colors.text,
    fontWeight: '500',
  };

  const themeToggleContainerStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  };

  const logoutButtonStyle = {
    backgroundColor: theme.colors.error,
    borderRadius: 15,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.lg,
    shadowColor: theme.colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  };

  const logoutButtonTextStyle = {
    ...theme.typography.button,
    color: theme.colors.background,
    textAlign: 'center',
    fontWeight: '600',
  };

  const updateProfileButtonStyle = {
    backgroundColor: theme.colors.primary,
    borderRadius: 15,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  };

  const updateProfileButtonTextStyle = {
    ...theme.typography.button,
    color: theme.colors.background,
    textAlign: 'center',
    fontWeight: '600',
  };

  return (
    <View style={containerStyle}>
      {/* Modern Header with Profile Image */}
      <View style={headerStyle}>
        <View style={profileImageStyle}>
          <Text style={{
            fontSize: 40,
            color: theme.colors.primary,
            textAlign: 'center',
            lineHeight: 100,
            fontWeight: 'bold',
          }}>
            {user?.firstName?.charAt(0)?.toUpperCase() || user?.lastName?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={userNameStyle}>
          {user?.firstName && user?.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user?.firstName || user?.lastName || 'User Name'
          }
        </Text>
        <Text style={userEmailStyle}>{user?.email || 'user@example.com'}</Text>
      </View>

      <ScrollView contentContainerStyle={contentStyle} showsVerticalScrollIndicator={false}>
       

        {/* Account Information */}
        <View style={sectionCardStyle}>
          <Text style={sectionTitleStyle}>Account Information</Text>
          <View style={infoRowStyle}>
            <Text style={infoLabelStyle}>Name</Text>
            <Text style={infoValueStyle}>
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.firstName || user?.lastName || 'Not provided'
              }
            </Text>
          </View>
          <View style={infoRowStyle}>
            <Text style={infoLabelStyle}>Email</Text>
            <Text style={infoValueStyle}>{user?.email || 'Not provided'}</Text>
          </View>
          <View style={infoRowStyle}>
            <Text style={infoLabelStyle}>Account Status</Text>
            <View style={{
              backgroundColor: user?.isBlocked ? theme.colors.error : theme.colors.success,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
            }}>
              <Text style={{
                color: theme.colors.background,
                fontSize: 12,
                fontWeight: '600',
              }}>
                {user?.isBlocked ? 'Blocked' : 'Active'}
              </Text>
            </View>
          </View>
        </View>

        {/* Preferences */}
        <View style={sectionCardStyle}>
          <Text style={sectionTitleStyle}>Preferences</Text>
          <View style={themeToggleContainerStyle}>
            <Text style={infoLabelStyle}>Dark Theme</Text>
            <Switch
              value={isDarkMode}
              onValueChange={() => dispatch(toggleTheme())}
              trackColor={{ 
                false: theme.colors.border, 
                true: theme.colors.primary 
              }}
              thumbColor={isDarkMode ? theme.colors.background : theme.colors.text}
              style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
            />
          </View>
        </View>

        {/* Update Profile Button */}
        <TouchableOpacity 
          style={updateProfileButtonStyle} 
          onPress={() => setShowUpdateProfileModal(true)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="edit" size={20} color={theme.colors.background} style={{ marginRight: 8 }} />
            <Text style={updateProfileButtonTextStyle}>Update Profile</Text>
          </View>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={logoutButtonStyle} onPress={handleLogout}>
          <Text style={logoutButtonTextStyle}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* First Time Profile Modal */}
      <FirstTimeProfileModal
        visible={showFirstTimeModal}
        onClose={() => setShowFirstTimeModal(false)}
      />

      {/* Update Profile Modal */}
      <ProfileUpdateModal
        visible={showUpdateProfileModal}
        onClose={() => setShowUpdateProfileModal(false)}
      />
      
      <DialogComponent />
    </View>
  );
};

export default ProfileScreen;