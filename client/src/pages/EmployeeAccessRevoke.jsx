import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { revokeEmployeeAccess } from "../redux/slices/userAccessSlice";
import { fetchRestaurant } from "../redux/slices/restaurantSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function EmployeeAccessRevoke() {
  const { dashboardId, restaurantId, userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);

  const { data: restaurant, status } = useSelector((state) => state.restaurant);

  useEffect(() => {
    const auth = getAuth();

    // Fetch restaurant data if not already available
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const fetchedToken = await user.getIdToken();
        setToken(fetchedToken);

        if (!restaurant || restaurant._id !== restaurantId) {
          await dispatch(
            fetchRestaurant({ token: fetchedToken, restaurantId })
          );
        }
      }
    });

    return () => unsubscribe();
  }, [dispatch, restaurantId, restaurant]);

  // Check loading and fetch status to ensure data is ready
  if (status === "loading") {
    return <div>Loading employee data...</div>;
  }

  // Find the employee only once restaurant data is available
  const employee = restaurant?.userAccess?.find((emp) => emp.userId === userId);
  const isRestaurantOwner = restaurant?.restaurantOwnerId === userId;

  const handleRevokeAccess = async () => {
    if (token) {
      const result = await dispatch(
        revokeEmployeeAccess({ dashboardId, restaurantId, userId, token })
      );
      if (!result.error) {
        navigate(
          `/dashboards/${dashboardId}/restaurant/${restaurantId}/employee-access`
        );
      }
    }
  };

  if (!employee) return <div>Employee not found.</div>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Revoke Employee Access</h1>
      <div className="bg-white p-4 rounded-lg mb-4 shadow-md">
        <p>
          <strong>Email:</strong> {employee.userEmail}
        </p>
        <p>
          <strong>Role:</strong>{" "}
          {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
        </p>
      </div>
      <button
        onClick={handleRevokeAccess}
        className="bg-red-500 text-white py-2 px-4 rounded"
        disabled={isRestaurantOwner}
      >
        Confirm Revoke Access
      </button>
      {isRestaurantOwner && (
        <p className="text-gray-600 mt-2">
          The restaurant main admin cannot remove their own access.
        </p>
      )}
    </div>
  );
}
