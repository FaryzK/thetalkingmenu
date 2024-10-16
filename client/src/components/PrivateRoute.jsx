import React from "react";
import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

export default function PrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  const userRoles = currentUser?.user?.roles || [];

  // Define the roles allowed to access the private routes
  const allowedRoles = [
    "restaurant admin",
    "restaurant main admin",
    "the talking menu admin",
  ];

  // Check if the user has any of the allowed roles (case-insensitive)
  const hasAccess = userRoles.some((role) =>
    allowedRoles.some(
      (allowedRole) => allowedRole.toLowerCase() === role.toLowerCase()
    )
  );

  return hasAccess ? <Outlet /> : <Navigate to="/sign-in" />;
}
