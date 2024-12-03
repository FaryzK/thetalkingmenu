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
    <div className="bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">
        Hello, {dashboard.dashboardOwnerName}
      </h1>

      {/* My Restaurants Section */}
      <MyRestaurants
        restaurants={dashboard.restaurants}
        onRestaurantClick={handleRestaurantClick}
        onAddRestaurant={handleAddRestaurant}
      />
    </div>
  );
}
