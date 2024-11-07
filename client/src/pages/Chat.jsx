import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { addMessage } from "../redux/slices/chatSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Chat() {
  const { restaurantId } = useParams();
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [tempAssistantMessage, setTempAssistantMessage] = useState(""); // Temporary state for streaming
  const messages = useSelector((state) => state.chat.messages);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
  }, []);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Optimistically add user message
    dispatch(addMessage({ role: "user", content: input }));
    setInput("");

    fetch(`/api/chat/send-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId, userId, message: input }),
    })
      .then((response) => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let assistantMessage = ""; // Collect the full response here

        // Process each chunk as it arrives
        function readChunk() {
          reader.read().then(({ done, value }) => {
            if (done) {
              // Dispatch full response to Redux once complete
              dispatch(
                addMessage({ role: "assistant", content: assistantMessage })
              );
              setTempAssistantMessage(""); // Clear temporary state
              return;
            }

            const chunk = decoder.decode(value);
            assistantMessage += chunk; // Accumulate the chunk
            setTempAssistantMessage(assistantMessage); // Update UI with accumulated response
            readChunk(); // Continue reading next chunk
          });
        }

        readChunk();
      })
      .catch((error) => {
        console.error("Error with streaming:", error);
      });
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <p
            key={index}
            className={msg.role === "user" ? "text-right" : "text-left"}
          >
            {msg.content}
          </p>
        ))}
        {/* Display the in-progress assistant message */}
        {tempAssistantMessage && (
          <p className="text-left">{tempAssistantMessage}</p>
        )}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message"
        className="border rounded p-2 w-full mt-4"
      />
      <button
        onClick={handleSendMessage}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Send
      </button>
    </div>
  );
}
