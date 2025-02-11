// import { initializeApp } from "firebase/app";
// import { getMessaging, getToken, onMessage } from "firebase/messaging";

// const firebaseConfig = {
//     apiKey: "AIzaSyC1ABpOmoZXa20qMlID88QSyA1FOr4dV6c",
//     authDomain: "samarthmeet-ee38d.firebaseapp.com",
//     projectId: "samarthmeet-ee38d",
//     storageBucket: "samarthmeet-ee38d.firebasestorage.app",
//     messagingSenderId: "981549354650",
//     appId: "1:981549354650:web:9a1db207116ceff2d2d923",
//     measurementId: "G-XWGXQHCLN1"
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