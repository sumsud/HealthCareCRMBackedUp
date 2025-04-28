import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ThemeConfig } from '@shared/types';

interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  config: ThemeConfig;
}

const defaultLightConfig: ThemeConfig = {
  primaryColor: 'hsl(201, 96%, 32%)',
  secondaryColor: 'hsl(199, 89%, 48%)',
  accentColor: 'hsl(199, 84%, 33%)',
  backgroundColor: 'hsl(0, 0%, 100%)',
  textColor: 'hsl(222.2, 84%, 4.9%)',
  fontSize: 'medium'
};

const defaultDarkConfig: ThemeConfig = {
  primaryColor: 'hsl(201, 96%, 32%)',
  secondaryColor: 'hsl(199, 89%, 48%)',
  accentColor: 'hsl(199, 84%, 33%)',
  backgroundColor: 'hsl(225, 29%, 12%)',
  textColor: 'hsl(210, 40%, 98%)',
  fontSize: 'medium'
};

// Get initial theme from localStorage or system preference
const getInitialTheme = (): 'light' | 'dark' | 'system' => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('careflow-theme');
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
      return savedTheme;
    }
  }
  return 'system';
};

// Get initial config
const getInitialConfig = (): ThemeConfig => {
  if (typeof window !== 'undefined') {
    const savedConfig = localStorage.getItem('careflow-theme-config');
    if (savedConfig) {
      try {
        return JSON.parse(savedConfig);
      } catch (e) {
        console.error('Failed to parse theme config from localStorage');
      }
    }
  }
  
  const initialTheme = getInitialTheme();
  if (initialTheme === 'dark') {
    return defaultDarkConfig;
  }
  return defaultLightConfig;
};

const initialState: ThemeState = {
  mode: getInitialTheme(),
  config: getInitialConfig()
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.mode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('careflow-theme', action.payload);
      }
    },
    setThemeConfig: (state, action: PayloadAction<Partial<ThemeConfig>>) => {
      state.config = { ...state.config, ...action.payload };
      if (typeof window !== 'undefined') {
        localStorage.setItem('careflow-theme-config', JSON.stringify(state.config));
      }
    },
    resetThemeConfig: (state) => {
      state.config = state.mode === 'dark' ? defaultDarkConfig : defaultLightConfig;
      if (typeof window !== 'undefined') {
        localStorage.setItem('careflow-theme-config', JSON.stringify(state.config));
      }
    }
  }
});

export const { setThemeMode, setThemeConfig, resetThemeConfig } = themeSlice.actions;
export default themeSlice.reducer;
