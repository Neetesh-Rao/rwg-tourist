import { createSlice } from '@reduxjs/toolkit';

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: {},
    activeChat: null,
    socketConnected: false,
    typingUsers: {},
    unreadCount: {}
  },
  reducers: {
    setActiveChat: (state, { payload }) => {
      state.activeChat = payload;
    },
    addMessage: (state, { payload }) => {
      const { bookingId, message } = payload;
      if (!state.messages[bookingId]) {
        state.messages[bookingId] = [];
      }
      state.messages[bookingId].push(message);
    },
    setMessages: (state, { payload }) => {
      const { bookingId, messages } = payload;
      state.messages[bookingId] = messages;
    },
    setSocketConnected: (state, { payload }) => {
      state.socketConnected = payload;
    },
    setTypingUser: (state, { payload }) => {
      const { bookingId, userId, isTyping } = payload;
      if (isTyping) {
        state.typingUsers[bookingId] = userId;
      } else {
        delete state.typingUsers[bookingId];
      }
    },
    incrementUnread: (state, { payload }) => {
      const { bookingId } = payload;
      state.unreadCount[bookingId] = (state.unreadCount[bookingId] || 0) + 1;
    },
    clearUnread: (state, { payload }) => {
      const { bookingId } = payload;
      state.unreadCount[bookingId] = 0;
    }
  }
});

export const {
  setActiveChat,
  addMessage,
  setMessages,
  setSocketConnected,
  setTypingUser,
  incrementUnread,
  clearUnread
} = chatSlice.actions;

export default chatSlice.reducer;
