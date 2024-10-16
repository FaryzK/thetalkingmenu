import React, { useState } from "react";
import { Button, Alert, Spinner } from "flowbite-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useDispatch, useSelector } from "react-redux";
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from "../redux/user/userSlice";

const SigninEmailPasswordForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { loading, error } = useSelector((state) => state.user);
  const dispatch = useDispatch();

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
      const user = userCredential.user;
      dispatch(signInSuccess(user));
      console.log("User signed in:", user);
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
