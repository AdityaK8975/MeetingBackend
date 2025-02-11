const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "jlee03046@gmail.com", // 🔹 Replace with your email
    pass: "fvihtfduuhsrjsbz",   // 🔹 Use an app password, NOT your real password!
  },
});

/**
 * Send email notifications to invited users
 * @param {Array} invitedUsers - List of users with { email, name }
 * @param {Object} meetingData - Meeting details
 */
const sendEmailNotification = async (invitedUsers, meetingData) => {
  try {
    if (!invitedUsers || invitedUsers.length === 0) {
      console.warn("⚠️ No users to notify.");
      return;
    }
console.log(invitedUsers);

    // Create email promises for all users
    const emailPromises = invitedUsers.map(async (user) => {
      if (!user.email) {
        console.warn(`⚠️ Skipping user ${user.name}, no email provided.`);
        return;
      }

      const mailOptions = {
        from: "jlee03046@gmail.com",
        to: user.email,
        subject: `📢 New Meeting Invitation: ${meetingData.title}`,
        html: `

          <h3>Hello ${user.name},</h3>
          <p>You have been invited to a meeting.</p>
          <p><strong>Title:</strong> ${meetingData.title}</p>
          <p><strong>Description:</strong> ${meetingData.description}</p>
          <p><strong>Date:</strong> ${meetingData.date}</p>
          <p><strong>Time:</strong> ${meetingData.timeFrom}-${meetingData.timeTo}</p>
          <p><strong>Meeting Type:</strong> ${meetingData.meetingType}</p>
          <p><strong>Meeting Link:</strong> <a href="${meetingData.meetingLink}">${meetingData.meetingLink}</a></p>
          <p>Please confirm your attendance.</p>
          <br>
          <p>Best Regards,<br>SamarthMeet Team</p>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYTW7xmLbkJHN5DyB16vIfuL6UZBhpndHep6UUx36TRRG7TLjmfJjEGdqKKTup_ioMJr8&usqp=CAU" width="150" alt="SamarthMeet Logo"/>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent to ${user.email}`);
      } catch (error) {
        console.error(`❌ Failed to send email to ${user.email}:`, error);
      }
    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);
    console.log("📨 All emails processed.");
  } catch (error) {
    console.error("❌ Unexpected error in sendEmailNotification:", error);
  }
};

const sendMeetingCancellationEmail = async (invitedUsers, meetingData) => {
  try {
    if (!invitedUsers || invitedUsers.length === 0) {
      console.warn("⚠️ No users to notify.");
      return;
    }

    console.log("📢 Sending meeting cancellation emails...");

    // Create email promises for all users
    const emailPromises = invitedUsers.map(async (user) => {
      if (!user.email) {
        console.warn(`⚠️ Skipping user ${user.name}, no email provided.`);
        return;
      }

      const mailOptions = {
        from: "jlee03046@gmail.com",
        to: user.email,
        subject: `⚠️ Meeting Canceled: ${meetingData.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #f44336; border-radius: 5px; max-width: 600px; background-color: #ffebee;">
            <h3 style="color: #d32f2f;">Hello ${user.name},</h3>
            <p>Unfortunately, the following meeting has been <strong>canceled</strong>:</p>
            <p><strong>Title:</strong> ${meetingData.title}</p>
            <p><strong>Description:</strong> ${meetingData.description}</p>
            <p><strong>Date:</strong> ${meetingData.date}</p>
            <p><strong>Time:</strong> ${meetingData.time}</p>
            <p><strong>Reason:</strong> ${meetingData.cancelReason || "Not specified"}</p>
            <br>
            <p>We apologize for any inconvenience.</p>
            <p><strong>Best Regards,</strong><br>SamarthMeet Team</p>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYTW7xmLbkJHN5DyB16vIfuL6UZBhpndHep6UUx36TRRG7TLjmfJjEGdqKKTup_ioMJr8&usqp=CAU"
              width="150" alt="SamarthMeet Logo" style="display: block; margin-top: 10px;"/>
          </div>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Cancellation email sent to ${user.email}`);
      } catch (error) {
        console.error(`❌ Failed to send cancellation email to ${user.email}:`, error);
      }
    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);
    console.log("📨 All cancellation emails processed.");
  } catch (error) {
    console.error("❌ Unexpected error in sendMeetingCancellationEmail:", error);
  }
};

module.exports = { sendEmailNotification, sendMeetingCancellationEmail };

