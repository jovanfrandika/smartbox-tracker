import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { User } from '../../types';

type AuthState = {
  isLogin: boolean,
  user: User | null,
};

type setIsLoginPayload = PayloadAction<{
  isLogin: AuthState['isLogin'];
}>;

type setUserPayload = PayloadAction<{
  user: AuthState['user'];
}>;

const initialState: AuthState = {
  isLogin: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setIsLogin(state, action: setIsLoginPayload) {
      const { isLogin } = action.payload;

      return {
        ...state,
        isLogin,
      };
    },
    setUser(state, action: setUserPayload) {
      const { user } = action.payload;

      return {
        ...state,
        user,
      };
    },
  },
});

export const {
  setIsLogin,
  setUser,
} = authSlice.actions;

export default authSlice.reducer;
