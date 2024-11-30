import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  clearMessages,
  addMessage,
  setMessages,
  startNewChat,
  setChatId,
} from "../redux/slices/chatSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ReactMarkdown from "react-markdown";

export default function Chat() {
  const { restaurantId, chat_id } = useParams();
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [tempAssistantMessage, setTempAssistantMessage] = useState("");
  const [info, setInfo] = useState({
    restaurantName: "",
    restaurantLogo: "",
    suggestedQuestions: [],
  });
  const [showInfo, setShowInfo] = useState(true); // Controls visibility of intro

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
    fetch(`/api/chatbot/${restaurantId}/info`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        setInfo(data);
      })
      .catch((error) => console.error("Error fetching info:", error));
  }, [restaurantId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tempAssistantMessage]);

  // if we are calling an existing chat
  useEffect(() => {
    if (chat_id) {
      // Fetch existing chat
      dispatch(clearMessages());
      fetch(`/api/chat/${chat_id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch chat data");
          }
          return response.json();
        })
        .then((data) => {
          dispatch(setChatId(data.chatId)); // Set the chatId in Redux
          dispatch(clearMessages()); // Clear existing messages (optional, if needed)
          dispatch(
            setMessages(
              data.messages.map((message) => ({
                role: message.sender,
                content: message.message,
                timestamp: message.timestamp,
              }))
            )
          );
        })
        .catch((error) => console.error("Error fetching chat:", error));
    }
  }, [chat_id, dispatch]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    setShowInfo(false); // Hide intro after first message
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

  const handleSuggestedQuestion = async (question) => {
    setShowInfo(false); // Hide the intro immediately
    dispatch(addMessage({ role: "user", content: question })); // Add the question to the messages
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
        message: question,
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
        {showInfo && (
          <div className="text-center space-y-4 p-4 bg-gray-800 rounded-lg mb-4">
            <img
              src={info.restaurantLogo}
              alt={info.restaurantName}
              className="w-20 h-20 mx-auto rounded-full"
            />
            <h2 className="text-lg font-semibold">{info.restaurantName}</h2>
            <div className="flex flex-wrap gap-2 justify-center">
              {info.suggestedQuestions.map((question, index) => {
                // Extract plain text from Draft.js content
                const plainText = question.blocks
                  .map((block) => block.text)
                  .join(" ");
                return (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(plainText)}
                    className="px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600"
                  >
                    {plainText}
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // Prevent default behavior (like adding a new line in a textarea)
                handleSendMessage(); // Call the send message function
              }
            }}
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
