// ================================
// HOOKS/USESOCKET.JS - WebSocket Hook
// ================================
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import useAuth from "./useAuth";

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttempts = useRef(0);
  const { auth } = useAuth();

  useEffect(() => {
    const token = auth?.accessToken;

    if (!token) return;

    const socketInstance = io("https://api.miremacallcenter.com", {
      auth: {
        token,
      },
      transports: ["websocket"],
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
      console.log("Socket connected");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      reconnectAttempts.current++;

      if (reconnectAttempts.current > 5) {
        toast.error("Unable to connect to real-time services");
      }
    });

    // Call events
    socketInstance.on("call:incoming", (data) => {
      toast.info(`Incoming call from ${data.phoneNumber}`, {
        autoClose: false,
      });
    });

    socketInstance.on("call:updated", (data) => {
      // Handle call updates
      console.log("Call updated:", data);
    });

    socketInstance.on("queue:updated", (data) => {
      // Handle queue updates
      console.log("Queue updated:", data);
    });

    socketInstance.on("system:message", (data) => {
      toast.info(data.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const emit = (event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  return { socket, isConnected, emit };
};

export default useSocket;
