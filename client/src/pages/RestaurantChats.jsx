import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FaStar, FaRegStar } from "react-icons/fa";
import { FiArrowLeft } from "react-icons/fi";
import {
  fetchRestaurantChats,
  fetchStarredChats,
  toggleStarChat,
  searchRestaurantChats,
  markChatAsSeen,
} from "../redux/slices/restaurantChatsSlice";
import { Button } from "flowbite-react";

// Memoized Header Component
const Header = React.memo(() => (
  <h1 className="text-2xl font-bold mb-4">Restaurant Chats</h1>
));

// Memoized Tabs Component
const Tabs = React.memo(({ activeTab, setActiveTab }) => (
  <div className="flex mb-4 space-x-2">
    <Button
      onClick={() => setActiveTab("all")}
      color={activeTab === "all" ? "blue" : "gray"}
      outline={activeTab !== "all"}
      className="rounded-lg"
    >
      All
    </Button>
    <Button
      onClick={() => setActiveTab("starred")}
      color={activeTab === "starred" ? "blue" : "gray"}
      outline={activeTab !== "starred"}
      className="rounded-lg"
    >
      Starred
    </Button>
  </div>
));

// Memoized Chat Row Component
const ChatRow = React.memo(
  ({ chat, handleToggleStarChat, isStarred, isSeen, isLoading, navigate, token, restaurantId, dispatch }) => (
    <div
      className={`p-4 mb-2 shadow-md rounded-lg flex justify-between items-center gap-4 ${
        chat.isSeen ? "bg-gray-300" : "bg-gray-100 hover:bg-gray-200"
      }`}
    >
      <button
        className="text-left flex-grow overflow-hidden"
        onClick={() => {
          dispatch(
            markChatAsSeen({ token, chatId: chat._id })
          );
          window.open(
            `/restaurant/${restaurantId}/chat/${chat.tableNumber}/${chat._id}`,
            "_blank"
          );
        }}
      >
        <p
          className="text-gray-800 truncate"
          title={chat.firstMessage} // Display full text on hover
        >
          {chat.firstMessage}
        </p>

        <small className="text-gray-500">
          Table: {chat.tableNumber || "default"} -{" "}
          {new Date(chat.timestamp).toLocaleString()}
        </small>
      </button>
      <button
        className="ml-2"
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
  const { restaurantId, dashboardId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentStarredPage, setCurrentStarredPage] = useState(1);
  const [currentSearchPage, setCurrentSearchPage] = useState(1);
  const [currentStarredSearchPage, setCurrentStarredSearchPage] = useState(1);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const [token, setToken] = useState(null);
  const [loadingToggles, setLoadingToggles] = useState({});
  const [loadingTabs, setLoadingTabs] = useState({
    all: false,
    starred: false,
  });

  const {
    allChats,
    searchResults,
    starredChats,
    totalChats,
    totalStarredChats,
    error,
  } = useSelector((state) => state.restaurantChats);

  const limit = 20;

  // Calculate total pages
  const totalPages = Math.ceil(totalChats / limit);
  const totalStarredPages = Math.ceil(totalStarredChats / limit);
  const totalSearchPages = searchActive
    ? Math.ceil((searchResults?.totalChats || 0) / limit) // Use `searchResults.total` to calculate pages
    : 0;

  useEffect(() => {
    if (token) {
      const promises = [];

      // Always fetch all chats
      promises.push(
        dispatch(
          fetchRestaurantChats({
            token,
            restaurantId,
            page: currentPage,
            limit,
          })
        )
      );

      // Always fetch starred chats
      promises.push(
        dispatch(
          fetchStarredChats({
            token,
            restaurantId,
            page: currentStarredPage,
            limit,
          })
        )
      );

      // Wait for both requests to complete before updating loading state
      Promise.all(promises).finally(() =>
        setLoadingTabs((prev) => ({
          ...prev,
          all: false,
          starred: false,
        }))
      );
    }
  }, [token, restaurantId, currentPage, currentStarredPage, dispatch, limit]);

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

  // Handle tab change
  useEffect(() => {
    if (token) {
      if (searchActive && debouncedSearchQuery.trim()) {
        // If search is active, and there is something to search, fetch the relevant tab's search results
        dispatch(
          searchRestaurantChats({
            token,
            restaurantId,
            keyword: debouncedSearchQuery,
            ...(activeTab === "starred" && { filterStarred: true }), // Filter starred for starred tab
            page: activeTab === "all" ? currentSearchPage : currentStarredPage,
            limit,
          })
        );
      } else {
        // If search is inactive, fetch regular chats for the active tab
        if (activeTab === "all") {
          dispatch(
            fetchRestaurantChats({
              token,
              restaurantId,
              page: currentPage,
              limit,
            })
          );
        } else if (activeTab === "starred") {
          dispatch(
            fetchStarredChats({
              token,
              restaurantId,
              page: currentStarredPage,
              limit,
            })
          );
        }
      }
    }
  }, [
    activeTab,
    searchActive,
    token,
    restaurantId,
    currentPage,
    currentSearchPage,
    currentStarredPage,
    debouncedSearchQuery,
    dispatch,
    limit,
  ]);

  // Perform search when debounced query changes
  useEffect(() => {
    // Only perform search if there's an actual query and it's not empty
    if (debouncedSearchQuery.trim() && token) {
      dispatch(
        searchRestaurantChats({
          token,
          restaurantId,
          keyword: debouncedSearchQuery,
          // Use appropriate pagination for all or starred
          page:
            activeTab === "all" ? currentSearchPage : currentStarredSearchPage,
          limit,
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
  }, [debouncedSearchQuery, currentSearchPage, currentStarredSearchPage]);

  // Memoized function to toggle star status
  const handleToggleStarChat = useCallback(
    async (chatId) => {
      setLoadingToggles((prev) => ({ ...prev, [chatId]: true }));

      const result = await dispatch(toggleStarChat({ token, chatId }));

      if (result.type.endsWith("fulfilled")) {
        if (searchActive) {
          // Update search results manually to reflect the change
          const updatedSearchResults = searchResults.chats.map((chat) =>
            chat._id === chatId
              ? { ...chat, isStarred: !chat.isStarred } // Toggle `isStarred` correctly
              : chat
          );

          dispatch({
            type: "restaurantChats/updateSearchResults",
            payload: { ...searchResults, chats: updatedSearchResults },
          });
        } else {
          // Re-fetch data for the current tab when not searching
          if (activeTab === "all") {
            dispatch(
              fetchRestaurantChats({
                token,
                restaurantId,
                page: currentPage,
                limit,
              })
            );
          } else if (activeTab === "starred") {
            dispatch(
              fetchStarredChats({
                token,
                restaurantId,
                page: currentStarredPage,
                limit,
              })
            );
          }
        }
      }

      setLoadingToggles((prev) => ({ ...prev, [chatId]: false }));
    },
    [
      dispatch,
      token,
      searchActive,
      searchResults,
      activeTab,
      currentPage,
      currentStarredPage,
      restaurantId,
      limit,
    ]
  );

  // Determine if a chat is starred
  const isChatStarred = (chatId) => {
    if (searchActive) {
      return searchResults.chats.some(
        (chat) => chat._id === chatId && chat.isStarred
      );
    }
    return (
      starredChats.some((chat) => chat._id === chatId) ||
      allChats.some((chat) => chat._id === chatId && chat.isStarred)
    );
  };

  const getPaginationRange = (currentPage, totalPages) => {
    const startPage = Math.max(currentPage - 1, 1); // Start from the current page - 1 but not below 1
    const endPage = Math.min(startPage + 2, totalPages); // Show at most 3 pages
    const range = [];
    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }
    return range;
  };

  // Determine chats to display
  const chatsToDisplay = useMemo(() => {
    if (searchActive) {
      // Fetch the appropriate search results based on the active tab
      const resultsArray = Array.isArray(searchResults.chats)
        ? searchResults.chats
        : [];
      return resultsArray;
    }

    // If no search is active, display the chats for the active tab
    return activeTab === "all"
      ? Array.isArray(allChats)
        ? allChats
        : []
      : Array.isArray(starredChats)
      ? starredChats
      : [];
  }, [searchActive, searchResults, activeTab, allChats, starredChats]);

  return (
    <div className=" bg-gray-100 p-6">
      {/* Back Button */}
      <button
        onClick={() =>
          navigate(`/dashboards/${dashboardId}/restaurant/${restaurantId}`)
        }
        className="mb-6 flex items-center text-blue-500 hover:underline"
      >
        <FiArrowLeft className="mr-2" />
        Back to Dashboard
      </button>
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
              token={token} 
              restaurantId={restaurantId} 
              dispatch={dispatch} 
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
      {/* Pagination for All Chats */}
      {!searchActive && activeTab === "all" && (
        <div className="flex justify-center mt-4 space-x-2">
          {/* Previous Button */}
          <Button
            onClick={() => setCurrentPage((prev) => prev - 1)}
            disabled={currentPage === 1}
            color="blue"
            outline={currentPage === 1}
          >
            Previous
          </Button>

          {/* Page Numbers */}
          {getPaginationRange(currentPage, totalPages).map((page) => (
            <Button
              key={page}
              onClick={() => setCurrentPage(page)}
              color={currentPage === page ? "blue" : "gray"}
              outline={currentPage !== page}
            >
              {page}
            </Button>
          ))}

          {/* Next Button */}
          <Button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={currentPage === totalPages}
            color="blue"
            outline={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Pagination for Starred Chats */}
      {!searchActive && activeTab === "starred" && (
        <div className="flex justify-center mt-4 space-x-2">
          {/* Previous Button */}
          <Button
            onClick={() => setCurrentStarredPage((prev) => prev - 1)}
            disabled={currentStarredPage === 1}
            color="blue"
            outline={currentStarredPage === 1}
          >
            Previous
          </Button>

          {/* Page Numbers */}
          {getPaginationRange(currentStarredPage, totalStarredPages).map(
            (page) => (
              <Button
                key={page}
                onClick={() => setCurrentStarredPage(page)}
                color={currentStarredPage === page ? "blue" : "gray"}
                outline={currentStarredPage !== page}
              >
                {page}
              </Button>
            )
          )}

          {/* Next Button */}
          <Button
            onClick={() => setCurrentStarredPage((prev) => prev + 1)}
            disabled={currentStarredPage === totalStarredPages}
            color="blue"
            outline={currentStarredPage === totalStarredPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Pagination for Search Results */}
      {searchActive && (
        <div className="flex justify-center mt-4 space-x-2">
          {/* Previous Button */}
          <Button
            onClick={() =>
              activeTab === "all"
                ? setCurrentSearchPage((prev) => prev - 1)
                : setCurrentStarredSearchPage((prev) => prev - 1)
            }
            disabled={
              activeTab === "all"
                ? currentSearchPage === 1
                : currentStarredSearchPage === 1
            }
            color="blue"
            outline={
              (activeTab === "all" && currentSearchPage === 1) ||
              (activeTab === "starred" && currentStarredSearchPage === 1)
            }
          >
            Previous
          </Button>

          {/* Page Numbers */}
          {getPaginationRange(
            activeTab === "all" ? currentSearchPage : currentStarredSearchPage,
            totalSearchPages
          ).map((page) => (
            <Button
              key={page}
              onClick={() =>
                activeTab === "all"
                  ? setCurrentSearchPage(page)
                  : setCurrentStarredSearchPage(page)
              }
              color={
                (activeTab === "all" && currentSearchPage === page) ||
                (activeTab === "starred" && currentStarredSearchPage === page)
                  ? "blue"
                  : "gray"
              }
              outline={
                (activeTab === "all" && currentSearchPage !== page) ||
                (activeTab === "starred" && currentStarredSearchPage !== page)
              }
            >
              {page}
            </Button>
          ))}

          {/* Next Button */}
          <Button
            onClick={() =>
              activeTab === "all"
                ? setCurrentSearchPage((prev) => prev + 1)
                : setCurrentStarredSearchPage((prev) => prev + 1)
            }
            disabled={
              activeTab === "all"
                ? currentSearchPage === totalSearchPages
                : currentStarredSearchPage === totalSearchPages
            }
            color="blue"
            outline={
              (activeTab === "all" && currentSearchPage === totalSearchPages) ||
              (activeTab === "starred" &&
                currentStarredSearchPage === totalSearchPages)
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default RestaurantChats;
