import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchChatBot, updateSystemPrompt } from "../redux/slices/chatBotSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Accordion, Alert } from "flowbite-react";
import { FiArrowLeft } from "react-icons/fi";
import { Button } from "flowbite-react";

export default function SystemPrompt() {
  const { restaurantId, dashboardId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    data: chatBot,
    status,
    error,
  } = useSelector((state) => state.chatBot);
  const [systemPrompt, setSystemPrompt] = useState(chatBot?.systemPrompt || "");
  const [successMessage, setSuccessMessage] = useState("");

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
    try {
      await dispatch(
        updateSystemPrompt({ token, restaurantId, systemPrompt })
      ).unwrap();
      setSuccessMessage("Prompt updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000); // Clear success message after 3 seconds
    } catch (error) {
      setSuccessMessage("Failed to update prompt. Please try again.");
    }
  };

  return (
    <div className="bg-gray-100 p-6">
      {/* Back Button */}
      <button
        onClick={() =>
          navigate(`/dashboards/${dashboardId}/restaurant/${restaurantId}`)
        }
        className="mb-4 flex items-center text-blue-500 hover:underline"
      >
        <FiArrowLeft className="mr-2" />
        Back to Dashboard
      </button>

      <h2 className="text-2xl font-bold mb-4">Update Knowledgebase</h2>

      {/* Reserved Space for Success/Error Notification */}
      <div className="mb-4">
        <div className="min-h-[60px]">
          {successMessage && (
            <Alert
              color={
                successMessage.includes("successfully") ? "success" : "failure"
              }
            >
              {successMessage}
            </Alert>
          )}
        </div>
      </div>

      {/* Accordion */}
      <Accordion collapseAll>
        <Accordion.Panel>
          <Accordion.Title>
            What kinds of information goes into knowledgebase?
          </Accordion.Title>
          <Accordion.Content>
            Information not found in the menu, such as opening hours,
            promotions, to additional instructions you want to provide, such as
            instructions to upsell without being pushy.
          </Accordion.Content>
        </Accordion.Panel>
      </Accordion>

      {/* Textarea for System Prompt */}
      <div className="mt-6">
        <label
          htmlFor="systemPrompt"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          FAQ and other information / instructions
        </label>
        <textarea
          id="systemPrompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="17"
        />
      </div>

      {/* Update Button */}
      <Button
        onClick={handleUpdate}
        color="blue"
        className="mt-4 font-semibold rounded transition"
      >
        Update Knowledgebase
      </Button>
    </div>
  );
}
