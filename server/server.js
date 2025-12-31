import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import ConnectionDB from "./db/db.js";
import mainRoute from "./routes/main.routes.js";
import { socketHandlers } from "./socket/socketHandlers.js";

dotenv.config();          // 
ConnectionDB();           // env is loaded

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1", mainRoute);

app.get("/", (req, res) => {
  res.json({ message: "server is ready" });
});

// Socket
socketHandlers(io);

// Start server
const PORT = process.env.PORT || 8000;   //fallback
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
