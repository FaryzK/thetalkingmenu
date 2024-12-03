import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { addMenuItem, addMenuItemsBulk } from "../redux/slices/menuSlice";
import { getAuth } from "firebase/auth";
import Papa from "papaparse";
import { clearMenuState } from "../redux/slices/menuSlice";

export default function MenuAddItem() {
  const { restaurantId, dashboardId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [error, setError] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");

  const status = useSelector((state) => state.menu.status);

  // Handle single item addition
  const handleAddSingleItem = async () => {
    if (!name || !description || !price) {
      setError("Please fill in all fields: Name, Description, and Price.");
      return;
    }
    if (isNaN(price) || parseFloat(price) <= 0) {
      setError("Please enter a valid price greater than 0.");
      return;
    }

    try {
      setError("");
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const newItem = { name, description, price: parseFloat(price) };

      const resultAction = await dispatch(
        addMenuItem({ token, restaurantId, newItem })
      ).unwrap();

      if (resultAction) {
        navigate(`/dashboards/${dashboardId}/restaurant/${restaurantId}/menu`);
      }
    } catch (err) {
      setError("Failed to add menu item. Please try again.");
    }
  };

  // Handle bulk item upload
  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!csvFile) {
      setError("Please select a .csv file.");
      return;
    }

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const items = results.data.map((row) => ({
          name: row.name,
          price: parseFloat(row.price),
          description: row.description,
        }));

        const invalidItems = items.filter(
          (item) =>
            !item.name ||
            isNaN(item.price) ||
            item.price <= 0 ||
            !item.description
        );

        if (invalidItems.length > 0) {
          setError("Invalid items in CSV. Ensure all rows have valid data.");
          return;
        }

        try {
          const auth = getAuth();
          const token = await auth.currentUser.getIdToken();

          setError("");
          setUploadStatus("Uploading...");

          // Dispatch Redux action
          const resultAction = await dispatch(
            addMenuItemsBulk({ token, restaurantId, menuItems: items })
          ).unwrap();

          if (resultAction) {
            dispatch(clearMenuState());
            setUploadStatus("Upload successful!");
            navigate(
              `/dashboards/${dashboardId}/restaurant/${restaurantId}/menu`
            );
          }
        } catch (err) {
          console.error("Error caught in handleUpload:", err);
          setError("Failed to upload menu items. Please try again.");
        } finally {
          setUploadStatus("");
        }
      },
      error: (err) => {
        console.error("Error parsing CSV:", err);
        setError(`Error parsing CSV: ${err.message}`);
      },
    });
  };

  return (
    <div className=" bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4">Add Menu Item</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {uploadStatus && (
        <div className="text-green-500 mb-4">{uploadStatus}</div>
      )}

      {/* Add Single Item */}
      <h3 className="text-lg font-semibold mb-2">Add Single Item</h3>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="p-2 border rounded w-full mb-2"
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="p-2 border rounded w-full mb-2"
      />
      <input
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="p-2 border rounded w-full mb-2"
      />
      <button
        onClick={handleAddSingleItem}
        disabled={status === "loading"}
        className={`px-4 py-2 bg-green-500 text-white rounded mt-4 ${
          status === "loading" ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {status === "loading" ? "Adding..." : "Add Item"}
      </button>

      <hr className="my-6" />

      {/* Bulk Upload */}
      <h3 className="text-lg font-semibold mb-2">Bulk Upload Items</h3>

      <div className="bg-yellow-100 p-4 rounded-lg shadow-md mt-4">
        <h4 className="text-lg font-bold mb-2">CSV Format Guidelines</h4>
        <p className="text-gray-700 mb-2">
          Please ensure your CSV file is properly formatted with the following
          columns:
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          <li>
            <strong>name</strong>: The name of the menu item (e.g.,
            "Cheeseburger")
          </li>
          <li>
            <strong>price</strong>: The price of the menu item as a number
            (e.g., "10.99")
          </li>
          <li>
            <strong>description</strong>: A description of the menu item (e.g.,
            "A juicy beef burger with cheese")
          </li>
        </ul>
      </div>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="p-2 border rounded w-full mb-2"
      />
      <button
        onClick={handleUpload}
        className="px-4 py-2 bg-blue-500 text-white rounded mt-4"
      >
        Upload Items
      </button>
    </div>
  );
}
