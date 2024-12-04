// EmployeeAccessAdd.jsx
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { addEmployeeAccess } from "../redux/slices/userAccessSlice"; // Moved to userAccessSlice
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FiArrowLeft } from "react-icons/fi";
import { Alert, Button } from "flowbite-react";
import { HiExclamationCircle } from "react-icons/hi";

export default function EmployeeAccessAdd() {
  const { dashboardId, restaurantId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState(null); // To store the user's token
  const [error, setError] = useState(null);

  // Non-editable role set to "Restaurant Admin"
  const role = "restaurant admin";

  // Get token on component mount
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

  // Handle form submission
  const handleAddEmployee = async (e) => {
    setError(null);
    e.preventDefault();

    if (!token) {
      setError("Failed to get authentication token. Please try again.");
      return;
    }

    const result = await dispatch(
      addEmployeeAccess({ email, role, dashboardId, restaurantId, token })
    );

    if (result.error) {
      // Access the error message from `result.payload` if available
      setError(result.payload || "An unexpected error occurred.");
    } else {
      navigate(
        `/dashboards/${dashboardId}/restaurant/${restaurantId}/employee-access`
      );
    }
  };

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

      <h1 className="text-2xl font-bold mb-6">Add Employee Access</h1>

      <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
        {error && (
          <Alert color="failure" icon={HiExclamationCircle}>
            {error}
          </Alert>
        )}

        {/* Form for adding employee */}
        <form onSubmit={handleAddEmployee} className="space-y-6">
          {/* Employee Email */}
          <div>
            <label
              htmlFor="employeeEmail"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Employee Email
            </label>
            <input
              id="employeeEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter employee's email"
            />
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Role
            </label>
            <input
              id="role"
              type="text"
              value="Restaurant Admin"
              readOnly
              className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed text-gray-500"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            color="blue"
            className="w-full font-semibold"
            disabled={!email || !token}
          >
            Add Employee
          </Button>
        </form>
      </div>
    </div>
  );
}
