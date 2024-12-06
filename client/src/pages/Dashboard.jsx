import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  fetchDashboards,
  clearDashboardsState,
} from "../redux/slices/dashboardsSlice";
import { createRestaurant } from "../redux/slices/restaurantSlice";
import MyRestaurants from "../components/MyRestaurants"; // Import the component
import FlowbiteBreadcrumbs from "../components/FlowbiteBreadcrumbs";

export default function Dashboard() {
  const { dashboardId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

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

  const handleAddRestaurant = async ({ name, location }) => {
    const auth = getAuth();
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      alert("No user is logged in");
      return;
    }

    const token = await firebaseUser.getIdToken();
    const restaurantData = { name, location };

    dispatch(createRestaurant({ token, dashboardId, restaurantData })).unwrap();
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
        {/* Header */}

        {/* Restaurants Section */}
        <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
            My Restaurants
          </h2>
          <MyRestaurants
            restaurants={dashboard.restaurants}
            onRestaurantClick={handleRestaurantClick}
            onAddRestaurant={handleAddRestaurant}
          />
        </div>

        {/* Empty State */}
        {dashboard.restaurants.length === 0 && (
          <div className="mt-6 text-center text-gray-500">
            <p>No restaurants added yet.</p>
            <p>Click "Add Restaurant" to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
}
