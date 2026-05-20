import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, Loader2, X } from "lucide-react";
import { getTouristSocket, connectTouristSocket } from "@/socket/socket";
import {
  useUser,
  useAppDispatch,
  useChatMessages,
  useSocketConnected
} from "@/app/store/store";
import {
  addMessage,
  setMessages,
  setSocketConnected,
  setTypingUser
} from "@/app/store/slices/chatSlice";
import { useGetBookingByIdQuery } from "@/app/store/slices/bookingApi";
import { useGetMessagesQuery, useCreateConversationMutation } from "@/app/store/slices/chatApi";
import Modal from "@/shared/ui/Modal/Modal";
import Button from "@/shared/ui/Button/Button";
import Input from "@/shared/ui/Input/Input";
import { Spinner } from "@/shared/ui/Loader/Loader";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";

export default function ChatPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useUser();

  const [text, setText] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [recipientInfo, setRecipientInfo] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const messages = useChatMessages(conversationId);
  const socketConnected = useSocketConnected();

  // API Hooks
  const { data: bookingData } = useGetBookingByIdQuery(bookingId);
  const booking = bookingData?.data;
  const [createConv] = useCreateConversationMutation();
  const { data: messagesData, isLoading: loadingMessages } = useGetMessagesQuery(conversationId, {
    skip: !conversationId
  });

  // Socket connection
  useEffect(() => {
    if (!currentUser?.id) return;

    connectTouristSocket(currentUser.id);
    const socket = getTouristSocket();

    if (socket) {
      if (socket.connected) {
        dispatch(setSocketConnected(true));
      }

      socket.on("connect", () => {
        dispatch(setSocketConnected(true));
      });

      socket.on("disconnect", () => {
        dispatch(setSocketConnected(false));
      });

      socket.on("receive-message", (msg) => {
        if (conversationId) {
          dispatch(addMessage({ bookingId: conversationId, message: msg }));
        }
      });

      socket.on("user-typing", ({ userId, isTyping }) => {
        if (userId !== currentUser.id && conversationId) {
          dispatch(setTypingUser({ bookingId: conversationId, userId, isTyping }));
        }
      });

      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("receive-message");
        socket.off("user-typing");
      };
    }
  }, [currentUser?.id, conversationId, dispatch]);

  // Load or create conversation
  useEffect(() => {
    if (!bookingId || !currentUser || !booking) return;

    const initConversation = async () => {
      try {
        setError(null);
        
        const riderId = booking?.riderId?._id || booking?.riderId || booking?.rider?._id || booking?.rider;
        if (!riderId) {
          setError("No guide is assigned to this tour yet.");
          return;
        }

        setRecipientInfo({
          name: booking?.riderId?.name || booking?.rider?.name || "Your Guide"
        });

        console.log("Creating conversation with:", {
          bookingId,
          touristId: currentUser.id,
          riderId
        });

        const result = await createConv({
          bookingId,
          touristId: currentUser.id,
          riderId
        }).unwrap();

        console.log("Conversation created:", result);
        setConversationId(result.data._id || result._id);
      } catch (err) {
        console.error("Failed to create conversation:", err);
        setError(err?.data?.message || "Failed to load chat");
      }
    };

    initConversation();
  }, [bookingId, currentUser, booking, createConv]);

  // Load messages from API
  useEffect(() => {
    if (messagesData?.data && conversationId) {
      dispatch(setMessages({ bookingId: conversationId, messages: messagesData.data }));
    }
  }, [messagesData, conversationId, dispatch]);

  // Join chat room
  useEffect(() => {
    const socket = getTouristSocket();
    if (socket && bookingId && socketConnected) {
      socket.emit("join-chat", { bookingId });
    }
  }, [bookingId, socketConnected]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!text.trim() || !currentUser || !conversationId) return;

    try {
      const messageData = {
        bookingId,
        senderId: currentUser.id,
        senderRole: "tourist",
        message: text.trim()
      };

      // Send via socket (backend handles saving to DB)
      const socket = getTouristSocket();
      if (socket) {
        socket.emit("send-message", messageData);
      }

      setText("");
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleTyping = () => {
    const socket = getTouristSocket();
    if (socket && conversationId) {
      socket.emit("typing", { conversationId, userId: currentUser?.id, isTyping: true });
      setTimeout(() => {
        socket.emit("typing", { conversationId, userId: currentUser?.id, isTyping: false });
      }, 2000);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };
  if (!currentUser) {
    return (
      <Modal open={true} onClose={handleClose} size="lg">
        <div className="p-6">
          <EmptyState
            icon="🔐"
            title="Not Authenticated"
            description="Please log in to access chat"
          />
        </div>
      </Modal>
    );
  }

  if (!bookingId) {
    return (
      <Modal open={true} onClose={handleClose} size="lg">
        <div className="p-6">
          <EmptyState
            icon="💬"
            title="No Chat Selected"
            description="Select a booking to start chatting"
          />
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal open={true} onClose={handleClose} size="lg">
        <div className="p-6">
          <EmptyState
            icon="❌"
            title="Error Loading Chat"
            description={error}
          />
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-xs text-red-600 dark:text-red-400">
              <strong>Debug Info:</strong> {error}
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={true} onClose={handleClose} size="lg">
      <div className="flex flex-col h-[70vh] bg-[var(--bg)]">
        {/* Chat Header */}
        <div className="sticky top-0 z-10 bg-[var(--bg)] border-b border-[var(--border)] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
              {recipientInfo?.name?.[0] || "?"}
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text)]">
                {recipientInfo?.name || "Chat"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {socketConnected ? "🟢 Active" : "🔌 Connecting..."}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[var(--surface)] rounded-lg transition"
          >
            <X className="w-5 h-5 text-[var(--text)]" />
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
          {loadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Spinner size="lg" />
            </div>
          ) : messages && messages.length > 0 ? (
            messages.map((msg, idx) => (
              <div
                key={msg._id || idx}
                className={`flex ${msg.senderId === currentUser.id ? "justify-end" : "justify-start"
                  }`}
              >
                <div
                  className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm break-words shadow-sm ${msg.senderId === currentUser.id
                    ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-br-none"
                    : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-100 dark:border-zinc-700 rounded-bl-none"
                    }`}
                >
                  <p>{msg.message}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                      : ""}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <EmptyState
                icon="💬"
                title="No messages yet"
                description="Start the conversation"
              />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 bg-[var(--bg)] border-t border-[var(--border)] p-4">
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                handleTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              className="flex-1"
              disabled={!socketConnected}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!text.trim() || !socketConnected}
              className="px-4"
            >
              {!socketConnected ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          {!socketConnected && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
              ⚠️ Connection lost. Attempting to reconnect...
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}