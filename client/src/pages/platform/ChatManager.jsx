import React, { useEffect, useState, useCallback, memo, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useParams, useNavigate } from "react-router-dom";
import { TextInput, Pagination, Modal, Button } from "flowbite-react";
import { debounce } from "lodash";
import {
  fetchRestaurantChats,
  searchRestaurantChats,
  deleteChat,
} from "../../redux/slices/platformControlPanelChatsSlice";

const ChatItem = memo(({ chat, onNavigate, onDelete }) => (
  <div
    className="bg-white p-4 rounded-lg shadow-md border cursor-pointer"
    onClick={() => onNavigate(chat)}
  >
    <p>
      <strong>Table:</strong> {chat.tableNumber || "default"}
    </p>
    <p>
      <strong>First Message:</strong> {chat.firstMessage}
    </p>
    <p>
      <strong>Timestamp:</strong> {new Date(chat.timestamp).toLocaleString()}
    </p>
    <button
      className="text-red-500 hover:underline mt-2"
      onClick={(e) => {
        e.stopPropagation(); // Prevent parent onClick from triggering
        onDelete(chat); // Call the onDelete handler
      }}
    >
      Delete
    </button>
  </div>
));

export default function ChatManager() {
  const dispatch = useDispatch();
  const { restaurantId } = useParams();

  const [token, setToken] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  const navigate = useNavigate();

  const { allChats, searchResults, totalChats, status, error } = useSelector(
    (state) => state.platformControlPanelChats
  );

  const limit = 20; // Number of items per page

  // Determine the total number of pages
  const totalPages = isSearchActive
    ? Math.ceil((searchResults?.totalChats || 0) / limit)
    : Math.ceil(totalChats / limit);

  // Fetch token dynamically
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const fetchedToken = await user.getIdToken();
        setToken(fetchedToken);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch chats based on current state
  useEffect(() => {
    if (token) {
      if (isSearchActive && searchQuery.trim()) {
        dispatch(
          searchRestaurantChats({
            token,
            restaurantId,
            keyword: searchQuery.trim(),
            page: currentPage,
            limit,
          })
        );
      } else {
        dispatch(
          fetchRestaurantChats({
            token,
            restaurantId,
            page: currentPage,
            limit,
          })
        );
      }
    }
  }, [token, restaurantId, currentPage, searchQuery, isSearchActive, dispatch]);

  // Debounce search input
  const debouncedSearch = useCallback(
    debounce((query) => {
      setIsSearchActive(query.trim().length > 0);
      setSearchQuery(query);
      setCurrentPage(1); // Reset to first page when searching
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const query = e.target.value;
    debouncedSearch(query);
  };

  // Normalize chats to display
  const chatsToDisplay = useMemo(() => {
    return isSearchActive ? searchResults?.chats || [] : allChats;
  }, [isSearchActive, searchResults, allChats]);

  const handleDeleteChat = async () => {
    if (token && selectedChat) {
      await dispatch(
        deleteChat({ token, chatId: selectedChat._id, restaurantId })
      );
      // Fetch updated chats
      dispatch(
        fetchRestaurantChats({ token, restaurantId, page: currentPage, limit })
      );
      setIsDeleteModalOpen(false);
      setSelectedChat(null);
    }
  };

  return (
    <div className="bg-gray-100 p-6 min-h-screen">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Chat Manager
        </h1>

        {/* Search Input */}
        <div className="mb-6">
          <TextInput
            type="text"
            placeholder="Search chats by keyword"
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>

        {/* Status or Error Messages */}
        {status === "loading" && <p>Loading chats...</p>}
        {status === "failed" && <p className="text-red-500">{error}</p>}

        {/* Chat List */}
        {chatsToDisplay.map((chat) => (
          <ChatItem
            key={chat._id}
            chat={chat}
            onNavigate={() =>
              navigate(
                `/restaurant/${restaurantId}/chat/${chat.tableNumber}/${chat._id}`
              )
            }
            onDelete={() => {
              setSelectedChat(chat);
              setIsDeleteModalOpen(true);
            }}
          />
        ))}

        <Modal
          show={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <Modal.Header>Confirm Delete</Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this chat? This action cannot be
            undone.
          </Modal.Body>
          <Modal.Footer>
            <Button color="red" onClick={handleDeleteChat}>
              Confirm
            </Button>
            <Button color="gray" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
