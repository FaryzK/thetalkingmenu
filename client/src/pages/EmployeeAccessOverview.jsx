import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { fetchRestaurant } from "../redux/slices/restaurantSlice";

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

  if (loading || status === "loading") {
    return <div>Loading employee access data...</div>;
  }

  const userAccess = restaurant?.userAccess || [];

  // Filtered employees based on search term
  const filteredEmployees = userAccess.filter(
    (employee) =>
      employee.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 ">
      <h1 className="text-2xl font-bold mb-4">Manage Employee Access</h1>

      {/* Search Bar and Add Button */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by email or role"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-300 rounded w-2/3"
        />
        <button
          onClick={() =>
            navigate(
              `/dashboards/${dashboardId}/restaurant/${restaurantId}/employee-access-add`
            )
          }
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Add Employee
        </button>
      </div>

      {/* Employee List */}
      {filteredEmployees.length > 0 ? (
        filteredEmployees.map((employee) => (
          <div
            key={employee.userId}
            className="bg-white p-4 rounded-lg mb-4 shadow-md cursor-pointer"
            onClick={() =>
              navigate(
                `/dashboards/${dashboardId}/restaurant/${restaurantId}/employee-access-revoke/${employee.userId}`
              )
            }
          >
            <p>
              <strong>Email:</strong> {employee.userEmail}
            </p>
            <p>
              <strong>Role:</strong>{" "}
              {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
            </p>
          </div>
        ))
      ) : (
        <p>No employees match your search criteria.</p>
      )}
    </div>
  );
}
