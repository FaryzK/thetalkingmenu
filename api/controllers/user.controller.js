// backend/controllers/user.controller.js
import User from "../models/user.model.js";

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const query = {};
    if (search.trim()) {
      // Search by username or email (case-insensitive)
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ username: regex }, { email: regex }];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.status(200).json({ users, total });
  } catch (error) {
    next(error);
  }
};

export const updateUserRoles = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { roles } = req.body;

    if (!Array.isArray(roles)) {
      return res
        .status(400)
        .json({ message: "Roles must be an array of strings" });
    }

    // Filter roles to ensure they are allowed
    const allowedRoles = [
      "diner",
      "restaurant admin",
      "restaurant main admin",
      "the talking menu admin",
    ];
    const filteredRoles = roles.filter((r) => allowedRoles.includes(r));

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.roles = filteredRoles.length ? filteredRoles : ["diner"];
    await user.save();

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
