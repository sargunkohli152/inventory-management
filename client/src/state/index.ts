import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface InitialStateTypes {
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  authError: string | null;
}

const initialState: InitialStateTypes = {
  isSidebarCollapsed: false,
  isDarkMode: false,
  isAuthenticated: false,
  accessToken: null,
  authError: null,
};

export const globalSlice = createSlice({
  name: 'global',
  initialState,
  reducers: {
    setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.isSidebarCollapsed = action.payload;
    },
    setIsDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
    },
    setAuth: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.authError = null;
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.authError = action.payload;
      state.isAuthenticated = false;
      state.accessToken = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.authError = null;
    },
  },
});

export const { setIsSidebarCollapsed, setIsDarkMode, setAuth, setAuthError, logout } =
  globalSlice.actions;

export default globalSlice.reducer;
