import React from "react";
import { Button } from "flowbite-react";

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
            Experience an AI-powered dining companion that lets you chat with
            your menu, discover chef insights, and find dishes tailored to your
            dietary needs—all in one platform.
          </p>
        </div>

        {/* Sign-In Form Section */}
        <div className="w-full lg:w-1/2 max-w-md p-8 bg-white rounded-md shadow-md mx-auto">
          {/* Email and Password Form */}
          <form className="flex flex-col space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-purple-500"
              required
            />
            <Button
              type="submit"
              gradientDuoTone="purpleToPink"
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          {/* OR Divider */}
          <div className="flex items-center my-6">
            <hr className="w-full border-gray-300" />
            <span className="mx-4 text-gray-500">OR</span>
            <hr className="w-full border-gray-300" />
          </div>

          {/* Google Login Button */}
          <Button gradientDuoTone="purpleToPink" className="w-full">
            Sign In with Google
          </Button>

          {/* Create New Account Link */}
          <div className="text-center mt-6 text-gray-600">
            Don’t have an account?{" "}
            <a
              href="/sign-up"
              className="text-purple-500 font-bold hover:underline"
            >
              CREATE NEW ACCOUNT
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
