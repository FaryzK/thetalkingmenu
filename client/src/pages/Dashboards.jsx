import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { dashboardAllowedRoles } from "../utils/allowedRoles";
import { getAuth } from "firebase/auth";

export default function Dashboard() {
  const { currentUser } = useSelector((state) => state.user); // Access currentUser from Redux state
  const [dashboards, setDashboards] = useState([]);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Set the user role if currentUser exists and has roles
    if (currentUser && dashboardAllowedRoles.includes(currentUser.role)) {
      setUserRole(currentUser.role);
    }
    // Fetch existing dashboards logic here (if needed)
  }, [currentUser]);

  const createDashboard = async () => {
    try {
      const auth = getAuth(); // Get the Firebase auth instance
      const firebaseUser = auth.currentUser; // Get the currently authenticated user

      if (!firebaseUser) {
        alert("No user is logged in");
        return;
      }

      // Get the user's ID token from Firebase
      const token = await firebaseUser.getIdToken();

      const response = await fetch("/api/dashboards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
        body: JSON.stringify({
          subscriptionId: null, // You can pass the actual subscription plan ID here
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Add the new dashboard to the list
        setDashboards([...dashboards, data.dashboard]);
      } else {
        alert(data.message || "Failed to create dashboard");
      }
    } catch (error) {
      console.error("Error creating dashboard", error);
      alert("An error occurred while creating the dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        MY DASHBOARDS
      </h1>
      {dashboards.map((dashboard, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700">
            {dashboard.email}
          </h2>
          <p className="text-gray-500">Role: {userRole}</p>
        </div>
      ))}
      <button
        onClick={createDashboard}
        className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg"
      >
        Create Dashboard
      </button>
    </div>
  );
}
