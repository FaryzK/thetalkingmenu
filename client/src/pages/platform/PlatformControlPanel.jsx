import React from "react";
import { useNavigate } from "react-router-dom";

export default function PlatformControlPanel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Platform Control Panel
      </h1>
      <div className="space-y-4">
        <button
          onClick={() => navigate("/restaurant-manager")}
          className="w-full bg-blue-500 text-white py-2 rounded-lg shadow-md"
        >
          Restaurant Manager
        </button>
        <button
          onClick={() => navigate("/global-system-prompt")}
          className="w-full bg-blue-500 text-white py-2 rounded-lg shadow-md"
        >
          Global System Prompt Manager
        </button>
        <button
          onClick={() => navigate("/dashboard-manager")}
          className="w-full bg-blue-500 text-white py-2 rounded-lg shadow-md"
        >
          Dashboard Manager
        </button>
      </div>
    </div>
  );
}
