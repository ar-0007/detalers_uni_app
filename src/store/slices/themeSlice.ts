import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { lightTheme, darkTheme, Theme } from '../../utils/theme';

interface ThemeState {
  isDarkMode: boolean;
  theme: Theme;
}

const initialState: ThemeState = {
  isDarkMode: false,
  theme: lightTheme,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      state.theme = state.isDarkMode ? darkTheme : lightTheme;
    },
    setTheme: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      state.theme = action.payload ? darkTheme : lightTheme;
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer; 