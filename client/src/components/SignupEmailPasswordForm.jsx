import React, { useState } from "react";
import { Button, Alert, Spinner } from "flowbite-react";
import { auth } from "../firebase"; // Ensure this path matches your firebase.js
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const SignupEmailPasswordForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.trim(), // Ensure the data is trimmed
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          username: formData.name,
          email: formData.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }
      console.log("User signed up:", user);
      setLoading(false);
      if (res.ok) {
        navigate("/sign-in");
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="flex flex-col space-y-4">
      {error && <Alert color="failure">{error}</Alert>}
      <input
        type="text"
        placeholder="Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500"
        required
      />

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

      <input
        type="password"
        placeholder="Confirm Password"
        name="confirmPassword"
        value={formData.confirmPassword}
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
          "Sign Up"
        )}
      </Button>
    </form>
  );
};

export default SignupEmailPasswordForm;
