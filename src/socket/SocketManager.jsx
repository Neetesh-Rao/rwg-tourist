import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { connectTouristSocket } from "./socket";
import { pushToast } from "../app/store/slices/uiSlice";
import { useAuth } from "../app/store/store";
import { playNotificationSound } from "../shared/lib/helpers";

export default function SocketManager() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user?._id) return;

    const socket = connectTouristSocket(user._id);
    if (!socket) return;

    const riderAssignedHandler = (data) => {
      console.log("RIDER ASSIGNED:", data);
      playNotificationSound();
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
      playNotificationSound();
      dispatch(
        pushToast({
          type: "info",
          title: "New Rider Interest",
          message: data?.message || "A rider is interested in your booking.",
          duration: 8000,
        })
      );
    };
    const notificationHandler = (data) => {
      console.log("NOTIFICATION RECEIVED:", data);
      playNotificationSound();
      dispatch(
        pushToast({
          type: data?.type || "info",
          title: data?.title || "Notification",
          message: data?.message || "You have a new message.",
          duration: 8000,
        })
      );
    };

    const bookingCancelledHandler = (data) => {
      console.log("BOOKING CANCELLED:", data);
      playNotificationSound();
      dispatch(
        pushToast({
          type: "error",
          title: "Booking Cancelled",
          message: data?.message || "Your booking has been cancelled.",
          duration: 10000,
        })
      );
    };

    socket.off("rider-assigned", riderAssignedHandler);
    socket.off("rider-interested", riderInterestedHandler);
    socket.off("rider-intrested", riderInterestedHandler);
    socket.off("notification", notificationHandler);
    socket.off("booking-cancelled", bookingCancelledHandler);

    socket.on("rider-assigned", riderAssignedHandler);
    socket.on("rider-interested", riderInterestedHandler);
    socket.on("rider-intrested", riderInterestedHandler);

    socket.on("ride-completed", (data) => {
      console.log("RIDE COMPLETED SOCKET:", data);
      // Reload bookings to trigger rating modal on Dashboard
      dispatch(loadMyBookings());
      dispatch(pushToast({
        type: 'success',
        title: 'Tour Completed!',
        message: 'Hope you enjoyed your journey. Please rate your guide!'
      }));
    });
    socket.on("notification", notificationHandler);
    socket.on("booking-cancelled", bookingCancelledHandler);

    // AUDIO UNLOCKER
    const unlockAudio = () => {
      console.log("🔊 Tourist Audio unlocked");
      const audio = new Audio('/Notification.mp3');
      audio.volume = 0;
      audio.play().catch(() => {});
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    return () => {
      socket.off("rider-assigned", riderAssignedHandler);
      socket.off("rider-interested", riderInterestedHandler);
      socket.off("rider-intrested", riderInterestedHandler);
      socket.off("notification", notificationHandler);
      socket.off("booking-cancelled", bookingCancelledHandler);
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, [dispatch, isAuthenticated, user?._id]);

  return null;
}
