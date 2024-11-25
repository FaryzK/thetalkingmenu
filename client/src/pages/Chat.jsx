import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { addMessage, startNewChat, setChatId } from "../redux/slices/chatSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ReactMarkdown from "react-markdown";

export default function Chat() {
  const { restaurantId } = useParams();
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [tempAssistantMessage, setTempAssistantMessage] = useState("");
  const messages = useSelector((state) => state.chat.messages);
  const chatId = useSelector((state) => state.chat.chatId);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tempAssistantMessage]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    dispatch(addMessage({ role: "user", content: input }));
    setInput("");
    let currentChatId = chatId;
    if (!currentChatId) {
      const startChatResponse = await dispatch(
        startNewChat({ restaurantId, userId })
      );
      currentChatId = startChatResponse.payload.chatId;
      dispatch(setChatId(currentChatId));
    }
    fetch(`/api/chat/send-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        restaurantId,
        userId,
        message: input,
        chatId: currentChatId,
      }),
    })
      .then((response) => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantMessage = "";
        function readChunk() {
          reader.read().then(({ done, value }) => {
            if (done) {
              dispatch(
                addMessage({ role: "assistant", content: assistantMessage })
              );
              setTempAssistantMessage("");
              return;
            }
            const chunk = decoder.decode(value);
            assistantMessage += chunk;
            setTempAssistantMessage(assistantMessage);
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
    <div className="flex justify-center bg-gray-900 text-white h-screen p-6 pt-20">
      <div className="flex flex-col w-full max-w-3xl h-full">
        <div className="flex-grow overflow-y-auto space-y-4 pr-4 mb-4 scrollbar-hide">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={
                msg.role === "user"
                  ? "flex justify-end"
                  : "flex justify-start w-full"
              }
            >
              <div
                className={`${
                  msg.role === "user"
                    ? "bg-gray-800 text-white max-w-xl"
                    : "markdown bg-transparent text-gray-200 w-full"
                } px-4 py-2 ${
                  msg.content.length < 50 ? "rounded-full" : "rounded-2xl"
                }`}
              >
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {tempAssistantMessage && (
            <div className="flex justify-start w-full">
              <div className="markdown bg-transparent text-gray-200 p-4 w-full">
                <ReactMarkdown>{tempAssistantMessage}</ReactMarkdown>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex items-center space-x-2 p-4 bg-gray-800 rounded-lg sticky bottom-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
            className="flex-grow p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
