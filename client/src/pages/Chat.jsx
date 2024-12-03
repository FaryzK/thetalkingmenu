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
        setInfo({
          restaurantName: data.restaurantName || "",
          restaurantLogo:
            data.restaurantLogo ||
            "https://cdn-icons-png.flaticon.com/512/4352/4352627.png", // Fallback to placeholder
          suggestedQuestions: data.suggestedQuestions || [],
        });
      })
      .catch((error) => console.error("Error fetching info:", error));
  }, [restaurantId]);

  // Scroll to the bottom whenever messages or assistant messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tempAssistantMessage]);

  // Adjust viewport height dynamically for mobile
  useEffect(() => {
    const updateVH = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };

    updateVH(); // Set on load
    window.addEventListener("resize", updateVH);

    return () => {
      window.removeEventListener("resize", updateVH);
    };
  }, []);

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

  const renderStyledQuestion = (question) => {
    return question.blocks.map((block, idx) => {
      const elements = [];
      let lastOffset = 0;

      const sortedRanges = block.inlineStyleRanges.sort(
        (a, b) => a.offset - b.offset
      );

      sortedRanges.forEach((range, rangeIndex) => {
        if (range.offset > lastOffset) {
          elements.push(
            <span key={`${idx}-${rangeIndex}-unstyled`}>
              {block.text.slice(lastOffset, range.offset)}
            </span>
          );
        }

        elements.push(
          <span
            key={`${idx}-${rangeIndex}-bold`}
            style={{
              fontWeight: range.style === "BOLD" ? "bold" : "normal",
            }}
          >
            {block.text.slice(range.offset, range.offset + range.length)}
          </span>
        );

        lastOffset = range.offset + range.length;
      });

      if (lastOffset < block.text.length) {
        elements.push(
          <span key={`${idx}-remaining-unstyled`}>
            {block.text.slice(lastOffset)}
          </span>
        );
      }

      return <p key={idx}>{elements}</p>;
    });
  };

  return (
    <div
      className="flex flex-col flex-1 justify-between bg-gray-900 text-white p-6"
      style={{ height: "calc(var(--vh, 1vh) * 100)" }} // Dynamically set height
    >
      <div className="flex flex-col w-full max-w-3xl mx-auto flex-1">
        {/* Messages Section */}
        <div className="flex-grow overflow-y-auto space-y-4 pr-4 scrollbar-hide">
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

        {/* Bottom Section Wrapper */}
        <div className="flex flex-col gap-4">
          {/* Suggested Questions Section */}
          {showInfo && (
            <div className="text-center space-y-4 p-4 rounded-lg">
              <img
                src={info.restaurantLogo}
                alt={info.restaurantName}
                className="w-20 h-20 mx-auto"
              />
              <h2 className="text-lg font-semibold">{info.restaurantName}</h2>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start max-w-xl mx-auto">
                {info.suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() =>
                      handleSuggestedQuestion(
                        question.blocks.map((block) => block.text).join(" ")
                      )
                    }
                    className="w-full md:w-[calc(50%-0.5rem)] px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 border border-white text-left"
                  >
                    {renderStyledQuestion(question)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chatbox Section */}
          <div className="flex items-center space-x-2 p-4 bg-gray-800 rounded-lg">
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
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
