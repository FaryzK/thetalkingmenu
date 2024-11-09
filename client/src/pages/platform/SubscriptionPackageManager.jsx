import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const SubscriptionPackageManager = () => {
  const [subscriptionPackages, setSubscriptionPackages] = useState([]);
  const [editingSubscriptionPackage, setEditingSubscriptionPackage] =
    useState(null);
  const [newSubscriptionPackage, setNewSubscriptionPackage] = useState({
    name: "",
    tokenLimitPerMonth: 0,
    price: 0,
    paymentSchedule: "monthly", // Default to monthly
  });

  const [authToken, setAuthToken] = useState(null);

  // Fetch subscriptions from the database
  useEffect(() => {
    const auth = getAuth();

    const fetchSubscriptionPackages = async (token) => {
      try {
        const res = await fetch("/api/subscription-package", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setSubscriptionPackages(data);
        } else {
          console.error(
            "Failed to fetch subscription Packages:",
            res.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching subscription Packages:", error);
      }
    };

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setAuthToken(token); // Store token in state
        fetchSubscriptionPackages(token); // Fetch subscription packages if user is authenticated
      } else {
        console.error("User not authenticated");
      }
    });

    // Clean up listener on component unmount
    return () => unsubscribe();
  }, []);

  // Handle editing a subscription
  const handleEdit = (subscriptionPackage) => {
    setEditingSubscriptionPackage(subscriptionPackage);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingSubscriptionPackage((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async (subscriptionPackage) => {
    try {
      const res = await fetch(
        `/api/subscription-package/${subscriptionPackage._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(editingSubscriptionPackage),
        }
      );
      if (res.ok) {
        setSubscriptionPackages((prev) =>
          prev.map((sub) =>
            sub._id === subscriptionPackage._id
              ? editingSubscriptionPackage
              : sub
          )
        );
        setEditingSubscriptionPackage(null);
      }
    } catch (error) {
      console.error("Error updating subscription package:", error);
    }
  };

  // Handle deleting a subscription
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/subscription-package/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        setSubscriptionPackages((prev) => prev.filter((sub) => sub._id !== id));
      }
    } catch (error) {
      console.error("Error deleting subscription package:", error);
    }
  };

  // Handle creating a new subscription
  const handleNewSubscriptionPackageChange = (e) => {
    const { name, value } = e.target;
    setNewSubscriptionPackage((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateSubscriptionPackage = async () => {
    try {
      const res = await fetch("/api/subscription-package", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(newSubscriptionPackage),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscriptionPackages((prev) => [...prev, data]);
        setNewSubscriptionPackage({
          name: "",
          tokenLimitPerMonth: 0,
          price: 0,
        });
      }
    } catch (error) {
      console.error("Error creating subscription package:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Subscription Package Manager</h1>

      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200 text-center">Name</th>
            <th className="py-2 px-4 bg-gray-200 text-center">
              Token Limit/Month
            </th>
            <th className="py-2 px-4 bg-gray-200 text-center">Price ($)</th>
            <th className="py-2 px-4 bg-gray-200 text-center">
              Payment Schedule
            </th>
            <th className="py-2 px-4 bg-gray-200 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscriptionPackages.map((subscriptionPackage) => (
            <tr key={subscriptionPackage._id}>
              {editingSubscriptionPackage?._id === subscriptionPackage._id ? (
                <>
                  <td className="text-center">
                    <input
                      name="name"
                      value={editingSubscriptionPackage.name}
                      onChange={handleEditChange}
                      className="text-center"
                    />
                  </td>
                  <td className="text-center">
                    <input
                      name="tokenLimitPerMonth"
                      type="number"
                      value={editingSubscriptionPackage.tokenLimitPerMonth}
                      onChange={handleEditChange}
                      className="text-center"
                    />
                  </td>
                  <td className="text-center">
                    <input
                      name="price"
                      type="number"
                      value={editingSubscriptionPackage.price}
                      onChange={handleEditChange}
                      className="text-center"
                    />
                  </td>
                  <td className="text-center">
                    <select
                      name="paymentSchedule"
                      value={editingSubscriptionPackage.paymentSchedule}
                      onChange={handleEditChange}
                      className="text-center"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => handleSaveEdit(subscriptionPackage)}
                      className="px-2 py-1 bg-green-500 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingSubscriptionPackage(null)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-2 px-4 text-center">
                    {subscriptionPackage.name}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {subscriptionPackage.tokenLimitPerMonth}
                  </td>
                  <td className="py-2 px-4 text-center">
                    ${subscriptionPackage.price}
                  </td>
                  <td className="py-2 px-4 text-center">
                    {subscriptionPackage.paymentSchedule}
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button
                      onClick={() => handleEdit(subscriptionPackage)}
                      className="w-16 px-2 py-1 bg-blue-500 text-white rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subscriptionPackage._id)}
                      className="w-16 px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Create New Subscription Package */}
      <div className="bg-gray-100 p-4 rounded-lg flex items-center space-x-4">
        <input
          name="name"
          placeholder="Name"
          value={newSubscriptionPackage.name}
          onChange={handleNewSubscriptionPackageChange}
          className="px-4 py-2 border rounded w-1/4"
        />
        <input
          name="tokenLimitPerMonth"
          type="number"
          placeholder="Token Limit per Month"
          value={newSubscriptionPackage.tokenLimitPerMonth}
          onChange={handleNewSubscriptionPackageChange}
          className="px-4 py-2 border rounded w-1/4"
        />
        <input
          name="price"
          type="number"
          placeholder="Price"
          value={newSubscriptionPackage.price}
          onChange={handleNewSubscriptionPackageChange}
          className="px-4 py-2 border rounded w-1/4"
        />
        <select
          name="paymentSchedule"
          value={newSubscriptionPackage.paymentSchedule}
          onChange={handleNewSubscriptionPackageChange}
          className="px-4 py-2 border rounded w-1/4"
        >
          <option value="monthly">Monthly</option>
          <option value="annually">Annually</option>
        </select>
        <button
          onClick={handleCreateSubscriptionPackage}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Create
        </button>
      </div>
    </div>
  );
};

export default SubscriptionPackageManager;
