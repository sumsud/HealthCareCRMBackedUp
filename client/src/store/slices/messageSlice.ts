import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { MessageState, CreateMessageRequest, ReplyMessageRequest, MarkMessageAsReadRequest, ArchiveMessageRequest, FilterMessagesRequest } from '@shared/types';
import apiService from '@/lib/api';

const initialState: MessageState = {
  messages: [],
  currentThread: [],
  unreadCount: 0,
  loading: false,
  error: null,
  totalMessages: 0,
  page: 1,
  limit: 10
};

// Fetch messages with pagination and filters
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (filters: FilterMessagesRequest = {}, { rejectWithValue }) => {
    try {
      const response = await apiService.getPaginated('/messages', filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch messages');
    }
  }
);

// Fetch unread count
export const fetchUnreadCount = createAsyncThunk(
  'messages/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const count = await apiService.get('/messages/unread-count');
      return count;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch unread count');
    }
  }
);

// Fetch thread by ID
export const fetchThread = createAsyncThunk(
  'messages/fetchThread',
  async (threadId: string, { rejectWithValue }) => {
    try {
      const messages = await apiService.get(`/messages/thread/${threadId}`);
      return messages;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch message thread');
    }
  }
);

// Create a new message
export const createMessage = createAsyncThunk(
  'messages/createMessage',
  async (messageData: CreateMessageRequest, { rejectWithValue }) => {
    try {
      const newMessage = await apiService.post('/messages', messageData);
      return newMessage;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create message');
    }
  }
);

// Reply to a message
export const replyToMessage = createAsyncThunk(
  'messages/replyToMessage',
  async (replyData: ReplyMessageRequest, { rejectWithValue }) => {
    try {
      const reply = await apiService.post(`/messages/reply`, replyData);
      return reply;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to reply to message');
    }
  }
);

// Mark message as read
export const markMessageAsRead = createAsyncThunk(
  'messages/markMessageAsRead',
  async (data: MarkMessageAsReadRequest, { rejectWithValue }) => {
    try {
      const updatedMessage = await apiService.post(`/messages/${data.id}/read`, {});
      return updatedMessage;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark message as read');
    }
  }
);

// Archive message
export const archiveMessage = createAsyncThunk(
  'messages/archiveMessage',
  async (data: ArchiveMessageRequest, { rejectWithValue }) => {
    try {
      const archivedMessage = await apiService.post(`/messages/${data.id}/archive`, {});
      return archivedMessage;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to archive message');
    }
  }
);

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    clearCurrentThread: (state) => {
      state.currentThread = [];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.items;
        state.totalMessages = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Unread Count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      // Fetch Thread
      .addCase(fetchThread.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThread.fulfilled, (state, action) => {
        state.loading = false;
        state.currentThread = action.payload;
      })
      .addCase(fetchThread.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Message
      .addCase(createMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMessage.fulfilled, (state, action) => {
        state.loading = false;
        // Add to messages if in inbox view
        state.messages.unshift(action.payload);
        
        // Add to current thread if relevant
        if (action.payload.threadId && 
            (state.currentThread.length === 0 || 
             state.currentThread[0].threadId === action.payload.threadId)) {
          state.currentThread.push(action.payload);
        }
      })
      .addCase(createMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reply to Message
      .addCase(replyToMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(replyToMessage.fulfilled, (state, action) => {
        state.loading = false;
        
        // Add to current thread if relevant
        if (action.payload.threadId && 
            (state.currentThread.length > 0 && 
             state.currentThread[0].threadId === action.payload.threadId)) {
          state.currentThread.push(action.payload);
        }
        
        // Update messages list if it contains this thread
        const threadIndex = state.messages.findIndex(
          m => m.threadId === action.payload.threadId
        );
        
        if (threadIndex !== -1) {
          // Update the latest message in the thread
          state.messages[threadIndex] = {
            ...state.messages[threadIndex],
            content: action.payload.content,
            createdAt: action.payload.createdAt,
            isRead: false
          };
        }
      })
      .addCase(replyToMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Mark as Read
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        // Update in messages array
        const index = state.messages.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.messages[index] = action.payload;
        }
        
        // Update in current thread if present
        const threadIndex = state.currentThread.findIndex(m => m.id === action.payload.id);
        if (threadIndex !== -1) {
          state.currentThread[threadIndex] = action.payload;
        }
        
        // Decrement unread count if the message was unread before
        if (!action.payload.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Archive Message
      .addCase(archiveMessage.fulfilled, (state, action) => {
        // Remove from messages array
        state.messages = state.messages.filter(m => m.id !== action.payload.id);
        
        // If it was unread, decrement count
        if (!action.payload.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
  }
});

export const { clearCurrentThread, clearError } = messageSlice.actions;
export default messageSlice.reducer;
