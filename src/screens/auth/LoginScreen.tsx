import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { loginUser, clearAuthError } from '../../store/actions/authActions';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useCustomDialog } from '../../hooks/useCustomDialog';

const LoginScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useSelector((state: RootState) => state.theme.theme);
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const { showDialog, DialogComponent } = useCustomDialog();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Handle blocked user errors with dialog
  useEffect(() => {
    if (error && (error.includes('currently inactive') || error.includes('blocked') || error.includes('USER_BLOCKED'))) {
      showDialog({
        title: 'Account Blocked',
        message: 'Your account has been blocked. Please contact support for assistance.',
        buttons: [
          {
            text: 'OK',
            onPress: () => {
              dispatch(clearAuthError());
            }
          }
        ]
      });
    }
  }, [error, showDialog, dispatch]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    // Clear any previous errors
    dispatch(clearAuthError());

    // Dispatch login action
    dispatch(loginUser(email, password));
  };

  const handleForgotPassword = () => {
    showDialog({
      title: 'Forgot Password',
      message: 'Please contact the admin to reset your password.',
      buttons: [{ text: 'OK' }]
    });
  };

  const containerStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
  };

  const contentStyle = {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  };

  const headerStyle = {
    marginBottom: theme.spacing.xxl,
  };

  const titleStyle = {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    fontWeight: theme.typography.h1.fontWeight as any,
  };

  const subtitleStyle = {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.body1.fontWeight as any,
  };

  const formStyle = {
    flex: 1,
    justifyContent: 'center' as const,
  };

  const footerStyle = {
    paddingVertical: theme.spacing.lg,
  };

  const footerTextStyle = {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    textAlign: 'center' as const,
    marginBottom: theme.spacing.sm,
    fontWeight: theme.typography.body2.fontWeight as any,
  };

  return (
    <>
      <KeyboardAvoidingView
        style={containerStyle}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
        >
          <View style={headerStyle}>
            <Text style={titleStyle}>Welcome Back</Text>
            <Text style={subtitleStyle}>
              Sign in to continue your car detailing journey
            </Text>
          </View>

          <View style={formStyle}>
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              error={emailError}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={passwordError}
            />

            {error && !error.includes('currently inactive') && !error.includes('blocked') && !error.includes('USER_BLOCKED') && (
              <Text style={{ color: theme.colors.error, marginBottom: theme.spacing.md }}>
                {error}
              </Text>
            )}

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              style={{ marginBottom: theme.spacing.md }}
            />

            <Button
              title="Forgot Password?"
              onPress={handleForgotPassword}
              variant="ghost"
              size="small"
            />
          </View>

          <View style={footerStyle}>
            <Text style={footerTextStyle}>
              Don't have an account? Contact admin for registration.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <DialogComponent />
    </>
    );
};

export default LoginScreen;