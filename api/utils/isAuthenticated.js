import firebase from "../../firebase.js";
import { errorHandler } from "./error.js";

// Middleware to check if the user is authenticated
export const isAuthenticated = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get the token from the "Authorization" header

  if (!token) {
    return next(errorHandler(401, "No token provided, authorization denied"));
  }

  try {
    // Verify the token with Firebase
    const decodedToken = await firebase.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach the decoded token (user info) to the request object
    next(); // Proceed to the next middleware/controller
  } catch (error) {
    return next(errorHandler(401, "Token is invalid or expired"));
  }
};
