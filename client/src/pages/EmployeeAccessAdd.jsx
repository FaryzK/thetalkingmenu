// EmployeeAccessAdd.jsx
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { addEmployeeAccess } from "../redux/slices/userAccessSlice"; // Moved to userAccessSlice
import { getAuth, onAuthStateChanged } from "firebase/auth";

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
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Add Employee Access</h1>

      {/* Form for adding employee */}
      <form
        onSubmit={handleAddEmployee}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        {error && <p className="text-red-500">{error}</p>}

        <div className="mb-4">
          <label className="block text-gray-700">Employee Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter employee's email"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Role</label>
          <input
            type="text"
            value="Restaurant Admin"
            readOnly
            className="w-full p-2 border border-gray-300 rounded bg-gray-200 cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Add Employee
        </button>
      </form>
    </div>
  );
}
