import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  fetchDashboards,
  clearDashboardsState,
} from "../redux/slices/dashboardsSlice";
import { createRestaurant } from "../redux/slices/restaurantSlice";
import FlowbiteBreadcrumbs from "../components/FlowbiteBreadcrumbs";
import { Button } from "flowbite-react";

export default function Dashboard() {
  const { dashboardId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantLocation, setRestaurantLocation] = useState("");

  const dashboard = useSelector((state) =>
    state.dashboards.data.find((d) => d._id === dashboardId)
  );

  useEffect(() => {
    const auth = getAuth();
    const fetchData = async (user) => {
      const token = await user.getIdToken();
      dispatch(fetchDashboards(token));
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData(user);
      } else {
        dispatch(clearDashboardsState());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/dashboards/${dashboardId}/restaurant/${restaurantId}`);
  };

  const handleAddRestaurant = async () => {
    const auth = getAuth();
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      alert("No user is logged in");
      return;
    }

    const token = await firebaseUser.getIdToken();
    const restaurantData = {
      name: restaurantName,
      location: restaurantLocation,
    };

    dispatch(createRestaurant({ token, dashboardId, restaurantData })).unwrap();
    setShowRestaurantForm(false);
    setRestaurantName("");
    setRestaurantLocation("");
  };

  if (!dashboard) return <div>Loading...</div>;

  return (
    <div className="bg-gray-100 p-6  flex flex-col ">
      {/* Breadcrumbs */}
      <FlowbiteBreadcrumbs />
      <h1 className="text-2xl md:text-3xl font-bold my-6  text-gray-800">
        Hello, {dashboard.dashboardOwnerName}
      </h1>
      <div className="flex flex-col items-center">
        <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
            My Restaurants
          </h2>
          {dashboard.restaurants?.length > 0 && (
            <div className="space-y-4">
              {dashboard.restaurants.map((restaurant) => (
                <button
                  key={restaurant._id}
                  onClick={() => handleRestaurantClick(restaurant._id)}
                  className="w-full bg-gray-100 p-4 rounded-lg shadow hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                >
                  <h3 className="text-lg font-semibold text-gray-700">
                    {restaurant.name}
                  </h3>
                  <p className="text-sm text-gray-500">{restaurant.location}</p>
                </button>
              ))}
            </div>
          )}

          {dashboard.restaurants.length === 0 && (
            <div className="mt-6 text-center text-gray-500">
              <p>No restaurants added yet.</p>
              <p>Click "Add Restaurant" to get started!</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Button
              onClick={() => setShowRestaurantForm(!showRestaurantForm)}
              color="blue"
            >
              Add Restaurant
            </Button>
          </div>

          {showRestaurantForm && (
            <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-md">
              <input
                type="text"
                placeholder="Restaurant Name"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full p-3 border rounded-lg mb-3"
              />
              <input
                type="text"
                placeholder="Restaurant Location"
                value={restaurantLocation}
                onChange={(e) => setRestaurantLocation(e.target.value)}
                className="w-full p-3 border rounded-lg mb-3"
              />
              <div className="flex justify-end">
                <Button color="green" onClick={handleAddRestaurant}>
                  Save Restaurant
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
