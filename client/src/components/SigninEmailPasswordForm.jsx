import React, { useState } from "react";
import { Button, Alert, Spinner } from "flowbite-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { dashboardAllowedRoles } from "../utils/allowedRoles"; // Import the allowed roles list

const SigninEmailPasswordForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.trim(),
    });
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    dispatch(signInStart());

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        dispatch(signInSuccess(data));

        // Check if the user's roles include any allowed role
        const userRoles = data.user.roles || [];
        const hasAllowedRole = userRoles.some((role) =>
          dashboardAllowedRoles.includes(role)
        );

        if (hasAllowedRole) {
          navigate("/dashboards"); // Navigate to dashboard if user has allowed roles
        } else {
          navigate("/"); // Navigate to home page otherwise
        }
      }
      console.log("User signed in:", data);
    } catch (error) {
      dispatch(signInFailure(error.message));
      console.error("Sign-in error:", error);
    }
  };

  return (
    <form onSubmit={handleSignin} className="flex flex-col space-y-4">
      {error && <Alert color="failure">{error}</Alert>}

      <input
        type="email"
        placeholder="Email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500"
        required
      />

      <input
        type="password"
        placeholder="Password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500"
        required
      />

      <Button
        type="submit"
        gradientDuoTone="purpleToPink"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <>
            <Spinner size="sm" />
            <span className="pl-3"> Loading...</span>
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
};

export default SigninEmailPasswordForm;
