import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMenu, clearMenuState } from "../redux/slices/menuSlice";
import { fetchRestaurant } from "../redux/slices/restaurantSlice"; // Fetch restaurant if missing
import { getAuth, onAuthStateChanged } from "firebase/auth";

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

  if (menuStatus === "loading" || restaurantStatus === "loading")
    return <div>Loading...</div>;
  if (menuStatus === "failed") return <div>Error: {menuError}</div>;

  const filteredMenuItems = menu?.menuItems.filter(
    (item) =>
      item?.name && item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Restaurant Info Container */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-4">
        <h1 className="text-2xl font-bold">{restaurant?.name}</h1>
        <p className="text-gray-500">{restaurant?.location}</p>
      </div>

      {/* Menu Container */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold">MENU</h2>

        {/* Search and Add Menu Item */}
        <div className="mt-2 flex space-x-2">
          <input
            type="text"
            placeholder="Search menu items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded flex-grow"
          />
          <button
            onClick={() =>
              navigate(
                `/dashboards/${dashboardId}/restaurant/${restaurantId}/menu/add`
              )
            }
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Add Item
          </button>
        </div>

        {/* List of Menu Items */}
        <div className="mt-4 space-y-2">
          {filteredMenuItems?.map((item) => (
            <button
              key={item._id}
              onClick={() =>
                navigate(
                  `/dashboards/${dashboardId}/restaurant/${restaurantId}/menu/${item._id}`
                )
              }
              className="w-full bg-gray-100 p-4 rounded-lg shadow hover:bg-gray-200 transition text-left flex justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <p className="text-gray-500">{item.description}</p>
                <p className="text-gray-500">${item.price}</p>
              </div>
              <span className="text-gray-400">{">"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
