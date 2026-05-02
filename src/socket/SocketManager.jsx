import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { connectTouristSocket } from "./socket";
import { pushToast } from "../app/store/slices/uiWalletSlice";
import { useAuth } from "../app/store/store";

export default function SocketManager() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    const socket = connectTouristSocket(user._id);
    if (!socket) return;

    const riderAssignedHandler = (data) => {
      console.log("RIDER ASSIGNED:", data);
      dispatch(
        pushToast({
          type: "success",
          title: "Rider Assigned!",
          message: data?.message || "A rider has accepted your booking.",
          duration: 10000,
        })
      );
    };

    const riderInterestedHandler = (data) => {
      console.log("RIDER INTERESTED:", data);
      dispatch(
        pushToast({
          type: "info",
          title: "New Rider Interest",
          message: data?.message || "A rider is interested in your booking.",
          duration: 8000,
        })
      );
    };

    socket.off("rider-assigned", riderAssignedHandler);
    socket.off("rider-interested", riderInterestedHandler);
    socket.off("rider-intrested", riderInterestedHandler);

    socket.on("rider-assigned", riderAssignedHandler);
    socket.on("rider-interested", riderInterestedHandler);
    socket.on("rider-intrested", riderInterestedHandler);

    return () => {
      socket.off("rider-assigned", riderAssignedHandler);
      socket.off("rider-interested", riderInterestedHandler);
      socket.off("rider-intrested", riderInterestedHandler);
    };
  }, [dispatch, isAuthenticated, user?._id]);

  return null;
}
