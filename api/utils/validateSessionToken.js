// The session token is stored in the frontend's localStorage and sent as a header (X-Session-Token). We should make sure this header exists in every incoming request

export const validateSessionToken = (req, res, next) => {
  const sessionToken = req.headers["x-session-token"];
  if (!sessionToken) {
    console.error("❌ Missing session token");
    return res.status(401).json({ error: "Session token is missing." });
  }
  req.sessionToken = sessionToken; // 🟢 Attach token to request object
  //   console.log("✅ Valid Session Token:", sessionToken);
  next();
};
