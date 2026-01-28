"use client";

import { store } from "@/redux";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import Loader from "../Loader";

type Props = {
  children: React.ReactNode;
};

const persistor = persistStore(store);

export default function ReduxProvider({ children }: Props) {
  return (
    <Provider store={store}>
      <PersistGate
        persistor={persistor}
        loading={
          <div className="w-screen h-screen !h-[100svh] flex items-center justify-center">
            <Loader size={50} />
          </div>
        }
      >
        {children}
      </PersistGate>
    </Provider>
  );
}
