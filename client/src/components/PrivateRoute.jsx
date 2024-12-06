import React from "react";
import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

export default function PrivateRoute({ allowedRoles }) {
  const { currentUser } = useSelector((state) => state.user);
  const userRoles = currentUser?.user?.roles || [];

  // Check if the user has any of the allowed roles (case-insensitive)
  const hasAccess = userRoles.some((role) =>
    allowedRoles.some(
      (allowedRole) => allowedRole.toLowerCase() === role.toLowerCase()
    )
  );

  return hasAccess ? <Outlet /> : <Navigate to="/unauthorized" />;
}
