import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, Button, Dropdown, Navbar } from "flowbite-react";
import React from "react";
import thetalkingmenulogo from "../assets/thetalkingmenulogo.png";
import { useSelector, useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { signOutSuccess } from "../redux/user/userSlice";

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

  // Define roles that are allowed to see the dashboard
  const allowedRoles = [
    "restaurant admin",
    "restaurant main admin",
    "the talking menu admin",
  ];
  const canViewDashboard = userRoles.some((role) =>
    allowedRoles.includes(role)
  );

  return (
    <Navbar className="bg-gray-900" fluid>
      <Navbar.Brand href="/">
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
                img="https://cdn-icons-png.flaticon.com/512/17492/17492071.png"
                rounded
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">
                {currentUser?.user?.username}
              </span>
              <span className="block truncate text-sm font-medium">
                {currentUser?.user?.email}
              </span>
            </Dropdown.Header>
            {canViewDashboard && (
              <Dropdown.Item onClick={() => navigate("/dashboard")}>
                Dashboard
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
