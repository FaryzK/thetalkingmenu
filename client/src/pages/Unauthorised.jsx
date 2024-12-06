import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "flowbite-react";
import { GiSpikedFence } from "react-icons/gi";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className=" flex flex-col items-center justify-center bg-gray-50 p-6">
      <div className="max-w-md text-center bg-white p-8 rounded-lg shadow-lg">
        <GiSpikedFence className="text-6xl text-red-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Uh oh...</h1>
        <p className="text-gray-700 mb-6">
          It seems you've wandered into a place you don't belong. Normally, all
          our pages are well-mannered and buttoned-up, but this one—this one is
          here to give you a gentle, fancy-pants “Nope.”
        </p>
        <p className="text-gray-600 italic mb-8">
          (Don’t feel bad, we all love a good secret room. But trust us, this
          one isn’t as exciting as you’d hope.)
        </p>
        <div className="flex justify-center">
          <Button color="dark" onClick={() => navigate("/")}>
            Return to Safety
          </Button>
        </div>
      </div>
    </div>
  );
}
