const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { RtcTokenBuilder, RtcRole } = require("agora-token");
require('dotenv').config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require('cors');
const mongooseSequence = require('mongoose-sequence')(mongoose); 
const app = express();
const server = http.createServer(app);
const { sendEmailNotification,sendMeetingCancellationEmail } = require("./utils/emailService");
const { type } = require("os");

// Configure CORS middleware with specific options
app.use(cors({
  origin: ["http://localhost:5173"], // Add your frontend domains
  methods: ["GET", "POST", "PATCH", "PUT"],

}));

app.use(express.json());



const users = {};


const APP_ID = process.env.APP_ID_AGORA; // Replace with your Agora App ID
const APP_CERTIFICATE = process.env.APP_CERTIFICATE_AGORA; // Found in Agora Console


const meetingSchema = new mongoose.Schema({
meetingSrNo: { type: String, unique: true },
title: { type: String},
description: { type: String },
date: { type: Date, },
timeFrom: { type: String, required:true },
timeTo: { type: String, },
meetingId: { type: String, unique: true },
meetingLink: { type: String },
meetingType: { type: String},
requiredItems: { type: String},
status:{type:String},
location:{type:String},
cancelReason: {
  type: String,
  default: null // ✅ New field to store the reason for cancellation
},
isCompulsory:{type:Boolean},
invitedUsers: [{
    userId: { type: String },
    name: { type: String, required: true },
    email: { type: String },
    status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    reasonForRejection: { type: String },
}],
host: { type: String, required: true },
});
  
  const Meeting = mongoose.model("Meeting", meetingSchema);
  
  
const userSchema = new mongoose.Schema({
  UserId: { type: Number, unique: true },
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  fcmToken: String,
  dob: { type: Date, required: true },
  location: {
      country: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
  },
  role: { type: String, required: true },
  password: { type: Number, unique: true },
  });
  

userSchema.plugin(mongooseSequence, { inc_field: 'UserId', start_seq: 1111 });
userSchema.plugin(mongooseSequence, { inc_field: 'password', start_seq: 1111 });
const User= mongoose.model("User", userSchema);

// Admin-Only Route (Create Meeting)

mongoose.connect("mongodb+srv://adityakatare:aditya8975@cluster0.tbwxq.mongodb.net/new?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));
    

app.get("/create-meeting", (req, res) => {
const channelName = `SAMARTH-${Date.now()}`;
res.json({ channelName });
console.log(channelName);

});



app.get("/token", (req, res) => {
const channelName = req.query.channel;
const uid = Math.floor(Math.random() * 10000);
const role = RtcRole.PUBLISHER;
const expirationTime = 3600; // 1 hour
const currentTime = Math.floor(Date.now() / 1000);
const privilegeExpireTime = currentTime + expirationTime;

const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpireTime
);

res.json({ uid, token,channelName });
});

