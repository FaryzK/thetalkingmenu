import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, Button, Dropdown, Navbar } from "flowbite-react";
import React from "react";
import thetalkingmenulogo from "../assets/thetalkingmenulogo.png";
import { useSelector, useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { signOutSuccess } from "../redux/user/userSlice";
import { dashboardAllowedRoles } from "../utils/allowedRoles"; // Import allowed roles

export default function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const userRoles = currentUser?.user?.roles || [];

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const path = useLocation().pathname;

  const handleSignOut = async () => {
    try {
      await signOut(auth); // Sign out the user from Firebase
      dispatch(signOutSuccess()); // Dispatch an action to update Redux state
      navigate("/sign-in");
    } catch (error) {
      console.log("Error signing out: ", error);
    }
  };

  // Define roles that are allowed to see the dashboards
  const canViewDashboards = userRoles.some((role) =>
    dashboardAllowedRoles.includes(role)
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
    <Navbar className="bg-gray-900" fluid>
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
                  currentUser?.user?.profilePicture ||
                  "https://cdn-icons-png.flaticon.com/512/17492/17492071.png"
                }
                rounded
              />
            }
          >
            {console.log(currentUser?.user?.profilePicture)}{" "}
            {/* Add this line to log the URL */}
            <Dropdown.Header>
              <span className="block text-sm">
                {currentUser?.user?.username}
              </span>
              <span className="block truncate text-sm font-medium">
                {currentUser?.user?.email}
              </span>
            </Dropdown.Header>
            {canViewDashboards && (
              <Dropdown.Item onClick={() => navigate("/dashboards")}>
                Dashboards
              </Dropdown.Item>
            )}
            <Dropdown.Item onClick={handleSignOut}>Sign out</Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to="/sign-in">
            <Button gradientDuoTone="purpleToBlue">Sign in</Button>
          </Link>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link href="/" active={path === "/"}>
          Home
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
}
