import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import dashboardsReducer from "./slices/dashboardsSlice";
import restaurantReducer from "./slices/restaurantSlice";
import menuReducer from "./slices/menuSlice"; // Import menuReducer
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import chatBotReducer from "./slices/chatBotSlice";
import userAccessReducer from "./slices/userAccessSlice";
import platformControlPanelRestaurantsReducer from "./slices/platformControlPanelRestaurantsSlice";

const rootReducer = combineReducers({
  user: userReducer,
  dashboards: dashboardsReducer,
  restaurant: restaurantReducer,
  menu: menuReducer,
  chatBot: chatBotReducer,
  userAccess: userAccessReducer,
  platformControlPanelRestaurants: platformControlPanelRestaurantsReducer,
});

const persistConfig = {
  key: "root",
  storage,
  version: 1,
  blacklist: [
    "dashboards",
    "restaurant",
    "menu",
    "chatBot",
    "platformControlPanelRestaurants",
  ], // Exclude from persistence
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
