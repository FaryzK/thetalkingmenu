import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FaStar, FaRegStar } from "react-icons/fa";
import {
  fetchRestaurantChats,
  fetchStarredChats,
  toggleStarChat,
  searchRestaurantChats,
} from "../redux/slices/restaurantChatsSlice";

// Memoized Header Component
const Header = React.memo(() => (
  <h1 className="text-2xl font-bold mb-4">Restaurant Chats</h1>
));

// Memoized Tabs Component
const Tabs = React.memo(({ activeTab, setActiveTab }) => (
  <div className="flex mb-4">
    <button
      onClick={() => setActiveTab("all")}
      className={`px-4 py-2 rounded-lg ${
        activeTab === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
      }`}
    >
      All
    </button>
    <button
      onClick={() => setActiveTab("starred")}
      className={`px-4 py-2 rounded-lg ml-2 ${
        activeTab === "starred" ? "bg-blue-500 text-white" : "bg-gray-200"
      }`}
    >
      Starred
    </button>
  </div>
));

// Memoized Chat Row Component
const ChatRow = React.memo(
  ({ chat, handleToggleStarChat, isStarred, isLoading, navigate }) => (
    <div
      className="p-4 mb-2 bg-white shadow-md rounded-lg flex justify-between items-center gap-4" // Added gap for consistent spacing
    >
      <button
        className="text-left flex-grow overflow-hidden"
        onClick={() =>
          navigate(`/restaurant/${chat.restaurantId}/chat/${chat._id}`)
        }
      >
        <p
          className="text-gray-800 truncate"
          title={chat.firstMessage} // Display full text on hover
        >
          {chat.firstMessage}
        </p>

        <small className="text-gray-500">
          {new Date(chat.timestamp).toLocaleString()}
        </small>
      </button>
      <button
        className="ml-2" // Ensure margin-left is applied
        onClick={() => handleToggleStarChat(chat._id)}
        disabled={isLoading}
      >
        {isStarred ? (
          <FaStar className="text-yellow-400" size={20} />
        ) : (
          <FaRegStar className="text-gray-400" size={20} />
        )}
      </button>
    </div>
  )
);

const RestaurantChats = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [token, setToken] = useState(null);
  const [loadingToggles, setLoadingToggles] = useState({});
  const [loadingTabs, setLoadingTabs] = useState({
    all: false,
    starred: false,
  });
  const limit = 20;

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  const { allChats, searchResults, starredChats, totalChats, error } =
    useSelector((state) => state.restaurantChats);

  // Debounce search query
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timerId);
  }, [searchQuery]);

  // Fetch token dynamically
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const fetchedToken = await user.getIdToken();
        setToken(fetchedToken);
      } else {
        console.error("User not authenticated. Cannot fetch chats.");
      }
    });

    return () => unsubscribe();
  }, []);

  // Reset search when changing tabs
  useEffect(() => {
    // Clear search query and reset search active state
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setSearchActive(false);

    // Fetch appropriate chats based on tab
    if (token) {
      setLoadingTabs((prev) => ({ ...prev, [activeTab]: true }));

      if (activeTab === "all") {
        Promise.all([
          dispatch(
            fetchRestaurantChats({
              token,
              restaurantId,
              page: currentPage,
              limit,
            })
          ),
          dispatch(fetchStarredChats({ token, restaurantId })),
        ]).finally(() =>
          setLoadingTabs((prev) => ({ ...prev, [activeTab]: false }))
        );
      } else if (activeTab === "starred") {
        dispatch(fetchStarredChats({ token, restaurantId })).finally(() =>
          setLoadingTabs((prev) => ({ ...prev, [activeTab]: false }))
        );
      }
    }
  }, [activeTab, restaurantId, token, dispatch, currentPage]);

  // Perform search when debounced query changes
  useEffect(() => {
    // Only perform search if there's an actual query and it's not empty
    if (debouncedSearchQuery.trim() && token) {
      dispatch(
        searchRestaurantChats({
          token,
          restaurantId,
          keyword: debouncedSearchQuery,
          // Only filter starred if we're on the starred tab
          ...(activeTab === "starred" && { filterStarred: true }),
        })
      ).then((action) => {
        if (searchRestaurantChats.fulfilled.match(action)) {
          setSearchActive(true);
        }
      });
    } else {
      // When search query is empty, reset search active state
      setSearchActive(false);
    }
  }, [debouncedSearchQuery]);

  // Memoized function to toggle star status
  const handleToggleStarChat = useCallback(
    async (chatId) => {
      setLoadingToggles((prev) => ({ ...prev, [chatId]: true }));
      await dispatch(toggleStarChat({ token, chatId }));
      setLoadingToggles((prev) => ({ ...prev, [chatId]: false }));
    },
    [dispatch, token]
  );

  // Determine if a chat is starred
  const isChatStarred = (chatId) => starredChats.some((c) => c._id === chatId);

  // Calculate total pages
  const totalPages = Math.ceil(totalChats / limit);

  // Determine chats to display
  const chatsToDisplay = useMemo(() => {
    if (searchActive) {
      return searchResults;
    }
    return activeTab === "all" ? allChats : starredChats;
  }, [searchActive, searchResults, activeTab, allChats, starredChats]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Header />
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Search Feature */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search chats..."
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Chat List */}
      <div>
        {loadingTabs[activeTab] ? (
          <div>Loading {activeTab} chats...</div>
        ) : chatsToDisplay.length > 0 ? (
          chatsToDisplay.map((chat) => (
            <ChatRow
              key={chat._id}
              chat={chat}
              handleToggleStarChat={handleToggleStarChat}
              isStarred={isChatStarred(chat._id)}
              isLoading={!!loadingToggles[chat._id]}
              navigate={navigate}
            />
          ))
        ) : (
          <p>
            {searchActive && searchResults.length === 0
              ? "No chats found matching your search"
              : "No chats available"}
          </p>
        )}
      </div>

      {/* Pagination */}
      {activeTab === "all" && (
        <div className="flex justify-center mt-4 space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === 1 ? "bg-gray-300" : "bg-blue-500 text-white"
            }`}
          >
            Previous
          </button>
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === totalPages
                ? "bg-gray-300"
                : "bg-blue-500 text-white"
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default RestaurantChats;
