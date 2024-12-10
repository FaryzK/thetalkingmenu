import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { addMenuItem, addMenuItemsBulk } from "../redux/slices/menuSlice";
import { getAuth } from "firebase/auth";
import Papa from "papaparse";
import { clearMenuState } from "../redux/slices/menuSlice";
import { FiArrowLeft } from "react-icons/fi";
import { Accordion, Button, Tooltip } from "flowbite-react";

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
        // Normalize column headers to lowercase
        const normalizedData = results.data.map((row) => {
          const normalizedRow = {};
          for (const key in row) {
            if (Object.hasOwnProperty.call(row, key)) {
              normalizedRow[key.trim().toLowerCase()] = row[key];
            }
          }
          return normalizedRow;
        });

        const items = normalizedData.map((row) => ({
          name: row.name,
          price: parseFloat(row.price),
          description: row.description,
        }));

        const invalidItems = items.filter(
          (item) =>
            !item.name ||
            isNaN(item.price) ||
            item.price < 0 ||
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

  const handleDownloadTemplate = () => {
    const templateUrl = "/the_talking_menu_csv_template.csv"; // Relative to the public folder root
    const link = document.createElement("a");
    link.href = templateUrl;
    link.download = "menu_template.csv";
    link.click();
  };

  return (
    <div className="bg-gray-100 p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-blue-500 hover:underline"
      >
        <FiArrowLeft className="mr-2" />
        Back to Menu
      </button>

      <h2 className="text-2xl font-bold mb-4">Add Menu Item</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {uploadStatus && (
        <div className="text-green-500 mb-4">{uploadStatus}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Single Item */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Add Single Item</h3>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 border rounded w-2/3"
              />
              <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="p-2 border rounded w-1/3"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="font-semibold">Description</label>
              <Tooltip content="Include ingredients, if it's chef recommendations, and any of its highlights!">
                <span className="text-blue-500 hover:underline cursor-pointer">
                  Need help?
                </span>
              </Tooltip>
            </div>
            <textarea
              placeholder="e.g. A refreshing summer salad with organic greens, ripe strawberries, and a balsamic glaze. Ideal for a light lunch, best-seller, and currently on promo!'"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="p-2 border rounded w-full h-48"
            />
            <p className="text-sm text-gray-500 mt-2">
              The more detail you provide, the better our chatbot can assist
              diners!
            </p>

            <Button
              onClick={handleAddSingleItem}
              disabled={status === "loading"}
              color="blue"
              className={`w-full rounded ${
                status === "loading"
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-600"
              }`}
            >
              {status === "loading" ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </div>

        {/* Bulk Upload */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-4">Bulk Upload Items</h3>
            <Accordion collapseAll>
              <Accordion.Panel>
                <Accordion.Title>How to Upload CSV?</Accordion.Title>
                <Accordion.Content>
                  <p className="text-gray-700 mb-2">
                    Ensure your CSV has the following columns:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-4">
                    <li>
                      <strong>name</strong>: Name of the item. eg. "Cheese
                      burger"
                    </li>
                    <li>
                      <strong>price</strong>: Price of the item without dollar
                      sign. eg. "10.99"
                    </li>
                    <li>
                      <strong>description</strong>: Description of the item.
                      "Amazing juicy burger"
                    </li>
                  </ul>
                  <p className="text-gray-700 mb-2">
                    CSV needs to contain the headers. Download template to see
                    more.
                  </p>
                  <button
                    onClick={handleDownloadTemplate}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Download Template
                  </button>
                </Accordion.Content>
              </Accordion.Panel>
            </Accordion>
            <div className="mt-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="p-2 border rounded w-full"
              />
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={handleUpload}
              color="blue"
              className="w-full rounded hover:bg-blue-600"
            >
              Upload Items
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
