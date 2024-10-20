import React, { useState } from "react";
import { Button, Alert, Spinner } from "flowbite-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { useDispatch, useSelector } from "react-redux"; // Import useDispatch and useSelector
import {
  resetStart,
  resetSuccess,
  resetFailure,
} from "../redux/user/userSlice.js";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch(); // Initialize dispatch
  const { loading, error } = useSelector((state) => state.user); // Get loading and error state from Redux store
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear any previous messages

    // Dispatch resetStart to indicate the process is starting
    dispatch(resetStart());

    try {
      // Send the password reset email using Firebase
      await sendPasswordResetEmail(auth, email);

      // Dispatch resetSuccess when the email is successfully sent
      dispatch(resetSuccess());

      setMessage("Password reset email sent. Please check your inbox.");

      // Redirect to sign-in page after a delay
      setTimeout(() => {
        navigate("/sign-in");
      }, 3000); // 3-second delay before navigating back
    } catch (error) {
      // Dispatch resetFailure in case of any errors
      dispatch(resetFailure(error.message));
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-white rounded-md shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Forgot Password
        </h2>
        {message && <Alert color="success">{message}</Alert>}
        {error && <Alert color="failure">{error}</Alert>}
        <form onSubmit={handlePasswordReset} className="mt-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500"
            required
          />
          <Button
            type="submit"
            gradientDuoTone="purpleToPink"
            className="w-full mt-4"
            disabled={loading} // Disable the button while loading
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                <span className="pl-3"> Sending Reset Link...</span>
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
        {message && (
          <p className="text-center mt-4 text-gray-500">
            Redirecting to sign-in page...
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
