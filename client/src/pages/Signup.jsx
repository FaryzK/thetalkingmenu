import React from "react";
import { Button } from "flowbite-react";
import SignupEmailPasswordForm from "../components/SignupEmailPasswordForm";
import GoogleOAuth from "../components/GoogleOAuth";

export default function Signup() {
  return (
    <div className="flex flex-1 items-start justify-center p-8 w-full bg-gray-900">
      {/* Center Container for Text and Form */}
      <div className="mt-[60px] flex flex-col  w-full max-w-5xl">
        {/* Text Section */}
        <div className="flex flex-col w-full mb-8 ">
          <h1 className="mt-[20px] mb-[20px] text-center  text-3xl bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent font-bold">
            Join The Talking Menu
          </h1>
        </div>

        {/* Sign-Up Form Section */}
        <div className="w-full max-w-md p-8 bg-white rounded-md shadow-md mx-auto">
          {/* Sign-Up Form */}

          <SignupEmailPasswordForm />

          {/* OR Divider */}
          <div className="flex items-center my-6">
            <hr className="w-full border-gray-300" />
            <span className="mx-4 text-gray-500">OR</span>
            <hr className="w-full border-gray-300" />
          </div>

          {/* Google Sign-Up Button */}
          <GoogleOAuth />

          {/* Already Have an Account Link */}
          <div className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <a
              href="/sign-in"
              className="text-purple-500 font-bold hover:underline"
            >
              SIGN IN
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
