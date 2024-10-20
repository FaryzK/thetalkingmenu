import React from "react";
import { Button } from "flowbite-react";
import SigninEmailPasswordForm from "../components/SigninEmailPasswordForm";
import GoogleOAuth from "../components/GoogleOAuth";
import ResetPassword from "./ResetPassword";
import SigninResetPassword from "../components/SigninResetPassword";

export default function Signin() {
  return (
    <div className="flex items-start justify-center p-8 w-full h-screen bg-gray-900">
      {/* Center Container for Text and Form */}
      <div className="mt-[60px] flex flex-col lg:flex-row items-start lg:items-start lg:space-x-12 w-full max-w-5xl">
        {/* Text Section */}
        <div className="flex flex-col w-full lg:w-1/2 mb-8 lg:mb-0">
          <h1 className="mt-[20px] mb-[20px] text-center lg:text-left text-3xl bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent font-bold">
            The Talking Menu
          </h1>
          <p className="text-white text-center lg:text-left">
            Let your customers experience a personalised dining experience in
            your restaurant by experiencing an AI-powered dining companion that
            lets them chat with your menu, discover chef insights, and find
            dishes tailored to their dietary needs—all in one platform.
          </p>
        </div>

        {/* Sign-In Form Section */}
        <div className="w-full lg:w-1/2 max-w-md p-8 bg-white rounded-md shadow-md mx-auto">
          {/* Email and Password Form */}
          <SigninEmailPasswordForm />

          {/* OR Divider */}
          <div className="flex items-center my-6">
            <hr className="w-full border-gray-300" />
            <span className="mx-4 text-gray-500">OR</span>
            <hr className="w-full border-gray-300" />
          </div>

          {/* Google Login Button */}
          <GoogleOAuth />

          {/* Create New Account Link */}
          <div className="text-center mt-6 text-gray-600">
            Don’t have an account?{" "}
            <a href="/sign-up" className="text-purple-500 hover:underline">
              Create Account
            </a>
          </div>
          {/* Reset password */}
          <div>
            <SigninResetPassword />
          </div>
        </div>
      </div>
    </div>
  );
}
