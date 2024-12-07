import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMenu, clearMenuState } from "../redux/slices/menuSlice";
import { fetchRestaurant } from "../redux/slices/restaurantSlice"; // Fetch restaurant if missing
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FiArrowLeft, FiChevronRight } from "react-icons/fi";
import { Button } from "flowbite-react";

export default function Menu() {
  const { dashboardId, restaurantId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Access menu and restaurant data from Redux state
  const {
    data: menu,
    status: menuStatus,
    error: menuError,
  } = useSelector((state) => state.menu);
  const { data: restaurant, status: restaurantStatus } = useSelector(
    (state) => state.restaurant
  );

  useEffect(() => {
    const auth = getAuth();
    const fetchData = async (user) => {
      const token = await user.getIdToken();

      // Fetch the restaurant details only if not already loaded
      if (!restaurant) {
        await dispatch(fetchRestaurant({ token, restaurantId }));
      }

      // Fetch menu data
      await dispatch(fetchMenu({ token, restaurantId }));
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user);
      } else {
        dispatch(clearMenuState());
      }
    });

    return () => unsubscribe();
  }, [dispatch, restaurantId, restaurant]); // Add restaurant as a dependency

  // Add a separate effect to refetch menu when coming back to this page
  useEffect(() => {
    const refreshMenu = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        dispatch(fetchMenu({ token, restaurantId }));
      }
    };

    refreshMenu();
  }, [dispatch, restaurantId]);

  const filteredMenuItems = menu?.menuItems.filter(
    (item) =>
      item?.name && item.name.toLowerCase().includes(search.toLowerCase())
  );

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

      {/* Restaurant Info */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h1 className="text-2xl font-bold">{restaurant?.name}</h1>
        <p className="text-gray-500">{restaurant?.location}</p>
      </div>

      {/* Menu Section */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Menu</h2>

        {/* Search and Add Menu Item */}
        <div className="mb-4 flex space-x-2">
          <input
            type="text"
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded flex-grow"
          />
          <Button
            onClick={() =>
              navigate(
                `/dashboards/${dashboardId}/restaurant/${restaurantId}/menu/add`
              )
            }
            color="blue"
            className="rounded transition"
          >
            Add Item
          </Button>
        </div>

        {/* List of Menu Items */}
        <div className="space-y-3">
          {filteredMenuItems?.map((item) => (
            <button
              key={item._id}
              onClick={() =>
                navigate(
                  `/dashboards/${dashboardId}/restaurant/${restaurantId}/menu/${item._id}`
                )
              }
              className="flex items-center justify-between w-full bg-gray-100 p-4 rounded-lg shadow hover:bg-gray-200 transition"
            >
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
                <p className="text-sm text-gray-500">
                  ${item.price.toFixed(2)}
                </p>
              </div>
              <FiChevronRight className="flex-shrink-0 text-gray-400 text-xl ml-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
