import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { addMessage } from "../redux/slices/chatSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Chat() {
  const { restaurantId } = useParams();
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null); // Track userId if logged in
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

    // Optimistically display user message
    dispatch(addMessage({ role: "user", content: input }));
    setInput("");

    // Stream response with Fetch API and ReadableStream
    fetch(`/api/chat/send-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restaurantId, userId, message: input }),
    })
      .then((response) => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // Process streaming data chunks
        function readChunk() {
          reader.read().then(({ done, value }) => {
            if (done) {
              console.log("Stream finished.");
              return;
            }
            const chunk = decoder.decode(value);
            dispatch(addMessage({ role: "assistant", content: chunk }));
            readChunk();
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
