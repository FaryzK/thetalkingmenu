import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Dashboards from "./pages/Dashboards";
import Dashboard from "./pages/Dashboard";
import Header from "./components/Header";
import PrivateRoute from "./components/PrivateRoute";
import ResetPassword from "./pages/ResetPassword";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import {
  dashboardAllowedRoles,
  subscriptionManagementAllowedRoles,
} from "./utils/allowedRoles";
import Restaurant from "./pages/Restaurant";
import Menu from "./pages/Menu";
import MenuItem from "./pages/MenuItem";
import MenuAddItem from "./pages/MenuAddItem";
import QRCode from "./pages/QRCode";
import SystemPrompt from "./pages/SystemPrompt";
import SuggestedQuestions from "./pages/SuggestedQuestions";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in" element={<Signin />} />
        <Route path="/sign-up" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/chat" element={<Chat />} />

        {/* Protect the /dashboards route with dashboardAllowedRoles */}
        <Route element={<PrivateRoute allowedRoles={dashboardAllowedRoles} />}>
          <Route path="/dashboards" element={<Dashboards />} />
          <Route path="/dashboards/:dashboardId" element={<Dashboard />} />
          <Route
            path="/dashboard/:dashboardId/restaurant/:restaurantId"
            element={<Restaurant />}
          />
          <Route
            path="/dashboard/:dashboardId/restaurant/:restaurantId/menu"
            element={<Menu />}
          />
          <Route
            path="/dashboard/:dashboardId/restaurant/:restaurantId/menu/:itemId"
            element={<MenuItem />}
          />
          <Route
            path="/dashboard/:dashboardId/restaurant/:restaurantId/menu/add"
            element={<MenuAddItem />}
          />
          <Route
            path="/dashboard/:dashboardId/restaurant/:restaurantId/qrcode"
            element={<QRCode />}
          />
          <Route
            path="/dashboard/:dashboardId/restaurant/:restaurantId/system-prompt"
            element={<SystemPrompt />}
          />
          <Route
            path="/dashboard/:dashboardId/restaurant/:restaurantId/suggested-questions"
            element={<SuggestedQuestions />}
          />
        </Route>

        {/* Protect the /subscription-management route with subscriptionManagementAllowedRoles */}
        <Route
          element={
            <PrivateRoute allowedRoles={subscriptionManagementAllowedRoles} />
          }
        >
          <Route
            path="/subscription-management"
            element={<SubscriptionManagement />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
