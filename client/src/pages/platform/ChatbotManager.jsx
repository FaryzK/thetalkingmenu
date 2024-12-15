import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  fetchChatbots,
  updateChatbotStatus,
} from "../../redux/slices/platformControlPanelChatbotsSlice";

export default function ChatbotManager() {
  const dispatch = useDispatch();
  const { chatbots, loading, currentPage, totalPages } = useSelector(
    (state) => state.platformControlPanelChatbots
  );
  const [search, setSearch] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const fetchData = async (user) => {
      const token = await user.getIdToken();
      dispatch(fetchChatbots({ search, page: 1, token }));
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchData(user);
    });

    return () => unsubscribe();
  }, [search, dispatch]);

  const handleToggleStatus = async (chatbot) => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const token = await user.getIdToken();
    const newStatus = chatbot.status === "on" ? "off" : "on";

    try {
      await dispatch(
        updateChatbotStatus({
          restaurantId: chatbot.restaurantId,
          status: newStatus,
          token,
        })
      );
    } catch (error) {
      console.error("Failed to update chatbot status", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Chatbot Manager</h1>

      <input
        type="text"
        placeholder="Search Chatbots..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="p-2 border border-gray-300 rounded my-4 w-full"
      />

      {loading && <p>Loading...</p>}

      <ul>
        {chatbots.map((chatbot) => (
          <li key={chatbot._id} className="p-4 border-b">
            <h2 className="font-bold">{chatbot.restaurantName}</h2>
            <p>Status: {chatbot.status}</p>
            <button
              onClick={() => handleToggleStatus(chatbot)}
              className={`p-2 rounded ${
                chatbot.status === "on" ? "bg-red-500" : "bg-green-500"
              } text-white`}
            >
              Turn {chatbot.status === "on" ? "Off" : "On"}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex space-x-2">
        {[...Array(totalPages).keys()].map((i) => (
          <button
            key={i}
            onClick={() => dispatch(fetchChatbots({ search, page: i + 1 }))}
            className={`p-2 ${
              currentPage === i + 1 ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
