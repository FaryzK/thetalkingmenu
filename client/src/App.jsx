import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Dashboards from "./pages/Dashboards";
import Dashboard from "./pages/Dashboard";
import Header from "./components/Header";
import ResetPassword from "./pages/ResetPassword";
import PlatformControlPanel from "./pages/platform/PlatformControlPanel.jsx";
import RestaurantManager from "./pages/platform/RestaurantManager";
import {
  dashboardAllowedRoles,
  platformControlPanelAllowedRoles,
} from "./utils/allowedRoles";
import Restaurant from "./pages/Restaurant";
import Menu from "./pages/Menu";
import MenuItem from "./pages/MenuItem";
import MenuAddItem from "./pages/MenuAddItem";
import QRCode from "./pages/QRCode";
import SystemPrompt from "./pages/SystemPrompt";
import SuggestedQuestions from "./pages/SuggestedQuestions";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployeeAccessOverview from "./pages/EmployeeAccessOverview";
import EmployeeAccessAdd from "./pages/EmployeeAccessAdd.jsx";
import EmployeeAccessRevoke from "./pages/EmployeeAccessRevoke.jsx";
import RestaurantInfo from "./pages/RestaurantInfo.jsx";
import GlobalSystemPromptManager from "./pages/platform/GlobalSystemPromptManager.jsx";
import DashboardManager from "./pages/platform/DashboardManager.jsx";
import ChatbotManager from "./pages/platform/ChatbotManager.jsx";
import RestaurantChats from "./pages/RestaurantChats.jsx";
import TermsOfUse from "./pages/TermsOfUse.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import { Outlet } from "react-router-dom";
import ChatManager from "./pages/platform/ChatManager.jsx";
import UserManager from "./pages/platform/UserManager.jsx";
import Unauthorized from "./pages/Unauthorised.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

const PageLayout = () => {
  return (
    <div className="min-h-screen flex flex-col pt-14">
      {/* min-h-screen ensures it spans the full viewport height */}
      <Outlet />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route element={<PageLayout />}>
          <Route
            path="/restaurant/:restaurantId/chat/:tableNumber/8921b963-7e0e-4511-a160-7c9149a5f077"
            element={<Chat />}
          />
          <Route
            path="/restaurant/:restaurantId/chat/:tableNumber"
            element={<Chat />}
          />
          <Route
            path="/restaurant/:restaurantId/chat/:tableNumber/:chat_id"
            element={<Chat />}
          />
          <Route path="/" element={<Home />} />
          <Route path="/sign-in" element={<Signin />} />
          <Route path="/sign-up" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/dashboards" element={<Dashboards />} />

          <Route path="/unauthorized" element={<Unauthorized />} />
          {/* Protect the /dashboards route with dashboardAllowedRoles */}
          <Route
            element={<ProtectedRoute allowedRoles={dashboardAllowedRoles} />}
          >
            <Route path="/dashboards/:dashboardId" element={<Dashboard />} />
            <Route
              path="/dashboards/:dashboardId/restaurant/:restaurantId"
              element={<Restaurant />}
            />
            <Route
              path="/dashboards/:dashboardId/restaurant/:restaurantId/menu"
              element={<Menu />}
            />
            <Route
              path="/dashboards/:dashboardId/restaurant/:restaurantId/menu/:itemId"
              element={<MenuItem />}
            />
            <Route
              path="/dashboards/:dashboardId/restaurant/:restaurantId/menu/add"
              element={<MenuAddItem />}
            />
            <Route
              path="/dashboards/:dashboardId/restaurant/:restaurantId/qrcode"
              element={<QRCode />}
            />
            <Route
              path="/dashboards/:dashboardId/restaurant/:restaurantId/system-prompt"
              element={<SystemPrompt />}
            />
            <Route
              path="/dashboards/:dashboardId/restaurant/:restaurantId/suggested-questions"
              element={<SuggestedQuestions />}
            />
            <Route
              path="/dashboards/:dashboardId/restaurant/:restaurantId/employee-access"
              element={<EmployeeAccessOverview />}
            />
            <Route
              path="/dashboards/:dashboardId/restaurant/:restaurantId/employee-access-add"
              element={<EmployeeAccessAdd />}
            />
            <Route
              path="/dashboards/:dashboardId/restaurant/:restaurantId/employee-access-revoke/:userId"
              element={<EmployeeAccessRevoke />}
            />
            <Route
              path="/dashboards/:dashboardId/restaurant/:restaurantId/info"
              element={<RestaurantInfo />}
            />
            <Route
              path="/dashboards/:dashboardId/restaurant/:restaurantId/chats"
              element={<RestaurantChats />}
            />
          </Route>
          {/* Protect the route with platformControlPanelAllowedRoles  */}
          <Route
            element={
              <ProtectedRoute allowedRoles={platformControlPanelAllowedRoles} />
            }
          >
            <Route
              path="/platform-control-panel"
              element={<PlatformControlPanel />}
            />
            <Route path="/restaurant-manager" element={<RestaurantManager />} />
            <Route
              path="/global-system-prompt"
              element={<GlobalSystemPromptManager />}
            />
            <Route path="/dashboard-manager" element={<DashboardManager />} />
            <Route
              path="/:dashboardId/:restaurantId/chat-manager"
              element={<ChatManager />}
            />
            <Route path="/dashboard-manager" element={<DashboardManager />} />
            <Route path="/user-manager" element={<UserManager />} />
            <Route path="/chatbot-manager" element={<ChatbotManager />} />
            {/* Catch-all 404 page */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
