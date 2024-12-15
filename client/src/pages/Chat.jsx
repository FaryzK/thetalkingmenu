import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  clearMessages,
  addMessage,
  setMessages,
  startNewChat,
  setChatId,
} from "../redux/slices/chatSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import ReactMarkdown from "react-markdown";

import { Button, TextInput } from "flowbite-react";
import { AiOutlineSend, AiOutlineAudio } from "react-icons/ai";
import { MdMenuBook } from "react-icons/md"; // Menu Book Icon
import { FaUtensils } from "react-icons/fa"; // Fork and Spoon Icon
import { setSessionToken } from "../redux/slices/userSlice";
import { Alert } from "flowbite-react";

// Helper function to create or retrieve a session token
function getSessionToken() {
  let sessionToken = localStorage.getItem("session_token");
  if (!sessionToken) {
    sessionToken = crypto.randomUUID(); // Generate a unique session token
    localStorage.setItem("session_token", sessionToken);
  }
  return sessionToken;
}

// For speech to text
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

export default function Chat() {
  const { restaurantId, chat_id, tableNumber } = useParams();
  const [alertMessage, setAlertMessage] = useState("");
  const dispatch = useDispatch();
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0); // Track swipe distance
  const [timer, setTimer] = useState(0);
  const recognition = useRef(null);
  const startTime = useRef(null);
  const startX = useRef(null);
  const [userId, setUserId] = useState(null);
  const [tempAssistantMessage, setTempAssistantMessage] = useState("");
  const [info, setInfo] = useState({
    restaurantName: "",
    restaurantLogo: "",
    restaurantLocation: "",
    suggestedQuestions: [],
    menuLink: "",
    orderLink: "",
  });
  const [qrScanOnly, setQrScanOnly] = useState(false);
  const [showInfo, setShowInfo] = useState(true); // Controls visibility of intro

  const messages = useSelector((state) => state.chat.messages);
  const chatId = useSelector((state) => state.chat.chatId);
  const sessionToken = useSelector((state) => state.user.sessionToken);
  const [aiTyping, setAiTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!sessionToken) {
      const newSessionToken = getSessionToken();
      dispatch(setSessionToken(newSessionToken)); // 🟢 Dispatch the token to Redux store
    }
  }, [dispatch, sessionToken]);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) setUserId(user.uid);
      else setUserId(null);
    });
  }, []);

  useEffect(() => {
    // Automatically focus on the input field when the component loads
    if (inputRef.current) {
      inputRef.current.focus();
    }
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
          restaurantLocation: data.restaurantLocation || "",
          menuLink: data.menuLink || "",
          orderLink: data.orderLink || "",
        });

        // Set qrScanOnly directly from the API response
        setQrScanOnly(data.qrScanOnly || false);

        // If qrScanOnly is true, check the User-Agent to restrict access
        if (data.qrScanOnly) {
          checkUserAgent();
        }
      })
      .catch((error) => console.error("Error fetching info:", error));
  }, [restaurantId]);

  const checkUserAgent = () => {
    const userAgent = navigator.userAgent || "";
    const allowedUserAgents =
      /AppleWebKit\/605.1.15|Line|MicroMessenger|Android; Mobile|wv|Snapchat|Instagram/i;

    if (!allowedUserAgents.test(userAgent)) {
      setAlertMessage("Chat is only accessible via QR code");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, tempAssistantMessage]);

  // if we are calling an existing chat
  useEffect(() => {
    if (chat_id) {
      // Fetch existing chat
      dispatch(clearMessages());
      const sessionToken = getSessionToken(); // Get session token here

      fetch(`/api/chat/${chat_id}?tableNumber=${tableNumber}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken, // Attach session token here
        },
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
          const formattedMessages = data.messages.map((message) => ({
            role: message.sender,
            content: message.message,
            timestamp: message.timestamp,
          }));
          dispatch(setMessages(formattedMessages));

          // Hide the info if messages already exist
          if (formattedMessages.length > 0) {
            setShowInfo(false);
          }
        })
        .catch((error) => console.error("Error fetching chat:", error));
    }
  }, [chat_id, dispatch]);

  useEffect(() => {
    if (SpeechRecognition) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = false;
      recognition.current.lang = "en-US";

      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setIsRecording(false); // Stop recording
        handleSendMessage(transcript); // Send the recognized text immediately
      };

      recognition.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };

      recognition.current.onend = () => {
        setIsRecording(false);
        setTimer(0);
      };
    }
  }, []);

  const handleStart = (e) => {
    const clientX = e.clientX || e.touches?.[0]?.clientX; // ⚙️ Support both touch and pointer
    if (!startX.current) {
      startX.current = clientX; // Store initial X position
      setIsRecording(true);
      startTime.current = Date.now();
      recognition.current?.start(); // ✅ Start speech recognition
      // console.log("Recording started");
    }
  };

  const handleMove = (e) => {
    if (!startX.current) return; // If no start position, return

    const clientX = e.clientX || e.touches?.[0]?.clientX; // ⚙️ Support both touch and pointer
    const distanceSwiped = startX.current - clientX; // ⚙️ Track distance swiped

    if (distanceSwiped > 0) {
      setSwipeDistance(-distanceSwiped); // 🔥 Update swipe distance (negative to move left)
    }

    if (distanceSwiped > 100) {
      // console.log("Recording canceled by swipe.");
      handleStop();
    }
  };

  const handleStop = () => {
    setIsRecording(false);
    setSwipeDistance(0);
    startX.current = null; // Reset swipe position
    startTime.current = null; // Reset start time
    recognition.current?.stop(); // ✅ Stop speech recognition
    // console.log("Recording stopped");
  };

  // Timer Logic (milliseconds)
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        if (startTime.current) {
          const elapsed = Date.now() - startTime.current; // Calculate elapsed time
          setTimer(elapsed); // Update timer state
        }
      }, 10); // Update every 10ms
    }
    return () => clearInterval(interval); // Cleanup interval on stop
  }, [isRecording]);

  const handleSendMessage = async (message = input) => {
    if (!message.trim()) return;
    setShowInfo(false); // Hide intro after first message
    setAiTyping(true);
    dispatch(addMessage({ role: "user", content: message }));
    setInput("");

    let currentChatId = chatId; // Get current chatId from Redux
    if (!currentChatId) {
      try {
        const startChatResponse = await dispatch(
          startNewChat({ restaurantId, tableNumber, userId })
        ).unwrap(); // Unwrap the resolved value from Redux async thunk
        currentChatId = startChatResponse.chatId; // Extract the chatId from the response
        dispatch(setChatId(currentChatId)); // Update chatId in Redux
      } catch (error) {
        console.error("Error starting new chat:", error);
        return; // Stop further execution if chat creation fails
      }
    }

    try {
      const sessionToken = getSessionToken(); // Get session token
      const response = await fetch(`/api/chat/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken,
        },
        body: JSON.stringify({
          restaurantId,
          tableNumber,
          userId,
          message,
          chatId: currentChatId, // Attach the latest chatId
        }),
      });

      if (response.status === 403) {
        const data = await response.json();
        setAlertMessage(data.error); // 🟢 Show Flowbite alert with message
        setAiTyping(false);
        return; // Stop execution
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      function readChunk() {
        reader.read().then(({ done, value }) => {
          if (done) {
            setAiTyping(false);
            dispatch(
              addMessage({ role: "assistant", content: assistantMessage })
            );
            setTempAssistantMessage("");
            return;
          }
          const chunk = decoder.decode(value);
          assistantMessage += chunk;
          setTempAssistantMessage(assistantMessage + "⚪");
          readChunk();
        });
      }
      readChunk();
    } catch (error) {
      console.error("Error with streaming:", error);
    }
  };

  const handleSuggestedQuestion = async (question) => {
    setAiTyping(true);
    setShowInfo(false); // Hide the intro immediately
    dispatch(addMessage({ role: "user", content: question })); // Add the question to the messages

    let currentChatId = chatId; // Get chatId from Redux
    if (!currentChatId) {
      try {
        const startChatResponse = await dispatch(
          startNewChat({ restaurantId, tableNumber, userId })
        ).unwrap();
        currentChatId = startChatResponse.chatId;
        dispatch(setChatId(currentChatId));
      } catch (error) {
        console.error("Error starting new chat:", error);
        return;
      }
    }

    try {
      const sessionToken = getSessionToken(); // Get session token
      const response = await fetch(`/api/chat/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Token": sessionToken,
        },
        body: JSON.stringify({
          restaurantId,
          tableNumber,
          userId,
          message: question,
          chatId: currentChatId, // Attach the latest chatId
        }),
      });

      if (response.status === 403) {
        const data = await response.json();
        setAlertMessage(data.error); // 🟢 Show Flowbite alert with message
        setAiTyping(false);
        return; // Stop execution
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      function readChunk() {
        reader.read().then(({ done, value }) => {
          if (done) {
            setAiTyping(false);
            dispatch(
              addMessage({ role: "assistant", content: assistantMessage })
            );
            setTempAssistantMessage("");
            return;
          }
          const chunk = decoder.decode(value);
          assistantMessage += chunk;
          setTempAssistantMessage(assistantMessage + "⚪");
          readChunk();
        });
      }
      readChunk();
    } catch (error) {
      console.error("Error with streaming:", error);
    }
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
    <div className="flex flex-col flex-1 justify-between bg-gray-900 text-white p-6">
      <div className="flex flex-col w-full max-w-3xl mx-auto flex-1">
        {/* Messages Section */}
        <div className="flex flex-col flex-grow overflow-y-auto pr-4 scrollbar-hide">
          {/* Spacer to push messages to the bottom */}
          <div className="flex-grow" />

          {/* Render Messages */}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${
                msg.role === "user" ? "flex justify-end" : "flex justify-start"
              }`}
            >
              <div
                className={`${
                  msg.role === "user"
                    ? "bg-gray-800 text-white max-w-xl"
                    : "markdown bg-transparent text-gray-200 w-full"
                } px-4 py-2 mb-4 ${
                  msg.content.length < 50 ? "rounded-full" : "rounded-2xl"
                }`}
              >
                <ReactMarkdown
                  components={{
                    a: ({ href, children }) => (
                      <a href={href} className="text-blue-500 underline">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {/* Streaming AI Response */}
          {tempAssistantMessage && (
            <div className="flex justify-start w-full mb-4">
              <div className="markdown bg-transparent text-gray-200 px-4 py-2">
                <ReactMarkdown
                  components={{
                    a: ({ href, children }) => (
                      <a href={href} className="text-blue-500 underline">
                        {children}
                      </a>
                    ),
                  }}
                >
                  {tempAssistantMessage}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Scroll to this element */}
          <div ref={messagesEndRef} />
        </div>

        {/*Exclude no chatid or off-ed chatbot for admin checking chat history*/}
        {alertMessage && !chat_id && (
          <Alert
            color="failure"
            onDismiss={() => setAlertMessage("")}
            className="mb-4" // 🔥 Add margin-bottom here
          >
            {alertMessage}
          </Alert>
        )}

        {/* Bottom Section Wrapper */}
        {!alertMessage && !chat_id && (
          <div className="flex flex-col gap-4">
            {/* Restaurant name and info */}
            {showInfo && (
              <div className="text-center space-y-4 p-4 rounded-lg">
                <img
                  src={info.restaurantLogo}
                  alt={info.restaurantName}
                  className="w-20 h-20 mx-auto"
                />
                <h2 className="text-lg font-semibold">{info.restaurantName}</h2>
                {info.restaurantLocation && (
                  <p className="text-sm text-gray-400">
                    {info.restaurantLocation}
                  </p>
                )}
                {/* Suggested Questions */}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start max-w-xl mx-auto">
                  {info.suggestedQuestions.map((question, index) => {
                    // Extract the full question text by joining all block texts
                    const questionText = question.blocks
                      .map((block) => block.text)
                      .join(" ")
                      .trim();

                    // If questionText is empty, return null to skip rendering
                    if (!questionText) return null;

                    return (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuestion(questionText)}
                        className={`w-full md:w-[calc(50%-0.5rem)] px-4 py-2 rounded-lg bg-gray-800 ${
                          input ? "text-gray-500" : "text-gray-400"
                        } hover:bg-gray-600 text-left`}
                      >
                        {renderStyledQuestion(question)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chatbox Section */}
            <div className="flex items-center bg-gray-800 p-2 px-2 rounded-full relative">
              {/* Left Side: Dynamic content changes based on recording state */}
              <div className="flex-grow flex items-center">
                {isRecording ? (
                  <div className="flex items-center justify-between  w-full">
                    {/* Timer */}
                    <div className="text-white text-sm font-mono ml-4">
                      {String(Math.floor(timer / 1000)).padStart(2, "0")}:
                      {String(Math.floor((timer % 1000) / 10)).padStart(2, "0")}
                    </div>

                    {/* Center Text Feedback */}
                    <div className="text-gray-400 text-sm animate-pulse whitespace-nowrap mr-6">
                      &lt; Swipe left to cancel
                    </div>
                  </div>
                ) : (
                  <div className="relative flex-grow">
                    <TextInput
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Send a message..."
                      className="w-full pl-2 pr-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-white !text-base"
                      style={{ fontSize: "16px" }}
                    />

                    {/* Icons positioned within input container */}
                    {!input && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2 pr-2">
                        {info.menuLink && (
                          <button
                            className="text-gray-500 hover:text-gray-300"
                            onClick={() => window.open(info.menuLink, "_blank")}
                            title="Menu"
                          >
                            <MdMenuBook size={20} />
                          </button>
                        )}
                        {info.orderLink && (
                          <button
                            className="text-gray-500 hover:text-gray-300"
                            onClick={() =>
                              window.open(info.orderLink, "_blank")
                            }
                            title="Order"
                          >
                            <FaUtensils size={20} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Side: Microphone or Send Button */}
              <div className="flex-shrink-0">
                {input ? (
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={aiTyping}
                    className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${
                      aiTyping
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    }`}
                  >
                    <AiOutlineSend size={20} className="text-white" />
                  </button>
                ) : (
                  <div
                    id="microphone-button"
                    className={`${
                      isRecording
                        ? "w-16 h-16 bg-red-500 scale-110"
                        : "w-12 h-12 bg-gray-600 hover:bg-gray-500"
                    } rounded-full flex items-center justify-center shadow-lg transition-all`}
                    onPointerDown={handleStart} // Desktop + Mobile
                    onPointerMove={handleMove} // Desktop + Mobile
                    onPointerUp={handleStop} // Desktop + Mobile
                    onTouchStart={handleStart} // Mobile only
                    onTouchMove={handleMove} // Mobile only
                    onTouchEnd={handleStop} // Mobile only
                    style={{
                      transform: `translateX(${swipeDistance}px)`, // 🔥 Move the microphone icon
                      transition: !isRecording ? "transform 0.3s ease" : "none", // Smooth reset when stopping
                    }}
                  >
                    <AiOutlineAudio
                      size={isRecording ? 30 : 20}
                      className="text-white transition-all"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* Terms of Use and Privacy Policy Section */}
        {showInfo && (
          <div className="text-center text-sm text-gray-400 mt-4 pb-1 text-unselectable">
            By messaging the Talking Menu, you agree to our
            <Link to="/terms-of-use" className="text-blue-500 underline mx-1">
              Terms
            </Link>
            and have read our
            <Link to="/privacy-policy" className="text-blue-500 underline mx-1">
              Privacy Policy
            </Link>
            .
          </div>
        )}
      </div>
    </div>
  );
}
