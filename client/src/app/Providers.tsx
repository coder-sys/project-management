"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { makeStore } from "./redux";
import { persistStore } from "redux-persist";
import { DarkModeProvider } from "@/context/DarkModeContext";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

const store = makeStore();
const persistor = persistStore(store);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DarkModeProvider>
            {children}
          </DarkModeProvider>
        </LocalizationProvider>
      </PersistGate>
    </Provider>
  );
}