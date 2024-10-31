import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import dashboardsReducer from "./slices/dashboardsSlice";
import restaurantReducer from "./slices/restaurantSlice";
import menuReducer from "./slices/menuSlice"; // Import menuReducer
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import chatBotReducer from "./slices/chatBotSlice";

const rootReducer = combineReducers({
  user: userReducer,
  dashboards: dashboardsReducer,
  restaurant: restaurantReducer,
  menu: menuReducer,
  chatBot: chatBotReducer,
});

const persistConfig = {
  key: "root",
  storage,
  version: 1,
  blacklist: ["dashboards", "restaurant", "menu", "chatBot"], // Exclude from persistence
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
