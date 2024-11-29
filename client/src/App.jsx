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
import RestaurantChats from "./pages/RestaurantChats.jsx";
import Test from "./pages/Test.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<Test />} />
        <Route path="/sign-in" element={<Signin />} />
        <Route path="/sign-up" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/restaurant/:restaurantId/chat" element={<Chat />} />
        <Route
          path="/restaurant/:restaurantId/chat/:chat_id"
          element={<Chat />}
        />

        {/* Protect the /dashboards route with dashboardAllowedRoles */}
        <Route
          element={<ProtectedRoute allowedRoles={dashboardAllowedRoles} />}
        >
          <Route path="/dashboards" element={<Dashboards />} />
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
