import React from "react";
import { Button } from "flowbite-react";

export default function Home() {
  const handleScheduleDemoClick = () => {
    window.open("https://forms.gle/o2voWRF4q5njiYXV6", "_blank");
  };

  return (
    <div className="flex flex-col items-center p-8 w-full h-screen bg-gray-900">
      <h1 className="text-center text-3xl mt-[60px] mb-[40px]">
        <strong className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
          Transform
        </strong>{" "}
        <strong className="text-white">
          Your Restaurant Experience with AI -
        </strong>{" "}
        <span className="text-white">
          Introducing the Smartest Way to Delight Your Customers!
        </span>
      </h1>
      <div className="w-full max-w-2xl">
        <div className="relative w-full h-0 pb-[56.25%]">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="Demo Preview"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
      <div className="mt-8">
        <Button
          onClick={handleScheduleDemoClick}
          size="xl"
          gradientDuoTone="purpleToPink"
          className="mb-8"
        >
          Schedule a Demo
        </Button>
      </div>
    </div>
  );
}
