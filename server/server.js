import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connect from "./src/db/connect.js";
import cookieParser from "cookie-parser";
import fs from "node:fs";
import errorHandler from "./src/helpers/errorhandler.js";
import { Server } from "socket.io";
import { createServer } from "node:http";
import User from "./src/models/auth/userModel.js";

dotenv.config();

const port = process.env.PORT || 5000;

const app = express();
const httpServer = new createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});


// middleware
app.use(cookieParser()); 
app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// error handler middleware
app.use(errorHandler);

// socket io logik
let users = [];

const addUser = (userId, socketId) => {
  return (
    !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId })
  );
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

const removeUser = async (socketId) => {
  const user = users.find((user) => user.socketId === socketId);

  if (user) {
    // update user lastSeen and set online to false
    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      { lastSeen: new Date(), online: false },
      { new: true }
    );

    users = users.filter((user) => user.socketId !== socketId);

    // emit updated user to client
    io.emit("user offline", updatedUser);
  }
};

io.on("connection", (socket) => {
  console.log("Ein User hat sich verbunden", socket.id);

  socket.on("add user", async (userId) => {
    addUser(userId, socket.id);

    // Update user status to online
    await User.findByIdAndUpdate(userId, { online: true });

    // Emit all the users to the client
    io.emit("get users", users);
  });

  socket.on("disconnect", async () => {
    console.log("Ein Benutzer hat sich getrennt", socket.id);
    await removeUser(socket.id);
    io.emit("get users", users);
  });

  // send and get message
  socket.on("send message", ({ senderId, receiverId, text }) => {
    console.log("senderId", senderId);
    const user = getUser(receiverId);

    if (user) {
      io.to(user.socketId).emit("get message", {
        senderId,
        text,
      });
    } else {
      console.log("User not found");
    }
  });
});

// routes
const routeFiles = fs.readdirSync('./src/routes');

routeFiles.forEach(file => {
  import(`./src/routes/${file}`)
    .then(route => {
      app.use('/api/v1', route.default);
    })
    .catch((err) => {
      console.log('Failed to load route file', err);
    });
});

const server = async () => {
  try {
    await connect();

    httpServer.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  } catch (error) {
    console.log('Failed to start server...', error.message);
    process.exit(1);
  }
};

server();