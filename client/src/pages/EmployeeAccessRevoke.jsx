import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { revokeEmployeeAccess } from "../redux/slices/userAccessSlice";
import { fetchRestaurant } from "../redux/slices/restaurantSlice";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FiArrowLeft } from "react-icons/fi";
import { Alert } from "flowbite-react";

export default function EmployeeAccessRevoke() {
  const { dashboardId, restaurantId, userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null); // Declare error state

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
      } else {
        setError("Failed to revoke access. Please try again.");
      }
    } else {
      setError("Authentication token is missing. Please try again.");
    }
  };

  if (!employee) return <div>Employee not found.</div>;

  return (
    <div className="bg-gray-100 p-6">
      {/* Back Button */}
      <button
        onClick={() =>
          navigate(
            `/dashboards/${dashboardId}/restaurant/${restaurantId}/employee-access`
          )
        }
        className="mb-4 flex items-center text-blue-500 hover:underline"
      >
        <FiArrowLeft className="mr-2" />
        Back to Employee Access
      </button>

      <h1 className="text-2xl font-bold mb-6">Revoke Employee Access</h1>

      <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
        {/* Error Alert */}
        {error && (
          <div className="mb-4">
            <Alert color="failure">{error}</Alert>
          </div>
        )}

        {/* Employee Information */}
        <div className="mb-6">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Email:</strong> {employee.userEmail}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Role:</strong>{" "}
            {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
          </p>
        </div>

        {/* Revoke Button */}
        <button
          onClick={handleRevokeAccess}
          disabled={isRestaurantOwner}
          className={`w-full px-4 py-2 rounded-lg text-white font-semibold ${
            isRestaurantOwner
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          Confirm Revoke Access
        </button>

        {isRestaurantOwner && (
          <p className="text-gray-600 mt-4 text-sm">
            The restaurant main admin cannot remove their own access.
          </p>
        )}
      </div>
    </div>
  );
}
