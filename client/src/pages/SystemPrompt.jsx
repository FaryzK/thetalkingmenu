import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchChatBot, updateSystemPrompt } from "../redux/slices/chatBotSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function SystemPrompt() {
  const { restaurantId } = useParams();
  const dispatch = useDispatch();
  const {
    data: chatBot,
    status,
    error,
  } = useSelector((state) => state.chatBot);
  const [systemPrompt, setSystemPrompt] = useState(chatBot?.systemPrompt || "");
  const [isAccordionOpen, setAccordionOpen] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchData = async () => {
          const token = await user.getIdToken();
          const result = await dispatch(
            fetchChatBot({ token, restaurantId })
          ).unwrap();
          if (result) setSystemPrompt(result.systemPrompt || "");
        };
        fetchData();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleUpdate = async () => {
    const auth = getAuth();
    const token = await auth.currentUser.getIdToken();
    dispatch(updateSystemPrompt({ token, restaurantId, systemPrompt }));
  };

  if (status === "loading") return <div>Loading...</div>;
  if (status === "failed") return <div>Error: {error}</div>;

  return (
    <div className="min-h-screen p-6">
      <h2 className="text-2xl font-bold mb-4">Update System Prompt</h2>

      {/* Accordion */}
      <div className="mb-4">
        <button
          onClick={() => setAccordionOpen(!isAccordionOpen)}
          className="flex items-center justify-between w-full bg-gray-100 p-3 rounded-md text-left focus:outline-none"
        >
          <span className="font-semibold">What is a prompt?</span>
          <span>{isAccordionOpen ? "-" : "+"}</span>
        </button>
        {isAccordionOpen && (
          <p className="p-4 bg-gray-50 rounded-b-md text-gray-700">
            A prompt is a set of instructions for the bot to understand how it
            needs to behave when responding to a customer.
          </p>
        )}
      </div>

      <textarea
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
        className="w-full p-2 border rounded mb-4"
        rows="6"
      />
      <button
        onClick={handleUpdate}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Update Prompt
      </button>
    </div>
  );
}
