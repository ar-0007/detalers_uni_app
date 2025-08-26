import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ThemeToggle: React.FC = () => {
  const dispatch = useDispatch();
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const theme = useSelector((state: RootState) => state.theme.theme);

  const toggleTheme = () => {
    dispatch({ type: 'theme/toggleTheme' });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.glass,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={toggleTheme}
      activeOpacity={0.8}
    >
      <Icon
        name={isDark ? 'light-mode' : 'dark-mode'}
        size={24}
        color={theme.colors.primary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default ThemeToggle; 