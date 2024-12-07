import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, Button, Dropdown, Navbar } from "flowbite-react";
import React from "react";
import thetalkingmenulogo from "../assets/thetalkingmenulogo.png";
import { useSelector, useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { signOutSuccess } from "../redux/slices/userSlice";
import {
  dashboardAllowedRoles,
  platformControlPanelAllowedRoles,
} from "../utils/allowedRoles"; // Import allowed roles

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const userRoles = currentUser?.roles || [];

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const path = useLocation().pathname;

  const handleSignOut = async () => {
    try {
      await signOut(auth); // Sign out the user from Firebase
      dispatch(signOutSuccess()); // Dispatch an action to update Redux state
      navigate("/");
    } catch (error) {
      console.log("Error signing out: ", error);
    }
  };

  // Define roles that are allowed to see the dashboards
  const canViewDashboards = userRoles.some((role) =>
    dashboardAllowedRoles.includes(role)
  );

  // Define roles that are allowed to see the dashboards
  const canViewPlatformControlPanel = userRoles.some((role) =>
    platformControlPanelAllowedRoles.includes(role)
  );

  // Handle navigation based on roles when clicking the Navbar.Brand
  const handleBrandClick = () => {
    if (canViewDashboards) {
      navigate("/dashboards");
    } else {
      navigate("/");
    }
  };

  return (
    <Navbar className="bg-gray-900 fixed top-0 w-full z-50" fluid>
      <Navbar.Brand
        onClick={handleBrandClick} // Replacing href with onClick handler
        style={{ cursor: "pointer" }} // Make the brand clickable
      >
        <img
          src={thetalkingmenulogo}
          className="mr-3 h-6 sm:h-9"
          alt="The Talking Menu Logo"
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-400">
          The Talking Menu
        </span>
      </Navbar.Brand>

      <div className="flex md:order-2">
        {currentUser ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                alt="User settings"
                img={
                  currentUser?.profilePicture ||
                  "https://cdn-icons-png.flaticon.com/512/17492/17492071.png"
                }
                rounded
              />
            }
          >
            {/* Add this line to log the URL */}
            <Dropdown.Header>
              <span className="block text-sm">{currentUser?.username}</span>
              <span className="block truncate text-sm font-medium">
                {currentUser?.email}
              </span>
            </Dropdown.Header>
            {canViewPlatformControlPanel && (
              <Dropdown.Item
                onClick={() => navigate("/platform-control-panel")}
              >
                Admin
              </Dropdown.Item>
            )}
            {canViewDashboards && (
              <Dropdown.Item onClick={() => navigate("/dashboards")}>
                Dashboard
              </Dropdown.Item>
            )}
            <Dropdown.Item onClick={handleSignOut}>Sign out</Dropdown.Item>
          </Dropdown>
        ) : (
          <Link
            to="/sign-in"
            state={{ referrer: location.pathname }} // Pass current location as referrer
          >
            <Button gradientDuoTone="purpleToBlue">Sign in</Button>
          </Link>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link href="/" active={path === "/"}>
          Home
        </Navbar.Link>
        <Navbar.Link href="/terms-of-use" active={path === "/terms-of-use"}>
          Terms of Use
        </Navbar.Link>
        <Navbar.Link href="/privacy-policy" active={path === "/privacy-policy"}>
          Privacy Policy
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
