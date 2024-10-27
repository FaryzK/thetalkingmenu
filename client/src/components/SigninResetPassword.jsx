import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux"; // Import useDispatch
import { clearError } from "../redux/slices/userSlice"; // Import clearError action

export default function SigninResetPassword() {
  const dispatch = useDispatch();

  const handleResetPasswordClick = () => {
    dispatch(clearError()); // Clear the error when navigating to the reset password page
  };

  return (
    <div className="text-center mt-1 text-gray-600">
      <Link
        to="/reset-password"
        className="text-purple-500 hover:underline"
        onClick={handleResetPasswordClick} // Trigger the clearError action on click
      >
        Forgot Password?
      </Link>
    </div>
  );
}
