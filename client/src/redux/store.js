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
import platformControlPanelChatsReducer from "./slices/platformControlPanelChatsSlice";
import chatReducer from "./slices/chatSlice";
import restaurantChatsReducer from "./slices/restaurantChatsSlice";
import restaurantAnalyticsReducer from "./slices/restaurantAnalyticsSlice";

const rootReducer = combineReducers({
  user: userReducer,
  dashboards: dashboardsReducer,
  restaurant: restaurantReducer,
  menu: menuReducer,
  chatBot: chatBotReducer,
  userAccess: userAccessReducer,
  platformControlPanelRestaurants: platformControlPanelRestaurantsReducer,
  platformControlPanelChats: platformControlPanelChatsReducer,
  chat: chatReducer,
  restaurantChats: restaurantChatsReducer,
  restaurantAnalytics: restaurantAnalyticsReducer,
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
    "platformControlPanelChats",
    "chat",
    "restaurantChats",
    "restaurantAnalytics",
  ], // Exclude from persistence
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
