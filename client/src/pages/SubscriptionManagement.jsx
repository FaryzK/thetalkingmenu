import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [newSubscription, setNewSubscription] = useState({
    name: "",
    tokenLimitPerMonth: 0,
    price: 0,
  });
  const [authToken, setAuthToken] = useState(null);

  console.log(subscriptions);

  // Fetch subscriptions from the database
  useEffect(() => {
    const auth = getAuth();

    const fetchSubscriptions = async (token) => {
      try {
        const res = await fetch("/api/subscriptions", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setSubscriptions(data);
        } else {
          console.error("Failed to fetch subscriptions:", res.statusText);
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      }
    };

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setAuthToken(token); // Store token in state
        fetchSubscriptions(token); // Fetch subscriptions if user is authenticated
      } else {
        console.error("User not authenticated");
      }
    });

    // Clean up listener on component unmount
    return () => unsubscribe();
  }, []);

  // Handle editing a subscription
  const handleEdit = (subscription) => {
    setEditingSubscription(subscription);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingSubscription((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = async (subscription) => {
    try {
      const res = await fetch(`/api/subscriptions/${subscription._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(editingSubscription),
      });
      if (res.ok) {
        setSubscriptions((prev) =>
          prev.map((sub) =>
            sub._id === subscription._id ? editingSubscription : sub
          )
        );
        setEditingSubscription(null);
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
    }
  };

  // Handle deleting a subscription
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (res.ok) {
        setSubscriptions((prev) => prev.filter((sub) => sub._id !== id));
      }
    } catch (error) {
      console.error("Error deleting subscription:", error);
    }
  };

  // Handle creating a new subscription
  const handleNewSubscriptionChange = (e) => {
    const { name, value } = e.target;
    setNewSubscription((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateSubscription = async () => {
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(newSubscription),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscriptions((prev) => [...prev, data]);
        setNewSubscription({ name: "", tokenLimitPerMonth: 0, price: 0 });
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Subscription Management</h1>

      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <thead>
          <tr>
            <th className="py-2 px-4 bg-gray-200 text-center">Name</th>
            <th className="py-2 px-4 bg-gray-200 text-center">
              Token Limit/Month
            </th>
            <th className="py-2 px-4 bg-gray-200 text-center">Price ($)</th>
            <th className="py-2 px-4 bg-gray-200 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((subscription) => (
            <tr key={subscription._id}>
              {editingSubscription?._id === subscription._id ? (
                <>
                  <td className="text-center">
                    <input
                      name="name"
                      value={editingSubscription.name}
                      onChange={handleEditChange}
                      className="text-center"
                    />
                  </td>
                  <td className="text-center">
                    <input
                      name="tokenLimitPerMonth"
                      type="number"
                      value={editingSubscription.tokenLimitPerMonth}
                      onChange={handleEditChange}
                      className="text-center"
                    />
                  </td>
                  <td className="text-center">
                    <input
                      name="price"
                      type="number"
                      value={editingSubscription.price}
                      onChange={handleEditChange}
                      className="text-center"
                    />
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => handleSaveEdit(subscription)}
                      className="px-2 py-1 bg-green-500 text-white rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingSubscription(null)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                    >
                      Cancel
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="py-2 px-4 text-center">{subscription.name}</td>
                  <td className="py-2 px-4 text-center">
                    {subscription.tokenLimitPerMonth}
                  </td>
                  <td className="py-2 px-4 text-center">
                    ${subscription.price}
                  </td>
                  <td className="py-2 px-4 text-center">
                    <button
                      onClick={() => handleEdit(subscription)}
                      className="w-16 px-2 py-1 bg-blue-500 text-white rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(subscription._id)}
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

      {/* Create New Subscription */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Create New Subscription</h2>
        <input
          name="name"
          placeholder="Name"
          value={newSubscription.name}
          onChange={handleNewSubscriptionChange}
          className="px-4 py-2 mr-2 border rounded"
        />
        <input
          name="tokenLimitPerMonth"
          type="number"
          placeholder="Token Limit per Month"
          value={newSubscription.tokenLimitPerMonth}
          onChange={handleNewSubscriptionChange}
          className="px-4 py-2 mr-2 border rounded"
        />
        <input
          name="price"
          type="number"
          placeholder="Price"
          value={newSubscription.price}
          onChange={handleNewSubscriptionChange}
          className="px-4 py-2 mr-2 border rounded"
        />
        <button
          onClick={handleCreateSubscription}
          className="px-4 py-2 bg-green-500 text-white rounded mt-4"
        >
          Create Subscription
        </button>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
