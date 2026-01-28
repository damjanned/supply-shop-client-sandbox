import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "..";

export type AuthState = {
  name?: string;
  phone?: string;
  userId?: string;
};

const authSlice = createSlice({
  name: "auth",
  initialState: {} as AuthState,
  reducers: {
    setPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    },
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
    resetAuth: () => ({}),
  },
});

export const { setPhone, setUserId, setName } = authSlice.actions;
export const selectDetails = (state: RootState) => state.auth;

export default authSlice.reducer;
