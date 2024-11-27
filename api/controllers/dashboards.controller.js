import Dashboard from "../models/dashboard.model.js";
import User from "../models/user.model.js";
import { errorHandler } from "../utils/error.js";
import dotenv from "dotenv";

dotenv.config();

export const createDashboard = async (req, res, next) => {
  const { uid } = req.user;

  try {
    const user = await User.findOne({ uid });
    if (!user) {
      return next(errorHandler(404, "User not found"));
    }

    if (!user.roles.includes("restaurant main admin")) {
      return next(
        errorHandler(403, "You do not have permission to create a dashboard")
      );
    }

    const existingDashboard = await Dashboard.findOne({
      dashboardOwnerId: uid,
    });
    if (existingDashboard) {
      return next(errorHandler(400, "You already own a dashboard"));
    }

    // Create new dashboard
    const newDashboard = new Dashboard({
      dashboardOwnerId: uid,
      restaurants: [],
      userAccess: [
        {
          userId: user.uid,
          userEmail: user.email,
          role: "restaurant main admin",
        },
      ],
    });

    // Save the dashboard
    await newDashboard.save();

    // Add the new dashboard ID to the user's accessibleDashboards
    user.accessibleDashboards.push(newDashboard._id.toString());
    await user.save();

    res.status(201).json({
      message: "Dashboard created successfully",
      dashboard: newDashboard,
      accessibleDashboards: user.accessibleDashboards,
    });
  } catch (error) {
    console.error("Error creating dashboard:", error);
    next(errorHandler(500, "Server error"));
  }
};

export const getAllDashboards = async (req, res, next) => {
  try {
    const dashboards = await Dashboard.find().populate({
      path: "restaurants",
      select: "name location userAccess",
    });

    // Fetch the dashboard owner emails
    const ownerIds = dashboards.map((dashboard) => dashboard.dashboardOwnerId);
    const owners = await User.find({ uid: { $in: ownerIds } }, "uid email");

    const ownerEmailMap = owners.reduce((acc, owner) => {
      acc[owner.uid] = owner.email;
      return acc;
    }, {});

    // Format response to include owner email
    const formattedDashboards = dashboards.map((dashboard) => ({
      _id: dashboard._id,
      dashboardOwnerId: dashboard.dashboardOwnerId,
      dashboardOwnerEmail:
        ownerEmailMap[dashboard.dashboardOwnerId] || "Unknown",
      userAccess: dashboard.userAccess,
      restaurants: dashboard.restaurants.map((restaurant) => ({
        _id: restaurant._id,
        name: restaurant.name,
        location: restaurant.location,
      })),
    }));

    res.status(200).json({ dashboards: formattedDashboards });
  } catch (error) {
    console.error("Error fetching all dashboards:", error);
    next(errorHandler(500, "Failed to fetch dashboards"));
  }
};

// getDashboards controller
export const getDashboards = async (req, res, next) => {
  try {
    const { uid } = req.user;

    // Fetch dashboards where the user is either the owner or an employee with access
    const dashboards = await Dashboard.find({
      $or: [{ dashboardOwnerId: uid }, { "userAccess.userId": uid }],
    }).populate({
      path: "restaurants",
      select: "name location userAccess",
    });

    // Format response with filtered restaurants based on user access
    const formattedDashboards = await Promise.all(
      dashboards.map(async (dashboard) => {
        const isMainAdmin = dashboard.dashboardOwnerId === uid;
        const role = isMainAdmin ? "Restaurant Main Admin" : "Restaurant Admin";

        // Fetch the dashboard owner's email
        const owner = await User.findOne({ uid: dashboard.dashboardOwnerId });
        const dashboardOwnerEmail = owner ? owner.email : "Unknown";

        // Filter restaurants: Main Admin sees all, invited Admin sees only assigned restaurants
        const accessibleRestaurants = isMainAdmin
          ? dashboard.restaurants // Main Admin can see all restaurants
          : dashboard.restaurants.filter((restaurant) =>
              restaurant.userAccess.some((emp) => emp.userId === uid)
            );

        return {
          _id: dashboard._id,
          dashboardOwnerEmail,
          role,
          userAccess: dashboard.userAccess,
          restaurants: accessibleRestaurants.map((restaurant) => ({
            _id: restaurant._id,
            name: restaurant.name,
            location: restaurant.location,
          })),
        };
      })
    );

    res.status(200).json({ dashboards: formattedDashboards });
  } catch (error) {
    console.error("Error fetching dashboards:", error);
    next(errorHandler(500, "Failed to fetch dashboards"));
  }
};

export const deleteDashboard = async (req, res, next) => {
  const { dashboardId } = req.params;

  try {
    const dashboard = await Dashboard.findById(dashboardId);
    if (!dashboard) {
      return next(errorHandler(404, "Dashboard not found"));
    }

    // Extract the token from the request headers
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return next(errorHandler(401, "Authorization token is required"));
    }

    // Call the deleteRestaurant endpoint for each restaurant
    for (const restaurantId of dashboard.restaurants) {
      try {
        const response = await fetch(
          `${process.env.API_BASE_URL}/api/restaurants/${restaurantId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          console.warn(
            `Failed to delete restaurant ${restaurantId}. Status: ${response.status}`
          );
        }
      } catch (err) {
        console.error(
          `Error deleting restaurant ${restaurantId}: ${err.message}`
        );
      }
    }

    // Remove dashboard ID from accessibleDashboards of all users
    await User.updateMany(
      { accessibleDashboards: dashboardId },
      { $pull: { accessibleDashboards: dashboardId } }
    );

    // Delete the dashboard
    await dashboard.deleteOne();

    res.status(200).json({ message: "Dashboard deleted successfully" });
  } catch (error) {
    console.error(`Error deleting dashboard: ${error.message}`);
    next(errorHandler(500, "Failed to delete dashboard"));
  }
};
