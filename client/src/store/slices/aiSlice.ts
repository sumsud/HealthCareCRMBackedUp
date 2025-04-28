import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { AIState, CreateChatSessionRequest, UpdateChatSessionRequest, DeleteChatSessionRequest, SendChatMessageRequest, AIAssistantResponse, ClinicalQueryRequest, CodeAssistanceRequest, NoteGenerationRequest } from '@shared/types';
import apiService from '@/lib/api';

const initialState: AIState = {
  chatSessions: [],
  currentSession: null,
  messages: [],
  loading: false,
  error: null
};

// Fetch chat sessions
export const fetchChatSessions = createAsyncThunk(
  'ai/fetchChatSessions',
  async (_, { rejectWithValue }) => {
    try {
      const sessions = await apiService.get('/ai/chat-sessions');
      return sessions;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch chat sessions');
    }
  }
);

// Fetch a single chat session
export const fetchChatSession = createAsyncThunk(
  'ai/fetchChatSession',
  async (id: number, { rejectWithValue }) => {
    try {
      const session = await apiService.get(`/ai/chat-sessions/${id}`);
      return session;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch chat session');
    }
  }
);

// Create a new chat session
export const createChatSession = createAsyncThunk(
  'ai/createChatSession',
  async (sessionData: CreateChatSessionRequest, { rejectWithValue }) => {
    try {
      const newSession = await apiService.post('/ai/chat-sessions', sessionData);
      return newSession;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create chat session');
    }
  }
);

// Update a chat session
export const updateChatSession = createAsyncThunk(
  'ai/updateChatSession',
  async (sessionData: UpdateChatSessionRequest, { rejectWithValue }) => {
    try {
      const updatedSession = await apiService.put(`/ai/chat-sessions/${sessionData.id}`, sessionData);
      return updatedSession;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update chat session');
    }
  }
);

// Delete a chat session
export const deleteChatSession = createAsyncThunk(
  'ai/deleteChatSession',
  async (sessionData: DeleteChatSessionRequest, { rejectWithValue }) => {
    try {
      await apiService.delete(`/ai/chat-sessions/${sessionData.id}`);
      return sessionData.id;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete chat session');
    }
  }
);

// Send a chat message
export const sendChatMessage = createAsyncThunk(
  'ai/sendChatMessage',
  async (messageData: SendChatMessageRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/ai/chat-messages', messageData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send chat message');
    }
  }
);

// Get clinical information based on query
export const clinicalQuery = createAsyncThunk(
  'ai/clinicalQuery',
  async (queryData: ClinicalQueryRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/ai/clinical-query', queryData);
      return response as AIAssistantResponse;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to process clinical query');
    }
  }
);

// Get code assistance for medical coding
export const codeAssistance = createAsyncThunk(
  'ai/codeAssistance',
  async (queryData: CodeAssistanceRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/ai/code-assistance', queryData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get code assistance');
    }
  }
);

// Generate clinical note from appointment data
export const generateNote = createAsyncThunk(
  'ai/generateNote',
  async (noteData: NoteGenerationRequest, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/ai/generate-note', noteData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate clinical note');
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearCurrentSession: (state) => {
      state.currentSession = null;
      state.messages = [];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Chat Sessions
      .addCase(fetchChatSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.chatSessions = action.payload;
      })
      .addCase(fetchChatSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Chat Session
      .addCase(fetchChatSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        state.messages = action.payload.messages || [];
      })
      .addCase(fetchChatSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Chat Session
      .addCase(createChatSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChatSession.fulfilled, (state, action) => {
        state.loading = false;
        state.chatSessions.unshift(action.payload);
        state.currentSession = action.payload;
        state.messages = [];
      })
      .addCase(createChatSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Chat Session
      .addCase(updateChatSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChatSession.fulfilled, (state, action) => {
        state.loading = false;
        
        // Update in sessions array
        const index = state.chatSessions.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.chatSessions[index] = action.payload;
        }
        
        // Update current session if it's the one being edited
        if (state.currentSession && state.currentSession.id === action.payload.id) {
          state.currentSession = action.payload;
        }
      })
      .addCase(updateChatSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Chat Session
      .addCase(deleteChatSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChatSession.fulfilled, (state, action) => {
        state.loading = false;
        
        // Remove from sessions array
        state.chatSessions = state.chatSessions.filter(s => s.id !== action.payload);
        
        // Clear current session if it's the one being deleted
        if (state.currentSession && state.currentSession.id === action.payload) {
          state.currentSession = null;
          state.messages = [];
        }
      })
      .addCase(deleteChatSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Send Chat Message
      .addCase(sendChatMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.loading = false;
        
        // Add the user message and AI response to the messages array
        state.messages.push(action.payload.userMessage);
        state.messages.push(action.payload.assistantMessage);
        
        // Update session's last message timestamp
        if (state.currentSession) {
          state.currentSession.updatedAt = new Date();
        }
        
        // Update the session in the sessions list
        if (state.currentSession) {
          const index = state.chatSessions.findIndex(s => s.id === state.currentSession?.id);
          if (index !== -1) {
            state.chatSessions[index].updatedAt = new Date();
          }
        }
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearCurrentSession, clearError } = aiSlice.actions;
export default aiSlice.reducer;
