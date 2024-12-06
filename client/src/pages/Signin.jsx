import React from "react";
import { useLocation } from "react-router-dom";
import { Button } from "flowbite-react";
import SigninEmailPasswordForm from "../components/SigninEmailPasswordForm";
import GoogleOAuth from "../components/GoogleOAuth";
import ResetPassword from "./ResetPassword";
import SigninResetPassword from "../components/SigninResetPassword";

export default function Signin() {
  const location = useLocation();
  const rawReferrer = location.state?.referrer;

  // Validate the referrer
  const isChatPage =
    rawReferrer?.startsWith("/restaurant/") && rawReferrer.includes("/chat/");
  const referrer = isChatPage ? rawReferrer : "/dashboards"; // Default to /dashboards if not a chat page

  return (
    <div className="flex flex-1 items-start justify-center p-8 w-full  bg-gray-900">
      {/* Center Container for Text and Form */}
      <div className="mt-[60px] flex flex-col  w-full max-w-5xl">
        {/* Text Section */}
        <div className="flex flex-col w-full  mb-8 ">
          <h1 className="mt-[20px] mb-[20px] text-center text-3xl bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent font-bold">
            The Talking Menu
          </h1>
        </div>

        {/* Sign-In Form Section */}
        <div className="w-full max-w-md p-8 bg-white rounded-md shadow-md mx-auto">
          {/* Email and Password Form */}
          <SigninEmailPasswordForm referrer={referrer} />

          {/* OR Divider */}
          <div className="flex items-center my-6">
            <hr className="w-full border-gray-300" />
            <span className="mx-4 text-gray-500">OR</span>
            <hr className="w-full border-gray-300" />
          </div>

          {/* Google Login Button */}
          <GoogleOAuth referrer={referrer} />

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
