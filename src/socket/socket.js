import { io } from "socket.io-client";

let socket = null;
let registeredTouristId = null;
let isConnectHandlerBound = false;

const BASE_URL =
  import.meta.env.VITE_BACKEND_URL?.replace("/api", "") ||
  "http://localhost:9999";

export const connectTouristSocket = (userId) => {
  if (!userId) return null;

  if (!socket) {
    socket = io(BASE_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });
  }

  registeredTouristId = userId;

  if (!isConnectHandlerBound) {
    socket.on("connect", () => {
      console.log("TOURIST SOCKET CONNECTED:", socket.id);
      if (!registeredTouristId) return;
      socket.emit("register", {
        userId: registeredTouristId,
        role: "tourist",
      });
    });
    isConnectHandlerBound = true;
  }

  if (socket.connected) {
    socket.emit("register", {
      userId: registeredTouristId,
      role: "tourist",
    });
  }

  return socket;
};

export const getTouristSocket = () => socket;
