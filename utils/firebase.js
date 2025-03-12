// import { initializeApp } from "firebase/app";
// import { getMessaging, getToken, onMessage } from "firebase/messaging";

// const firebaseConfig = {

// };

// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);
// export const requestPermission = async () => {
//     try {
//       const permission = await Notification.requestPermission();
//       if (permission === "granted") {
//         console.log("Notification permission granted.");
//         const token = await getToken(messaging, {
//           vapidKey: "YOUR_VAPID_KEY", // Get this from Firebase Console
//         });
//         console.log("FCM Token:", token);
//         return token;
//       } else {
//         console.log("Permission denied");
//         return null;
//       }
//     } catch (error) {
//       console.error("Error getting FCM token:", error);
//       return null;
//     }
//   };
  
//   // Listen for incoming messages
//   export const onMessageListener = () =>
//     new Promise((resolve) => {
//       onMessage(messaging, (payload) => {
//         console.log("Message received: ", payload);
//         resolve(payload);
//       });
//     });
