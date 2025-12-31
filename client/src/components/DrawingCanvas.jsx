import React, { useEffect, useRef, useState } from "react";

const DrawingCanvas = ({ socket, roomId, color, strokeWidth, tool }) => {
  const canvasRef = useRef();
  const ctxRef = useRef();

  const [drawing, setDrawing] = useState(false);

  const colorRef = useRef(color);
  const widthRef = useRef(strokeWidth);

  // 🔥 Prevent orphan strokes (fix random dots)
  const hasMovedRef = useRef(false);

  // Keep latest color & width
  useEffect(() => {
    colorRef.current = color;
    widthRef.current = strokeWidth;
  }, [color, strokeWidth]);

  // ======================
  // CANVAS SETUP
  // ======================
  useEffect(() => {
    const canvas = canvasRef.current;

    const resizeCanvas = () => {
      const { width, height } = canvas.parentElement.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // ======================
  // LOCAL DRAWING
  // ======================
  const startDrawing = ({ nativeEvent }) => {
    if (!socket?.connected) return;

    const { offsetX, offsetY } = nativeEvent;
    const ctx = ctxRef.current;

    hasMovedRef.current = false;

    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    ctx.strokeStyle = tool === "eraser" ? "#fff" : colorRef.current;
    ctx.lineWidth = widthRef.current;

    setDrawing(true);

    socket.emit("draw-start", {
      roomId,
      offsetX,
      offsetY,
      color: ctx.strokeStyle,
      strokeWidth: widthRef.current,
    });
  };

  const draw = ({ nativeEvent }) => {
    if (!drawing || !socket?.connected) return;

    const { offsetX, offsetY } = nativeEvent;
    const ctx = ctxRef.current;

    hasMovedRef.current = true;

    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();

    socket.emit("draw-move", {
      roomId,
      offsetX,
      offsetY,
    });
  };

  const endDrawing = () => {
    if (!drawing || !socket?.connected) return;

    ctxRef.current.closePath();
    setDrawing(false);

    socket.emit("draw-end", { roomId });
  };

  // ======================
  // SOCKET EVENTS (REMOTE + REPLAY)
  // ======================
  useEffect(() => {
    if (!socket || !roomId) return;

    const ctx = ctxRef.current;

    const handleDrawStart = ({ offsetX, offsetY, color, strokeWidth }) => {
      hasMovedRef.current = false;

      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth;
    };

    const handleDrawMove = ({ offsetX, offsetY }) => {
      hasMovedRef.current = true;

      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
    };

    const handleDrawEnd = () => {
      // ❌ Ignore orphan strokes (prevents random dots)
      if (!hasMovedRef.current) {
        ctx.closePath();
        return;
      }

      ctx.closePath();
    };

    const handleClearCanvas = () => {
      const canvas = canvasRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    // 🔥 REPLAY STORED CANVAS FOR LATE JOINERS
    const handleLoadCanvas = (events) => {
      events.forEach(({ type, payload }) => {
        if (type === "draw-start") handleDrawStart(payload);
        if (type === "draw-move") handleDrawMove(payload);
        if (type === "draw-end") handleDrawEnd();
      });
    };

    socket.on("draw-start", handleDrawStart);
    socket.on("draw-move", handleDrawMove);
    socket.on("draw-end", handleDrawEnd);
    socket.on("clear-canvas", handleClearCanvas);
    socket.on("load-canvas", handleLoadCanvas);

    return () => {
      socket.off("draw-start", handleDrawStart);
      socket.off("draw-move", handleDrawMove);
      socket.off("draw-end", handleDrawEnd);
      socket.off("clear-canvas", handleClearCanvas);
      socket.off("load-canvas", handleLoadCanvas);
    };
  }, [socket, roomId]);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={endDrawing}
      onMouseLeave={endDrawing}
      className="absolute inset-0 z-0"
    />
  );
};

export default DrawingCanvas;
