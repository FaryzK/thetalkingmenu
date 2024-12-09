import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";
import { FaGhost } from "react-icons/fa";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="max-w-md text-center bg-white p-8 rounded-lg shadow-lg">
        <FaGhost className="text-7xl text-purple-500 mx-auto mb-4 animate-bounce" />
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          Boo! You Found a Ghost Page 👻
        </h1>
        <p className="text-gray-700 mb-6">
          This page doesn't exist (or maybe it vanished like a ghost). Either
          way, you're in spooky territory now. But don't worry, you can always
          find your way back.
        </p>
        <p className="text-gray-600 italic mb-8">
          (Psst… Most haunted places have cool treasures, but this one is
          just... empty.)
        </p>
        <div className="flex justify-center">
          <Button
            color="purple"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            👻 Escape the Haunting
          </Button>
        </div>
      </div>
    </div>
  );
}
