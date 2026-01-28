import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer, { AuthState, setPhone, setUserId } from "./auth";
import appReducer, {
  AppState,
  addItemToCart,
  removeFromCart,
  setToken,
  updateCartItemQty,
} from "./app";
import flashingReducer, { FlashingState } from "./flashings";
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
} from "redux-persist";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";

const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: string) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

const storage =
  typeof window !== "undefined"
    ? createWebStorage("local")
    : createNoopStorage();

export const store = configureStore({
  reducer: persistReducer(
    {
      key: "pova",
      storage: storage,
    },
    combineReducers({
      auth: authReducer,
      app: appReducer,
      flashing: flashingReducer,
    }),
  ),
  devTools:
    process.env.NODE_ENV !== "production"
      ? {
          name: "Pova",
          actionCreators: {
            setToken,
            addItemToCart,
            removeFromCart,
            updateCartItemQty,
            setPhone,
            setUserId,
          },
        }
      : false,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export type RootState = {
  app: AppState;
  auth: AuthState;
  flashing: FlashingState;
};
export type AppDispatch = typeof store.dispatch;
