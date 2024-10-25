import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const config = {
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Handle newlines
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
};

// Initialize the Firebase app (or get an existing app if it’s already initialized)
const firebase = admin.apps.length ? admin.app() : admin.initializeApp(config);

export default firebase;
