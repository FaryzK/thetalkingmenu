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