app.post('/api/meetings/store', async (req, res) => {
  try {
      const {
       meetingSrNo, title, description, date,timeFrom,
       timeTo, meetingId, meetingLink, meetingType,status,location,
       requiredItems,isCompulsory, invitedUsers, host,
      } = req.body;

      // const meetingDateTime = new Date(`${date} ${time}`);
      const conflictingUsers = [];
      for (const user of invitedUsers) {
          const existingMeeting = await Meeting.findOne({
              "invitedUsers.userId": user.userId,
              date,
              timeFrom, 
              timeTo,// Check same time
              "invitedUsers.status": { $ne: "Rejected" } // Ignore rejected meetings
          });

          if (existingMeeting) {
              conflictingUsers.push(user.name);
          }
      }
      if (conflictingUsers.length > 0) {
        return res.status(400).json({
            message: `Meeting not created. These users are already in another meeting: ${conflictingUsers.join(", ")}`,
        });
    }


      const newMeeting = new Meeting({
       meetingSrNo,
       title,
       description,
       date,
       timeFrom,
       timeTo,
       meetingId,
       meetingLink,
       meetingType,
       status,
       requiredItems,
       location,
       isCompulsory,
       invitedUsers :invitedUsers.map(user => ({
        userId: user.userId,
        name: user.name,
        email: user.email,
        status: "Pending"
    })),
       host,
      });
      //

      const savedMeeting = await newMeeting.save();
      
      io.emit("newMeeting", newMeeting);

    console.log("🚀 Emitting newMeeting event:", savedMeeting);
   

      res.status(201).json({ message: "Meeting created successfully", meeting: savedMeeting });
      sendEmailNotification(invitedUsers, {
        title,
        description,
        date,
        timeFrom,
        timeTo,
        meetingType,
        meetingLink,
      
      });
      
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error creating meeting", error: err.message });
  }
  });

  app.get('/api/meetings/data', async (req, res) => {
    const { userId } = req.query;
    
    if (!userId) {
         return res.status(400).json({ message: "UserId is required" });
    }
    
    try {
         const meetings = await Meeting.find({
             'invitedUsers.userId': userId
         });
    
         if (meetings.length === 0) {
             return res.status(200).json([]);
         }
    
         res.status(200).json(meetings);
    } catch (err) {
         console.error(err);
         res.status(500).json({ message: "Error fetching meetings", error: err.message });
    }
    });
    

    app.put("/api/meetings/cancel/:id", async (req, res) => {
      try {
        const meetingId = req.params.id;
        const { cancelReason } = req.body; // Get reason from frontend
        if (!cancelReason) {
          return res.status(400).json({ message: "Cancellation reason is required." });
        }
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
          return res.status(404).json({ message: "Meeting not found" });
      }
      const invitedEmails = meeting.invitedUsers;
      
      
        const updatedMeeting = await Meeting.findByIdAndUpdate(
          meetingId,
          { status: "Canceled",cancelReason },
          { new: true } // Ensures it returns updated data
        );
    
        if (!updatedMeeting) {
          return res.status(404).json({ message: "Meeting not found" });
        }
    
        res.json(updatedMeeting); // Send updated meeting back to frontend
        await sendMeetingCancellationEmail(invitedEmails,updatedMeeting);
      } catch (error) {
        console.error("Error canceling meeting:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    });
    
    
    app.get('/api/users/data', async (req, res) => {
      try {
       const users = await User.find(); // Fetch all users
       res.status(200).json(users);
      } catch (err) {
       console.error(err);
       res.status(500).json({ message: "Error fetching users", error: err.message });
      }
  });
  app.get('/api/meetings/data', async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
       return res.status(400).json({ message: "UserId is required" });
  }
  
  try {
       const meetings = await Meeting.find({
           'invitedUsers.userId': userId
       });
  
       if (meetings.length === 0) {
           return res.status(200).json([]);
       }
  
       res.status(200).json(meetings);
  } catch (err) {
       console.error(err);
       res.status(500).json({ message: "Error fetching meetings", error: err.message });
  }
  });

//new updateed


 

 
  
  app.get("/users",async (req, res) => {
    try {
      const users = await User.find().select("-password"); // Exclude passwords
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ msg: "Error fetching users" });
    }
  });

app.get("/host/:hostId", async (req, res) => {
    try {
      const { hostId } = req.params; // Extract hostId from request params
      const meetings = await Meeting.find({ host: hostId });
  
      if (!meetings.length) {
        return res.status(404).json({ message: "No meetings found for this host." });
      }
  
      res.json(meetings);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      res.status(500).json({ message: "Server error. Please try again." });
    }
  });


app.get("/meeting-details/:meetingId", async (req, res) => {
    try {
      const { meetingId } = req.params;
      const meeting = await Meeting.findOne({ meetingId });
  
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
  
      res.json(meeting);
    } catch (error) {
      console.error("Error fetching meeting:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.patch("/update-response", async (req, res) => {
    const { meetingId, userId, status, reasonForRejection } = req.body;
  
    try {
      const meeting = await Meeting.findOne({ meetingId });
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
  
      const userIndex = meeting.invitedUsers.findIndex(user => user.userId === userId);
      if (userIndex === -1) {
        return res.status(404).json({ message: "User not found in meeting" });
      }
  
      // Update user status
      meeting.invitedUsers[userIndex].status = status;
      if (status === "Rejected") {
        meeting.invitedUsers[userIndex].reasonForRejection = reasonForRejection;
      }
  
      await meeting.save(); // ✅ Save the update to the database
  
      res.status(200).json({ message: "Response updated successfully" });
    } catch (error) {
      console.error("Error updating response:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  
app.listen(5000, () => console.log(`Server running on port 5000`));
