import React, { useState, useCallback } from 'react';
import CustomDialog from '../components/common/CustomDialog';

interface DialogOptions {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  buttons?: Array<{
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }>;
}

interface UseCustomDialogReturn {
  showDialog: (options: DialogOptions) => void;
  hideDialog: () => void;
  DialogComponent: React.FC;
}

export const useCustomDialog = (): UseCustomDialogReturn => {
  const [dialogState, setDialogState] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type: 'info' | 'success' | 'error' | 'warning';
    buttons: Array<{
      text: string;
      onPress: () => void;
      style?: 'default' | 'cancel' | 'destructive';
    }>;
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [],
  });

  const showDialog = useCallback((options: DialogOptions) => {
    const defaultButtons = [
      {
        text: 'OK',
        onPress: () => setDialogState(prev => ({ ...prev, visible: false })),
      },
    ];

    const processedButtons = (options.buttons || defaultButtons).map(button => ({
      ...button,
      onPress: () => {
        if (button.onPress) {
          button.onPress();
        }
        setDialogState(prev => ({ ...prev, visible: false }));
      },
    }));

    setDialogState({
      visible: true,
      title: options.title,
      message: options.message,
      type: options.type || 'info',
      buttons: processedButtons,
    });
  }, []);

  const hideDialog = useCallback(() => {
    setDialogState(prev => ({ ...prev, visible: false }));
  }, []);

  const DialogComponent: React.FC = () => (
    <CustomDialog
      visible={dialogState.visible}
      title={dialogState.title}
      message={dialogState.message}
      type={dialogState.type}
      buttons={dialogState.buttons}
      onRequestClose={hideDialog}
    />
  );

  return {
    showDialog,
    hideDialog,
    DialogComponent,
  };
};

// Utility functions to mimic Alert.alert behavior
export const showAlert = (title: string, message?: string, buttons?: Array<{
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}>) => {
  // This will be used as a global dialog instance
  // For now, we'll export the hook and let components use it
};

export default useCustomDialog;