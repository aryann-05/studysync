import admin from "firebase-admin";
import config from "./env.js";

let messaging = null;

try {
  if (
    config.firebase.projectId &&
    config.firebase.clientEmail &&
    config.firebase.privateKey
  ) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        clientEmail: config.firebase.clientEmail,
        privateKey: config.firebase.privateKey,
      }),
    });
    messaging = admin.messaging();
    console.log("✅ Firebase Admin SDK initialized successfully");
  } else {
    console.warn("ℹ️ Firebase credentials not fully configured in .env. FCM push notifications running in simulation mode.");
  }
} catch (error) {
  console.warn("⚠️ Firebase Admin initialization failed:", error.message);
}

export { admin, messaging };
export default messaging;

