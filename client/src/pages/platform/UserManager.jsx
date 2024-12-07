// frontend/src/components/UserManager.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import {
  fetchUsers,
  updateUserRoles,
  setPage,
  setSearchTerm,
  selectUsers,
  selectTotalUsers,
  selectPage,
  selectSearchTerm,
  selectUserStatus,
} from "../../redux/slices/platformControlPanelUsersSlice";
import { onAuthStateChanged } from "firebase/auth";

import { getAuth } from "firebase/auth";
import { Modal, Button } from "flowbite-react";
import { FiArrowLeft } from "react-icons/fi";

export default function UserManager() {
  const dispatch = useDispatch();
  const auth = getAuth();
  const users = useSelector(selectUsers);
  const total = useSelector(selectTotalUsers);
  const page = useSelector(selectPage);
  const search = useSelector(selectSearchTerm);
  const status = useSelector(selectUserStatus);

  const [localSearch, setLocalSearch] = useState(search);
  const [selectedRoles, setSelectedRoles] = useState({});

  // For delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  const navigate = useNavigate();

  const totalPages = Math.ceil(total / 20);

  // Predefined roles list
  const rolesList = [
    "diner",
    "restaurant admin",
    "restaurant main admin",
    "the talking menu admin",
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        user.getIdToken().then((token) => {
          dispatch(fetchUsers({ token, page, search }));
        });
      }
    });
    return () => unsubscribe();
  }, [auth, dispatch, page, search]);

  // Debounce search changes
  const debouncedSetSearch = useCallback(
    debounce((newSearch) => {
      dispatch(setSearchTerm(newSearch));
    }, 500),
    [dispatch]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    debouncedSetSearch(value);
  };

  const handleAddRole = async (userId, roleToAdd) => {
    if (!roleToAdd.trim()) return;
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();
    const userObject = users.find((u) => u._id === userId);
    const updatedRoles = [...new Set([...userObject.roles, roleToAdd])];
    await dispatch(updateUserRoles({ token, userId, roles: updatedRoles }));
    setSelectedRoles((prev) => ({ ...prev, [userId]: "" }));
  };

  const confirmDeleteRole = (userId, role) => {
    setRoleToDelete(role);
    setUserIdToDelete(userId);
    setShowDeleteModal(true);
  };

  const handleRemoveRole = async () => {
    if (!roleToDelete || !userIdToDelete) return;
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();
    const userObject = users.find((u) => u._id === userIdToDelete);
    const updatedRoles = userObject.roles.filter((r) => r !== roleToDelete);
    await dispatch(
      updateUserRoles({ token, userId: userIdToDelete, roles: updatedRoles })
    );
    setShowDeleteModal(false);
    setRoleToDelete(null);
    setUserIdToDelete(null);
  };

  // Find the user associated with userIdToDelete
  const userToDeleteRoleFrom = users.find((u) => u._id === userIdToDelete);

  return (
    <div className="p-4">
      <button
        onClick={() => navigate(`/platform-control-panel`)}
        className="mb-4 flex items-center text-blue-500 hover:underline"
      >
        <FiArrowLeft className="mr-2" />
        Back to Admin
      </button>
      <h1 className="text-2xl mb-4">User Manager</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={localSearch}
          onChange={handleSearchChange}
          className="border p-2 rounded w-full md:w-1/2"
        />
      </div>

      {status === "loading" && <p>Loading users...</p>}
      {status === "failed" && <p>Failed to fetch users</p>}

      <table className="table-auto w-full border-collapse border border-gray-300 mt-4">
        <thead>
          <tr>
            <th className="border p-2">Username</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Roles</th>
            <th className="border p-2">Add Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="border p-2">{user.username}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className="inline-block bg-gray-200 rounded px-2 py-1 text-sm mr-2 mb-2"
                  >
                    {role}
                    {role !== "diner" && (
                      <button
                        className="ml-2 text-red-500"
                        onClick={() => confirmDeleteRole(user._id, role)}
                      >
                        x
                      </button>
                    )}
                  </span>
                ))}
              </td>
              <td className="border p-2">
                <select
                  value={selectedRoles[user._id] || ""}
                  onChange={(e) =>
                    setSelectedRoles((prev) => ({
                      ...prev,
                      [user._id]: e.target.value,
                    }))
                  }
                  className="border p-1 mr-2"
                >
                  <option value="">Select a role</option>
                  {rolesList.map((roleOption) => (
                    <option key={roleOption} value={roleOption}>
                      {roleOption}
                    </option>
                  ))}
                </select>
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() =>
                    handleAddRole(user._id, selectedRoles[user._id] || "")
                  }
                >
                  Add
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-center space-x-2">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={page === 1}
          onClick={() => dispatch(setPage(page - 1))}
        >
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={page === totalPages || totalPages === 0}
          onClick={() => dispatch(setPage(page + 1))}
        >
          Next
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <Modal.Header>Confirm Role Deletion</Modal.Header>
        <Modal.Body>
          {userToDeleteRoleFrom ? (
            <p>
              Are you sure you want to remove the role{" "}
              <strong>{roleToDelete}</strong> from this{" "}
              {userToDeleteRoleFrom.email}?
            </p>
          ) : (
            <p>Loading user info...</p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button color="gray" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button color="red" onClick={handleRemoveRole}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
