// const admin = require("firebase-admin");
// const serviceAccount = require("./firebase-admin.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// const sendNotification = async (token, title, body) => {
//   try {
//     const message = {
//       notification: { title, body },
//       token: token,
//     };
//     await admin.messaging().send(message);
//     console.log("Notification sent successfully");
//   } catch (error) {
//     console.error("Error sending notification:", error);
//   }
// };

// module.exports = { sendNotification };
