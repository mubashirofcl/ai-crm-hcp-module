import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { updateFormData } from './interactionSlice';

export const sendMessage = createAsyncThunk(
  'agent/sendMessage',
  async ({ message, history }, { dispatch }) => {
    const response = await api.post('/agent/chat', {
      message,
      conversation_history: history,
    });
    
    const data = response.data;
    
    // If form_updates has data, immediately update the form
    if (data.form_updates && Object.keys(data.form_updates).length > 0) {
      dispatch(updateFormData(data.form_updates));
    }
    
    return data;
  }
);

const agentSlice = createSlice({
  name: 'agent',
  initialState: {
    messages: [
      {
        role: 'assistant',
        content: "👋 Hello! I'm your AI assistant. Describe your HCP interaction and I'll fill the form automatically!\n\nTry: \"I visited Dr. Sarah Johnson today at City Medical Center for 30 minutes. We discussed CardioMax. The meeting was very positive.\"",
        tools_used: [],
        timestamp: Date.now(),
      }
    ],
    loading: false,
    error: null,
    toolsUsed: [],
  },
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({
        role: 'user',
        content: action.payload,
        timestamp: Date.now(),
      });
    },
    clearChat: (state) => {
      state.messages = [{
        role: 'assistant',
        content: "👋 Hello! I'm your AI assistant. Describe your HCP interaction and I'll fill the form automatically!",
        tools_used: [],
        timestamp: Date.now(),
      }];
      state.toolsUsed = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.messages.push({
          role: 'assistant',
          content: action.payload.response,
          tools_used: action.payload.tools_used || [],
          form_updates: action.payload.form_updates || {},
          timestamp: Date.now(),
        });
        if (action.payload.tools_used?.length) {
          state.toolsUsed = [
            ...new Set([...state.toolsUsed, ...action.payload.tools_used])
          ];
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        state.messages.push({
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          tools_used: [],
          timestamp: Date.now(),
        });
      });
  },
});

export const { addUserMessage, clearChat } = agentSlice.actions;
export default agentSlice.reducer;
