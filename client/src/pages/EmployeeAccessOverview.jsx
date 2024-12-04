import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchRestaurant } from "../redux/slices/restaurantSlice";
import { FiArrowLeft } from "react-icons/fi";
import { FiChevronRight } from "react-icons/fi";
import { Button } from "flowbite-react";

export default function EmployeeAccessOverview() {
  const { dashboardId, restaurantId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: restaurant, status } = useSelector((state) => state.restaurant);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const fetchData = async () => {
          const token = await user.getIdToken();
          await dispatch(fetchRestaurant({ token, restaurantId }));
          setLoading(false);
        };
        fetchData();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [dispatch, restaurantId]);

  const userAccess = restaurant?.userAccess || [];

  // Filtered employees based on search term
  const filteredEmployees = userAccess.filter(
    (employee) =>
      employee.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100">
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

      <h1 className="text-2xl font-bold mb-4">Manage Employee Access</h1>

      {/* Search Bar and Add Button */}
      <div className="max-w-4xl mx-auto flex items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by email or role"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          color="blue"
          onClick={() =>
            navigate(
              `/dashboards/${dashboardId}/restaurant/${restaurantId}/employee-access-add`
            )
          }
          className="rounded"
        >
          Add Employee
        </Button>
      </div>

      {/* Employee List */}
      <div className="max-w-4xl mx-auto space-y-4">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <button
              key={employee.userId}
              onClick={() =>
                navigate(
                  `/dashboards/${dashboardId}/restaurant/${restaurantId}/employee-access-revoke/${employee.userId}`
                )
              }
              className="w-full text-left bg-white p-4 rounded-lg shadow hover:bg-gray-100 transition flex justify-between items-center"
            >
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Email:</strong> {employee.userEmail}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Role:</strong>{" "}
                  {employee.role.charAt(0).toUpperCase() +
                    employee.role.slice(1)}
                </p>
              </div>
              <FiChevronRight className="text-gray-400" />
            </button>
          ))
        ) : (
          <p className="text-center text-gray-500">
            No employees match your search criteria.
          </p>
        )}
      </div>
    </div>
  );
}
