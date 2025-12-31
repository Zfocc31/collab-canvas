// server/socket/socketHandlers.js

const roomUsers = {};            // roomId -> Set(socketId)
const roomCanvasState = {};      // roomId -> Array of draw events

export const socketHandlers = (io) => {
  io.on("connection", (socket) => {
    console.log(" New connection:", socket.id);

    // ======================
    // JOIN ROOM
    // ======================
    socket.on("join-room", (roomId) => {
      if (!roomId) return;

      if (socket.roomId === roomId) {
        console.log(` Socket ${socket.id} already in room ${roomId}`);
        return;
      }

      socket.roomId = roomId;
      socket.join(roomId);

      if (!roomUsers[roomId]) {
        roomUsers[roomId] = new Set();
      }
      roomUsers[roomId].add(socket.id);

      const count = roomUsers[roomId].size;
      io.to(roomId).emit("user-count", count);

      console.log(` User ${socket.id} joined room ${roomId}`);
      console.log(` Room ${roomId} size:`, count);

      // 🔥 SEND EXISTING CANVAS TO LATE JOINER
      if (roomCanvasState[roomId]?.length) {
        socket.emit("load-canvas", roomCanvasState[roomId]);
      }
    });

    // ======================
    // DRAW EVENTS
    // ======================
    socket.on("draw-start", (data) => {
      const { roomId } = data;
      if (!roomId) return;

      if (!roomCanvasState[roomId]) {
        roomCanvasState[roomId] = [];
      }

      roomCanvasState[roomId].push({
        type: "draw-start",
        payload: data,
      });

      socket.to(roomId).emit("draw-start", data);
    });

    socket.on("draw-move", (data) => {
      const { roomId } = data;
      if (!roomId) return;

      if (!roomCanvasState[roomId]) {
        roomCanvasState[roomId] = [];
      }

      roomCanvasState[roomId].push({
        type: "draw-move",
        payload: data,
      });

      socket.to(roomId).emit("draw-move", data);
    });

    socket.on("draw-end", (data) => {
      const { roomId } = data;
      if (!roomId) return;

      if (!roomCanvasState[roomId]) {
        roomCanvasState[roomId] = [];
      }

      roomCanvasState[roomId].push({
        type: "draw-end",
        payload: data,
      });

      socket.to(roomId).emit("draw-end", data);
    });

    // ======================
    // CLEAR CANVAS
    // ======================
    socket.on("clear-canvas", ({ roomId }) => {
      if (!roomId) return;

      roomCanvasState[roomId] = [];
      io.to(roomId).emit("clear-canvas");
    });

    // ======================
    // CURSOR SYNC
    // ======================
    socket.on("cursor-move", (data) => {
      socket.to(data.roomId).emit("cursor-update", data);
    });

    // ======================
    // DISCONNECT
    // ======================
    socket.on("disconnect", () => {
      const { roomId } = socket;

      if (roomId && roomUsers[roomId]) {
        roomUsers[roomId].delete(socket.id);

        if (roomUsers[roomId].size === 0) {
          delete roomUsers[roomId];
          delete roomCanvasState[roomId]; // optional cleanup
        }

        const count = roomUsers[roomId]?.size || 0;
        io.to(roomId).emit("user-count", count);
      }

      console.log(" Disconnected:", socket.id);
    });
  });
};
