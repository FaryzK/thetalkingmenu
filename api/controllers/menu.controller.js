import mongoose from "mongoose";
import Menu from "../models/menu.model.js";
import { errorHandler } from "../utils/error.js";

export const getMenu = async (req, res, next) => {
  const { restaurantId } = req.params;
  try {
    const menu = await Menu.findOne({ restaurantId });
    if (!menu) return next(errorHandler(404, "Menu not found"));
    res.status(200).json(menu);
  } catch (error) {
    next(errorHandler(500, "Failed to fetch menu"));
  }
};

export const getMenuItem = async (req, res, next) => {
  const { restaurantId, menuItemId } = req.params;
  try {
    const menu = await Menu.findOne({ restaurantId });
    if (!menu) return next(errorHandler(404, "Menu not found"));
    const menuItem = menu.menuItems.id(menuItemId);
    if (!menuItem) return next(errorHandler(404, "Menu item not found"));
    res.status(200).json(menuItem);
  } catch (error) {
    next(errorHandler(500, "Failed to fetch menu item"));
  }
};

export const createMenuItem = async (req, res, next) => {
  const { restaurantId } = req.params;
  const { name, description, price } = req.body;
  try {
    let menu = await Menu.findOne({ restaurantId });
    if (!menu) menu = new Menu({ restaurantId, menuItems: [] });
    menu.menuItems.push({ name, description, price });
    await menu.save();
    res.status(201).json(menu);
  } catch (error) {
    next(errorHandler(500, "Failed to create menu item"));
  }
};

// export const uploadMenuItems = async (req, res, next) => {
//   const { restaurantId } = req.params;

//   if (!req.file) {
//     return next(errorHandler(400, "No file uploaded"));
//   }

//   try {
//     // Parse the CSV data
//     const csvData = req.file.buffer.toString("utf-8");
//     const { data, errors } = Papa.parse(csvData, {
//       header: true, // Treat the first row as column names
//       skipEmptyLines: true,
//     });

//     // Handle parsing errors
//     if (errors.length > 0) {
//       return next(errorHandler(400, "Invalid CSV format"));
//     }

//     // Validate and prepare the menu items
//     const validItems = data.map(({ name, price, description }) => {
//       if (!name || !price || isNaN(price)) {
//         throw errorHandler(
//           400,
//           "Each item must have 'name', 'price', and 'description'"
//         );
//       }
//       return {
//         name: name.trim(),
//         price: parseFloat(price),
//         description: description?.trim() || "",
//       };
//     });

//     // Fetch or create the menu
//     let menu = await Menu.findOne({ restaurantId });
//     if (!menu) {
//       menu = new Menu({ restaurantId, menuItems: [] });
//     }

//     // Add items and save
//     menu.menuItems.push(...validItems);
//     await menu.save();

//     res.status(201).json({ message: "Menu items uploaded successfully", menu });
//   } catch (error) {
//     console.error("Error uploading menu items:", error);
//     next(errorHandler(500, "Failed to upload menu items"));
//   }
// };

export const addMenuItemsBulk = async (req, res, next) => {
  const { restaurantId } = req.params;
  const { menuItems } = req.body;

  if (!menuItems || !Array.isArray(menuItems)) {
    return next(
      errorHandler(400, "Invalid data format. Expected an array of menu items.")
    );
  }

  try {
    // Add unique `_id` for each item
    const validItems = menuItems.map((item) => ({
      _id: new mongoose.Types.ObjectId(), // Explicitly generate unique `_id`
      name: item.name.trim(),
      price: parseFloat(item.price),
      description: item.description?.trim() || "",
    }));

    let menu = await Menu.findOne({ restaurantId });
    if (!menu) {
      menu = new Menu({ restaurantId, menuItems: [] });
    }

    menu.menuItems.push(...validItems); // Add items to menu
    await menu.save();

    res.status(201).json({
      message: "Menu items added successfully",
      menu: { menuItems: menu.menuItems },
    });
  } catch (error) {
    console.error("Error adding menu items in bulk:", error);
    next(errorHandler(500, "Failed to add menu items in bulk"));
  }
};

export const updateMenuItem = async (req, res, next) => {
  const { restaurantId, menuItemId } = req.params;
  const { name, description, price } = req.body;
  try {
    const menu = await Menu.findOne({ restaurantId });
    if (!menu) return next(errorHandler(404, "Menu not found"));
    const menuItem = menu.menuItems.id(menuItemId);
    if (!menuItem) return next(errorHandler(404, "Menu item not found"));
    Object.assign(menuItem, { name, description, price });
    await menu.save();
    res.status(200).json(menu);
  } catch (error) {
    next(errorHandler(500, "Failed to update menu item"));
  }
};

export const deleteMenuItem = async (req, res, next) => {
  const { restaurantId, menuItemId } = req.params;
  try {
    const menu = await Menu.findOne({ restaurantId });
    if (!menu) return next(errorHandler(404, "Menu not found"));

    const itemIndex = menu.menuItems.findIndex(
      (item) => item._id.toString() === menuItemId
    );

    if (itemIndex === -1) {
      return next(errorHandler(404, "Menu item not found"));
    }

    menu.menuItems.splice(itemIndex, 1); // Remove the item from the array
    await menu.save(); // Save the updated menu

    res.status(200).json({ message: "Menu item deleted" });
  } catch (error) {
    next(errorHandler(500, "Failed to delete menu item"));
  }
};
