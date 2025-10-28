import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import GlassCard from './GlassCard';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Button from './Button';

interface CustomDialogProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
  onRequestClose?: () => void;
}

const CustomDialog: React.FC<CustomDialogProps> = ({
  visible,
  title,
  message,
  type = 'info',
  buttons = [{ text: 'OK', onPress: () => {} }],
  onRequestClose,
}) => {
  const { theme } = useTheme();

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return theme.colors.error;
      case 'warning':
        return '#FF9800';
      default:
        return theme.colors.primary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={styles.modalOverlay}>
        <GlassCard style={[styles.dialogCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.dialogHeader}>
            <Icon name={getIconName()} size={40} color={getIconColor()} />
            <Text style={[styles.dialogTitle, { color: theme.colors.text }]}>
              {title}
            </Text>
          </View>
          
          <Text style={[styles.dialogMessage, { color: theme.colors.textSecondary }]}>
            {message}
          </Text>
          
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dialogButton,
                  {
                    backgroundColor:
                      button.style === 'destructive'
                        ? theme.colors.error
                        : button.style === 'cancel'
                        ? 'transparent'
                        : theme.colors.primary,
                    borderColor: theme.colors.primary,
                    borderWidth: button.style === 'cancel' ? 1 : 0,
                  },
                  buttons.length > 1 && index === 0 && { marginRight: 12 },
                ]}
                onPress={button.onPress}
              >
                <Text
                  style={[
                    styles.buttonText,
                    {
                      color:
                        button.style === 'cancel'
                          ? theme.colors.primary
                          : '#FFFFFF',
                    },
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 1)', // 100% opacity as requested
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 380,
    padding: 28,
    borderRadius: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  dialogHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dialogTitle: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    marginTop: 16,
    textAlign: 'center' as const,
    lineHeight: 28,
  },
  dialogMessage: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center' as const,
    marginBottom: 28,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dialogButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomDialog;